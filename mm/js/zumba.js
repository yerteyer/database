'use strict';
/* ===== Project 6 · Undangan Zumba Indogrosir × Salonpas — Minggu 29 November 2026 =====
   Member yang belanja produk Salonpas ≥ Rp50 rb. Dikerjakan admin: WA undangan → telepon bila belum membalas →
   tanpa nomor / nomor mati → datangi alamat (titik atau cari alamat di Google Maps, advisor terdekat) → pengingat H-1 → tandai hadir.
   Status undangan disimpan di follow-up field "zb" (terpisah dari status follow-up project lain). */
const ZB={tgl:new Date(2026,10,29),h1:new Date(2026,10,28),
  ST:['Belum dihubungi','WA terkirim','Sudah ditelepon','Konfirmasi hadir','Tidak bisa hadir','Nomor tidak aktif','Perlu didatangi','Sudah didatangi','Hadir 29 Nov'],
  TAHU:new Set(['WA terkirim','Sudah ditelepon','Konfirmasi hadir','Tidak bisa hadir','Sudah didatangi','Hadir 29 Nov']),
  OK:new Set(['Konfirmasi hadir','Hadir 29 Nov']),
  COL:{'Belum dihubungi':'#c8102e','WA terkirim':'#2a78d6','Sudah ditelepon':'#1c5cab','Konfirmasi hadir':'#0ca30c','Tidak bisa hadir':'#85837d','Nomor tidak aktif':'#eda100','Perlu didatangi':'#ec835a','Sudah didatangi':'#6250d6','Hadir 29 Nov':'#006300'}};
/* detail acara (pemilik bisa mengubah lewat "Detail acara"; tersimpan di database settings/zumba) */
const ZB_EVT={jam:'',lokasi:'Indogrosir Pekanbaru',catatan:''};
const zbEvt=()=>({...ZB_EVT,...(S.zbEvt||{})});
const ZB_DEKAT=/PEKANBARU|KAMPAR|SIAK|PELALAWAN/;
function parseZumba(ds){const out={rows:[],ok:false};const A=ds&&ds.sheets&&ds.sheets.main;if(!A)return out;const hi=findHdrRow(A,[/MEMBER/,/NAMA/]);if(hi<0)return out;const h=A[hi];
  const ix={kode:hdrIdx(h,/^(MEMBER|KODE( MEMBER)?|NO(MOR)? MEMBER)$/),nama:hdrIdx(h,/NAMA/),sub:hdrIdx(h,/SUB ?OUTLET/),al:hdrIdx(h,/ALAMAT/),kel:hdrIdx(h,/KELURAHAN/),kec:hdrIdx(h,/KECAMATAN/),kota:hdrIdx(h,/^KOTA|KABUPATEN/),hp:hdrIdx(h,/NO\.? ?HP|TELP|WHATSAPP|^WA$/),co:hdrIdx(h,/KOORDINAT/),seg:hdrIdx(h,/SEGMENTASI/),last:hdrIdx(h,/TERAKHIR/)};
  if(ix.kode<0)ix.kode=hdrIdx(h,/MEMBER/);const seen={};
  for(let i=hi+1;i<A.length;i++){const r=A[i];if(!r||r[ix.kode]==null||r[ix.kode]==='')continue;const code=String(r[ix.kode]).trim();let id='ZB-'+safeId(code);while(seen[id])id+='x';seen[id]=1;
    const m=D.byCode[U(code)]||null;const kota=String(r[ix.kota]||(m&&m.city)||'');const sub=String(r[ix.sub]??(m&&m.sub)??'');const hp=String(r[ix.hp]??'').replace(/\D/g,'');
    out.rows.push(ent({id,src:'ZB',code,name:String(r[ix.nama]||'').trim(),m,addr:r[ix.al]||'',kel:title(r[ix.kel]||''),kec:title(r[ix.kec]||''),city:title(kota),
      phone:hp.length>=9?phone62(hp):'',coord:parseCoord(r[ix.co]),sub,seg:segFromSub(sub)||'REGULER',tier:r[ix.seg]?String(r[ix.seg]):'',last:toDate(r[ix.last]),luar:kota?!ZB_DEKAT.test(U(kota)):false,pic:'ADMIN'}))}
  out.ok=out.rows.length>0;return out}
const zbSt=e=>fuOf(e.id).zb||(phoneOf(e)?'Belum dihubungi':'Perlu didatangi');
const zbAddr=e=>[e.addr,e.kel,e.kec,e.city].filter(Boolean).join(', ');
const zbFind=e=>`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(zbAddr(e))}`;
function zbCells(r){const ph=phoneOf(r),st=zbSt(r),fu=fuOf(r.id);const visit=['Perlu didatangi','Nomor tidak aktif'].includes(st);const adv=visit&&typeof excelPic==='function'?excelPic({...r,src:'MEM'}).k:'';
  return`<td>${ph?`<div class="pill-row"><button class="btn sm wa" data-act="wa-dlg" data-id="${r.id}">${IC.wa} WA</button><a class="btn sm" href="tel:+${ph}">☎ Telepon</a></div><div class="mut small">0${esc(ph.slice(2))}</div>`:'<span class="tag crit">Tanpa nomor</span>'}${r.luar?'<div><span class="tag warn">Luar kota · cukup WA/telepon</span></div>':''}</td>
   <td><select class="inp zb-st" data-act="fu" data-k="zb" data-id="${r.id}" style="border-left:4px solid ${ZB.COL[st]}">${ZB.ST.map(s=>`<option ${st===s?'selected':''}>${s}</option>`).join('')}</select>${fu.zbh1?'<div class="mut small">✓ diingatkan H-1</div>':''}${adv?`<div class="mut small">Advisor terdekat: <b>${esc(picLbl(adv))}</b></div>`:''}</td>
   <td><textarea class="inp" data-act="fu" data-k="note" data-id="${r.id}" rows="1" placeholder="balasan member, kendala, siapa yang datang">${esc(fu.note||'')}</textarea></td>`}
