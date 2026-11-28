'use strict';
/* ===== Project datasets (4 file Drive) ===== */
// PIC target loyalty Nov 2026 (ditetapkan user 18 Nov 2026)
const LOY_PIC={BJ8059:'JONI',KLX8Q1:'JONI',HV0064:'JONI',JD6074:'JONI',HB5396:'JONI',A19915:'WELLY',JA4341:'WELLY',JU0645:'WELLY',EX3327:'WELLY',BF0264:'ARI',AD9326:'ARI','99861':'ARI',DQ0069:'ARI',D53470:'BAMBANG',Y58324:'BAMBANG',KL1QHQ:'BAMBANG',KL4KSP:'AHMAD',JM1724:'AHMAD',JP5563:'RINO',KL9O69:'RINO',C40469:'RINO','284691':'RINO',GD7459:'RINO'};
const PIC_NAME={ARI:'Ari Jamain'};
// Disinkronkan dengan peta My Maps "PROJECT NOVEMBER 2026" (terakhir 20 Nov 2026, sinkron ke-2): baris yang tidak ada di peta dihilangkan dari project.
// lms = kode member Loyalty MM Sleepers yang tidak ada di lapisan KLIK_/REG_/HOR_ Loyalty Sleeper · svy = pendaftar ACC yang dihapus dari lapisan BELUM AKTIVASI.
const MYMAPS_OUT={lms:new Set(["BR1908", "DB4571", "ER3689", "FE0220", "FJ4171", "FX8897", "GD7437", "GF6344", "GJ2105", "JH3070", "JH3117", "JM1680", "JM1697", "JP9710", "JU0484", "JV4622", "KLI2BG", "KLQ1K6", "KLRH9N", "KLZOHM"]),svy:new Set(["SVY-i2athy", "SVY-1i86aun", "SVY-16suxkf", "SVY-z2q069", "SVY-10vriv4", "SVY-1swo5hp", "SVY-bvijj9", "SVY-ra3aoi"])};
// PIC Project 2 · Mapping per wilayah (ditetapkan user 19 Nov 2026)
const MAP_PIC={'AIR PUTIH':'EKO','AIR DINGIN':'DION'};const picLbl=p=>PIC_NAME[U(p)]||title(p);
function parseLoyalty(ds){
  const out={members:[],asOf:null,period:'',ok:false};if(!ds||!ds.sheets)return out;
  const L=ds.sheets.LIST||[],A=ds.sheets.SALES_ALL||[],Rk=ds.sheets.SALES_ROKOK||[];
  const hi=findHdrRow(L,[/KODE MEMBER/]);if(hi<0)return out;const h=L[hi];
  const cSep=hdrIdx(h,/SEPTEMBER|^\d+ ?- ?\d+ /),cT=hdrIdx(h,/PEMBULATAN TARGET|TARGET/),cH=hdrIdx(h,/HADIAH/);
  out.period=cSep>=0?String(h[cSep]):'Bulan pembanding';
  const salesMap=aoa=>{const m={};const r=findHdrRow(aoa,[/KODE/,/GROSS/]);if(r<0)return m;const hh=aoa[r];
    const ix={sub:hdrIdx(hh,/SUB OUTLET/),kode:hdrIdx(hh,/^KODE$/),kunj:hdrIdx(hh,/KUNJUNGAN/),struk:hdrIdx(hh,/STRUK/),gross:hdrIdx(hh,/GROSS/),last:hdrIdx(hh,/TERAKHIR/)};
    for(let i=r+1;i<aoa.length;i++){const row=aoa[i];if(!row||row[ix.kode]==null||row[ix.kode]==='')continue;m[U(row[ix.kode])]={sub:row[ix.sub],kunj:num(row[ix.kunj]),struk:num(row[ix.struk]),gross:num(row[ix.gross]),last:toDate(row[ix.last])}}return m};
  const SA=salesMap(A),SR=salesMap(Rk);let asOf=null;Object.values(SA).forEach(s=>{if(s.last&&(!asOf||s.last>asOf))asOf=s.last});asOf=asOf||TODAY;out.asOf=asOf;
  const dim=new Date(asOf.getFullYear(),asOf.getMonth()+1,0).getDate(),el=asOf.getDate();out.dim=dim;out.elapsed=el;
  for(let i=hi+1;i<L.length;i++){const row=L[i];if(!row||row[0]==null||row[0]==='')continue;if(/TOTAL/i.test(String(row[0])))break;
    const kode=U(row[0]);const a=SA[kode]||{},rk=SR[kode]||{};const sepG=num(row[cSep]),target=num(row[cT]),hadiah=cH>=0?num(row[cH]):0;
    const all=a.gross||0,rok=rk.gross||0,ach=all-rok,proj=el>0?ach/el*dim:0,gapDay=(dim-el)>0?Math.max(0,target-ach)/(dim-el):0,ratio=target?proj/target:0;
    let st,stc;if(ach<=0){st='Belum belanja';stc='crit'}else if(ratio>=1){st='On track';stc='good'}else if(ratio>=.8){st='Hampir';stc='warn'}else if(ratio>=.5){st='Perlu dorongan';stc='serious'}else{st='Kritis';stc='crit'}
    const m=D.byCode[kode];const sub=a.sub||(m&&m.sub)||'';
    out.members.push(ent({src:'LOY',code:String(row[0]),name:String(row[1]||''),sub,seg:segFromSub(sub)||segFromText(row[1]),m,pic:LOY_PIC[kode]||'',
      sepG,target,hadiah,all,rok,ach,proj,gapDay,ratio,achPct:target?ach/target:0,st,stc,kunj:a.kunj||0,struk:a.struk||0,last:a.last||null,rokShare:all?rok/all:0,chg:sepG?(proj/sepG-1):0}))}
  out.ok=out.members.length>0;return out;
}
function parseSleepers(ds){
  const out={rows:[],ok:false};const A=ds&&ds.sheets&&ds.sheets.main;if(!A)return out;
  const hi=findHdrRow(A,[/MEMBER/,/KUNJ/]);if(hi<0)return out;const h=A[hi];
  const ix={sub:hdrIdx(h,/^SUB/),mem:hdrIdx(h,/^MEMBER$|KODE MEMBER/),nama:hdrIdx(h,/NAMA/),alamat:hdrIdx(h,/ALAMAT/),kel:hdrIdx(h,/KELURAHAN/),kec:hdrIdx(h,/KECAMATAN/),hp:hdrIdx(h,/NO HP|HP/),segm:hdrIdx(h,/SEGMENTASI/),kgo:hdrIdx(h,/DARI GO/),last:hdrIdx(h,/KUNJ TERAKHIR/),coord:hdrIdx(h,/KOORDINAT/),upt:hdrIdx(h,/^UPT|UPDATE/),pic:hdrIdx(h,/^PIC|ADVISOR/)};
  const cut=new Date(2026,9,1);
  for(let i=hi+1;i<A.length;i++){const r=A[i];if(!r||r[ix.mem]==null||r[ix.mem]==='')continue;const code=String(r[ix.mem]);const m=D.byCode[U(code)];
    const l1=toDate(r[ix.last]),l2=ix.upt>=0?toDate(r[ix.upt]):null;let last=(l1&&l2)?(l2>l1?l2:l1):(l1||l2);
    // master history may know a newer purchase
    if(m){const lb=lastBuy(m);if(lb&&(!last||lb>last))last=lb}
    const back=!!(last&&last>=cut);const sub=r[ix.sub]||(m&&m.sub)||'';
    out.rows.push(ent({src:'SLP',code,name:String(r[ix.nama]||''),addr:r[ix.alamat]||'',kel:title(r[ix.kel]||''),kec:title(r[ix.kec]||''),phone:phone62(r[ix.hp]),coord:parseCoord(r[ix.coord]),tier:r[ix.segm]||'',kgo:num(r[ix.kgo]),last,days:last?daysBetween(last,TODAY):null,back,sub,seg:segFromSub(sub)||'REGULER',pic:ix.pic>=0?U(r[ix.pic]||''):'',m}))}
  out.ok=out.rows.length>0;return out;
}
/* Project 5 · Loyalty MM Sleepers (promo 3–31 Nov 2026, 1x/member, belanja ≥ Rp1 jt → 10.000 poin IGR) */
const LMS={start:3,min:1e6,poin:10000,period:'2026-11',JENIS:['1 BULAN','2 BULAN','3 BULAN','4 BULAN','LEBIH DARI 4 BULAN']};
const lmsLabel=e=>!e.back?'Belum kembali':e.eligible?'Kembali ≥ Rp1 jt · 10.000 poin':'Kembali < Rp1 jt';
function lmsNov(m){const q=D.periods.indexOf(LMS.period);if(!m||q<0)return{g:0,s:0,d:0};const i=m.i*D.P+q;return{g:D.G[i]||0,s:D.STK[i]||0,d:D.LD[i]||0}}
function parseLms(ds){
  const out={rows:[],ok:false};const A=ds&&ds.sheets&&ds.sheets.main;if(!A)return out;
  const hi=findHdrRow(A,[/MEMBER/,/JENIS SLEEPER/]);if(hi<0)return out;const h=A[hi];
  const ix={sub:hdrIdx(h,/^SUB/),mem:hdrIdx(h,/^MEMBER$|KODE MEMBER/),nama:hdrIdx(h,/NAMA/),alamat:hdrIdx(h,/ALAMAT/),kel:hdrIdx(h,/KELURAHAN/),kec:hdrIdx(h,/KECAMATAN/),hp:hdrIdx(h,/NO HP|HP/),segm:hdrIdx(h,/SEGMENTASI/),kgo:hdrIdx(h,/DARI GO/),last:hdrIdx(h,/KUNJ TERAKHIR/),jenis:hdrIdx(h,/JENIS SLEEPER/),coord:hdrIdx(h,/KOORDINAT/),pic:hdrIdx(h,/^PIC|ADVISOR/)};
  const seen={};
  for(let i=hi+1;i<A.length;i++){const r=A[i];if(!r||r[ix.mem]==null||r[ix.mem]==='')continue;const code=String(r[ix.mem]);const m=D.byCode[U(code)]||null;
    const lastBefore=toDate(r[ix.last]);const nv=lmsNov(m);const back=nv.d>=LMS.start&&nv.g>0;const sub=String(r[ix.sub]??(m&&m.sub)??'');
    let id=m?m.id:'X-'+safeId(code);if(seen[id])id+='-L';seen[id]=1;
    out.rows.push(ent({id,src:'LMS',code,name:String(r[ix.nama]||''),addr:r[ix.alamat]||'',kel:title(r[ix.kel]||''),kec:title(r[ix.kec]||''),phone:phone62(r[ix.hp]),coord:parseCoord(r[ix.coord]),tier:r[ix.segm]||'',
      kgo:num(r[ix.kgo]),lastBefore,last:back?new Date(2026,10,nv.d):lastBefore,days:lastBefore?daysBetween(lastBefore,TODAY):null,jenis:U(r[ix.jenis]||'').replace(/\s+/g,' '),
      novGross:nv.g,novStruk:nv.s,novLastDay:nv.d,back,eligible:back&&nv.g>=LMS.min,sub,seg:segFromSub(sub)||'REGULER',pic:ix.pic>=0?U(r[ix.pic]||''):'',m}))}
  out.ok=out.rows.length>0;return out;
}
const CAT={BERHASIL:{l:'Berhasil get member',c:'#1baf7a'},KLIK:{l:'Belanja sedikit / toko kecil → Klik',c:'#eb6834'},REVISIT:{l:'Pemilik tidak di tempat / pending',c:'#2a78d6'},KOMP:{l:'Setia ke grosir terdekat / sales',c:'#6250d6'},JAUH:{l:'Jauh / tidak ada kendaraan',c:'#0e9aa7'},DAFTAR:{l:'Sudah daftar, belum ambil kartu',c:'#c2185b'},SUDAH:{l:'Sudah member (aktif/tidur/pindah)',c:'#eda100'},LAIN:{l:'Lainnya',c:'#a8a69f'}};
const CAT_ORDER=['BERHASIL','KLIK','REVISIT','KOMP','JAUH','DAFTAR','SUDAH','LAIN'];
function catOf(get,al){if(/^BERHASIL/.test(U(get)))return'BERHASIL';const a=String(al||'').toLowerCase();
  if(/sudah\s*(men)?daftar|sudah isi form|kartu belum (di)?ambil|belum ambil kartu/.test(a))return'DAFTAR';
  if(/sudah\s*(jadi\s*)?(member|ada\s*m|punya|bergabung|daftar|mempunyai)|punya member|memiliki member|ada member|menggunakan member|member (tidur|klik|aktif)|cabang/.test(a))return'SUDAH';
  if(/sedikit|sedikt|kecil|sepi|modal|gak banyak|tidak banyak|ga banyak|perputaran|sekali 2 bulan/.test(a))return'KLIK';
  if(/tidak di ?tempat|tdk di ?tempat|tidak ada di toko|tidak di toko|pending|pikir|fikir|runding|pertimbang|kabar|luar kota|tidur|ktp|konfirmasi|belum tau/.test(a))return'REVISIT';
  if(/jauh|kendaraan|lansia|transport|ongkos ke|tidak bisa ke (sana|igr|indogrosir)/.test(a))return'JAUH';
  if(/grosir|sales|pasar|toko china|antri|kecewa/.test(a))return'KOMP';return'LAIN'}
