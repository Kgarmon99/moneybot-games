/* =====================================================================
   BOTBANK · the 3D world: the bank, the block, the skyline
   ===================================================================== */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const TOUCH=('ontouchstart' in window)||navigator.maxTouchPoints>0;
const MOBILE=TOUCH&&Math.min(screen.width,screen.height)<820;
const PARAMS=new URLSearchParams(location.search);
/* quality: 2 full, 1 school Chromebook, 0 very low */
const Q={t:PARAMS.has('q')?+PARAMS.get('q'):(/CrOS/.test(navigator.userAgent)||MOBILE?1:2)};
const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
const BW=15,BD=11,WH=5.2;            /* half width, half depth, wall height */
const TELLER_X=[-1.8,1.8,-5.4,5.4],COUNTER_Z=-5;
let renderer,scene,camera,hemi,sun,envRT;
const world={zones:{},signs:[],anim:[],walls:{},cars:[],drawerLights:[],vaultDoor:null,piles:[]};
const COLL=[];                        /* solid boxes: [x0,z0,x1,z1] */
let curZone=null,curFloor=0;const solid=(x0,z0,x1,z1,zone)=>COLL.push({x0,z0,x1,z1,zone:zone||curZone,fl:curFloor});
const BOX=new THREE.BoxGeometry(1,1,1),CYL=new THREE.CylinderGeometry(1,1,1,28),SPH=new THREE.SphereGeometry(1,24,16);
const MATS={};
function mat(c,o){const k=c+(o?JSON.stringify(o):'');return MATS[k]||(MATS[k]=new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.6,metalness:.04},o||{})));}
const BRASS=()=>mat('#D8B25A',{metalness:1,roughness:.28}),WALNUT=()=>texMat('wood'),STEEL=()=>mat('#C7D0D6',{metalness:1,roughness:.32}),GLASS=()=>mat('#BFEFE0',{transparent:true,opacity:.2,roughness:.05,metalness:.2,depthWrite:false});
function bx(g,w,h,d,x,y,z,m,cast){const e=new THREE.Mesh(BOX,m);e.scale.set(w,h,d);e.position.set(x,y+h/2,z);e.castShadow=cast!==false&&Q.t>0;e.receiveShadow=true;g.add(e);return e;}
function cy(g,r,h,x,y,z,m,cast){const e=new THREE.Mesh(CYL,m);e.scale.set(r,h,r);e.position.set(x,y+h/2,z);e.castShadow=cast!==false&&Q.t>0;e.receiveShadow=true;g.add(e);return e;}
function sp(g,r,x,y,z,m){const e=new THREE.Mesh(SPH,m);e.scale.setScalar(r);e.position.set(x,y,z);g.add(e);return e;}

/* ----- procedural textures ----- */
const TEX={};
function canvasTex(w,h,fn,rep){const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=Q.t>=2?8:2;if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1]);}return t;}
function marbleTex(base,vein,rep){return canvasTex(1024,1024,(g,w,h)=>{g.fillStyle=base;g.fillRect(0,0,w,h);
  for(let i=0;i<900;i++){g.fillStyle=`rgba(${Math.random()<.5?'255,255,255':'120,110,90'},${Math.random()*.03})`;const r=Math.random()*90+20;g.beginPath();g.arc(Math.random()*w,Math.random()*h,r,0,7);g.fill();}
  for(let n=0;n<26;n++){let x=Math.random()*w,y=Math.random()*h,a=Math.random()*6.3;g.strokeStyle=vein;g.globalAlpha=.05+Math.random()*.22;g.lineWidth=.6+Math.random()*2.4;g.beginPath();g.moveTo(x,y);for(let i=0;i<60;i++){a+=(Math.random()-.5)*.7;x+=Math.cos(a)*14;y+=Math.sin(a)*14;g.lineTo(x,y);}g.stroke();}
  g.globalAlpha=1;g.strokeStyle='rgba(60,50,30,.16)';g.lineWidth=2;for(let i=0;i<=4;i++){g.beginPath();g.moveTo(i*w/4,0);g.lineTo(i*w/4,h);g.moveTo(0,i*h/4);g.lineTo(w,i*h/4);g.stroke();}
},rep);}
function woodTex(){return canvasTex(512,512,(g,w,h)=>{g.fillStyle='#4A2A18';g.fillRect(0,0,w,h);for(let i=0;i<340;i++){g.strokeStyle=`rgba(${Math.random()<.5?'20,8,2':'140,84,44'},${Math.random()*.22})`;g.lineWidth=Math.random()*2.2;const y=Math.random()*h;g.beginPath();g.moveTo(0,y);g.bezierCurveTo(w*.3,y+rand(-7,7),w*.7,y+rand(-7,7),w,y);g.stroke();}},[2,2]);}
function texMat(k){if(MATS['t'+k])return MATS['t'+k];let o;
  if(k==='wood')o={map:woodTex(),roughness:.42,metalness:.05};
  if(k==='marble')o={map:marbleTex('#EFE7D6','#6B5B3F',[1,1]),roughness:.3,metalness:.02};
  if(k==='green')o={map:marbleTex('#0E4A38','#BFE8CF',[1,1]),roughness:.26,metalness:.05};
  if(k==='panel')o={map:canvasTex(512,512,(g,w,h)=>{g.fillStyle='#0C3A2C';g.fillRect(0,0,w,h);g.strokeStyle='rgba(216,178,90,.5)';g.lineWidth=3;g.strokeRect(36,36,w-72,h-72);g.strokeStyle='rgba(255,255,255,.05)';g.lineWidth=2;g.strokeRect(50,50,w-100,h-100);},[1,1]),roughness:.5};
  if(k==='asphalt')o={map:canvasTex(256,256,(g,w,h)=>{g.fillStyle='#2F3438';g.fillRect(0,0,w,h);for(let i=0;i<3000;i++){g.fillStyle=`rgba(255,255,255,${Math.random()*.05})`;g.fillRect(Math.random()*w,Math.random()*h,1.5,1.5);}},[20,20]),roughness:.95};
  if(k==='walk')o={map:canvasTex(256,256,(g,w,h)=>{g.fillStyle='#8E897C';g.fillRect(0,0,w,h);for(let i=0;i<900;i++){g.fillStyle=`rgba(${Math.random()<.5?'255,255,255':'0,0,0'},${Math.random()*.06})`;g.fillRect(Math.random()*w,Math.random()*h,2,2);}g.strokeStyle='rgba(0,0,0,.34)';g.lineWidth=3;g.strokeRect(1,1,w-2,h-2);},[60,6]),roughness:.9};
  return MATS['t'+k]=new THREE.MeshStandardMaterial(o);}
