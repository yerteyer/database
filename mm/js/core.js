'use strict';
/* ============ helpers ============ */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=v=>{if(v==null||v==='')return 0;if(typeof v==='number')return v;const n=parseFloat(String(v).replace(/[^\d.\-]/g,''));return isNaN(n)?0:n};
const U=s=>String(s??'').trim().toUpperCase();
const title=s=>String(s??'').toLowerCase().replace(/(^|[\s(\/.\-])(\w)/g,(m,a,b)=>a+b.toUpperCase());
const fmtN=n=>Math.round(n||0).toLocaleString('id-ID');
const fmtRp=n=>(n==null||isNaN(n))?'–':'Rp '+Math.round(n).toLocaleString('id-ID');
function fmtS(n,rp=true){if(n==null||isNaN(n))return'–';const a=Math.abs(n),s=n<0?'-':'';let t;
  if(a>=1e9)t=(a/1e9).toLocaleString('id-ID',{maximumFractionDigits:2})+' M';else if(a>=1e6)t=(a/1e6).toLocaleString('id-ID',{maximumFractionDigits:1})+' jt';else if(a>=1e3)t=(a/1e3).toLocaleString('id-ID',{maximumFractionDigits:0})+' rb';else t=Math.round(a).toLocaleString('id-ID');
  return s+(rp?'Rp ':'')+t}
const pct=(x,d=1)=>isFinite(x)?(x*100).toLocaleString('id-ID',{maximumFractionDigits:d})+'%':'–';
const sgnPct=(x,d=1)=>isFinite(x)?(x>0?'+':'')+pct(x,d):'–';
const MON=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
const MONL=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const fmtD=d=>d?`${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}`:'–';
const fmtDs=d=>d?`${d.getDate()} ${MON[d.getMonth()]}`:'–';
const iso=d=>d?`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`:'';
function toDate(v){
  if(v==null||v==='')return null;
  if(v instanceof Date)return isNaN(v)?null:new Date(v.getFullYear(),v.getMonth(),v.getDate());
  if(typeof v==='number'){if(v>20000&&v<80000){const d=new Date(Math.round((v-25569)*864e5));return new Date(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate())}return null}
  const s=String(v).trim();let m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);if(m)return new Date(+m[1],+m[2]-1,+m[3]);
  m=s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/);if(m){let y=+m[3];if(y<100)y+=2000;return new Date(y,+m[2]-1,+m[1])}
  const d=new Date(s);return isNaN(d)?null:new Date(d.getFullYear(),d.getMonth(),d.getDate());
}
const TODAY=(()=>{const d=new Date();return new Date(d.getFullYear(),d.getMonth(),d.getDate())})();
const daysBetween=(a,b)=>Math.round((b-a)/864e5);
function hash(s){let h=5381;s=String(s);for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return(h>>>0).toString(36)}
const safeId=s=>String(s).replace(/[^A-Za-z0-9_\-.~:@+]/g,'_').slice(0,180);
function phone62(v){let d=String(v??'').replace(/\D/g,'');if(d.length<8)return'';if(d.startsWith('62'))return d;if(d.startsWith('0'))return'62'+d.slice(1);if(d.startsWith('8'))return'62'+d;return d}
function parseCoord(v){if(v==null)return null;const m=String(v).match(/(-?\d{1,3}\.\d+)\s*[, ;]\s*(-?\d{1,3}\.\d+)/);if(!m)return null;const lat=+m[1],lng=+m[2];if(Math.abs(lat)>90||Math.abs(lng)>180||(lat===0&&lng===0))return null;return{lat,lng}}
const gmapsPt=c=>c?`https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lng}`:'';
const gmapsNav=c=>c?`https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}&travelmode=driving&dir_action=navigate`:'';
function hdrIdx(row,re){if(!row)return-1;for(let i=0;i<row.length;i++){if(re.test(U(row[i])))return i}return-1}
function findHdrRow(aoa,tests,max=12){for(let i=0;i<Math.min(max,aoa.length);i++){const t=(aoa[i]||[]).map(U).join('|');if(tests.every(r=>r.test(t)))return i}return-1}
function countBy(arr,f){const m={};for(const x of arr){const k=f(x);m[k]=(m[k]||0)+1}return m}
function sumBy(arr,f){let s=0;for(const x of arr)s+=f(x)||0;return s}
function distKm(a,b){const R=6371,dLa=(b.lat-a.lat)*Math.PI/180,dLo=(b.lng-a.lng)*Math.PI/180;const x=Math.sin(dLa/2)**2+Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLo/2)**2;return 2*R*Math.asin(Math.sqrt(x))}
const initials=s=>String(s||'').replace(/[^A-Za-z ]/g,' ').trim().split(/\s+/).slice(0,2).map(w=>w[0]||'').join('').toUpperCase()||'?';
const debounce=(f,ms)=>{let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>f(...a),ms)}};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

