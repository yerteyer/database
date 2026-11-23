'use strict';
/* ===== shared UI pieces ===== */
const F=v=>(S.f[v]=S.f[v]||{});
function pageHead(t,sub,actions=''){return`<div class="page-h"><div><div class="eyebrow">Indogrosir Pekanbaru · Member Merah</div><h1>${t}</h1>${sub?`<p>${sub}</p>`:''}</div><div class="page-act">${actions}</div></div>`}
function kpiCard({l,v,d,dGood,note,act,icon,accent}){const dc=d==null?'':`<span class="delta ${d===0?'':((d>0)===(dGood!==false)?'up':'down')}">${d>0?'↗':d<0?'↘':''} ${sgnPct(d)}</span>`;
  return`<div class="card kpi ${act?'click':''} ${accent||''}" ${act||''}><div class="kpi-top"><span class="lbl">${l}</span>${icon?`<span class="kpi-ic">${icon}</span>`:''}</div><div class="val">${v}</div><div class="note">${dc}<span>${note||''}</span></div></div>`}
function periodNote(){const C=CALC;return`${periodLabel(C.p)} vs ${periodLabel(C.c)}${C.pr!==1?` · pro-rata per hari (×${C.pr.toFixed(2)})`:''}`}
function memCell(m,sub){return`<div class="mc"><span class="av" style="background:${avCol(m.name)}">${esc(initials(m.name))}</span><div><button class="lnk nm" data-act="mem" data-id="${m.id}">${esc(m.name)}</button><div class="mut">${esc(sub??[m.code,m.cat&&title(m.cat)].filter(Boolean).join(' · '))}</div></div></div>`}
function avCol(s){const c=['#e6f0fb','#fdeee7','#e3f6ef','#efedfc','#fff5df','#fbeaea'];return c[parseInt(hash(s),36)%c.length]}
function actBtns(e,{detail=true,rkm=false,pin=true}={}){const ph=phoneOf(e),c=coordOf(e);
  return`<div class="acts">${rkm?`<button class="ib" data-act="form" data-k="${e.src==='MAP'?'map':'rkm'}" data-id="${e.id}" data-tip="Isi ${e.src==='MAP'?'Get Member':'RKM'} (Google Form)">✎</button>`:''}${ph?`<button class="ib wa" data-act="wa-dlg" data-id="${e.id}" data-tip="WhatsApp ${ph} (pesan bisa diedit)">${IC.wa}</button>`:`<span class="ib off" data-tip="Belum ada nomor HP">${IC.wa}</span>`}${!pin?'':c?`<a class="ib" href="${gmapsPt(c)}" target="_blank" rel="noopener" data-tip="Buka titik di Google Maps">${IC.pin}</a>`:`<span class="ib off" data-tip="Belum ada koordinat">${IC.pin}</span>`}${detail?`<button class="ib" data-act="mem" data-id="${e.id}" data-tip="Detail & follow-up">›</button>`:''}</div>`}
const IC={
  wa:'<svg viewBox="0 0 24 24" width="15" height="15"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3a.5.5 0 0 0 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.1 5.1 0 0 0 1.1 2.7 11.7 11.7 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.5-.3Z"/></svg>',
  pin:'<svg viewBox="0 0 24 24" width="15" height="15"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z"/></svg>',
  xls:'<svg viewBox="0 0 24 24" width="15" height="15"><path fill="none" stroke="currentColor" stroke-width="1.8" d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8Zm0 0v5h5M9 12l4 5m0-5-4 5"/></svg>',
  ppt:'<svg viewBox="0 0 24 24" width="15" height="15"><path fill="none" stroke="currentColor" stroke-width="1.8" d="M3 4h18v12H3zM12 16v4m-4 0h8M7 12l3-3 2 2 4-4"/></svg>',
  csv:'<svg viewBox="0 0 24 24" width="15" height="15"><path fill="none" stroke="currentColor" stroke-width="1.8" d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v3h16v-3"/></svg>',
  map:'<svg viewBox="0 0 24 24" width="15" height="15"><path fill="none" stroke="currentColor" stroke-width="1.8" d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2-6-2Zm0 0v14m6-12v14"/></svg>',
};
function filterChips(key,items,cur){return`<div class="chips">${items.map(i=>`<button class="chip-b ${cur===i.k?'on':''}" data-act="fset" data-v="${key}" data-k="${esc(i.k)}">${i.dot?`<i style="background:${i.dot}"></i>`:''}${esc(i.l)}${i.n!=null?`<b>${fmtN(i.n)}</b>`:''}</button>`).join('')}</div>`}
function selectF(key,label,opts,cur){return`<label class="sel"><span>${label}</span><select data-act="fsel" data-v="${key}">${opts.map(o=>`<option value="${esc(o.v)}" ${String(cur??'')===String(o.v)?'selected':''}>${esc(o.l)}</option>`).join('')}</select></label>`}
function pager(key,total,page,size){const pages=Math.max(1,Math.ceil(total/size));if(pages<=1)return`<div class="pager"><span>${fmtN(total)} baris</span></div>`;
  return`<div class="pager"><span>${fmtN(page*size+1)}–${fmtN(Math.min(total,(page+1)*size))} dari ${fmtN(total)}</span><span class="sp"></span><button class="btn sm" data-act="page" data-v="${key}" data-k="0" ${page===0?'disabled':''}>«</button><button class="btn sm" data-act="page" data-v="${key}" data-k="${page-1}" ${page===0?'disabled':''}>‹</button><span class="pg">${page+1} / ${pages}</span><button class="btn sm" data-act="page" data-v="${key}" data-k="${page+1}" ${page>=pages-1?'disabled':''}>›</button><button class="btn sm" data-act="page" data-v="${key}" data-k="${pages-1}" ${page>=pages-1?'disabled':''}>»</button></div>`}
function sortTh(key,k,l,cls=''){const f=F(key);const on=f.sort===k;return`<th class="${cls} sortable ${on?'on':''}" data-act="sort" data-v="${key}" data-k="${k}">${l}${on?(f.dir>0?' ▲':' ▼'):''}</th>`}
function bulkBar(key,n){if(!S.sel.size)return'';return`<div class="bulk"><b>${fmtN(S.sel.size)} dipilih</b>${n&&S.sel.size<n?`<button class="btn sm pri" data-act="sel-all" data-v="${key}">Pilih semua ${fmtN(n)} hasil filter</button>`:''}<button class="btn sm" data-act="bulk-pic">Set PIC</button><button class="btn sm" data-act="bulk-st">Set status</button><button class="btn sm" data-act="bulk-adv">${IC.wa} Kirim ke advisor</button><button class="btn sm" data-act="bulk-xls">${IC.xls} Export terpilih</button><span class="sp"></span><button class="btn sm ghost" data-act="sel-clear">Batal pilih</button></div>`}

/* ===== member-row tables (database / penurunan) ===== */
/* Pencarian: beberapa kata = semuanya harus cocok (nama, kode, HP, alamat, kel/kec, tier, kategori, PIC, catatan). No HP 08… = 628… */
function qTokens(q){return String(q||'').toLowerCase().split(/\s+/).filter(Boolean).map(t=>{const d=t.replace(/\D/g,'');if(d.length<4||!/^[\d+\-.()]+$/.test(t))return[t];
  return[t,d,d.startsWith('0')?'62'+d.slice(1):d.startsWith('62')?'0'+d.slice(2):d]})}