const FIX_KEL={PERHATIANMARPOYAN:'PERHENTIAN MARPOYAN',PERHETIANMARPOYAN:'PERHENTIAN MARPOYAN',TENGKERANGBARAT:'TANGKERANG BARAT',TANGERANGBARAT:'TANGKERANG BARAT',TANGERANGTENGAH:'TANGKERANG TENGAH',TELUKKINIDAI:'TELUK KENIDAI',SIMLANGTIGA:'SIMPANG TIGA',PANDAIJAYA:'PANDAU JAYA',AIRDINGIN:'AIR DINGIN',AIRPUTIH:'AIR PUTIH'};
function parseMapping(ds){
  const out={rows:[],ok:false};const A=ds&&ds.sheets&&ds.sheets.main;if(!A)return out;
  const hi=findHdrRow(A,[/SURVEYOR/,/GET MEMBER/]);if(hi<0)return out;const h=A[hi];
  const ix={ts:hdrIdx(h,/TIMESTAMP|TANGGAL/),sv:hdrIdx(h,/SURVEYOR/),nama:hdrIdx(h,/NAMA/),get:hdrIdx(h,/GET MEMBER/),hp:hdrIdx(h,/NO\.? ?HP/),al:hdrIdx(h,/ALASAN/),kel:hdrIdx(h,/KELURAHAN/),co:hdrIdx(h,/KOORDINAT/),seg:hdrIdx(h,/SEGMEN|SUB OUTLET/)};
  const seen={};const groups={};
  for(let i=hi+1;i<A.length;i++){const r=A[i];if(!r||!r[ix.nama])continue;const sv=U(r[ix.sv]).replace(/\s+/g,' ');const pic=/^ADIL/.test(sv)?'ADIL':sv;
    let kraw=U(r[ix.kel]);const comp=kraw.replace(/[^A-Z]/g,'');if(FIX_KEL[comp])kraw=FIX_KEL[comp];
    const ts=toDate(r[ix.ts]);const co=parseCoord(r[ix.co]);let id='MAP-'+hash([U(r[ix.nama]),iso(ts),co?co.lat.toFixed(5)+','+co.lng.toFixed(5):''].join('|'));while(seen[id])id+='x';seen[id]=1;
    const seg=ix.seg>=0&&r[ix.seg]?(segFromSub(r[ix.seg])||segFromText(r[ix.seg])):segFromText(r[ix.nama]);
    const e=ent({id,src:'MAP',name:String(r[ix.nama]).trim(),pic,ts,get:U(r[ix.get]),phone:phone62(r[ix.hp]),alasan:String(r[ix.al]||'').trim(),cat:catOf(r[ix.get],r[ix.al]),kelRaw:kraw,coord:co,seg});
    out.rows.push(e);const k=kraw.replace(/[^A-Z]/g,'');(groups[k]=groups[k]||{})[kraw]=(groups[k][kraw]||0)+1}
  out.rows.forEach(e=>{const k=e.kelRaw.replace(/[^A-Z]/g,'');const g=groups[k]||{};e.kel=title(Object.entries(g).sort((a,b)=>b[1]-a[1])[0]?.[0]||'');e.wil=k==='AIRDINGIN'?'AIR DINGIN':k==='AIRPUTIH'?'AIR PUTIH':''});
  out.ok=out.rows.length>0;return out;
}
function parseSurvey(ds){
  const out={rows:[],ok:false};const A=ds&&ds.sheets&&ds.sheets.main;if(!A)return out;
  const hi=findHdrRow(A,[/NAMA/,/ALAMAT/,/SURVEYOR/],15);if(hi<0)return out;const h=A[hi];const amb=h.map((v,i)=>/SUDAH AMBIL/.test(U(v))?i:-1).filter(i=>i>=0);
  const ix={no:hdrIdx(h,/^NO$/),nama:hdrIdx(h,/^NAMA/),alamat:hdrIdx(h,/ALAMAT/),kel:hdrIdx(h,/KELURAHAN/),kec:hdrIdx(h,/KECAMATAN/),hp:hdrIdx(h,/NO HP/),tgl:hdrIdx(h,/TGL DAFTAR|TANGGAL DAFTAR/),ket:hdrIdx(h,/^KETERANGAN/),sv:hdrIdx(h,/^SURVEYOR/),st:hdrIdx(h,/^STATUS/),acc:hdrIdx(h,/^ACC$/),tolak:hdrIdx(h,/TOLAK/),ambT:amb[0]??-1,ambNo:amb[0]!=null?amb[0]+1:-1,ambF:amb[1]??-1,ket2:hdrIdx(h,/^KET$/),ppob:hdrIdx(h,/PPOB/),co:hdrIdx(h,/KOORDINAT/),seg:hdrIdx(h,/SEGMEN|SUB OUTLET/)};
  const seen={};
  for(let i=hi+1;i<A.length;i++){const r=A[i];if(!r||!r[ix.nama]||r[ix.no]==null||r[ix.no]==='')continue;
    const parts=String(r[ix.sv]||'').split('/');const pic=U(parts[0]);const accV=U(r[ix.acc]);const acc=accV!==''&&accV!=='0'&&accV!=='NO';const tolak=num(r[ix.tolak])>0;const okSt=U(r[ix.st])!=='NO';
    const activated=(ix.ambNo>=0&&r[ix.ambNo]!=null&&String(r[ix.ambNo]).trim()!=='')||(ix.ambT>=0&&r[ix.ambT]!=null&&r[ix.ambT]!==''&&r[ix.ambT]!==0)||(ix.ambF>=0&&num(r[ix.ambF])>0);
    const note=[r[ix.ppob],r[ix.ket2]].filter(v=>v&&v!==0&&v!=='0').join(' · ');const seg=ix.seg>=0&&r[ix.seg]?(segFromSub(r[ix.seg])||segFromText(r[ix.seg])):segFromText(note,r[ix.nama]);const daftar=toDate(r[ix.tgl]);
    let id='SVY-'+hash([U(r[ix.nama]),iso(daftar),phone62(r[ix.hp])].join('|'));while(seen[id])id+='x';seen[id]=1;
    out.rows.push(ent({id,src:'SVY',name:String(r[ix.nama]).trim(),addr:r[ix.alamat]||'',kel:title(r[ix.kel]||''),kec:title(r[ix.kec]||''),phone:phone62(r[ix.hp]),daftar,jenis:U(r[ix.ket]),pic,acc,tolak,okSt,activated,pending:acc&&!tolak&&okSt&&!activated,age:daftar?daysBetween(daftar,TODAY):null,note,size:/\/K\b/i.test(note)?'KECIL':/\/B\b/i.test(note)?'BESAR':'',coord:parseCoord(r[ix.co]),seg}))}
  out.ok=out.rows.length>0;return out;
}
/* unified entity */
function ent(o){const m=o.m||(o.code?D.byCode[U(o.code)]:null);o.m=m||null;if(!o.id)o.id=m?m.id:('X-'+safeId(o.code||hash(o.name)));
  if(m){if(!o.coord)o.coord=m.coord;if(!o.phone)o.phone=m.phone;if(!o.kel)o.kel=title(m.vil);if(!o.kec)o.kec=title(m.dist);if(!o.addr)o.addr=m.addr;if(!o.code)o.code=m.code}
  return o}