/* ============ segmen ============ */
const SEGS=['REGULER','HOREKA','TMI'];
const SEG_LBL={REGULER:'Reguler',HOREKA:'Horeka',TMI:'TMI'};
const SEG_CLS={REGULER:'reg',HOREKA:'hor',TMI:'tmi'};
const HOREKA_RE=/\b(RM|R\.M|RUMAH MAKAN|RESTO|RESTORAN|RESTAURANT|CAFE|CAFFE|KAFE|COFFEE|KOPI|KATERING|CATERING|BAKERY|ROTI|DONAT|DONUT|KUE|CAKE|KANTIN|WARUNG MAKAN|WARUNG NASI|NASI|BAKSO|MIE AYAM|SATE|PECEL|LAPAU|GEPREK|MARTABAK|HOTEL|PENGINAPAN|DAPUR|MBG|SPPG|SOTO|SEBLAK|LONTONG|PRODUKSI|FROZEN|FOOD)\b/;
function segFromSub(sub){const s=U(sub).replace(/\s/g,'');if(!s)return null;if(s==='5A')return'HOREKA';if(s.startsWith('7'))return'TMI';return'REGULER'}
function segFromText(...t){const s=U(t.join(' '));if(/\bTMI\b/.test(s))return'TMI';if(/HOREKA/.test(s)||HOREKA_RE.test(s))return'HOREKA';return'REGULER'}
const segTag=s=>`<span class="tag ${SEG_CLS[s]||'neu'}">${esc(SEG_LBL[s]||s)}</span>`;

/* ============ status ============ */
const ST={
  turun:{l:'Sales turun',c:'#d03b3b',bg:'#fbeaea',t:'#a12828',i:'↘'},
  absen:{l:'Tidak belanja',c:'#eda100',bg:'#fff5df',t:'#8a5a00',i:'○'},
  sleeper:{l:'Sleeper ≥60 hari',c:'#6250d6',bg:'#efedfc',t:'#4a3aa7',i:'z'},
  naik:{l:'Sales naik',c:'#0ca30c',bg:'#e7f6e7',t:'#006300',i:'↗'},
  kembali:{l:'Aktif kembali',c:'#1baf7a',bg:'#e3f6ef',t:'#0e6b4a',i:'↺'},
  baru:{l:'Baru belanja',c:'#2a78d6',bg:'#e6f0fb',t:'#1c5cab',i:'+'},
  stabil:{l:'Stabil (±5%)',c:'#85837d',bg:'#f0efec',t:'#52514e',i:'='},
  nostruk:{l:'Belum ada struk',c:'#c3c2b7',bg:'#f4f3f0',t:'#52514e',i:'–'},
};
const ST_ORDER=['turun','absen','sleeper','naik','kembali','baru','stabil','nostruk'];
const stTag=k=>`<span class="tag" style="background:${ST[k].bg};color:${ST[k].t}">${ST[k].i} ${ST[k].l}</span>`;

