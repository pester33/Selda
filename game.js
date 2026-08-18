(function(){
"use strict";

const W = 960, H = 540, TILE = 40, ROWS = 13, YOFF = 10;
const GRAV = 0.62, MAXFALL = 13.5;
const GD_JUMP = -12.0, GD_SPIN = 0.163;

const cv  = document.getElementById('cv');
const ctx = cv.getContext('2d');

const SPRITE_DIR    = '';
const SPRITE_SIZE   = 34;
const SPRITE_PIXEL  = true;
const SPRITE_DEBUG  = false;

const SLASH_SIZE    = 62;
const DASH_SIZE     = 44;

const IMG = {
  player:{ file:'player.png' },
  slash: { file:'slash.png'  },
  dash:  { file:'dash.png'   }
};

for(const k in IMG){
  const a=IMG[k];
  a.ok=false;
  a.img=new Image();
  a.img.onload=function(){ a.w=a.img.width; a.h=a.img.height; a.ok=a.w>0&&a.h>0; };
  a.img.onerror=function(){ a.ok=false; };
  a.img.src=SPRITE_DIR+a.file;
}

function drawSpriteDebug(){
  if(!SPRITE_DEBUG) return;
  ctx.save();
  ctx.font='12px monospace'; ctx.textAlign='left';
  let yy=H-70;
  for(const k in IMG){
    const a=IMG[k];
    const line = a.ok ? (k+'.png  '+a.w+'x'+a.h) : (k+'.png  NOT LOADED');
    ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(8,yy-11,200,16);
    ctx.fillStyle=a.ok?'#8fd8e8':'#e0625a'; ctx.fillText(line,12,yy);
    yy+=18;
  }
  ctx.restore();
}

function drawCube(p,cx,cy){
  const s=SPRITE_SIZE;
  ctx.save();
  ctx.translate(cx,cy);
  ctx.rotate(p.rot);
  if(IMG.player.ok){
    ctx.imageSmoothingEnabled=!SPRITE_PIXEL;
    ctx.drawImage(IMG.player.img,-s/2,-s/2,s,s);
  } else {
    const h=s/2;
    ctx.fillStyle='#12161f'; ctx.fillRect(-h,-h,s,s);
    ctx.fillStyle='#eef3f8'; ctx.fillRect(-h+3,-h+3,s-6,s-6);
    ctx.fillStyle='#12161f'; ctx.fillRect(-h+7,-h+7,s-14,s-14);
    ctx.fillStyle='#8fd8e8';
    ctx.fillRect(-h+10,-h+12,4.5,6);
    ctx.fillRect(h-14.5,-h+12,4.5,6);
    ctx.fillStyle='#eef3f8'; ctx.fillRect(-h+11,h-13,s-22,3);
  }
  ctx.restore();
}

const LEVELS = [
{ n:"The Hollow Home", sub:"Where they were taken", tint:"#16202f", boss:null, map:[
"................................................",
"................................................",
"................................................",
"...............................====.............",
"......................====......................",
"......................h.........................",
".............====...............................",
"......................................w.........",
"...........w..........................=====.....",
"..P................^^..........^^.............D.",
"#########################..#####################",
"#########################..#####################",
"#########################..#####################"]},

{ n:"Ashen Path", sub:"The road out of the valley", tint:"#1b1a26", boss:null, map:[
"....................................................",
"....................................................",
"....................................................",
"..................====..............................",
"........................................====........",
"...........f.....................f..................",
".............................====...................",
"...............h....................................",
"......w...................w.........................",
"..P.....................^^................^^......D.",
"###############...###############...################",
"###############...###############...################",
"###############...###############...################"]},

{ n:"Weeping Gate", sub:"Stone that remembers rain", tint:"#101f26", boss:null, map:[
"........................................................",
"........................................................",
"..........................====..........................",
"...............====.....................................",
"........................................====............",
".....................f..........................f.......",
"........====....................====....................",
"..............................h.........................",
"......t...............t.....................t...........",
"..P.......w....................w......................D.",
"##########...########...#######...########...###########",
"##########...########...#######...########...###########",
"##########...########...#######...########...###########"]},

{ n:"MR COOL", sub:"He never takes them off", tint:"#101a2c", boss:"cool", map:[
"........................",
"........................",
"........................",
"........................",
"........................",
"...====..........====...",
"........................",
"........................",
"........................",
"..P...........B.........",
"########################",
"########################",
"########################"]},

{ n:"Frostbite Halls", sub:"Cold enough to hold a scream", tint:"#0e2430", boss:null, map:[
"........................................................",
"........................................................",
"...............====................====.................",
"........................................................",
".......====................====.................====....",
"....f.........f.......f................f........f.......",
"........................................................",
"...........h............................h...............",
"......w...........w..........w.................w........",
"..P.................^^..............^^................D.",
"############...#############...#############...#########",
"############...#############...#############...#########",
"############...#############...#############...#########"]},

{ n:"The Iron Descent", sub:"Down toward the keeper", tint:"#231a1c", boss:null, map:[
"............................................................",
"...................====.....................................",
"........====....................................====........",
"........................====................................",
"..............f.........................f...................",
"...................................====.....................",
"........t................t....................t.....t.......",
".........................h..................................",
".........w.............w.............w..............w.......",
"..P.................^.............^...............^^......D.",
"############...###########...############...################",
"############...###########...############...################",
"############...###########...############...################"]},

{ n:"THE WARDEN", sub:"He holds the key to their cage", tint:"#241a18", boss:"warden", map:[
"........................",
"........................",
"........................",
"........................",
"....====..........====..",
"........................",
"........................",
"..........====..........",
"........................",
"..P...........B.........",
"########################",
"########################",
"########################"]},

{ n:"Chains of Silence", sub:"Nothing here has a voice", tint:"#191826", boss:null, map:[
"............................................................",
"................====........................................",
"............................................====............",
".....====........................====.......................",
".........f...........f...........f...........f...........f..",
".....................====...................................",
"..........t...........t...........t...........t......====...",
"...........h.........................................h......",
"....w...........w............w...........w...........w......",
"..P................^...........^............^.............D.",
"############...#########...##########...#########...########",
"############...#########...##########...#########...########",
"############...#########...##########...#########...########"]},

{ n:"The Broken Sanctum", sub:"The last door before him", tint:"#22161f", boss:null, map:[
"............................................................",
"......====..................====....................====....",
"..................====...................====...............",
".................................====.......................",
".......f...........f............f.............f...........f.",
".............====.............................====..........",
"........t...........t............t.............t............",
".....................h.........................h............",
"...w...........w............w.............w...........w.....",
"..P..............^.............^............^.............D.",
"##########...##########...###########...##########...#######",
"##########...##########...###########...##########...#######",
"##########...##########...###########...##########...#######"]},

{ n:"THE AWAKENED WARDEN", sub:"The key opened him instead", tint:"#2a1212", boss:"awakened", map:[
"........................",
"........................",
"........................",
"........................",
"..====..............====",
"........................",
"........................",
"......====....====......",
"........................",
"..P...........B.........",
"########################",
"########################",
"########################"]}
];

const CLEAR_LINES = [
 "The house is empty. The road is not.",
 "Ash on the tongue. Keep walking.",
 "The gate wept and let her through.",
 "His glasses cracked. Under them: nothing but dark.",
 "The cold took her fingers, not her grip.",
 "Iron below. Something breathing in it.",
 "The chain fell. The key did not.",
 "Silence broke like thin ice.",
 "One door left, and it is already open.",
 ""
];

const keys = {};
const K = {
  left:['ArrowLeft','KeyA'], right:['ArrowRight','KeyD'],
  up:['ArrowUp','KeyW'], down:['ArrowDown','KeyS'],
  jump:['Space','ArrowUp','KeyW'], slash:['KeyJ','KeyZ'],
  dash:['KeyK','KeyX'], heal:['KeyL','KeyC']
};
function held(a){ for(const c of K[a]) if(keys[c]) return true; return false; }
const pressed = {};
function tapped(a){ for(const c of K[a]) if(pressed[c]) return true; return false; }

addEventListener('keydown', e=>{
  if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
  if(!keys[e.code]) pressed[e.code]=true;
  keys[e.code]=true;
  UI.key(e);
});
addEventListener('keyup', e=>{ keys[e.code]=false; });
function clearTaps(){ for(const k in pressed) delete pressed[k]; }

const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const rnd=(a,b)=>a+Math.random()*(b-a);
const hit=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;

const world = {
  map:[], w:0, h:ROWS*TILE, cols:0, camx:0, tint:"#16202f",
  gate:null, index:0, shake:0
};

function solidAt(cx,cy){
  if(cx<0||cx>=world.cols||cy<0) return true;
  if(cy>=ROWS) return false;
  const c = world.map[cy][cx];
  return c==='#';
}
function ledgeAt(cx,cy){
  if(cx<0||cx>=world.cols||cy<0||cy>=ROWS) return false;
  return world.map[cy][cx]==='=';
}
function spikeAt(cx,cy){
  if(cx<0||cx>=world.cols||cy<0||cy>=ROWS) return false;
  return world.map[cy][cx]==='^';
}

let player=null, enemies=[], shots=[], parts=[], waves=[], hazards=[], boss=null;
let pickups=[], gate=null;

function makePlayer(x,y,keepHp){
  const hp = keepHp!=null?keepHp:5;
  return {x:x,y:y,w:30,h:30,vx:0,vy:0,face:1,onGround:false,rot:0,spinDir:1,air:false,
    hp:hp,maxHp:5,soul:0,inv:0,atk:0,atkDir:'side',atkHitDone:false,
    dash:0,dashCd:0,heal:0,coyote:0,buf:0,anim:0,dropping:0,
    safeX:x,safeY:y,safeT:0,dead:false,recoil:0,lamp:0};
}

function moveEnt(e){
  e.hitWall=0;
  e.x += e.vx;
  let x0=Math.floor(e.x/TILE), x1=Math.floor((e.x+e.w-1)/TILE);
  let y0=Math.floor(e.y/TILE), y1=Math.floor((e.y+e.h-1)/TILE);
  for(let cy=y0;cy<=y1;cy++){
    if(e.vx>0 && solidAt(x1,cy)){ e.x=x1*TILE-e.w; e.vx=0; e.hitWall=1; break; }
    if(e.vx<0 && solidAt(x0,cy)){ e.x=(x0+1)*TILE; e.vx=0; e.hitWall=-1; break; }
  }
  const prevBottom = e.y+e.h;
  e.y += e.vy; e.onGround=false;
  x0=Math.floor(e.x/TILE); x1=Math.floor((e.x+e.w-1)/TILE);
  y0=Math.floor(e.y/TILE); y1=Math.floor((e.y+e.h-1)/TILE);
  for(let cx=x0;cx<=x1;cx++){
    if(e.vy>0 && solidAt(cx,y1)){ e.y=y1*TILE-e.h; e.vy=0; e.onGround=true; break; }
    if(e.vy<0 && solidAt(cx,y0)){ e.y=(y0+1)*TILE; e.vy=0.5; break; }
  }
  if(e.vy>0 && !e.dropping && !e.onGround){
    const ly=Math.floor((e.y+e.h)/TILE);
    for(let cx=x0;cx<=x1;cx++){
      if(ledgeAt(cx,ly) && prevBottom<=ly*TILE+4){ e.y=ly*TILE-e.h; e.vy=0; e.onGround=true; break; }
    }
  }
}

function burst(x,y,n,col,spd,size){
  for(let i=0;i<n;i++){
    const a=Math.random()*Math.PI*2, s=rnd(spd*0.3,spd);
    parts.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rnd(14,34),max:34,
      col:col,size:size||rnd(1.5,3.4),g:0.06});
  }
}

