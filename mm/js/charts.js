'use strict';
/* SVG chart helpers. All return HTML strings; interaction via data-act attributes. */
function niceMax(v){if(v<=0)return 1;const e=Math.pow(10,Math.floor(Math.log10(v)));const f=v/e;return(f<=1?1:f<=2?2:f<=2.5?2.5:f<=5?5:10)*e}
function lineChart({labels,series,h=240,fmt=v=>fmtS(v),act,hi=[],w=820,area=true,tipExtra}){
  const pad={l:56,r:16,t:14,b:28};const W=w,H=h;const iw=W-pad.l-pad.r,ih=H-pad.t-pad.b;const n=labels.length;
  const mx=niceMax(Math.max(1,...series.flatMap(s=>s.values.filter(v=>v!=null))));
  const x=i=>pad.l+(n<=1?iw/2:i*iw/(n-1)),y=v=>pad.t+ih-(v/mx)*ih;
  let g='';for(let k=0;k<=4;k++){const v=mx*k/4;g+=`<line x1="${pad.l}" x2="${W-pad.r}" y1="${y(v)}" y2="${y(v)}" class="grid"/><text x="${pad.l-8}" y="${y(v)+4}" class="ax" text-anchor="end">${esc(fmt(v,true))}</text>`}
  const step=Math.ceil(n/8);let xl='';labels.forEach((l,i)=>{if(i%step===0||i===n-1)xl+=`<text x="${x(i)}" y="${H-8}" class="ax" text-anchor="middle">${esc(l)}</text>`});
  let hl='';hi.forEach(([i,cls])=>{if(i!=null&&i>=0)hl+=`<line x1="${x(i)}" x2="${x(i)}" y1="${pad.t}" y2="${pad.t+ih}" class="${cls}"/>`});
  let paths='';series.forEach((s,si)=>{const pts=s.values.map((v,i)=>v==null?null:[x(i),y(v)]);const d=pts.filter(Boolean).map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join('');
    if(area&&si===0&&pts.filter(Boolean).length>1){const f=pts.filter(Boolean);paths+=`<path d="${d}L${f[f.length-1][0]},${pad.t+ih}L${f[0][0]},${pad.t+ih}Z" fill="${s.color}" opacity=".08"/>`}
    paths+=`<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2" ${s.dash?'stroke-dasharray="4 4"':''}/>`;
    pts.forEach((p,i)=>{if(p)paths+=`<circle cx="${p[0]}" cy="${p[1]}" r="${hi.some(h=>h[0]===i)?4.5:3}" fill="${s.color}" stroke="#fff" stroke-width="1.5"/>`})});
  let hit='';for(let i=0;i<n;i++){const x0=n<=1?pad.l:x(i)-iw/(n-1)/2;const tw=n<=1?iw:iw/(n-1);
    const tip=labels[i]+'\n'+series.map(s=>`${s.name}: ${s.values[i]==null?'–':fmt(s.values[i])}`).join('\n')+(tipExtra?tipExtra(i):'');
    hit+=`<rect x="${Math.max(pad.l,x0)}" y="${pad.t}" width="${tw}" height="${ih}" fill="transparent" data-tip="${esc(tip)}" ${act?`data-act="${act}" data-i="${i}" style="cursor:pointer"`:''}/>`}
  return`<svg viewBox="0 0 ${W} ${H}" class="chart">${g}${hl}${paths}${xl}${hit}</svg>`;
}
function barsV({labels,values,h=200,fmt=v=>fmtS(v),colors,act,w=820,tips,sel}){
  const pad={l:56,r:10,t:12,b:28};const W=w,H=h,iw=W-pad.l-pad.r,ih=H-pad.t-pad.b;const n=values.length;const mx=niceMax(Math.max(1,...values));
  const bw=iw/n;const y=v=>pad.t+ih-(v/mx)*ih;let g='';for(let k=0;k<=4;k++){const v=mx*k/4;g+=`<line x1="${pad.l}" x2="${W-pad.r}" y1="${y(v)}" y2="${y(v)}" class="grid"/><text x="${pad.l-8}" y="${y(v)+4}" class="ax" text-anchor="end">${esc(fmt(v,true))}</text>`}
  let b='';const step=Math.ceil(n/16);values.forEach((v,i)=>{const bx=pad.l+i*bw+Math.min(2,bw*.1),bww=Math.max(1,bw-Math.min(4,bw*.2));const c=Array.isArray(colors)?colors[i]:(colors||'#2a78d6');
    b+=`<rect x="${bx}" y="${y(v)}" width="${bww}" height="${Math.max(0,pad.t+ih-y(v))}" rx="3" fill="${c}" opacity="${sel!=null&&sel!==i?.45:1}"/>`;
    b+=`<rect x="${pad.l+i*bw}" y="${pad.t}" width="${bw}" height="${ih}" fill="transparent" data-tip="${esc(tips?tips[i]:labels[i]+': '+fmt(v))}" ${act?`data-act="${act}" data-i="${i}" style="cursor:pointer"`:''}/>`;
    if(i%step===0)b+=`<text x="${pad.l+i*bw+bw/2}" y="${H-8}" class="ax" text-anchor="middle">${esc(labels[i])}</text>`});
  return`<svg viewBox="0 0 ${W} ${H}" class="chart">${g}${b}</svg>`;
}
function hbars(items,{max,fmt=v=>fmtN(v),act,lw='40%'}={}){
  const mx=max||Math.max(1,...items.map(i=>i.v));
  return`<div class="bars" style="--lw:${lw}">${items.map((i,k)=>`<div class="bar-row ${act?'click':''}" data-tip="${esc(i.tip||(i.l+': '+fmt(i.v)))}" ${act?`data-act="${act}" data-k="${esc(i.k??k)}"`:''}><div class="bl">${i.pre||''}${esc(i.l)}</div><div class="bar-track"><div class="bar-fill" style="width:${Math.max(0,Math.min(100,i.v/mx*100))}%;background:${i.c||'#2a78d6'}"></div>${i.mark!=null?`<div class="bar-mark" style="left:${Math.min(100,i.mark/mx*100)}%"></div>`:''}</div><div class="bv">${i.vl!=null?i.vl:fmt(i.v)}</div></div>`).join('')}</div>`;
}
function stackBar(segs,{act}={}){const t=segs.reduce((a,s)=>a+s.v,0)||1;
  return`<div class="stack">${segs.filter(s=>s.v>0).map(s=>`<div style="flex:${s.v};background:${s.c}" data-tip="${esc(s.l+': '+fmtN(s.v)+' ('+pct(s.v/t,0)+')')}" ${act?`data-act="${act}" data-k="${s.k}"`:''}></div>`).join('')}</div>
  <div class="stack-leg">${segs.map(s=>`<button class="leg-i" ${act?`data-act="${act}" data-k="${s.k}"`:''}><i style="background:${s.c}"></i>${esc(s.l)}<b>${fmtN(s.v)}</b></button>`).join('')}</div>`}