const FU_ST=['Belum dihubungi','Sudah WA','Sudah ditelepon','Sudah dikunjungi','Janji belanja / aktivasi','Berhasil','Tidak berminat','Nomor tidak aktif','Tutup / pindah'];
const FU_CLS={'Belum dihubungi':'neu','Sudah WA':'warn','Sudah ditelepon':'warn','Sudah dikunjungi':'warn','Janji belanja / aktivasi':'serious','Berhasil':'good','Tidak berminat':'crit','Nomor tidak aktif':'crit','Tutup / pindah':'crit'};
const FU_COL={neu:'#c3c2b7',warn:'#fab219',serious:'#ec835a',good:'#0ca30c',crit:'#d03b3b'};

/* ============ state ============ */
const S={
  db:null,user:null,uid:null,dl:null,dbOk:false,
  fu:{},wa:{},meta:{},src:{},raw:{},upLog:[],
  per:null,cmp:null,prorata:true,
  view:'ringkasan',
  f:{}, // per-view filters
  sel:new Set(),
};
const D={mem:[],byCode:{},P:0,periods:[],pdays:[],asOf:null,G:null,MG:null,STK:null,KJ:null,LD:null,agg:null,rkm:[],rkmBy:{},prod:{},proj:null,M:{}};

/* ============ data loading ============ */
async function getJSON(u){const r=await fetch(u);if(!r.ok)throw new Error(u+' '+r.status);return r.json()}
function loadMembers(J){
  const P=J.periods.length,N=J.r.length;D.P=P;D.periods=J.periods;D.pdays=J.pdays;D.asOf=toDate(J.asOf);D.masterAsOf=toDate(J.masterAsOf);
  D.G=new Float64Array(N*P);D.MG=new Float64Array(N*P);D.STK=new Uint16Array(N*P);D.KJ=new Uint16Array(N*P);D.LD=new Uint8Array(N*P);
  D.mem=new Array(N);D.byCode={};
  for(let i=0;i<N;i++){const r=J.r[i];
    const m={i,code:String(r[0]),name:r[1]||'',sub:r[2]||'',tier:r[3]||'',cat:r[4]||'',addr:r[5]||'',vil:r[6]||'',dist:r[7]||'',city:r[8]||'',phone:phone62(r[9]),phoneRaw:r[9]||'',km:r[10],reg:r[11],mvisit:r[12],lat:r[13],lng:r[14],master:r[15],seg:segFromSub(r[2])||'REGULER'};
    m.coord=(m.lat!=null&&m.lng!=null)?{lat:m.lat,lng:m.lng}:null;m.id='M-'+safeId(m.code);
    D.mem[i]=m;D.byCode[U(m.code)]=m;
    const h=J.h[i];for(let k=0;k<h.length;k+=6){const o=i*P+h[k];D.G[o]=h[k+1];D.MG[o]=h[k+2];D.STK[o]=h[k+3];D.KJ[o]=h[k+4];D.LD[o]=h[k+5]}
  }
}
function applyHistOverlay(p,rows){ // rows: [{code,gross,margin,struk,kunj,lastDay}]
  const P=D.P;for(const m of D.mem){const o=m.i*P+p;D.G[o]=0;D.MG[o]=0;D.STK[o]=0;D.KJ[o]=0;D.LD[o]=0}
  for(const r of rows){let m=D.byCode[U(r.code)];if(!m){m=addMember({code:r.code,name:r.name,sub:r.sub});}const o=m.i*P+p;D.G[o]=r.gross;D.MG[o]=r.margin;D.STK[o]=r.struk;D.KJ[o]=r.kunj;D.LD[o]=r.lastDay||0}
}
function addMember(x){ // grows typed arrays (rare)
  const P=D.P,N=D.mem.length+1;const grow=(A,T)=>{const n=new T(N*P);n.set(A);return n};
  D.G=grow(D.G,Float64Array);D.MG=grow(D.MG,Float64Array);D.STK=grow(D.STK,Uint16Array);D.KJ=grow(D.KJ,Uint16Array);D.LD=grow(D.LD,Uint8Array);
  const m={i:N-1,code:String(x.code),name:x.name||'',sub:x.sub||'',tier:'',cat:'',addr:'',vil:'',dist:'',city:'',phone:'',phoneRaw:'',km:null,reg:'',mvisit:'',lat:null,lng:null,coord:null,master:0,seg:segFromSub(x.sub)||'REGULER'};m.id='M-'+safeId(m.code);
  D.mem.push(m);D.byCode[U(m.code)]=m;return m;
}
function periodLabel(p,short){const [y,m]=D.periods[p].split('-').map(Number);const part=p===D.P-1&&D.pdays[p]<new Date(y,m,0).getDate();return (short?`${MON[m-1]} ${String(y).slice(2)}`:`${MONL[m-1]} ${y}`)+(part&&!short?` (1–${D.pdays[p]})`:part?'*':'')}
function periodEnd(p){const [y,m]=D.periods[p].split('-').map(Number);return p===D.P-1?D.asOf:new Date(y,m,0)}
function periodStart(p){const [y,m]=D.periods[p].split('-').map(Number);return new Date(y,m-1,1)}
function isPartial(p){const [y,m]=D.periods[p].split('-').map(Number);return D.pdays[p]<new Date(y,m,0).getDate()}

