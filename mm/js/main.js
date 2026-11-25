'use strict';
const NAV=[
  ['Analisis',[['ringkasan','Ringkasan','▦'],['database','Database member','☰'],['penurunan','Penurunan sales','↘'],['produk','Performa produk','◫'],['pola','Pola transaksi','▤'],['wilayah','Analisis wilayah','◎']]],
  ['Ruang kerja',[['project','Project','★'],['form','Isi form lapangan','✎'],['kunjungan','Kunjungan MR','☷'],['tindak','Tindak lanjut','✓'],['update','Update data','⇪'],['sumber','Sumber & validasi','ⓘ']]]];
const NAV_IC={ringkasan:'<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',database:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',penurunan:'<polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/>',produk:'<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.3 7 12 12 20.7 7"/><line x1="12" y1="22" x2="12" y2="12"/>',pola:'<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',wilayah:'<path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15"/><path d="M15 6v15"/>',project:'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',form:'<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v4"/><path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5"/><path d="M18.5 13.5a2.1 2.1 0 0 1 3 3L16 22l-4 1 1-4z"/>',kunjungan:'<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',tindak:'<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',update:'<path d="M4 14.9A7 7 0 1 1 15.7 8h1.8a4.5 4.5 0 0 1 2.5 8.2"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/>',sumber:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>'};
const NAV_COL={ringkasan:'#60a5fa',database:'#a78bfa',penurunan:'#f87171',produk:'#fbbf24',pola:'#34d399',wilayah:'#22d3ee',project:'#fb7185',form:'#f472b6',kunjungan:'#fb923c',tindak:'#4ade80',update:'#38bdf8',sumber:'#cbd5e1'};
const navIc=k=>`<span class="ni" style="--c:${NAV_COL[k]||'#cbd5e1'}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${NAV_IC[k]||''}</svg></span>`;
/* halaman khusus pemilik dashboard */
const OWNER_V=new Set(['update','sumber']);const isOwner=()=>!!(S.user&&S.user.isOwner&&S.user.isOwner());
const VIEWS={ringkasan:vRingkasan,database:vDatabase,penurunan:vPenurunan,produk:vProduk,pola:vPola,wilayah:vWilayah,project:vProject,kunjungan:vKunjungan,tindak:vTindak,update:vUpdate,sumber:vSumber,form:vForm};
const NOPER=new Set(['project','kunjungan','tindak','update','sumber','form']);
function setTheme(t){document.documentElement.dataset.theme=t;try{localStorage.setItem('igr2_theme',t)}catch(e){}}
(()=>{let t=null;try{t=localStorage.getItem('igr2_theme')}catch(e){}if(!t)t=matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=t})();
function shell(){
  $('#app').innerHTML=`<aside class="side" id="side"><div class="brand"><img class="brand-logo" src="img/logo-indogrosir.png" alt="Indogrosir"><span class="brand-sub">Pekanbaru · Member Merah</span></div>
   ${NAV.map(([g,items])=>`<div class="nav-g">${g}</div>${items.map(([k,l,i])=>`<button class="nav-i" data-act="goto" data-v="${k}" data-nav="${k}">${navIc(k)}<span class="nl">${l}</span><span class="nb" id="nb-${k}"></span></button>`).join('')}`).join('')}
   <div class="side-f"><span class="chip dark" id="chipDb"><span class="dot"></span>Database</span><div class="small">Data s/d <b id="asofS"></b></div><button class="theme-b" data-act="theme" aria-label="Ganti tema">☾ Tema gelap / terang</button>${window.__STANDALONE?'<button class="theme-b" data-act="pw-out">⎋ Keluar (kunci lagi)</button>':''}</div></aside>
   <div class="wrap"><header class="top"><button class="icon-btn menu" data-act="menu" aria-label="Menu">☰</button>
    <div class="gsearch"><input id="gq" placeholder="Cari member, kode, No HP…  (Ctrl+K)" autocomplete="off"><div class="gres" id="gres" hidden></div></div>
    <div class="per" id="perBox"></div><span class="sp"></span>
</header>
   <main id="main"></main></div><div id="drawer" class="drawer"></div><div class="tip" id="tip"></div>`;
}
function perBox(){const o=D.periods.map((_,i)=>`<option value="${i}">${periodLabel(i)}</option>`).reverse().join('');const part=isPartial(S.per)||isPartial(S.cmp);
  $('#perBox').innerHTML=NOPER.has(S.view)?'':`<label class="sel"><span>Periode analisis</span><select data-act="per">${o}</select></label><label class="sel"><span>Bandingkan dengan</span><select data-act="cmp">${o}</select></label>${part?`<label class="tg" data-tip="Periode belum penuh dibandingkan per hari"><input type="checkbox" data-act="prorata" ${S.prorata?'checked':''}> Pro-rata</label>`:''}`;
  const a=$('[data-act=per]'),b=$('[data-act=cmp]');if(a){a.value=S.per;b.value=S.cmp}}
function navBadges(){const set=(k,v)=>{const e=$('#nb-'+k);if(e){e.textContent=v||'';e.style.display=v?'':'none'}};set('penurunan',fmtN(CALC.cnt.turun));
  const due=Object.values(S.fu).filter(f=>f.due&&f.due<=iso(TODAY)&&!['Berhasil','Tidak berminat'].includes(f.status)).length;set('tindak',due?due+' janji':'')}
let lastView=null;
function rerender(){if(!CALC)return;const keep=lastView===S.view?scrollY:0;closeTip();
  const locked=OWNER_V.has(S.view)&&!isOwner();if(locked&&S._capsDone){S.view='ringkasan';try{history.replaceState(null,'','#ringkasan')}catch(e){}}
  $$('.nav-i').forEach(b=>{b.classList.toggle('on',b.dataset.nav===S.view);if(OWNER_V.has(b.dataset.nav))b.hidden=!isOwner()});perBox();navBadges();$('#asofS').textContent=fmtD(D.asOf);
  document.body.dataset.view=S.view;$('#main').innerHTML=OWNER_V.has(S.view)&&!isOwner()?'<div class="loading"><div class="spin"></div><b>Memeriksa akses pemilik…</b></div>':VIEWS[S.view]();mountMaps();bindDrop();dbxPersist();lastView=S.view;scrollTo(0,keep);}
const rerenderSoft=debounce(()=>{const a=document.activeElement;if(a&&a.closest&&a.closest('#main,#drawer')&&a.matches('input,textarea,select'))return;rerender();if(S.drawerId&&$('#drawer').classList.contains('on')){const sc=$('#drawer').scrollTop;openDrawer(S.drawerId);$('#drawer').scrollTop=sc}},300);
function closeTip(){const t=$('#tip');if(t)t.style.opacity=0}
function go(v){if(OWNER_V.has(v)&&!isOwner()){toast('Halaman ini hanya untuk pemilik dashboard');return}$$('.modal-bg').forEach(m=>m.remove());S.view=v;S.sel.clear();try{history.replaceState(null,'','#'+v)}catch(e){location.hash=v}rerender();scrollTo(0,0);$('#side').classList.remove('open')}
function setPer(p,c){S.per=p;S.cmp=c!=null?c:Math.max(0,p-1);if(S.cmp===S.per&&S.per>0)S.cmp=S.per-1;compute();buildProjects();rerender();if(S.drawerId)openDrawer(S.drawerId)}