function memHay(m){const e=memEntOf(m);return(m.name+' '+m.code+' '+m.phoneRaw+' '+m.phone+' '+m.vil+' '+m.dist+' '+m.addr+' '+m.tier+' '+m.cat+' '+picOf(e)+' '+(fuOf(e.id).note||'')).toLowerCase()}
function memberFilter(view,rows){const f=F(view);
  if(f.st&&f.st!=='all')rows=rows.filter(r=>f.st==='aktif'?r.cur>0:r.st===f.st);
  if(f.seg)rows=rows.filter(r=>segOf(memEntOf(r.m))===f.seg);
  if(f.tier)rows=rows.filter(r=>(r.m.tier||'(kosong)')===f.tier);
  if(f.cat)rows=rows.filter(r=>(r.m.cat||'(kosong)')===f.cat);
  if(f.kec)rows=rows.filter(r=>(r.m.dist||'BELUM TERISI')===f.kec);
  if(f.kel)rows=rows.filter(r=>(r.m.vil||'')===f.kel);
  if(f.city)rows=rows.filter(r=>(r.m.city||'(kosong)')===f.city);
  if(f.pic)rows=rows.filter(r=>picOf(memEntOf(r.m))===f.pic);
  if(f.km)rows=rows.filter(r=>r.m.km!=null&&r.m.km<=+f.km);
  if(f.hasc)rows=rows.filter(r=>coordOf(memEntOf(r.m)));
  if(f.hasp)rows=rows.filter(r=>phoneOf(memEntOf(r.m)));
  if(f.fu)rows=rows.filter(r=>statusOf(memEntOf(r.m))===f.fu);
  if(f.vf){const t=VCHK.find(v=>v.k===f.vf);if(t)rows=rows.filter(r=>t.f(r.m,r))}
  if(f.q){const tk=qTokens(f.q);rows=rows.filter(r=>{const h=memHay(r.m);return tk.every(a=>a.some(x=>h.includes(x)))})}
  const sk=f.sort||'delta',dir=f.dir||(sk==='delta'?1:-1);const get={delta:r=>r.delta,cur:r=>r.cur,prev:r=>r.prevAdj,chg:r=>isFinite(r.chg)?r.chg:9e9,last:r=>r.last?+r.last:0,name:r=>r.m.name.toLowerCase(),km:r=>r.m.km??999,struk:r=>r.struk,margin:r=>r.margin}[sk]||(r=>r.delta);
  return[...rows].sort((a,b)=>{const x=get(a),y=get(b);return(x>y?1:x<y?-1:0)*dir});
}
const ME={};function memEntOf(m){return D.M.byId[m.id]||(ME[m.id]=ME[m.id]||memEnt(m))}
/* Kolom tabel member: bisa disembunyikan / ditampilkan (Atur kolom). sum = ringkasan di baris bawah untuk SELURUH hasil filter. */
const share=(n,t)=>t?pct(n/t,0):'–';
const MCOLS=[
  {k:'seg',l:'Segmen',on:1,th:()=>'<th>Segmen</th>',td:(r,m,e)=>`<td>${segTag(segOf(e))}${m.tier?`<div class="mut">${esc(title(m.tier))}</div>`:''}</td>`},
  {k:'wil',l:'Wilayah',on:1,th:()=>'<th>Wilayah</th>',td:(r,m)=>`<td><div>${esc(title(m.dist)||'–')}</div><div class="mut">${esc(title(m.vil))}${m.km!=null?` · ${m.km} km`:''}</div></td>`,sum:rs=>`${share(rs.filter(r=>coordOf(memEntOf(r.m))).length,rs.length)} ada titik`},
  {k:'hp',l:'No HP',on:0,th:()=>'<th>No HP</th>',td:(r,m,e)=>{const p=phoneOf(e);return`<td class="nw">${p?`<button class="lnk" data-act="copy" data-k="${p}" data-tip="Salin nomor">${esc(p.replace(/^62/,'0'))}</button>`:'<span class="mut">–</span>'}</td>`},sum:rs=>`${share(rs.filter(r=>phoneOf(memEntOf(r.m))).length,rs.length)} terisi`},
  {k:'cur',l:'Sales periode',on:1,th:v=>sortTh(v,'cur','Sales periode','num'),td:r=>`<td class="num"><b>${fmtS(r.cur)}</b><div class="mut">${fmtS(r.prevAdj)} sebelumnya</div></td>`,sum:rs=>`${fmtS(sumBy(rs,r=>r.cur))}<div class="mut">${fmtS(sumBy(rs,r=>r.prevAdj))} sebelumnya</div>`,num:1},
  {k:'delta',l:'Perubahan',on:1,th:v=>sortTh(v,'delta','Perubahan','num'),td:r=>`<td class="num"><span class="${r.delta<0?'neg':r.delta>0?'pos':''}">${r.delta>0?'+':''}${fmtS(r.delta)}</span><div class="mut">${isFinite(r.chg)?sgnPct(r.chg,0):'baru'}</div></td>`,
    sum:rs=>{const d=sumBy(rs,r=>r.delta),p=sumBy(rs,r=>r.prevAdj);return`<span class="${d<0?'neg':d>0?'pos':''}">${d>0?'+':''}${fmtS(d)}</span><div class="mut">${p?sgnPct(d/p,0):''}</div>`},num:1},
  {k:'struk',l:'Struk & kunjungan',on:0,th:v=>sortTh(v,'struk','Struk','num'),td:r=>`<td class="num">${fmtN(r.struk)}<div class="mut">${fmtN(r.kunj)} kunjungan</div></td>`,sum:rs=>`${fmtN(sumBy(rs,r=>r.struk))}<div class="mut">${fmtN(sumBy(rs,r=>r.kunj))} kunjungan</div>`,num:1},
  {k:'margin',l:'Margin',on:0,th:v=>sortTh(v,'margin','Margin','num'),td:r=>`<td class="num">${fmtS(r.margin)}<div class="mut">${r.cur>0?pct(r.margin/r.cur,1):'–'}</div></td>`,sum:rs=>{const g=sumBy(rs,r=>r.margin),c=sumBy(rs,r=>r.cur);return`${fmtS(g)}<div class="mut">${c>0?pct(g/c,1):''}</div>`},num:1},
  {k:'last',l:'Terakhir belanja',on:1,th:v=>sortTh(v,'last','Terakhir belanja'),td:r=>`<td>${r.last?fmtD(r.last):'–'}<div class="mut">${r.since!=null?r.since+' hari lalu':''}</div></td>`},
  {k:'st',l:'Status sales',on:1,th:()=>'<th>Status</th>',td:r=>`<td>${stTag(r.st)}</td>`},
  {k:'fu',l:'Follow-up',on:1,th:()=>'<th>Follow-up</th>',td:(r,m,e)=>{const fu=statusOf(e);return`<td><span class="tag ${FU_CLS[fu]}">${esc(fu)}</span>${picOf(e)?`<div class="mut">PIC ${esc(picLbl(picOf(e)))}</div>`:''}</td>`},
    sum:rs=>`${share(rs.filter(r=>statusOf(memEntOf(r.m))!=='Belum dihubungi').length,rs.length)} sudah dihubungi`},
  {k:'note',l:'Catatan & janji',on:0,th:()=>'<th>Catatan & janji</th>',td:(r,m,e)=>{const f=fuOf(e.id);return`<td><div class="clamp small">${esc(f.note||'')||'<span class="mut">–</span>'}</div>${f.due?`<div class="mut">Janji ${esc(fmtD(toDate(f.due)))}</div>`:''}</td>`}},
  {k:'act',l:'Aksi',on:1,th:()=>'<th class="num">Aksi</th>',td:(r,m,e)=>`<td class="num">${actBtns(e)}</td>`},
];
function memberTable(view,rows){const f=F(view);const size=dbxSize(view);const page=Math.min(f.page||0,Math.max(0,Math.ceil(rows.length/size)-1));const sl=rows.slice(page*size,(page+1)*size);
  const allSel=sl.length&&sl.every(r=>S.sel.has(r.m.id));const cols=MCOLS.filter(c=>dbxCols(view).includes(c.k));
  return`${bulkBar(view)}${dbxToolbar(view)}<div class="tbl-wrap"><table class="tbl mtbl ${dbxDense()?'dense':''}"><thead><tr><th class="cb stk"><input type="checkbox" data-act="sel-page" ${allSel?'checked':''} aria-label="pilih halaman"></th>${sortTh(view,'name','Member','stk stk2')}${cols.map(c=>c.th(view)).join('')}</tr></thead><tbody>
  ${sl.map(r=>{const m=r.m,e=memEntOf(m);return`<tr class="${S.sel.has(m.id)?'sel':''} ${S._kid===m.id?'kf':''}" data-row="${m.id}"><td class="cb stk"><input type="checkbox" data-act="sel" data-id="${m.id}" ${S.sel.has(m.id)?'checked':''} aria-label="pilih ${esc(m.name)}"></td><td class="stk stk2">${memCell(m)}</td>${cols.map(c=>c.td(r,m,e).replace(/^<td/,`<td data-l="${esc(c.l)}" data-c="${c.k}"`)).join('')}</tr>`}).join('')||`<tr><td colspan="${cols.length+2}" class="empty">Tidak ada member untuk filter ini.${Object.keys(activeFilters(view)).length?` <button class="lnk" data-act="freset" data-v="${view}">Hapus semua filter</button>`:''}</td></tr>`}
  </tbody>${rows.length?`<tfoot><tr><td class="cb stk"></td><td class="stk stk2">${fmtN(rows.length)} member<div class="mut">ringkasan seluruh hasil filter</div></td>${cols.map(c=>`<td class="${c.num?'num':''}" data-l="${esc(c.l)}" data-c="${c.k}">${c.sum?c.sum(rows):''}</td>`).join('')}</tr></tfoot>`:''}</table></div>${pager(view,rows.length,page,size)}${rows.length>sl.length?`<div class="small muted" style="margin-top:6px"><button class="lnk" data-act="sel-all" data-v="${view}">Pilih semua ${fmtN(rows.length)} hasil filter</button></div>`:''}
  <div class="kbd-hint mut">Pintasan: <kbd>/</kbd> cari · <kbd>J</kbd>/<kbd>K</kbd> pindah baris · <kbd>Enter</kbd> buka detail · <kbd>X</kbd> pilih baris</div>`;
}
/* filter aktif → chip yang bisa dihapus satu per satu */
const FLAB={q:['Cari',v=>`“${v}”`],seg:['Segmen',v=>SEG_LBL[v]||v],kec:['Kecamatan',v=>title(v)],kel:['Kelurahan',v=>title(v)],city:['Kota',v=>title(v)],tier:['Tier',v=>title(v)],cat:['Kategori',v=>title(v)],km:['Jarak',v=>'≤ '+v+' km'],pic:['PIC',v=>picLbl(v)],fu:['Follow-up',v=>v],hasp:['Ada No HP',null],hasc:['Ada titik',null],vf:['Validasi',v=>(VCHK.find(x=>x.k===v)||{}).l||v]};
function activeFilters(view){const f=F(view),o={};Object.keys(FLAB).forEach(k=>{if(f[k]!=null&&f[k]!==''&&f[k]!==false)o[k]=f[k]});return o}
const MORE_F=['city','tier','cat','km','hasp','hasc'];
function memberFilterBar(view,rows){const f=F(view);const C=CALC;const act=activeFilters(view);const nMore=MORE_F.filter(k=>act[k]!=null).length;const more=f.more||nMore>0;
  const kecs=countBy(C.rows,r=>r.m.dist||'BELUM TERISI');const kecOpts=[{v:'',l:'Semua kecamatan'},...Object.entries(kecs).sort((a,b)=>b[1]-a[1]).map(([k,n])=>({v:k,l:`${title(k)} (${n})`}))];
  const tiers=countBy(D.mem,m=>m.tier||'(kosong)');const cats=countBy(D.mem,m=>m.cat||'(kosong)');const cities=countBy(D.mem,m=>m.city||'(kosong)');
  return`<div class="fbar"><input class="search" placeholder="Cari nama, kode, HP, alamat, PIC, catatan…" data-act="fq" data-v="${view}" value="${esc(f.q||'')}" data-tip="Beberapa kata = semua harus cocok, mis. &quot;tampan kelontong&quot;. Tekan / untuk ke sini.">
   ${selectF(view+'.seg','Segmen',[{v:'',l:'Semua'},...SEGS.map(s=>({v:s,l:SEG_LBL[s]}))],f.seg)}
   ${selectF(view+'.kec','Kecamatan',kecOpts,f.kec)}
   ${selectF(view+'.pic','PIC',[{v:'',l:'Semua'},...D.M.pics.map(p=>({v:p,l:picLbl(p)}))],f.pic)}
   ${selectF(view+'.fu','Follow-up',[{v:'',l:'Semua'},...FU_ST.map(s=>({v:s,l:s}))],f.fu)}
   <button class="btn sm ${more?'on':''}" data-act="fmore" data-v="${view}" aria-expanded="${more}">${more?'− Sembunyikan filter lain':'+ Filter lain'}${nMore?` <span class="badge">${nMore}</span>`:''}</button>
   ${more?`<div class="fmore">${selectF(view+'.city','Kota',[{v:'',l:'Semua'},...Object.entries(cities).sort((a,b)=>b[1]-a[1]).map(([k,n])=>({v:k,l:`${title(k)} (${n})`}))],f.city)}
   ${selectF(view+'.tier','Tier',[{v:'',l:'Semua'},...Object.entries(tiers).sort((a,b)=>b[1]-a[1]).map(([k,n])=>({v:k,l:`${title(k)} (${n})`}))],f.tier)}
   ${selectF(view+'.cat','Kategori',[{v:'',l:'Semua'},...Object.entries(cats).sort((a,b)=>b[1]-a[1]).slice(0,30).map(([k,n])=>({v:k,l:`${title(k)} (${n})`}))],f.cat)}
   ${selectF(view+'.km','Jarak',[{v:'',l:'Semua'},{v:3,l:'≤ 3 km'},{v:5,l:'≤ 5 km'},{v:10,l:'≤ 10 km'},{v:20,l:'≤ 20 km'}],f.km)}
   <label class="tg"><input type="checkbox" data-act="ftog" data-v="${view}.hasp" ${f.hasp?'checked':''}> Ada No HP</label><label class="tg"><input type="checkbox" data-act="ftog" data-v="${view}.hasc" ${f.hasc?'checked':''}> Ada titik</label></div>`:''}</div>
   ${Object.keys(act).length?`<div class="afil"><span class="mut small">Filter aktif · ${fmtN(rows.length)} hasil:</span>${Object.entries(act).map(([k,v])=>`<span class="tag red">${esc(FLAB[k][0])}${FLAB[k][1]?': '+esc(FLAB[k][1](v)):''}<button class="lnk x" data-act="fclr" data-v="${view}.${k}" aria-label="Hapus filter ${esc(FLAB[k][0])}">✕</button></span>`).join('')}<button class="btn sm ghost" data-act="freset" data-v="${view}">Hapus semua</button></div>`:''}`;
}