/* ============ compute per period ============ */
let CALC=null;
function compute(){
  const p=S.per,c=S.cmp,P=D.P;const dp=D.pdays[p],dc=D.pdays[c];const pr=S.prorata&&(isPartial(p)||isPartial(c))?dp/dc:1;
  const pend=periodEnd(p);const N=D.mem.length;
  const rows=new Array(N);const cnt={};ST_ORDER.forEach(k=>cnt[k]=0);
  let tc=0,tpv=0,act=0,actPrev=0,mg=0,stk=0,stkPrev=0,downSum=0,upSum=0;
  for(let i=0;i<N;i++){const m=D.mem[i];const b=i*P;const cur=D.G[b+p],prev=D.G[b+c];const prevAdj=prev*pr;
    let last=null;for(let q=p;q>=0;q--){if(D.G[b+q]>0){const [y,mm]=D.periods[q].split('-').map(Number);last=new Date(y,mm-1,D.LD[b+q]||1);break}}
    let hasBefore=false;const lo=Math.min(p,c);for(let q=0;q<lo;q++){if(D.G[b+q]>0){hasBefore=true;break}}
    let st;
    if(!last)st='nostruk';
    else if(cur>0){if(prev>0){const r=cur/prevAdj;st=r>1.05?'naik':r<0.95?'turun':'stabil'}else st=hasBefore?'kembali':'baru'}
    else{const ds=daysBetween(last,pend);st=ds>=60?'sleeper':'absen'}
    const delta=cur-prevAdj;
    rows[i]={m,cur,prev,prevAdj,delta,chg:prevAdj>0?cur/prevAdj-1:(cur>0?Infinity:0),st,last,since:last?daysBetween(last,pend):null,struk:D.STK[b+p],kunj:D.KJ[b+p],margin:D.MG[b+p]};
    cnt[st]++;tc+=cur;tpv+=prev;if(cur>0)act++;if(prev>0)actPrev++;mg+=D.MG[b+p];stk+=D.STK[b+p];stkPrev+=D.STK[b+c];
    if(delta<0&&prev>0)downSum+=delta;if(delta>0)upSum+=delta;
  }
  const A=D.agg.monthly;const ap=A[p],ac=A[c];
  CALC={p,c,pr,rows,cnt,tc,tpv,act,actPrev,mg,stk,stkPrev,downSum,upSum,ap,ac,byId:null};
  CALC.byCode={};for(const r of rows)CALC.byCode[U(r.m.code)]=r;
  return CALC;
}
const R=code=>CALC&&CALC.byCode[U(code)];
function lastBuy(m,upto=D.P-1){const b=m.i*D.P;for(let q=upto;q>=0;q--){if(D.G[b+q]>0){const [y,mm]=D.periods[q].split('-').map(Number);return new Date(y,mm-1,D.LD[b+q]||1)}}return null}
function histOf(m){const b=m.i*D.P;return Array.from({length:D.P},(_,q)=>D.G[b+q])}

