'use strict';
/* Lightweight canvas map with baked Mapbox basemap images (no runtime tile requests). */
const MAPIMG={meta:null,imgs:[],ready:null};
/* gambar didekode di luar thread utama (ImageBitmap) agar HP lemah tidak tersendat saat peta digambar */
function loadImg(o){o.im=true;const im=new Image();im.decoding='async';im.onload=()=>{(window.createImageBitmap?createImageBitmap(im):Promise.resolve(im)).then(bm=>{o.bm=bm;MapView.all.forEach(v=>v.draw())},()=>{o.bm=im;MapView.all.forEach(v=>v.draw())})};im.src='map/'+o.f}
function loadBasemap(){if(MAPIMG.ready)return MAPIMG.ready;MAPIMG.ready=getJSON('map/meta.json').then(meta=>{MAPIMG.meta=meta;MAPIMG.imgs=meta.map(m=>{const o={...m,im:null,bm:null};if(!m.lazy)loadImg(o);return o})}).catch(()=>{});return MAPIMG.ready}
const wX=lng=>(lng+180)/360*256;
const wY=lat=>{const s=Math.sin(lat*Math.PI/180);return(0.5-Math.log((1+s)/(1-s))/(4*Math.PI))*256};
const unX=x=>x/256*360-180;
const unY=y=>{const n=Math.PI-2*Math.PI*y/256;return 180/Math.PI*Math.atan(.5*(Math.exp(n)-Math.exp(-n)))};
class MapView{
  constructor(host,opt={}){
    this.host=host;this.opt=opt;this.pts=[];this.z=11.3;this.cx=wX(101.43);this.cy=wY(0.49);this.hl=null;this.mark=null;
    host.classList.add('mapv');
    host.innerHTML=`<canvas></canvas><div class="map-ctl"><button data-m="in" title="Perbesar">+</button><button data-m="out" title="Perkecil">−</button><button data-m="fit" title="Tampilkan semua titik">⤢</button>${opt.gm?`<a class="gm-btn" data-m="gm" target="_blank" rel="noopener" title="Buka di Google Maps: area titik hasil filter (My Maps tim)" hidden><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 1.5a7.5 7.5 0 0 0-7.5 7.5c0 5.6 7.5 13.5 7.5 13.5S19.5 14.6 19.5 9A7.5 7.5 0 0 0 12 1.5z" fill="#EA4335"/><path d="M6.7 3.7 10 7a3.2 3.2 0 0 0-1.2 2.4L4.6 11A7.4 7.4 0 0 1 6.7 3.7z" fill="#4285F4"/><path d="M4.6 11l4.2-1.6c.1 1.7 1.5 3 3.2 3V22.5C9.6 19.6 5.5 14.6 4.6 11z" fill="#34A853"/><path d="M12 12.4a3.2 3.2 0 0 0 3.2-3.2l4.2-.4c-.3 5-6.4 12.3-7.4 13.7z" fill="#FBBC04"/><circle cx="12" cy="9.2" r="2.6" fill="#fff"/></svg></a>`:''}</div><div class="map-attr">© Mapbox © OpenStreetMap</div><div class="map-pop" hidden></div>`;
    this.cv=$('canvas',host);this.ctx=this.cv.getContext('2d');this.pop=$('.map-pop',host);
    this.ro=new ResizeObserver(()=>this.resize());this.ro.observe(host);this.resize();
    this.bind();MapView.all.add(this);loadBasemap().then(()=>this.draw());
  }
  destroy(){this.ro.disconnect();MapView.all.delete(this)}
  resize(){const r=this.host.getBoundingClientRect();this.W=r.width;this.H=r.height;const dpr=devicePixelRatio||1;this.cv.width=this.W*dpr;this.cv.height=this.H*dpr;this.cv.style.width=this.W+'px';this.cv.style.height=this.H+'px';this.ctx.setTransform(dpr,0,0,dpr,0,0);this.draw()}
  sx(x){return(x-this.cx)*Math.pow(2,this.z)+this.W/2}
  sy(y){return(y-this.cy)*Math.pow(2,this.z)+this.H/2}
  setPoints(pts){this.pts=pts.filter(p=>p.lat!=null&&p.lng!=null).map(p=>({...p,x:wX(p.lng),y:wY(p.lat)}));this.closePop();
    const g=$('.gm-btn',this.host);if(g){const u=this.opt.gm(this.pts);g.hidden=!u;if(u)g.href=u}this.draw()}
  fit(pts=this.pts){if(!pts.length)return;let xs=pts.map(p=>p.x??wX(p.lng)).sort((a,b)=>a-b),ys=pts.map(p=>p.y??wY(p.lat)).sort((a,b)=>a-b);
    const q=(a,f)=>a[Math.floor(f*(a.length-1))];const lo=pts.length>300?.08:pts.length>20?.02:0,hi=1-lo;const x0=q(xs,lo),x1=q(xs,hi),y0=q(ys,lo),y1=q(ys,hi);
    this.cx=(x0+x1)/2;this.cy=(y0+y1)/2;const sp=Math.max((x1-x0)/(this.W-60||1),(y1-y0)/(this.H-60||1),1e-6);this.z=Math.max(7,Math.min(16,Math.log2(1/sp)));this.draw()}
  zoomAt(f,px,py){const wx=this.cx+(px-this.W/2)/Math.pow(2,this.z),wy=this.cy+(py-this.H/2)/Math.pow(2,this.z);this.z=Math.max(6,Math.min(17,this.z+f));this.cx=wx-(px-this.W/2)/Math.pow(2,this.z);this.cy=wy-(py-this.H/2)/Math.pow(2,this.z);this.closePop();this.draw()}
  draw(){const c=this.ctx;if(!c||!this.W)return;c.fillStyle='#ece9e3';c.fillRect(0,0,this.W,this.H);
    c.imageSmoothingQuality='high';
    for(const m of MAPIMG.imgs){if(m.z===16&&this.z<13.3)continue;if(m.z===15&&this.z<12.3)continue;
      if(!m.im){const vx0=this.sx(m.x0),vy0=this.sy(m.y0),vx1=this.sx(m.x1),vy1=this.sy(m.y1);if(vx1<0||vy1<0||vx0>this.W||vy0>this.H)continue;loadImg(m);continue}
      if(!m.bm)continue;if(m.z===13&&this.z<11.8)continue;if(m.z===12&&this.z<10.6)continue;if(m.z===10&&this.z<8.6)continue;
      const x0=this.sx(m.x0),y0=this.sy(m.y0),x1=this.sx(m.x1),y1=this.sy(m.y1);if(x1<0||y1<0||x0>this.W||y0>this.H)continue;c.drawImage(m.bm,x0,y0,x1-x0,y1-y0)}
    const r=Math.max(2.2,Math.min(7,2.2+(this.z-10.5)*1.1));
    for(const p of this.pts){const x=this.sx(p.x),y=this.sy(p.y);if(x<-10||y<-10||x>this.W+10||y>this.H+10)continue;c.beginPath();c.arc(x,y,p.r||r,0,7);c.fillStyle=p.c||'#2a78d6';c.fill();if(this.z>11.5){c.lineWidth=1;c.strokeStyle='rgba(255,255,255,.9)';c.stroke()}}
    if(this.hl){const x=this.sx(this.hl.x),y=this.sy(this.hl.y);c.beginPath();c.arc(x,y,r+5,0,7);c.lineWidth=3;c.strokeStyle='#c8102e';c.stroke()}
    if(this.mark){const x=this.sx(this.mark.x),y=this.sy(this.mark.y);c.beginPath();c.moveTo(x,y);c.arc(x,y-18,9,Math.PI*0.75,Math.PI*0.25);c.closePath();c.fillStyle='#c8102e';c.fill();c.beginPath();c.arc(x,y-18,3.5,0,7);c.fillStyle='#fff';c.fill()}
  }
  hit(px,py){let best=null,bd=12;for(const p of this.pts){const d=Math.hypot(this.sx(p.x)-px,this.sy(p.y)-py);if(d<bd){bd=d;best=p}}return best}
  showPop(p){this.hl=p;const html=this.opt.popup?this.opt.popup(p):esc(p.name);this.pop.innerHTML=html+'<button class="icon-btn pop-x" data-m="close">✕</button>';this.pop.hidden=false;
    const x=this.sx(p.x),y=this.sy(p.y);const pw=Math.min(300,this.W-20);this.pop.style.width=pw+'px';let left=Math.max(10,Math.min(this.W-pw-10,x-pw/2));let top=y+14;if(top+180>this.H)top=Math.max(10,y-14-this.pop.offsetHeight);this.pop.style.left=left+'px';this.pop.style.top=top+'px';this.draw()}
  closePop(){if(this.pop){this.pop.hidden=true}this.hl=null}
  bind(){const cv=this.cv;const ptrs=new Map();
    this.host.addEventListener('click',e=>{const b=e.target.closest('[data-m]');if(!b||!this.host.contains(b))return;const m=b.dataset.m;
      if(m==='in')this.zoomAt(1,this.W/2,this.H/2);else if(m==='out')this.zoomAt(-1,this.W/2,this.H/2);else if(m==='fit')this.fit();else if(m==='close'){this.closePop();this.draw()}});
    cv.addEventListener('wheel',e=>{e.preventDefault();const r=cv.getBoundingClientRect();this.zoomAt(-e.deltaY*0.0022*(e.ctrlKey?3:1),e.clientX-r.left,e.clientY-r.top)},{passive:false});
    cv.addEventListener('dblclick',e=>{const r=cv.getBoundingClientRect();this.zoomAt(1,e.clientX-r.left,e.clientY-r.top)});
    cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);const r=cv.getBoundingClientRect();ptrs.set(e.pointerId,{x:e.clientX-r.left,y:e.clientY-r.top});
      if(ptrs.size===2){const [a,b]=[...ptrs.values()];this.pinch={d:Math.hypot(a.x-b.x,a.y-b.y),z:this.z};this.drag=null;return}
      const px=e.clientX-r.left,py=e.clientY-r.top;this.drag={x:px,y:py,cx:this.cx,cy:this.cy,moved:false}});
    cv.addEventListener('pointermove',e=>{const r=cv.getBoundingClientRect();const px=e.clientX-r.left,py=e.clientY-r.top;if(ptrs.has(e.pointerId))ptrs.set(e.pointerId,{x:px,y:py});
      if(this.pinch&&ptrs.size===2){const [a,b]=[...ptrs.values()];const d=Math.hypot(a.x-b.x,a.y-b.y);const nz=this.pinch.z+Math.log2(d/this.pinch.d);this.zoomAt(nz-this.z,(a.x+b.x)/2,(a.y+b.y)/2);return}
      const d=this.drag;if(!d){cv.style.cursor=this.hit(px,py)?'pointer':'grab';return}
      if(Math.hypot(px-d.x,py-d.y)>4)d.moved=true;
      if(d.moved){const k=Math.pow(2,this.z);this.cx=d.cx-(px-d.x)/k;this.cy=d.cy-(py-d.y)/k;cv.style.cursor='grabbing';this.draw()}});
    const up=e=>{ptrs.delete(e.pointerId);if(ptrs.size<2)this.pinch=null;const d=this.drag;this.drag=null;if(!d)return;const r=cv.getBoundingClientRect();const px=e.clientX-r.left,py=e.clientY-r.top;
      if(!d.moved&&this.onTap){const k=Math.pow(2,this.z);this.onTap(this.cx+(px-this.W/2)/k,this.cy+(py-this.H/2)/k);return}
      if(!d.moved){const p=this.hit(px,py);if(p)this.showPop(p);else{this.closePop();this.draw()}}};
    cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  }
  visible(){return this.pts.filter(p=>{const x=this.sx(p.x),y=this.sy(p.y);return x>=0&&y>=0&&x<=this.W&&y<=this.H})}
}
MapView.all=new Set();
