'use strict';
/* ===== Smart importer: file mentah format apa pun → dataset dashboard ===== */
const SYN=[
  ['plu',/^(PLU|PRDCD|KODE ?(BARANG|ITEM|PRODUK|PLU)|SKU|ITEM ?CODE)$/],
  ['desc',/DESK|DESC|^NAMA ?(BARANG|ITEM|PRODUK)|ITEM ?NAME|^PRODUK$/],
  ['code',/^(KODE( MEMBER| CUST(OMER)?| PELANGGAN| MM)?|NO(MOR)?\.? ?MEMBER|KD ?MEMBER|ID ?MEMBER|MEMBER ?(ID|CODE|NO)|CUST(OMER)? ?(CODE|ID|NO)|KODE ?CUS(T)?|MEMBER)$/],
  ['name',/^(NAMA( MEMBER| CUSTOMER| TOKO| PELANGGAN| CUST)?|MEMBER NAME|CUSTOMER NAME|NAMA PEMILIK.*)$/],
  ['members',/^(JML |JUMLAH )?(MEMBER|CUSTOMER|PELANGGAN)S?( BELI| PEMBELI)?$/],
  ['date',/^(TGL|TANGGAL|DATE|TRX ?DATE|TIMESTAMP|WAKTU)( ?(TRANSAKSI|STRUK|TRX|BELANJA|RKM|KUNJUNGAN))?$/],
  ['last',/TERAKHIR|^LAST/],
  ['receipt',/^(NO\.? ?)?(STRUK|NOTA|RECEIPT|INVOICE|FAKTUR) ?(NO|ID)?$|TRANS(AKSI)? ?(NO|ID)|NO ?TRX/],
  ['struk',/^(JML |JUMLAH )?(STRUK|TRANSAKSI|TRX)$/],
  ['gross',/GROSS|BRUTO|^(SALES|PENJUALAN|OMSET|OMZET|RUPIAH|AMOUNT)$|^TOTAL( SALES| BELANJA| PENJUALAN| RP| NILAI)?$|^NILAI( SALES| PENJUALAN)?$/],
  ['margin',/^MARGIN$|^LABA|PROFIT/],['qty',/QTY|KUANTITAS|^PCS$|^JUMLAH (BARANG|PCS)$/],['kunj',/KUNJUNGAN|VISIT/],
  ['sub',/SUB ?OUTLET|^SUB$/],['tier',/SEGMENTASI|TIER/],['cat',/KATEGORI|CATEGORY|JENIS (USAHA|TOKO)/],['addr',/ALAMAT|ADDRESS/],['vil',/KELURAHAN|^DESA|VILLAGE/],['dist',/KECAMATAN|DISTRICT/],['city',/^KOTA|KABUPATEN|^KAB|CITY/],
  ['phone',/(^|NO\.? ?)(HP|TELP|TELEPON|WA|PHONE|HANDPHONE)/],['coord',/KOORDINAT|COORDINATE|LAT ?, ?LONG|LATLONG/],['lat',/^LAT(ITUDE)?$/],['lng',/^(LNG|LONG|LON|LONGITUDE)$/],
  ['pic',/ADVISOR|^PIC$|SALES ?MAN|PETUGAS|SURVEYOR/],['type',/JENIS ?RKM|^TIPE|^TYPE/],['issues',/KENDALA|HASIL ?RKM|ISSUE/],['notes',/KETERANGAN|CATATAN|^NOTES?$|DETAIL/],
  ['div',/^DIV/],['dept',/^DEP/],['kat',/^KAT/]];
const SCHEMA={
  hist:{l:'Sales per member (rekap per member)',req:['code','gross'],opt:['margin','struk','kunj','last','name','sub']},
  tx:{l:'Transaksi mentah (per struk / per baris)',req:['code','date','gross'],opt:['margin','receipt','name','sub']},
  prod:{l:'Sales per produk (rekap)',req:['plu','members'],opt:['desc','gross','qty','struk','margin','div','dept','kat']},
  prodtx:{l:'Transaksi item mentah (per baris item)',req:['plu','code'],opt:['date','desc','qty','gross','margin','receipt','div','dept','kat']},
  master:{l:'Master / profil member',req:['code','name'],opt:['sub','tier','cat','addr','vil','dist','city','phone','coord','lat','lng']},
  rkm:{l:'RKM / catatan kunjungan',req:['code','date','pic'],opt:['name','type','issues','notes']}};