/* ===== events ===== */
document.addEventListener('click',async e=>{const el=e.target.closest('[data-act]');if(!el)return;const a=el.dataset.act,v=el.dataset.v,k=el.dataset.k,id=el.dataset.id;
  if(['sel','sel-page','ftog','hide','fsel','per','cmp','prorata','fu'].includes(a))return; // handled on change
  switch(a){
  case'goto':if(el.closest('.modal-bg'))el.closest('.modal-bg').remove();go(v);break;
  case'menu':$('#side').classList.toggle('open');break;
  case'mem':e.preventDefault();openDrawer(id);break;
  case'dr-close':closeDrawer();break;
  case'dcls':{const f=F('penurunan');f.dcls=f.dcls===k?'':k;rerender();break}
  case'sync':{el.disabled=true;el.textContent='Menarik data…';await syncSheet(k);el.disabled=false;rerender();break}
  case'drive-check':driveCheck();break;
  case'theme':setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');break;
  case'wa-dlg':waDialog(entFor(id));break;
  case'list-adv':sendListToAdvisor(S._projRows||[],viewName());break;
  case'bulk-adv':sendListToAdvisor([...S.sel].map(entFor).filter(Boolean),viewName()+' · terpilih');break;
  case'wa':{const en=entOf(id);if(en&&statusOf(en)==='Belum dihubungi')saveFU(id,{status:'Sudah WA'},'WA dikirim dari dashboard');break}
  case'setper':setPer(+el.dataset.i);break;
  case'st':F('database').st=k==='aktif'?'aktif':k;F('database').page=0;go('database');break;
  case'fset':{const [vw,key]=v.split('.');const f=F(vw);if(key==='incx')f.inc=k==='1';else if(key==='st'&&k==='all')f.st='';else f[key]=f[key]===k&&['tr','kd','mon','pic'].includes(key)&&vw!=='tindak'?'':k;if(key==='ids'&&!k)f.ids=null;f.page=0;rerender();break}
  case'freset':{const f=F(v);Object.keys(f).forEach(x=>{if(!['sort','dir','inc'].includes(x))delete f[x]});rerender();break}
  case'page':F(v).page=+k;rerender();scrollTo(0,$('.tbl-wrap')?.getBoundingClientRect().top+scrollY-120||0);break;
  case'sort':{const f=F(v);if(f.sort===k)f.dir=-(f.dir||1);else{f.sort=k;f.dir=(k==='name'||k==='delta')?1:-1}f.page=0;rerender();break}
  case'sel-all':{const ents=v==='project'?(S._projRows||[]):currentEnts();ents.forEach(x=>S.sel.add(x.id));rerender();break}
  case'sel-clear':S.sel.clear();rerender();break;
  case'bulk-xls':{const by=new Map((S.view==='project'?S._projRows||[]:[]).map(x=>[x.id,x]));xlsx([['Terpilih',[...S.sel].map(i=>by.get(i)||entOf(i)).filter(Boolean).map(entRow)]],'Member terpilih');break}
  case'bulk-pic':modal(`Set PIC untuk ${S.sel.size} baris`,`<input class="inp" id="bp" list="bpl" placeholder="Nama PIC" style="width:100%"><datalist id="bpl">${(S.view==='project'&&S._projPics&&S._projPics.length?S._projPics:D.M.pics).map(p=>`<option value="${esc(p)}">`).join('')}</datalist>`,{ok:async bg=>{const p=U($('#bp',bg).value);if(!p)return false;if(!D.M.pics.includes(p))D.M.pics.push(p);bg.remove();await bulkFU('pic',p,'PIC')}});break;
  case'bulk-st':modal(`Set status untuk ${S.sel.size} baris`,`<select class="inp" id="bs" style="width:100%">${FU_ST.map(s=>`<option>${s}</option>`).join('')}</select>`,{ok:async bg=>{const s=$('#bs',bg).value;bg.remove();await bulkFU('status',s,'Status')}});break;
  case'x-xls':exportXlsx();break;
  case'x-ppt':exportPpt();break;
  case'x-csv':exportCsv();break;
  case'report':reportWA();break;
  case'prod':prodModal(k);break;
  case'kendala':F('kunjungan').kd=F('kunjungan').kd===k&&S.view==='kunjungan'?'':k;F('kunjungan').page=0;if(S.view!=='kunjungan')go('kunjungan');else rerender();break;
  case'kjpic':F('kunjungan').pic=F('kunjungan').pic===k?'':k;F('kunjungan').page=0;rerender();break;
  case'kjmon':F('kunjungan').mon=F('kunjungan').mon===k?'':k;F('kunjungan').page=0;rerender();break;
  case'kj-clear':F('kunjungan').kd='';F('kunjungan').mon='';rerender();break;
  case'kecf':F('penurunan').kec=F('penurunan').kec===k?'':k;F('penurunan').page=0;rerender();break;
  case'proj':{const f=F('project');f.p=k;f.page=0;f.st='';f.pic='';f.q='';f.cat='';f.jenis='';f.lst='';f.sort=null;S.sel.clear();if(S.view!=='project')go('project');else rerender();break}
  case'pseg':{const f=F('project');f.seg=f.seg||{};f.seg[f.p||'loy']=k;f.page=0;rerender();break}
  case'ppic':{const f=F('project');f.pic=f.pic===k?'':k;f.vis='';f.page=0;S.sel.clear();rerender();break}
  case'pvis':{const f=F('project');f.vis=v||'';f.page=0;S.sel.clear();rerender();break}
  case'pzst':{const f=F('project');f.zst=f.zst===k?'':k;f.page=0;rerender();break}
  case'zb-queue':zbQueue();break;
  case'zb-evt':if(isOwner())zbEvtModal();break;
  case'pfu':{const f=F('project');f.st=f.st===k?'':k;f.page=0;rerender();break}
  case'wa-tpl':{const P=F('project').p||'loy';waTplModal(WA_GROUP[P]);break}
  case'copy':try{await navigator.clipboard.writeText(k.replace(/^62/,'0'));toast('Nomor disalin')}catch(_){toast(k)}break;
  case'copyinfo':{const en=entOf(id);const c=coordOf(en);const t=`${en.name}${en.code?' ('+en.code+')':''}\n${en.addr||''} ${en.kel||''}\nHP: ${phoneOf(en)?phoneOf(en).replace(/^62/,'0'):'-'}\n${c?gmapsPt(c):''}`;try{await navigator.clipboard.writeText(t);toast('Info disalin')}catch(_){toast('Gagal menyalin')}break}
  case'fu-save':{const en=entOf(id);const p={pic:U($('#fuPic').value),status:$('#fuSt').value,seg:$('#fuSeg').value,due:$('#fuDue').value,note:$('#fuNote').value};if($('#fuPh'))p.phone=$('#fuPh').value.trim();if($('#fuCo')){const c=$('#fuCo').value.trim();if(c&&!parseCoord(c)){toast('Format koordinat tidak dikenali');break}p.coord=c}
    if(p.seg===en.seg)p.seg='';await saveFU(id,p,`${p.status}${p.note?': '+p.note.slice(0,80):''}`);toast('Follow-up disimpan');buildProjects();rerender();openDrawer(id);break}
  case'fu-quick':await saveFU(id,{status:k},k);toast('Status: '+k);rerender();openDrawer(id);break;
  case'form':{const e=id?entFor(id):null;openForm(k,k==='rkm'?rkmPrefill(e):mapPrefill(e,{pic:e?picOf(e):''}));break}
  case'vchk':{const f=F('database');Object.keys(f).forEach(x=>{if(!['sort','dir'].includes(x))delete f[x]});f.vf=k;go('database');break}
  case'proj-route':projRouteModal();break;
  case'mm-edit':if(isOwner())mymapsEditModal();break;
  case'sync-all':{el.disabled=true;el.textContent='Mengambil…';await syncSheet('rkm');await syncSheet('map');el.disabled=false;rerender();break}
  case'imp-map':{const c=S._imp&&S._imp[k];if(c){const n=await confirmImport(c);if(n!=null){toast(`✓ ${fmtN(n)} baris diproses`);rerender()}}break}
  case'pw-out':pwLogout();break;
  case'ds-reset':modal('Kembalikan ke data awal?',`<p>Data upload <b>${esc(k)}</b> akan dihapus untuk seluruh tim dan kembali ke data awal. Follow-up tidak terhapus.</p>`,{ok:()=>resetDataset(k),okLbl:'Ya, kembalikan'});break;
  }
});
document.addEventListener('change',e=>{const el=e.target;const a=el.dataset.act;if(!a)return;
  if(a==='fsel'){const [vw,key]=el.dataset.v.split('.');F(vw)[key]=el.value;F(vw).page=0;rerender()}
  else if(a==='ftog'){const [vw,key]=el.dataset.v.split('.');F(vw)[key]=el.checked;F(vw).page=0;rerender()}
  else if(a==='per'||a==='cmp'){const p=a==='per'?+el.value:S.per,c=a==='cmp'?+el.value:(+el.value-1);setPer(p,a==='per'?Math.max(0,p-1):c)}
  else if(a==='prorata'){S.prorata=el.checked;compute();rerender()}
  else if(a==='sel'){el.checked?S.sel.add(el.dataset.id):S.sel.delete(el.dataset.id);rerender()}
  else if(a==='sel-page'){$$('input[data-act=sel]').forEach(c=>{el.checked?S.sel.add(c.dataset.id):S.sel.delete(c.dataset.id)});rerender()}
  else if(a==='fu'){const id=el.dataset.id,k=el.dataset.k;let v=el.value;if(k==='pic')v=U(v);const en=entOf(id);if(k==='seg'&&en&&v===en.seg)v='';saveFU(id,{[k]:v},k==='note'?null:`${k==='status'?'Status':k==='zb'?'Status undangan zumba':k==='pic'?'PIC':'Segmen'} → ${v||'awal'}`);if(k==='pic'&&v&&!D.M.pics.includes(v))D.M.pics.push(v);if(k!=='note')rerenderSoft()}
});
const fq=debounce((vw,val)=>{F(vw).q=val;F(vw).page=0;const pos=document.activeElement&&document.activeElement.selectionStart;rerender();const n=$(`[data-act=fq][data-v="${vw}"]`);if(n){n.focus();try{n.setSelectionRange(pos,pos)}catch(_){}}},280);
document.addEventListener('input',e=>{const el=e.target;if(el.dataset.act==='fq')fq(el.dataset.v,el.value);if(el.id==='gq')gsearch(el.value)});
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('#gq').focus()}if(e.key==='Escape'){if($('.modal-bg'))$('.modal-bg:last-of-type').remove();else if(S.drawerId)closeDrawer();$('#gres').hidden=true}
  if(e.key==='Enter'&&e.target.id==='gq'){const f=$('#gres .gr');if(f)f.click()}});
