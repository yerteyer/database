'use strict';
/* ===== Sinkron langsung dari Google Sheets hasil Google Form + cek folder Drive (lewat connector milik yang membuka) ===== */
const SHEETS={
  map:{id:'1p4RUgTdnqKEvwuwDXIY7H39FICuvhIPjMnqkIloOWqw',range:"'Form Responses 1'!A1:H3000",l:'Mapping Get Member'},
  rkm:{id:'1kHJYOoAsfis_OXMtXKn5E_6dV7oEoE6CuJurraXDqH8',range:"'Form Responses 1'!A1:P5000",l:'RKM'}};
const DRIVE_FOLDER='1NKCK_nWIp78ifbVAL6ZdexdH1rySWabJ';
S.sync=S.sync||{};
function mcpMsg(e,app){const c=e&&(e.code||e.message)||'';
  if(/server_not_connected|not_connected/.test(c))return`Connector ${app} belum terhubung di akun claude.ai Anda.`;
  if(/needs_reauth|auth/.test(c))return`Masuk ulang ke ${app} di pengaturan connector claude.ai.`;
  if(/approval_required|not_granted|denied/.test(c))return`Izinkan halaman ini memakai ${app} (muncul saat tombol ditekan).`;
  return`${app}: ${c||'gagal'}`}
async function getMcp(app){if(!(await waitClaude(3000)))return null;try{return await claude.use('mcp')}catch(e){return null}}
async function sheetValues(kind){const s=SHEETS[kind];const mcp=await getMcp('Google Sheets');if(!mcp){toast('Google Sheets tidak tersedia di tampilan ini — buka dashboard di claude.ai dengan connector Google Sheets terhubung.',5000);return null}
  try{const r=await mcp.callTool('Google Sheets','get_values',{spreadsheetId:s.id,range:s.range});const v=(r&&r.payload&&(r.payload.values||(r.payload.result&&r.payload.result.values)))||[];return v}
  catch(e){toast(mcpMsg(e,'Google Sheets'),5000);return null}}
// simpan untuk semua orang bila pemilik; selain itu hanya dipakai di layar ini
async function saveOrLocal(name,payload,fname){try{await saveDataset(name,payload,fname);return'db'}catch(e){S.raw[name]=payload;S.meta[name]={fileName:fname,updatedAt:new Date().toISOString()};S.src[name]='lokal';applyOverlays();rerender();return'lokal'}}
async function syncSheet(kind){const v=await sheetValues(kind);if(!v)return null;if(v.length<2){toast('Sheet kosong');return 0}
  let n=0,where;
  if(kind==='map'){const p=parseMapping({sheets:{main:v}});n=p.rows.length;if(!n){toast('Kolom SURVEYOR / GET MEMBER tidak ditemukan di sheet');return 0}where=await saveOrLocal('mapping',{sheets:{main:v}},'Google Sheets · Form Responses 1 (Get Member)')}
  else{const h=v[0].map(U);const ix=re=>h.findIndex(x=>re.test(x));
    const m={code:ix(/NOMOR MEMBER/),name:ix(/NAMA MEMBER/),date:ix(/TANGGAL RKM/),pic:ix(/ADVISOR/),type:ix(/JENIS RKM/),issues:ix(/HASIL RKM|KENDALA/),notes:ix(/KETERANGAN|DETAIL TEMPAT/)};if(m.date<0)m.date=ix(/TIMESTAMP/);
    if(m.code<0||m.pic<0){toast('Kolom Nomor Member / Advisor tidak ditemukan');return 0}
    Object.keys(m).forEach(k=>{if(m[k]<0)delete m[k]});
    const isOwner=!(S.db&&S.user&&S.user.isOwner&&!S.user.isOwner());
    if(isOwner){n=await processImport({a:v,hi:0,m,type:'rkm',fname:'Google Sheets · Form Responses 1 (RKM)'});where=S.db?'db':'lokal'}
    else{const nt=rkmNotesFn(v[0],m);const rows=v.slice(1).filter(r=>r&&r[m.code]).map(r=>[String(r[m.code]),String(r[m.name]??''),iso(toDate(r[m.date])),U(r[m.pic]),String(r[m.type]??''),String(r[m.issues]??''),nt(r)]).filter(r=>r[2]);n=rows.length;where=await saveOrLocal('rkmx',{rows},'Google Sheets (RKM)')}}
  S.sync[kind]={at:new Date().toISOString(),n,where};toast(`✓ ${SHEETS[kind].l}: ${fmtN(n)} baris dari Google Sheets${where==='lokal'?' (hanya di layar ini)':''}`);
  if(S.view==='update'||S.view==='form')rerender();return n}
async function driveCheck(){const mcp=await getMcp('Google Drive');if(!mcp){toast('Google Drive tidak tersedia di tampilan ini.',4000);return}
  try{const r=await mcp.callTool('Google Drive','search_files',{query:`'${DRIVE_FOLDER}' in ancestors`,excludeContentSnippets:true,pageSize:50,orderBy:'modifiedTime desc'});
    const files=(r&&r.payload&&(r.payload.files||r.payload.result&&r.payload.result.files))||[];
    const last=Math.max(0,...Object.values(S.meta).map(m=>Date.parse(m.updatedAt||0)||0));
    S.sync.drive={at:new Date().toISOString(),files:files.slice(0,15).map(f=>({name:f.title||f.name,mod:f.modifiedTime||f.modified_time||'',url:f.viewUrl||f.url||f.webViewLink||'',isNew:Date.parse(f.modifiedTime||0)>last}))};
    toast(`Drive: ${S.sync.drive.files.filter(f=>f.isNew).length} file lebih baru dari update terakhir`);if(S.view==='update')rerender()}
  catch(e){toast(mcpMsg(e,'Google Drive'),5000)}}
function syncHtml(){const s=S.sync;const t=k=>s[k]?`<span class="mut">terakhir ${new Date(s[k].at).toLocaleTimeString('id-ID',{timeStyle:'short'})} · ${fmtN(s[k].n)} baris</span>`:'';
  return`<div class="card mt"><div class="card-h"><h3>Tarik langsung dari Google (tanpa download)</h3><span class="mut">memakai connector Google Anda di claude.ai</span></div>
   <div class="sync-row"><button class="btn pri" data-act="sync" data-k="map">⟳ Mapping Get Member</button>${t('map')}</div>
   <div class="sync-row"><button class="btn pri" data-act="sync" data-k="rkm">⟳ RKM (Form Responses)</button>${t('rkm')}</div>
   <div class="sync-row"><button class="btn" data-act="drive-check">Cek file baru di folder Drive</button></div>
   ${s.drive?`<ul class="small mt-s">${s.drive.files.map(f=>`<li>${f.isNew?'<span class="tag warn">baru</span> ':''}${f.url?`<a href="${esc(f.url)}" target="_blank" rel="noopener">${esc(f.name)}</a>`:esc(f.name)} <span class="mut">${esc(String(f.mod).slice(0,16).replace('T',' '))}</span></li>`).join('')}</ul><p class="small muted">File baru: download lalu tarik ke kotak upload di atas.</p>`:''}</div>`}