/* ============ follow-up / db ============ */
const fuOf=id=>S.fu[id]||{};
async function waitClaude(ms=10000){if(window.__STANDALONE)return false;const t0=Date.now();while(!(window.claude&&window.claude.use)){if(Date.now()-t0>ms)return false;await sleep(150)}return true}
async function initCaps(){
  if(!(await waitClaude(10000))){setDbChip(window.__STANDALONE?'warn':'bad',window.__STANDALONE?'Salinan web · catatan di perangkat ini':'Mode lokal');loadLocal();fuRemoteInit();return}
  try{S.dl=await claude.use('downloads')}catch(e){S.dl=null}
  try{S.user=await claude.use('user');if(S.user&&S.user.id)S.uid=await S.user.id()}catch(e){}
  /* pengunjung belum login: jangan sentuh database tim (memicu pop-up "masuk untuk melihat data"); data member tetap terbuka dari file terenkripsi */
  if(!S.uid){setDbChip('warn','Mode tamu · belum login');loadLocal();rerender();return}
  let db=null;try{db=await claude.use('db')}catch(e){}
  if(!db){setDbChip('bad','Mode lokal');loadLocal();rerender();return}
  S.db=db;setDbChip('warn','Menghubungkan…');
  const t=setTimeout(()=>setDbChip('warn','Database belum terjangkau'),10000);
  db.collection('followup').onSnapshot(snap=>{clearTimeout(t);S.dbOk=true;setDbChip('ok','Tersinkron tim');const fu={};snap.docs.forEach(d=>fu[d.id]=d.data());S.fu=fu;rerenderSoft()},e=>{clearTimeout(t);setDbChip('bad','DB: '+e.code)});
  db.collection('formq').onSnapshot(snap=>{S.formq=snap.docs.map(d=>({id:d.id,...d.data()}));rebuildFromForms();buildProjects();rerenderSoft()},()=>{});
  db.doc('settings/wa').onSnapshot(s=>{if(s.exists){S.wa=s.data()||{}}},()=>{});
  db.doc('settings/zumba').onSnapshot(s=>{S.zbEvt=s.exists?s.data():null;rerenderSoft()},()=>{});
  db.doc('settings/mymaps').onSnapshot(s=>{const d=s.exists?s.data():null;S.mymaps=d&&typeof d.mid==='string'?d:null;rerenderSoft()},()=>{});
  db.collection('datasets').onSnapshot(async snap=>{let changed=false;
    for(const d of snap.docs){const m=d.data();if(!m||!m.chunks)continue;const cur=S.meta[d.id];if(cur&&cur.updatedAt===m.updatedAt&&S.src[d.id]==='db')continue;
      try{let s='';for(let i=0;i<m.chunks;i++){const c=await db.doc('chunks/'+d.id+'-'+i).get();if(!c.exists)throw new Error('chunk');s+=c.data().s}
        S.raw[d.id]=JSON.parse(s);S.meta[d.id]=m;S.src[d.id]='db';changed=true}catch(e){console.warn(d.id,e)}}
    if(changed){applyOverlays();rerender()}},()=>{});
}
/* ===== Salinan web: PIC/status/catatan tersimpan bersama di Google Sheets pemilik (Google Apps Script, window.__FU_URL).
   Token = SHA-256(kata sandi tim | salt) — hanya yang tahu kata sandi tim bisa membaca/menulis. ===== */