function makeEnemy(kind,x,y){
  if(kind==='w') return {kind:'w',x:x+5,y:y+14,w:30,h:26,vx:1.15,vy:0,hp:3,inv:0,anim:rnd(0,9)};
  if(kind==='f') return {kind:'f',x:x+7,y:y+7,w:26,h:26,vx:0,vy:0,hp:2,inv:0,anim:rnd(0,9),t:rnd(0,99),hx:x+7,hy:y+7};
  if(kind==='t') return {kind:'t',x:x+5,y:y+6,w:30,h:34,vx:0,vy:0,hp:4,inv:0,anim:0,cd:rnd(40,130)};
}

function updateEnemy(e){
  e.anim+=0.12;
  if(e.inv>0) e.inv--;
  if(e.kind==='w'){
    e.vy=Math.min(e.vy+GRAV,MAXFALL);
    const ahead=Math.floor((e.vx>0? e.x+e.w+2 : e.x-2)/TILE);
    const below=Math.floor((e.y+e.h+4)/TILE);
    moveEnt(e);
    if(e.hitWall) e.vx*=-1;
    else if(e.onGround && !solidAt(ahead,below) && !ledgeAt(ahead,below)) e.vx*=-1;
  }
  else if(e.kind==='f'){
    e.t+=0.05;
    const dx=(player.x+player.w/2)-(e.x+e.w/2), dy=(player.y+player.h/2)-(e.y+e.h/2);
    const d=Math.hypot(dx,dy)||1;
    if(d<340){ e.vx+=dx/d*0.09; e.vy+=dy/d*0.075; }
    else { e.vx+= (e.hx-e.x)*0.004; e.vy+=(e.hy-e.y)*0.004; }
    e.vx=clamp(e.vx,-2.3,2.3); e.vy=clamp(e.vy,-2.1,2.1);
    e.x+=e.vx; e.y+=e.vy+Math.sin(e.t)*0.5;
    const cx=Math.floor((e.x+e.w/2)/TILE), cy=Math.floor((e.y+e.h/2)/TILE);
    if(solidAt(cx,cy)){ e.vx*=-0.7; e.vy*=-0.7; e.x-=e.vx*3; e.y-=e.vy*3; }
  }
  else if(e.kind==='t'){
    e.cd--;
    const dx=(player.x+player.w/2)-(e.x+e.w/2), dy=(player.y+player.h/2)-(e.y+e.h/2);
    if(e.cd<=0 && Math.abs(dx)<430 && Math.abs(dy)<200){
      e.cd=125; const d=Math.hypot(dx,dy)||1;
      shots.push({x:e.x+e.w/2,y:e.y+10,vx:dx/d*3.2,vy:dy/d*3.2,r:7,life:210,kind:'spit'});
      burst(e.x+e.w/2,e.y+10,5,'#9adf7a',1.6,2);
    }
  }
}

const BOSSDEF = {
  cool:     {name:"MR COOL",             w:44,h:58, hp:44,  phase:0.5 },
  warden:   {name:"THE WARDEN",          w:62,h:76, hp:72,  phase:0.45},
  awakened: {name:"THE AWAKENED WARDEN", w:58,h:74, hp:104, phase:0.55}
};

function makeBoss(type,x,y){
  const d=BOSSDEF[type];
  return {type:type,name:d.name,x:x-d.w/2,y:y+TILE-d.h,w:d.w,h:d.h,
    vx:0,vy:0,hp:d.hp,max:d.hp,phaseAt:d.phase,phase:1,
    state:'wake',timer:80,face:-1,inv:0,anim:0,flash:0,dead:false,deathT:0,
    alpha:1,tele:0,combo:0,intro:1};
}

function bossFace(b){ b.face = (player.x+player.w/2) < (b.x+b.w/2) ? -1 : 1; }
function bossGoto(b,st,t){ b.state=st; b.timer=t; b.tele=0; }

function bossPick(b){
  const p2 = b.hp/b.max <= b.phaseAt;
  b.phase = p2?2:1;
  const r=Math.random();
  if(b.type==='cool'){
    if(r<0.4) bossGoto(b,'c_wind', p2?22:34);
    else if(r<0.72) bossGoto(b,'c_throw', p2?20:30);
    else bossGoto(b,'c_leap', 24);
  }
  else if(b.type==='warden'){
    if(r<0.36) bossGoto(b,'w_wind', p2?30:44);
    else if(r<0.72) bossGoto(b,'w_leap', p2?22:32);
    else bossGoto(b,'w_sweep', p2?24:34);
  }
  else {
    if(r<0.28) bossGoto(b,'a_tele', 26);
    else if(r<0.52) bossGoto(b,'a_ring', 30);
    else if(r<0.78) bossGoto(b,'a_rain', 34);
    else bossGoto(b,'a_wind', p2?18:26);
  }
}

function hazard(x,y,w,h,d){ hazards.push({x:x,y:y,w:w,h:h,dmg:d||1}); }

