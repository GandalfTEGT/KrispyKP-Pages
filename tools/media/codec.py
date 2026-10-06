"""Fixed private still-image decoder. No paths, network or source code supplied by requests."""
import base64
import hashlib
import io
import json
import pathlib
import struct
import sys
import warnings
import zlib
import os

# -I -S avoids ambient Python paths and .pth execution. Use this interpreter's fixed installed package tree.
package_root = pathlib.Path(sys.executable).resolve().parent / 'Lib' / 'site-packages'
sys.path.insert(0, str(package_root))
import PIL
from PIL import Image, ImageFile, ImageOps, PngImagePlugin, features

Image.MAX_IMAGE_PIXELS = 16_000_000
ImageFile.LOAD_TRUNCATED_IMAGES = False
PngImagePlugin.MAX_TEXT_CHUNK = 65_536
PngImagePlugin.MAX_TEXT_MEMORY = 262_144
warnings.simplefilter('error', Image.DecompressionBombWarning)

def dependency():
    paths = []
    runtime = pathlib.Path(sys.executable).resolve().parent
    for p in runtime.iterdir():
        if p.is_file() and p.suffix.lower() in ('.exe', '.dll', '.zip', '.pyd'):
            paths.append(('runtime/' + p.name, p))
    for directory in (runtime / 'Lib', runtime / 'DLLs'):
        if directory.exists():
            for base, directories, names in os.walk(directory):
                directories[:] = sorted(d for d in directories if d != 'site-packages')
                for name in names:
                    p = pathlib.Path(base) / name
                    if p.suffix.lower() in ('.py', '.pyc', '.pyd', '.dll', '.zip'):
                        paths.append(('runtime/' + p.relative_to(runtime).as_posix(), p))
    for directory in (pathlib.Path(PIL.__file__).resolve().parent, package_root / 'pillow.libs'):
        if directory.exists():
            for p in directory.rglob('*'):
                if p.is_file() and p.suffix.lower() in ('.py', '.pyc', '.pyd', '.dll'):
                    paths.append((directory.name + '/' + p.relative_to(directory).as_posix(), p))
    files = [{'path': name, 'sha256': hashlib.sha256(p.read_bytes()).hexdigest().upper()} for name, p in sorted(paths)]
    digest = hashlib.sha256(json.dumps(files, separators=(',', ':'), ensure_ascii=True).encode()).hexdigest().upper()
    return {'schemaVersion': 1, 'python': sys.version.split()[0], 'pillow': PIL.__version__, 'dependencySha256': digest,
            'features': {'jpeg': features.check('jpg'), 'webp': features.check('webp')}, 'files': files}

def clean_container(data, fmt):
    if fmt == 'PNG':
        offset = 8
        while offset + 12 <= len(data):
            size = struct.unpack('>I', data[offset:offset + 4])[0]
            kind = data[offset + 4:offset + 8]
            if kind not in (b'IHDR', b'IDAT', b'IEND') or offset + size + 12 > len(data):
                return False
            offset += size + 12
            if kind == b'IEND':
                return size == 0 and offset == len(data)
        return False
    if fmt == 'WEBP':
        if len(data) < 12 or data[:4] != b'RIFF' or data[8:12] != b'WEBP' or struct.unpack('<I', data[4:8])[0] + 8 != len(data):
            return False
        offset = 12
        while offset + 8 <= len(data):
            size = struct.unpack('<I', data[offset + 4:offset + 8])[0]
            if data[offset:offset + 4] not in (b'VP8 ', b'VP8L', b'VP8X', b'ALPH'):
                return False
            offset += 8 + size + size % 2
        return offset == len(data)
    # Sanitized JPEG output has no private APP/comment segments or trailing bytes.
    if not data.startswith(b'\xff\xd8') or not data.endswith(b'\xff\xd9'):
        return False
    offset = 2
    while offset + 4 <= len(data):
        if data[offset] != 255:
            return False
        marker = data[offset + 1]
        length = struct.unpack('>H', data[offset + 2:offset + 4])[0]
        if length < 2 or offset + length + 2 > len(data):
            return False
        payload = data[offset + 4:offset + length + 2]
        if marker == 0xE0 and (length != 16 or not payload.startswith(b'JFIF\x00') or payload[-2:] != b'\x00\x00'):
            return False
        if marker == 0xFE or 0xE1 <= marker <= 0xEF:
            return False
        if marker == 0xDA:
            # Pillow fully decodes entropy data; exact final EOI excludes appended payload.
            return True
        if marker not in (0xE0, 0xDB, 0xC0, 0xC2, 0xC4, 0xDD):
            return False
        offset += length + 2
    return False