const FU_REMOTE={url:null,token:null,since:0,pending:new Set(),busy:false};
async function sha256hex(t){const h=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t));return[...new Uint8Array(h)].map(b=>b.toString(16).padStart(2,'0')).join('')}
async function fuRemoteInit(){if(!window.__STANDALONE||!window.__FU_URL||FU_REMOTE.url)return;let pw=null;try{pw=localStorage.getItem('mm_pw')}catch(e){}if(!pw)return;
  FU_REMOTE.url=window.__FU_URL;FU_REMOTE.token=await sha256hex(pw+'|'+(window.__SALT||''));
  try{JSON.parse(localStorage.getItem('igr2_fu_pending')||'[]').forEach(i=>FU_REMOTE.pending.add(i))}catch(e){}
  await fuPull();setInterval(fuPull,45000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)fuPull()})}
function fuSavePending(){try{localStorage.setItem('igr2_fu_pending',JSON.stringify([...FU_REMOTE.pending]))}catch(e){}}
async function fuPull(){if(!FU_REMOTE.url||FU_REMOTE.busy)return;FU_REMOTE.busy=true;
  try{for(const id of [...FU_REMOTE.pending])await fuSend(id);
    const r=await fetch(FU_REMOTE.url+'?token='+FU_REMOTE.token+'&since='+FU_REMOTE.since,{cache:'no-store'});const j=await r.json();if(!j.ok)throw new Error(j.error||'gagal');
    let ch=false;for(const [id,d] of Object.entries(j.data||{})){const cur=S.fu[id];if(d&&(!cur||(d.at||'')>(cur.at||''))&&!FU_REMOTE.pending.has(id)){S.fu[id]=d;ch=true}}
    FU_REMOTE.since=j.now||FU_REMOTE.since;setDbChip(FU_REMOTE.pending.size?'warn':'ok',FU_REMOTE.pending.size?`Menunggu kirim ${FU_REMOTE.pending.size} isian`:'Tersinkron tim');
    if(ch){try{localStorage.setItem('igr2_fu',JSON.stringify(S.fu))}catch(e){}rerenderSoft()}}
  catch(e){setDbChip('bad','Belum tersinkron · cek internet')}finally{FU_REMOTE.busy=false}}
async function fuSend(id){const r=await fetch(FU_REMOTE.url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({token:FU_REMOTE.token,id,data:S.fu[id]||{}})});const j=await r.json();if(!j.ok)throw new Error(j.error||'gagal');FU_REMOTE.pending.delete(id);fuSavePending()}
function fuPush(id){if(!FU_REMOTE.url)return;FU_REMOTE.pending.add(id);fuSavePending();setDbChip('warn','Menyimpan ke tim…');
  fuSend(id).then(()=>setDbChip(FU_REMOTE.pending.size?'warn':'ok',FU_REMOTE.pending.size?`Menunggu kirim ${FU_REMOTE.pending.size} isian`:'Tersinkron tim')).catch(()=>setDbChip('bad','Belum terkirim · dicoba lagi otomatis'))}
function loadLocal(){try{S.fu=JSON.parse(localStorage.getItem('igr2_fu')||'{}')}catch(e){}}
function setDbChip(k,t){const c=$('#chipDb');if(c)c.innerHTML=`<span class="dot ${k}"></span>${esc(t)}`}
const writeQ={};
function saveFU(id,patch,log){
  const cur={...(S.fu[id]||{})};const next={...cur,...patch,at:new Date().toISOString()};if(S.uid)next.by=S.uid;
  if(log){const h=Array.isArray(cur.log)?cur.log.slice(-19):[];h.push({t:next.at,s:log});next.log=h}
  Object.keys(next).forEach(k=>{if(next[k]===''||next[k]==null)delete next[k]});S.fu[id]=next;
  if(!S.db){try{localStorage.setItem('igr2_fu',JSON.stringify(S.fu))}catch(e){}fuPush(id);return Promise.resolve()}
  const prev=writeQ[id]||Promise.resolve();writeQ[id]=prev.then(()=>S.db.doc('followup/'+id).set(S.fu[id])).catch(e=>toast('Gagal simpan: '+(e.code||e.message)));return writeQ[id];
}
async function saveDataset(name,payload,fileName){if(S.db&&S.user&&S.user.isOwner&&!S.user.isOwner()){throw new Error('hanya pemilik dashboard yang bisa mengupdate data')}
  const meta={fileName,updatedAt:new Date().toISOString()};
  if(!S.db){S.raw[name]=payload;S.meta[name]=meta;S.src[name]='lokal';applyOverlays();rerender();return}
  const s=JSON.stringify(payload);const n=Math.ceil(s.length/150000);
  for(let i=0;i<n;i++){await S.db.doc('chunks/'+name+'-'+i).set({s:s.slice(i*150000,(i+1)*150000)});await sleep(250)}
  Object.assign(meta,{chunks:n,size:s.length});if(S.uid)meta.by=S.uid;await S.db.doc('datasets/'+name).set(meta);
  S.raw[name]=payload;S.meta[name]=meta;S.src[name]='db';applyOverlays();rerender();
}
async function resetDataset(name){if(S.db){try{await S.db.doc('datasets/'+name).delete()}catch(e){toast('Gagal');return}}
  delete S.raw[name];delete S.src[name];delete S.meta[name];location.hash='#update';toast('Dikembalikan ke data awal. Memuat ulang…');setTimeout(()=>location.reload(),800)}