function updateBoss(b){
  b.anim+=0.1;
  if(b.inv>0) b.inv--;
  if(b.flash>0) b.flash--;
  if(b.dead){ b.deathT++; if(b.deathT%7===0){ burst(b.x+rnd(0,b.w),b.y+rnd(0,b.h),8,'#dfe8f2',3.4); world.shake=6; } return; }

  const gy = b.y+b.h;
  const pc = player.x+player.w/2;
  const bc = b.x+b.w/2;
  b.timer--;

  const airborne = ['c_leap','w_leap','a_tele'].includes(b.state);
  if(b.state!=='a_gone'){
    b.vy=Math.min(b.vy+GRAV,MAXFALL);
    moveEnt(b);
  }

  switch(b.state){
    case 'wake':
      b.vx*=0.8; if(b.timer<=0){ b.intro=0; bossGoto(b,'idle',40); }
      break;
    case 'idle':
      bossFace(b);
      b.vx += ((pc-bc) > 0 ? 1 : -1) * 0.16;
      b.vx = clamp(b.vx, -1.6, 1.6);
      if(!b.onGround) b.vx*=0.9;
      b.vx*=0.94;
      if(b.timer<=0) bossPick(b);
      break;

    case 'c_wind':
      bossFace(b); b.vx*=0.7; b.tele=1;
      if(b.timer<=0){ b.vx=b.face*(b.phase===2?13:10.5); bossGoto(b,'c_slide',70); }
      break;
    case 'c_slide':
      hazard(b.x,b.y,b.w,b.h,1);
      if(Math.random()<0.6) parts.push({x:b.x+b.w/2,y:gy-4,vx:-b.vx*0.2,vy:-rnd(0.4,1.6),life:20,max:20,col:'#8fd8e8',size:rnd(1,2.6),g:0.02});
      if(b.hitWall || b.timer<=0){
        world.shake=7; burst(b.x+b.w/2,gy-10,14,'#8fd8e8',4);
        b.vx=0; bossGoto(b,'c_rest', b.phase===2?26:40);
      }
      break;
    case 'c_rest': b.vx*=0.8; if(b.timer<=0) bossGoto(b,'idle',b.phase===2?14:26); break;
    case 'c_throw':
      bossFace(b); b.vx*=0.8; b.tele=1;
      if(b.timer<=0){
        const n=b.phase===2?5:3;
        for(let i=0;i<n;i++){
          const a=-0.85+i*(1.7/(n-1||1));
          shots.push({x:bc,y:b.y+16,vx:b.face*Math.cos(a)*5.4,vy:Math.sin(a)*4.6-1.4,r:9,life:190,kind:'shade',g:0.09});
        }
        burst(bc,b.y+16,10,'#bfe9f5',3);
        bossGoto(b,'idle', b.phase===2?24:40);
      }
      break;
    case 'c_leap':
      bossFace(b); b.tele=1;
      if(b.timer<=0){ b.vy=-12.5; b.vx=clamp((pc-bc)*0.055,-7,7); bossGoto(b,'c_fall',120); }
      break;
    case 'c_fall':
      hazard(b.x,b.y,b.w,b.h,1);
      if(b.vy>0) b.vy=Math.min(b.vy+0.85,19);
      if(b.onGround){
        world.shake=10; burst(bc,gy,20,'#cfe9f4',5);
        waves.push({x:bc,y:gy-22,vx:-6.5,w:26,h:22,life:110,col:'#bfe9f5'});
        waves.push({x:bc,y:gy-22,vx: 6.5,w:26,h:22,life:110,col:'#bfe9f5'});
        b.vx=0; bossGoto(b,'c_rest',34);
      }
      break;

    case 'w_wind':
      bossFace(b); b.vx*=0.7; b.tele=1;
      if(b.timer<=0){ b.vx=b.face*(b.phase===2?9:7); bossGoto(b,'w_charge',110); }
      break;
    case 'w_charge':
      hazard(b.x,b.y,b.w,b.h,1);
      if(b.onGround && Math.random()<0.7) parts.push({x:bc-b.face*20,y:gy-3,vx:-b.face*rnd(0.5,2),vy:-rnd(0.2,1.4),life:24,max:24,col:'#8a7a63',size:rnd(1.4,3),g:0.05});
      if(b.hitWall){ world.shake=13; burst(b.x+(b.hitWall>0?b.w:0),b.y+30,22,'#c9b78f',5);
        for(let i=0;i<3;i++) shots.push({x:b.x+(b.hitWall>0?b.w:0),y:20,vx:rnd(-1,1),vy:0,r:10,life:200,kind:'rock',g:0.4});
        b.vx=0; bossGoto(b,'w_stun',90); }
      else if(b.timer<=0){ b.vx=0; bossGoto(b,'w_rest',44); }
      break;
    case 'w_stun': b.vx*=0.8; if(b.timer<=0) bossGoto(b,'w_rest',18); break;
    case 'w_rest': b.vx*=0.85; if(b.timer<=0) bossGoto(b,'idle', b.phase===2?18:34); break;
    case 'w_leap':
      bossFace(b); b.vx*=0.75; b.tele=1;
      if(b.timer<=0){ b.vy=-13; b.vx=clamp((pc-bc)*0.05,-6,6); bossGoto(b,'w_fall',130); }
      break;
    case 'w_fall':
      hazard(b.x,b.y,b.w,b.h,1);
      if(b.vy>0) b.vy=Math.min(b.vy+1.05,21);
      if(b.onGround){
        world.shake=15; burst(bc,gy,26,'#c9b78f',5.5);
        const n=b.phase===2?3:2;
        for(let i=0;i<n;i++){
          waves.push({x:bc,y:gy-24,vx:-(5+i*1.6),w:30,h:24,life:120,col:'#e0c88f'});
          waves.push({x:bc,y:gy-24,vx: (5+i*1.6),w:30,h:24,life:120,col:'#e0c88f'});
        }
        for(let i=0;i<(b.phase===2?5:3);i++)
          shots.push({x:rnd(60,world.w-60),y:10,vx:0,vy:0,r:11,life:240,kind:'rock',g:0.34,warn:34});
        b.vx=0; bossGoto(b,'w_rest',40);
      }
      break;
    case 'w_sweep':
      bossFace(b); b.vx*=0.8; b.tele=1;
      if(b.timer<=0){ b.combo=0; bossGoto(b,'w_swing',56); }
      break;
    case 'w_swing': {
      const t=1-(b.timer/56);
      const a=(-Math.PI*0.85 + t*Math.PI*1.15)*(b.face>0?1:1);
      const rr=92;
      const hx=bc + b.face*Math.cos(a)*rr, hy=b.y+34 + Math.sin(a)*rr;
      b.chain={x:hx,y:hy};
      hazard(hx-17,hy-17,34,34,1);
      parts.push({x:hx,y:hy,vx:0,vy:0,life:12,max:12,col:'#e0c88f',size:3,g:0});
      b.vx*=0.85;
      if(b.timer<=0){ b.chain=null; bossGoto(b,'w_rest',30); }
      break; }

    case 'a_wind':
      bossFace(b); b.vx*=0.7; b.tele=1;
      if(b.timer<=0){ b.vx=b.face*13; bossGoto(b,'a_charge',60); }
      break;
    case 'a_charge':
      hazard(b.x,b.y,b.w,b.h,1);
      parts.push({x:bc,y:b.y+rnd(0,b.h),vx:-b.vx*0.15,vy:rnd(-0.6,0.6),life:18,max:18,col:'#e0625a',size:rnd(1.4,3.2),g:0});
      if(b.hitWall||b.timer<=0){
        world.shake=8; b.vx=0; b.combo++;
        if(b.combo<2 && b.phase===2) bossGoto(b,'a_wind',16); else bossGoto(b,'a_rest',30);
      }
      break;
    case 'a_rest': b.vx*=0.85; b.combo=0; if(b.timer<=0) bossGoto(b,'idle',b.phase===2?12:22); break;
    case 'a_tele':
      b.tele=1; b.alpha=Math.max(0,b.timer/26);
      if(b.timer<=0){
        b.x=clamp(pc + (Math.random()<0.5?-120:120) - b.w/2, TILE, world.w-TILE-b.w);
        b.y=player.y-14; b.vy=0; b.alpha=1; bossFace(b);
        burst(bc,b.y+b.h/2,18,'#e0625a',4.2);
        bossGoto(b,'a_slash',30);
      }
      break;
    case 'a_slash': {
      b.alpha=1; b.vx*=0.7;
      if(b.timer<20 && b.timer>6){
        const hx=bc + b.face*54;
        hazard(hx-40,b.y+4,80,b.h-6,1);
        parts.push({x:hx,y:b.y+rnd(4,b.h),vx:b.face*2,vy:0,life:10,max:10,col:'#ff9b8f',size:3,g:0});
      }
      if(b.timer<=0) bossGoto(b,'a_rest',22);
      break; }
    case 'a_ring':
      b.tele=1; b.vx*=0.8;
      if(b.timer<=0){
        const n=b.phase===2?10:7;
        for(let i=0;i<n;i++){
          const a=(i/n)*Math.PI*2;
          shots.push({x:bc,y:b.y+b.h/2,vx:Math.cos(a)*2.9,vy:Math.sin(a)*2.9,r:10,life:230,kind:'orb',g:0});
        }
        burst(bc,b.y+b.h/2,16,'#e0625a',4);
        bossGoto(b,'a_rest',34);
      }
      break;
    case 'a_rain':
      b.tele=1; b.vx*=0.85;
      if(b.timer<=0){
        const n=b.phase===2?9:6;
        for(let i=0;i<n;i++)
          shots.push({x:rnd(50,world.w-50),y:6,vx:0,vy:0,r:9,life:250,kind:'shard',g:0.36,warn:36});
        bossGoto(b,'a_rest',40);
      }
      break;
  }

  if(!['w_stun','wake','a_tele'].includes(b.state) && b.alpha>0.6) hazard(b.x+4,b.y+4,b.w-8,b.h-8,1);
  if(airborne){}
}

const OPT={ fpsCap:0, shake:true, sound:true, showFps:false, musicVol:2 };

const MUSIC_FILE='music.mp3';
const MUSIC_VOLS=[0,0.2,0.45,0.7,1.0];
const MUSIC_NAMES=['Off','Quiet','Normal','Loud','Full'];
let music=null, musicWanted=false, musicFade=null;

function musicInit(){
  if(music||typeof Audio==='undefined') return;
  try{
    music=new Audio(MUSIC_FILE);
    music.loop=true;
    music.volume=0;
    music.addEventListener('error',function(){ music=null; });
  }catch(e){ music=null; }
}
function musicTarget(){ return musicWanted ? MUSIC_VOLS[OPT.musicVol] : 0; }
function musicRamp(){
  if(!music) return;
  if(musicFade) clearInterval(musicFade);
  musicFade=setInterval(function(){
    if(!music){ clearInterval(musicFade); musicFade=null; return; }
    const t=musicTarget(), d=t-music.volume;
    if(Math.abs(d)<0.03){
      music.volume=t;
      if(t===0) music.pause();
      clearInterval(musicFade); musicFade=null; return;
    }
    music.volume=Math.max(0,Math.min(1,music.volume+(d>0?0.03:-0.03)));
  },30);
  if(musicTarget()>0 && music.paused){ const p=music.play(); if(p&&p.catch) p.catch(function(){}); }
}
function musicSet(on){ musicWanted=on; musicInit(); musicRamp(); }
let detectedHz=0, liveFps=0;

let AC=null;
function ac(){ if(!AC){ try{ AC=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } return AC; }
function blip(freq,dur,type,vol,slide){
  if(!OPT.sound) return;
  const a=ac(); if(!a) return;
  if(a.state==='suspended') a.resume();
  const o=a.createOscillator(), g=a.createGain();
  o.type=type||'square'; o.frequency.setValueAtTime(freq,a.currentTime);
  if(slide) o.frequency.exponentialRampToValueAtTime(Math.max(30,slide),a.currentTime+dur);
  g.gain.setValueAtTime((vol||0.08),a.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0008,a.currentTime+dur);
  o.connect(g); g.connect(a.destination); o.start(); o.stop(a.currentTime+dur+0.02);
}
function noise(dur,vol){
  if(!OPT.sound) return;
  const a=ac(); if(!a) return;
  const n=a.sampleRate*dur, buf=a.createBuffer(1,n,a.sampleRate), d=buf.getChannelData(0);
  for(let i=0;i<n;i++) d[i]=(Math.random()*2-1)*(1-i/n);
  const s=a.createBufferSource(), g=a.createGain();
  s.buffer=buf; g.gain.value=vol||0.07; s.connect(g); g.connect(a.destination); s.start();
}
const SFX={
  jump:()=>blip(430,0.10,'square',0.05,700),
  slash:()=>{noise(0.09,0.05);blip(760,0.07,'triangle',0.05,320);},
  hit:()=>{noise(0.07,0.09);blip(210,0.09,'square',0.06,90);},
  bhit:()=>{noise(0.09,0.11);blip(150,0.12,'sawtooth',0.06,60);},
  hurt:()=>{blip(320,0.28,'sawtooth',0.09,70);noise(0.16,0.09);},
  dash:()=>{noise(0.13,0.05);blip(300,0.12,'sine',0.04,900);},
  heal:()=>blip(520,0.30,'sine',0.07,880),
  pick:()=>{blip(720,0.14,'sine',0.06,1180);blip(980,0.20,'sine',0.04,1500);},
  gate:()=>{blip(300,0.4,'sine',0.06,760);},
  boss:()=>{blip(90,0.7,'sawtooth',0.09,50);noise(0.5,0.06);},
  die:()=>{blip(240,0.7,'sawtooth',0.09,50);noise(0.4,0.08);},
  ui:()=>blip(620,0.05,'triangle',0.035,760)
};

let state='title', unlocked=1, tagT=0, clearT=0, frame=0;
const $=id=>document.getElementById(id);

function screenOn(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('on'));
  if(id) $(id).classList.add('on');
  $('hud').classList.toggle('on', id===null);
}

