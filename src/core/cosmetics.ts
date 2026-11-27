import type Phaser from 'phaser';
import { makeSheet, roundRect } from './paint';
import { TILE, TEX } from './constants';
import type { BombType } from './types';

export type Rarity = 'basic'|'common'|'rare'|'epic'|'legendary'|'mythic';
type Design = { id:string; name:string; rarity:Rarity; price:number; main:string; light:string; dark:string; motif:string };
const hero = (id:string,name:string,rarity:Rarity,price:number,main:string,light:string,dark:string,motif:string):Design=>({id:'hero-'+id,name,rarity,price,main,light,dark,motif});
const bomb = (id:string,name:string,rarity:Rarity,price:number,main:string,light:string,dark:string,motif:string):Design=>({id:'bomb-'+id,name,rarity,price,main,light,dark,motif});
export const HERO_SKINS:Design[]=[
 hero('ourson','Ourson Pastel','basic',200,'#ec78ac','#ffe6f4','#773b80','bear'),
 hero('panda','Panda Bonbon','basic',300,'#eae8ff','#ffffff','#24243d','panda'),
 hero('lapin','Lapin Nuage','basic',400,'#98c9fb','#f5fbff','#5577b1','rabbit'),
 hero('neon','Cyber Néon','common',600,'#08c4db','#a8ffff','#232153','robot'),
 hero('ice','Glacier','common',750,'#4797e8','#e3ffff','#213b84','ice'),
 hero('fox','Renard Flamboyant','common',850,'#e76a32','#ffe6b8','#813832','fox'),
 hero('astro','Astronaute Manga','rare',1100,'#e6e8f4','#ffffff','#334b88','astro'),
 hero('pilote','Pilote Galactique','rare',1300,'#d74865','#fff0e2','#263a64','pilot'),
 hero('ninja','Ninja Écarlate','rare',1400,'#942943','#ff8d8a','#211829','ninja'),
 hero('samurai','Samouraï Néon','epic',2000,'#6933ca','#58f9fc','#292044','samurai'),
 hero('mage','Mage des Étoiles','epic',2200,'#3434a4','#ffde87','#1e164d','mage'),
 hero('celeste','Guerrier Céleste','epic',2500,'#e69442','#fff2a1','#2c4e9e','celestial'),
 hero('toxic','Ombre Toxique','epic',2100,'#2cb878','#caff60','#153b2a','toxic'),
 hero('inferno','Roi Magma','legendary',3500,'#ee4927','#ffd64b','#602020','magma'),
 hero('gold','Or Suprême','legendary',4000,'#d6a033','#fff6b8','#77501c','king'),
 hero('shadow','Spectre Lunaire','legendary',3800,'#5e4d91','#c9ddff','#211a3a','spectre'),
 hero('dragon','Dragon Astral','mythic',6000,'#3156c6','#a8ffff','#311c72','dragon'),
 hero('phoenix','Phénix Impérial','mythic',6500,'#e54f28','#fff0a1','#8c204b','phoenix'),
];
export const BOMB_SKINS:Design[]=[
 bomb('bonbon','Bombe Bonbon','basic',150,'#ec75c9','#fff1fb','#902e8d','candy'),
 bomb('crystal','Bombe Cristal','basic',350,'#43aee8','#d2ffff','#2351a2','crystal'),
 bomb('neon','Bombe Néon','common',650,'#34346d','#60ffdf','#11172f','neon'),
 bomb('lava','Bombe Lave','common',800,'#a72c29','#ffb33f','#481b32','lava'),
 bomb('foudre','Bombe Foudre','rare',1200,'#f1bc32','#fffbc4','#856721','lightning'),
 bomb('moon','Bombe Lunaire','rare',1400,'#7277ab','#e9edff','#282b56','moon'),
 bomb('galaxy','Bombe Galaxie','epic',2000,'#7147ce','#f4acff','#231244','galaxy'),
 bomb('toxic','Bombe Toxique','epic',2100,'#3bb564','#deff6c','#1b452e','toxic'),
 bomb('gold','Bombe Or Royal','legendary',3500,'#d0a12c','#fff2aa','#79501c','royal'),
 bomb('supernova','Bombe Supernova','mythic',5500,'#d45289','#fff6c2','#3b286e','nova'),
];
export const COSMETICS=[...HERO_SKINS,...BOMB_SKINS];
export const RARITY_LABEL:Record<Rarity,string>={basic:'Basique',common:'Commun',rare:'Rare',epic:'Épique',legendary:'Légendaire',mythic:'Mythique'};
export const RARITY_COLOR:Record<Rarity,string>={basic:'#aab5c7',common:'#69df8d',rare:'#57b4ff',epic:'#c58bff',legendary:'#ffd164',mythic:'#ff7799'};
export const validHero=(id:unknown):string=>HERO_SKINS.some(s=>s.id===id)?String(id):'hero-default';
export const validBomb=(id:unknown):string=>BOMB_SKINS.some(s=>s.id===id)?String(id):'bomb-default';
export const heroTexture=(id:string)=>validHero(id)==='hero-default'?TEX.player:'skin-'+id;
export const heroAnim=(id:string,action:string)=>validHero(id)==='hero-default'?'player-'+action:id+'-'+action;
export const bombTexture=(id:string,type:BombType)=>validBomb(id)==='bomb-default'?TEX.bomb+'-'+type:'skin-'+id+'-'+type;
export const bombAnim=(id:string,type:BombType)=>validBomb(id)==='bomb-default'?'bomb-'+type:id+'-'+type;
function ellipse(c:CanvasRenderingContext2D,x:number,y:number,rx:number,ry:number,fill:string,stroke='#171b30',w=1.1){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();if(w){c.strokeStyle=stroke;c.lineWidth=w;c.stroke();}}
function poly(c:CanvasRenderingContext2D,pts:number[][],fill:string,stroke='#171b30',w=1){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(w){c.strokeStyle=stroke;c.lineWidth=w;c.stroke();}}
function box(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number,fill:string,stroke='#171b30'){roundRect(c,x,y,w,h,r);c.fillStyle=fill;c.fill();c.strokeStyle=stroke;c.lineWidth=1;c.stroke();}
function line(c:CanvasRenderingContext2D,pts:number[][],color:string,w=1){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=w;c.lineCap='round';c.lineJoin='round';c.stroke();}
function star(c:CanvasRenderingContext2D,x:number,y:number,r:number,col:string){poly(c,[[x,y-r],[x+r*.25,y-r*.25],[x+r,y],[x+r*.25,y+r*.25],[x,y+r],[x-r*.25,y+r*.25],[x-r,y],[x-r*.25,y-r*.25]],col,col,0);}
function glow(c:CanvasRenderingContext2D,x:number,y:number,r:number,col:string){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col+'77');g.addColorStop(1,col+'00');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
function grad(c:CanvasRenderingContext2D,s:Design,x:number,y:number,r:number){const g=c.createRadialGradient(x-r*.35,y-r*.6,1,x,y,r*1.5);g.addColorStop(0,s.light);g.addColorStop(.4,s.main);g.addColorStop(1,s.dark);return g;}
function heroFrame(c:CanvasRenderingContext2D,s:Design,f:number){
 const dir=f<4?0:f<8?1:f<12?2:0,walk=f<12,step=walk?Math.sin(f*Math.PI/2):0;
 const m=s.motif,animal=['bear','panda','rabbit','fox'].includes(m),royal=['king','magma','dragon','phoenix'].includes(m);
 c.save();c.clearRect(0,0,48,48);
 ellipse(c,24,44,13,3,'#10132777','',0);
 if(f===14){c.translate(24,36);c.rotate(Math.PI/2);c.translate(-24,-31);}else c.translate(0,f===13?-3:step*.8);
 if(['epic','legendary','mythic'].includes(s.rarity)){glow(c,24,23,24,s.main);for(let i=0;i<4;i++){const a=i*Math.PI/2+f*.23;star(c,24+Math.cos(a)*20,23+Math.sin(a)*18,1.8,s.light);}}
 if(m==='dragon'||m==='phoenix'){for(const sign of [-1,1]){poly(c,[[24+sign*5,25],[24+sign*18,9+step],[24+sign*21,25],[24+sign*15,20],[24+sign*17,34],[24+sign*8,31]],s.dark,s.light,1.1);line(c,[[24+sign*7,29],[24+sign*18,13+step],[24+sign*16,24]],s.main,1.4);}}
 if(['mage','spectre','king','magma','ninja'].includes(m))poly(c,[[14,23],[34,23],[38,41],[24,37],[10,41]],s.dark,s.main,1.2);
 for(const sign of [-1,1])box(c,17+sign*5+5,35+(sign*step*1.8),8,9,3,s.dark);
 box(c,14,24,20,15,6,s.main);box(c,10,26+step,7,10,3,s.main);box(c,31,26-step,7,10,3,s.main);
 if(dir===1){box(c,17,25,14,10,3,s.dark);line(c,[[20,29],[28,29]],s.light,2);}else{
 if(animal){ellipse(c,24,31,6.6,6,s.light,'',0);if(m==='bear'){poly(c,[[24,35],[19,30],[20,27],[24,29],[28,27],[29,30]],'#f4669a','',0);}else star(c,24,31,3,s.main);}
 else{box(c,17,26,14,9,3,s.dark);star(c,24,30,3,s.light);}
 }
 if(animal){
  if(m==='rabbit'){for(const x of [18,30]){ellipse(c,x,8,4,8,s.light);ellipse(c,x,8,1.8,5.4,'#e8a7c7','',0);}}
  else if(m==='fox'){poly(c,[[12,14],[13,3],[22,12]],s.main);poly(c,[[36,14],[35,3],[26,12]],s.main);poly(c,[[15,12],[15,7],[20,13]],s.light,'',0);poly(c,[[33,12],[33,7],[28,13]],s.light,'',0);}
  else for(const x of [14,34]){ellipse(c,x,10,5,5,m==='panda'?s.dark:s.main);ellipse(c,x,10,2.4,2.4,m==='panda'?'#9c91b0':s.light,'',0);}
  ellipse(c,24,18,12,10,m==='panda'?s.light:s.main);
  if(dir!==1){const eyes=dir===2?[28,33]:[19,29];for(const x of eyes){if(m==='panda')ellipse(c,x,17,3.8,4.3,s.dark,'',0);ellipse(c,x,17,1.8,2.6,'#161b32','',0);ellipse(c,x-.5,16,0.6,.8,'#fff','',0);}ellipse(c,dir===2?30:24,21,5,3,s.light,'',0);ellipse(c,dir===2?30:24,20,1.6,1.1,'#292438','',0);}
 }else if(m==='celestial'){
  ellipse(c,24,18,10,10,'#f7d0ac');
  poly(c,[[12,15],[8,7],[17,10],[15,1],[24,7],[29,0],[31,8],[40,4],[35,15],[29,12],[23,16],[19,12]],s.light,s.dark,1);
  if(dir!==1){line(c,[[17,17],[21,18],[22,16]],s.dark,1.4);line(c,[[26,16],[27,18],[31,17]],s.dark,1.4);line(c,[[22,23],[27,23]],s.dark,1);}
 }else{
  ellipse(c,24,17,12,11,m==='astro'?s.light:s.dark,s.light,1);
  if(m==='mage'){poly(c,[[9,14],[17,11],[22,1],[29,9],[39,14]],s.main,s.light);star(c,25,8,3,s.light);}
  if(m==='samurai'||royal){poly(c,[[11,12],[7,4],[19,9],[24,2],[29,9],[41,4],[37,12]],s.main,s.light,1.3);star(c,24,9,3,s.light);}
  if(m==='ice'){poly(c,[[12,12],[13,4],[19,9],[24,0],[29,9],[35,4],[36,12]],s.light,s.main);}
  if(m==='robot'||m==='pilot'){box(c,22,3,4,6,2,s.main);star(c,24,4,2,s.light);}
  if(m==='astro'){box(c,10,14,4,9,2,s.main);box(c,34,14,4,9,2,s.main);}
  if(m==='spectre'){poly(c,[[11,15],[15,4],[24,1],[33,4],[37,15],[31,12],[17,12]],s.main,s.light);}
  if(dir!==1){if(m==='ninja'){box(c,12,12,24,9,2,'#dab0a2');box(c,12,20,24,6,3,s.dark);line(c,[[16,16],[21,17],[22,15]],'#272138',1.8);line(c,[[26,15],[27,17],[32,16]],'#272138',1.8);}
  else {box(c,dir===2?23:14,12,dir===2?12:20,10,4,m==='astro'?'#172d55':s.main);line(c,[[dir===2?25:17,14],[32,14]],s.light,1.3);if(m!=='astro'){ellipse(c,dir===2?29:19,17,1.7,1.8,s.light,'',0);if(dir===0)ellipse(c,29,17,1.7,1.8,s.light,'',0);}}}
  else {box(c,18,12,12,9,3,s.main);line(c,[[20,15],[28,15]],s.light,1);}
 }
 if(f===12){c.globalCompositeOperation='source-atop';c.fillStyle='#ff394d55';c.fillRect(0,0,48,48);}
 c.restore();
}
function bombFrame(c:CanvasRenderingContext2D,s:Design,type:BombType,f:number){
 c.clearRect(0,0,48,48);c.save();const r=13+Math.sin(f*Math.PI/2)*.7,m=s.motif;
 ellipse(c,24,43,13,3,'#15152b66','',0);
 if(['epic','legendary','mythic'].includes(s.rarity)){glow(c,24,25,23,s.main);for(let i=0;i<4;i++){const a=i*Math.PI/2+f*.3;star(c,24+Math.cos(a)*19,25+Math.sin(a)*17,1.8,s.light);}}
 c.fillStyle=grad(c,s,24,27,r);c.beginPath();c.arc(24,27,r,0,Math.PI*2);c.fill();c.strokeStyle=s.dark;c.lineWidth=1.8;c.stroke();
 if(m==='crystal'){poly(c,[[24,12],[37,22],[33,36],[24,41],[13,33],[11,22]],s.main,s.light);poly(c,[[24,12],[28,24],[24,41],[18,26]],s.light,s.main);}
 if(m==='candy'){for(let i=0;i<3;i++)line(c,[[14+i*5,19],[29+i*3,34]],s.light,3);poly(c,[[12,23],[4,18],[5,30],[12,29]],s.main,s.light);poly(c,[[36,23],[44,18],[43,30],[36,29]],s.main,s.light);}
 if(m==='neon'||m==='nova'){c.strokeStyle=s.light;c.lineWidth=2;c.beginPath();c.ellipse(24,27,17,7,-.65,0,Math.PI*2);c.stroke();}
 if(m==='lava'||m==='lightning'){line(c,[[21,14],[18,24],[27,22],[20,33],[29,30],[27,39]],s.light,2.4);line(c,[[30,19],[26,23],[34,28]],s.light,1.4);}
 if(m==='moon'){ellipse(c,20,25,5,4,s.dark,s.light,.6);ellipse(c,29,31,3,3,s.dark,s.light,.6);star(c,29,20,3,s.light);}
 if(m==='galaxy'||m==='nova'){for(let i=0;i<6;i++)star(c,17+(i*7)%15,20+(i*5)%14,i%2?1.4:2.5,s.light);}
 if(m==='toxic'){ellipse(c,24,25,7,6,s.dark,s.light);ellipse(c,21,24,1.8,2,s.light,'',0);ellipse(c,27,24,1.8,2,s.light,'',0);line(c,[[21,30],[27,30]],s.light,2);}
 if(m==='royal'){poly(c,[[13,21],[14,14],[20,19],[24,11],[28,19],[34,14],[35,21]],s.light,s.dark);star(c,24,30,5,s.light);}
 if(type==='pierce')for(const [x,y] of [[10,27],[38,27],[24,41]])poly(c,[[x-3,y],[x,y-5],[x+3,y]],'#b8ffff',s.dark);
 if(type==='shift'){poly(c,[[5,27],[13,22],[13,32]],'#cbaaff',s.dark);poly(c,[[43,27],[35,22],[35,32]],'#cbaaff',s.dark);}
 if(type==='slow'){ellipse(c,24,27,7,7,'#19152b99','#ffe49a',1.5);line(c,[[24,22],[24,27],[28,29]],'#ffe49a',1.6);}
 box(c,20,10,8,5,2,s.dark);line(c,[[24,11],[24,6],[29,5]],'#ffd588',2);star(c,30,5,2.6+f*.5,'#fff4aa');
 c.restore();
}
export function drawCosmeticPreview(canvas:HTMLCanvasElement,id:string,frame=0){const c=canvas.getContext('2d');const s=COSMETICS.find(x=>x.id===id);if(!c||!s)return;c.setTransform(canvas.width/48,0,0,canvas.height/48,0,0);if(id.startsWith('hero-'))heroFrame(c,s,frame%4);else bombFrame(c,s,'classic',frame%4);}
export function buildCosmeticTextures(scene:Phaser.Scene){
 for(const s of HERO_SKINS){makeSheet(scene,heroTexture(s.id),TILE,TILE,15,(c,f)=>heroFrame(c,s,f));}
 for(const s of BOMB_SKINS)for(const type of ['classic','pierce','shift','slow'] as const)makeSheet(scene,bombTexture(s.id,type),TILE,TILE,4,(c,f)=>bombFrame(c,s,type,f));
}
export function registerCosmeticAnims(scene:Phaser.Scene){
 const add=(key:string,texture:string,frames:number[],frameRate:number,repeat=-1)=>{if(!scene.anims.exists(key))scene.anims.create({key,frames:frames.map(frame=>({key:texture,frame})),frameRate,repeat});};
 for(const s of HERO_SKINS){for(const [action,frames] of Object.entries({down:[0,1,2,3],up:[4,5,6,7],side:[8,9,10,11],hurt:[12],victory:[13],defeat:[14]}))add(heroAnim(s.id,action),heroTexture(s.id),frames,frames.length>1?10:1,frames.length>1?-1:0);}
 for(const s of BOMB_SKINS)for(const type of ['classic','pierce','shift','slow'] as const)add(bombAnim(s.id,type),bombTexture(s.id,type),[0,1,2,3],6);
}