/* ============ ui infra ============ */
function toast(m,ms=3200){const t=document.createElement('div');t.className='toast';t.textContent=m;document.body.appendChild(t);setTimeout(()=>t.remove(),ms)}
async function saveFile(filename,data,fb={}){
  if(!S.dl&&await waitClaude(2500)){try{S.dl=await claude.use('downloads')}catch(e){}}
  if(S.dl){try{await S.dl.save({filename,data});return true}catch(e){if(e&&e.code==='declined')return false;if(!['unavailable','not_granted','capability_disabled','capability_removed','extension_not_enabled'].includes(e&&e.code)){toast('Download gagal: '+(e&&(e.message||e.code)));return false}}}
  if(window.__STANDALONE){const url=URL.createObjectURL(new Blob([data]));const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);return true}
  /* tanpa izin unduh dari Claude (tim membuka tanpa login): file diunduh lewat tab baru (di luar batas frame artifact),
     cadangan: unduh langsung di frame ini, lalu salin-tempel tabel ke Excel */
  const txt=typeof data==='string'?data:fb.tsv;const isTxt=typeof data==='string';
  const bg=modal('Unduh file',`<p class="small">Tekan tombol di bawah. File dibuka lewat tab baru lalu langsung terunduh (izinkan pop-up bila browser bertanya).</p>
   <div class="pill-row"><button class="btn pri" id="dlGo">⬇ Unduh ${esc(filename)}</button>${fb.csv?`<button class="btn" id="dlCsv">⬇ Unduh CSV</button>`:''}</div>
   ${txt?`<p class="small mt">Bila unduhan tetap tidak muncul, <b>Salin tabel</b> lalu tempel (Ctrl+V) di Excel / Google Sheets:</p><textarea class="inp" id="fbTxt" readonly style="width:100%;min-height:140px">${esc(txt.slice(0,600000))}</textarea>`:''}`,
   {ok:txt?async b=>{const t=$('#fbTxt',b);t.select();let ok=false;try{await navigator.clipboard.writeText(t.value);ok=true}catch(e){try{ok=document.execCommand('copy')}catch(e2){}}toast(ok?'Tabel disalin — tempel di Excel / Google Sheets':'Tekan Ctrl+C untuk menyalin');return false}:null,okLbl:'Salin tabel'});
  $('#dlGo',bg).onclick=()=>{dlBlob([data],isTxt?'text/csv':'application/octet-stream',filename);toast('Mengunduh '+filename+'…')};
  if(fb.csv)$('#dlCsv',bg).onclick=()=>{dlBlob(['\ufeff'+fb.csv],'text/csv',filename.replace(/\.xlsx$/i,'.csv'))};
  return false}