document.addEventListener('click',e=>{if(!e.target.closest('.gsearch'))$('#gres')&&($('#gres').hidden=true)});
function gsearch(q){const box=$('#gres');q=q.trim().toLowerCase();if(q.length<2){box.hidden=true;return}const qd=q.replace(/\D/g,'');
  const res=[];for(const m of D.mem){if(m.name.toLowerCase().includes(q)||m.code.toLowerCase()===q||(qd.length>=5&&m.phone.includes(qd))){res.push(memEntOf(m));if(res.length>=8)break}}
  for(const e of Object.values(D.M.byId)){if(e.src!=='LOY'&&e.src!=='SLP'&&e.name.toLowerCase().includes(q)){res.push(e);if(res.length>=12)break}}
  const navs=NAV.flatMap(g=>g[1]).filter(n=>n[1].toLowerCase().includes(q)&&(!OWNER_V.has(n[0])||isOwner()));
  box.innerHTML=navs.map(n=>`<button class="gr" data-act="goto" data-v="${n[0]}">${navIc(n[0])}Buka halaman ${n[1]}</button>`).join('')+res.map(e=>{const r=e.code?R(e.code):null;return`<button class="gr" data-act="mem" data-id="${e.id}"><span class="av sm" style="background:${avCol(e.name)}">${esc(initials(e.name))}</span><span style="flex:1;min-width:0"><b>${esc(e.name)}</b><span class="mut"> ${esc([e.code,e.kel].filter(Boolean).join(' · '))}</span></span>${r?stTag(r.st):`<span class="tag neu">${{MAP:'Mapping',SVY:'ACC survey'}[e.src]||''}</span>`}</button>`}).join('')||'<div class="empty">Tidak ditemukan</div>';box.hidden=false}