/* ===== RINGKASAN ===== */
function vRingkasan(){const C=CALC,f=F('ringkasan');const ap=C.ap,ac=C.ac;
  const avgS=C.stk?C.tc/C.stk:0,avgP=C.stkPrev?C.tpv/C.stkPrev:0;const mgP=ap&&ap.net?ap.margin/ap.net:0,mgC=ac&&ac.net?ac.margin/ac.net:0;
  const metric=f.metric||'gross';const lab=D.periods.map((_,i)=>periodLabel(i,true));
  const ser={gross:{n:'Gross sales',v:D.agg.monthly.map(x=>x.gross)},members:{n:'Member aktif',v:D.agg.monthly.map(x=>x.members),fmt:v=>fmtN(v)},receipts:{n:'Struk',v:D.agg.monthly.map(x=>x.receipts),fmt:v=>fmtN(v)},perday:{n:'Sales per hari',v:D.agg.monthly.map(x=>x.gross/x.days)}}[metric];
  const turnTop=C.rows.filter(r=>r.st==='turun'||r.st==='absen').sort((a,b)=>a.delta-b.delta).slice(0,8);
  let h=pageHead('Ringkasan performa',`Pantau perubahan sales dan tentukan prioritas tindak lanjut · ${periodNote()}`,`<button class="btn" data-act="x-xls">${IC.xls} Excel</button><button class="btn" data-act="x-ppt">${IC.ppt} PPT ringkasan</button><button class="btn" data-act="report">Laporan WA grup</button>`);
  h+=`<div class="grid g4">
   ${kpiCard({l:'Gross sales',v:fmtS(C.tc),d:C.tpv?C.tc/(C.tpv*C.pr)-1:null,note:'vs '+periodLabel(C.c,true)+(C.pr!==1?' (pro-rata)':''),icon:'Rp',act:'data-act="goto" data-v="pola"',accent:'red'})}
   ${kpiCard({l:'Member aktif belanja',v:fmtN(C.act),d:C.actPrev?C.act/C.actPrev-1:null,note:`dari ${fmtN(D.mem.length)} member`,icon:'👥',act:'data-act="st" data-k="aktif"'})}
   ${kpiCard({l:'Rata-rata per struk',v:fmtS(avgS),d:avgP?avgS/avgP-1:null,note:`${fmtN(C.stk)} struk`,icon:'🧾',act:'data-act="goto" data-v="pola"'})}
   ${kpiCard({l:'Margin terhadap netto',v:pct(mgP,2),d:mgC?mgP/mgC-1:null,note:fmtS(ap?ap.margin:0)+' margin',icon:'%'})}
  </div>`;
  h+=`<div class="grid g21 mt"><div class="card"><div class="card-h"><div><h3>Perjalanan performa</h3><p class="sub">${D.P} bulan · klik titik untuk ganti periode analisis</p></div>
   <div class="seg-t">${[['gross','Sales'],['members','Member'],['receipts','Struk'],['perday','Per hari']].map(([k,l])=>`<button class="${metric===k?'on':''}" data-act="fset" data-v="ringkasan.metric" data-k="${k}">${l}</button>`).join('')}</div></div>
   ${lineChart({labels:lab,series:[{name:ser.n,values:ser.v,color:'#c8102e'},...(isPartial(D.P-1)&&metric!=='perday'?[{name:'Proyeksi bulan penuh',values:ser.v.map((v,i)=>i===D.P-1?Math.round(v*D.agg.monthly[i].days/D.pdays[i]*(new Date(+D.periods[i].slice(0,4),+D.periods[i].slice(5),0).getDate())/D.agg.monthly[i].days):i===D.P-2?v:null),color:'#85837d',dash:true}]:[])],h:250,fmt:ser.fmt||(v=>fmtS(v)),act:'setper',hi:[[C.p,'hl-p'],[C.c,'hl-c']]})}
   <div class="legend"><span><i class="ln red"></i>Periode analisis: ${periodLabel(C.p,true)}</span><span><i class="ln dash"></i>Pembanding: ${periodLabel(C.c,true)}</span>${isPartial(D.P-1)?`<span><i class="ln dash"></i>* ${periodLabel(D.P-1)} belum penuh — garis putus = proyeksi bulan penuh</span>`:''}</div></div>
   <div class="card attn"><div class="eyebrow red">↘ Perlu perhatian</div><div class="big">${fmtN(C.cnt.turun)} member<br>sales turun</div><p class="sub">Akumulasi selisih member yang turun vs ${periodLabel(C.c,true)}</p><div class="big red">${fmtS(C.downSum)}</div>
   <div class="kv"><span>Tidak belanja periode ini</span><b>${fmtN(C.cnt.absen)}</b></div><div class="kv"><span>Sleeper ≥ 60 hari</span><b>${fmtN(C.cnt.sleeper)}</b></div><div class="kv"><span>Kenaikan member lain</span><b class="pos">+${fmtS(C.upSum)}</b></div>
   <div class="btn-col"><button class="btn" data-act="goto" data-v="penurunan">Lihat prioritas member →</button></div></div></div>`;
  h+=`<div class="card mt"><div class="card-h"><div><h3>Komposisi member</h3><p class="sub">Status ${periodLabel(C.p)} dibanding ${periodLabel(C.c)} · klik untuk membuka daftar</p></div></div>${stackBar(ST_ORDER.map(k=>({k,v:C.cnt[k],c:ST[k].c,l:ST[k].l})),{act:'st'})}</div>`;
  h+=`<div class="grid g21 mt"><div class="card"><div class="card-h"><div><h3>Prioritas penurunan sales</h3><p class="sub">Selisih nominal terbesar · termasuk yang tidak belanja</p></div><button class="lnk" data-act="goto" data-v="penurunan">Lihat semua →</button></div>
   <div class="tbl-wrap flat"><table class="tbl"><thead><tr><th>Member</th><th class="num">Sales periode</th><th class="num">Perubahan</th><th>Status</th><th class="num">Aksi</th></tr></thead><tbody>${turnTop.map(r=>`<tr><td>${memCell(r.m)}</td><td class="num"><b>${fmtS(r.cur)}</b><div class="mut">${fmtS(r.prevAdj)} sebelumnya</div></td><td class="num"><span class="neg">${fmtS(r.delta)}</span><div class="mut">${sgnPct(r.chg,0)}</div></td><td>${stTag(r.st)}</td><td class="num">${actBtns(memEntOf(r.m))}</td></tr>`).join('')}</tbody></table></div></div>
   <div class="card"><div class="card-h"><div><h3>Paling banyak dibeli member</h3><p class="sub">Jumlah member pembeli · ${periodLabel(C.p)}</p></div><button class="lnk" data-act="goto" data-v="produk">Semua produk →</button></div><div id="topProd">${topProdHtml(8)}</div></div></div>`;
  h+=`<div class="sec-h"><h2>Project & ruang kerja</h2><button class="lnk" data-act="goto" data-v="project">Buka project →</button></div><div class="grid g4">${Object.entries(PROJ).map(([k,p])=>{const rows=k==='klik'?[...projRows('klik',{sub:'slp'}),...projRows('klik',{sub:'map'})]:projRows(k);const c=countBy(rows,statusOf);const done=rows.length-(c['Belum dihubungi']||0);
    return`<button class="card proj-mini" data-act="proj" data-k="${k}"><span class="eyebrow red">${p.n}</span><b>${esc(p.t)}</b><span class="pm-n">${fmtN(rows.length)}</span><div class="prog"><div style="width:${rows.length?done/rows.length*100:0}%"></div></div><span class="mut">${fmtN(done)} sudah ditindaklanjuti · ${fmtN(c['Berhasil']||0)} berhasil</span></button>`}).join('')}</div>`;
  const kd=kendalaCount(D.rkm).slice(0,6);
  h+=`<div class="grid g2 mt"><div class="card"><div class="card-h"><div><h3>Kendala terbanyak dari kunjungan MR</h3><p class="sub">${fmtN(D.rkm.length)} catatan RKM · klik untuk melihat catatan</p></div><button class="lnk" data-act="goto" data-v="kunjungan">Kunjungan MR →</button></div>${hbars(kd.map(([k,n])=>({k,l:k,v:n,c:'#eb6834'})),{act:'kendala'})}</div>
   <div class="card"><div class="card-h"><div><h3>Sleeper paling bernilai</h3><p class="sub">Belum belanja ≥ 60 hari, urut rata-rata sales 6 bulan sebelum berhenti</p></div><button class="lnk" data-act="st" data-k="sleeper">Semua sleeper →</button></div>${sleeperValuable(6)}</div></div>`;
  return h;
}
function sleeperValuable(n){const C=CALC;const arr=C.rows.filter(r=>r.st==='sleeper').map(r=>{const b=r.m.i*D.P;let q=-1;for(let k=C.p;k>=0;k--)if(D.G[b+k]>0){q=k;break}let s=0,c=0;for(let k=Math.max(0,q-5);k<=q;k++){s+=D.G[b+k];c++}return{r,avg:c?s/c:0}}).sort((a,b)=>b.avg-a.avg).slice(0,n);
  return`<div class="list">${arr.map(({r,avg})=>`<div class="li"><div style="flex:1">${memCell(r.m,`Terakhir ${fmtD(r.last)} · ${r.since} hari`)}</div><div class="num"><b>${fmtS(avg)}</b><div class="mut">rata-rata/bln</div></div>${actBtns(memEntOf(r.m),{detail:false})}</div>`).join('')}</div>`}