function zbStats(rows){const n=rows.length||1;const st=countBy(rows,zbSt);const tahu=rows.filter(r=>ZB.TAHU.has(zbSt(r))).length,ok=rows.filter(r=>ZB.OK.has(zbSt(r))).length,h1=rows.filter(r=>fuOf(r.id).zbh1).length;
  const hari=Math.round((ZB.tgl-new Date(TODAY.getFullYear(),TODAY.getMonth(),TODAY.getDate()))/864e5);const noPh=rows.filter(r=>!phoneOf(r)).length;
  const k=kpiCard({l:hari>0?`H-${hari} · Minggu 29 Nov`:hari===0?'Hari ini acara!':'Acara selesai',v:pct(tahu/n,0),note:`${fmtN(tahu)} dari ${fmtN(rows.length)} sudah tahu lolos undangan`,accent:'red'})
   +kpiCard({l:'Konfirmasi hadir',v:fmtN(ok),note:`${fmtN(st['Tidak bisa hadir']||0)} tidak bisa · ${fmtN(h1)} sudah diingatkan H-1 · ${fmtN(noPh)} tanpa nomor`});
  return`<div class="grid g4 mt">${k}<div class="card span2"><div class="lbl">Progress undangan · klik untuk filter</div>${hbars(ZB.ST.filter(s=>st[s]).map(s=>({k:s,l:s,v:st[s],c:ZB.COL[s],vl:`${st[s]} · ${pct(st[s]/n,0)}`})),{max:n,act:'pzst'})}</div></div>`}
/* WA berurutan: buka WhatsApp member berikutnya, tandai otomatis, lanjut. Mulai Sabtu 28 Nov berubah jadi pengingat H-1. */
function zbQueue(){const h1=TODAY>=ZB.h1;const q=(S._projRows||[]).filter(e=>phoneOf(e)&&(h1?!fuOf(e.id).zbh1&&['WA terkirim','Sudah ditelepon','Konfirmasi hadir'].includes(zbSt(e)):zbSt(e)==='Belum dihubungi'));
  if(!q.length){toast(h1?'Semua yang perlu sudah diingatkan H-1':'Tidak ada member yang belum dihubungi lewat WA');return}let i=0;
  const bg=modal(h1?'Pengingat H-1 berurutan':'WA undangan berurutan',`<div id="zq"></div>`,{wide:true});
  const show=()=>{const e=q[i];const box=$('#zq',bg);if(!box)return;if(!e){box.innerHTML=`<p><b>Selesai ✓</b> ${fmtN(q.length)} member.</p>`;rerender();return}
    const key=h1?'zb_ingat':'zb_undang';const txt=fillWA((S.wa&&S.wa[key])||WA_DEF[key],e);const ph=phoneOf(e);
    box.innerHTML=`<div class="small muted">${i+1} dari ${q.length}</div><h3 style="margin:4px 0">${esc(title(e.name))}</h3><div class="mut">0${esc(ph.slice(2))} · ${esc(e.kel||e.city||'')}</div>
     <textarea class="inp" id="zqt" rows="9" style="width:100%;margin-top:8px">${esc(txt)}</textarea>
     <div class="pill-row mt"><a class="btn wa" id="zqgo" target="_blank" rel="noopener" href="${waUrl(ph,txt)}">${IC.wa} Buka WhatsApp & lanjut</a><button class="btn" id="zqskip">Lewati</button><button class="btn" id="zqbad">Nomor tidak aktif</button></div>`;
    $('#zqt',bg).oninput=()=>{$('#zqgo',bg).href=waUrl(ph,$('#zqt',bg).value)};
    $('#zqgo',bg).onclick=()=>{if(h1)saveFU(e.id,{zbh1:iso(TODAY)},'Pengingat H-1 zumba via WA');else saveFU(e.id,{zb:'WA terkirim'},'Undangan zumba via WA');i++;setTimeout(show,400)};
    $('#zqskip',bg).onclick=()=>{i++;show()};$('#zqbad',bg).onclick=()=>{saveFU(e.id,{zb:'Nomor tidak aktif'},'Nomor tidak aktif');i++;show()}};
  show()}
function zbEvtModal(){const v=zbEvt();modal('Detail acara Zumba × Salonpas',`<p class="small muted">Dipakai di pesan WA undangan & pengingat H-1 untuk semua admin.</p>
   <label class="sel" style="width:100%"><span>Jam</span><input class="inp" id="zbj" value="${esc(v.jam)}" placeholder="mis. 06.30 WIB" style="width:100%"></label>
   <label class="sel mt" style="width:100%"><span>Lokasi</span><input class="inp" id="zbl" value="${esc(v.lokasi)}" style="width:100%"></label>
   <label class="sel mt" style="width:100%"><span>Catatan tambahan (opsional)</span><input class="inp" id="zbc" value="${esc(v.catatan)}" placeholder="mis. pakai baju olahraga, bawa kartu member" style="width:100%"></label>`,
  {okLbl:'Simpan',ok:async b=>{const d={jam:$('#zbj',b).value.trim(),lokasi:$('#zbl',b).value.trim()||ZB_EVT.lokasi,catatan:$('#zbc',b).value.trim()};S.zbEvt=d;
    if(S.db){try{await S.db.doc('settings/zumba').set(d)}catch(e){toast('Gagal simpan: '+(e.code||e.message));return false}}toast('Detail acara disimpan');rerender()}})}