const FLBL={code:'Kode member',name:'Nama',gross:'Gross / nilai sales',margin:'Margin',struk:'Jumlah struk',kunj:'Kunjungan',last:'Belanja terakhir',date:'Tanggal',receipt:'No struk',plu:'PLU',desc:'Deskripsi',members:'Jumlah member',qty:'Qty',sub:'Sub outlet',tier:'Tier/segmentasi',cat:'Kategori',addr:'Alamat',vil:'Kelurahan',dist:'Kecamatan',city:'Kota',phone:'No HP',coord:'Koordinat',lat:'Latitude',lng:'Longitude',pic:'Advisor/PIC',type:'Jenis RKM',issues:'Kendala',notes:'Keterangan',div:'Divisi',dept:'Dept',kat:'Kategori produk'};
function guessHeader(a){let best=0,bs=-1;for(let i=0;i<Math.min(15,a.length);i++){const r=a[i]||[];let s=0;r.forEach(v=>{const u=U(v);if(u&&SYN.some(([,re])=>re.test(u)))s++});if(s>bs){bs=s;best=i}}return best}
function mapCols(h){const m={};h.forEach((v,i)=>{const u=U(v).replace(/\s+/g,' ');if(!u)return;for(const [k,re] of SYN){if(re.test(u)&&m[k]==null){m[k]=i;break}}});return m}
function guessType(m,a,hi){const has=k=>m[k]!=null;
  if(has('plu'))return has('members')?'prod':has('code')?'prodtx':'prod';
  if(has('code')&&has('gross')){if(has('date')){const codes=new Set();let n=0;for(let i=hi+1;i<a.length&&n<3000;i++){const r=a[i];if(r&&r[m.code]!=null){codes.add(String(r[m.code]));n++}}if(n/Math.max(1,codes.size)>1.3)return'tx'}return'hist'}
  if(has('code')&&has('pic')&&(has('issues')||has('notes')))return has('date')?'rkm':null;
  if(has('code')&&has('name')&&['addr','vil','dist','phone','coord','lat'].some(has))return'master';
  return null}
function periodGuess(fname,a,hi,col){const p=periodFromName(fname);if(p)return p;if(col==null)return null;const c={};for(let i=hi+1;i<Math.min(a.length,hi+3000);i++){const d=toDate(a[i]&&a[i][col]);if(d){const k=iso(d).slice(0,7);c[k]=(c[k]||0)+1}}return Object.entries(c).sort((x,y)=>y[1]-x[1])[0]?.[0]||null}
async function smartImport(file,aoaSheets,fname){
  // pick sheet with best header score
  let best=null;for(const [sn,a] of aoaSheets){const hi=guessHeader(a);const m=mapCols(a[hi]||[]);const sc=Object.keys(m).length;if(!best||sc>best.sc)best={sn,a,hi,m,sc}}
  if(!best)throw new Error('file kosong');let type=guessType(best.m,best.a,best.hi);const ctx={...best,type,fname,sheets:aoaSheets};
  const ready=()=>{const sch=SCHEMA[ctx.type];if(!sch||!sch.req.every(f=>ctx.m[f]!=null))return false;if(['hist','prod'].includes(ctx.type)){ctx.period=ctx.period||periodGuess(fname,ctx.a,ctx.hi,ctx.m.last??ctx.m.date)||(rangeFromName(fname)||{}).p;return!!ctx.period}return true};
  if(!ready()){try{await aiMap(ctx)}catch(e){console.warn('aiMap',e)}}
  if(ready()){try{return await processImport(ctx)}catch(e){ctx.note='Otomatis gagal: '+e.message}}
  const id='i'+Date.now();(S._imp=S._imp||{})[id]=ctx;const e=new Error('isi file belum dikenali');e.imp=id;throw e}
