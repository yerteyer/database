'use strict';
/* ===== Google Form native (isi dari web, dikirim ke Google Form oleh tugas terjadwal) ===== */
const FORM_ID={rkm:'1FAIpQLSdtDVquoRjQokRUkj_b8zYAg5EJipIaeLtE7MDCuYZp4_KY-w',map:'1FAIpQLSeezXkxlBqZHUYbcf6kGXTA0_A2R5LI05klS8ptZeFpAdMMrQ'};
const FORM_T={rkm:'RKM MM Indogrosir PKU',map:'Get Member Pekanbaru'};
let FORMDEF=null;S.formq=[];
async function ensureForms(){if(!FORMDEF)FORMDEF=await getJSON('data/forms.json');return FORMDEF}
function fld(kind,re){return(FORMDEF[kind]||[]).find(f=>re.test(U(f.t)))}
function rkmPrefill(e){const p={};if(!e)return p;const r=e.code?R(e.code):null;const pic=picOf(e);const adv=fld('rkm',/^ADVISOR/);
  if(adv&&adv.o.includes(pic))p[adv.e]=pic;else if(adv&&pic)p._warn=`PIC ${picLbl(pic)} belum ada di pilihan Advisor Google Form RKM — pilih advisor yang mengisi, atau minta admin form menambahkan nama ${picLbl(pic)}.`;const jm=fld('rkm',/JENIS MEMBER/);if(jm)p[jm.e]=(D.M.projOf[e.id]||[]).some(t=>t.startsWith('Klik'))?'KLIK':segOf(e)==='HOREKA'?'Horeka':'Reguler';
  const jr=fld('rkm',/JENIS RKM/);const pj=D.M.projOf[e.id]||[];if(jr&&pj.some(t=>t.startsWith('Loyalty Targetan'))&&jr.o.includes('LOYALTY TARGETAN'))p[jr.e]='LOYALTY TARGETAN';else if(jr&&pj.some(t=>t.startsWith('Klik'))&&jr.o.includes('PROJECT KLIK'))p[jr.e]='PROJECT KLIK';else if(jr&&r)p[jr.e]={sleeper:'TIDUR',turun:'KUNJUNGAN TURUN',absen:'KUNJUNGAN TURUN',nostruk:'BELUM BELANJA',kembali:'TIDUR KEMBALI BELANJA'}[r.st]||'REGULER';
  const nm=fld('rkm',/NOMOR MEMBER/);if(nm&&e.code)p[nm.e]=e.code;const na=fld('rkm',/NAMA MEMBER/);if(na)p[na.e]=e.name;
  const wa=fld('rkm',/WA AKTIF/);if(wa&&phoneOf(e))p[wa.e]='0'+phoneOf(e).replace(/^62/,'');const tg=fld('rkm',/TANGGAL/);if(tg)p[tg.e]=iso(TODAY);return p}
function mapPrefill(e,extra={}){const p={};const sv=fld('map',/SURVEYOR/);if(sv&&extra.pic)p[sv.e]=extra.pic;if(e){const n=fld('map',/NAMA PEMILIK/);if(n)p[n.e]=e.name;const k=fld('map',/KELURAHAN/);if(k&&e.kel)p[k.e]=U(e.kel);const c=fld('map',/KOORDINAT/);const co=coordOf(e);if(c&&co)p[c.e]=`${co.lat}, ${co.lng}`}return p}
/* Google Form dibuka langsung (tab baru). Dari baris member, kolom diisi otomatis lewat tautan prefill resmi Google Form. */
function formUrl(kind,prefill={}){const q=new URLSearchParams({usp:'pp_url'});
  for(const [k,v] of Object.entries(prefill)){if(k[0]==='_'||v==null||v==='')continue;(Array.isArray(v)?v:[v]).forEach(x=>q.append('entry.'+k,String(x)))}
  return`https://docs.google.com/forms/d/e/${FORM_ID[kind]}/viewform?${q}`}
