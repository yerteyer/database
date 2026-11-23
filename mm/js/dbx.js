'use strict';
/* ===== Pengalaman tabel ala aplikasi database (tampilan tersimpan, kolom, kerapatan, pintasan, undo) =====
   Preferensi disimpan per browser (localStorage); bila tidak tersedia, tabel tetap jalan dengan bawaan. */
const DBX_KEY='igr2_dbx';const DBX_VIEWS=['database','penurunan'];
const DBX=(()=>{try{return JSON.parse(localStorage.getItem(DBX_KEY)||'{}')||{}}catch(e){return{}}})();
['cols','size','views','last'].forEach(k=>{if(!DBX[k]||typeof DBX[k]!=='object')DBX[k]={}});
const dbxSave=debounce(()=>{try{localStorage.setItem(DBX_KEY,JSON.stringify(DBX))}catch(e){}},400);
const dbxCols=v=>Array.isArray(DBX.cols[v])?DBX.cols[v]:MCOLS.filter(c=>c.on).map(c=>c.k);
const dbxSize=v=>[25,50,100,200].includes(DBX.size[v])?DBX.size[v]:50;
const dbxDense=()=>!!DBX.dense;
/* filter yang ikut disimpan di tampilan (status, filter, urutan) */
const VKEYS=['st','inc','q','seg','kec','kel','city','tier','cat','km','pic','fu','hasp','hasc','vf','sort','dir'];
function vPick(f){const o={};VKEYS.forEach(k=>{const x=f[k];if(x!=null&&x!==''&&x!==false&&!(k==='st'&&x==='all'))o[k]=x});return o}
const vSig=f=>JSON.stringify(Object.entries(vPick(f)).filter(([k])=>k!=='sort'&&k!=='dir').map(([k,v])=>[k,String(v)]).sort());
const PRESETS={database:[
  {n:'Turun & belum dihubungi',f:{st:'turun',fu:'Belum dihubungi',sort:'delta',dir:1}},
  {n:'Sleeper punya No HP',f:{st:'sleeper',hasp:true,sort:'last',dir:-1}},
  {n:'Turun ≤ 5 km dari toko',f:{st:'turun',km:'5',sort:'delta',dir:1}},
  {n:'Horeka aktif',f:{seg:'HOREKA',st:'aktif',sort:'cur',dir:-1}}]};
const savedViews=v=>Array.isArray(DBX.views[v])?DBX.views[v]:[];
function dbxToolbar(view){const sig=vSig(F(view));const pre=PRESETS[view]||[];const own=savedViews(view);
  const chip=(x,i,own_)=>`<span class="vchip ${vSig(x.f)===sig&&sig!=='[]'?'on':''}"><button data-act="dbx-view" data-v="${view}" data-k="${own_?'u':'p'}${i}" data-tip="${esc(viewDesc(x.f))}">${own_?'':'✦ '}${esc(x.n)}</button>${own_?`<button class="x" data-act="dbx-vdel" data-v="${view}" data-k="${i}" aria-label="Hapus tampilan ${esc(x.n)}">✕</button>`:''}</span>`;
  return`<div class="vbar"><span class="vlbl">Tampilan</span>${pre.map((x,i)=>chip(x,i,false)).join('')}${own.map((x,i)=>chip(x,i,true)).join('')}
   <button class="btn sm ghost" data-act="dbx-vsave" data-v="${view}" ${sig==='[]'?'disabled data-tip="Pasang filter dulu, lalu simpan sebagai tampilan"':'data-tip="Simpan filter & urutan sekarang agar bisa dibuka lagi dengan satu klik"'}>＋ Simpan tampilan</button>
   <span class="vright"><button class="btn sm" data-act="dbx-cols" data-v="${view}">▥ Kolom <b class="mut">${dbxCols(view).length}/${MCOLS.length}</b></button>
   <button class="btn sm ${dbxDense()?'on':''}" data-act="dbx-dense" aria-pressed="${dbxDense()}" data-tip="Baris rapat: lebih banyak member terlihat di layar">☰ ${dbxDense()?'Rapat':'Normal'}</button>
   <label class="sel row"><span>Baris</span><select data-act="dbx-size" data-v="${view}">${[25,50,100,200].map(n=>`<option ${n===dbxSize(view)?'selected':''}>${n}</option>`).join('')}</select></label></span></div>`}