function confirmImport(ctx){return new Promise(resolve=>{const {a}=ctx;
  const render=()=>{const sch=SCHEMA[ctx.type];const h=a[ctx.hi]||[];const opts=`<option value="">—</option>`+h.map((v,i)=>`<option value="${i}">${esc(String(v??'').slice(0,40)||('Kolom '+(i+1)))}</option>`).join('');
    const fields=sch?[...sch.req,...sch.opt]:[];const per=['hist','prod'].includes(ctx.type)?(ctx.period||periodGuess(ctx.fname,a,ctx.hi,ctx.m.last??ctx.m.date)):null;ctx.period=per;
    return`<div class="small muted">File <b>${esc(ctx.fname)}</b> · sheet ${esc(ctx.sn)} · ${fmtN(a.length-ctx.hi-1)} baris data · header di baris ${ctx.hi+1}</div>
     <div class="fbar"><label class="sel"><span>Jenis data</span><select id="imType"><option value="">— pilih —</option>${Object.entries(SCHEMA).map(([k,v])=>`<option value="${k}" ${ctx.type===k?'selected':''}>${v.l}</option>`).join('')}</select></label>
     <label class="sel"><span>Baris header</span><select id="imHi">${Array.from({length:Math.min(15,a.length)},(_,i)=>`<option value="${i}" ${i===ctx.hi?'selected':''}>Baris ${i+1}</option>`).join('')}</select></label>
     ${per!==null||['hist','prod'].includes(ctx.type)?`<label class="sel"><span>Bulan</span><input class="inp" id="imPer" type="month" value="${esc(per||'')}"></label>`:''}
     <button class="btn sm" id="imAI">✨ Minta Claude memetakan kolom</button></div>
     ${sch?`<div class="map-grid">${fields.map(f=>`<label class="${sch.req.includes(f)?'rq':''}"><span>${FLBL[f]}${sch.req.includes(f)?' *':''}</span><select data-f="${f}">${opts}</select></label>`).join('')}</div>`:'<div class="alert red">Jenis data belum dikenali. Pilih jenis data di atas atau klik "Minta Claude memetakan kolom".</div>'}
     <div class="tbl-wrap mt" style="max-height:220px"><table class="tbl"><thead><tr>${h.map(v=>`<th>${esc(v??'')}</th>`).join('')}</tr></thead><tbody>${a.slice(ctx.hi+1,ctx.hi+6).map(r=>`<tr>${h.map((_,i)=>{let v=(r||[])[i];if((i===ctx.m.date||i===ctx.m.last)&&typeof v==='number'){const d=toDate(v);if(d)v=iso(d)}return`<td class="small">${esc(String(v??'').slice(0,40))}</td>`}).join('')}</tr>`).join('')}</tbody></table></div>
     ${ctx.type==='tx'?'<div class="alert mt">Transaksi mentah dijumlahkan otomatis per member per hari. Tanggal yang sudah tercakup data sebelumnya tidak dihitung dua kali.</div>':''}${ctx.type==='prodtx'?'<div class="alert mt">Item mentah dijumlahkan per PLU per bulan dan <b>mengganti</b> data produk bulan itu.</div>':''}${ctx.note?`<div class="alert mt">${esc(ctx.note)}</div>`:''}`};
  const bg=modal('Periksa data sebelum diproses',`<div id="imBody">${render()}</div>`,{wide:true,okLbl:'Proses & simpan',ok:async b=>{readBack(b);const sch=SCHEMA[ctx.type];if(!sch){toast('Pilih jenis data');return false}const miss=sch.req.filter(f=>ctx.m[f]==null);if(miss.length){toast('Kolom wajib belum dipilih: '+miss.map(f=>FLBL[f]).join(', '));return false}
      try{const n=await processImport(ctx);resolve(n)}catch(e){toast('Gagal: '+e.message);return false}}});
  const sync=()=>{$$('select[data-f]',bg).forEach(s=>{const f=s.dataset.f;s.value=ctx.m[f]!=null?String(ctx.m[f]):''})};
  const readBack=b=>{$$('select[data-f]',b).forEach(s=>{ctx.m[s.dataset.f]=s.value===''?null:+s.value});const p=$('#imPer',b);if(p)ctx.period=p.value||null};
  const rebind=()=>{sync();$('#imType',bg).onchange=e=>{readBack(bg);ctx.type=e.target.value||null;$('#imBody',bg).innerHTML=render();rebind()};
    $('#imHi',bg).onchange=e=>{ctx.hi=+e.target.value;ctx.m=mapCols(a[ctx.hi]||[]);ctx.type=guessType(ctx.m,a,ctx.hi);$('#imBody',bg).innerHTML=render();rebind()};
    $('#imAI',bg).onclick=async()=>{const btn=$('#imAI',bg);btn.disabled=true;btn.textContent='Claude sedang membaca…';try{await aiMap(ctx);$('#imBody',bg).innerHTML=render();rebind()}catch(e){toast('Claude tidak tersedia: '+(e.code||e.message));btn.disabled=false;btn.textContent='✨ Minta Claude memetakan kolom'}}};
  rebind();bg.addEventListener('click',e=>{if(e.target.closest('[data-close]'))resolve(null)});
  if(!ctx.type)setTimeout(()=>$('#imAI',bg)?.click(),300)})}