function kendalaCount(list){const m={};list.forEach(r=>String(r.issues||'').split(/,\s*(?=\d)/).forEach(x=>{const k=x.replace(/^\s*\d+\s*\.\s*/,'').trim();if(k)m[k]=(m[k]||0)+1}));return Object.entries(m).sort((a,b)=>b[1]-a[1])}
function topProdHtml(n){const P=D.prod[D.periods[CALC.p]];if(!P)return'<div class="empty">Memuat data produk…</div>';
  const arr=[...P].sort((a,b)=>b[5]-a[5]).slice(0,n);const mx=arr[0]?arr[0][5]:1;
  return`<div class="list">${arr.map((x,i)=>`<button class="li prod-li" data-act="prod" data-k="${esc(x[0])}"><span class="rank">${i+1}</span><div style="flex:1;text-align:left"><div class="nm">${esc(x[1])}</div><div class="bar-track sm"><div class="bar-fill" style="width:${x[5]/mx*100}%;background:#86b6ef"></div></div><div class="mut">PLU ${esc(x[0])} · ${fmtS(x[8])}</div></div><div class="num"><b>${fmtN(x[5])}</b><div class="mut">member</div></div></button>`).join('')}</div>`}

/* ===== DATABASE ===== */
function vDatabase(){const f=F('database');const C=CALC;const base=C.rows;const rows=memberFilter('database',base);
  const cnt=countBy(memberFilter('database',base.filter(()=>true)).length?base:base,r=>r.st);
  const MAIN=['turun','absen','sleeper'],cur=f.st||'all',showAll=f.stmore||!['all','aktif',...MAIN].includes(cur);
  const chips=[{k:'all',l:'Semua',n:base.length},{k:'aktif',l:'Aktif belanja',n:C.act,dot:'#0ca30c'},...ST_ORDER.filter(k=>showAll||MAIN.includes(k)).map(k=>({k,l:ST[k].l,n:C.cnt[k],dot:ST[k].c}))];
  return pageHead('Database member',`${fmtN(D.mem.length)} member (${fmtN(D.mem.filter(m=>m.master).length)} di master per ${fmtD(D.masterAsOf)}) · ${periodNote()}`,`<button class="btn" data-act="x-xls">${IC.xls} Excel hasil filter</button><button class="btn" data-act="x-csv">${IC.csv} CSV My Maps</button>`)
  +filterChips('database.st',chips,cur).replace(/<\/div>$/,`<button class="chip-b ghost" data-act="stmore">${showAll?'− Ringkas':'+ '+(ST_ORDER.length-MAIN.length)+' status lain'}</button></div>`)+memberFilterBar('database',rows)+memberTable('database',rows);
}
/* ===== PENURUNAN ===== */
/* Analisis cepat berhenti / turun tajam (3 mode) */
const DCLS=[['Berhenti','#d03b3b'],['Turun tajam','#ec835a'],['Turun','#eda100'],['Stabil','#a8a69f'],['Naik','#0ca30c']];
function declineIdx(){let c=D.P-1;while(c>0&&isPartial(c))c--;return{c,n:D.P-1}}
function declineRows(mode='okt',min=0){const{c,n}=declineIdx();const P=D.P;const sum=(b,a,z)=>{let t=0;for(let q=a;q<=z;q++)if(q>=0)t+=D.G[b+q]||0;return t};
  const [y,mo]=D.periods[n].split('-').map(Number);const dim=new Date(y,mo,0).getDate();const fac=isPartial(n)?dim/Math.max(1,D.pdays[n]):1;
  const out=[];for(const m of D.mem){const b=m.i*P;let base,cur;
    if(mode==='nov'){base=sum(b,c,c);cur=(D.G[b+n]||0)*(n===c?1:fac)}else if(mode==='q'){base=sum(b,c-5,c-3);cur=sum(b,c-2,c)}else{base=sum(b,c-3,c-1)/3;cur=sum(b,c,c)}
    if(base<=0&&cur<=0)continue;if(base<min&&cur<min)continue;const p=base>0?cur/base-1:Infinity;
    const cls=base>0&&cur<=0?'Berhenti':p<=-0.5?'Turun tajam':p<=-0.2?'Turun':p>=0.2?'Naik':'Stabil';out.push({m,base,cur,delta:cur-base,p,cls})}
  return out}