function imgTex(src,cb){const i=new Image(),t=new THREE.Texture(i);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;i.onload=()=>{t.needsUpdate=true;cb&&cb(i);};i.src=src;return t;}
function roundRect(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
function signTex(text,o={}){const w=o.w||768,h=o.h||160;return canvasTex(w,h,(g)=>{if(o.bg){g.fillStyle=o.bg;roundRect(g,3,3,w-6,h-6,o.r==null?26:o.r);g.fill();}if(o.line){g.strokeStyle=o.line;g.lineWidth=5;roundRect(g,8,8,w-16,h-16,o.r==null?22:o.r);g.stroke();}
  let fs=o.fs||Math.floor(h*.56),fam=o.font||'"Fredoka","Arial Rounded MT Bold",Arial,sans-serif',wt=o.wt||700;g.font=`${wt} ${fs}px ${fam}`;while(g.measureText(text).width>w*.88&&fs>10){fs-=2;g.font=`${wt} ${fs}px ${fam}`;}
  g.fillStyle=o.fg||'#fff';g.textAlign='center';g.textBaseline='middle';if(o.spacing&&'letterSpacing' in g)g.letterSpacing=o.spacing;if(o.glow){g.shadowColor=o.glow;g.shadowBlur=26;}g.fillText(text,w/2,h/2+fs*.05);});}
function sign(g,text,w,h,x,y,z,o={}){const t=signTex(text,Object.assign({w:Math.round(512*Math.max(1,w/h>3?1.5:1)),h:Math.round(512*Math.max(1,w/h>3?1.5:1)*h/w)},o)),m=new THREE.MeshStandardMaterial({map:t,transparent:!!(!o.bg||o.r!==0),roughness:.5,emissive:'#fff',emissiveMap:t,emissiveIntensity:o.lit==null?.55:o.lit});const e=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m);e.position.set(x,y,z);if(o.ry)e.rotation.y=o.ry;g.add(e);world.signs.push(e);return e;}
let haloT=null;
function halo(g,x,y,z,color,size,op){if(!haloT)haloT=canvasTex(128,128,(q)=>{const r=q.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.3,'rgba(255,255,255,.4)');r.addColorStop(1,'rgba(255,255,255,0)');q.fillStyle=r;q.fillRect(0,0,128,128);});
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:haloT,color,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,opacity:op==null?.6:op}));s.position.set(x,y,z);s.scale.set(size,size,1);g.add(s);return s;}

/* ----- renderer ----- */
function initThree(){
  const cv=$('#gl');THREE.ColorManagement&&(THREE.ColorManagement.legacyMode=false);
  renderer=new THREE.WebGLRenderer({canvas:cv,antialias:Q.t>=1,powerPreference:'high-performance',preserveDrawingBuffer:PARAMS.has('test')});
  renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.74;
  renderer.shadowMap.enabled=Q.t>=1;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  scene=new THREE.Scene();scene.fog=new THREE.Fog('#BFE4DC',85,330);
  scene.background=new THREE.Color('#BFE4DC');buildSky();
  camera=new THREE.PerspectiveCamera(42,1,.3,700);camera.layers.enable(1);
  hemi=new THREE.HemisphereLight(0xFFF7E8,0x3E5A4E,.42);scene.add(hemi);world.warm=new THREE.PointLight(0xFFC98A,.35,34,1.4);world.warm.position.set(0,4.6,1);scene.add(world.warm);
  sun=new THREE.DirectionalLight(0xFFEBC8,1.9);sun.position.set(-20,36,26);sun.castShadow=Q.t>=1;const sz=Q.t>=2?2048:1024;sun.shadow.mapSize.set(sz,sz);
  const sc=sun.shadow.camera;sc.left=-30;sc.right=30;sc.top=30;sc.bottom=-30;sc.near=1;sc.far=120;sun.shadow.radius=4;sun.shadow.bias=-.0012;sun.shadow.normalBias=.05;scene.add(sun);
  /* soft image-based light so brass and marble have something to reflect */
  if(Q.t>=1){const e=new THREE.Scene();e.background=new THREE.Color('#D9CDB2');const pan=(c,x,y,z,w,h,ry,rx)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide}));m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,0);e.add(m);};pan('#FFFFFF',0,9,0,12,12,0,Math.PI/2);pan('#0C4A38',0,-8,0,30,30,0,Math.PI/2);pan('#FFE3A8',-10,2,0,6,12,Math.PI/2);pan('#BFEFE0',10,2,0,6,12,Math.PI/2);pan('#2A6F5C',0,2,-10,14,6);
    const pm=new THREE.PMREMGenerator(renderer);envRT=pm.fromScene(e,.04);scene.environment=envRT.texture;pm.dispose();}
  initPost();resize();addEventListener('resize',resize);
}
function resize(){const w=innerWidth,h=innerHeight;renderer.setPixelRatio(Math.min(devicePixelRatio||1,Q.t>=2?1.75:1));renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w<h?58:42;camera.updateProjectionMatrix();const cf=$('#confetti'),d=Math.min(2,devicePixelRatio||1);cf.width=w*d;cf.height=h*d;resizePost();}