async function aiMap(ctx){if(!(await waitClaude(3000)))throw new Error('tidak di claude.ai');const sample=await claude.use('sample');if(!sample)throw new Error('akses Claude tidak tersedia');
  const h=(ctx.a[ctx.hi]||[]).map((v,i)=>`${i}: ${String(v??'').slice(0,50)}`).join('\n');const rows=ctx.a.slice(ctx.hi+1,ctx.hi+6).map(r=>JSON.stringify((r||[]).map(v=>String(v??'').slice(0,40)))).join('\n');
  const prompt=`Kamu memetakan file Excel mentah dari Indogrosir Pekanbaru (data Member Merah) ke skema dashboard.\nNama file: ${ctx.fname}\nKolom (indeks: header):\n${h}\nContoh 5 baris:\n${rows}\n\nJenis data yang mungkin:\n${Object.entries(SCHEMA).map(([k,v])=>`- ${k}: ${v.l}; wajib ${v.req.join(', ')}; opsional ${v.opt.join(', ')}`).join('\n')}\nArti field: ${Object.entries(FLBL).map(([k,v])=>k+'='+v).join('; ')}.\nCatatan: "hist" = satu baris per member (sudah direkap); "tx" = banyak baris per member dengan tanggal; "prod" = satu baris per PLU dengan jumlah member; "prodtx" = baris item per transaksi.\nJawab HANYA JSON: {"type":"<jenis>","map":{"<field>":<indeks kolom>},"period":"YYYY-MM atau null","note":"penjelasan singkat bahasa Indonesia"}`;
  let v;const opts={modelTier:'quick'};if(typeof sample.json==='function')v=await sample.json(prompt,opts);else{const r=await sample(prompt,opts);v=JSON.parse(r.text.replace(/^[^{]*/,'').replace(/[^}]*$/,''))}
  if(!v||!SCHEMA[v.type])throw new Error('jawaban Claude tidak dikenali');ctx.type=v.type;ctx.m={};Object.entries(v.map||{}).forEach(([k,i])=>{if(i!=null&&i!==''&&!isNaN(+i))ctx.m[k]=+i});if(v.period&&/^\d{4}-\d{2}$/.test(v.period))ctx.period=v.period;ctx.note='Claude: '+(v.note||'kolom dipetakan');}