function declineLbl(mode){const{c,n}=declineIdx();const L=i=>periodLabel(i,true);return mode==='nov'?`${L(n)} proyeksi vs ${L(c)}`:mode==='q'?`${L(c-2)}–${L(c)} vs ${L(c-5)}–${L(c-3)}`:`${L(c)} vs rata-rata ${L(c-3)}–${L(c-1)}`}
function declineBlock(){const f=F('penurunan');const mode=f.dm||'okt',min=f.dmin!=null?+f.dmin:1e6;const rows=declineRows(mode,min);const cc=countBy(rows,r=>r.cls);
  const sel=f.dcls||'';const list=sel?rows.filter(r=>r.cls===sel).sort((a,b)=>a.delta-b.delta):[];
  return`<div class="card mt"><div class="card-h"><h3>Berhenti & turun tajam</h3><div class="pill-row">${selectF('penurunan.dm','Bandingkan',[{v:'okt',l:'Bulan lalu vs rata-rata 3 bln'},{v:'nov',l:'Bulan berjalan (proyeksi) vs bulan lalu'},{v:'q',l:'3 bln terakhir vs 3 bln sebelumnya'}],mode)}${selectF('penurunan.dmin','Omzet min.',[{v:'0',l:'Semua'},{v:'1000000',l:'≥ Rp1 jt'},{v:'3000000',l:'≥ Rp3 jt'},{v:'10000000',l:'≥ Rp10 jt'}],String(min))}</div></div>
   <p class="sub">${esc(declineLbl(mode))} · klik kartu untuk melihat daftar</p><div class="grid g5">${DCLS.map(([k,c])=>`<button class="kpi-b ${sel===k?'on':''}" data-act="dcls" data-k="${k}" style="border-left:4px solid ${c}"><span class="lbl">${k}</span><b>${fmtN(cc[k]||0)}</b><span class="mut">${fmtS(sumBy(rows.filter(r=>r.cls===k),r=>r.delta))}</span></button>`).join('')}</div>
   ${sel?`<div id="dclsList" class="mt"><div class="small"><b>${esc(sel)}</b> · ${list.length} member </div><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Member</th><th class="num">Pembanding</th><th class="num">Sekarang</th><th class="num">Selisih</th><th>PIC</th><th class="num">Aksi</th></tr></thead><tbody>${list.slice(0,100).map(r=>{const e=memEnt(r.m);return`<tr><td>${memCell?memCell(r.m):esc(r.m.name)}</td><td class="num">${fmtS(r.base)}</td><td class="num">${fmtS(r.cur)}</td><td class="num neg">${fmtS(r.delta)}<div class="mut">${isFinite(r.p)?sgnPct(r.p,0):''}</div></td><td>${esc(picLbl(picOf(e))||'')}</td><td class="num">${actBtns(e)}</td></tr>`}).join('')}</tbody></table></div>${list.length>100?`<div class="small muted">+${list.length-100} lainnya — export Excel untuk semua.</div>`:''}</div>`:''}</div>`}
