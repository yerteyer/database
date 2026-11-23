'use strict';
/* ===== Hasil kunjungan dari aplikasi Project MM =====
   Dashboard tidak meminta posisi HP (tampilan Claude memblokir GPS). Posisi member dicek lewat tombol Google Maps di tabel Project. */
function b64d(t){const s=atob(t.replace(/-/g,'+').replace(/_/g,'/'));const u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return JSON.parse(new TextDecoder().decode(u))}
function readMotoHash(){const m=/^#?moto-([A-Za-z0-9_-]{4,})$/.exec(location.hash);if(!m)return false;let o=null;try{o=b64d(m[1])}catch(e){}
  try{history.replaceState(null,'','#peta')}catch(e){}if(!o||o.v!==1||!Array.isArray(o.r))return false;S._motoIn=o;
  (async()=>{for(let i=0;i<120&&!(CALC&&S._capsDone);i++)await sleep(250);if(S.view!=='project')go('project');showMotoResult(o)})();return true}
function showMotoResult(o){const tok=o.t+'|'+o.r.map(r=>r[0]+r[1]).join(',');let seen=[];try{seen=JSON.parse(localStorage.getItem('igr2_moto_in')||'[]')}catch(e){}
  const rows=o.r.filter(r=>Array.isArray(r)&&typeof r[0]==='string'&&FU_ST.includes(r[1])).map(r=>({id:r[0],st:r[1],e:entOf(r[0])})).filter(r=>r.e);
  if(!rows.length){toast(seen.includes(tok)?'Hasil ini sudah pernah disimpan':'Tidak ada hasil kunjungan baru dari aplikasi');rerender();return}
  const dup=seen.includes(tok);
  modal('Simpan hasil kunjungan dari aplikasi?',`${dup?'<div class="alert red">Hasil ini sepertinya sudah pernah disimpan. Simpan lagi hanya bila yakin.</div>':''}<p class="small muted">${fmtN(rows.length)} kunjungan dari aplikasi Project MM. Periksa dulu, lalu simpan ke data follow-up${S.db?' tim':' (browser ini — belum login)'}.</p>
   <ol class="route-list">${rows.map(r=>`<li><span class="rn">✓</span><div style="flex:1;min-width:0"><b>${esc(r.e.name)}</b><div class="mut">${esc(statusOf(r.e))} → <b>${esc(r.st)}</b></div></div></li>`).join('')}</ol>`,
   {okLbl:'Simpan hasil',ok:async()=>{for(const r of rows){await saveFU(r.id,{status:r.st},r.st+' (aplikasi Project MM)');await sleep(60)}
     seen=[tok,...seen.filter(x=>x!==tok)].slice(0,30);try{localStorage.setItem('igr2_moto_in',JSON.stringify(seen))}catch(e){}buildProjects();rerender();toast(`✓ ${rows.length} hasil kunjungan tersimpan`)}})}
readMotoHash();window.addEventListener('hashchange',readMotoHash);