function fadeOut(cb){
  $('fade').classList.add('on');
  setTimeout(()=>{ cb(); $('fade').classList.remove('on'); },470);
}

function loadLevel(i,keepHp){
  const L=LEVELS[i];
  world.map=L.map.map(r=>r.split(''));
  world.cols=L.map[0].length;
  world.w=world.cols*TILE;
  world.tint=L.tint; world.index=i; world.camx=0; world.shake=0;
  enemies=[];shots=[];parts=[];waves=[];hazards=[];pickups=[];boss=null;gate=null;
  let px=80,py=100;
  for(let y=0;y<ROWS;y++) for(let x=0;x<world.cols;x++){
    const c=world.map[y][x];
    if(c==='P'){ px=x*TILE+9; py=y*TILE+10; world.map[y][x]='.'; }
    else if(c==='D'){ gate={x:x*TILE+4,y:y*TILE-8,w:32,h:48}; world.map[y][x]='.'; }
    else if(c==='h'){ pickups.push({x:x*TILE+12,y:y*TILE+12,w:16,h:16,t:rnd(0,9)}); world.map[y][x]='.'; }
    else if(c==='w'||c==='f'||c==='t'){ enemies.push(makeEnemy(c,x*TILE,y*TILE)); world.map[y][x]='.'; }
    else if(c==='B'){ boss=makeBoss(L.boss,x*TILE+TILE/2,y*TILE); world.map[y][x]='.'; SFX.boss(); }
  }
  player=makePlayer(px,py,keepHp);
  world.camx=clamp(px-W/2,0,Math.max(0,world.w-W));
  tagT=170; clearT=0;
  $('lvltagA').textContent=L.n; $('lvltagB').textContent=L.sub;
  $('bossname').textContent=L.boss?BOSSDEF[L.boss].name:'';
  $('bossbar').classList.toggle('on', !!L.boss);
  state='play'; screenOn(null); drawHUD();
}

function hurtPlayer(dmg,srcX){
  const p=player;
  if(p.inv>0||p.dead||state!=='play') return;
  p.hp-=dmg; p.inv=78; p.recoil=15; p.heal=0; p.dash=0;
  p.vx=((srcX==null?p.x:srcX)<p.x+p.w/2?1:-1)*5.6; p.vy=-4.2;
  world.shake=10; burst(p.x+p.w/2,p.y+p.h/2,14,'#e8f2ff',3.6);
  SFX.hurt();
  if(p.hp<=0){ p.hp=0; p.dead=true; SFX.die(); setTimeout(die,700); }
}
function respawnSafe(){
  const p=player;
  p.x=p.safeX; p.y=p.safeY; p.vx=0; p.vy=0;
}
function die(){
  if(state!=='play') return;
  state='dead'; screenOn('scr-dead');
  $('deathLine').textContent = boss? "He is still standing. So are you." : "But it is not the last light.";
  buildMenu('deadmenu',[['Try Again',()=>fadeOut(()=>loadLevel(world.index))],
                        ['Back to Title',()=>fadeOut(toTitle)]]);
}

function updatePlayer(){
  const p=player;
  p.anim+=0.15; p.lamp+=0.06;
  if(p.inv>0)p.inv--;
  if(p.dashCd>0)p.dashCd--;
  if(p.recoil>0)p.recoil--;
  if(p.dropping>0)p.dropping--;
  if(p.dead){ p.vy=Math.min(p.vy+GRAV,MAXFALL); p.vx*=0.9; moveEnt(p); return; }

  const wantHeal = held('heal') && p.onGround && p.soul>=34 && p.hp<p.maxHp && p.atk<=0 && p.dash<=0 && p.recoil<=0;
  if(wantHeal){
    p.heal++;
    if(p.heal%3===0) parts.push({x:p.x+p.w/2+rnd(-14,14),y:p.y+p.h,vx:0,vy:-rnd(0.6,1.8),life:26,max:26,col:'#bfe9f5',size:rnd(1.2,2.6),g:-0.01});
    if(p.heal>=46){ p.hp++; p.soul-=34; p.heal=0; burst(p.x+p.w/2,p.y+p.h/2,18,'#dff3fb',3); SFX.heal(); }
  } else p.heal=0;

  if(tapped('dash') && p.dashCd<=0 && p.heal===0 && p.recoil<=0){
    p.dash=11; p.dashCd=42; SFX.dash();
    burst(p.x+p.w/2,p.y+p.h/2,9,'#cfe6f2',2.4);
  }

  if(p.dash>0){
    p.dash--; p.vy=0; p.vx=p.face*10.4;
    if(p.dash%2===0) parts.push({x:p.x+p.w/2,y:p.y+p.h/2,vx:0,vy:0,life:15,max:15,col:'#9fc9dd',size:5,g:0});
    if(p.dash===0) p.vx*=0.3;
  } else {
    const L=held('left'), R=held('right');
    if(p.heal===0 && p.recoil<=0){
      if(L&&!R){ p.vx-=0.98; p.face=-1; }
      else if(R&&!L){ p.vx+=0.98; p.face=1; }
      else p.vx*=0.70;
    } else p.vx*=0.86;
    p.vx=clamp(p.vx,-4.3,4.3);
    p.vy=Math.min(p.vy+GRAV,MAXFALL);
  }

  if(held('jump')) p.buf=9;
  if(p.buf>0)p.buf--;
  if(p.onGround)p.coyote=8; else if(p.coyote>0)p.coyote--;
  if(p.buf>0 && p.coyote>0 && p.heal===0 && p.dash<=0){
    const onLedge = ledgeAt(Math.floor((p.x+p.w/2)/TILE), Math.floor((p.y+p.h+2)/TILE));
    if(held('down') && onLedge){ p.dropping=8; p.y+=3; }
    else {
      p.vy=GD_JUMP; p.air=true;
      p.spinDir = Math.abs(p.vx)>0.3 ? (p.vx>0?1:-1) : p.face;
      SFX.jump(); burst(p.x+p.w/2,p.y+p.h,5,'#8fa8bb',1.6,2);
    }
    p.buf=0; p.coyote=0;
  }

  if(tapped('slash') && p.atk<=0 && p.heal===0){
    p.atk=15; p.atkHitDone=false;
    p.atkDir = held('up') ? 'up' : (held('down') && !p.onGround) ? 'down' : 'side';
    SFX.slash();
  }
  if(p.atk>0) p.atk--;

  moveEnt(p);

  if(p.onGround){
    if(p.air){ p.rot=Math.round(p.rot/(Math.PI/2))*(Math.PI/2); p.air=false; }
  } else {
    p.air=true;
    p.rot += p.spinDir*GD_SPIN;
  }
  if(p.rot>6.283||p.rot<-6.283) p.rot%=6.283;

  const x0=Math.floor(p.x/TILE), x1=Math.floor((p.x+p.w-1)/TILE);
  const y0=Math.floor(p.y/TILE), y1=Math.floor((p.y+p.h-1)/TILE);
  let onSpike=false;
  for(let cy=y0;cy<=y1;cy++) for(let cx=x0;cx<=x1;cx++) if(spikeAt(cx,cy)) onSpike=true;
  if(onSpike && p.inv<=0){ hurtPlayer(1,null); respawnSafe(); }

  if(p.y>world.h+90){ if(p.inv<=0) hurtPlayer(1,null); respawnSafe(); }

  if(p.onGround && !onSpike && p.inv<=0){
    let clean=true;
    for(let cx=x0-1;cx<=x1+1;cx++) if(spikeAt(cx,y1)||spikeAt(cx,y1+1)) clean=false;
    if(clean){ p.safeX=p.x; p.safeY=p.y-2; }
  }
}

function attackBox(){
  const p=player;
  if(p.atk<=0 || p.atk>12) return null;
  if(p.atkDir==='up')   return {x:p.x-9, y:p.y-52, w:p.w+18, h:56};
  if(p.atkDir==='down') return {x:p.x-9, y:p.y+p.h-4, w:p.w+18, h:56};
  return {x: p.face>0? p.x+p.w-6 : p.x-58, y:p.y-2, w:64, h:32};
}

function gainSoul(n){ player.soul=Math.min(99,player.soul+n); }