/* accessors with follow-up overlay */
const segOf=e=>fuOf(e.id).seg||e.seg||'REGULER';
function lastRkm(code){const l=D.rkmBy[U(code)];return l&&l.length?l[l.length-1]:null}
/* Kunjungan RKM sejak 1 Nov (pemilik interpretasi: index ini; tampilan & ekspor memakai visitOf).
   Cocok lewat nomor member. Baris tanpa nomor yang sah (AKTIVASI "_", "0", "-") dicocokkan lewat nama pemilik
   (bagian sebelum tanda kurung) — hanya untuk toko yang memang belum punya kode (ACC survey, mapping).
   Baris uji "Tes" diabaikan. Hanya Tanggal RKM 1 Nov s/d RKM terakhir (tidak lewat hari ini) yang dihitung. */
const RKM_FROM='2026-11-01';
const nmKey=s=>U(s).replace(/^[_*\s]+/,'').replace(/[^A-Z0-9]/g,'');
const ownKey=s=>nmKey(String(s||'').split('(')[0]);
const okCode=c=>/^[A-Z0-9]{5,6}$/.test(c)&&!/^0+$/.test(c);
let _vix=null;
function visitIdx(){if(_vix&&_vix.src===D.rkm)return _vix;const byCode={},byName={};let last='';
  const today=iso(TODAY);for(const r of D.rkm){if(!/^\d{4}-\d{2}-\d{2}$/.test(r.date||'')||r.date<RKM_FROM||r.date>today||/^TES(T|TING)?$/.test(nmKey(r.name)))continue;if(r.date>last)last=r.date;const c=U(r.code);
    if(okCode(c))(byCode[c]=byCode[c]||[]).push(r);const k=ownKey(r.name);if(k.length>=4)(byName[k]=byName[k]||[]).push(r)}
  return _vix={src:D.rkm,byCode,byName,last}}
