import type Phaser from 'phaser';
import { TEX, THEME_COLORS, TILE } from './constants';
import { css, glow, makeSheet, roundRect, speckle } from './paint';
import type { Theme } from './types';
import type { Rng } from './rng';

export const THIRD_WORLDS = ['jungle', 'candy', 'abyss', 'lunar'] as const;
type ThirdWorld = typeof THIRD_WORLDS[number];
export const isThirdWorld = (theme: Theme): theme is ThirdWorld => (THIRD_WORLDS as readonly string[]).includes(theme);
type Ctx = CanvasRenderingContext2D;
function oval(c: Ctx, x: number, y: number, rx: number, ry: number, fill: string): void {
  c.fillStyle=fill;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();
}
function box(c: Ctx,x:number,y:number,w:number,h:number,fill:string,r=4):void {
  c.fillStyle=fill;roundRect(c,x,y,w,h,r);c.fill();
}
function floor(c:Ctx,t:ThirdWorld,v:number,r:Rng):void {
  const p=THEME_COLORS[t];c.fillStyle=css(v%2?p.floorA:p.floorB);c.fillRect(0,0,48,48);
  speckle(c,r,48,48,22,[p.floorA,p.wallSide,p.wallTop],.15);
  if(t==='jungle'){
    c.strokeStyle='#719654';c.lineWidth=2;c.beginPath();c.moveTo(0,38);c.bezierCurveTo(18,20,24,49,48,10);c.stroke();
    for(let i=0;i<4;i++){c.save();c.translate(8+i*11,14+(i+v)%3*9);c.rotate(i);oval(c,0,0,6,2,'#477c3c');c.restore();}
  }else if(t==='candy'){
    c.strokeStyle='#ba87a0';c.lineWidth=3;c.strokeRect(3,3,42,42);
    c.fillStyle='#f6d5c1';for(let i=0;i<4;i++)c.fillRect(8+i*10,10+(i+v)%3*11,3,2);
  }else if(t==='abyss'){
    for(let i=0;i<3;i++){c.strokeStyle='rgba(98,208,230,.16)';c.beginPath();c.moveTo(0,10+i*15);c.quadraticCurveTo(24,25+i*12,48,i*15);c.stroke();}
    oval(c,10+v*8,28,3,1,'#72aaba');
  }else{
    oval(c,15,18,11,8,'#424c63');oval(c,15,20,8,5,'#69758d');oval(c,36,37,6,4,'#3e465e');
    c.strokeStyle='#a4acc0';c.lineWidth=1;c.beginPath();c.arc(15,18,11,3.3,5.7);c.stroke();
  }
}
function object(c:Ctx,t:ThirdWorld,kind:'wall'|'block',v:number):void {
  const p=THEME_COLORS[t];oval(c,24,40,22,6,'#0005');
  if(t==='jungle'){
    box(c,7,9,34,32,css(kind==='wall'?p.wallSide:p.blockSide),9);box(c,8,5,32,29,css(kind==='wall'?p.wallTop:p.blockTop),8);
    c.strokeStyle='#2e6334';c.lineWidth=4;c.beginPath();c.moveTo(13,4);c.bezierCurveTo(39,15,7,29,35,39);c.stroke();
    if(kind==='wall'){oval(c,18,18,3,2,'#213a25');oval(c,30,18,3,2,'#213a25');box(c,20,26,8,3,'#213a25',0);}
  }else if(t==='candy'){
    if(kind==='wall'){
      box(c,7,7,34,35,'#a56c91',10);box(c,6,3,36,31,'#efbbd6',10);
      c.strokeStyle='#fff0df';c.lineWidth=4;c.beginPath();c.moveTo(8,28);c.lineTo(34,5);c.moveTo(21,33);c.lineTo(40,16);c.stroke();
    }else{
      box(c,6,12,36,27,'#ae7262');box(c,6,7,36,25,'#f4d5a3');c.strokeStyle='#b58c64';c.lineWidth=2;
      for(let i=1;i<4;i++){c.beginPath();c.moveTo(6+i*9,9);c.lineTo(6+i*9,30);c.moveTo(7,8+i*7);c.lineTo(40,8+i*7);c.stroke();}
    }
  }else if(t==='abyss'){
    box(c,7,10,34,31,'#254562',8);box(c,9,6,30,28,'#507d92',8);
    c.strokeStyle=kind==='wall'?'#78e3df':'#e3a6c8';c.lineWidth=3;
    for(let i=0;i<3;i++){c.beginPath();c.moveTo(17+i*7,37);c.quadraticCurveTo(7+i*12,17,13+i*10,8+v*2);c.stroke();}
  }else{
    if(kind==='wall'){
      box(c,3,7,42,35,'#576177');box(c,4,3,40,30,'#b4bdce');box(c,10,10,28,15,'#283951');
      c.strokeStyle='#f1cf7e';c.lineWidth=2;c.beginPath();c.moveTo(12,18);c.lineTo(19,13);c.lineTo(27,22);c.lineTo(35,15);c.stroke();
    }else{
      oval(c,24,26,18,16,'#566178');oval(c,24,21,17,15,'#9da9bf');oval(c,19,16,5,4,'#65718a');oval(c,30,26,4,3,'#78849c');
    }
  }
}
export function buildThirdWorldTextures(scene:Phaser.Scene,t:ThirdWorld):void {
  const p=THEME_COLORS[t];
  for(let v=0;v<4;v++){
    makeSheet(scene,TEX.floor(t,v),TILE,TILE,1,(c,_f,_w,_h,r)=>floor(c,t,v,r),2100+v);
    makeSheet(scene,TEX.biome(t,'wall',v),TILE,TILE,1,c=>object(c,t,'wall',v),2110+v);
  }
  makeSheet(scene,TEX.wall(t),48,48,1,c=>object(c,t,'wall',0));
  makeSheet(scene,TEX.biome(t,'crystal'),48,48,1,c=>object(c,t,'wall',2));
  makeSheet(scene,TEX.biome(t,'moss'),48,48,1,(c,_f,_w,_h,r)=>{
    floor(c,t,0,r);for(let i=0;i<6;i++){c.strokeStyle='#9abd64';c.lineWidth=2;c.beginPath();c.moveTo(i*9,48);c.bezierCurveTo(i*9+12,31,i*9-8,15,i*9+7,0);c.stroke();}
  });
  for(let v=0;v<2;v++)makeSheet(scene,TEX.block(t,v),48,48,1,c=>object(c,t,'block',v));
  makeSheet(scene,TEX.rubble(t),48,48,1,(c,_f,_w,_h,r)=>{for(let i=0;i<8;i++)box(c,r.float(5,40),r.float(10,40),5,3,css(p.blockTop),1);});
  for(const kind of ['hazard','abyss','plate','door','gate','prop','exit']){
    makeSheet(scene,TEX.biome(t,kind),48,48,4,(c,f,_w,_h,r)=>{
      if(['hazard','abyss','plate'].includes(kind))floor(c,t,0,r);
      const on=f===3,color=on?p.hazard:f>0?0xffd24a:p.accent;
      if(kind==='door'||kind==='gate'){
        box(c,1,3,46,40,css(p.wallSide));
        c.strokeStyle=css(p.accent);c.lineWidth=4;
        for(let x=8;x<46;x+=10){c.beginPath();c.moveTo(x,6);c.lineTo(x,on?15:39);c.stroke();}
      }else if(kind==='exit'){
        c.strokeStyle=css(p.accent,on?1:.4);c.lineWidth=5;c.beginPath();c.ellipse(24,24,16,21,0,0,Math.PI*2);c.stroke();
        if(on)glow(c,24,24,23,p.accent,.35);
      }else if(kind==='prop'){
        object(c,t,'block',0);oval(c,24,20,7,7,css(on?p.accent:p.wallSide));if(on)glow(c,24,20,18,p.accent,.4);
      }else{
        oval(c,24,27,17,13,css(p.grout));c.strokeStyle=css(color);c.lineWidth=2+f;c.beginPath();c.arc(24,25,12+f,0,Math.PI*2);c.stroke();
        if(on)glow(c,24,25,21,color,.4);
        c.fillStyle=css(color);c.beginPath();c.moveTo(24,14);c.lineTo(31,29);c.lineTo(17,29);c.fill();
      }
    },2150);
  }
}