function combat(){
  const p=player, box=attackBox();

  if(box){
    let landed=false;
    for(const e of enemies){
      if(e.hp<=0||e.inv>0) continue;
      if(hit(box,e)){
        e.hp--; e.inv=10; landed=true;
        burst(e.x+e.w/2,e.y+e.h/2,9,'#f3f7ff',3.2);
        if(e.hp<=0){ burst(e.x+e.w/2,e.y+e.h/2,20,'#cdd8e6',4.4); gainSoul(8); }
      }
    }
    if(boss && !boss.dead && boss.inv<=0 && boss.alpha>0.5 && hit(box,boss)){
      boss.hp--; boss.inv=9; boss.flash=8; landed=true;
      burst(boss.x+boss.w/2,boss.y+boss.h/2,7,'#ffe9e4',3);
      SFX.bhit();
      if(boss.hp<=0){ boss.dead=true; boss.hp=0; world.shake=18; }
    }
    for(let i=shots.length-1;i>=0;i--){
      const s=shots[i];
      if(s.warn>0) continue;
      if(hit(box,{x:s.x-s.r,y:s.y-s.r,w:s.r*2,h:s.r*2})){
        shots.splice(i,1); landed=true; burst(s.x,s.y,8,'#e9f4ff',3);
      }
    }
    if(landed && !p.atkHitDone){
      p.atkHitDone=true; gainSoul(11); world.shake=Math.max(world.shake,5); SFX.hit();
      if(p.atkDir==='down'){ p.vy=-9.6; p.dropping=6; }
      else if(p.atkDir==='side') p.vx=-p.face*3.4;
      else p.vy=Math.min(p.vy+2.6,4);
    }
  }

  for(const e of enemies) if(e.hp>0 && hit(p,e)) hurtPlayer(1,e.x+e.w/2);
  for(const h of hazards) if(hit(p,h)) hurtPlayer(h.dmg,h.x+h.w/2);
  for(const wv of waves) if(hit(p,{x:wv.x-wv.w/2,y:wv.y,w:wv.w,h:wv.h})) hurtPlayer(1,wv.x);
  for(let i=shots.length-1;i>=0;i--){
    const s=shots[i];
    if(s.warn>0) continue;
    if(hit(p,{x:s.x-s.r,y:s.y-s.r,w:s.r*2,h:s.r*2})){
      hurtPlayer(1,s.x); shots.splice(i,1); burst(s.x,s.y,10,'#ffd9d2',3);
    }
  }

  for(let i=pickups.length-1;i>=0;i--){
    const k=pickups[i];
    if(hit(p,k)){
      pickups.splice(i,1);
      if(p.hp<p.maxHp) p.hp++; else gainSoul(30);
      burst(k.x+8,k.y+8,22,'#ffeeb8',3.6); SFX.pick();
    }
  }

  if(gate && hit(p,gate)) finishLevel();

  if(boss && boss.dead && boss.deathT>96) finishLevel();
}

function finishLevel(){
  if(state!=='play') return;
  state='clear'; SFX.gate();
  unlocked=Math.max(unlocked, world.index+2);
  if(world.index>=LEVELS.length-1){ showEnding(); return; }
  screenOn('scr-clear');
  $('clearHead').textContent = LEVELS[world.index].boss ? 'Boss Felled' : 'Path Cleared';
  $('clearLine').textContent = CLEAR_LINES[world.index];
}

const motes=[];
for(let i=0;i<80;i++) motes.push({x:Math.random()*W,y:Math.random()*H,s:rnd(0.4,1.6),r:rnd(0.6,2.6),o:rnd(0.06,0.5),d:rnd(0,6)});

function srnd(i){ const x=Math.sin(i*127.1+(world.index+1)*311.7)*43758.5453; return x-Math.floor(x); }

function mixHex(hex,other,t){
  const a=parseInt(hex.slice(1),16), b=parseInt(other.slice(1),16);
  const r=Math.round((((a>>16)&255)*(1-t))+(((b>>16)&255)*t));
  const g=Math.round((((a>>8)&255)*(1-t))+(((b>>8)&255)*t));
  const c=Math.round(((a&255)*(1-t))+((b&255)*t));
  return 'rgb('+r+','+g+','+c+')';
}

function shade(hex,amt){
  const n=parseInt(hex.slice(1),16);
  let r=(n>>16)&255,g=(n>>8)&255,b=n&255;
  r=clamp(Math.round(r*amt),0,255); g=clamp(Math.round(g*amt),0,255); b=clamp(Math.round(b*amt),0,255);
  return 'rgb('+r+','+g+','+b+')';
}

function drawBG(){
  const g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0, shade(world.tint,0.55));
  g.addColorStop(0.45, shade(world.tint,1.30));
  g.addColorStop(1, shade(world.tint,0.60));
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);

  const px=(player?player.x+player.w/2-world.camx:W/2), py=(player?player.y+YOFF:H/2);
  const rg=ctx.createRadialGradient(px,py,10,px,py,320);
  rg.addColorStop(0,'rgba(150,205,235,0.10)');
  rg.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=rg; ctx.fillRect(0,0,W,H);

  for(let layer=0;layer<2;layer++){
    const par=layer===0?0.14:0.32, base=layer===0?0.72:1.05;
    ctx.fillStyle=shade(world.tint, base);
    for(let i=0;i<34;i++){
      const bx=i*230+srnd(i+layer*50)*120;
      let x=bx-world.camx*par; x=((x%3600)+3600)%3600-400;
      if(x>W+200||x<-260) continue;
      const w=52+srnd(i+7+layer*9)*70, h=200+srnd(i+13+layer*3)*280;
      ctx.fillRect(x,H-h,w,h);
      ctx.beginPath(); ctx.moveTo(x-9,H-h); ctx.lineTo(x+w/2,H-h-34); ctx.lineTo(x+w+9,H-h); ctx.closePath(); ctx.fill();
    }
  }

  const fg=ctx.createLinearGradient(0,H*0.55,0,H);
  fg.addColorStop(0,'rgba(0,0,0,0)'); fg.addColorStop(1,shade(world.tint,0.75));
  ctx.fillStyle=fg; ctx.fillRect(0,H*0.55,W,H*0.45);
}

function drawMotes(){
  for(const m of motes){
    m.y-=m.s*0.32; m.x+=Math.sin((frame*0.01)+m.d)*0.25;
    if(m.y<-6){ m.y=H+6; m.x=Math.random()*W; }
    ctx.globalAlpha=m.o*(0.55+0.45*Math.sin(frame*0.03+m.d));
    ctx.fillStyle='#dbe8f2';
    ctx.beginPath(); ctx.arc(m.x,m.y,m.r,0,6.283); ctx.fill();
  }
  ctx.globalAlpha=1;
}

function drawTiles(){
  const c0=Math.max(0,Math.floor(world.camx/TILE)-1);
  const c1=Math.min(world.cols-1,Math.ceil((world.camx+W)/TILE));
  const rock=mixHex(world.tint,'#8496ae',0.40), edge=mixHex(world.tint,'#e2edf7',0.72), deep=mixHex(world.tint,'#000000',0.42);
  for(let y=0;y<ROWS;y++) for(let x=c0;x<=c1;x++){
    const c=world.map[y][x]; if(c==='.') continue;
    const px=x*TILE-world.camx, py=y*TILE+YOFF;
    if(c==='#'){
      ctx.fillStyle=rock; ctx.fillRect(px,py,TILE,TILE);
      ctx.fillStyle=deep;
      const n=srnd(x*31+y*17);
      ctx.fillRect(px+4+n*20,py+8+n*14,7+n*9,5+n*7);
      if(!solidAt(x,y-1)){
        ctx.fillStyle=edge; ctx.fillRect(px,py,TILE,3);
        ctx.globalAlpha=0.35; ctx.fillRect(px,py+3,TILE,2); ctx.globalAlpha=1;
      }
      ctx.strokeStyle='rgba(0,0,0,0.22)'; ctx.lineWidth=1;
      ctx.strokeRect(px+0.5,py+0.5,TILE-1,TILE-1);
    }
    else if(c==='='){
      ctx.fillStyle=mixHex(world.tint,'#9fb0c6',0.52); ctx.fillRect(px,py,TILE,9);
      ctx.fillStyle=edge; ctx.fillRect(px,py,TILE,2.5);
      ctx.fillStyle='rgba(0,0,0,0.35)'; ctx.fillRect(px,py+9,TILE,3);
    }
    else if(c==='^'){
      ctx.fillStyle='#9fb0c2';
      for(let i=0;i<4;i++){
        const sx=px+i*10;
        ctx.beginPath(); ctx.moveTo(sx,py+TILE); ctx.lineTo(sx+5,py+13); ctx.lineTo(sx+10,py+TILE); ctx.closePath(); ctx.fill();
      }
      ctx.fillStyle='rgba(255,255,255,0.28)';
      for(let i=0;i<4;i++){ const sx=px+i*10; ctx.fillRect(sx+4,py+15,1.6,TILE-15); }
    }
  }
}

function drawGate(){
  if(!gate) return;
  const open = true;
  const x=gate.x-world.camx, y=gate.y+YOFF;
  ctx.save();
  if(open){
    const pulse=0.55+0.45*Math.sin(frame*0.05);
    const rg=ctx.createRadialGradient(x+16,y+24,2,x+16,y+24,70);
    rg.addColorStop(0,'rgba(190,235,250,'+(0.5*pulse)+')');
    rg.addColorStop(1,'rgba(190,235,250,0)');
    ctx.fillStyle=rg; ctx.fillRect(x-60,y-46,150,150);
  }
  ctx.fillStyle= open? 'rgba(215,240,252,0.90)' : 'rgba(120,132,148,0.55)';
  ctx.beginPath();
  ctx.moveTo(x,y+gate.h); ctx.lineTo(x,y+18);
  ctx.quadraticCurveTo(x+16,y-12,x+gate.w,y+18);
  ctx.lineTo(x+gate.w,y+gate.h); ctx.closePath(); ctx.fill();
  ctx.fillStyle='rgba(10,14,20,0.85)';
  ctx.beginPath();
  ctx.moveTo(x+6,y+gate.h); ctx.lineTo(x+6,y+22);
  ctx.quadraticCurveTo(x+16,y-2,x+gate.w-6,y+22);
  ctx.lineTo(x+gate.w-6,y+gate.h); ctx.closePath(); ctx.fill();
  if(!open){
    ctx.strokeStyle='rgba(200,215,230,0.5)'; ctx.lineWidth=2;
    for(let i=0;i<3;i++){ ctx.beginPath(); ctx.moveTo(x+2,y+20+i*10); ctx.lineTo(x+gate.w-2,y+16+i*10); ctx.stroke(); }
  }
  ctx.restore();
}

function drawPickups(){
  for(const k of pickups){
    k.t+=0.05;
    const x=k.x+8-world.camx, y=k.y+8+YOFF+Math.sin(k.t)*4;
    const rg=ctx.createRadialGradient(x,y,1,x,y,34);
    rg.addColorStop(0,'rgba(255,240,190,0.75)'); rg.addColorStop(1,'rgba(255,220,150,0)');
    ctx.fillStyle=rg; ctx.fillRect(x-36,y-36,72,72);
    ctx.fillStyle='#fff3d0';
    ctx.beginPath(); ctx.arc(x,y,4.5,0,6.283); ctx.fill();
  }
}