async function processImport(ctx){const {a,hi,m,type}=ctx;const rows=a.slice(hi+1).filter(r=>r&&r.some(v=>v!=null&&v!==''));const g=(r,k)=>m[k]!=null?r[m[k]]:null;let n=0;
  if(type==='hist'){const p=ctx.period;if(!p)throw new Error('bulan belum diisi');let mx=0;const out=[],byC=new Map();for(const r of rows){const c=g(r,'code');if(c==null||c===''||/TOTAL/i.test(String(c)))continue;const d=toDate(g(r,'last'));const day=d&&iso(d).startsWith(p)?d.getDate():0;if(day>mx)mx=day;const gr=Math.round(num(g(r,'gross'))),k=U(c);const o=byC.get(k);const st=m.struk!=null?num(g(r,'struk')):(gr>0?1:0),kj=m.kunj!=null?num(g(r,'kunj')):st;if(o){o[1]+=gr;o[2]+=Math.round(num(g(r,'margin')));o[3]+=st;o[4]+=kj;o[5]=Math.max(o[5],day)}else{const x=[String(c),gr,Math.round(num(g(r,'margin'))),st,kj,day,String(g(r,'name')??''),String(g(r,'sub')??'')];byC.set(k,x);out.push(x)}}
    const pm=String(ctx.fname).match(/(\d{1,2})\s*-\s*(\d{1,2})\s+[A-Za-z]+\s+\d{4}/),rg=rangeFromName(ctx.fname);await saveDataset('hist-'+p,{p,days:pm?+pm[2]:rg&&rg.p===p?rg.days:(mx||null),rows:out,kind:'member'},ctx.fname);n=out.length}
  else if(type==='tx'){const by={};for(const r of rows){const c=g(r,'code'),d=toDate(g(r,'date'));if(c==null||c===''||!d)continue;const k=iso(d);const o=(by[k]=by[k]||{});const cc=String(c);const x=o[cc]=o[cc]||{g:0,m:0,rc:new Set(),n:0,name:g(r,'name'),sub:g(r,'sub')};x.g+=num(g(r,'gross'));x.m+=num(g(r,'margin'));if(m.receipt!=null)x.rc.add(String(g(r,'receipt')));x.n++}
    const dates=Object.keys(by).sort();for(const d of dates){const rr=Object.entries(by[d]).map(([c,x])=>[c,Math.round(x.g),Math.round(x.m),m.receipt!=null?x.rc.size:x.n,1,String(x.name??''),String(x.sub??'')]);await saveDataset('txd-'+d,{d,rows:rr},ctx.fname);n+=rr.length}
    if(!dates.length)throw new Error('tidak ada tanggal yang terbaca')}
  else if(type==='prod'){const p=ctx.period;if(!p)throw new Error('bulan belum diisi');const out=rows.filter(r=>g(r,'plu')!=null&&g(r,'plu')!=='').map(r=>[String(g(r,'plu')),String(g(r,'desc')??''),String(g(r,'div')??''),String(g(r,'dept')??''),String(g(r,'kat')??''),num(g(r,'members')),num(g(r,'struk')),num(g(r,'qty')),Math.round(num(g(r,'gross'))),Math.round(num(g(r,'margin')))]);await saveDataset('prod-'+p,{p,rows:out},ctx.fname);n=out.length}
  else if(type==='prodtx'){const by={};for(const r of rows){const pl=g(r,'plu');if(pl==null||pl==='')continue;const d=toDate(g(r,'date'));const p=d?iso(d).slice(0,7):(ctx.period||periodFromName(ctx.fname));if(!p)continue;const o=(by[p]=by[p]||{});const k=String(pl);const x=o[k]=o[k]||{desc:g(r,'desc'),div:g(r,'div'),dept:g(r,'dept'),kat:g(r,'kat'),mem:new Set(),rc:new Set(),qty:0,g:0,m:0,n:0};x.mem.add(String(g(r,'code')));if(m.receipt!=null)x.rc.add(String(g(r,'receipt')));x.qty+=num(g(r,'qty'));x.g+=num(g(r,'gross'));x.m+=num(g(r,'margin'));x.n++}
    for(const [p,o] of Object.entries(by)){const out=Object.entries(o).map(([k,x])=>[k,String(x.desc??''),String(x.div??''),String(x.dept??''),String(x.kat??''),x.mem.size,m.receipt!=null?x.rc.size:x.n,x.qty,Math.round(x.g),Math.round(x.m)]);await saveDataset('prod-'+p,{p,rows:out},ctx.fname);n+=out.length}}
  else if(type==='master'){const prev=(S.raw.master&&S.raw.master.rows)||[];const map=new Map(prev.map(r=>[U(r[0]),r]));for(const r of rows){const c=g(r,'code');if(c==null||c==='')continue;let lat=num(g(r,'lat'))||null,lng=num(g(r,'lng'))||null;const co=parseCoord(g(r,'coord'));if(co){lat=co.lat;lng=co.lng}
      map.set(U(c),[String(c),String(g(r,'name')??''),String(g(r,'sub')??''),String(g(r,'tier')??''),String(g(r,'cat')??''),String(g(r,'addr')??''),String(g(r,'vil')??''),String(g(r,'dist')??''),String(g(r,'city')??''),String(g(r,'phone')??''),lat,lng]);n++}
    await saveDataset('master',{rows:[...map.values()]},ctx.fname)}
  else if(type==='rkm'){const prev=(S.raw.rkmx&&S.raw.rkmx.rows)||[];const key=r=>[U(r[0]),r[2],U(r[3]),String(r[6]).slice(0,30)].join('|');const map=new Map(prev.map(r=>[key(r),r]));
    for(const r of rows){const c=g(r,'code'),d=toDate(g(r,'date'));if(c==null||c===''||!d)continue;const x=[String(c),String(g(r,'name')??''),iso(d),U(g(r,'pic')),String(g(r,'type')??''),String(g(r,'issues')??''),String(g(r,'notes')??'')];map.set(key(x),x);n++}
    await saveDataset('rkmx',{rows:[...map.values()]},ctx.fname)}
  return n}