function vPenurunan(){const f=F('penurunan');const C=CALC;if(f.inc==null)f.inc=true;if(!f.sort)f.sort='delta',f.dir=1;
  let base=C.rows.filter(r=>r.st==='turun'||(f.inc&&r.st==='absen'));const rows=memberFilter('penurunan',base);
  const down=sumBy(rows,r=>Math.min(0,r.delta));const byKec={};base.forEach(r=>{const k=r.m.dist||'BELUM TERISI';byKec[k]=(byKec[k]||0)+r.delta});const kt=Object.entries(byKec).sort((a,b)=>a[1]-b[1]).slice(0,8);
  return pageHead('Penurunan sales',`Member dengan sales turun dibanding pembanding · ${periodNote()}`,`<button class="btn" data-act="x-xls">${IC.xls} Excel</button><button class="btn" data-act="x-ppt">${IC.ppt} PPT</button>`)
  +`<div class="grid g4">${kpiCard({l:'Member sales turun',v:fmtN(C.cnt.turun),note:'+ '+fmtN(C.cnt.absen)+' tidak belanja',accent:'red'})}${kpiCard({l:'Akumulasi penurunan',v:fmtS(C.downSum),note:'kelompok selisih negatif'})}${kpiCard({l:'Kenaikan member lain',v:'+'+fmtS(C.upSum),note:'bersih '+fmtS(C.upSum+C.downSum)})}${kpiCard({l:'Hasil filter',v:fmtN(rows.length),note:fmtS(down)+' selisih'})}</div>
  ${declineBlock()}<div class="grid g31 mt"><div>${filterChips('penurunan.incx',[{k:'1',l:'Turun + tidak belanja',n:C.cnt.turun+C.cnt.absen},{k:'0',l:'Hanya sales turun',n:C.cnt.turun}],f.inc?'1':'0')}${memberFilterBar('penurunan',rows)}${memberTable('penurunan',rows)}</div>
  <div class="card"><h3>Penurunan per kecamatan</h3><p class="sub">Klik untuk memfilter</p>${hbars(kt.map(([k,v])=>({k,l:title(k),v:-v,vl:fmtS(v),c:'#d03b3b'})),{act:'kecf',fmt:v=>fmtS(v)})}
   <div class="alert mt">Penurunan bisa tertutup kenaikan member lain. Angka ini bukan prediksi omzet.</div></div></div>`;
}
/* ===== PRODUK ===== */
async function ensureProd(p){const k=D.periods[p];if(D.prod[k])return D.prod[k];D.prod[k]=await getProducts(k);return D.prod[k]}
function vProduk(){const f=F('produk');const C=CALC;const kp=D.periods[C.p],kc=D.periods[C.c];const P=D.prod[kp],Q=D.prod[kc];
  if(!P||!Q){Promise.all([ensureProd(C.p),ensureProd(C.c)]).then(()=>S.view==='produk'&&rerender());return pageHead('Performa produk',periodNote())+'<div class="card empty">Memuat data produk…</div>'}
  const qm={};Q.forEach(x=>qm[x[0]]=x);const metric=f.m||'members';const mi={members:5,gross:8,qty:7,receipts:6,margin:9}[metric];
  const divs=countBy(P,x=>x[2]||'-');
  let rows=P.map(x=>{const q=qm[x[0]];return{x,q,dm:q?x[5]-q[5]*C.pr:x[5],dg:q&&q[8]?x[8]/(q[8]*C.pr)-1:null}});
  if(f.div)rows=rows.filter(r=>(r.x[2]||'-')===f.div);if(f.q){const q=f.q.toLowerCase();rows=rows.filter(r=>(r.x[1]+' '+r.x[0]).toLowerCase().includes(q))}
  if(f.tr==='up')rows=rows.filter(r=>r.dm>0);if(f.tr==='down')rows=rows.filter(r=>r.dm<0);if(f.tr==='new')rows=rows.filter(r=>!r.q);
  rows.sort((a,b)=>f.sortd==='dm'?a.dm-b.dm:b.x[mi]-a.x[mi]);
  const page=f.page||0,size=40;const sl=rows.slice(page*size,(page+1)*size);const totG=sumBy(P,x=>x[8]);
  return pageHead('Performa produk',`${fmtN(P.length)} item dibeli member · ${periodNote()}`,`<button class="btn" data-act="x-xls">${IC.xls} Excel</button>`)
  +`<div class="grid g4">${kpiCard({l:'Item terjual',v:fmtN(P.length),d:Q.length?P.length/Q.length-1:null,note:'PLU berbeda'})}${kpiCard({l:'Gross item',v:fmtS(totG),note:'total dari file per produk'})}${kpiCard({l:'Item paling luas',v:fmtN([...P].sort((a,b)=>b[5]-a[5])[0]?.[5]||0)+' member',note:esc([...P].sort((a,b)=>b[5]-a[5])[0]?.[1]||'')})}${kpiCard({l:'Item baru muncul',v:fmtN(P.filter(x=>!qm[x[0]]).length),note:'tidak ada di '+periodLabel(C.c,true),act:'data-act="fset" data-v="produk.tr" data-k="new"'})}</div>
  <div class="fbar mt"><input class="search" placeholder="Cari nama item atau PLU…" data-act="fq" data-v="produk" value="${esc(f.q||'')}">
   <div class="seg-t">${[['members','Jumlah member'],['gross','Gross'],['qty','Qty'],['receipts','Struk'],['margin','Margin']].map(([k,l])=>`<button class="${metric===k?'on':''}" data-act="fset" data-v="produk.m" data-k="${k}">${l}</button>`).join('')}</div>
   ${selectF('produk.tr','Tren',[{v:'',l:'Semua'},{v:'up',l:'Member naik'},{v:'down',l:'Member turun'},{v:'new',l:'Baru muncul'}],f.tr)}
   ${selectF('produk.div','Divisi',[{v:'',l:'Semua'},...Object.entries(divs).sort((a,b)=>b[1]-a[1]).map(([k,n])=>({v:k,l:`Divisi ${k} (${n})`}))],f.div)}
   ${selectF('produk.sortd','Urutkan',[{v:'',l:'Nilai terbesar'},{v:'dm',l:'Kehilangan member terbanyak'}],f.sortd)}</div>
  <div class="tbl-wrap"><table class="tbl"><thead><tr><th>#</th><th>Item</th><th class="num">Member</th><th class="num">Δ member</th><th class="num">Struk</th><th class="num">Qty</th><th class="num">Gross</th><th class="num">Δ gross</th><th class="num">Margin %</th><th></th></tr></thead><tbody>
  ${sl.map((r,i)=>`<tr class="click" data-act="prod" data-k="${esc(r.x[0])}"><td class="mut">${page*size+i+1}</td><td><div class="nm">${esc(r.x[1])}</div><div class="mut">PLU ${esc(r.x[0])} · Div ${esc(r.x[2])} · Dept ${esc(r.x[3])}</div></td><td class="num"><b>${fmtN(r.x[5])}</b></td><td class="num"><span class="${r.dm<0?'neg':r.dm>0?'pos':''}">${r.q?(r.dm>0?'+':'')+fmtN(r.dm):'baru'}</span></td><td class="num">${fmtN(r.x[6])}</td><td class="num">${fmtN(r.x[7])}</td><td class="num">${fmtS(r.x[8])}</td><td class="num"><span class="${r.dg<0?'neg':'pos'}">${r.dg==null?'–':sgnPct(r.dg,0)}</span></td><td class="num">${r.x[8]?pct(r.x[9]/r.x[8],1):'–'}</td><td class="num"><span class="lnk">Tren ›</span></td></tr>`).join('')}</tbody></table></div>${pager('produk',rows.length,page,size)}`;
}
async function prodModal(plu){const bg=modal('Tren item',`<div class="empty">Memuat 12 bulan terakhir…</div>`,{wide:true});
  const idx=Array.from({length:Math.min(12,D.P)},(_,i)=>D.P-Math.min(12,D.P)+i);for(const i of idx)await ensureProd(i);
  const vals=idx.map(i=>D.prod[D.periods[i]].find(x=>x[0]===plu));const name=(vals.filter(Boolean).pop()||[])[1]||plu;
  $('.modal-h h3',bg).textContent=name;
  $('.modal-b',bg).innerHTML=`<p class="sub">PLU ${esc(plu)} · 12 bulan terakhir · klik di luar untuk menutup</p><h4>Jumlah member pembeli</h4>${barsV({labels:idx.map(i=>periodLabel(i,true)),values:vals.map(v=>v?v[5]:0),fmt:v=>fmtN(v),colors:idx.map(i=>i===CALC.p?'#c8102e':'#86b6ef'),h:180})}<h4>Gross sales</h4>${barsV({labels:idx.map(i=>periodLabel(i,true)),values:vals.map(v=>v?v[8]:0),colors:idx.map(i=>i===CALC.p?'#c8102e':'#2a78d6'),h:180})}
  <table class="tbl mt"><thead><tr><th>Periode</th><th class="num">Member</th><th class="num">Struk</th><th class="num">Qty</th><th class="num">Gross</th></tr></thead><tbody>${idx.map((i,k)=>`<tr><td>${periodLabel(i)}</td><td class="num">${vals[k]?fmtN(vals[k][5]):'–'}</td><td class="num">${vals[k]?fmtN(vals[k][6]):'–'}</td><td class="num">${vals[k]?fmtN(vals[k][7]):'–'}</td><td class="num">${vals[k]?fmtS(vals[k][8]):'–'}</td></tr>`).join('')}</tbody></table>`;
}
/* ===== POLA TRANSAKSI ===== */
function vPola(){const f=F('pola');const C=CALC;const key=D.periods[C.p];const days=D.agg.daily.filter(d=>d[0].startsWith(key));const keyc=D.periods[C.c];const daysC=D.agg.daily.filter(d=>d[0].startsWith(keyc));
  const m=f.m||'gross';const mi={gross:1,receipts:3,members:7}[m];const fm=m==='gross'?(v=>fmtS(v)):(v=>fmtN(v));
  const wd=['Min','Sen','Sel','Rab','Kam','Jum','Sab'];const by=Array.from({length:7},()=>[0,0]);const rng=f.wr==='3'?D.agg.daily.filter(d=>{const i=D.periods.indexOf(d[0].slice(0,7));return i>C.p-3&&i<=C.p}):days;
  rng.forEach(d=>{const w=toDate(d[0]).getDay();by[w][0]+=d[mi];by[w][1]++});const wv=by.map(x=>x[1]?x[0]/x[1]:0);const order=[1,2,3,4,5,6,0];
  const A=D.agg.monthly;const klik=A.map(x=>x.ch&&x.ch.Klik?x.ch.Klik[0]:0),toko=A.map(x=>x.ch&&x.ch.Toko?x.ch.Toko[0]:0);
  const best=[...days].sort((a,b)=>b[mi]-a[mi])[0];const tot=sumBy(days,d=>d[mi]),totC=sumBy(daysC,d=>d[mi]);
  return pageHead('Pola transaksi',`Harian, mingguan dan kanal belanja · ${periodNote()}`,'')
  +`<div class="grid g4">${kpiCard({l:'Rata-rata per hari',v:fm(days.length?tot/days.length:0),d:daysC.length&&totC?(tot/days.length)/(totC/daysC.length)-1:null,note:`${days.length} hari data`,accent:'red'})}${kpiCard({l:'Hari tertinggi',v:best?fmtD(toDate(best[0])):'–',note:best?fm(best[mi]):''})}${kpiCard({l:'Porsi Klik',v:pct(C.ap&&C.ap.ch&&C.ap.ch.Klik?C.ap.ch.Klik[0]/((C.ap.ch.Klik[0]+(C.ap.ch.Toko?C.ap.ch.Toko[0]:0))||1):0,1),note:fmtS(C.ap?.ch?.Klik?.[0]||0)+' via Klik'+(C.ap&&C.ap.chDays&&C.ap.chDays<C.ap.days?` · kanal s/d tgl ${C.ap.chDays}`:'')})}${kpiCard({l:'Retur (struk)',v:fmtN(sumBy(days,d=>d[4])),note:'struk retur di periode'})}</div>
  <div class="card mt"><div class="card-h"><div><h3>Harian ${periodLabel(C.p)}</h3><p class="sub">Batang merah = Sabtu/Minggu</p></div><div class="seg-t">${[['gross','Sales'],['receipts','Struk'],['members','Member aktif']].map(([k,l])=>`<button class="${m===k?'on':''}" data-act="fset" data-v="pola.m" data-k="${k}">${l}</button>`).join('')}</div></div>
  ${barsV({labels:days.map(d=>String(+d[0].slice(8))),values:days.map(d=>d[mi]),fmt:fm,colors:days.map(d=>{const w=toDate(d[0]).getDay();return w===0||w===6?'#e34948':'#2a78d6'}),h:230,tips:days.map(d=>`${fmtD(toDate(d[0]))} (${wd[toDate(d[0]).getDay()]})\nSales ${fmtS(d[1])}\nStruk ${fmtN(d[3])} · member ${fmtN(d[7])}\nKlik ${fmtS(d[5])} · Toko ${fmtS(d[6])}`)})}</div>
  <div class="grid g2 mt"><div class="card"><div class="card-h"><div><h3>Rata-rata per hari dalam minggu</h3><p class="sub">${f.wr==='3'?'3 bulan terakhir':'Periode analisis'}</p></div><div class="seg-t"><button class="${f.wr!=='3'?'on':''}" data-act="fset" data-v="pola.wr" data-k="1">1 bulan</button><button class="${f.wr==='3'?'on':''}" data-act="fset" data-v="pola.wr" data-k="3">3 bulan</button></div></div>
   ${hbars(order.map(i=>({l:wd[i],v:wv[i],vl:fm(wv[i]),c:i===0||i===6?'#e34948':'#2a78d6'})),{lw:'60px'})}</div>
   <div class="card"><h3>Kanal: Toko vs Klik</h3><p class="sub">Gross per bulan · klik titik untuk ganti periode</p>${lineChart({labels:D.periods.map((_,i)=>periodLabel(i,true)),series:[{name:'Toko',values:toko,color:'#2a78d6'},{name:'Klik',values:klik,color:'#eb6834'}],h:240,w:560,act:'setper',hi:[[C.p,'hl-p']],area:false,tipExtra:i=>`\nPorsi Klik ${pct(klik[i]/(klik[i]+toko[i]||1),1)}`})}<div class="legend"><span><i class="ln" style="background:#2a78d6"></i>Toko</span><span><i class="ln" style="background:#eb6834"></i>Klik</span></div></div></div>`;
}