def process(request):
    if set(request) != {'mode', 'mime', 'base64'} or request['mode'] not in ('admit', 'inspect'):
        raise ValueError('Unsupported fixed decoder request')
    mime = request['mime']
    formats = {'image/png': ('PNG', 'png'), 'image/jpeg': ('JPEG', 'jpg'), 'image/webp': ('WEBP', 'webp')}
    if mime not in formats or not isinstance(request['base64'], str) or len(request['base64']) > 11_184_812:
        raise ValueError('Unsupported or oversized image')
    data = base64.b64decode(request['base64'], validate=True)
    if not data or len(data) > 8_388_608:
        raise ValueError('Encoded image exceeds bounds')
    fmt, extension = formats[mime]
    if fmt == 'PNG':
        if data[:8] != b'\x89PNG\r\n\x1a\n':
            raise ValueError('PNG signature disagrees')
        offset = 8
        ended = False
        while offset + 12 <= len(data):
            size = struct.unpack('>I', data[offset:offset + 4])[0]
            stop = offset + size + 12
            if stop > len(data) or zlib.crc32(data[offset + 4:stop - 4]) & 0xffffffff != struct.unpack('>I', data[stop - 4:stop])[0]:
                raise ValueError('PNG chunk truncation or checksum failure')
            kind = data[offset + 4:offset + 8]
            offset = stop
            if kind == b'IEND':
                ended = size == 0 and offset == len(data)
                break
        if not ended:
            raise ValueError('PNG end marker missing or trailing bytes present')
    elif fmt == 'WEBP':
        if len(data) < 12 or data[:4] != b'RIFF' or data[8:12] != b'WEBP' or struct.unpack('<I',data[4:8])[0] + 8 != len(data):
            raise ValueError('WebP container length/signature disagrees')
    elif not data.startswith(b'\xff\xd8') or not data.endswith(b'\xff\xd9'):
        raise ValueError('JPEG end marker or signature missing')
    with Image.open(io.BytesIO(data), formats=['PNG', 'JPEG', 'WEBP']) as image:
        if image.format != fmt or getattr(image, 'n_frames', 1) != 1 or getattr(image, 'is_animated', False):
            raise ValueError('Format spoofing or animated image')
        width, height = image.size
        if not 32 <= width <= 8192 or not 32 <= height <= 8192 or width * height > 16_000_000:
            raise ValueError('Intrinsic dimensions or decoded pixel budget exceeded')
        image.load()
        private = bool(image.getexif()) or any(key.lower() in ('exif', 'icc_profile', 'xmp', 'comment') or isinstance(value, str) for key, value in image.info.items())
        oriented = ImageOps.exif_transpose(image)
        width, height = oriented.size
        if not 1 / 8 <= width / height <= 8:
            raise ValueError('Aspect ratio exceeds supported general image range')
        metadata = {'mime': mime, 'width': width, 'height': height, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest().upper(),
                    'clean': not private and clean_container(data, fmt)}
        if request['mode'] == 'inspect':
            return metadata
        alpha = fmt != 'JPEG' and ('A' in oriented.getbands() or 'transparency' in oriented.info)
        mode = 'RGBA' if alpha else 'RGB'
        # Fresh raster carries no original EXIF/XMP/ICC/comments/PNG text. Keep only decoded pixels.
        raster = Image.new(mode, oriented.size)
        raster.paste(oriented.convert(mode))
        output = io.BytesIO()
        if fmt == 'JPEG':
            raster.save(output, format=fmt, quality=90, subsampling=0, optimize=False, progressive=False)
        elif fmt == 'WEBP':
            raster.save(output, format=fmt, lossless=True, method=4, exact=True)
        else:
            raster.save(output, format=fmt, compress_level=9, optimize=False)
        rendered = output.getvalue()
        if len(rendered) > 8_388_608 or not clean_container(rendered, fmt):
            raise ValueError('Sanitized rendition exceeds bounds or contains unsupported metadata')
        with Image.open(io.BytesIO(rendered), formats=[fmt]) as proof:
            proof.load()
            if proof.size != (width, height) or proof.getexif() or any(k.lower() in ('exif', 'xmp', 'icc_profile', 'comment') for k in proof.info):
                raise ValueError('Sanitized output verification failed')
        return {'mime': mime, 'extension': extension, 'width': width, 'height': height, 'bytes': len(rendered),
                'sha256': hashlib.sha256(rendered).hexdigest().upper(), 'base64': base64.b64encode(rendered).decode(), 'clean': True}

try:
    proof = dependency()
    if sys.argv[1:] == ['--info']:
        print(json.dumps(proof, separators=(',', ':')))
    else:
        raw = sys.stdin.buffer.read(11_200_000)
        if sys.stdin.buffer.read(1):
            raise ValueError('Request exceeds fixed bound')
        value = process(json.loads(raw))
        print(json.dumps({'status': 'PASS', 'dependencySha256': proof['dependencySha256'], 'value': value}, separators=(',', ':')))
except Exception as error:
    print(json.dumps({'status': 'FAIL', 'message': str(error)}, separators=(',', ':')))
    sys.exit(1)
