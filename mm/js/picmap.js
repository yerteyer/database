'use strict';
/* ===== PIC per advisor dari Excel "Pembagian Member per Advisor" =====
   Satu sheet per advisor: baris 1 "Nama  (Reguler | Khusus 5A | Klik only)", baris 2 "Wilayah: …", tabel berkolom MEMBER, KELURAHAN, KOORDINAT.
   Dipakai semua project kecuali Loyalty November (PIC Loyalty tetap ditetapkan sendiri).
   Member → advisor sesuai kode; titik tanpa kode member (ACC survey, mapping) → advisor dari member terdekat di kelompok yang sesuai. */
const ADV_KNOWN={'ARI JAMAIN':'ARI','EKO MARDIANTO':'EKO','ADIL MAKMUR':'ADIL','DIONAL OVALDI':'DION','BAMBANG':'BAMBANG','MUHAMMAD MUNDA':'MUNDA','DENNY WAHYU':'DENI','FITRAH ROMADONI':'FITRAH','WELLY HAMDARTO':'WELLY','JONNY':'JONI'};
const ADV_GROUP={REG:'Reguler',H5A:'Khusus 5A (Horeka)',KLIK:'Klik only'};
const kelKey=s=>{const k=String(s??'').toUpperCase().replace(/[^A-Z]/g,'');return(typeof FIX_KEL!=='undefined'&&FIX_KEL[k])?FIX_KEL[k].replace(/[^A-Z]/g,''):k};
function advCode(name){const n=String(name).toUpperCase().replace(/\s+/g,' ').trim();return ADV_KNOWN[n]||n.split(' ')[0]}
function advGroup(t){t=String(t).toUpperCase();return/5A|HOREKA/.test(t)?'H5A':/KLIK/.test(t)?'KLIK':'REG'}
/* workbook (SheetJS) → {v,a:[{k,n,g,w}],kel:[…],m:[[kode,iAdvisor,lat,lng,iKel]]} · null bila bukan file pembagian advisor */
function parsePicWorkbook(wb){const a=[],kel=[],kix={},m=[],seen=new Set();
  for(const sn of wb.SheetNames){const A=XLSX.utils.sheet_to_json(wb.Sheets[sn],{header:1,raw:true,defval:null,blankrows:false});
    if(!/^\s*Wilayah\s*:/i.test(String((A[1]||[])[0]||'')))continue;
    const hi=A.findIndex((r,i)=>i<10&&r&&r.some(c=>U(c)==='MEMBER')&&r.some(c=>U(c)==='KOORDINAT'));if(hi<0)continue;
    const head=String((A[0]||[])[0]||sn),wil=String((A[1]||[])[0]||'').replace(/^\s*Wilayah\s*:\s*/i,'');const nm=head.replace(/\(.*$/,'').trim()||sn;
    const ai=a.length;a.push({k:advCode(nm),n:nm,g:advGroup(head),w:wil});const h=A[hi];const iM=h.findIndex(c=>U(c)==='MEMBER'),iC=h.findIndex(c=>U(c)==='KOORDINAT'),iK=h.findIndex(c=>U(c)==='KELURAHAN');
    for(let i=hi+1;i<A.length;i++){const r=A[i];if(!r||r[iM]==null||r[iM]==='')continue;const code=U(r[iM]);if(seen.has(code))continue;seen.add(code);
      const c=parseCoord(r[iC]);const kk=iK>=0?kelKey(r[iK]):'';let ki=-1;if(kk){if(kix[kk]==null){kix[kk]=kel.length;kel.push(kk)}ki=kix[kk]}
      m.push([code,ai,c?+c.lat.toFixed(5):null,c?+c.lng.toFixed(5):null,ki])}}
  return a.length&&m.length?{v:1,a,kel,m}:null}
/* indeks pencarian */
let PICX=null;
function setPicmap(j){if(!j||!Array.isArray(j.a)||!Array.isArray(j.m)){PICX=null;return}if(PICX&&PICX.src===j)return;
  const by={},grp={},kv={};for(const g of Object.keys(ADV_GROUP)){grp[g]={lat:[],lng:[],ai:[]};kv[g]={}}
  for(const [code,ai,lat,lng,ki] of j.m){const ad=j.a[ai];if(!ad)continue;by[code]=ai;const G=grp[ad.g]||grp.REG;
    if(lat!=null&&lng!=null){G.lat.push(lat);G.lng.push(lng);G.ai.push(ai)}const k=ki>=0?j.kel[ki]:'';if(k){const t=kv[ad.g]||kv.REG;(t[k]=t[k]||{})[ai]=(t[k][ai]||0)+1}}
  for(const g in grp){const G=grp[g];G.lat=Float64Array.from(G.lat);G.lng=Float64Array.from(G.lng);G.ai=Int16Array.from(G.ai)}
  PICX={src:j,a:j.a,by,grp,kv};j.a.forEach(ad=>{if(typeof PIC_NAME!=='undefined'&&!PIC_NAME[ad.k])PIC_NAME[ad.k]=title(ad.n)})}
/* advisor terdekat: 9 member terdekat dalam 5 km (bobot 1/jarak), lalu terdekat ≤ 25 km */
function nearAdv(G,c){const n=G.lat.length;if(!n)return-1;const kx=Math.cos(c.lat*Math.PI/180)*111.32,ky=110.57;const best=[];let far=-1,fd=1e9;
  for(let i=0;i<n;i++){const dx=(G.lng[i]-c.lng)*kx,dy=(G.lat[i]-c.lat)*ky,d=Math.sqrt(dx*dx+dy*dy);if(d<fd){fd=d;far=G.ai[i]}
    if(d<=5){if(best.length<9){best.push([d,G.ai[i]]);best.sort((x,y)=>x[0]-y[0])}else if(d<best[8][0]){best[8]=[d,G.ai[i]];best.sort((x,y)=>x[0]-y[0])}}}
  if(best.length){const v={};best.forEach(([d,ai])=>v[ai]=(v[ai]||0)+1/(d+.05));return+Object.entries(v).sort((x,y)=>y[1]-x[1])[0][0]}
  return fd<=25?far:-1}
/* kelompok advisor untuk titik tanpa kode member */
function picGroup(e){if(e.cat==='KLIK'||e.src==='SLP')return'KLIK';return(fuOf(e.id).seg||e.seg)==='HOREKA'?'H5A':'REG'}
/* PIC hasil Excel untuk satu entitas project → {k, how} ; k '' bila tidak bisa ditentukan */
function excelPic(e){if(!PICX)return{k:'',how:''};const code=e.code?U(e.code):'';if(code&&PICX.by[code]!=null)return{k:PICX.a[PICX.by[code]].k,how:'kode member'};
  const g=picGroup(e),c=coordOf(e);if(c){const ai=nearAdv(PICX.grp[g],c);if(ai>=0)return{k:PICX.a[ai].k,how:'titik koordinat'}}
  const t=PICX.kv[g][kelKey(e.kelRaw||e.kel)];if(t){const ai=+Object.entries(t).sort((x,y)=>y[1]-x[1])[0][0];return{k:PICX.a[ai].k,how:'kelurahan'}}
  return{k:'',how:''}}
/* terapkan ke project (kecuali Loyalty November) — PIC manual di follow-up tetap lebih kuat (lihat picOf) */
function applyExcelPic(){setPicmap(S.raw.picmap);if(!PICX)return;const done=new Set();
  for(const e of [...D.M.slp.rows,...D.M.map.rows,...D.M.svy.rows,...D.M.lms.rows]){if(done.has(e))continue;done.add(e);
    if(e.sv===undefined)e.sv=e.src==='MAP'||e.src==='SVY'?e.pic:'';if(e.picFile===undefined)e.picFile=e.src==='MAP'||e.src==='SVY'?'':e.pic;
    if(e.src==='MAP'&&MAP_PIC[e.wil]){e.pic=MAP_PIC[e.wil];e.picHow='wilayah '+title(e.wil);continue}
    const r=excelPic(e);e.pic=r.k||e.picFile||'';e.picHow=r.k?r.how:(e.pic?'file project':'')}}
