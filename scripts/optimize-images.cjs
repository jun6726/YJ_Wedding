// Original filenames determine gallery order; SHA-256 keeps photo identities stable across renames.
const sharp=require('sharp');
const fs=require('node:fs/promises');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const output=path.join(root,'images/gallery');
sharp.concurrency(2);
const digest=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
async function convert(source,relativePath,width){
 const target=path.join(output,relativePath);await fs.mkdir(path.dirname(target),{recursive:true});
 const info=await sharp(source).rotate().resize({width,withoutEnlargement:true})
  .webp({quality:85,alphaQuality:100,effort:5}).toFile(target);
 return {path:relativePath,width:info.width,height:info.height,bytes:info.size};
}
(async()=>{
 const sourceDir=path.join(root,'images/original');
 const files=(await fs.readdir(sourceDir)).filter(f=>/^gallery\d+\.jpe?g$/i.test(f))
  .sort((a,b)=>Number(a.match(/\d+/)[0])-Number(b.match(/\d+/)[0]));
 if(!files.length) throw Error('No original gallery photos found.');
 const previous=JSON.parse(await fs.readFile(path.join(output,'source-map.json'),'utf8'));
 const identities=new Map(Object.entries(previous.photos).map(([name,data])=>[data.sha256,{name,data}]));
 const photos={},order=[],widths={},oldToNew=new Map();
 const manifest={quality:85,format:'webp',order,photos:{}};
 for(const sourceFile of files){
  const number=Number(sourceFile.match(/\d+/)[0]);const file=`gallery${String(number).padStart(2,'0')}.jpg`;
  if(photos[file]) throw Error(`Duplicate gallery number: ${sourceFile}`);
  const source=path.join(sourceDir,sourceFile),sha256=digest(await fs.readFile(source));
  const prior=identities.get(sha256);
  photos[file]={...(prior?.data||{}),sourceFile,sha256,storageKey:prior?.data.storageKey||`photo_${sha256.slice(0,24)}`};
  if(prior) oldToNew.set(prior.name,file);
  const meta=await sharp(source).metadata();widths[file]=meta.autoOrient?.width||meta.width;
  const variants={};
  for(const [kind,folder,width] of [['thumbs','thumbs',400],['small','view/600',600],['medium','view/900',900],['body','view/1200',1200],['body2x','view/1440',1440],['large','large',1600]]){
   variants[kind]=await convert(source,`${folder}/${file.replace('.jpg','.webp')}`,width);
  }
  order.push(file);manifest.photos[file]=variants;
 }
 // Section images may be manually cropped. Rename them without altering their pixels.
 let html=await fs.readFile(path.join(root,'index.html'),'utf8');
 const sectionRenaming={},pending=[];
 async function sections(directory){
  for(const entry of await fs.readdir(directory,{withFileTypes:true})){
   const original=path.join(directory,entry.name);
   if(entry.isDirectory()){await sections(original);continue;}
   const match=entry.name.match(/^(gallery\d+)\.(jpg|webp)$/i);if(!match) continue;
   const canonical=match[1]+'.jpg',updated=oldToNew.get(canonical);
   if(!updated || updated===canonical) continue;
   const target=path.join(directory,updated.replace('.jpg','.'+match[2]));
   const from=path.relative(root,original).split(path.sep).join('/'),to=path.relative(root,target).split(path.sep).join('/');
   sectionRenaming[from]=to;const temporary=original+'.order-sync';
   await fs.rename(original,temporary);pending.push({temporary,target});
  }
 }
 for(const directory of ['images/intro','images/hero','images/content']) await sections(path.join(root,directory));
 for(const {temporary,target} of pending) await fs.rename(temporary,target);
 // One replacement pass prevents collisions when two filenames swap places.
 html=html.replace(/images\/[\w/.-]+\.(?:jpg|webp)/g,asset=>sectionRenaming[asset]||asset);
 const numbers=order.map(file=>Number(file.match(/\d+/)[0]));
 html=html.replace(/const galleryPhotos = \[[\d,\s]+\]\.map\([^;]+;/,
  'const galleryPhotos = ['+numbers.join(', ')+"].map(number => `gallery${String(number).padStart(2,'0')}.jpg`);");
 html=html.replace(/const galleryStorageKeys = \[[^;]+;/,'const galleryStorageKeys = '+JSON.stringify(order.map(file=>photos[file].storageKey))+';');
 const widthDeclaration='const gallerySourceWidths = '+JSON.stringify(widths)+';';
 if(html.includes('const gallerySourceWidths =')) html=html.replace(/const gallerySourceWidths = [^;]+;/,widthDeclaration);
 else html=html.replace('function photoWidth(filename, requested){',widthDeclaration+'\nfunction photoWidth(filename, requested){');
 html=html.replace(/function photoWidth\(filename, requested\)\{[\s\S]*?\n\}/,
  'function photoWidth(filename, requested){\n  return Math.min(requested, gallerySourceWidths[filename]);\n}');
 const remapSource=value=>value.replace(/gallery\d+\.jpg/g,name=>oldToNew.get(name)||name);
 const sectionSources={};for(const [asset,source] of Object.entries(previous.sectionSources||{}))sectionSources[sectionRenaming[asset]||asset]=remapSource(source);
 const next={...previous,photos,heroSource:remapSource(previous.heroSource),endingSource:remapSource(previous.endingSource),sectionSources,sectionRenaming};
 next.retiredPhotos=[...(previous.retiredPhotos||[]),...Object.entries(previous.photos).filter(([name])=>!oldToNew.has(name)).map(([name,data])=>({filename:name,...data}))];
 await fs.writeFile(path.join(root,'index.html'),html);
 await fs.writeFile(path.join(output,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 await fs.writeFile(path.join(output,'source-map.json'),JSON.stringify(next,null,2)+'\n');
 await fs.writeFile(path.join(sourceDir,'README.md'),'# 원본 이미지\n\n파일의 gallery 번호순으로 갤러리를 생성합니다. JPG 확장자의 대소문자 모두 지원합니다.\n\n번호를 바꾼 뒤 scripts/optimize-images.cjs를 실행하면 압축 이미지·갤러리 순서·섹션 파일명을 동기화합니다.\n기존 좋아요·댓글은 파일 내용의 SHA-256으로 동일 사진을 식별해 유지합니다.\n\n현재 '+files.length+'장: '+files.join(', ')+'\n');
 console.log(JSON.stringify({photos:files.length,variants:6,sectionFilesRenamed:pending.length},null,2));
})().catch(error=>{console.error(error);process.exitCode=1;});