/* ===== upload ===== */
function bindDrop(){const d=$('#drop');if(!d)return;const fi=$('#file');fi.onchange=()=>{handleFiles([...fi.files]);fi.value=''};d.ondragover=e=>{e.preventDefault();d.classList.add('over')};d.ondragleave=()=>d.classList.remove('over');d.ondrop=e=>{e.preventDefault();d.classList.remove('over');handleFiles([...e.dataTransfer.files])}}
const MONRE=/(JANUARI|FEBRUARI|MARET|APRIL|MEI|JUNI|JULI|AGUSTUS|SEPTEMBER|OKTOBER|NOVEMBER|DESEMBER)\s*(\d{4})/i;
function periodFromName(n){const m=String(n).toUpperCase().match(MONRE);if(!m)return null;const mi=MONL.map(x=>x.toUpperCase()).indexOf(m[1]);return`${m[2]}-${String(mi+1).padStart(2,'0')}`}
const aoaOf=ws=>XLSX.utils.sheet_to_json(ws,{header:1,raw:true,defval:null,blankrows:true});
/* master pendaftaran baru (mis. 1–22 Nov) DIGABUNG ke data lama: nama yang sama diganti versi terbaru, nama baru ditambahkan */
function mergeSurvey(old,nw){const A=old&&old.sheets&&old.sheets.main,B=nw&&nw.sheets&&nw.sheets.main;if(!A||!B)return nw;
  const ha=findHdrRow(A,[/NAMA/,/SURVEYOR/],15),hb=findHdrRow(B,[/NAMA/,/SURVEYOR/],15);if(ha<0||hb<0)return nw;const ia=hdrIdx(A[ha],/^NAMA/),ib=hdrIdx(B[hb],/^NAMA/);
  const isRow=(r,i)=>r&&r[i]!=null&&String(r[i]).trim()!==''&&r[0]!=null&&r[0]!=='';const key=(r,i)=>U(r[i]).replace(/\s+/g,' ');
  // kolom file baru disusun mengikuti urutan kolom file lama
  const map=A[ha].map((v,i)=>{const k=U(v);if(!k)return i;const j=B[hb].findIndex(w=>U(w)===k);return j>=0?j:i});
  const nb=B.slice(hb+1).filter(r=>isRow(r,ib)).map(r=>map.map(j=>r[j]??null));const keys=new Set(nb.map(r=>key(r,ia)));
  const keep=A.slice(ha+1).filter(r=>!isRow(r,ia)||!keys.has(key(r,ia)));return{sheets:{main:[...A.slice(0,ha+1),...keep,...nb]}}}
function stripNik(aoa){const hi=findHdrRow(aoa,[/NIK/],10);if(hi<0)return aoa;const cols=aoa[hi].map((v,i)=>/NIK|KTP/.test(U(v))?i:-1).filter(i=>i>=0);return aoa.map(r=>r?r.map((v,i)=>cols.includes(i)?null:v):r)}
function detect(wb,fname){const N=wb.SheetNames;if(/ZUMBA|SALONPAS/i.test(fname))return{type:'zumba',payload:{sheets:{main:aoaOf(wb.Sheets[N[0]])}}};
  {const a=aoaOf(wb.Sheets[N[0]]);const t=a.slice(0,8).map(r=>(r||[]).map(U).join('|')).join('||');if(/SLS SEPT|SALES SEPT/.test(t)&&/SLS OKT|SALES OKT/.test(t)&&(/KLIK|TURUN/i.test(fname)||/SELISIH/.test(t)))return{type:'klikturun',payload:{sheets:{main:a}}}}const pm=parsePicWorkbook(wb);if(pm)return{type:'picmap',payload:pm};const sh=n=>aoaOf(wb.Sheets[n]);const sa=N.find(n=>/SALES ALL/i.test(n));
  if(sa){const rk=N.find(n=>/SALES ROKOK/i.test(n))||N.find(n=>/ROKOK/i.test(n)&&!/NON/i.test(n));return{type:'loyalty',payload:{sheets:{LIST:sh(N.find(n=>/LIST/i.test(n))||N[0]),SALES_ALL:sh(sa),SALES_ROKOK:rk?sh(rk):[]}}}}
  let sleepCand=null;for(const n of N){const a=sh(n);const t=a.slice(0,12).map(r=>(r||[]).map(U).join('|')).join('||');
    if(/(^|\|)ID(\||$)/.test(t)&&/STATUS FOLLOW|\|PIC\|/.test('|'+t+'|'))return{type:'followup',rows:a};
    if(/GET MEMBER/.test(t)&&/SURVEYOR/.test(t))return{type:'mapping',payload:{sheets:{main:a}}};
    if(/JENIS SLEEPER/.test(t))return{type:'lms',payload:{sheets:{main:a}}};
    if(/KUNJ TERAKHIR|KUNJ DARI GO/.test(t))sleepCand=sleepCand||a;
    if(/MASTER PENDAFTARAN|TITIK KOORDINAT/.test(t)&&/SURVEYOR/.test(t))return{type:'survey',payload:{sheets:{main:stripNik(a)}}};
    if(/\bPLU\b/.test(t)&&/GROSS|SALES/.test(t))return{type:'prod',aoa:a};
  }
  // file berisi kode member + nilai penjualan = sales (per struk bila kode berulang / nama file, selain itu rekap per member)
  for(const n of N){const a=sh(n);const ix=strukIdx(a);if(ix.kode<0||ix.gross<0)continue;const t=(a[ix.hi]||[]).map(U).join('|');if(/\bPLU\b|SALES ALL|ROKOK|TARGET/.test(t))continue;return{type:isStrukAoa(a,fname)?'struk':'hist',aoa:a}}
  if(sleepCand)return{type:'sleepers',payload:{sheets:{main:sleepCand}}};return null}
/* ===== Sales per struk: 1 baris = 1 struk → dijumlah per member (sales, margin, struk, kunjungan, tgl terakhir),
   per hari (grafik pola transaksi) dan per kanal Klik/Toko bila ada kolomnya. Mengganti data bulan itu. */
const SALES_RE=/GROSS|TOTAL ?SALES|^SALES$|NILAI|OMZET|OMSET|PENJUALAN|RUPIAH|^TOTAL$/,CODE_RE=/^(KODE|KD|NO\.?|NOMOR)( ?(MEMBER|CUST(OMER)?|PELANGGAN))?$|^MEMBER$/;
function strukIdx(a){const hi=findHdrRow(a,[/KODE|MEMBER/,SALES_RE]);const h=a[hi]||[];
  const ix={hi,kode:hdrIdx(h,CODE_RE),nama:hdrIdx(h,/^NAMA/),sub:hdrIdx(h,/SUB ?OUTLET/),gross:hdrIdx(h,/GROSS/)>=0?hdrIdx(h,/GROSS/):hdrIdx(h,SALES_RE),mg:hdrIdx(h,/^MARGIN/),
    rc:h.findIndex(v=>/STRUK|NOTA|TRANS|INVOICE|RECEIPT/.test(U(v))&&!/^(JML|JUMLAH|TOTAL|NILAI|TGL|TANGGAL)/.test(U(v))),dt:h.findIndex(v=>/TGL|TANGGAL|DATE|WAKTU/.test(U(v))&&!/REGIST|DAFTAR|LAHIR|TERAKHIR|JATUH/.test(U(v))),ch:-1};
  if(ix.kode<0)ix.kode=hdrIdx(h,/KODE|MEMBER/);
  // kolom kanal: header kanal/tipe/jenis, atau kolom berisi nilai "KLIK" dengan sedikit variasi nilai
  const cand=h.map((v,i)=>i).filter(i=>![ix.kode,ix.nama,ix.gross,ix.mg,ix.rc,ix.dt].includes(i));
  const vals=i=>{const s=new Set();for(let r=hi+1;r<Math.min(a.length,hi+4000)&&s.size<=30;r++){const v=a[r]&&a[r][i];if(v!=null&&v!=='')s.add(U(v))}return s};
  if(ix.dt<0)for(const i of cand){let n=0,d=0;for(let r=hi+1;r<Math.min(a.length,hi+60);r++){const v=a[r]&&a[r][i];if(v==null||v==='')continue;n++;const t=toDate(v);if(t&&t.getFullYear()>=2020&&t.getFullYear()<=2030&&(typeof v!=='number'||v>40000&&v<50000))d++}if(n>=5&&d/n>.9){ix.dt=i;break}}
  for(const i of cand){const hv=U(h[i]);const s=vals(i);if(s.size>30||!s.size)continue;if([...s].some(v=>/KLIK/.test(v))||/KANAL|CHANNEL|SUMBER|MEDIA|ASAL ?ORDER|TIPE ?(STRUK|TRANS|ORDER)|JENIS ?(STRUK|TRANS|ORDER)/.test(hv)){ix.ch=i;break}}
  return ix}