/* Catatan RKM jadi satu kalimat: ringkasan yang sudah disiapkan, atau kalimat pertama Keterangan, atau kendala tanpa nomor */
function rkmBrief(r){if(!r)return'';if(r.sum)return r.sum;
  let t=String(r.notes||'').replace(/\s+/g,' ').replace(/^(rkm\s*rokok|program\s*roya?lt[iy]|info|kendala\s*(beliau|ybs|member)?)\s*:?\s*/i,'').trim();
  if(t){t=t.split(/(?<=[.!?])\s|\s*\n/)[0];if(t.length>120)t=t.slice(0,117).replace(/\s+\S*$/,'')+'…';return t[0].toUpperCase()+t.slice(1)}
  return String(r.issues||'').split(',').map(x=>x.replace(/^\s*\d+\.\s*/,'').trim()).filter(Boolean).join(', ')}
/* toko kecil di Project Klik: hanya kunjungan tim Klik + SPV Klik yang dihitung */
/* Jenis RKM yang sesuai tiap project: kunjungan dengan jenis ini diutamakan; bila tidak ada, kunjungan jenis lain tetap dihitung */
const RKM_PREF={SVK:/AKTIVASI/,LOY:/LOYALTY|REGULER/,SVY:/AKTIVASI/,MAP:/AKTIVASI/,LMS:/TIDUR/,SLP:/PROJECT KLIK|BELUM BELANJA|TIDUR/,KTR:/PROJECT KLIK|TURUN|BELUM BELANJA|REGULER/};
function visitOf(e){const x=visitIdx();const c=U(e.code);const vis=e.klik?D.M.klikVis:null;const pref=RKM_PREF[e.src]||null;
  const pick=l=>{if(!l)return null;let any=null;for(let i=l.length-1;i>=0;i--){const r=l[i];if(vis&&!vis.has(U(r.pic)))continue;if(!pref||pref.test(U(r.type)))return r;if(!any)any=r}return any};
  if(c&&x.byCode[c])return pick(x.byCode[c]);
  const nm=x.byName[ownKey(e.name)];
  if(c)return nm?pick(nm.filter(r=>lev1(U(r.code),c))):null; // nomor member salah ketik 1 digit + nama pemilik sama
  // toko tanpa nomor: kunjungan yang bernomor member sah hanya diakui bila nama lengkap (pemilik + toko) persis sama
  const own=l=>l&&l.filter(r=>!okCode(U(r.code))||nmKey(r.name)===nmKey(e.name));
  return pick(own(nm))||pick(own(fuzzyName(x,e.name)))}