function drawEnemy(e){
  const x=e.x-world.camx, y=e.y+YOFF, f=e.inv>0;
  ctx.save();
  if(f){ ctx.globalCompositeOperation='lighter'; }
  if(e.kind==='w'){
    const bob=Math.sin(e.anim)*2;
    ctx.fillStyle=f?'#ffffff':'#2b3444';
    ctx.beginPath(); ctx.ellipse(x+15,y+15+bob*0.3,15,12,0,0,6.283); ctx.fill();
    ctx.fillStyle=f?'#ffffff':'#141b26';
    for(let i=0;i<3;i++){ ctx.fillRect(x+5+i*9, y+24, 3.4, 8+Math.sin(e.anim+i)*2.5); }
    ctx.fillStyle=f?'#fff':'#cfe0ee';
    ctx.beginPath(); ctx.ellipse(x+(e.vx>0?21:9),y+12+bob*0.3,4.6,5.4,0,0,6.283); ctx.fill();
    ctx.fillStyle='#101720';
    ctx.beginPath(); ctx.ellipse(x+(e.vx>0?22:8),y+12+bob*0.3,1.7,2.4,0,0,6.283); ctx.fill();
  }
  else if(e.kind==='f'){
    const s=Math.sin(e.anim*2);
    ctx.fillStyle=f?'#fff':'rgba(160,215,235,0.20)';
    ctx.beginPath(); ctx.arc(x+13,y+13,16+s*2,0,6.283); ctx.fill();
    ctx.fillStyle=f?'#fff':'#dff0f8';
    ctx.beginPath(); ctx.arc(x+13,y+13,6.5,0,6.283); ctx.fill();
    ctx.strokeStyle=f?'#fff':'rgba(200,235,248,0.75)'; ctx.lineWidth=2;
    for(let i=0;i<4;i++){
      const a=e.anim*0.6+i*1.57;
      ctx.beginPath(); ctx.moveTo(x+13,y+13);
      ctx.quadraticCurveTo(x+13+Math.cos(a)*16,y+13+Math.sin(a)*16, x+13+Math.cos(a)*24,y+13+Math.sin(a)*24+6);
      ctx.stroke();
    }
  }
  else {
    ctx.fillStyle=f?'#fff':'#28362c';
    ctx.beginPath(); ctx.moveTo(x,y+34); ctx.lineTo(x+4,y+8);
    ctx.quadraticCurveTo(x+15,y-2,x+26,y+8); ctx.lineTo(x+30,y+34); ctx.closePath(); ctx.fill();
    const glow=e.cd<30?1:0.4;
    ctx.fillStyle=f?'#fff':'rgba(154,223,122,'+glow+')';
    ctx.beginPath(); ctx.arc(x+15,y+12,6+(e.cd<30?2:0),0,6.283); ctx.fill();
    ctx.fillStyle='rgba(0,0,0,0.5)';
    ctx.fillRect(x+6,y+22,18,3);
  }
  ctx.restore();
}

function drawBoss(b){
  const x=b.x-world.camx, y=b.y+YOFF, cx=x+b.w/2, cy=y+b.h/2;
  ctx.save();
  ctx.globalAlpha=b.alpha*(b.dead? Math.max(0,1-b.deathT/110):1);
  const flash=b.flash>0;
  const tel=b.tele && (frame%8<5);

  if(b.type==='cool'){
    const bodyC = flash?'#ffffff':'#1b2433';
    ctx.fillStyle='rgba(120,200,230,0.18)';
    ctx.beginPath(); ctx.ellipse(cx,cy,b.w*0.9,b.h*0.72,0,0,6.283); ctx.fill();

    ctx.strokeStyle=flash?'#fff':'#8fd8e8'; ctx.lineWidth=5; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(cx,y+22);
    ctx.quadraticCurveTo(cx-b.face*30,y+30+Math.sin(b.anim)*6, cx-b.face*54,y+16+Math.cos(b.anim*1.3)*10);
    ctx.stroke();

    ctx.fillStyle=bodyC;
    ctx.beginPath();
    ctx.moveTo(cx-20,y+b.h); ctx.lineTo(cx-13,y+22);
    ctx.quadraticCurveTo(cx,y+2,cx+13,y+22);
    ctx.lineTo(cx+20,y+b.h); ctx.closePath(); ctx.fill();

    ctx.fillStyle=flash?'#fff':'#e7eef6';
    ctx.beginPath(); ctx.ellipse(cx,y+16,14,15,0,0,6.283); ctx.fill();

    ctx.fillStyle='#0a0e15';
    ctx.beginPath(); ctx.moveTo(cx-14,y+13); ctx.lineTo(cx+14,y+11); ctx.lineTo(cx+13,y+21); ctx.lineTo(cx-13,y+22); ctx.closePath(); ctx.fill();
    ctx.fillStyle= tel? '#ffffff':'rgba(143,216,232,0.85)';
    ctx.fillRect(cx-11,y+14,9,4); ctx.fillRect(cx+2,y+13,9,4);

    ctx.strokeStyle=flash?'#fff':'#8fd8e8'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(cx-14,y+28); ctx.lineTo(cx,y+38); ctx.lineTo(cx+14,y+28); ctx.stroke();
  }
  else {
    const awake = b.type==='awakened';
    const core = awake? '#e0625a' : '#e0c88f';
    ctx.fillStyle=flash?'#fff':(awake?'#241119':'#2c2a2c');

    ctx.fillRect(cx-24,y+b.h-26,17,26); ctx.fillRect(cx+7,y+b.h-26,17,26);

    ctx.beginPath();
    ctx.moveTo(cx-28,y+b.h-22); ctx.lineTo(cx-24,y+20);
    ctx.quadraticCurveTo(cx,y+6,cx+24,y+20);
    ctx.lineTo(cx+28,y+b.h-22); ctx.closePath(); ctx.fill();

    ctx.fillStyle=flash?'#fff':(awake?'#3a1a20':'#3b3a3c');
    ctx.beginPath(); ctx.ellipse(cx-26,y+24,13,10,-0.4,0,6.283); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx+26,y+24,13,10,0.4,0,6.283); ctx.fill();

    ctx.fillStyle=flash?'#fff':(awake?'#2e1319':'#38373a');
    ctx.beginPath(); ctx.ellipse(cx,y+14,16,14,0,0,6.283); ctx.fill();

    ctx.fillStyle= tel? '#ffffff' : core;
    if(awake){
      ctx.beginPath(); ctx.ellipse(cx-6,y+14,3.6,5.4,0,0,6.283); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx+6,y+14,3.6,5.4,0,0,6.283); ctx.fill();

      ctx.strokeStyle='rgba(224,98,90,'+(0.55+0.45*Math.sin(frame*0.08))+')'; ctx.lineWidth=2.2;
      ctx.beginPath(); ctx.moveTo(cx-18,y+30); ctx.lineTo(cx-6,y+42); ctx.lineTo(cx-12,y+56); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx+20,y+34); ctx.lineTo(cx+8,y+46); ctx.lineTo(cx+16,y+60); ctx.stroke();
    } else {
      for(let i=0;i<3;i++) ctx.fillRect(cx-9+i*7,y+11,3.2,8);
    }

    const kg=0.5+0.5*Math.sin(frame*0.06);
    ctx.fillStyle= awake? 'rgba(224,98,90,'+(0.65+0.35*kg)+')' : 'rgba(224,200,143,'+(0.5+0.5*kg)+')';
    ctx.beginPath(); ctx.arc(cx,y+38,6.5,0,6.283); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx-5,y+40); ctx.lineTo(cx+5,y+40); ctx.lineTo(cx+2.5,y+54); ctx.lineTo(cx-2.5,y+54); ctx.closePath(); ctx.fill();

    if(b.chain){
      const hx=b.chain.x-world.camx, hy=b.chain.y+YOFF;
      ctx.strokeStyle='#8d8579'; ctx.lineWidth=3;
      ctx.beginPath(); ctx.moveTo(cx,y+30); ctx.lineTo(hx,hy); ctx.stroke();
      ctx.fillStyle='#6f6a62'; ctx.beginPath(); ctx.arc(hx,hy,15,0,6.283); ctx.fill();
      ctx.fillStyle='rgba(224,200,143,0.6)'; ctx.beginPath(); ctx.arc(hx,hy,7,0,6.283); ctx.fill();
    }
    if(b.state==='w_stun'){
      ctx.strokeStyle='rgba(255,255,255,0.7)'; ctx.lineWidth=2;
      for(let i=0;i<3;i++){
        const a=frame*0.12+i*2.1;
        ctx.beginPath(); ctx.arc(cx+Math.cos(a)*22,y-6+Math.sin(a)*6,3,0,6.283); ctx.stroke();
      }
    }
  }
  ctx.restore();
}

function drawShots(){
  for(const s of shots){
    const x=s.x-world.camx, y=s.y+YOFF;
    if(s.warn>0){
      ctx.globalAlpha=0.35+0.4*Math.sin(frame*0.4);
      ctx.strokeStyle= s.kind==='shard'?'#e0625a':'#e0c88f'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(x-11,H-4); ctx.lineTo(x,H-24); ctx.lineTo(x+11,H-4); ctx.stroke();
      ctx.globalAlpha=1; continue;
    }
    let col='#9adf7a';
    if(s.kind==='shade') col='#bfe9f5';
    else if(s.kind==='rock') col='#c9b78f';
    else if(s.kind==='orb'||s.kind==='shard') col='#e0625a';
    const rg=ctx.createRadialGradient(x,y,1,x,y,s.r*3);
    rg.addColorStop(0,col); rg.addColorStop(1,'rgba(0,0,0,0)');
    ctx.globalAlpha=0.55; ctx.fillStyle=rg; ctx.fillRect(x-s.r*3,y-s.r*3,s.r*6,s.r*6); ctx.globalAlpha=1;
    ctx.fillStyle=col;
    if(s.kind==='shard'){
      ctx.beginPath(); ctx.moveTo(x,y-s.r*1.6); ctx.lineTo(x+s.r*0.8,y); ctx.lineTo(x,y+s.r*1.6); ctx.lineTo(x-s.r*0.8,y); ctx.closePath(); ctx.fill();
    } else {
      ctx.beginPath(); ctx.arc(x,y,s.r,0,6.283); ctx.fill();
    }
    ctx.fillStyle='rgba(255,255,255,0.85)';
    ctx.beginPath(); ctx.arc(x-s.r*0.3,y-s.r*0.3,s.r*0.35,0,6.283); ctx.fill();
  }
}