function isStrukAoa(a,fname){if(/PER[ _-]?MEMBER/i.test(fname))return false;if(/STRUK/i.test(fname))return true;const ix=strukIdx(a);if(ix.kode<0)return false;const c=new Set();let n=0;
  for(let i=ix.hi+1;i<a.length&&n<5000;i++){const v=a[i]&&a[i][ix.kode];if(v!=null&&v!==''){c.add(U(v));n++}}return n>20&&n/Math.max(1,c.size)>1.3}
function parseStrukAoa(a,fname){const ix=strukIdx(a);const chOf=v=>/KLIK|ONLINE|APLIKASI|APPS?\b|DELIVERY|ANTAR/.test(U(v))?'Klik':'Toko';
  const nm=String(fname).match(/(20\d\d)(\d\d)(\d\d)\D+(20\d\d)(\d\d)(\d\d)/);const mem={},day={},ch={Klik:[0,0,0,new Set()],Toko:[0,0,0,new Set()]};const pc={};let mx=null,n=0,ret=0;
  for(let i=ix.hi+1;i<a.length;i++){const r=a[i];if(!r||r[ix.kode]==null||r[ix.kode]===''||/TOTAL/i.test(String(r[ix.kode])))continue;n++;
    const code=String(r[ix.kode]).trim(),k=U(code),g=num(r[ix.gross]),mg=ix.mg>=0?num(r[ix.mg]):0,d=ix.dt>=0?toDate(r[ix.dt]):null,rc=ix.rc>=0&&r[ix.rc]!=null&&r[ix.rc]!==''?String(r[ix.rc]):'#'+i,c=ix.ch>=0?chOf(r[ix.ch]):null;
    const ds=d?iso(d):'';if(d){if(!mx||d>mx)mx=d;pc[ds.slice(0,7)]=(pc[ds.slice(0,7)]||0)+1}
    const m=mem[k]=mem[k]||{code,g:0,mg:0,rc:new Set(),dd:new Set(),ld:0,name:ix.nama>=0?String(r[ix.nama]||''):'',sub:ix.sub>=0?String(r[ix.sub]||''):''};
    m.g+=g;m.mg+=mg;if(g>0){m.rc.add(rc);if(ds)m.dd.add(ds);if(d&&d.getDate()>m.ld)m.ld=d.getDate()}else if(g<0)ret++;
    if(ds){const x=day[ds]=day[ds]||{g:0,mg:0,rc:new Set(),ret:0,k:0,t:0,m:new Set()};x.g+=g;x.mg+=mg;if(g>0){x.rc.add(rc);x.m.add(k)}else if(g<0)x.ret++;if(c==='Klik')x.k+=g;else x.t+=g}
    if(c){const y=ch[c];y[0]+=g;y[2]+=mg;if(g>0){y[1]++;y[3].add(k)}}}
  const p=Object.entries(pc).sort((x,y)=>y[1]-x[1])[0]?.[0]||(nm?`${nm[4]}-${nm[5]}`:periodFromName(fname));
  const days=mx&&p&&iso(mx).startsWith(p)?mx.getDate():nm&&p===`${nm[4]}-${nm[5]}`?+nm[6]:null;
  const rows=Object.values(mem).map(m=>[m.code,Math.round(m.g),Math.round(m.mg),m.rc.size,m.dd.size||m.rc.size,m.ld||(m.rc.size&&days?days:0),m.name,m.sub]);
  const daily=Object.entries(day).filter(([d])=>d.startsWith(p||'')).sort().map(([d,x])=>[d,Math.round(x.g),Math.round(x.mg),x.rc.size,x.ret,Math.round(x.k),Math.round(ix.ch>=0?x.t:x.g),x.m.size]);
  return{p,days,rows,daily,ch:ix.ch>=0?Object.fromEntries(Object.entries(ch).map(([k,y])=>[k,[Math.round(y[0]),y[1],Math.round(y[2]),y[3].size]])):null,n,ret,hasDate:ix.dt>=0,hasCh:ix.ch>=0,noDate:ix.dt<0,kind:'struk'}}
/* nama file ekspor sistem: "Per_Member_20261101 - 20261122" → bulan 2026-11, data s/d tgl 22 */
function rangeFromName(n){const m=String(n).match(/(20\d\d)(\d\d)(\d\d)\D+(20\d\d)(\d\d)(\d\d)/);return m?{p:`${m[4]}-${m[5]}`,days:+m[6]}:null}
function parseHistAoa(a,fname){const ix0=strukIdx(a);const hi=ix0.hi;const h=a[hi]||[];const ix={kode:ix0.kode,nama:ix0.nama,sub:ix0.sub,gross:ix0.gross,mg:hdrIdx(h,/^MARGIN/),st:hdrIdx(h,/STRUK/),kj:hdrIdx(h,/KUNJUNGAN|^KUNJ(?!.*(TERAKHIR|GO))/),last:hdrIdx(h,/TERAKHIR/)};
  const rows=[];let mx=null;for(let i=hi+1;i<a.length;i++){const r=a[i];if(!r||r[ix.kode]==null||r[ix.kode]===''||/TOTAL/i.test(String(r[ix.kode])))continue;const d=toDate(r[ix.last]);if(d&&(!mx||d>mx))mx=d;rows.push([String(r[ix.kode]),Math.round(num(r[ix.gross])),Math.round(num(r[ix.mg])),num(r[ix.st]),num(r[ix.kj]),d?d.getDate():0,ix.nama>=0?String(r[ix.nama]||''):'',ix.sub>=0?String(r[ix.sub]||''):''])}
  const rg=rangeFromName(fname);const p=periodFromName(fname)||(rg&&rg.p)||(mx?iso(mx).slice(0,7):null);const pm=String(fname).match(/(\d{1,2})\s*-\s*(\d{1,2})\s+[A-Z]+\s+\d{4}/i);const days=pm?+pm[2]:rg&&rg.p===p?rg.days:(mx&&p&&iso(mx).startsWith(p)?mx.getDate():null);
  // rekap per member: kode yang muncul dua kali dijumlahkan (bukan ditimpa)
  const by=new Map();for(const r of rows){const k=U(r[0]);const o=by.get(k);if(!o){by.set(k,r);continue}o[1]+=r[1];o[2]+=r[2];o[3]+=r[3];o[4]+=r[4];o[5]=Math.max(o[5],r[5])}
  return{p,days,rows:[...by.values()],kind:'member'}}