/* ----- the bank ----- */
function zone(id){return world.zones[id]||(world.zones[id]=(()=>{const g=new THREE.Group();g.visible=false;scene.add(g);return g;})());}
function buildWorld(){
  const g=new THREE.Group();scene.add(g);world.root=g;
  buildGround(g);buildFloor(g);buildShell(g);buildVault(g);buildTellers(g);buildLobby(g);buildWings();buildFacade();buildOutdoors(g);buildSkyline(g);buildDetails(g);buildGallery();
  buildZoneProps();batchAll();
}
function buildGround(g){
  const grass=new THREE.Mesh(new THREE.PlaneGeometry(420,420),mat('#6FA36A',{roughness:1}));grass.rotation.x=-Math.PI/2;grass.position.y=-.18;grass.receiveShadow=true;g.add(grass);
  const road=new THREE.Mesh(new THREE.PlaneGeometry(320,11),texMat('asphalt'));road.rotation.x=-Math.PI/2;road.position.set(0,-.1,22);road.receiveShadow=true;g.add(road);
  const walk=new THREE.Mesh(new THREE.PlaneGeometry(320,5.4),texMat('walk'));walk.rotation.x=-Math.PI/2;walk.position.set(0,-.07,14.2);walk.receiveShadow=true;g.add(walk);
  for(let i=-16;i<=16;i++)bx(g,2.6,.02,.18,i*9,-.09,22,mat('#F4E6A8'),false);
  /* plaza behind and around the bank */
  const plaza=new THREE.Mesh(new THREE.PlaneGeometry(62,44),mat('#857F72',{roughness:.9}));plaza.rotation.x=-Math.PI/2;plaza.position.set(0,-.12,-4);plaza.receiveShadow=true;g.add(plaza);
  [grass,road,walk,plaza].forEach(floorOnly);
}
function buildFloor(g){
  const fl=new THREE.MeshStandardMaterial({map:checkerFloor(),roughness:.24,metalness:.04});initReflect(fl);
  const f=new THREE.Mesh(new THREE.PlaneGeometry(BW*2,BD*2),fl);f.rotation.x=-Math.PI/2;f.receiveShadow=true;g.add(f);floorOnly(f);
  /* emerald runner from door to teller line */
  const runner=new THREE.MeshStandardMaterial({map:marbleTex('#5E1320','#A8636A',[1,3]),roughness:.86});const r=new THREE.Mesh(new THREE.PlaneGeometry(5.6,15),runner);r.rotation.x=-Math.PI/2;r.position.set(0,.012,3.3);r.receiveShadow=true;g.add(r);floorOnly(r);
  [-2.95,2.95].forEach(x=>{const b=new THREE.Mesh(new THREE.PlaneGeometry(.12,15),BRASS());b.rotation.x=-Math.PI/2;b.position.set(x,.016,3.3);g.add(b);});
  /* medallion: the MoneyBot mark set into the floor */
  const med=new THREE.Group();med.position.set(0,.02,5.2);g.add(med);
  const ring=new THREE.Mesh(new THREE.RingGeometry(2.05,2.3,64),BRASS());ring.rotation.x=-Math.PI/2;med.add(ring);
  const base=new THREE.Mesh(new THREE.CircleGeometry(2.05,64),mat('#F7F2E2',{roughness:.3}));base.rotation.x=-Math.PI/2;base.position.y=-.002;med.add(base);
  const lt=imgTex(MB_ASSETS.logo),logo=new THREE.Mesh(new THREE.CircleGeometry(1.95,64),new THREE.MeshStandardMaterial({map:lt,transparent:true,roughness:.3}));logo.rotation.x=-Math.PI/2;logo.position.y=.003;med.add(logo);
  for(let i=0;i<8;i++){const a=i/8*6.283;const d=new THREE.Mesh(new THREE.CircleGeometry(.1,20),BRASS());d.rotation.x=-Math.PI/2;d.position.set(Math.cos(a)*2.55,.002,Math.sin(a)*2.55);med.add(d);}
  world.logoT=lt;floorOnly(med);
}
function wallPiece(g,w,h,d,x,z,win){const e=bx(g,w,h,d,x,0,z,win||texMat('panel'));return e;}
function buildShell(g){
  const W=world.walls;
  /* back wall, split around the vault */
  W.back=new THREE.Group();g.add(W.back);
  const pm=texMat('panel').clone();pm.map=texMat('panel').map.clone();pm.map.repeat.set(5,1);pm.map.needsUpdate=true;
  bx(W.back,BW-3.4,WH,.5,-(BW+3.4)/2,0,-BD-.25,pm);bx(W.back,BW-3.4,WH,.5,(BW+3.4)/2,0,-BD-.25,pm);bx(W.back,6.8,WH-4.4,.5,0,4.4,-BD-.25,mat('#0C3A2C'));
  bx(W.back,BW*2+.8,.2,.7,0,WH,-BD-.25,BRASS(),false);
  solid(-BW-1,-BD-.5,-3.4,-BD);solid(3.4,-BD-.5,BW+1,-BD);
  sign(W.back,'BOTBANK',7.4,1.5,0,6.9,-BD-.1,{fg:'#F4C542',font:'"Fredoka",Arial,sans-serif',wt:700,glow:'#F4C542',lit:.9,w:1024,h:208});
  /* MoneyBot logo roundels flanking the sign */
  [-5.2,5.2].forEach(x=>{const m=new THREE.Mesh(new THREE.CircleGeometry(.95,48),new THREE.MeshBasicMaterial({map:world.logoT,transparent:true}));m.position.set(x,6.9,-BD-.09);W.back.add(m);});
  bx(W.back,16,1.2,.2,0,6.3,-BD-.28,mat('#0C3A2C'));
  /* side walls with tall windows */
  [['west',-1],['east',1]].forEach(([n,s])=>{const w=new THREE.Group();g.add(w);W[n]=w;const x=s*(BW+.25);
    bx(w,.5,1.1,BD*2,x,0,0,texMat('wood'));bx(w,.5,.9,BD*2,x,WH-.9,0,mat('#0C3A2C'));for(let i=0;i<7;i++)bx(w,.5,WH-2,.7,x,1.1,-BD+.35+i*3.53,mat('#0C3A2C'));
    const gl=new THREE.Mesh(new THREE.PlaneGeometry(BD*2,WH-2),GLASS());gl.rotation.y=Math.PI/2;gl.position.set(x,2.6,0);w.add(gl);bx(w,.7,.12,BD*2+1,x,WH,0,BRASS(),false);
    solid(s>0?BW:-BW-.5,-BD-.5,s>0?BW+.5:-BW,BD+.5);});
  /* wainscot on the camera side, so the room stays open */
  W.south=new THREE.Group();g.add(W.south);
  [-1,1].forEach(s=>{bx(W.south,BW-3.2,.9,.4,s*(BW+3.2)/2,0,BD+.2,texMat('wood'));bx(W.south,BW-3.2,.08,.46,s*(BW+3.2)/2,.9,BD+.2,BRASS(),false);solid(s>0?3.2:-BW-1,BD,s>0?BW+1:-3.2,BD+.45);});
  /* columns down the hall */
  [-8,8].forEach(x=>[-7.5,-1.5,4.5].forEach(z=>{column(g,x,z,WH,.5,CREAM(),BRASS());solid(x-.62,z-.62,x+.62,z+.62);}));
  /* chandeliers */
  [[0,1.4],[-11.5,0],[11.5,0]].forEach(([x,z],i)=>{const c=new THREE.Group();c.position.set(x,4.3,z);g.add(c);const t=new THREE.Mesh(new THREE.TorusGeometry(1.1,.06,8,36),BRASS());t.rotation.x=Math.PI/2;c.add(t);cy(c,.03,2.2,0,0,0,BRASS(),false);for(let k=0;k<8;k++){const a=k/8*6.283;sp(c,.13,Math.cos(a)*1.1,-.14,Math.sin(a)*1.1,mat('#FFF3CC',{emissive:'#FFD98A',emissiveIntensity:2.4}));if(Q.t>=1)for(let q=0;q<3;q++){const cr=new THREE.Mesh(new THREE.OctahedronGeometry(.05),mat('#EAF6FF',{metalness:.2,roughness:.05,transparent:true,opacity:.85}));cr.scale.y=2;cr.position.set(Math.cos(a+q*.26)*(.8-q*.2),-.42-q*.14,Math.sin(a+q*.26)*(.8-q*.2));c.add(cr);}}if(Q.t>=2)halo(c,0,-.2,0,'#FFD98A',4.6,.3);if(Q.t>=2&&i===0){const l=new THREE.PointLight(0xFFD9A0,.7,18);c.add(l);}});
}
function buildVault(g){
  /* the vault room sits behind the back wall; the round door is the hero prop */
  const room=new THREE.Group();g.add(room);
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(8,6),mat('#272E33',{roughness:.5,metalness:.4}));fl.rotation.x=-Math.PI/2;fl.position.set(0,.01,-14);fl.receiveShadow=true;room.add(fl);
  bx(room,8.6,4.2,.4,0,0,-17.2,STEEL());[-1,1].forEach(s=>bx(room,.4,4.2,6.4,s*4.2,0,-14.2,STEEL()));solid(-4.6,-17.6,4.6,-17);solid(-4.6,-17.4,-4,-11);solid(4,-17.4,4.6,-11);
  for(let i=0;i<6;i++){bx(room,.14,3.4,.8,-3.8+i*1.52,0,-16.7,STEEL());}
  /* shelves of cash: how many show depends on real cash on hand */
  const paper=[mat('#3F9C5A',{roughness:.7}),mat('#2F8A4E',{roughness:.7})];
  for(let row=0;row<4;row++){bx(room,7.4,.08,.9,0,.5+row*.9,-16.3,STEEL());for(let i=0;i<14;i++){const b=bx(room,.46,.3,.7,-3.3+i*.5,.58+row*.9,-16.3,paper[i%2]);bx(b,.4,.06,1.02,0,.45,0,mat('#FFF7D6'),false);b.visible=false;b.userData.keep=true;world.piles.push(b);}}
  [-2.3,2.3].forEach(x=>{const t=new THREE.Group();t.position.set(x,0,-13.2);room.add(t);bx(t,1.5,.7,1.2,0,0,0,mat('#23292E',{metalness:.6,roughness:.4}));for(let i=0;i<6;i++)bx(t,.42,.2,.26,-.42+(i%3)*.44,.72+(i>2?.2:0),i>2?.1:-.1+i*.05,mat('#F4C542',{metalness:1,roughness:.3}));solid(x-.8,-13.9,x+.8,-12.5);});
  /* frame + door */
  const fr=new THREE.Mesh(new THREE.TorusGeometry(3.05,.42,18,64),STEEL());fr.position.set(0,3.05,-BD-.15);fr.castShadow=true;room.add(fr);
  [[-3.6,0],[3.6,0]].forEach(([x])=>bx(room,1.4,4.4,.6,x,0,-BD-.15,mat('#0C3A2C')));
  const hinge=new THREE.Group();hinge.position.set(3.05,3.05,-BD+.1);room.add(hinge);
  const door=new THREE.Group();door.position.set(-3.05,0,0);hinge.add(door);
  const disc=new THREE.Mesh(new THREE.CylinderGeometry(2.86,2.86,.5,64),mat('#BFC8CE',{metalness:1,roughness:.26}));disc.rotation.x=Math.PI/2;disc.castShadow=true;door.add(disc);
  const inner=new THREE.Mesh(new THREE.CylinderGeometry(2.1,2.1,.08,64),BRASS());inner.rotation.x=Math.PI/2;inner.position.z=.28;door.add(inner);
  const lg=new THREE.Mesh(new THREE.CircleGeometry(1.25,48),new THREE.MeshStandardMaterial({map:world.logoT,transparent:true,roughness:.3}));lg.position.z=.34;door.add(lg);
  for(let i=0;i<16;i++){const a=i/16*6.283,b=new THREE.Mesh(new THREE.CylinderGeometry(.14,.14,.14,14),BRASS());b.rotation.x=Math.PI/2;b.position.set(Math.cos(a)*2.5,Math.sin(a)*2.5,.3);door.add(b);}
  const wheel=new THREE.Group();wheel.position.z=.42;door.add(wheel);const tr=new THREE.Mesh(new THREE.TorusGeometry(.9,.07,10,40),STEEL());wheel.add(tr);for(let i=0;i<3;i++){const s=new THREE.Mesh(BOX,STEEL());s.scale.set(1.8,.09,.09);s.rotation.z=i*1.047;wheel.add(s);}
  if(Q.t>=1){for(let i=0;i<24;i++){const a=i/24*6.283,t=new THREE.Mesh(BOX,STEEL());t.scale.set(.2,.34,.5);t.position.set(Math.cos(a)*2.95,Math.sin(a)*2.95,-.02);t.rotation.z=a+1.571;door.add(t);}for(let i=0;i<8;i++){const a=i/8*6.283+.39,b=new THREE.Mesh(CYL,STEEL());b.scale.set(.16,.9,.16);b.rotation.z=a+1.571;b.position.set(Math.cos(a)*2.72,Math.sin(a)*2.72,0);door.add(b);}const dep=canvasTex(512,256,(q,w,h)=>{q.fillStyle='#8E979C';q.fillRect(0,0,w,h);for(let y=0;y<6;y++)for(let x=0;x<12;x++){q.fillStyle='#B9C2C7';q.fillRect(x*42+3,y*42+3,37,37);q.fillStyle='#D8B25A';q.fillRect(x*42+17,y*42+18,9,7);q.strokeStyle='#5B6468';q.strokeRect(x*42+3,y*42+3,37,37);}});[-1,1].forEach(s=>{const b=new THREE.Mesh(new THREE.PlaneGeometry(5.6,3.2),new THREE.MeshStandardMaterial({map:dep,metalness:.7,roughness:.35}));b.position.set(s*3.98,2,-14.2);b.rotation.y=-s*Math.PI/2;room.add(b);});}
  hinge.userData.keep=true;world.vaultDoor=hinge;world.vaultWheel=wheel;world.vaultOpen=0;
  solid(-3.4,-BD-.4,3.4,-BD+.1,'vaultshut');
}
function buildTellers(g){
  const c=new THREE.Group();g.add(c);world.counter=c;
  bx(c,16,1.05,1,0,0,COUNTER_Z,texMat('wood'));bx(c,16.3,.1,1.22,0,1.05,COUNTER_Z,texMat('marble'));bx(c,16,.08,.04,0,.55,COUNTER_Z+.52,BRASS(),false);bx(c,16,.07,.04,0,.08,COUNTER_Z+.52,mat('#39E75F',{emissive:'#39E75F',emissiveIntensity:1.6}),false);
  solid(-8.2,COUNTER_Z-.6,8.2,COUNTER_Z+.6);
  /* a window group per teller position */
  world.windows=TELLER_X.map((x,i)=>{const w=new THREE.Group();w.position.set(x,0,COUNTER_Z);(i?zone('teller'+(i+1)):g).add(w);
    [-1.7,1.7].forEach(s=>{const pole=bx(w,.05,1.1,.05,s*.62,1.15,0,BRASS(),false);pole.scale.y=1.1;});bx(w,1.3,.05,.05,0,2.22,0,BRASS(),false);const gl=bx(w,1.2,1,.03,0,1.15,0,GLASS(),false);gl.position.y=1.8;
    sign(w,'WINDOW '+(i+1),1.3,.3,0,2.46,.03,{bg:'#0C3A2C',fg:'#F4C542',line:'#D8B25A',r:14});
    grille(w);monitor(w,.05,1.13,-.3,'#39E75F');const lamp=sp(w,.08,.5,1.26,.26,mat('#39E75F',{emissive:'#39E75F',emissiveIntensity:2}));lamp.userData.keep=true;cy(w,.13,.03,-.42,1.15,.2,mat('#FFF',{}));
    const stool=new THREE.Group();stool.position.set(0,0,-1.2);w.add(stool);bx(stool,.7,.5,.6,0,0,0,texMat('wood'));
    return {lamp,x,i};});
  sign(c,'TELLERS',2.8,.62,0,3.3,COUNTER_Z-.05,{bg:'#0C3A2C',fg:'#fff',line:'#D8B25A'});
  [-1.2,1.2].forEach(x=>cy(c,.015,1.6,x,3.6,COUNTER_Z-.05,BRASS(),false));
}
function stanchion(g,x,z){cy(g,.05,1,x,0,z,BRASS());sp(g,.09,x,1.04,z,BRASS());cy(g,.2,.05,x,0,z,BRASS());}
function buildLobby(g){
  /* rope line down the middle: bots queue here */
  for(let i=0;i<4;i++){[-1.3,1.3].forEach(x=>{stanchion2(g,x,-2.2+i*1.5);if(i<3)rope(g,V(x,.98,-2.2+i*1.5),V(x,.98,-.7+i*1.5),mat('#8E1F2F',{roughness:.5}));});}
  /* plants, benches */
  [[-7.2,9.6],[7.2,9.6],[-14,10],[14,10],[-14.2,-10],[14.2,-10]].forEach(a=>plant2(g,a[0],a[1]));
  /* framed MoneyBot badges along the back wall */
  const art=[['savingsguardian',-9.4],['coincollector',-12.6],['level3-investorpro',12.6],['goalcrusher',9.4]];
  art.forEach(([k,x])=>{const f=new THREE.Group();f.position.set(x,3.05,-BD+.1);g.add(f);bx(f,1.9,1.9,.08,0,-.95,0,BRASS(),false);const m=new THREE.Mesh(new THREE.PlaneGeometry(1.74,1.74),new THREE.MeshStandardMaterial({map:imgTex(MB_ASSETS.badges[k]),transparent:true,roughness:.5,emissive:'#fff',emissiveIntensity:.08}));m.position.z=.05;f.add(m);});
    /* the MoneyBot greeter */
  world.greeterSpot=V(4.2,0,7.6);
  bx(g,1.8,.95,.8,4.2,0,6.6,texMat('wood'));bx(g,1.95,.07,.95,4.2,.95,6.6,texMat('marble'));sign(g,'ASK MONEYBOT',1.5,.3,4.2,.62,7.02,{bg:'#0C3A2C',fg:'#39E75F',line:'#39E75F',r:12});solid(3.3,6.2,5.1,7);
  /* community board with the presented-by plaque */
  const b=new THREE.Group();b.position.set(-4.2,0,6.8);g.add(b);bx(b,.1,1.5,.1,-.8,0,0,BRASS());bx(b,.1,1.5,.1,.8,0,0,BRASS());bx(b,1.9,1.1,.1,0,1.2,0,texMat('wood'));
  const pc=canvasTex(512,296,(q,w,h)=>{q.fillStyle='#FFFDF5';q.fillRect(0,0,w,h);q.fillStyle='#0C3A2C';q.font='700 46px Fredoka,Arial';q.textAlign='center';q.fillText('Learn How Banks Work',w/2,70);q.fillStyle='#395248';q.font='500 28px Inter,Arial';q.fillText('Free money workshops at BotBank',w/2,122);q.fillStyle='#8A8066';q.font='600 20px Inter,Arial';q.fillText('PRESENTED BY',w/2,200);q.fillStyle='#22352E';q.font='700 30px Georgia,serif';q.fillText(SPONSOR.name,w/2,240);q.font='400 20px Inter,Arial';q.fillStyle='#6A7A72';q.fillText(SPONSOR.place,w/2,270);});
  const pb=new THREE.Mesh(new THREE.PlaneGeometry(1.76,1),new THREE.MeshStandardMaterial({map:pc,roughness:.6}));pb.position.set(0,1.75,.06);b.add(pb);solid(-5.2,6.6,-3.2,7);
}
function deskSet(g,x,z,label,col){bx(g,2.6,.9,1,x,0,z,texMat('wood'));bx(g,2.8,.07,1.15,x,.9,z,texMat('marble'));monitor(g,x+.1,.97,z-.1,col);greenLamp(g,x-.95,.97,z-.1);paper(g,x-.45,.97,z+.2);paper(g,x-.47,1,z+.21);for(const[zz,cc]of[[z+1.25,'#7A1F2B'],[z-1.2,'#0C3A2C']]){cy(g,.3,.1,x,.42,zz,mat(cc,{roughness:.7}));bx(g,.56,.5,.08,x,.5,zz+(zz>z?.28:-.28),mat(cc,{roughness:.7}));cy(g,.04,.42,x,0,zz,BRASS());cy(g,.22,.03,x,0,zz,BRASS());}sign(g,label,3,.62,x,3.3,z-.02,{bg:'#0C3A2C',fg:'#fff',line:col});[-1.2,1.2].forEach(a=>cy(g,.015,1.6,x+a,3.6,z-.02,BRASS(),false));solid(x-1.45,z-.6,x+1.45,z+.6);}
function glassWall(g,x0,z0,x1,z1){const dx=x1-x0,dz=z1-z0,l=Math.hypot(dx,dz),mx=(x0+x1)/2,mz=(z0+z1)/2;bx(g,dx?l:.06,.5,dz?l:.06,mx,0,mz,texMat('wood'));bx(g,dx?l:.04,2.2,dz?l:.04,mx,.5,mz,GLASS(),false);bx(g,dx?l:.08,.06,dz?l:.08,mx,2.7,mz,BRASS(),false);}
function buildWings(){
  /* New Accounts is always open */
  const na=new THREE.Group();scene.add(na);deskSet(na,-11.5,6,'NEW ACCOUNTS','#39E75F');
  /* poster for the product wall */
  world.stationSpots={newacct:{x:-11.5,z:7.3,sx:-11.5,sz:4.7},loan:{x:-11.5,z:-1.7,sx:-11.5,sz:-4.3},fraud:{x:-11.5,z:-8.2,sx:-11.5,sz:-9.5},trust:{x:11.5,z:-1.7,sx:11.5,sz:-4.3}};
  curZone='loanoffice';const lo=zone('loanoffice');deskSet(lo,-11.5,-3,'LOANS','#F4C542');glassWall(lo,-14.8,-6,-8.8,-6);
  curZone='fraudlab';const fr=zone('fraudlab');bx(fr,3.4,.9,.8,-11.5,0,-9,mat('#1B2526'));solid(-13.2,-9.4,-9.8,-8.6);for(let i=0;i<3;i++){const sc=bx(fr,.95,.6,.05,-12.6+i*1.1,.95,-9.25,mat('#07110E',{emissive:'#FF5A4F',emissiveIntensity:.8}));world.anim.push({k:'pulse',m:sc.material});}sign(fr,'FRAUD LAB',3,.62,-11.5,3.3,-9.3,{bg:'#3A0F12',fg:'#FFB4AE',line:'#FF5A4F'});
  curZone='coffee';const cf=zone('coffee');bx(cf,3.6,1,.9,11.5,0,8.4,texMat('wood'));bx(cf,3.8,.08,1,11.5,1,8.4,texMat('marble'));bx(cf,.8,.8,.6,12.6,1.08,8.4,mat('#2A2F33',{metalness:.7,roughness:.3}));solid(9.6,7.9,13.4,8.9);sign(cf,'COFFEE LOUNGE',3.2,.62,11.5,3.3,8.4,{bg:'#3B2413',fg:'#FFE9C7',line:'#D8B25A'});[[10,4.7],[13,4.7]].forEach(([x,z])=>{bx(cf,1.8,.42,.7,x,0,z,mat('#0E5A44',{roughness:.8}));bx(cf,1.8,.5,.18,x,.42,z-.26,mat('#0E5A44',{roughness:.8}));solid(x-.95,z-.4,x+.95,z+.4);});
  curZone='trust';const tr=zone('trust');deskSet(tr,11.5,-3,'TRUST DEPT','#A9C7FF');glassWall(tr,8.8,-6,14.8,-6);
  curZone='digital';const dg=zone('digital');for(let i=0;i<3;i++){const r=bx(dg,.9,2.3,.9,10+i*1.5,0,-9.6,mat('#111A1F',{metalness:.6,roughness:.4}));for(let k=0;k<6;k++)bx(dg,.6,.05,.02,10+i*1.5,.3+k*.33,-9.14,mat('#39E75F',{emissive:'#39E75F',emissiveIntensity:1.6}),false);}solid(9.4,-10.2,13.8,-9);sign(dg,'DIGITAL BANKING',3.2,.62,11.5,3.3,-8.9,{bg:'#07241C',fg:'#39E75F',line:'#39E75F'});
  curZone='community';const cm=zone('community');for(let r=0;r<2;r++)for(let i=0;i<3;i++)cy(cm,.26,.45,10+i*1.4,0,.7+r*1.3,mat('#0E5A44',{roughness:.8}));bx(cm,3,1.8,.1,11.5,.9,-.1+.35,mat('#F7F2E2'));sign(cm,'COMMUNITY ROOM',3.2,.62,11.5,3.3,.6,{bg:'#0C3A2C',fg:'#fff',line:'#39E75F'});
  curZone=null;const m=new THREE.Mesh(new THREE.PlaneGeometry(1.8,.42),new THREE.MeshStandardMaterial({map:signTex('Presented by '+SPONSOR.name,{w:640,h:150,fg:'#3C5A4E',font:'Georgia,serif',wt:600}),transparent:true}));m.position.set(11.5,1.5,.31);cm.add(m);
}
let CROWN=null;function crownGeo(){if(CROWN)return CROWN;const ge=new THREE.IcosahedronGeometry(1,Q.t>=2?3:2),p=ge.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=1+.16*Math.sin(x*5+y*3)*Math.cos(z*4+y*5)+.08*Math.sin(x*11-z*9);p.setXYZ(i,x*k,y*k,z*k);}const n=ge.attributes.normal;for(let i=0;i<p.count;i++){const L=Math.hypot(p.getX(i),p.getY(i),p.getZ(i));n.setXYZ(i,p.getX(i)/L,p.getY(i)/L,p.getZ(i)/L);}return CROWN=ge;}
function tree(g,x,z,s){const t=new THREE.Group();t.position.set(x,0,z);t.scale.setScalar(s||1);g.add(t);lathe(t,[[.3,0],[.2,.3],[.14,1.5],[.1,2.3]],0,0,0,mat('#5C4230',{roughness:.9}),10);for(let i=0;i<7;i++){const m=new THREE.Mesh(crownGeo(),mat(['#3C8D52','#2F7A47','#55A968','#6DB874'][i%4],{roughness:.72}));m.scale.setScalar(rand(.75,1.2));m.position.set(rand(-.95,.95),2.6+rand(0,1.5),rand(-.95,.95));m.rotation.set(rand(0,3),rand(0,3),0);m.castShadow=Q.t>0;t.add(m);}}
function buildOutdoors(g){
  for(let i=-5;i<=5;i++)if(Math.abs(i)>1)tree(g,i*9+1,12.9,rand(.85,1.1));
  [[-22,-2],[-27,6],[-21,-12],[27,5],[28,-12],[-34,-16],[35,8]].forEach(a=>tree(g,a[0],a[1],rand(1,1.4)));
  /* light poles with banners: MoneyBot, BotBank and one small sponsor banner */
  const pole=(x,tex,mark)=>{const p=new THREE.Group();p.position.set(x,0,16.8);g.add(p);cy(p,.09,5.6,0,0,0,mat('#1F2B28',{metalness:.6}));bx(p,1.2,.06,.06,.6,5.2,0,mat('#1F2B28'),false);sp(p,.18,1.2,5.08,0,mat('#FFF3CC',{emissive:'#FFD98A',emissiveIntensity:1.6}));const b=new THREE.Mesh(new THREE.PlaneGeometry(.9,1.9),new THREE.MeshStandardMaterial({map:tex,side:THREE.DoubleSide}));b.position.set(.56,3.9,0);p.add(b);if(mark){const l=new THREE.Mesh(new THREE.CircleGeometry(.3,40),new THREE.MeshBasicMaterial({map:world.logoT,transparent:true,side:THREE.DoubleSide}));l.position.set(.56,4.42,.012);p.add(l);}};
  const banner=(fn)=>canvasTex(256,512,fn);
  const mbB=banner((q,w,h)=>{q.fillStyle='#07241C';q.fillRect(0,0,w,h);q.fillStyle='#39E75F';q.font='700 54px Fredoka,Arial';q.textAlign='center';q.fillText('Money',w/2,330);q.fillText('Bot',w/2,392);q.fillStyle='#fff';q.font='500 24px Inter,Arial';q.fillText('Run the bank.',w/2,446);});
  const bbB=banner((q,w,h)=>{q.fillStyle='#F4C542';q.fillRect(0,0,w,h);q.fillStyle='#0C3A2C';q.font='800 66px Fredoka,Arial';q.textAlign='center';q.fillText('BOT',w/2,210);q.fillText('BANK',w/2,280);q.font='500 24px Inter,Arial';q.fillText('Your money. Safe.',w/2,340);});
  const spB=banner((q,w,h)=>{q.fillStyle='#FFFDF5';q.fillRect(0,0,w,h);q.fillStyle='#8A8066';q.font='600 18px Inter,Arial';q.textAlign='center';q.fillText('PRESENTED BY',w/2,190);q.fillStyle='#22352E';q.font='700 34px Georgia,serif';q.fillText('American',w/2,246);q.fillText('Bank & Trust',w/2,290);q.font='400 18px Inter,Arial';q.fillText(SPONSOR.place,w/2,336);});
  [-36,-24,24,36].forEach((x,i)=>pole(x,i%2?bbB:mbB,!(i%2)));pole(-14,bbB);pole(14,spB);
  /* cars cruising the avenue */
  const colors=['#E04F4F','#3B82F6','#F4C542','#F8FAFC','#39E75F','#8B5CF6'];
  for(let i=0;i<7;i++){const c=car(colors[i%6]);c.userData.keep=true;c.position.set(rand(-100,100),.1,i%2?19.4:24.6);c.rotation.y=i%2?Math.PI/2:-Math.PI/2;g.add(c);world.cars.push({m:c,s:(i%2?1:-1)*rand(9,16)});}
  /* ATM alcove */
  curZone='atm';const atm=zone('atm');atm.position.set(12.6,0,BD+1.1);bx(atm,1.4,2.4,.9,0,0,0,mat('#0C3A2C'));const scr=bx(atm,.8,.55,.05,0,1.3,.46,mat('#07110E',{emissive:'#39E75F',emissiveIntensity:.8}));sign(atm,'ATM',.9,.3,0,2.05,.47,{fg:'#F4C542'});solid(11.8,BD+.6,13.4,BD+1.6);curZone=null;
  /* drive-thru canopy */
  const dr=zone('drive');const lane=new THREE.Mesh(new THREE.PlaneGeometry(4.6,34),texMat('asphalt'));lane.rotation.x=-Math.PI/2;lane.position.set(18.4,-.04,2);lane.receiveShadow=true;dr.add(lane);[-5,5].forEach(z=>{cy(dr,.2,4,16.3,0,z,BRASS());cy(dr,.2,4,20.6,0,z,BRASS());});bx(dr,6.2,.3,13,18.4,4,0,mat('#0C3A2C'));sign(dr,'DRIVE-THRU',3.6,.7,18.4,3.5,6.5,{fg:'#F4C542',bg:'#0C3A2C',line:'#D8B25A'});
  world.driveCar=car('#3B82F6');world.driveCar.position.set(18.4,.1,13);world.driveCar.visible=false;world.driveCar.userData.keep=true;dr.add(world.driveCar);
}
function car(col){const c=new THREE.Group(),sh=new THREE.Shape();sh.moveTo(-2.15,.22);sh.lineTo(-2.2,.62);sh.quadraticCurveTo(-2.1,.78,-1.7,.8);sh.lineTo(-1.05,.84);sh.quadraticCurveTo(-.6,1.32,0,1.34);sh.lineTo(.72,1.32);sh.quadraticCurveTo(1.25,1.28,1.6,.86);sh.lineTo(2,.8);sh.quadraticCurveTo(2.2,.7,2.15,.22);sh.closePath();
  const ge=new THREE.ExtrudeGeometry(sh,{depth:1.56,bevelEnabled:true,bevelSize:.1,bevelThickness:.12,bevelSegments:2,curveSegments:8});ge.translate(0,0,-.78);ge.rotateY(Math.PI/2);const b=new THREE.Mesh(ge,mat(col,{roughness:.2,metalness:.45}));b.castShadow=Q.t>0;c.add(b);
  bx(c,1.62,.42,1.6,0,.88,-.32,mat('#141E23',{roughness:.08,metalness:.7}),false);[[-.95,1.34],[.95,1.34],[-.95,-1.34],[.95,-1.34]].forEach(([x,z])=>{const w=new THREE.Mesh(CYL,mat('#15191C',{roughness:.8}));w.scale.set(.37,.26,.37);w.rotation.z=Math.PI/2;w.position.set(x,.36,z);c.add(w);const h=new THREE.Mesh(CYL,mat('#C7D0D6',{metalness:1,roughness:.3}));h.scale.set(.2,.27,.2);h.rotation.z=Math.PI/2;h.position.set(x,.36,z);c.add(h);});
  [-.62,.62].forEach(x=>{const f=new THREE.Mesh(SPH,mat('#FFF7DD',{emissive:'#FFE9A8',emissiveIntensity:2}));f.scale.set(.17,.11,.06);f.position.set(x,.6,-2.28);c.add(f);const r=new THREE.Mesh(SPH,mat('#FF3B30',{emissive:'#FF2B20',emissiveIntensity:1.5}));r.scale.set(.17,.09,.05);r.position.set(x,.64,2.27);c.add(r);});return c;}
