import {requireThat as must} from '../management/files.mjs';

// Data grammar only. Nothing parsed here is executed, imported or interpolated.
export function literals(source, mode='script') {
  must(typeof source==='string'&&Buffer.byteLength(source)<=8388608,'STRUCTURED_LIMIT','Literal source exceeds8MiB.');
  if(mode==='json'){try{JSON.parse(source);}catch{must(false,'STRUCTURED_LITERAL','Authored/declaration JSON must use strict JSON syntax.');}}
  let p=0,count=0;const spans=[];
  const fail=message=>must(false,'STRUCTURED_LITERAL',message+' at character '+p+'.');
  function skip(){while(p<source.length){if(/\s/.test(source[p])){p++;continue;}if(source.startsWith('//',p)){p=source.indexOf('\n',p);if(p<0)p=source.length;continue;}if(source.startsWith('/*',p)){const end=source.indexOf('*/',p+2);if(end<0)fail('Unclosed comment');p=end+2;continue;}break;}}
  function token(s){skip();if(!source.startsWith(s,p))fail('Expected '+s);p+=s.length;}
  function identifier(){skip();const m=/^[A-Za-z_$][\w$]*/.exec(source.slice(p));if(!m)fail('Expected identifier');p+=m[0].length;return m[0];}
  function string(){skip();const quote=source[p++];let out='';while(p<source.length){let c=source[p++];if(c===quote)return out;if(quote==='`'&&c==='$'&&source[p]==='{')fail('Template interpolation is executable');if(c==='\\'){if(p>=source.length)fail('Unclosed escape');c=source[p++];const simple={n:'\n',r:'\r',t:'\t',b:'\b',f:'\f',v:'\v','0':'\0'};if(Object.hasOwn(simple,c)){if(c==='0'&&/[0-9]/.test(source[p]||''))fail('Octal escape');out+=simple[c];}else if(c==='u'||c==='x'){let hex;if(c==='u'&&source[p]==='{'){p++;const end=source.indexOf('}',p);hex=source.slice(p,end);if(end<0||!/^[0-9a-f]{1,6}$/i.test(hex)||parseInt(hex,16)>0x10ffff)fail('Invalid Unicode escape');p=end+1;out+=String.fromCodePoint(parseInt(hex,16));}else{const n=c==='u'?4:2;hex=source.slice(p,p+n);if(!new RegExp('^[0-9a-f]{'+n+'}$','i').test(hex))fail('Invalid escape');p+=n;out+=String.fromCharCode(parseInt(hex,16));}}else if(c==='\n'){}else if(c==='\r'){if(source[p]==='\n')p++;}else if(['\\','"',"'",'`','$','/'].includes(c))out+=c;else fail('Unsupported escape');}else{if(quote!=='`'&&(c==='\n'||c==='\r'))fail('Unescaped string newline');if(quote==='`'&&c==='\r'){if(source[p]==='\n')p++;c='\n';}out+=c;}}fail('Unclosed string');}
  function value(depth=0){skip();must(++count<=500000&&depth<=32,'STRUCTURED_LIMIT','Literal nodes/depth exceed bounds.');const start=p;let result;
    if(['"',"'",'`'].includes(source[p]))result=string();
    else if(source[p]==='['){p++;result=[];skip();while(source[p]!==']'){result.push(value(depth+1));skip();if(source[p]!==',')break;p++;skip();}token(']');}
    else if(source[p]==='{'){p++;result={};skip();while(source[p]!=='}'){const key=['"',"'",'`'].includes(source[p])?string():identifier();must(!['__proto__','prototype','constructor'].includes(key)&&!Object.hasOwn(result,key),'STRUCTURED_LITERAL','Duplicate/unsafe literal key.');token(':');result[key]=value(depth+1);skip();if(source[p]!==',')break;p++;skip();}token('}');}
    else{const m=/^(?:true|false|null)(?![\w$])|^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:e[+-]?\d+)?(?![\w$.])/i.exec(source.slice(p));if(!m)fail('Only literal values are supported');p+=m[0].length;result=m[0]==='true'?true:m[0]==='false'?false:m[0]==='null'?null:Number(m[0]);must(result===null||typeof result!=='number'||Number.isFinite(result),'STRUCTURED_LITERAL','Non-finite number.');}
    spans.push({start,end:p});return result;}
  const values={};if(mode==='json'){const data=value();skip();must(p===source.length,'STRUCTURED_LITERAL','Trailing JSON source.');return {data,spans};}
  while(true){skip();if(p===source.length)break;let name;if(mode==='export'){token('export');token('const');name=identifier();}else{token('window');token('.');name=identifier();}must(!Object.hasOwn(values,name),'STRUCTURED_LITERAL','Duplicate source assignment.');token('=');values[name]=value();skip();token(';');}
  return {values,spans};
}
