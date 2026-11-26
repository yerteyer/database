'use strict';
/* ===== Project 7 · Survey dari Apps Klik =====
   Toko yang didata surveyor lewat aplikasi Klik. PIC = kolom "Surveyor" di Excel (bukan pembagian wilayah biasa).
   Per toko: foto toko dari aplikasi (bila link bisa dibuka), rute Google Maps dari lokasi HP, cek sudah jadi member / sudah di Project 3,
   status kunjungan dari RKM (jenis Aktivasi diutamakan). No. KTP & email tidak disimpan. */
const SVK_DROP=/KTP|NIK|E-?MAIL/;
/* surveyor (nama lengkap) → kode PIC advisor */
function svkPicKey(name){const t=U(name).split(/[^A-Z]+/).filter(Boolean);if(!t.length)return'';
  const keys=new Set(Object.keys(PIC_NAME));if(typeof PICX!=='undefined'&&PICX&&PICX.a)PICX.a.forEach(a=>keys.add(U(a.k)));
  for(const k of keys)if(t.includes(k))return k;
  for(const k of keys){const nm=U(PIC_NAME[k]||'').split(/[^A-Z]+/).filter(Boolean);if(nm.length&&nm[0]===t[0])return k}
  for(const k of keys)if(k.length>=3&&(t[0].startsWith(k)||k.startsWith(t[0])))return k;
  for(const k of keys)if(k.length>=4&&t.some(w=>w.length>=4&&(w.startsWith(k)||k.startsWith(w))))return k;
  return t[0]}