function buildSkyline(g){
  const palette=['#A8B3AD','#8FA3A0','#BFAF97','#7F9A97','#A3B2BC'];
    world.cityLit=[];const cityM=palette.map(c=>{const m=(()=>{const lit=canvasTex(256,512,(q,w,h)=>{q.fillStyle='#000';q.fillRect(0,0,w,h);for(let y=10;y<h;y+=24)for(let x=10;x<w;x+=26)if(Math.random()<.38){q.fillStyle=Math.random()<.5?'#FFE3A0':'#FFF4D8';q.fillRect(x,y,16,15);}},[2,3]);const map=canvasTex(256,512,(q,w,h)=>{q.fillStyle=c;q.fillRect(0,0,w,h);for(let y=0;y<h;y+=24){q.fillStyle='rgba(0,0,0,.05)';q.fillRect(0,y,w,3);}for(let y=10;y<h;y+=24)for(let x=10;x<w;x+=26){q.fillStyle=`rgba(32,62,76,${.72+Math.random()*.2})`;q.fillRect(x,y,16,15);q.fillStyle='rgba(180,220,235,.22)';q.fillRect(x,y,16,5);}},[2,3]);return new THREE.MeshStandardMaterial({map,emissiveMap:lit,emissive:'#FFD9A0',emissiveIntensity:.08,roughness:.35,metalness:.25});})();world.cityLit.push(m);return m;});
  for(let i=0;i<34;i++){const x=-230+i*13.6+rand(-3,3),z=-95-rand(0,95),w=rand(7,12),d=rand(7,12),h=rand(34,88)*(Math.abs(x)<70?1.2:.9),m=cityM[i%cityM.length];const add=(W,H,D,y)=>{const b=new THREE.Mesh(BOX,m);b.scale.set(W,H,D);b.position.set(x,y+H/2,z);g.add(b);};add(w,h,d,0);if(i%2){add(w*.72,h*.22,d*.72,h);add(w*.4,h*.12,d*.4,h*1.22);}bx(g,w+.3,.3,d+.3,x,h,z,mat('#7E8F8C'),false);if(i%3===0)cy(g,.12,6,x+1,h,z,mat('#465052',{metalness:.7}),false);if(i%3===1){cy(g,1.1,1.5,x-1.5,h+.7,z+1,mat('#7A5B3E',{roughness:.9}),false);}}
  const back=(x,z,w,h,c)=>{const b=bx(g,w,h,8,x,0,z,mat(c,{roughness:.8}),true);return b;};
  [[-36,-28,16,9,'#B9AE96'],[34,-30,18,12,'#A8B9B3']].forEach(a=>back(...a));
  /* the Tower, raised late in the game */
  const tw=zone('tower');tw.position.set(0,0,-27);
  const glass=new THREE.MeshStandardMaterial({map:canvasTex(128,256,(q,w,h)=>{q.fillStyle='#0E5A44';q.fillRect(0,0,w,h);for(let y=4;y<h;y+=12)for(let x=4;x<w;x+=14){q.fillStyle=Math.random()<.35?'#E9FFD8':'#0A4032';q.fillRect(x,y,10,8);}},[3,8]),roughness:.15,metalness:.4});
  [[16,16,44],[12,12,62],[8,8,78]].forEach(([w,d,h])=>{const b=new THREE.Mesh(BOX,glass);b.scale.set(w,h,d);b.position.y=h/2;tw.add(b);});
  const lg=new THREE.Mesh(new THREE.CircleGeometry(4.6,48),new THREE.MeshBasicMaterial({map:world.logoT,transparent:true}));lg.position.set(0,52,6.1);tw.add(lg);sign(tw,'BOTBANK',10,2,0,70,4.1,{fg:'#F4C542',glow:'#F4C542',lit:1.2});cy(tw,.3,12,0,78,0,BRASS());
}
function buildZoneProps(){ /* floor markers for rooms not built yet */
  const mark=(id,x,z,w,d)=>{const m=new THREE.Group();m.position.set(x,.03,z);scene.add(m);const pl=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshBasicMaterial({map:canvasTex(128,128,(q)=>{q.fillStyle='rgba(12,58,44,.08)';q.fillRect(0,0,128,128);q.strokeStyle='rgba(244,197,66,.35)';q.lineWidth=10;for(let i=-128;i<256;i+=44){q.beginPath();q.moveTo(i,0);q.lineTo(i+128,128);q.stroke();}},[Math.round(w/2),Math.round(d/2)]),transparent:true}));pl.rotation.x=-Math.PI/2;m.add(pl);world.zones['mark_'+id]=m;};
  mark('loanoffice',-11.8,-1.6,5.6,8.4);mark('fraudlab',-11.8,-8.4,5.6,4.4);mark('coffee',11.8,6.6,5.6,7.2);mark('community',11.8,.8,5.6,3.6);mark('trust',11.8,-3.6,5.6,4);mark('digital',11.8,-8.4,5.6,4.4);
}
function syncZones(s){
  Object.keys(world.zones).forEach(k=>{if(k.startsWith('mark_'))world.zones[k].visible=!s.built[k.slice(5)]&&!!(titleOff());else if(k!=='teller1')world.zones[k].visible=!!s.built[k];});
  const tellers=teller_count(s);world.windows.forEach((w,i)=>{if(w.lamp)w.lamp.visible=i<tellers;});
}
const titleOff=()=>true;
const teller_count=s=>1+['teller2','teller3','teller4'].filter(k=>s.built[k]).length;
function syncPiles(s){const f=clamp(s.cash/1200000,0,1),n=Math.ceil(f*world.piles.length);world.piles.forEach((b,i)=>b.visible=i<n);}
function updateWorld(dt,t,day){
  world.cars.forEach(c=>{c.m.position.x+=c.s*dt;if(c.m.position.x>130)c.m.position.x=-130;if(c.m.position.x<-130)c.m.position.x=130;});
  /* vault door swings open at the start of business */
  const want=day?1:0;world.vaultOpen+=(want-world.vaultOpen)*Math.min(1,dt*1.6);
  world.vaultDoor.rotation.y=world.vaultOpen*1.75;world.vaultWheel.rotation.z=world.vaultOpen*7;
  COLL.forEach(c=>{if(c.zone==='vaultshut')c.off=world.vaultOpen>.6;});
  world.anim.forEach(a=>{if(a.k==='pulse')a.m.emissiveIntensity=.6+Math.sin(t*3)*.3;});
}
