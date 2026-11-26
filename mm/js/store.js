'use strict';
/* ===== Data dasar di database artifact (anti-duplikat) =====
   Pemilik membuka sekali → seluruh data dasar disalin ke db (base/*, basechunks/*).
   Setelah file data/*.json dihapus dari artifact, salinan hasil "Duplicate" tidak membawa data:
   db tidak ikut tersalin, jadi dashboard duplikat kosong. */
const BASE_V=1,BASE_CH=100000;const CORE_FILES=['members','agg','rkm','projects'];
S.baseMeta=null;S.lastSrc='';
const bKey=n=>n.replace(/\//g,'_');
async function baseDb(ms=6000){if(S.db)return S.db;if(!(await waitClaude(ms)))return null;try{const db=await Promise.race([claude.use('db'),sleep(ms).then(()=>null)]);return db||null}catch(e){return null}}
async function baseMeta(db){if(S.baseMeta)return S.baseMeta;try{const d=await db.doc('base/meta').get();const m=d.exists?d.data():null;if(m&&m.complete&&m.v===BASE_V){S.baseMeta=m;return m}}catch(e){}return null}
async function readBase(db,name){const k=bKey(name);const d=await db.doc('base/'+k).get();if(!d.exists)throw new Error('base '+name+' hilang');const info=d.data();
  const parts=await Promise.all(Array.from({length:info.chunks},(_,i)=>db.doc('basechunks/'+k+'-'+i).get().then(x=>{if(!x.exists)throw new Error('chunk '+k+'-'+i);return x.data().s})));
  const s=parts.join('');if(s.length!==info.size)throw new Error('ukuran '+name+' tidak cocok');return JSON.parse(s)}
/* Data terenkripsi di file artifact: bisa dibuka tanpa login, tapi hanya dari alamat dashboard asli.
   Salinan hasil Duplicate mendapat alamat lain → data tidak dibuka. */
const OWN_SLUG='f35a8a5d-85f0-471d-b31c-f8d0de11f6e4';
function hostAllowed(h){h=String(h||'');return h.startsWith(OWN_SLUG+'.')&&/\.claudeusercontent\.com$/.test(h)||h==='localhost'||h==='127.0.0.1'||!!window.__STANDALONE&&h==='yerteyer.github.io'}
let _ek=null;
async function encKey(){if(_ek)return _ek;if(window.__STANDALONE){_ek=pwKey();return _ek}const b=atob(['8gNerAHBk8=','9J5J2wvd/6v','0Kc1sCne9iu','xWJ7SS5J/RP'].reverse().join(''));const u=new Uint8Array([...b].map(c=>c.charCodeAt(0)));_ek=await crypto.subtle.importKey('raw',u,'AES-GCM',false,['decrypt','encrypt']);return _ek}
/* ===== Salinan web di luar claude.ai: data dikunci kata sandi tim (kunci tidak ada di kode; diturunkan PBKDF2 dari kata sandi) ===== */
const b64u8=t=>{const s=atob(String(t).trim());const u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u};
async function pwKey(){const salt=new TextEncoder().encode(window.__SALT||'mm');let pw=null,err='';try{pw=localStorage.getItem('mm_pw')}catch(e){}
  for(;;){if(!pw)pw=await askPw(err);
    try{const base=await crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveKey']);
      const k=await crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:310000,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['decrypt','encrypt']);
      const bs=b64u8(await (await fetch('data/x/check.txt',{cache:'no-store'})).text());await crypto.subtle.decrypt({name:'AES-GCM',iv:bs.slice(0,12)},k,bs.slice(12));
      try{localStorage.setItem('mm_pw',pw)}catch(e){}setLoadMsg('Membuka data…');return k}
    catch(e){pw=null;err='Kata sandi salah, coba lagi.';try{localStorage.removeItem('mm_pw')}catch(_){}}}}
function askPw(err){return new Promise(res=>{const m=$('#main');m.innerHTML=`<div class="card" style="max-width:420px;margin:48px auto;text-align:center"><img src="img/logo-indogrosir.png" alt="Indogrosir" style="max-width:210px;width:100%"><h2 style="margin:14px 0 4px">Dashboard Member Merah</h2><p class="mut" style="margin:0 0 14px">Masukkan kata sandi tim</p>
   <form id="pwf"><input class="inp" id="pwi" type="password" autocomplete="current-password" style="width:100%;padding:11px;font-size:16px">${err?`<p style="color:#c8102e;margin:8px 0 0">${esc(err)}</p>`:''}<button class="btn pri" style="width:100%;margin-top:12px;padding:11px">Masuk</button></form><p class="small muted" style="margin-top:12px">Kata sandi diingat di HP / komputer ini.</p></div>`;
  const i=$('#pwi');i&&i.focus();$('#pwf').onsubmit=e=>{e.preventDefault();const v=$('#pwi').value.trim();if(!v)return;m.innerHTML='<div class="loading"><div class="spin"></div><b>Memeriksa kata sandi…</b></div>';res(v)}})}
function pwLogout(){try{localStorage.removeItem('mm_pw')}catch(e){}location.reload()}
async function encText(obj){const z=new Uint8Array(await new Response(new Blob([JSON.stringify(obj)]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer());const iv=crypto.getRandomValues(new Uint8Array(12));
  const c=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},await encKey(),z));const all=new Uint8Array(12+c.length);all.set(iv);all.set(c,12);let s='';for(let i=0;i<all.length;i+=0x8000)s+=String.fromCharCode.apply(null,all.subarray(i,i+0x8000));return btoa(s)}
