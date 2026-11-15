import type Phaser from 'phaser';
import { TEX, TILE, THEME_COLORS } from './constants';
import { css, glow, makeSheet, roundRect, speckle } from './paint';
import type { Rng } from './rng';
import type { Theme } from './types';

export const NEXT_WORLDS = ['fungal', 'sky', 'clockwork', 'haunted', 'mirror'] as const;
export type NextWorld = typeof NEXT_WORLDS[number];
export const isNextWorld = (t: Theme): t is NextWorld => (NEXT_WORLDS as readonly string[]).includes(t);
type Ctx = CanvasRenderingContext2D;
const T = TILE;
const oval = (c: Ctx, x: number, y: number, rx: number, ry: number, fill: string): void => {
  c.fillStyle = fill; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill();
};
const box = (c: Ctx, x: number, y: number, w: number, h: number, fill: string, r = 3): void => {
  c.fillStyle = fill; roundRect(c, x, y, w, h, r); c.fill();
};
function polygon(c: Ctx, pts: number[][], fill: string): void {
  c.fillStyle = fill; c.beginPath(); pts.forEach(([x,y],i) => i ? c.lineTo(x,y) : c.moveTo(x,y)); c.closePath(); c.fill();
}
function mushroom(c: Ctx, x: number, y: number, size: number, color: string): void {
  const s = size;
  c.strokeStyle = '#b7bba4'; c.lineWidth = 6 * s; c.lineCap = 'round';
  c.beginPath(); c.moveTo(x,y); c.quadraticCurveTo(x-4*s,y-8*s,x,y-20*s); c.stroke();
  oval(c,x,y-15*s,17*s,5*s,'#533e58');
  c.fillStyle=color; c.beginPath(); c.ellipse(x,y-19*s,19*s,13*s,0,Math.PI,Math.PI*2); c.closePath(); c.fill();
  oval(c,x-7*s,y-25*s,3*s,2*s,'#efdcc2'); oval(c,x+7*s,y-22*s,2*s,1.5*s,'#ead8c5');
  c.strokeStyle='#dec9b0'; c.lineWidth=s;
  for(let i=-2;i<=2;i++){c.beginPath();c.moveTo(x,y-14*s);c.lineTo(x+i*6*s,y-18*s);c.stroke();}
}
function gear(c: Ctx,x:number,y:number,r:number,angle:number,color:string):void {
  c.save(); c.translate(x,y); c.rotate(angle); c.fillStyle=color;
  for(let i=0;i<10;i++){c.rotate(Math.PI/5);c.fillRect(-2,-r-3,4,7);}
  oval(c,0,0,r,r,color); oval(c,0,0,r*.57,r*.57,'#3c3635');
  c.strokeStyle='#d7b477';c.lineWidth=2;
  for(let i=0;i<4;i++){c.rotate(Math.PI/2);c.beginPath();c.moveTo(0,0);c.lineTo(0,r*.7);c.stroke();}
  oval(c,0,0,3,3,'#8a6749'); c.restore();
}
function lantern(c:Ctx,x:number,y:number,on:boolean):void {
  c.strokeStyle='#bcaf8c';c.lineWidth=2;c.beginPath();c.arc(x,y-13,5,Math.PI,0);c.stroke();
  box(c,x-10,y-11,20,25,'#314149');box(c,x-7,y-8,14,18,on?'#a5f4d7':'#536875');
  c.strokeStyle='#bca576';c.beginPath();c.moveTo(x,y-11);c.lineTo(x,y+13);c.moveTo(x-10,y+2);c.lineTo(x+10,y+2);c.stroke();
  polygon(c,[[x-12,y-11],[x,y-18],[x+12,y-11]],'#6e7773');
  if(on)glow(c,x,y,22,0xa6f6d4,.33);
}
function floor(c:Ctx,t:NextWorld,v:number,rng:Rng):void {
  const p=THEME_COLORS[t];c.fillStyle=css(p.floorA);c.fillRect(0,0,T,T);
  if(t==='fungal'){
    speckle(c,rng,T,T,50,[0x1c2e29,0x546952,0x8b7962],.22);
    c.strokeStyle='#43553e';c.lineWidth=2;c.beginPath();c.moveTo(-2,40-v*4);c.bezierCurveTo(14,28,27,45,51,12+v*4);c.stroke();
    for(let i=0;i<3;i++){oval(c,8+i*15,12+(i+v)%3*10,4,2,'#5a6d48');}
    if(v>1){glow(c,31,20,9,0xc1ed8c,.1);oval(c,31,20,1.5,1.5,'#b5d993');}
  }else if(t==='sky'){
    c.fillStyle='#89afbf';c.fillRect(0,0,T,T);
    oval(c,13,18,21,10,'#b6d0d6');oval(c,35,30,22,12,'#a9c7d1');
    polygon(c,[[3,9],[39,3],[46,17],[40,42],[7,43],[1,28]],'#cbd7cc');
    polygon(c,[[4,8],[39,3],[45,16],[39,37],[8,38],[2,26]],v%2?'#dbe1d1':'#d7ddce');
    c.strokeStyle='#b9ac84';c.lineWidth=1;c.strokeRect(9,12,27,20);
    if(v===3){c.strokeStyle='#a3b8b8';c.beginPath();c.moveTo(13,12);c.lineTo(22,22);c.lineTo(18,31);c.stroke();}
  }else if(t==='clockwork'){
    c.fillStyle='#493c35';c.fillRect(0,0,T,T);
    for(let i=0;i<4;i++){box(c,0,i*12+1,T,10,(i+v)%2?'#534137':'#5b493b',0);c.strokeStyle='#2d2729';c.beginPath();c.moveTo(0,i*12);c.lineTo(48,i*12);c.stroke();}
    for(const y of[6,30])oval(c,5+(v%2)*29,y,1,1,'#ad9670');
    if(v>=2){c.strokeStyle='#97784c';c.lineWidth=2;c.beginPath();c.moveTo(0,23);c.lineTo(48,23);c.stroke();}
  }else if(t==='haunted'){
    c.fillStyle='#38313f';c.fillRect(0,0,T,T);
    for(let i=0;i<4;i++){box(c,i*12+1,0,10,T,(i+v)%2?'#4c3b49':'#433645',0);}
    c.strokeStyle='#231f2d';c.lineWidth=1;c.beginPath();c.moveTo(0,22+v*2);c.lineTo(24,22+v*2);c.stroke();
    if(v===2){box(c,5,4,38,39,'#4b3449');c.strokeStyle='#897452';c.strokeRect(8,7,32,33);}
    if(v===3){c.strokeStyle='rgba(194,204,204,.2)';c.beginPath();c.moveTo(0,0);c.lineTo(20,5);c.moveTo(0,0);c.lineTo(5,20);c.moveTo(0,0);c.lineTo(15,15);c.stroke();}
  }else{
    const g=c.createLinearGradient(0,0,48,48);g.addColorStop(0,'#2c465a');g.addColorStop(.45,'#233449');g.addColorStop(1,'#39526b');c.fillStyle=g;c.fillRect(0,0,48,48);
    c.strokeStyle='rgba(190,228,235,.3)';c.lineWidth=1;c.beginPath();c.moveTo(0,48);c.lineTo(48,0);c.stroke();
    c.strokeStyle='rgba(238,198,236,.14)';c.strokeRect(2,2,44,44);
    if(v>=2){polygon(c,[[8,15],[24,7],[39,15],[24,23]],'rgba(206,234,242,.1)');}
  }
}
function wall(c:Ctx,t:NextWorld,v:number):void {
  oval(c,24,40,23,7,'rgba(0,0,0,.35)');
  if(t==='fungal'){
    box(c,8,9,30,32,'#5b4849',8);c.strokeStyle='#90735b';c.lineWidth=3;
    for(const x of[13,23,33]){c.beginPath();c.moveTo(x,15);c.lineTo(x+2,38);c.stroke();}
    mushroom(c,24,39,1.06,v%2?'#b76c8b':'#8f688b');mushroom(c,39,42,.43,'#c9a379');
  }else if(t==='sky'){
    box(c,5,12,38,31,'#839ba6');box(c,9,7,30,29,'#dddcc2');
    c.strokeStyle='#a9ae9c';c.lineWidth=2;for(const x of[14,23,32]){c.beginPath();c.moveTo(x,10);c.lineTo(x,33);c.stroke();}
    oval(c,24,8,21,6,'#f1e9ce');oval(c,24,5,16,4,'#fff0cf');
    c.strokeStyle='#7e9e7e';c.lineWidth=2;c.beginPath();c.moveTo(37,13);c.quadraticCurveTo(30,24,37,37);c.stroke();
  }else if(t==='clockwork'){
    box(c,2,5,44,39,'#42372f');box(c,3,2,42,34,'#796344');
    gear(c,22,20,15,v*.5,'#c2a267');gear(c,40,34,7,-v,'#93714c');
    c.strokeStyle='#d2b479';c.lineWidth=3;c.beginPath();c.moveTo(4,40);c.lineTo(44,40);c.stroke();
  }else if(t==='haunted'){
    box(c,3,10,42,34,'#303341');polygon(c,[[3,11],[24,1],[45,11],[43,36],[5,36]],'#636574');
    polygon(c,[[12,32],[12,17],[24,7],[36,17],[36,32]],'#2a3341');
    polygon(c,[[16,31],[16,18],[24,12],[32,18],[32,31]],v%2?'#485467':'#455969');
    c.strokeStyle='#9a9380';c.lineWidth=2;c.beginPath();c.moveTo(24,12);c.lineTo(24,30);c.moveTo(16,23);c.lineTo(32,23);c.stroke();
    box(c,5,35,38,6,'#7f7b7e');
  }else{
    polygon(c,[[3,12],[23,2],[44,12],[43,39],[22,46],[3,37]],'#48718c');
    polygon(c,[[5,12],[23,4],[41,13],[23,28]],'#b1d9e5');polygon(c,[[5,12],[23,28],[22,43],[5,35]],'#6a9bb5');polygon(c,[[23,28],[41,13],[41,36],[22,43]],'#8b8ebf');
    c.strokeStyle='#f2eaff';c.lineWidth=1.4;c.beginPath();c.moveTo(9,13);c.lineTo(20,7);c.moveTo(27,29);c.lineTo(38,17);c.stroke();
  }
}
function block(c:Ctx,t:NextWorld,v:number):void {
  oval(c,24,39,18,6,'rgba(0,0,0,.3)');
  if(t==='fungal'){mushroom(c,21,41,.95,v?'#cf9074':'#cf7894');mushroom(c,37,39,.45,'#ada67c');}
  else if(t==='sky'){
    c.strokeStyle='#c8af71';c.lineWidth=3;c.beginPath();c.arc(24,13,11,Math.PI,0);c.stroke();
    polygon(c,[[15,13],[33,13],[37,32],[11,32]],'#d7b67e');oval(c,24,33,16,4,'#f1d99b');oval(c,24,36,5,3,'#9d8566');
    c.strokeStyle='#fff1c6';c.lineWidth=2;c.beginPath();c.moveTo(18,17);c.lineTo(15,28);c.stroke();
  }else if(t==='clockwork'){
    box(c,9,6,28,32,'#6a4e3c',8);box(c,10,3,26,30,'#b7774f',8);oval(c,23,4,12,4,'#d8a76c');
    c.strokeStyle='#554439';c.lineWidth=4;for(const y of[14,29]){c.beginPath();c.moveTo(9,y);c.lineTo(37,y);c.stroke();}
    oval(c,24,21,7,7,'#dec997');c.strokeStyle='#613f31';c.lineWidth=1;c.beginPath();c.moveTo(24,21);c.lineTo(28,17);c.stroke();
  }else if(t==='haunted'){
    box(c,5,5,38,37,'#4c3732');box(c,8,4,32,31,'#735441');
    for(let i=0;i<5;i++)box(c,11+i*5,9+(i%2)*3,4,20-(i%2)*3,['#87645a','#557a74','#b29c72','#62556e','#a57b5e'][i],0);
    box(c,8,30,32,4,'#ad8c5e');
  }else{
    polygon(c,[[24,3],[40,19],[35,37],[15,40],[7,21]],'#b49bce');polygon(c,[[24,3],[25,24],[7,21]],'#cbe8ef');polygon(c,[[25,24],[40,19],[35,37]],'#a4c7e0');
    c.strokeStyle='#fff0ff';c.lineWidth=1;c.beginPath();c.moveTo(24,3);c.lineTo(25,24);c.lineTo(15,40);c.stroke();
  }
}
function hazard(c:Ctx,t:NextWorld,f:number,rng:Rng):void {
  floor(c,t,0,rng);const p=THEME_COLORS[t];const active=f===3;const warning=f===1||f===2;
  const color=warning?0xffd24a:active?p.hazard:p.accent;
  if(t==='fungal'){
    mushroom(c,24,40,.7,active?'#a2d49a':'#7f6d7d');
    for(let i=0;i<6;i++)oval(c,8+i*6,active?9+(i%3)*5:24+(i%2)*4,active?4:2,active?4:2,css(color,active?.65:.25));
  }else if(t==='sky'){
    oval(c,24,29,20,10,'#9cbbc5');oval(c,17,23,11,9,'#cee2dc');oval(c,31,23,12,8,'#bdd9d8');
    if(active)polygon(c,[[25,7],[15,24],[24,24],[19,42],[35,18],[27,19]],'#edf9ff');
    else {c.strokeStyle=css(color,.5);c.lineWidth=2;c.beginPath();c.arc(24,27,11,.2,4);c.stroke();}
  }else if(t==='clockwork'){
    box(c,7,27,34,15,'#6b5942');oval(c,24,27,17,5,'#c0a675');oval(c,24,27,10,3,'#2b2930');
    for(let i=0;i<4;i++){c.strokeStyle=css(color,active?.7:.18);c.lineWidth=active?4:2;c.beginPath();c.moveTo(13+i*7,25);c.bezierCurveTo(7+i*7,20,20+i*5,14,13+i*6,active?2:19);c.stroke();}
  }else if(t==='haunted'){
    glow(c,24,25,23,color,active?.4:.12);c.fillStyle=css(color,active?.65:.18);c.beginPath();c.arc(24,20,12,Math.PI,0);c.lineTo(37,38);c.lineTo(29,33);c.lineTo(24,39);c.lineTo(18,33);c.lineTo(11,38);c.closePath();c.fill();
    oval(c,20,21,2,3,'#263442');oval(c,28,21,2,3,'#263442');
  }else{
    c.strokeStyle=css(color,active?1:.2);c.lineWidth=active?3:1;
    for(let i=0;i<3;i++){c.beginPath();c.moveTo(4,8+i*14);c.lineTo(42,40-i*14);c.stroke();}
    if(active)glow(c,24,24,23,color,.3);
  }
  if(warning){c.strokeStyle='#ffd24a';c.lineWidth=2;c.setLineDash([5,4]);c.strokeRect(2,2,44,44);c.setLineDash([]);}
}
function device(c:Ctx,t:NextWorld,k:string,f:number):void {
  const p=THEME_COLORS[t];const on=f>0;
  if(k==='gate'||k==='door'){
    const open=k==='door'&&f<2;
    if(t==='sky'){
      oval(c,24,34,23,12,'rgba(205,231,235,.25)');
      if(!open){box(c,3,2,8,44,'#dbd9bf');box(c,37,2,8,44,'#dbd9bf');box(c,11,4,26,40,'rgba(144,201,216,.75)');c.strokeStyle='#e9f7ed';c.lineWidth=2;c.beginPath();c.moveTo(13,14);c.lineTo(35,32);c.moveTo(13,32);c.lineTo(35,14);c.stroke();}
      else for(let y=6;y<45;y+=9)box(c,3,y,42,6,'#dddbc5',1);
    }else if(t==='fungal'){
      c.strokeStyle='#8a8d65';c.lineWidth=5;
      for(const x of[10,22,35]){c.beginPath();c.moveTo(x,47);c.quadraticCurveTo(x+(x%2?8:-7),24,x,open?40:2);c.stroke();}
    }else if(t==='clockwork'){
      box(c,2,3,8,42,'#99835f');box(c,38,3,8,42,'#99835f');
      for(let x=13;x<38;x+=8)box(c,x,3,5,open?7:42,'#c3ae7c',1);
    }else if(t==='haunted'){
      c.strokeStyle='#9b9487';c.lineWidth=3;
      for(let x=8;x<45;x+=8){c.beginPath();c.moveTo(x,open?2:10);c.lineTo(x,open?9:45);c.stroke();}
      polygon(c,[[4,13],[24,1],[44,13]],'#6c6c79');
    }else{
      polygon(c,[[3,3],[43,3],[43,45],[3,45]],open?'rgba(203,233,241,.12)':'#729db9');
      c.strokeStyle='#f7dbf8';c.lineWidth=2;c.strokeRect(6,6,36,36);
      if(!open){c.beginPath();c.moveTo(8,37);c.lineTo(37,9);c.stroke();}
    }
    if(k==='gate'){box(c,18,17,12,14,css(p.accent));oval(c,24,23,2,3,'#273240');}
    return;
  }
  if(k==='exit'){
    c.strokeStyle=css(p.accent,on?1:.35);c.lineWidth=4;c.beginPath();c.ellipse(24,24,16,21,0,0,Math.PI*2);c.stroke();
    if(on)glow(c,24,24,23,p.accent,.4);return;
  }
  if(k==='plate'){
    oval(c,24,26,18,15,css(p.wallSide));
    if(t==='clockwork')gear(c,24,23,13,0,on?'#ecd9a0':'#a98b5f');
    else if(t==='haunted')lantern(c,24,23,on);
    else {c.strokeStyle=on?'#b8ffcf':'#e5cea3';c.lineWidth=2;c.beginPath();c.arc(24,24,12,0,Math.PI*2);c.stroke();polygon(c,[[24,16],[30,29],[18,29]],on?'#b8ffcf':'#cdb987');}
    return;
  }
  oval(c,24,40,17,5,'rgba(0,0,0,.3)');
  if(t==='fungal'){mushroom(c,24,40,.9,on?'#b7eda1':'#a68b8e');glow(c,24,18,18,p.accent,on?.5:.15);}
  else if(t==='sky'){
    box(c,21,15,6,25,'#b4a476');oval(c,24,39,12,4,'#d8ca99');
    c.save();c.translate(24,18);c.rotate(on?.7:0);for(let i=0;i<4;i++){c.rotate(Math.PI/2);polygon(c,[[0,0],[12,3],[6,12]],on?'#f8e9a7':'#b9c9bb');}c.restore();
  }else if(t==='clockwork'){gear(c,24,23,16,on?.6:0,on?'#f0d797':'#aa8c5f');}
  else if(t==='haunted'){lantern(c,24,23,on);}
  else {polygon(c,[[24,2],[39,23],[24,40],[9,23]],on?'#f3e4ff':'#b6c9e6');c.strokeStyle='#ffc9ed';c.lineWidth=2;c.strokeRect(12,11,24,24);glow(c,24,23,20,p.accent,on?.4:.1);}
}
export function buildNextWorldTextures(scene:Phaser.Scene,t:NextWorld):void {
  for(let v=0;v<4;v++){
    makeSheet(scene,TEX.floor(t,v),T,T,1,(c,_f,_w,_h,r)=>floor(c,t,v,r),2300+v);
    makeSheet(scene,TEX.biome(t,'wall',v),T,T,1,(c)=>wall(c,t,v),2310+v);
  }
  makeSheet(scene,TEX.wall(t),T,T,1,c=>wall(c,t,0),2310);
  for(let v=0;v<2;v++)makeSheet(scene,TEX.block(t,v),T,T,1,c=>block(c,t,v),2320+v);
  for(const k of['door','gate','prop','exit','plate'])makeSheet(scene,TEX.biome(t,k),T,T,4,(c,f,_w,_h,r)=>{if(k==='plate')floor(c,t,0,r);device(c,t,k,f);},2330);
  makeSheet(scene,TEX.biome(t,'trap'),T,T,4,(c,f,_w,_h,r)=>{
    floor(c,t,0,r);box(c,7,8,34,33,css(THEME_COLORS[t].wallSide));
    polygon(c,[[24,14],[35,33],[13,33]],f?'#ffd24a':'#c5a773');
    box(c,23,20,2,7,'#302935',0);box(c,23,29,2,2,'#302935',0);
  },2335);
  makeSheet(scene,TEX.biome(t,'hazard'),T,T,4,(c,f,_w,_h,r)=>hazard(c,t,f,r),2340);
  makeSheet(scene,TEX.biome(t,'abyss'),T,T,1,(c)=>{
    c.fillStyle=css(THEME_COLORS[t].bg);c.fillRect(0,0,T,T);
    if(t==='sky'){oval(c,13,32,25,10,'#769eb1');oval(c,35,40,25,8,'#9bbdca');}
    else {oval(c,24,24,18,15,'#132439');glow(c,24,24,20,THEME_COLORS[t].accent,.07);}
  },2345);
  makeSheet(scene,TEX.biome(t,'crystal'),T,T,1,c=>wall(c,t,2),2350);
  makeSheet(scene,TEX.biome(t,'moss'),T,T,1,(c,_f,_w,_h,r)=>{
    floor(c,t,0,r);for(let i=0;i<12;i++){const x=r.float(2,46),y=r.float(2,46);oval(c,x,y,6,3,'rgba(149,188,92,.3)');}
    c.strokeStyle='#9cbe78';c.lineWidth=1;for(let i=0;i<4;i++){c.beginPath();c.moveTo(i*14,47);c.quadraticCurveTo(i*14+8,24,i*14,0);c.stroke();}
  },2355);
  makeSheet(scene,TEX.rubble(t),T,T,1,(c,_f,_w,_h,r)=>{for(let i=0;i<9;i++){const x=r.float(6,39),y=r.float(12,39);polygon(c,[[x,y],[x+6,y-3],[x+7,y+4]],css(THEME_COLORS[t].blockSide));}},2360);
}