function parseSvk(ds){const out={rows:[],ok:false,kota:{}};const A=ds&&ds.sheets&&ds.sheets.main;if(!A)return out;const hi=findHdrRow(A,[/NO SURVEY|SURVEYOR/,/NAMA/]);if(hi<0)return out;const h=A[hi];
  const ix={no:hdrIdx(h,/NO\.? ?SURVEY/),own:hdrIdx(h,/NAMA PEMILIK/),toko:hdrIdx(h,/NAMA TOKO/),hp:hdrIdx(h,/TELEPON|NO\.? ?HP|WHATSAPP/),sv:hdrIdx(h,/SURVEYOR/),al:hdrIdx(h,/ALAMAT/),kota:hdrIdx(h,/KOTA|KAB/),kec:hdrIdx(h,/KECAMATAN/),kel:hdrIdx(h,/KELURAHAN/),co:hdrIdx(h,/KOORDINAT/),foto:hdrIdx(h,/FOTO|GAMBAR|IMAGE/)};
  const seen={};
  for(let i=hi+1;i<A.length;i++){const r=A[i];if(!r)continue;let own=String(r[ix.own]??'').trim();if(/^\d{12,}$/.test(own))own='';const toko=String(r[ix.toko]??'').trim();if(!own&&!toko)continue;
    const no=String(r[ix.no]??'').replace(/^#/,'').trim();let id='SVK-'+safeId(no||hash(own+'|'+toko));while(seen[id])id+='x';seen[id]=1;
    const hp=String(r[ix.hp]??'').replace(/\D/g,'');const sv=String(r[ix.sv]??'').trim();const foto=String(r[ix.foto]??'').trim();const kota=title(String(r[ix.kota]??'').trim());
    const name=title(own||toko)+(toko&&own?' ('+title(toko)+')':'');
    out.rows.push({id,src:'SVK',code:'',name,owner:title(own),toko:title(toko),noSurvey:no,sv,pic:svkPicKey(sv),picHow:'Excel survey (surveyor)',addr:String(r[ix.al]??'').trim(),
      city:kota,kec:title(r[ix.kec]||''),kel:title(r[ix.kel]||''),phone:hp.length>=9?phone62(hp):'',coord:parseCoord(r[ix.co]),foto:/^https?:\/\//i.test(foto)?foto:'',seg:segFromText(toko,own),m:null});
    out.kota[kota||'-']=(out.kota[kota||'-']||0)+1}
  out.ok=out.rows.length>0;return out}
/* cocokkan ke database member & Project 3 lewat nomor HP (fallback nama pemilik) */
function svkLink(rows){const byPh={};D.mem.forEach(m=>{const p=phone62(m.phone||m.phoneRaw);if(p)byPh[p]=m});
  const svyPh={},svyNm={};(D.M.svy&&D.M.svy.rows||[]).forEach(s=>{if(s.phone)svyPh[s.phone]=s;svyNm[ownKey(s.name)]=s});
  rows.forEach(e=>{e.m=e.phone&&byPh[e.phone]||null;e.memCode=e.m?e.m.code:'';e.svy=e.phone&&svyPh[e.phone]||svyNm[ownKey(e.name)]||null})}
const svkRoute=c=>`https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}&travelmode=driving`;
const svkAddr=e=>[e.addr,e.kel,e.kec,e.city].filter(Boolean).join(', ');
/* Foto toko diambil dari CMS surveyor Klik (Laporan Survey) dan disimpan terenkripsi: thumbnail sekaligus, foto besar per toko saat diklik */
const SVK_IMG={th:null,busy:false};
function svkThumbs(){if(SVK_IMG.th||SVK_IMG.busy)return;SVK_IMG.busy=true;getEnc('svkthumb').then(j=>{SVK_IMG.th=(j&&j.t)||{};rerenderSoft()}).catch(()=>{SVK_IMG.th={}}).finally(()=>{SVK_IMG.busy=false})}
const svkNFoto=r=>{const t=SVK_IMG.th&&SVK_IMG.th[r.noSurvey];return t?t.length:0};
function svkFoto(r){if(!SVK_IMG.th){svkThumbs();return r.foto?'<div class="svk-f"><span class="svk-no" style="display:grid">Memuat foto…</span></div>':'<span class="mut">Tanpa foto</span>'}
  const t=SVK_IMG.th[r.noSurvey];if(!t||!t.length)return'<span class="mut">Tanpa foto</span>';
  return`<button class="svk-f" data-act="svk-foto" data-k="${esc(r.noSurvey)}" data-tip="Lihat foto toko ukuran besar"><img src="${t[0]}" alt="Foto ${esc(r.toko||r.name)}">${t.length>1?`<span class="svk-n">+${t.length-1}</span>`:''}</button>`}
async function svkView(no){const e=projRows('svk').find(x=>x.noSurvey===no);const c=e&&coordOf(e);
  const bg=modal('Foto toko · '+(e?(e.toko||e.name):'#'+no),`<div id="svkv" class="svk-v"><div class="loading" style="padding:40px"><div class="spin"></div><b>Memuat foto…</b></div></div>`,{wide:true,extra:c?`<a class="btn pri" href="${svkRoute(c)}" target="_blank" rel="noopener">🧭 Rute dari lokasi saya</a>`:''});
  try{const arr=await getEnc('svkimg/'+no);const box=$('#svkv',bg);if(box)box.innerHTML=(arr||[]).map(s=>`<img src="${s}" alt="Foto toko">`).join('')+(e?`<div class="mut small">Survey #${esc(no)} · ${esc(e.owner||'')} · ${esc(svkAddr(e))}</div>`:'')}
  catch(err){const box=$('#svkv',bg);if(box)box.innerHTML='<div class="alert red">Foto gagal dimuat. Coba lagi sebentar.</div>'}}
function svkInfo(r){const m=r.m;return`<div><b>${esc(r.toko||'–')}</b></div><div class="mut">Survey #${esc(r.noSurvey||'–')} · ${esc([r.kec,r.city].filter(Boolean).join(', '))}</div>
  ${m?`<span class="tag good" data-tip="Nomor HP sama dengan member ${esc(m.code)} · ${esc(m.name)}">✓ Sudah member ${esc(m.code)}</span>`:r.svy?`<span class="tag ${r.svy.activated?'good':'warn'}" data-tip="${esc(r.svy.name)}">${r.svy.activated?'✓ Sudah ambil kartu':r.svy.pending?'Ada di Project 3 · belum aktivasi':'Ada di master survey'}</span>`:'<span class="tag neu">Belum jadi member</span>'}
  ${r.sv?`<div class="mut small">Surveyor: ${esc(title(r.sv))}</div>`:''}`}
function svkLoc(r){const c=coordOf(r);
  return c?`<div class="pill-row"><a class="btn sm pri" href="${svkRoute(c)}" target="_blank" rel="noopener" data-tip="Rute Google Maps dari lokasi Anda sekarang ke toko ini">🧭 Rute dari lokasi saya</a><a class="btn sm" href="${gmapsPt(c)}" target="_blank" rel="noopener" data-tip="Lihat titik toko">${IC.pin} Titik</a></div><div class="mut small clamp">${esc(svkAddr(r))}</div>`
   :r.addr?`<a class="btn sm" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(svkAddr(r))}" target="_blank" rel="noopener">${IC.pin} Cari alamat</a><div class="mut small">belum ada titik</div>`:'<span class="mut">Belum ada titik</span>'}
function svkStats(rows){const n=rows.length||1;const mem=rows.filter(r=>r.m).length,p3=rows.filter(r=>!r.m&&r.svy).length,ft=rows.filter(r=>r.foto).length,vis=rows.filter(r=>visitOf(r)).length;
  const kota=countBy(rows,r=>r.city||'-');const st=countBy(rows,statusOf);
  const k=kpiCard({l:'Toko disurvey (apps Klik)',v:fmtN(rows.length),note:Object.entries(kota).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${fmtN(v)} ${esc(k)}`).join(' · '),accent:'red'})
   +kpiCard({l:'Sudah jadi member',v:fmtN(mem),note:`${pct(mem/n,0)} · ${fmtN(p3)} lagi ada di Project 3 · ${fmtN(vis)} sudah dikunjungi (RKM) · ${fmtN(ft)} punya foto`});
  return`<div class="grid g4 mt">${k}<div class="card span2"><div class="lbl">Progress follow-up · klik untuk filter</div>${hbars(FU_ST.filter(s=>st[s]).map(s=>({k:s,l:s,v:st[s],c:FU_COL[FU_CLS[s]],vl:`${st[s]} · ${pct(st[s]/n,0)}`})),{max:n,act:'pfu'})}</div></div>`}
