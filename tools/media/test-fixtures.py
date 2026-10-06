"""Private deterministic codec fixtures; never copied into public asset output."""
import base64, io, json, sys
from pathlib import Path
sys.path.insert(0, str(Path(sys.executable).parent / 'Lib' / 'site-packages'))
from PIL import Image, PngImagePlugin
result = {}
im = Image.new('RGBA', (321, 123), (0, 0, 0, 0))
im.paste((255, 0, 0, 255), (0, 0, 107, 123))
im.paste((0, 255, 0, 255), (107, 0, 214, 123))
im.paste((0, 0, 255, 128), (214, 0, 321, 123))
for fmt, mime in [('PNG','image/png'),('JPEG','image/jpeg'),('WEBP','image/webp')]:
    buf=io.BytesIO(); image=im.convert('RGB') if fmt=='JPEG' else im
    opts={}
    if fmt=='PNG':
        meta=PngImagePlugin.PngInfo();meta.add_text('Private','PRIVATE-MEDIA-FIXTURE-LOCATION');opts['pnginfo']=meta
    else:
        exif=Image.Exif();exif[0x010E]='PRIVATE-MEDIA-FIXTURE-LOCATION';exif[0x0112]=6;opts['exif']=exif
    image.save(buf,format=fmt,**opts);result[fmt]={'mime':mime,'base64':base64.b64encode(buf.getvalue()).decode()}
for fmt in ['PNG','WEBP']:
    buf=io.BytesIO();im.save(buf,format=fmt,save_all=True,append_images=[Image.new('RGBA',im.size,'yellow')],duration=100,loop=0)
    result['animated'+fmt]={'mime':'image/'+fmt.lower(),'base64':base64.b64encode(buf.getvalue()).decode()}
for label, size in [('small',(31,100)),('huge',(4001,4000)),('ratio',(800,32))]:
    buf=io.BytesIO();Image.new('RGB',size,'red').save(buf,format='PNG');result[label]={'mime':'image/png','base64':base64.b64encode(buf.getvalue()).decode()}
print(json.dumps(result))