function viewDesc(f){const p=vPick(f);const parts=Object.entries(p).filter(([k])=>FLAB[k]).map(([k,v])=>FLAB[k][0]+(FLAB[k][1]?': '+FLAB[k][1](v):''));
  if(p.st)parts.unshift('Status: '+(p.st==='aktif'?'Aktif belanja':(ST[p.st]||{}).l||p.st));if(p.sort){const c=MCOLS.find(c=>c.k===p.sort);parts.push('Urut: '+(p.sort==='name'?'Nama':c?c.l:p.sort))}return parts.join(' · ')||'Semua member'}
function colsModal(view){const on=dbxCols(view);
  const bg=modal('Atur kolom tabel',`<p class="small muted">Kolom <b>Member</b> selalu tampil dan tetap di kiri saat digeser. Pilihan disimpan di browser ini.</p><div class="col-list">${MCOLS.map(c=>`<label class="tg"><input type="checkbox" value="${c.k}" ${on.includes(c.k)?'checked':''}> ${esc(c.l)}</label>`).join('')}</div>`,
    {okLbl:'Terapkan',extra:'<button class="btn" data-def>Kembali ke bawaan</button>',ok:b=>{DBX.cols[view]=$$('.col-list input:checked',b).map(i=>i.value);dbxSave();rerender()}});
  $('[data-def]',bg).addEventListener('click',()=>{delete DBX.cols[view];dbxSave();bg.remove();rerender()})}
function applyView(view,f){const cur=F(view);S.f[view]={...vPick(f),page:0,more:cur.more};if(view==='penurunan'&&S.f[view].inc==null)S.f[view].inc=true;S.sel.clear();rerender()}
/* toast dengan tombol Batalkan (undo) */
function undoToast(msg,undo,ms=9000){const t=document.createElement('div');t.className='toast';t.innerHTML='<span></span><button class="undo">Batalkan</button>';t.firstChild.textContent=msg;
  t.lastChild.addEventListener('click',async()=>{t.remove();await undo()});document.body.appendChild(t);setTimeout(()=>t.remove(),ms)}
async function bulkFU(field,val,label){const ids=[...S.sel];const prev=ids.map(i=>[i,(S.fu[i]||{})[field]]);
  for(const i of ids){await saveFU(i,{[field]:val},label+' → '+val);await sleep(60)}rerender();
  undoToast(`${label} diset ke "${field==='pic'?picLbl(val):val}" untuk ${fmtN(ids.length)} baris.`,async()=>{toast('Membatalkan…');for(const [i,v] of prev){await saveFU(i,{[field]:v??''},`Dibatalkan: ${label} kembali ke ${v||'awal'}`);await sleep(60)}buildProjects();rerender();toast(`Dikembalikan (${fmtN(prev.length)} baris)`)})}