/* jarak edit ≤ 1 (salah ketik satu huruf/angka) */
function lev1(a,b){if(a===b)return true;const la=a.length,lb=b.length;if(Math.abs(la-lb)>1)return false;let i=0,j=0,d=0;
  while(i<la&&j<lb){if(a[i]===b[j]){i++;j++;continue}if(++d>1)return false;if(la>lb)i++;else if(lb>la)j++;else{i++;j++}}return d+(la-i)+(lb-j)<=1}
/* toko tanpa nomor member: semua kata nama pemilik (≥2 kata) ada di nama RKM, boleh beda 1 huruf per kata panjang */
const nameToks=s=>U(String(s||'').split('(')[0]).split(/[^A-Z0-9]+/).filter(t=>t.length>=2);
function fuzzyName(x,name){const t=nameToks(name);if(t.length<2)return null;if(!x.toks){x.toks=Object.entries(x.byName).map(([k,l])=>[U(l[0].name).split(/[^A-Z0-9]+/).filter(Boolean),l])}
  const eq=(a,b)=>a===b||(a.length>=5&&b.length>=5&&lev1(a,b));let best=null;
  for(const [rt,l] of x.toks){if(!eq(t[0],rt[0]||''))continue;if(t.every(w=>rt.some(z=>eq(w,z)))){if(best)return null;best=l}}return best}
/* Hapus dari project ACC survey hanya bila RKM AKTIVASI TERAKHIR toko itu tegas "tidak berminat" / menolak.
   Kalimat ragu (sepertinya, mungkin, belum berminat, masih ragu) atau penolakan aplikasi Klik/online TIDAK dihitung. */
const TOLAK_RE=/\b(tidak|tdk|gak|ga|nggak|enggak|ngga)\s*(ber)?minat\b|\bmenolak\b|\btidak\s+(mau|ingin)\s+(ambil|jadi|aktivasi|member|daftar|ke\s+(igr|indogrosir))|\btidak\s+tertarik\b|\bbatal\s+(jadi\s+)?(member|daftar)/i;
const HEDGE_RE=/sepertinya|kayaknya|kelihatannya|mungkin|belum|masih|ragu|nanti|klik|online|aplikasi|apk/i;
function fixTolak(r){if(!r||!/AKTIVASI/.test(U(r.type)))return false;
  return String(r.notes||'').split(/[.!?\n;()]+/).some(t=>TOLAK_RE.test(t)&&!HEDGE_RE.test(t))}
function lastAktivasi(e){const x=visitIdx();const c=U(e.code);const l=(c&&okCode(c)?x.byCode[c]:x.byName[ownKey(e.name)])||[];for(let i=l.length-1;i>=0;i--)if(/AKTIVASI/.test(U(l[i].type)))return l[i];return null}
const picOf=e=>U(fuOf(e.id).pic||e.pic||(e.code&&lastRkm(e.code)?.pic)||'');
const coordOf=e=>parseCoord(fuOf(e.id).coord)||e.coord||null;
const phoneOf=e=>phone62(fuOf(e.id).phone)||e.phone||'';
function statusOf(e){const f=fuOf(e.id);if(f.status)return f.status;if(e.src==='SLP'&&e.back)return'Berhasil';if(e.src==='LMS'&&e.eligible)return'Berhasil';if(e.src==='MAP'&&e.cat==='BERHASIL')return'Berhasil';return'Belum dihubungi'}
/* ===== Sudah belanja · Project 2, 3, 5, 7 =====
   Dicek dari data sales terbaru (upload sales per member maupun per struk → D.G / D.LD), jadi ikut berubah tiap ada update sales.
   Toko dicocokkan ke member lewat: kode member → No HP sama → nama lengkap (pemilik + toko) persis → nama pemilik sama dengan
   member BARU (daftar ≥ 7 hari sebelum tgl survey/daftar, atau kode baru dari file sales) dan hanya bila calonnya tepat satu.
   Dihitung "sudah belanja" bila tanggal belanja terakhir ≥ acuan: P2 tgl survey · P3 tgl daftar · P5 3 Nov (awal promo) · P7 1 Okt. */