function drawWaves(){
  for(const wv of waves){
    const x=wv.x-world.camx, y=wv.y+YOFF, a=clamp(wv.life/110,0,1);
    ctx.globalAlpha=a;
    ctx.fillStyle=wv.col;
    ctx.beginPath();
    ctx.moveTo(x-wv.w/2,y+wv.h);
    ctx.quadraticCurveTo(x,y-8,x+wv.w/2,y+wv.h);
    ctx.closePath(); ctx.fill();
    ctx.globalAlpha=a*0.4;
    ctx.fillRect(x-wv.w/2,y+wv.h-3,wv.w,4);
    ctx.globalAlpha=1;
  }
}

function drawParts(){
  for(const p of parts){
    const a=clamp(p.life/p.max,0,1);
    ctx.globalAlpha=a;
    ctx.fillStyle=p.col;
    ctx.beginPath(); ctx.arc(p.x-world.camx,p.y+YOFF,p.size*a+0.4,0,6.283); ctx.fill();
  }
  ctx.globalAlpha=1;
}

function drawPlayer(){
  const p=player;
  if(p.inv>0 && frame%6<3 && !p.dead) return;
  const x=p.x-world.camx, y=p.y+YOFF, cx=x+p.w/2, cy=y+p.h/2;

  ctx.save();
  const lf=0.75+0.25*Math.sin(p.lamp*3);
  const rg=ctx.createRadialGradient(cx,cy,2,cx,cy,72);
  rg.addColorStop(0,'rgba(190,230,250,'+(0.34*lf)+')');
  rg.addColorStop(1,'rgba(150,200,240,0)');
  ctx.fillStyle=rg; ctx.fillRect(cx-76,cy-76,152,152);

  if(p.heal>0){
    ctx.globalAlpha=0.5;
    ctx.fillStyle='rgba(200,240,252,0.6)';
    ctx.beginPath(); ctx.arc(cx,cy,18+p.heal*0.3,0,6.283); ctx.fill();
    ctx.globalAlpha=1;
  }

  if(p.dash>0){
    if(IMG.dash.ok){
      const d=DASH_SIZE, ar=IMG.dash.h/IMG.dash.w;
      ctx.save();
      ctx.globalAlpha=clamp(p.dash/11,0,1)*0.95;
      ctx.imageSmoothingEnabled=!SPRITE_PIXEL;
      ctx.translate(cx,cy); ctx.scale(p.face<0?-1:1,1);
      ctx.drawImage(IMG.dash.img,-d*0.9,-d*ar/2,d,d*ar);
      ctx.restore();
    } else {
      ctx.globalAlpha=clamp(p.dash/11,0,1)*0.5;
      ctx.fillStyle='#9fc9dd';
      for(let i=1;i<4;i++) ctx.fillRect(cx-p.face*i*13-SPRITE_SIZE/2,cy-SPRITE_SIZE/2,SPRITE_SIZE,SPRITE_SIZE);
      ctx.globalAlpha=1;
    }
  }
  ctx.restore();

  drawCube(p,cx,cy);

  if(p.atk>2){
    const t=1-(p.atk-2)/12;
    ctx.save();
    ctx.globalAlpha=clamp(1-t*0.8,0,1);
    if(IMG.slash.ok){
      const s=SLASH_SIZE, ar=IMG.slash.h/IMG.slash.w;
      ctx.translate(cx,cy);
      if(p.atkDir==='up') ctx.rotate(-Math.PI/2);
      else if(p.atkDir==='down') ctx.rotate(Math.PI/2);
      else ctx.scale(p.face<0?-1:1,1);
      ctx.imageSmoothingEnabled=!SPRITE_PIXEL;
      ctx.drawImage(IMG.slash.img, 6+t*10, -s*ar/2, s, s*ar);
    } else {
      ctx.strokeStyle='#f4fbff'; ctx.lineWidth=6-t*3.5; ctx.lineCap='round';
      ctx.beginPath();
      if(p.atkDir==='side') ctx.arc(cx+p.face*(20+t*30), cy, 30, -1.15, 1.15, false);
      else if(p.atkDir==='up') ctx.arc(cx, cy-30-t*14, 28, 3.35, 6.07, false);
      else ctx.arc(cx, cy+30+t*14, 28, 0.21, 2.93, false);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawVignette(){
  const g=ctx.createRadialGradient(W/2,H/2,H*0.45,W/2,H/2,H*1.0);
  g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(1,'rgba(0,0,0,0.55)');
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  if(player && player.hp===1 && state==='play'){
    ctx.globalAlpha=0.14+0.10*Math.sin(frame*0.09);
    ctx.fillStyle='#7a1f1c'; ctx.fillRect(0,0,W,H); ctx.globalAlpha=1;
  }
}

function render(){
  ctx.setTransform(1,0,0,1,0,0);
  ctx.clearRect(0,0,W,H);
  drawBG();
  if(state==='title'||state==='story'||state==='controls'||state==='levels'||state==='end'){
    drawMotes(); drawVignette(); return;
  }
  const sh=OPT.shake?world.shake:0;
  ctx.save();
  if(sh>0) ctx.translate(rnd(-sh,sh),rnd(-sh,sh));
  drawTiles();
  drawGate();
  drawPickups();
  for(const e of enemies) if(e.hp>0) drawEnemy(e);
  if(boss) drawBoss(boss);
  drawWaves();
  drawShots();
  if(player) drawPlayer();
  drawParts();
  ctx.restore();
  drawMotes();
  drawVignette();
  drawSpriteDebug();
  if(OPT.showFps){
    ctx.save();
    ctx.font='12px monospace'; ctx.textAlign='right';
    ctx.fillStyle='rgba(0,0,0,0.55)'; ctx.fillRect(W-96,8,88,18);
    ctx.fillStyle='#8fd8e8'; ctx.fillText(liveFps+' fps',W-14,21);
    ctx.restore();
  }
}

function updateShots(){
  for(let i=shots.length-1;i>=0;i--){
    const s=shots[i];
    if(s.warn>0){ s.warn--; continue; }
    s.vy += (s.g||0);
    s.x += s.vx; s.y += s.vy; s.life--;
    const cx=Math.floor(s.x/TILE), cy=Math.floor(s.y/TILE);
    if(s.life<=0 || (cy>=0 && solidAt(cx,cy)) || s.y>world.h+80){
      burst(s.x,s.y,6,'#dfe8f2',2.2); shots.splice(i,1);
    }
  }
}
function updateWaves(){
  for(let i=waves.length-1;i>=0;i--){
    const w=waves[i];
    w.x+=w.vx; w.life--;
    if(w.life%4===0) parts.push({x:w.x,y:w.y+w.h,vx:rnd(-1,1),vy:-rnd(0.3,1.4),life:18,max:18,col:w.col,size:rnd(1,2.4),g:0.05});
    if(w.life<=0 || w.x<-40 || w.x>world.w+40) waves.splice(i,1);
  }
}
function updateParts(){
  for(let i=parts.length-1;i>=0;i--){
    const p=parts[i];
    p.vy+=p.g; p.x+=p.vx; p.y+=p.vy; p.life--;
    if(p.life<=0) parts.splice(i,1);
  }
}

let lastHp=-1;
function drawHUD(){
  const p=player; if(!p) return;
  if(p.hp!==lastHp){
    lastHp=p.hp;
    const m=$('masks'); m.innerHTML='';
    for(let i=0;i<p.maxHp;i++){
      const d=document.createElement('div');
      d.className='mask'+(i<p.hp?'':' empty'); m.appendChild(d);
    }
  }
  const sc=$('soulring'), s=sc.getContext('2d');
  s.clearRect(0,0,120,120);
  s.lineWidth=11; s.lineCap='round';
  s.strokeStyle='rgba(220,235,245,0.10)';
  s.beginPath(); s.arc(60,60,42,0,6.283); s.stroke();
  const frac=p.soul/99;
  s.strokeStyle='#bfe9f5';
  if(frac>0.01){ s.beginPath(); s.arc(60,60,42,-1.5708,-1.5708+6.283*frac); s.stroke(); }
  s.fillStyle='rgba(191,233,245,'+(0.10+0.42*frac)+')';
  s.beginPath(); s.arc(60,60,10+22*frac,0,6.283); s.fill();
  if(boss) $('bossfill').style.width=(100*Math.max(0,boss.hp)/boss.max)+'%';
  $('lvltag').style.opacity = tagT>0 ? clamp(tagT/50,0,1) : 0;
}

let menuIdx=0, menuEl=null, menuActions=[], storyStarts=true;
function markMenu(){
  if(!menuEl) return;
  Array.prototype.forEach.call(menuEl.children,(c,i)=>c.classList.toggle('sel',i===menuIdx));
}
function buildMenu(id,items){
  const el=$(id); el.innerHTML='';
  menuEl=el; menuActions=items.map(i=>i[1]); menuIdx=0;
  items.forEach((it,i)=>{
    const b=document.createElement('button');
    b.className='item'; b.type='button'; b.textContent=it[0];
    b.addEventListener('click',()=>{ menuIdx=i; markMenu(); SFX.ui(); it[1](); });
    b.addEventListener('mouseenter',()=>{ menuIdx=i; markMenu(); });
    el.appendChild(b);
  });
  markMenu();
}

const STORY = [
  "Polo kept the light burning every night, so his family could find the way home.",
  "The night the Warden came, the light was still burning. It did not stop him. His mother, his father, his small brother \u2014 taken down the iron stair, into the dark below the house.",
  "They left Polo the light. They should not have."
];
const ENDING = [
  "The Awakened Warden breaks apart, and the key falls out of him \u2014 warm, and far too small for all it kept shut.",
  "Ten doors open. Three faces turn toward the light.",
  "Polo lets the light go out. He does not need it to find the way home."
];

function toTitle(){
  state='title'; screenOn('scr-title');
  buildMenu('mainmenu',[
    ['Start Game', ()=>showStory(false)],
    ['Chapters', showLevels],
    ['Controls', ()=>{ state='controls'; screenOn('scr-controls'); }],
    ['Options', showOptions],
    ['The Taking', ()=>showStory(true)],
    ['Quit Game', quitGame]
  ]);
}
function showStory(fromMenu){
  storyStarts = !fromMenu;
  state='story'; screenOn('scr-story');
  $('storyHead').textContent='The Taking';
  $('storyBody').innerHTML = STORY.map((t,i)=>'<p'+(i===2?' class="quiet"':'')+'>'+t+'</p>').join('');
}
function showEnding(){
  state='end'; screenOn('scr-end');
  $('endBody').innerHTML = ENDING.map((t,i)=>'<p'+(i===2?' class="quiet"':'')+'>'+t+'</p>').join('');
}
function quitGame(){
  storyStarts=false; state='story'; screenOn('scr-story');
  $('storyHead').textContent='The light rests';
  $('storyBody').innerHTML='<p>Close this tab whenever you are ready.</p><p class="quiet">Polo will wait in the dark. He is used to it.</p>';
}
const FPSCAPS=[0,60,120,144,240];
function capName(v){ return v===0 ? 'Unlimited' : v+' fps'; }

function showOptions(){
  state='options'; screenOn('scr-options');
  const hz = detectedHz ? detectedHz+' Hz' : 'measuring...';
  $('optInfo').textContent = 'Your screen: '+hz+'   |   drawing at '+liveFps+' fps   |   the game always runs at 60 steps a second';
  buildMenu('optmenu',[
    ['Frame cap: '+capName(OPT.fpsCap), ()=>{
      OPT.fpsCap=FPSCAPS[(FPSCAPS.indexOf(OPT.fpsCap)+1)%FPSCAPS.length]; showOptions(); }],
    ['Music: '+MUSIC_NAMES[OPT.musicVol], ()=>{
      OPT.musicVol=(OPT.musicVol+1)%MUSIC_VOLS.length; musicInit(); musicRamp(); showOptions(); }],
    ['Show fps: '+(OPT.showFps?'On':'Off'), ()=>{ OPT.showFps=!OPT.showFps; showOptions(); }],
    ['Screen shake: '+(OPT.shake?'On':'Off'), ()=>{ OPT.shake=!OPT.shake; showOptions(); }],
    ['Sound: '+(OPT.sound?'On':'Off'), ()=>{ OPT.sound=!OPT.sound; showOptions(); }],
    ['Back', toTitle]
  ]);
}

function showLevels(){
  state='levels'; screenOn('scr-levels');
  const g=$('lvlgrid'); g.innerHTML='';
  LEVELS.forEach((L,i)=>{
    const b=document.createElement('button');
    const lock = (i+1)>unlocked;
    b.className='cell'+(L.boss?' boss':'')+(lock?' lock':'');
    b.type='button';
    b.innerHTML='<div class="n">'+(i+1)+'</div><div class="t">'+(lock?'Locked':L.n)+'</div>';
    if(!lock) b.addEventListener('click',()=>{ SFX.ui(); fadeOut(()=>loadLevel(i)); });
    g.appendChild(b);
  });
}
function startRun(){ fadeOut(()=>loadLevel(0)); }
function nextLevel(){ fadeOut(()=>loadLevel(world.index+1, Math.max(3,player?player.hp:5))); }
function pause(){
  if(state!=='play') return;
  state='pause'; screenOn('scr-pause');
  buildMenu('pausemenu',[
    ['Resume', resume],
    ['Restart Chapter', ()=>fadeOut(()=>loadLevel(world.index))],
    ['Back to Title', ()=>fadeOut(toTitle)]
  ]);
}
function resume(){ state='play'; screenOn(null); }

const UI={ key(e){
  const c=e.code;
  ac();
  if(state==='play'){ if(c==='Escape'||c==='KeyP') pause(); return; }
  if(state==='pause'){ if(c==='Escape'||c==='KeyP'){ resume(); return; } }
  if(state==='story'){
    if(c==='Enter'||c==='Space'){ if(storyStarts) startRun(); else toTitle(); }
    else if(c==='Escape') toTitle();
    return;
  }
  if(state==='controls'||state==='levels'){ if(c==='Escape'||c==='Enter') toTitle(); return; }
  if(state==='options' && c==='Escape'){ toTitle(); return; }
  if(state==='clear'){ if(c==='Enter'||c==='Space') nextLevel(); return; }
  if(state==='end'){ if(c==='Enter'||c==='Space') toTitle(); return; }
  if(menuEl && menuActions.length && (state==='title'||state==='pause'||state==='dead'||state==='options')){
    if(c==='ArrowDown'||c==='KeyS'){ menuIdx=(menuIdx+1)%menuActions.length; markMenu(); SFX.ui(); }
    else if(c==='ArrowUp'||c==='KeyW'){ menuIdx=(menuIdx-1+menuActions.length)%menuActions.length; markMenu(); SFX.ui(); }
    else if(c==='Enter'||c==='Space'){ SFX.ui(); menuActions[menuIdx](); }
  }
}};

const isTouch = matchMedia('(pointer:coarse)').matches;
function buildTouch(){
  if(!isTouch) return;
  const defs=[
    ['\u2190','ArrowLeft', 'left:4%;  bottom:8%;  width:15%; padding-bottom:15%;'],
    ['\u2192','ArrowRight','left:22%; bottom:8%;  width:15%; padding-bottom:15%;'],
    ['jump','Space',       'right:4%; bottom:20%; width:17%; padding-bottom:17%;'],
    ['slash','KeyJ',       'right:23%;bottom:8%;  width:17%; padding-bottom:17%;'],
    ['dash','KeyK',        'right:4%; bottom:4%;  width:13%; padding-bottom:13%;'],
    ['\u2193','ArrowDown', 'left:13%; bottom:1%;  width:13%; padding-bottom:13%;']
  ];
  const wrap=$('touch');
  defs.forEach(d=>{
    const b=document.createElement('div');
    b.className='tbtn'; b.textContent=d[0]; b.setAttribute('style',d[2]);
    const on=ev=>{ ev.preventDefault(); ac(); if(!keys[d[1]]) pressed[d[1]]=true; keys[d[1]]=true; b.classList.add('down'); };
    const off=ev=>{ ev.preventDefault(); keys[d[1]]=false; b.classList.remove('down'); };
    b.addEventListener('pointerdown',on); b.addEventListener('pointerup',off);
    b.addEventListener('pointercancel',off); b.addEventListener('pointerleave',off);
    wrap.appendChild(b);
  });
  const pb=document.createElement('div');
  pb.className='tbtn'; pb.textContent='II';
  pb.setAttribute('style','right:4%; top:5%; width:9%; padding-bottom:9%;font-size:1.6vw;');
  pb.addEventListener('pointerdown',e=>{ e.preventDefault(); state==='play'?pause():resume(); });
  wrap.appendChild(pb);
}
const _screenOn=screenOn;
screenOn=function(id){ _screenOn(id); $('touch').classList.toggle('on', id===null && isTouch); musicSet(id!==null); };

let camSmooth=0;

function tick(){
  frame++;
  if(state==='play' && player){
    hazards.length=0;
    updatePlayer();
    for(const e of enemies) if(e.hp>0) updateEnemy(e);
    if(boss) updateBoss(boss);
    updateShots(); updateWaves(); updateParts();
    combat();
    const target=clamp(player.x+player.w/2-W/2+player.face*44, 0, Math.max(0,world.w-W));
    camSmooth += (target-camSmooth)*0.09;
    world.camx = camSmooth;
    if(world.shake>0){ world.shake*=0.86; if(world.shake<0.4) world.shake=0; }
    if(tagT>0) tagT--;
    drawHUD();
  } else {
    updateParts();
  }
  clearTaps();
}

const STEP=1000/60;
let acc=0, lastT=0, lastRender=0, hzSamples=[], fpsCount=0, fpsClock=0;

function step(now){
  requestAnimationFrame(step);
  if(!now) now=(typeof performance!=='undefined'&&performance.now)?performance.now():Date.now();
  if(!lastT){ lastT=now; lastRender=now; fpsClock=now; return; }
  let dt=now-lastT; lastT=now;

  if(dt>0 && dt<100 && hzSamples.length<120){
    hzSamples.push(dt);
    if(hzSamples.length===120){
      const srt=hzSamples.slice().sort(function(a,b){return a-b;});
      detectedHz=Math.round(1000/srt[60]);
    }
  }

  if(dt>250) dt=250;
  acc+=dt;
  let n=0;
  while(acc>=STEP && n<5){ tick(); acc-=STEP; n++; }
  if(n>=5) acc=0;

  if(OPT.fpsCap>0 && now-lastRender < (1000/OPT.fpsCap)-0.6) return;
  lastRender=now;
  render();

  fpsCount++;
  if(now-fpsClock>=500){ liveFps=Math.round(fpsCount*1000/(now-fpsClock)); fpsCount=0; fpsClock=now; }
}

world.map=LEVELS[0].map.map(r=>r.split(''));
world.cols=LEVELS[0].map[0].length; world.w=world.cols*TILE; world.tint=LEVELS[0].tint;
buildTouch();
toTitle();
addEventListener('pointerdown',()=>{ ac(); musicInit(); musicRamp(); },{once:true});
addEventListener('keydown',()=>{ musicInit(); musicRamp(); },{once:true});
addEventListener('blur',()=>{ for(const k in keys) keys[k]=false; if(state==='play') pause(); });
requestAnimationFrame(step);

['scr-story','scr-clear','scr-end'].forEach(function(id){
  $(id).addEventListener('pointerdown',function(){ ac(); UI.key({code:'Enter'}); });
});
$('scr-controls').addEventListener('pointerdown',function(){ toTitle(); });

})();