function dlBlob(parts,type,name){name=String(name).replace(/×/g,'x').normalize('NFKD').replace(/[^\x20-\x7E]/g,'').replace(/[\\/:*?"<>|]/g,'-').replace(/\s+/g,' ').trim()||'data.xlsx';let w=null;try{w=window.open('','_blank')}catch(e){}
  if(w){try{const d=w.document;const url=w.URL.createObjectURL(new w.Blob(parts,{type}));d.title=name;d.body.style.cssText='font:16px system-ui,sans-serif;padding:24px;color:#141413';d.body.innerHTML='<p>File <b></b> sedang diunduh…</p><p style="color:#666">Tab ini boleh ditutup setelah unduhan selesai.</p>';d.querySelector('b').textContent=name;
      const a=d.createElement('a');a.href=url;a.download=name;a.textContent='Unduhan tidak mulai? Klik di sini';a.style.cssText='display:inline-block;margin-top:8px;padding:10px 14px;background:#c8102e;color:#fff;border-radius:10px;text-decoration:none';d.body.appendChild(a);a.click();return}catch(e){try{w.close()}catch(_){}}}
  const url=URL.createObjectURL(new Blob(parts,{type}));setTimeout(()=>URL.revokeObjectURL(url),120000);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove()}
function modal(t,body,{ok,okLbl='Simpan',wide,extra}={}){
  const bg=document.createElement('div');bg.className='modal-bg';
  bg.innerHTML=`<div class="modal ${wide?'wide':''}" role="dialog"><div class="modal-h"><h3>${esc(t)}</h3><button class="icon-btn" data-close aria-label="Tutup">✕</button></div><div class="modal-b">${body}</div><div class="modal-f">${extra||''}<span class="sp"></span><button class="btn" data-close>Tutup</button>${ok?`<button class="btn pri" data-ok>${okLbl}</button>`:''}</div></div>`;
  document.body.appendChild(bg);
  bg.addEventListener('click',async e=>{if(e.target===bg||e.target.closest('[data-close]')){bg.remove();return}if(e.target.closest('[data-ok]')&&ok){const r=await ok(bg);if(r!==false)bg.remove()}});
  return bg;
}
const tipEl=()=>$('#tip');
document.addEventListener('mouseover',e=>{const el=e.target.closest('[data-tip]');const t=tipEl();if(!t)return;if(!el){t.style.opacity=0;return}t.textContent=el.getAttribute('data-tip');t.style.opacity=1});
document.addEventListener('mousemove',e=>{const t=tipEl();if(t&&t.style.opacity==='1'){const x=Math.min(e.clientX+14,innerWidth-t.offsetWidth-8),y=Math.min(e.clientY+14,innerHeight-t.offsetHeight-8);t.style.left=x+'px';t.style.top=y+'px'}});

/* ===== base snapshot so overlays can be re-applied idempotently ===== */
function snapBase(){D.base={G:D.G.slice(),MG:D.MG.slice(),STK:D.STK.slice(),KJ:D.KJ.slice(),LD:D.LD.slice(),P:D.P,periods:[...D.periods],pdays:[...D.pdays],monthly:JSON.parse(JSON.stringify(D.agg.monthly)),daily:D.agg.daily.map(d=>[...d]),asOf:D.asOf,memLen:D.mem.length}}
function restoreBase(){const b=D.base;if(!b)return;D.G=b.G.slice();D.MG=b.MG.slice();D.STK=b.STK.slice();D.KJ=b.KJ.slice();D.LD=b.LD.slice();D.P=b.P;D.periods=[...b.periods];D.pdays=[...b.pdays];D.agg.monthly=JSON.parse(JSON.stringify(b.monthly));D.agg.daily=b.daily.map(d=>[...d]);D.asOf=b.asOf;
  if(D.mem.length>b.memLen){D.mem.slice(b.memLen).forEach(m=>delete D.byCode[U(m.code)]);D.mem.length=b.memLen}
  D.mem.forEach(m=>{if(m._orig){Object.assign(m,m._orig);delete m._orig}});Object.keys(ME).forEach(k=>delete ME[k])}