function parseProdAoa(a,fname){const hi=findHdrRow(a,[/PLU/]);const h=a[hi];const ix={plu:hdrIdx(h,/^PLU/),nm:hdrIdx(h,/DESK|NAMA|ITEM/),div:hdrIdx(h,/^DIV/),dept:hdrIdx(h,/^DEP/),kat:hdrIdx(h,/^KAT/),mem:hdrIdx(h,/MEMBER/),st:hdrIdx(h,/STRUK/),qty:hdrIdx(h,/QTY/),gross:hdrIdx(h,/GROSS|SALES/),mg:hdrIdx(h,/^MARGIN$/)};
  const rows=[];for(let i=hi+1;i<a.length;i++){const r=a[i];if(!r||r[ix.plu]==null||r[ix.plu]==='')continue;rows.push([String(r[ix.plu]),String(r[ix.nm]||''),String(r[ix.div]??''),String(r[ix.dept]??''),String(r[ix.kat]??''),num(r[ix.mem]),num(r[ix.st]),num(r[ix.qty]),Math.round(num(r[ix.gross])),Math.round(num(r[ix.mg]))])}
  return{p:periodFromName(fname),rows,hasMem:ix.mem>=0}}
async function handleFiles(files){const sync=()=>{const b=$('#upStatus');if(b)b.innerHTML=upLogHtml()};
  for(const f of files){const line={cls:'alert',t:`Membaca ${f.name}…`};S.upLog.unshift(line);sync();const set=(t,c)=>{line.t=t;if(c)line.cls=c;sync()};
    try{const wb=XLSX.read(await f.arrayBuffer(),{type:'array'});const d=detect(wb,f.name);
      if(!d){set(`${f.name}: membaca isi file…`);const n=await smartImport(f,wb.SheetNames.map(sn=>[sn,aoaOf(wb.Sheets[sn])]),f.name);if(n==null){set(`${f.name}: dibatalkan.`,'alert red')}else set(`✓ ${f.name}: ${fmtN(n)} baris diproses otomatis.`);continue}
      if(d.type==='picmap'){set(`${f.name}: pembagian PIC ${d.payload.a.length} advisor, ${fmtN(d.payload.m.length)} member. Menyimpan…`);await saveDataset('picmap',d.payload,f.name);set(`✓ ${f.name}: PIC semua project (kecuali Loyalty Targetan) diperbarui dari ${d.payload.a.length} advisor.`);continue}
      if(d.type==='followup'){const n=await importFollowup(d.rows);set(`✓ ${f.name}: ${n} baris PIC/status/catatan diperbarui.`);continue}
      if(d.type==='hist'||d.type==='prod'){const h0=d.type==='hist'?parseHistAoa(d.aoa,f.name):parseProdAoa(d.aoa,f.name);if(!h0.p||(d.type==='prod'&&!h0.hasMem)){set(`${f.name}: periksa pemetaan kolom…`);const n=await smartImport(f,wb.SheetNames.map(sn=>[sn,aoaOf(wb.Sheets[sn])]),f.name);set(n==null?`${f.name}: dibatalkan.`:`✓ ${f.name}: ${fmtN(n)} baris diproses.`,n==null?'alert red':null);continue}}
      if(d.type==='struk'){const h=parseStrukAoa(d.aoa,f.name);if(!h.p||!h.rows.length){set(`${f.name}: kolom kode member / gross per struk tidak terbaca.`,'alert red');continue}
        set(`${f.name}: sales per struk ${h.p}, ${fmtN(h.n)} baris → ${fmtN(h.rows.length)} member. Menyimpan…`);await saveDataset('hist-'+h.p,h,f.name);
        set(`✓ ${f.name}: sales per STRUK ${periodLabelKey(h.p)} s/d tgl ${h.days||'?'} · ${fmtN(sumBy(h.rows,r=>r[3]))} struk → ${fmtN(h.rows.length)} member${h.hasDate?'':' · tanpa kolom tanggal: tgl belanja terakhir diperkirakan dari data sebelumnya'}${h.hasCh?' · kanal Klik/Toko terbaca':' · ⚠ kolom kanal Klik/Toko tidak ditemukan'}.`);continue}
      if(d.type==='hist'){const h=parseHistAoa(d.aoa,f.name);
        set(`${f.name}: sales per member ${h.p}, ${h.rows.length} member. Menyimpan…`);await saveDataset('hist-'+h.p,h,f.name);set(`✓ ${f.name}: sales per MEMBER (rekap) ${periodLabelKey(h.p)}${h.days?' s/d tgl '+h.days:''} diperbarui (${h.rows.length} member).`);continue}
      if(d.type==='prod'){const h=parseProdAoa(d.aoa,f.name);if(!h.p){set(`${f.name}: bulan tidak terbaca dari nama file.`,'alert red');continue}if(!h.hasMem){set(`${f.name}: kolom jumlah MEMBER tidak ditemukan.`,'alert red');continue}
        set(`${f.name}: produk ${h.p}, ${h.rows.length} item. Menyimpan…`);await saveDataset('prod-'+h.p,h,f.name);set(`✓ ${f.name}: produk ${periodLabelKey(h.p)} diperbarui (${h.rows.length} item).`);continue}
      if(d.type==='survey'&&S.raw.survey)d.payload=mergeSurvey(S.raw.survey,d.payload);
      const parsed={loyalty:parseLoyalty,sleepers:parseSleepers,mapping:parseMapping,survey:parseSurvey,lms:parseLms,zumba:parseZumba,klikturun:parseKlikTurun}[d.type](d.payload);const n=(parsed.members||parsed.rows||[]).length;
      if(!n){set(`${f.name}: terbaca sebagai ${DS_INFO[d.type].l} tapi tidak ada baris data.`,'alert red');continue}
      set(`${f.name}: ${DS_INFO[d.type].l}, ${n} baris. Menyimpan…`);await saveDataset(d.type,{...d.payload},f.name);set(`✓ ${f.name}: ${DS_INFO[d.type].l} diperbarui (${n} baris).`);
    }catch(err){if(err.imp)line.imp=err.imp;set(`${f.name}: ${err.code||err.message}`,'alert red')}}
  if(S.upLog.slice(0,files.length).some(l=>/^✓/.test(l.t))&&isOwner())autoPublish().then(ok=>{const l={cls:'alert',t:ok?'✓ Sudah tampil untuk seluruh tim.':'✓ Tersimpan dan langsung terpakai di layar Anda. Untuk tim yang membuka tanpa login, data ini diterbitkan oleh Claude.'};S.upLog.unshift(l);sync()})}