function openForm(kind,prefill={}){if(prefill._warn)toast(prefill._warn,6000);const url=formUrl(kind,prefill);
  const w=window.open(url,'_blank');if(w){try{w.opener=null}catch(e){}return}
  modal(`Buka ${FORM_T[kind]}`,`<p class="small">Browser menahan tab baru. Tekan tombol di bawah untuk membuka Google Form${Object.keys(prefill).some(k=>k[0]!=='_')?' (sudah terisi otomatis)':''}.</p><a class="btn pri" href="${esc(url)}" target="_blank" rel="noopener">✎ Buka ${esc(FORM_T[kind])}</a>`)}
/* form queue → data lokal (RKM & mapping langsung terlihat) */
function formVal(d,re){const k=Object.keys(d.show||{}).find(x=>re.test(U(x)));return k?d.show[k]:''}
function rebuildFromForms(){if(!D.rkmBase)D.rkmBase=D.rkm.slice();
  const add=S.formq.filter(d=>d.form==='rkm').map(d=>({code:String(formVal(d,/NOMOR MEMBER/)),name:formVal(d,/NAMA MEMBER/),date:formVal(d,/TANGGAL/)||d.at.slice(0,10),pic:formVal(d,/ADVISOR/),type:formVal(d,/JENIS RKM/),issues:formVal(d,/KENDALA/),notes:formVal(d,/KETERANGAN/),web:d.status||'pending'}));
  D.rkm=[...D.rkmBase,...add].sort((a,b)=>a.date.localeCompare(b.date));D.rkmBy={};D.rkm.forEach(r=>{(D.rkmBy[U(r.code)]=D.rkmBy[U(r.code)]||[]).push(r)});
  D.mapExtra=S.formq.filter(d=>d.form==='map').map(d=>{const co=parseCoord(formVal(d,/KOORDINAT/));const get=formVal(d,/GET MEMBER/);const al=formVal(d,/ALASAN/);const kel=U(formVal(d,/KELURAHAN/));const k=kel.replace(/[^A-Z]/g,'');
    return ent({id:'MAPW-'+safeId(d.id),src:'MAP',name:formVal(d,/NAMA PEMILIK/),pic:U(formVal(d,/SURVEYOR/)),ts:toDate(d.at),get,phone:phone62(formVal(d,/NO\.? ?HP/)),alasan:al,cat:catOf(get,al),kelRaw:kel,kel:title(kel),wil:k==='AIRDINGIN'?'AIR DINGIN':k==='AIRPUTIH'?'AIR PUTIH':'',coord:co,seg:segFromText(formVal(d,/NAMA PEMILIK/)),web:d.status})})}
function vForm(){
  return pageHead('Isi form lapangan','RKM & Get Member dibuka langsung di Google Form — isian masuk ke spreadsheet hasil Google Form seperti biasa.','')
  +`<div class="grid g2"><a class="card form-card" href="${esc(formUrl('rkm'))}" target="_blank" rel="noopener"><span class="eyebrow red">Google Form</span><b>${esc(FORM_T.rkm)}</b><span class="mut">Advisor, jenis member & RKM, kendala, keterangan, tanggal, nomor aktif, afiliasi</span><span class="btn pri">Buka form RKM ↗</span></a>
   <a class="card form-card" href="${esc(formUrl('map'))}" target="_blank" rel="noopener"><span class="eyebrow red">Google Form</span><b>${esc(FORM_T.map)}</b><span class="mut">Surveyor, nama toko, hasil get member, alasan, kelurahan, koordinat toko</span><span class="btn pri">Buka form Get Member ↗</span></a></div>
  <div class="alert mt">Tips: dari tabel member / Project / detail member, tombol <b>✎</b> membuka Google Form yang <b>sudah terisi otomatis</b>: nomor & nama member, advisor, jenis member, jenis RKM, tanggal dan No WA (RKM) · nama toko, kelurahan dan koordinat (Get Member). Tinggal lengkapi lalu kirim.</div>
  <p class="small muted">Koordinat toko baru: di Google Maps HP tekan lama titik lokasi → salin angka koordinat → tempel di kolom KOORDINAT TOKO.</p>`}