const BUY_SRC={MAP:'Project 2',SVY:'Project 3',LMS:'Project 5',SVK:'Project 7'};
let _bix=null;
function buyIdx(){if(_bix&&_bix.n===D.mem.length)return _bix;const ph={},full={},own={};
  for(const m of D.mem){const p=phone62(m.phone||m.phoneRaw);if(p)(ph[p]=ph[p]||[]).push(m);const f=nmKey(m.name);if(f.length>=5)(full[f]=full[f]||[]).push(m);const o=ownKey(m.name);if(o.length>=5)(own[o]=own[o]||[]).push(m)}
  return _bix={n:D.mem.length,ph,full,own}}
function buyRef(e){if(e.src==='LMS')return new Date(2026,10,LMS.start);if(e.src==='SVK')return new Date(2026,9,1); // P7: Excel survey tanpa tanggal → acuan 1 Okt
  const d=e.src==='SVY'?e.daftar:e.src==='MAP'?e.ts:null;return d||new Date(2026,10,1)}
function buyMem(e){if(e.m)return{m:e.m,how:e.code?'kode member':'No HP'};const c=U(e.code||'');if(c&&D.byCode[c])return{m:D.byCode[c],how:'kode member'};const x=buyIdx();
  const one=l=>l&&l.length===1?l[0]:null;const ph=phoneOf(e);if(ph&&x.ph[ph]){const m=one(x.ph[ph])||x.ph[ph].slice().sort((a,b)=>(lastBuy(b)||0)-(lastBuy(a)||0))[0];return{m,how:'No HP'}}
  if(/\(/.test(e.name||'')){const m=one(x.full[nmKey(e.name)]);if(m)return{m,how:'nama toko'}}
  const ref=buyRef(e),lim=new Date(+ref-7*864e5);const shop=n=>{const t=/\(([^)]*)/.exec(String(n||''));return t?nameToks(t[1].replace(/\b(TK|TOKO|KD|KEDAI|WR|WARUNG|KIOS)\b\.?/gi,'')).filter(w=>w.length>=3):[]};const es=shop(e.name);
  // nama pemilik sama saja belum cukup: No HP keduanya (bila ada) harus sama, dan nama toko (bila keduanya ada) harus punya kata yang sama
  const nw=(x.own[ownKey(e.name)]||[]).filter(m=>(!m.master||(toDate(m.reg)&&toDate(m.reg)>=lim))&&!(ph&&phone62(m.phone)&&phone62(m.phone)!==ph)&&!(es.length&&shop(m.name).length&&!shop(m.name).some(w=>es.includes(w))));const m=one(nw);return m?{m,how:'nama pemilik (member baru)'}:null}
function buyOf(e){if(!e||!BUY_SRC[e.src])return null;const k=D.G;if(e._buy&&e._buy.k===k&&e._buy.n===D.mem.length&&e._buy.s===D.salesVer)return e._buy.v;
  let v=null;const b=buyMem(e);if(b&&b.m){const lb=lastBuy(b.m);if(lb&&lb>=buyRef(e)){const q=D.periods.length-1;v={m:b.m,code:b.m.code,date:lb,how:b.how,gross:D.G[b.m.i*D.P+q]||0,struk:D.STK[b.m.i*D.P+q]||0}}}
  e._buy={k,n:D.mem.length,s:D.salesVer,v};return v}
const buyTxt=v=>v?`Sudah belanja ${fmtDs(v.date)} · ${v.code}`:'';
function buyTag(e){const v=buyOf(e);if(!v)return'';return`<div><span class="tag good" data-tip="Dari data sales terbaru: belanja terakhir ${esc(fmtD(v.date))} (${esc(periodLabel(D.periods.length-1,true))}: ${esc(fmtS(v.gross))} · ${v.struk} struk). Dicocokkan lewat ${esc(v.how)}: ${esc(v.code)} · ${esc(v.m.name)}">🛒 ${esc(buyTxt(v))}</span></div>`}
/* Project 7 hanya berisi toko yang (permintaan pengguna 28 Nov):
   · BELUM jadi member — kode member ada di CMS, atau No HP / nama toko cocok dengan member di data dashboard
   · sudah ada surveyornya
   · tidak dobel — No HP sama, atau nama pemilik + nama toko sama → survey terbaru yang disimpan
   · dalam radius 15 km dari Indogrosir Pekanbaru (titik kosong / tidak masuk akal ikut dikeluarkan) */
const IGR_PKU={lat:0.4517210418422283,lng:101.41764256864913},SVK_KM=15;
function kmFrom(a,b){const R=6371,t=x=>x*Math.PI/180;const dl=t(b.lat-a.lat),dg=t(b.lng-a.lng);const h=Math.sin(dl/2)**2+Math.cos(t(a.lat))*Math.cos(t(b.lat))*Math.sin(dg/2)**2;return 2*R*Math.asin(Math.sqrt(h))}
function svkClean(o){const all=o.rows;const memOf=e=>e.code||(e.m&&e.m.code)||((typeof buyMem==='function'&&buyMem(e))||{}).m?.code||'';
  const mem=[],nosv=[],far=[],dup=[];let rest=[];
  all.forEach(e=>{const c=memOf(e);const co=e.coord;e.km=co?kmFrom(IGR_PKU,co):null;
    if(c){e.memCode=c;mem.push(e)}else if(!e.sv)nosv.push(e);else if(e.km==null||e.km>SVK_KM)far.push(e);else rest.push(e)});
  rest.sort((a,b)=>(+b.noSurvey||0)-(+a.noSurvey||0));const seen=new Set();
  rest=rest.filter(e=>{const ks=[e.phone&&'p:'+e.phone,e.owner&&e.toko&&'n:'+nmKey(e.owner)+'|'+nmKey(e.toko)].filter(Boolean);if(ks.some(x=>seen.has(x))){dup.push(e);return false}ks.forEach(x=>seen.add(x));return true});
  o.rows=rest;o.drop={mem,nosv,far,dup,total:all.length}}
function memEnt(m){return{id:m.id,src:'MEM',code:m.code,name:m.name,m,coord:m.coord,phone:m.phone,kel:title(m.vil),kec:title(m.dist),addr:m.addr,seg:m.seg,sub:m.sub}}
function entOf(id){if(!id)return null;if(D.M.byId&&D.M.byId[id])return D.M.byId[id];if(id.startsWith('M-')){const m=D.mem.find(x=>x.id===id);return m?memEnt(m):null}return null}

function buildProjects(){
  const raw=S.raw;D.M.loy=parseLoyalty(raw.loyalty);D.M.slp=parseSleepers(raw.sleepers);D.M.map=parseMapping(raw.mapping);D.M.svy=parseSurvey(raw.survey);D.M.svyTolak=[];D.M.svy.rows.forEach(r=>{if(!r.pending)return;const v=lastAktivasi(r);if(fixTolak(v)){r.pending=false;r.tolakRkm=v;D.M.svyTolak.push(r)}});D.M.lms=parseLms(raw.lms);if(D.mapExtra&&D.mapExtra.length){D.M.map.rows=[...D.M.map.rows,...D.mapExtra]}
  D.M.lms.rows=D.M.lms.rows.filter(e=>!MYMAPS_OUT.lms.has(U(e.code)));D.M.svy.rows=D.M.svy.rows.filter(e=>!MYMAPS_OUT.svy.has(e.id));
  applyExcelPic();
  D.M.byId={};[...D.M.loy.members,...D.M.slp.rows,...D.M.map.rows,...D.M.svy.rows,...D.M.lms.rows].forEach(e=>{D.M.byId[e.id]=D.M.byId[e.id]||e});
  D.M.projOf={};const tag=(id,t)=>{(D.M.projOf[id]=D.M.projOf[id]||[]).push(t)};
  D.M.loy.members.forEach(e=>tag(e.id,'Loyalty Targetan'));D.M.slp.rows.forEach(e=>tag(e.id,'Klik · sleeper'));D.M.map.rows.forEach(e=>tag(e.id,e.cat==='KLIK'?'Klik · mapping kecil':'Mapping'));D.M.svy.rows.filter(e=>e.pending).forEach(e=>tag(e.id,'ACC belum aktivasi'));D.M.lms.rows.forEach(e=>tag(e.id,'Loyalty MM Sleepers'));
  D.M.zb=parseZumba(raw.zumba);D.M.zb.rows.forEach(e=>{D.M.byId[e.id]=e;tag(e.id,'Undangan Zumba')});
  D.M.ktr=parseKlikTurun(raw.klikturun);D.M.ktr.rows.forEach(e=>{D.M.byId[e.id]=e;tag(e.id,'Klik · turun Sep→Okt')});
  D.M.svk=parseSvk(raw.svklik);svkLink(D.M.svk.rows);svkClean(D.M.svk);D.M.svk.rows.forEach(e=>{D.M.byId[e.id]=e;tag(e.id,'Survey apps Klik')});
  D.M.kecil=buildKecil();D.M.kecil.forEach(e=>tag(e.id,'Klik · toko kecil'));
  const pics=new Set();D.rkm.forEach(r=>r.pic&&pics.add(U(r.pic)));Object.values(D.M.byId).forEach(e=>e.pic&&pics.add(e.pic));Object.values(S.fu).forEach(f=>f&&f.pic&&pics.add(U(f.pic)));D.M.pics=[...pics].filter(Boolean).sort();
}
/* ===== Project Klik · toko kecil: semua sumber (hasil mapping, ACC survey toko kecil, RKM apa pun yang menyebut toko sepi / modal kurang / belanja sedikit).
   Dikunjungi tim Klik (grup "Klik only" di Excel pembagian advisor) + Ahmad (SPV Klik). */
const KLIK_SPV='AHMAD';
const smallSig=r=>/(^|,\s*)(8\.\s*Toko Sepi|11\.\s*Modal Kurang)/i.test(r.issues||'')||/sedikit|toko kecil|kedai kecil|modal|sepi|\b(toko|kedai|warung|kios|usaha)\b[^.,;]{0,25}\bkecil\b|belanja\w*\s*(pun\s*)?(tidak|gak|nggak)\s*(terlalu\s*)?banyak/i.test(r.notes||'');
function klikPic(e){if(!PICX||!PICX.grp.KLIK)return'';const code=e.code?U(e.code):'';if(code&&PICX.by[code]!=null&&PICX.a[PICX.by[code]].g==='KLIK')return PICX.a[PICX.by[code]].k;
  const c=coordOf(e);if(c){const ai=nearAdv(PICX.grp.KLIK,c);if(ai>=0)return PICX.a[ai].k}return''}
/* ===== Project Klik · member Klik yang belanjanya turun September → Oktober (file "member klik turun belanja okt dari sept") ===== */
function parseKlikTurun(ds){const out={rows:[],ok:false};const A=ds&&ds.sheets&&ds.sheets.main;if(!A)return out;const hi=findHdrRow(A,[/MEMBER/,/SEPT/]);if(hi<0)return out;const h=A[hi];
  const ix={kode:hdrIdx(h,/^MEMBER$|KODE/),nama:hdrIdx(h,/^NAMA/),ag:hdrIdx(h,/AGUS/),sep:hdrIdx(h,/SEPT/),okt:hdrIdx(h,/OKT/),nov:-1,last:hdrIdx(h,/TERAKHIR/),upd:hdrIdx(h,/UPDATE/),al:hdrIdx(h,/ALAMAT/),kel:hdrIdx(h,/KELURAHAN/),kec:hdrIdx(h,/KECAMATAN/),kota:hdrIdx(h,/^KOTA/),co:hdrIdx(h,/KOORDINAT/)};
  // kolom NOV terakhir (mis. "SLS NOV 1-23") = progres November paling baru
  let nd=0;h.forEach((v,i)=>{const m=/NOV\D*(\d{1,2})\s*-\s*(\d{1,2})/.exec(U(v));if(m&&+m[2]>=nd){nd=+m[2];ix.nov=i}});if(ix.nov<0)ix.nov=hdrIdx(h,/NOV/);
  for(let i=hi+1;i<A.length;i++){const r=A[i];if(!r||r[ix.kode]==null||r[ix.kode]==='')continue;const code=String(r[ix.kode]).trim();const m=D.byCode[U(code)]||null;
    const sep=num(r[ix.sep]),okt=num(r[ix.okt]),nov=num(r[ix.nov]);const kota=String(r[ix.kota]||'');const kel=r[ix.kel]&&r[ix.kel]!==0?r[ix.kel]:'',kec=r[ix.kec]&&r[ix.kec]!==0?r[ix.kec]:'';
    const proj=nd?nov/nd*30:nov;const e=ent({id:'KT-'+safeId(code),src:'KTR',code,name:String(r[ix.nama]||'').trim(),m,addr:r[ix.al]||'',kel:title(kel),kec:title(kec),city:title(kota),coord:parseCoord(r[ix.co]),
      sAug:num(r[ix.ag]),sSep:sep,sOkt:okt,drop:okt-sep,chg:sep?okt/sep-1:0,novGross:nov,novDay:nd,novProj:proj,last:toDate(r[ix.last]),upd:toDate(r[ix.upd]),seg:m?m.seg:'REGULER',sub:m?m.sub:''});
    e.ktSt=proj>=sep?'pulih':proj>=okt?'naik':'turun';e.klik=1;e.pic=klikPic(e)||'';e.picHow='tim Klik';out.rows.push(e)}
  out.nd=nd;out.ok=out.rows.length>0;return out}
const KT_LBL={pulih:'Proyeksi Nov ≥ Sept',naik:'Naik dari Okt, belum pulih',turun:'Masih turun'},KT_CLS={pulih:'good',naik:'warn',turun:'crit'};
function buildKecil(){D.M.klikVis=new Set([...(PICX?PICX.a.filter(a=>a.g==='KLIK').map(a=>a.k):[]),KLIK_SPV]);const out=new Map();
  const add=(e,src,why,ts)=>{let w=out.get(e.id);if(!w){w=Object.assign({},e,{klik:1,cat:'KLIK',kecilSrc:[],alasan:why||e.alasan||'',ts:ts||e.ts||null});w.pic=klikPic(w)||e.pic||'';w.picHow='tim Klik';out.set(e.id,w)}if(!w.kecilSrc.includes(src))w.kecilSrc.push(src);return w};
  D.M.map.rows.filter(r=>r.cat==='KLIK').forEach(e=>add(e,'Mapping',e.alasan,e.ts));
  D.M.svy.rows.filter(e=>e.pending&&e.size==='KECIL').forEach(e=>add(e,'ACC survey',e.note,e.daftar));
  // ACC survey yang dihapus karena tidak berminat tapi alasannya toko/kedai kecil → tetap digarap tim Klik
  (D.M.svyTolak||[]).forEach(e=>{if(smallSig(e.tolakRkm))add(e,'ACC survey · tidak berminat (toko kecil)',rkmBrief(e.tolakRkm),toDate(e.tolakRkm.date))});
  const svyBy={};D.M.svy.rows.filter(e=>e.pending||e.tolakRkm).forEach(e=>{svyBy[ownKey(e.name)]=e});const last={};
  D.rkm.forEach(r=>{if(!smallSig(r)||/^TES(T|TING)?$/i.test(String(r.name||'').trim()))return;const c=U(r.code);last[okCode(c)?'c:'+c:'n:'+ownKey(r.name)]=r});
  for(const [k,r] of Object.entries(last)){let e=null;if(k[0]==='c'){const m=D.byCode[k.slice(2)];if(m)e=D.M.byId[m.id]||memEnt(m)}else e=svyBy[k.slice(2)]||null;
    if(e)add(e,'RKM '+title(String(r.type||'').toLowerCase()),rkmBrief(r),toDate(r.date))}
  return[...out.values()]}
const PROJ={
  loy:{n:'Project 1',t:'Loyalty Targetan Member Merah Nov 2026',d:'Member pareto · target sales non-rokok November',seg:true},
  map:{n:'Project 2',t:'Mapping Get Member · Air Dingin & Air Putih',d:'Hasil kunjungan surveyor 2 wilayah',seg:true},
  svy:{n:'Project 3',t:'ACC Survey, Belum Aktivasi',d:'Pendaftar disetujui, kartu belum diambil',seg:true},
  klik:{n:'Project 4',t:'Project Klik',d:'Belum belanja sejak 1 Okt · belanja turun Sep→Okt · semua toko kecil',seg:false},
  lms:{n:'Project 5',t:'Loyalty MM Sleepers',d:'Promo 3–31 Nov · belanja ≥ Rp1 jt = 10.000 poin',seg:true},
  zb:{n:'Project 6',t:'Undangan Zumba × Salonpas',d:'Minggu 29 Nov 2026 · belanja Salonpas ≥ Rp50 rb · admin',seg:false},
  svk:{n:'Project 7',t:'Survey dari Apps Klik',d:'Toko hasil survey aplikasi Klik · foto toko · PIC = surveyor',seg:true},
};
function projRows(p,o={}){if(p==='loy')return D.M.loy.members;if(p==='map')return D.M.map.rows.filter(r=>r.wil);if(p==='svy')return D.M.svy.rows.filter(r=>r.pending);if(p==='lms')return D.M.lms.rows;if(p==='zb')return(D.M.zb&&D.M.zb.rows)||[];if(p==='svk')return(D.M.svk&&D.M.svk.rows)||[];
  if(p==='klik'){const s=o.sub||'slp';return s==='slp'?D.M.slp.rows:s==='turun'?((D.M.ktr&&D.M.ktr.rows)||[]):(D.M.kecil||[])}return[]}