function periodLabelKey(k){const i=D.periods.indexOf(k);return i>=0?periodLabel(i):k}
async function importFollowup(a){const hi=findHdrRow(a,[/(^|\|)ID(\||$)/]);const h=a[hi];const ix={id:hdrIdx(h,/^ID$/),pic:hdrIdx(h,/^PIC$/),st:hdrIdx(h,/STATUS FOLLOW/),note:hdrIdx(h,/^CATATAN$/),seg:hdrIdx(h,/^SEGMEN$/),due:hdrIdx(h,/TANGGAL JANJI/),co:hdrIdx(h,/^KOORDINAT$/),hp:hdrIdx(h,/^NO HP$/)};let n=0;
  for(let i=hi+1;i<a.length;i++){const r=a[i];if(!r||!r[ix.id])continue;const id=String(r[ix.id]);const e=entOf(id);if(!e)continue;const p={};
    if(ix.pic>=0&&r[ix.pic]&&U(r[ix.pic])!==picOf(e))p.pic=U(r[ix.pic]);const sv=ix.st>=0?String(r[ix.st]||'').trim():'';if(sv&&FU_ST.includes(sv)&&sv!==statusOf(e))p.status=sv;
    if(ix.note>=0&&r[ix.note]!=null&&String(r[ix.note])!==(fuOf(id).note||''))p.note=String(r[ix.note]);if(ix.seg>=0&&r[ix.seg]){const sg=U(r[ix.seg]);if(SEGS.includes(sg)&&sg!==segOf(e))p.seg=sg}
    if(ix.due>=0&&r[ix.due]){const d=toDate(r[ix.due]);if(d)p.due=iso(d)}if(ix.co>=0&&r[ix.co]&&!e.coord&&parseCoord(r[ix.co]))p.coord=String(r[ix.co]);if(ix.hp>=0&&r[ix.hp]&&!e.phone)p.phone=String(r[ix.hp]);
    if(Object.keys(p).length){await saveFU(id,p,'Import Excel');n++;await sleep(80)}}
  buildProjects();rerender();return n}
function addPeriod(key){if(D.periods.includes(key))return;const P=D.P,N=D.mem.length,P2=P+1;const grow=(A,T)=>{const n=new T(N*P2);for(let i=0;i<N;i++)n.set(A.subarray(i*P,(i+1)*P),i*P2);return n};
  D.G=grow(D.G,Float64Array);D.MG=grow(D.MG,Float64Array);D.STK=grow(D.STK,Uint16Array);D.KJ=grow(D.KJ,Uint16Array);D.LD=grow(D.LD,Uint8Array);
  D.periods.push(key);const [y,m]=key.split('-').map(Number);D.pdays.push(new Date(y,m,0).getDate());D.P=P2;D.agg.monthly.push({p:key,days:D.pdays[P],gross:0,net:0,margin:0,members:0,receipts:0,visits:0,ch:{}})}
function applyOverlays(){restoreBase();
  Object.keys(S.raw).filter(k=>k.startsWith('hist-')).sort().forEach(k=>{const h=S.raw[k];if(!h||!h.p)return;addPeriod(h.p);const p=D.periods.indexOf(h.p);
    const bi=D.base.periods.indexOf(h.p);const est=(r,o)=>{if(!(h.noDate||h.hasDate===false)||bi<0)return o;const m=D.byCode[U(r[0])];if(!m||m.i>=D.base.memLen)return o;const q=m.i*D.base.P+bi,bs=D.base.STK[q];
      // file per struk tanpa kolom tanggal: struk tidak bertambah dari data sebelumnya → tgl terakhir & kunjungan tetap; bertambah → belanja di sisa hari (perkiraan)
      return r[3]<=bs&&r[1]<=D.base.G[q]+1?{...o,lastDay:D.base.LD[q],kunj:D.base.KJ[q]}:{...o,kunj:D.base.KJ[q]+Math.max(1,r[3]-bs)}};
    applyHistOverlay(p,h.rows.map(r=>est(r,{code:r[0],gross:r[1],margin:r[2],struk:r[3],kunj:r[4],lastDay:r[5],name:r[6],sub:r[7]})));
    if(h.days)D.pdays[p]=h.days;const A=D.agg.monthly[p];A.gross=sumBy(h.rows,r=>r[1]);A.margin=sumBy(h.rows,r=>r[2]);A.members=h.rows.filter(r=>r[1]>0).length;A.receipts=sumBy(h.rows,r=>r[3]);A.days=D.pdays[p];if(!A.net)A.net=A.gross*0.93;
    if(h.ch)A.ch=h.ch;else if(A.ch){const bi=D.base.periods.indexOf(h.p);A.chDays=bi>=0?D.base.pdays[bi]:null}
    if(h.daily&&h.daily.length){const ds=new Set(h.daily.map(x=>x[0]));D.agg.daily=D.agg.daily.filter(x=>!ds.has(x[0])).concat(h.daily.map(x=>[...x])).sort((x,y)=>x[0].localeCompare(y[0]))}
    if(p===D.P-1&&h.days){const [y,m]=h.p.split('-').map(Number);D.asOf=new Date(y,m-1,h.days)}});
  // transaksi harian mentah: ditambahkan hanya untuk tanggal setelah cakupan data bulan itu
  const txMax={};
  Object.keys(S.raw).filter(k=>k.startsWith('txd-')).sort().forEach(k=>{const t=S.raw[k];if(!t||!t.d)return;const key=t.d.slice(0,7),day=+t.d.slice(8);const [yy,mm]=key.split('-').map(Number);
    let cov=0;const bi=D.base.periods.indexOf(key);if(bi>=0)cov=D.base.pdays[bi];const h=S.raw['hist-'+key];if(h)cov=Math.max(cov,h.days||new Date(yy,mm,0).getDate());if(day<=cov)return;
    addPeriod(key);const p=D.periods.indexOf(key);
    for(const r of t.rows){let m=D.byCode[U(r[0])];if(!m)m=addMember({code:r[0],name:r[5],sub:r[6]});const o=m.i*D.P+p;D.G[o]+=r[1];D.MG[o]+=r[2];D.STK[o]+=r[3];D.KJ[o]+=r[4];if(day>D.LD[o])D.LD[o]=day}
    const A=D.agg.monthly[p];A.gross+=sumBy(t.rows,r=>r[1]);A.margin+=sumBy(t.rows,r=>r[2]);A.receipts+=sumBy(t.rows,r=>r[3]);if(!A.net)A.net=0;A.net+=sumBy(t.rows,r=>r[1])*0.93;
    txMax[key]=Math.max(txMax[key]||cov,day);D.pdays[p]=txMax[key];A.days=D.pdays[p];
    D.agg.daily=D.agg.daily.filter(x=>x[0]!==t.d);D.agg.daily.push([t.d,Math.round(sumBy(t.rows,r=>r[1])),Math.round(sumBy(t.rows,r=>r[2])),sumBy(t.rows,r=>r[3]),0,0,Math.round(sumBy(t.rows,r=>r[1])),t.rows.filter(r=>r[1]>0).length]);
    if(p===D.P-1){const nd=new Date(yy,mm-1,D.pdays[p]);if(!D.asOf||nd>D.asOf)D.asOf=nd}});
  Object.keys(txMax).forEach(key=>{const p=D.periods.indexOf(key);const A=D.agg.monthly[p];A.members=0;for(const m of D.mem)if(D.G[m.i*D.P+p]>0)A.members++});D.agg.daily.sort((a,b)=>a[0].localeCompare(b[0]));
  if(S.raw.master&&S.raw.master.rows)S.raw.master.rows.forEach(r=>{let m=D.byCode[U(r[0])];if(!m)m=addMember({code:r[0],name:r[1],sub:r[2]});m._orig=m._orig||{name:m.name,sub:m.sub,tier:m.tier,cat:m.cat,addr:m.addr,vil:m.vil,dist:m.dist,city:m.city,phone:m.phone,phoneRaw:m.phoneRaw,lat:m.lat,lng:m.lng,coord:m.coord,seg:m.seg,master:m.master};
    const set=(k,v)=>{if(v!=null&&v!=='')m[k]=v};set('name',r[1]);set('sub',r[2]);set('tier',r[3]);set('cat',r[4]);set('addr',r[5]);set('vil',U(r[6]));set('dist',U(r[7]));set('city',U(r[8]));if(r[9]){m.phoneRaw=r[9];m.phone=phone62(r[9])||m.phone}if(r[10]!=null&&r[11]!=null){m.lat=+r[10];m.lng=+r[11];m.coord={lat:m.lat,lng:m.lng}}m.seg=segFromSub(m.sub)||m.seg;m.master=1});
  Object.keys(S.raw).filter(k=>k.startsWith('prod-')).forEach(k=>{const h=S.raw[k];if(h&&h.p)D.prod[h.p]=h.rows});
  if(S.raw.rkmx&&S.raw.rkmx.rows){const seen=new Set((D.rkmBase0||[]).map(r=>rkmKey([r.code,r.name,r.date,r.pic])));D.rkmBase=[...(D.rkmBase0||[]),...S.raw.rkmx.rows.filter(r=>!seen.has(rkmKey(r))&&!/^TES(T|TING)?$/i.test(String(r[1]||'').trim())).map(r=>({code:r[0],name:r[1],date:r[2],pic:r[3],type:r[4],issues:r[5],notes:r[6]}))];rebuildFromForms()}
  if(CALC){if(S.per>=D.P)S.per=D.P-1;compute();buildProjects()}}