/* Upload pemilik (database) → file artifact data/x/updates.txt agar tim tanpa login ikut melihat.
   Dicoba langsung dari halaman setelah upload; bila tampilan ini tidak mengizinkan, tugas terjadwal Claude menerbitkannya tiap jam. */
async function autoPublish(){const names=Object.keys(S.raw).filter(k=>['db','terbit'].includes(S.src[k])&&S.raw[k]);if(!names.length)return false;
  try{const art=(await waitClaude(3000))?await claude.use('artifact'):null;if(!art)return false;
    const ds={};names.forEach(k=>ds[k]={payload:S.raw[k],meta:{fileName:(S.meta[k]||{}).fileName||'',updatedAt:(S.meta[k]||{}).updatedAt||''}});
    await art.publish({'data/x/updates.txt':{content:await encText({v:1,at:new Date().toISOString(),ds}),contentType:'text/plain'}});S.pubAt=new Date().toISOString();return true}
  catch(e){console.warn('terbit otomatis',e&&(e.code||e.message));return false}}
async function getEnc(name){if(!hostAllowed(location.hostname))throw new Error('alamat bukan dashboard asli');if(!(window.crypto&&crypto.subtle)){const e=new Error('butuh https');e.code='insecure';throw e}
  const r=await fetch('data/x/'+bKey(name)+'.txt',window.__STANDALONE?{cache:'no-cache'}:undefined);if(!r.ok)throw new Error(name+' '+r.status);const bs=atob((await r.text()).trim());const buf=new Uint8Array(bs.length);for(let i=0;i<bs.length;i++)buf[i]=bs.charCodeAt(i);
  const z=await crypto.subtle.decrypt({name:'AES-GCM',iv:buf.slice(0,12)},await encKey(),buf.slice(12));
  const txt=await new Response(new Blob([z]).stream().pipeThrough(new DecompressionStream('gzip'))).text();return JSON.parse(txt)}
// ambil data: db (bila migrasi lengkap) → file artifact → tunggu db lebih lama (browser baru lebih lambat terhubung)
async function fromDb(db,name){const m=await baseMeta(db);if(m&&m.names.includes(name)){const j=await readBase(db,name);S.lastSrc='db';return j}return null}
async function getData(name,{dbOnly}={}){
  if(!dbOnly){try{const j=await getEnc(name);S.lastSrc='enc';return j}catch(e){if(e&&e.code==='insecure')throw e;console.warn('enc',name,e&&e.message)}}
  let db=await baseDb(dbOnly?6000:2500);
  if(db){try{const j=await fromDb(db,name);if(j)return j}catch(e){console.warn('db base',name,e)}}
  if(!dbOnly){try{const j=await getJSON('data/'+name+'.json');S.lastSrc='file';return j}catch(e){}}
  if(!hostAllowed(location.hostname)){const e=new Error('salinan');e.code='copy';throw e}
  setLoadMsg('Menghubungkan ke database…');db=db||await baseDb(15000);
  if(!db){const e=new Error('signin');e.code='signin';throw e}
  for(let i=0;i<3;i++){try{const j=await fromDb(db,name);if(j)return j}catch(e){console.warn('db base retry',name,e)}await sleep(1500)}
  const e=new Error('data '+name+' belum ada di database');e.code='nodata';throw e}
function setLoadMsg(t){const el=document.querySelector('#main .loading b');if(el)el.textContent=t}
async function getProducts(period){try{return await getData('products/'+period)}catch(e){return[]}}
// pemilik: salin file ke db sekali (berjalan di latar belakang)
async function migrateBase(){const db=S.db;if(!db||!S.user||!S.user.isOwner||!S.user.isOwner())return false;if(await baseMeta(db))return true;
  const delay=window.__storeDelay??150;const names=[...CORE_FILES];
  for(const p of D.base?D.base.periods:D.periods)names.push('products/'+p);
  const done=[];let i=0;setMigr(`Mengamankan data ke database (anti-duplikat) 0/${names.length}…`);
  try{for(const n of names){i++;let txt;try{const r=await fetch('data/'+n+'.json');if(!r.ok)continue;txt=await r.text();JSON.parse(txt)}catch(e){continue}
      const k=bKey(n),c=Math.ceil(txt.length/BASE_CH)||1;for(let j=0;j<c;j++){await db.doc('basechunks/'+k+'-'+j).set({s:txt.slice(j*BASE_CH,(j+1)*BASE_CH)});if(delay)await sleep(delay)}
      await db.doc('base/'+k).set({chunks:c,size:txt.length,at:new Date().toISOString()});done.push(n);setMigr(`Mengamankan data ke database (anti-duplikat) ${i}/${names.length}…`)}
    if(!CORE_FILES.every(n=>done.includes(n)))throw new Error('file inti tidak lengkap');
    await db.doc('base/meta').set({complete:true,v:BASE_V,names:done,at:new Date().toISOString(),by:S.uid||''});setMigr('');toast('✓ Data dasar tersimpan di database. Salinan duplikat tidak akan membawa data.',5000);return true}
  catch(e){setMigr('');toast('Migrasi data belum selesai: '+(e.code||e.message)+' — akan dicoba lagi saat dibuka.',5000);return false}}
function setMigr(t){let el=$('#migr');if(!t){el&&el.remove();return}if(!el){el=document.createElement('div');el.id='migr';el.className='migr';document.body.appendChild(el)}el.textContent=t}