function spark(vals,{w=120,h=28,color='#2a78d6',hl}={}){const mx=Math.max(1,...vals);const bw=w/vals.length;
  return`<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" class="spark">${vals.map((v,i)=>`<rect x="${i*bw+.5}" y="${h-(v/mx)*h}" width="${Math.max(1,bw-1)}" height="${(v/mx)*h}" fill="${i===hl?'#c8102e':color}" opacity="${i===hl?1:.75}"/>`).join('')}</svg>`}
function donut(segs,{size=120,th=18,center=''}={}){const t=segs.reduce((a,s)=>a+s.v,0)||1;let a0=-Math.PI/2;const r=size/2-th/2,cx=size/2;let p='';
  segs.forEach(s=>{if(!s.v)return;const a1=a0+s.v/t*Math.PI*2;const la=a1-a0>Math.PI?1:0;p+=`<path d="M${cx+r*Math.cos(a0)},${cx+r*Math.sin(a0)}A${r},${r} 0 ${la} 1 ${cx+r*Math.cos(a1-.001)},${cx+r*Math.sin(a1-.001)}" stroke="${s.c}" stroke-width="${th}" fill="none" data-tip="${esc(s.l+': '+fmtN(s.v))}"/>`;a0=a1});
  return`<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${p}<text x="${cx}" y="${cx+5}" text-anchor="middle" class="donut-c">${center}</text></svg>`}