/* ===== boot ===== */
(async function boot(){shell();
  const h=location.hash.slice(1);if(VIEWS[h])S.view=h;
  $('#main').innerHTML='<div class="loading"><div class="spin"></div><b>Menyiapkan database Member Merah…</b><span class="mut">12 ribu member · 23 bulan sales · peta</span></div>';
  try{const [mem,agg,rkm,proj]=await Promise.all(['members','agg','rkm','projects'].map(n=>getData(n)));
    D.agg=agg;loadMembers(mem);D.rkm=rkm.map(r=>({code:String(r[0]),name:r[1],date:r[2],pic:r[3],type:r[4],issues:r[5],notes:r[6]||'',matched:r[9],sum:r[10]||''}));D.rkm.sort((a,b)=>a.date.localeCompare(b.date));
    D.rkmBy={};D.rkm.forEach(r=>{(D.rkmBy[U(r.code)]=D.rkmBy[U(r.code)]||[]).push(r)});
    Object.entries(proj.datasets||{}).forEach(([k,v])=>{S.raw[k]=v;S.meta[k]={fileName:v.fileName,updatedAt:v.updatedAt};S.src[k]='baseline'});
    try{S.raw.picmap=await getEnc('picmap');S.src.picmap='baseline';S.meta.picmap={fileName:'Pembagian_Member_per_Advisor_IGR_PKU.xlsx'}}catch(e){console.warn('picmap',e&&e.message)}
    try{const u=await getEnc('updates');if(u&&u.ds){for(const [k,v] of Object.entries(u.ds)){S.raw[k]=v.payload;S.meta[k]={...(v.meta||{})};S.src[k]='terbit'}S.pubAt=u.at}}catch(e){}
    snapBase();D.rkmBase0=D.rkm.slice();D.rkmBase=D.rkm.slice();try{await ensureForms()}catch(e){}
    if(S.pubAt)applyOverlays();
    S.per=D.P-2;S.cmp=D.P-3;compute();buildProjects();rerender();
    ensureProd(S.per).then(()=>{if(S.view==='ringkasan'){const t=$('#topProd');if(t)t.innerHTML=topProdHtml(8)}});
  }catch(err){console.error(err);$('#main').innerHTML=err.code==='insecure'?`<div class="card empty"><b>Buka dashboard lewat alamat https://</b><p class="mut">Data terenkripsi dan GPS hanya bisa dibuka di koneksi aman. Ganti awalan http:// menjadi https:// pada alamat situs.</p></div>`:err.code==='copy'?`<div class="card empty"><b>Ini salinan dashboard.</b><p class="mut">Data Member Merah Indogrosir Pekanbaru hanya terbuka di tautan dashboard asli.</p></div>`:err.code==='signin'?`<div class="card empty"><b>Masuk ke claude.ai dulu untuk membuka data</b><p class="mut">Data Member Merah disimpan aman di database dashboard dan hanya terbuka untuk akun claude.ai yang sudah masuk (akun gratis cukup). Masuk / login di claude.ai pada browser ini, lalu buka lagi tautan dashboard.</p><button class="btn pri" onclick="location.reload()">Coba lagi</button></div>`:`<div class="card empty"><b>Data tidak bisa dimuat.</b><p class="mut">Data dashboard ini hanya tersedia di tautan asli Member Merah Indogrosir Pekanbaru. (${esc(err.message)})</p><button class="btn pri" onclick="location.reload()">Coba lagi</button></div>`;return}
  initCaps().then(()=>{S._capsDone=true;rerender();setTimeout(migrateBase,1500)});
})();
window.addEventListener('hashchange',()=>{const h=location.hash.slice(1);if(VIEWS[h]&&h!==S.view)go(h)});