/* ===== validasi data ===== */
const PKU={lat:0.507,lng:101.447};
let _dupPh=null;function dupPhones(){if(_dupPh)return _dupPh;const c={};D.mem.forEach(m=>{if(m.phone)c[m.phone]=(c[m.phone]||0)+1});_dupPh=c;return c}
const VCHK=[
  {k:'nocoord',l:'Member tanpa koordinat',d:'Tidak bisa tampil di peta / rute',f:m=>!m.coord},
  {k:'far',l:'Koordinat > 60 km dari Pekanbaru',d:'Kemungkinan salah input titik',f:m=>m.coord&&distKm(PKU,m.coord)>60},
  {k:'nophone',l:'Member tanpa No HP',d:'Tidak bisa di-WA',f:m=>!m.phone},
  {k:'dupph',l:'No HP dipakai > 1 member',d:'Perlu dicek duplikat / salah input',f:m=>m.phone&&dupPhones()[m.phone]>1},
  {k:'nokec',l:'Kecamatan kosong',d:'Analisis wilayah jadi "Belum terisi"',f:m=>!m.dist},
  {k:'outside',l:'Transaksi di luar master',d:'Ada belanja tapi tidak ada di master member',f:(m,r)=>!m.master&&D.G.subarray(m.i*D.P,(m.i+1)*D.P).some(v=>v>0)},
  {k:'nostruk',l:'Master tanpa transaksi',d:'Terdaftar tapi belum pernah belanja sejak Jan 2025',f:(m,r)=>m.master&&!D.G.subarray(m.i*D.P,(m.i+1)*D.P).some(v=>v>0)}];
function validasiHtml(){const items=VCHK.map(v=>({...v,n:D.mem.filter(m=>v.f(m)).length}));const rkmNo=D.rkm.filter(r=>!D.byCode[U(r.code)]).length;
  return`<div class="sec-h"><h2>Validasi data</h2><span class="mut">Klik untuk membuka daftar & memperbaikinya</span></div><div class="grid g4">${items.map(v=>`<button class="card kpi click" data-act="vchk" data-k="${v.k}"><div class="kpi-top"><span class="lbl">${esc(v.l)}</span><span class="kpi-ic" style="background:${v.n?'#fbeaea':'#e7f6e7'};color:${v.n?'#a12828':'#006300'}">${v.n?'!':'✓'}</span></div><div class="val">${fmtN(v.n)}</div><div class="note">${esc(v.d)}</div></button>`).join('')}<div class="card kpi"><div class="kpi-top"><span class="lbl">RKM tidak cocok master</span></div><div class="val">${fmtN(rkmNo)}</div><div class="note">kode member di RKM tidak ditemukan</div></div></div>`}