document.addEventListener('click',e=>{const el=e.target.closest('[data-act]');if(!el)return;const a=el.dataset.act,v=el.dataset.v,k=el.dataset.k;
  if(a==='fclr'){const [vw,key]=v.split('.');const f=F(vw);delete f[key];f.page=0;rerender()}
  else if(a==='fmore'){const f=F(v);const act=activeFilters(v);f.more=!(f.more||MORE_F.some(x=>act[x]!=null));if(!f.more)MORE_F.forEach(x=>delete f[x]);rerender()}
  else if(a==='stmore'){const f=F('database');f.stmore=!f.stmore;rerender()}
  else if(a==='dbx-dense'){DBX.dense=!DBX.dense;dbxSave();rerender()}
  else if(a==='dbx-cols')colsModal(v);
  else if(a==='dbx-view'){const x=k[0]==='u'?savedViews(v)[+k.slice(1)]:(PRESETS[v]||[])[+k.slice(1)];if(x)applyView(v,x.f)}
  else if(a==='dbx-vdel'){const x=savedViews(v)[+k];if(!x)return;modal('Hapus tampilan?',`<p>Tampilan <b>${esc(x.n)}</b> dihapus dari browser ini. Data member tidak berubah.</p>`,{okLbl:'Hapus',ok:()=>{DBX.views[v]=savedViews(v).filter((_,i)=>i!==+k);dbxSave();rerender()}})}
  else if(a==='dbx-vsave'){const f=F(v);const bg=modal('Simpan tampilan',`<p class="small muted">${esc(viewDesc(f))}</p><input class="inp" id="vname" maxlength="40" placeholder="Nama tampilan, mis. Sleeper Tampan JONI" style="width:100%">`,
    {okLbl:'Simpan',ok:b=>{const n=$('#vname',b).value.trim();if(!n){toast('Isi nama tampilan');return false}const list=savedViews(v).filter(x=>x.n!==n);list.push({n,f:vPick(f)});DBX.views[v]=list.slice(-12);dbxSave();toast('Tampilan "'+n+'" disimpan');rerender()}});
    const i=$('#vname',bg);i.addEventListener('keydown',ev=>{if(ev.key==='Enter')$('[data-ok]',bg).click()});setTimeout(()=>i.focus(),30)}
});
document.addEventListener('change',e=>{const el=e.target;if(el.dataset.act==='dbx-size'){DBX.size[el.dataset.v]=+el.value;F(el.dataset.v).page=0;dbxSave();rerender()}});
/* pintasan keyboard di tabel member */
document.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey)return;const t=e.target;if(t&&t.matches&&t.matches('input,textarea,select,[contenteditable]'))return;
  if($('.modal-bg')||!DBX_VIEWS.includes(S.view))return;const key=e.key.toLowerCase();
  if(e.key==='/'){const s=$(`[data-act=fq][data-v="${S.view}"]`);if(s){e.preventDefault();s.focus();s.select()}return}
  const rows=$$('#main tr[data-row]');if(!rows.length)return;let i=rows.findIndex(r=>r.dataset.row===S._kid);
  if(key==='j'||key==='k'){e.preventDefault();i=key==='j'?Math.min(rows.length-1,i+1):Math.max(0,i<0?0:i-1);rows.forEach(r=>r.classList.remove('kf'));const r=rows[i];r.classList.add('kf');S._kid=r.dataset.row;r.scrollIntoView({block:'nearest'})}
  else if(i>=0&&(e.key==='Enter'||key==='o')){e.preventDefault();openDrawer(S._kid)}
  else if(i>=0&&key==='x'){e.preventDefault();const c=$('input[data-act=sel]',rows[i]);if(c){c.checked=!c.checked;c.dispatchEvent(new Event('change',{bubbles:true}))}}});
/* ingat filter terakhir per halaman (dipanggil setiap render) */
function dbxPersist(){let ch=false;DBX_VIEWS.forEach(v=>{if(!S.f[v])return;const p={...vPick(S.f[v]),more:!!S.f[v].more};if(JSON.stringify(p)!==JSON.stringify(DBX.last[v])){DBX.last[v]=p;ch=true}});if(ch)dbxSave()}
DBX_VIEWS.forEach(v=>{const l=DBX.last[v];if(l&&typeof l==='object'&&!S.f[v])S.f[v]={...l}});
/* klik di mana saja pada baris member → buka detail (kecuali tombol, link, kotak centang) */
document.addEventListener('click',e=>{const tr=e.target.closest('#main .mtbl tbody tr[data-row]');if(!tr||e.target.closest('button,a,input,select,textarea,label,[data-act]'))return;S._kid=tr.dataset.row;$$('#main tr.kf').forEach(r=>r.classList.remove('kf'));tr.classList.add('kf');openDrawer(tr.dataset.row)});
