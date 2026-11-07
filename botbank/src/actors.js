/* =====================================================================
   BOTBANK · bots: rigs, the player, customers, staff, the camera
   ===================================================================== */
const GLTF={},MB={};
const G={cust:[],q:{teller:[],newacct:[],loan:[]},win:[],desk:{newacct:{busy:null,t:0},loan:{busy:null,t:0}},alerts:[],staffRigs:new Map(),carry:false,target:null,shout:0,run:null};
const P={pos:V(0,0,8.4),ry:Math.PI,vel:V(),rig:null,bob:0,gear:[]};
function setupMaterials(){
  MB.face=new THREE.MeshStandardMaterial({color:'#05070D',roughness:.18,metalness:.1});
  MB.coin=new THREE.MeshStandardMaterial({color:'#FBBF24',roughness:.35,metalness:.45,emissive:'#F59E0B',emissiveIntensity:.3});
  MB.heroBody=new THREE.MeshStandardMaterial({color:'#F8FAFC',roughness:.24,metalness:.05});
  MB.mascot=new THREE.MeshStandardMaterial({color:'#F8FAFC',roughness:.24,metalness:.05});
  MB.eye={g:new THREE.MeshStandardMaterial({color:'#16A34A',emissive:'#22C55E',emissiveIntensity:1,roughness:.6}),y:new THREE.MeshStandardMaterial({color:'#D97706',emissive:'#F59E0B',emissiveIntensity:1,roughness:.6}),r:new THREE.MeshStandardMaterial({color:'#B91C1C',emissive:'#EF4444',emissiveIntensity:1.1,roughness:.6})};
  MB.tints=['#BFDBFE','#FBCFE8','#FED7AA','#FDE68A','#BBF7D0','#DDD6FE','#F8FAFC','#FCA5A5','#A5F3FC'].map(c=>new THREE.MeshStandardMaterial({color:c,roughness:.3,metalness:.08}));
  MB.staff=new THREE.MeshStandardMaterial({color:'#0E5A44',roughness:.3,metalness:.15});
}
function parseGLB(b64){const bin=Uint8Array.from(atob(b64),c=>c.charCodeAt(0)).buffer;return new Promise((res,rej)=>new THREE.GLTFLoader().parse(bin,'',res,rej));}
function emoteClips(){const out=[],J=MB_ASSETS.joints.map(n=>THREE.PropertyBinding.sanitizeNodeName(n));for(const name in MB_ASSETS.clips){const c=MB_ASSETS.clips[name],tr=[];c.tracks.forEach(t=>{const nm=J[t.j];if(t.p==='r')tr.push(new THREE.QuaternionKeyframeTrack(nm+'.quaternion',t.k,t.v));else if(t.p==='t')tr.push(new THREE.VectorKeyframeTrack(nm+'.position',t.k,t.v));else tr.push(new THREE.VectorKeyframeTrack(nm+'.scale',t.k,t.v));});out.push(new THREE.AnimationClip(name,c.dur,tr));}return out;}
const RIGS=[];
function makeRig(gltf,body,height,eye){
  const model=THREE.SkeletonUtils.clone(gltf.scene),eyes=[];
  model.traverse(o=>{if(!o.isMesh)return;o.frustumCulled=false;const n=(o.material&&o.material.name)||'';if(n==='Silver')o.material=body;else if(n==='eyes'){o.material=MB.eye[eye||'g'];eyes.push(o);}else if(n==='Face'||n==='Hat')o.material=MB.face;else if(n==='Coin')o.material=MB.coin;else if(!n)o.material=body;});
  const root=new THREE.Group();root.add(model);const mixer=new THREE.AnimationMixer(model),acts={};gltf.animations.forEach(c=>acts[c.name]=mixer.clipAction(c));acts.Idle.play();mixer.update(Math.random()*1.5);
  const box=new THREE.Box3().setFromObject(model),h=box.max.y-box.min.y,s=height/h;model.position.y=-box.min.y;root.scale.setScalar(s);
  const rig={root,model,mixer,acts,eyes,cur:'Idle',bones:{},body};model.traverse(o=>{if(o.isBone)rig.bones[o.name]=o;});
  mixer.addEventListener('finished',()=>rigPlay(rig,'Idle'));RIGS.push(rig);
  const sh=blob(4.6);sh.position.y=.04-model.position.y*0;root.add(sh);return rig;
}
function rigPlay(rig,name,once){const a=rig.acts[name];if(!a||(rig.cur===name&&!once))return;const prev=rig.acts[rig.cur];a.reset();a.setLoop(once?THREE.LoopOnce:THREE.LoopRepeat,once?1:Infinity);a.clampWhenFinished=false;a.play();if(prev&&prev!==a)prev.crossFadeTo(a,.2,false);rig.cur=name;}
function rigEye(rig,e){rig.eyes.forEach(m=>m.material=MB.eye[e]);}
let blobT=null;function blob(sz){if(!blobT)blobT=canvasTex(64,64,(g)=>{const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(0,0,0,.42)');r.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r;g.fillRect(0,0,64,64);});const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:blobT,transparent:true,depthWrite:false}));m.rotation.x=-Math.PI/2;m.scale.set(sz,sz,1);m.renderOrder=1;return m;}
const ICONS={};function iconTex(ch){if(ICONS[ch])return ICONS[ch];return ICONS[ch]=canvasTex(96,96,(g)=>{g.fillStyle='rgba(6,26,22,.92)';g.beginPath();g.arc(48,48,44,0,7);g.fill();g.strokeStyle='#D8B25A';g.lineWidth=3;g.stroke();g.font='50px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle='#fff';g.fillText(ch,48,53);});}
function bubble(){const s=new THREE.Sprite(new THREE.SpriteMaterial({depthTest:false,transparent:true}));s.scale.set(.62,.62,1);s.renderOrder=9;s.visible=false;scene.add(s);return s;}
function setBubble(s,ch){if(!ch){s.visible=false;s.userData.c=null;return;}s.visible=true;if(s.userData.c!==ch){s.userData.c=ch;s.material.map=iconTex(ch);s.material.needsUpdate=true;}}

/* ----- player ----- */
const keys={};
function buildPlayer(){
  P.rig=makeRig(GLTF.hero,MB.heroBody,1.72);scene.add(P.rig.root);P.rig.model.traverse(o=>{if(o.isMesh)o.castShadow=Q.t>0;});
  /* cash bag, shown while carrying */
  const bag=new THREE.Group();const b=new THREE.Mesh(SPH,mat('#E8DCC0',{roughness:.9}));b.scale.set(.32,.36,.3);bag.add(b);const t=new THREE.Mesh(SPH,mat('#C9B68C'));t.scale.set(.1,.08,.1);t.position.y=.36;bag.add(t);const d=new THREE.Mesh(new THREE.CircleGeometry(.16,24),new THREE.MeshBasicMaterial({map:signTex('$',{w:64,h:64,fg:'#0C7A4B',fs:54})}));d.position.set(0,0,.31);bag.add(d);bag.position.set(0,1.0,-.36);bag.visible=false;scene.add(bag);P.bag=bag;
}
function dressPlayer(){const m=S.me,b=P.rig.bones,sp2=b.Spine2,hd=b.Head;MB.heroBody.color.set(m.suit||'#F8FAFC');MB.heroBody.metalness=m.suit==='#F4C542'?.8:.06;MB.heroBody.roughness=m.suit==='#F4C542'?.22:.26;
  P.gear.forEach(g=>g.parent&&g.parent.remove(g));P.gear=[];
  /* every president wears a tie */
  const tc=m.tie||'#0C3A2C',tie=new THREE.Group();const k=new THREE.Mesh(SPH,mat(tc,{roughness:.5}));k.scale.set(.15,.12,.08);tie.add(k);const bl=new THREE.Mesh(new THREE.ConeGeometry(.22,.95,4),mat(tc,{roughness:.5}));bl.rotation.x=Math.PI;bl.rotation.y=Math.PI/4;bl.scale.z=.3;bl.position.y=-.5;tie.add(bl);tie.position.set(0,.35,1.12);tie.rotation.x=-.12;sp2&&sp2.add(tie);P.gear.push(tie);
  if(m.hat==='fedora'&&hd){const h=new THREE.Group();const br=new THREE.Mesh(CYL,mat('#1F2B28',{roughness:.6}));br.scale.set(1.5,.06,1.5);h.add(br);const cr=new THREE.Mesh(CYL,mat('#1F2B28',{roughness:.6}));cr.scale.set(.9,.6,.9);cr.position.y=.32;h.add(cr);const bd=new THREE.Mesh(CYL,mat('#39E75F',{emissive:'#39E75F',emissiveIntensity:.4}));bd.scale.set(.92,.14,.92);bd.position.y=.12;h.add(bd);h.position.set(0,1.45,0);hd.add(h);P.gear.push(h);}
  if(m.hat==='crown'&&hd){const c=new THREE.Group(),ma=mat('#F4C542',{metalness:1,roughness:.25,emissive:'#B98A10',emissiveIntensity:.3});const r=new THREE.Mesh(CYL,ma);r.scale.set(.8,.36,.8);c.add(r);for(let i=0;i<6;i++){const a=i/6*6.283,s=new THREE.Mesh(new THREE.ConeGeometry(.2,.5,5),ma);s.position.set(Math.cos(a)*.74,.36,Math.sin(a)*.74);c.add(s);}c.position.set(0,1.42,0);hd.add(c);P.gear.push(c);}
}
function initInput(){
  addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;keys[e.code]=true;if(e.code==='KeyE'||e.code==='Enter'){if(!modalOpen()&&!titleOn())doAction();}if(e.code==='Space'&&!modalOpen()&&!titleOn()){e.preventDefault();togglePause();}if(!modalOpen()&&!titleOn()){if(e.code==='Digit1')setSpeed(1);if(e.code==='Digit2')setSpeed(2);if(e.code==='Digit3')setSpeed(3);if(e.code==='KeyQ')camS.yaw-=.35;if(e.code==='KeyR')camS.yaw+=.35;}});
  addEventListener('keyup',e=>keys[e.code]=false);
  const cv=$('#gl');let down=null;
  cv.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY,yaw:camS.yaw,t:performance.now(),b:e.button};cv.setPointerCapture&&cv.setPointerCapture(e.pointerId);});
  cv.addEventListener('pointermove',e=>{if(!down)return;const dx=e.clientX-down.x;if(Math.abs(dx)>10&&!(TOUCH))camS.yaw=clamp(down.yaw-dx*.006,-1.1,1.1);if(TOUCH&&Math.abs(dx)>14)camS.yaw=clamp(down.yaw-dx*.006,-1.1,1.1);});
  cv.addEventListener('pointerup',e=>{if(down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)<9&&performance.now()-down.t<400)tapWalk(e.clientX,e.clientY);down=null;});
  addEventListener('wheel',e=>{if(modalOpen()||titleOn())return;camS.dist=clamp(camS.dist+e.deltaY*.012,9,34);},{passive:true});
  /* touch stick */
  const st=$('#stick'),nub=$('#stick i');let id=null;const mv=e=>{const r=st.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2,L=Math.min(46,Math.hypot(x,y)),a=Math.atan2(y,x);joy.x=Math.cos(a)*L/46;joy.y=Math.sin(a)*L/46;nub.style.transform=`translate(${joy.x*40}px,${joy.y*40}px)`;};
  st.addEventListener('pointerdown',e=>{id=e.pointerId;st.setPointerCapture(id);mv(e);});st.addEventListener('pointermove',e=>{if(e.pointerId===id)mv(e);});const end=()=>{id=null;joy.x=joy.y=0;nub.style.transform='';};st.addEventListener('pointerup',end);st.addEventListener('pointercancel',end);
}
const joy={x:0,y:0};
const ray=new THREE.Raycaster(),groundP=new THREE.Plane(V(0,1,0),0);
function tapWalk(cx,cy){if(modalOpen()||titleOn())return;const n=new THREE.Vector2(cx/innerWidth*2-1,-(cy/innerHeight)*2+1);ray.setFromCamera(n,camera);const h=V();if(ray.ray.intersectPlane(groundP,h)){G.target=h;floorRing(h);}}
let ringM=null;function floorRing(p){if(!ringM){ringM=new THREE.Mesh(new THREE.RingGeometry(.28,.38,32),new THREE.MeshBasicMaterial({color:'#39E75F',transparent:true}));ringM.rotation.x=-Math.PI/2;scene.add(ringM);}ringM.position.set(p.x,.05+floorY(),p.z);ringM.material.opacity=1;}
function collide(p,r,fl){fl=fl||0;for(const c of COLL){if(c.off||(c.fl||0)!==fl)continue;if(c.zone&&c.zone!=='vaultshut'&&!S.built[c.zone])continue;const nx=clamp(p.x,c.x0,c.x1),nz=clamp(p.z,c.z0,c.z1),dx=p.x-nx,dz=p.z-nz,d=dx*dx+dz*dz;if(d<r*r){if(d>1e-6){const L=Math.sqrt(d);p.x=nx+dx/L*r;p.z=nz+dz/L*r;}else{const a=[p.x-c.x0,c.x1-p.x,p.z-c.z0,c.z1-p.z],m=Math.min(...a);if(m===a[0])p.x=c.x0-r;else if(m===a[1])p.x=c.x1+r;else if(m===a[2])p.z=c.z0-r;else p.z=c.z1+r;}}}}
function updatePlayer(dt,t){
  let ix=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0)+joy.x,iz=(keys.KeyS||keys.ArrowDown?1:0)-(keys.KeyW||keys.ArrowUp?1:0)+joy.y;
  const c=Math.cos(camS.yaw),s=Math.sin(camS.yaw);let dx=ix*c+iz*s,dz=-ix*s+iz*c;
  if(Math.hypot(ix,iz)>.05)G.target=null;
  if(G.target){const tx=G.target.x-P.pos.x,tz=G.target.z-P.pos.z,L=Math.hypot(tx,tz);if(L<.25)G.target=null;else{dx=tx/L;dz=tz/L;}}
  const L=Math.hypot(dx,dz),moving=L>.05,sp=(keys.ShiftLeft||keys.ShiftRight?10:7)*(G.carry?.82:1);
  const tv=V(moving?dx/Math.max(1,L)*sp:0,0,moving?dz/Math.max(1,L)*sp:0);P.vel.lerp(tv,1-Math.exp(-12*dt));
  if(modalOpen()||CINE.on){P.vel.set(0,0,0);}
  P.pos.addScaledVector(P.vel,dt);P.pos.x=clamp(P.pos.x,-60,60);P.pos.z=clamp(P.pos.z,-17,17.6);if(G.floor){P.pos.x=clamp(P.pos.x,-BW+.7,BW-.7);P.pos.z=clamp(P.pos.z,-BD+.7,BD-.9);}collide(P.pos,.46,G.floor||0);
  const spd=P.vel.length();if(spd>.3){P.ry+=angDiff(Math.atan2(P.vel.x,P.vel.z),P.ry)*Math.min(1,dt*12);}
  P.bob+=dt*spd*2.1;const r=P.rig.root;r.position.set(P.pos.x,floorY()+Math.abs(Math.sin(P.bob))*.09*Math.min(1,spd/3),P.pos.z);r.rotation.set(Math.min(.2,spd*.022),P.ry,0,'YXZ');P.rig.mixer.update(dt);
  P.bag.visible=G.carry;if(G.carry){P.bag.position.set(P.pos.x-Math.sin(P.ry)*.62,1.05+r.position.y,P.pos.z-Math.cos(P.ry)*.62);}
  if(ringM&&ringM.material.opacity>0)ringM.material.opacity-=dt*1.5;
}
const angDiff=(a,b)=>((a-b+Math.PI*3)%(Math.PI*2))-Math.PI;

/* ----- camera ----- */
const camS={yaw:0,dist:18.5,pitch:.74,street:false,pos:V(),look:V(0,1,4),title:true};
function updateCamera(dt,t){
  if(CINE.on){updateCine(dt);return;}
  if(camS.street){const o=Math.sin(t*.12)*.3,top=GROUND+(GFX.nFloors||1)*STOREY,D=34+top*1.05,p=V(Math.sin(o)*(D+6)-5,3.4,17+Math.cos(o)*D);camera.position.lerp(p,1-Math.exp(-2.4*dt));camS.look.lerp(V(0,top*.62+4,BD),1-Math.exp(-3*dt));camera.lookAt(camS.look);camS.pos.copy(camera.position);world.facade.visible=true;world.walls.west.visible=world.walls.east.visible=true;return;}
  if(camS.title){const a=Math.sin(t*.09)*.22;const p=V(Math.sin(a)*62-10,3.6+Math.sin(t*.13)*.5,30+Math.cos(a)*44);camera.position.lerp(p,1-Math.exp(-1.2*dt));camS.look.lerp(V(0,17,BD),1-Math.exp(-2*dt));camera.lookAt(camS.look);return;}
  const inside=P.pos.z<BD&&Math.abs(P.pos.x)<BW,lookz=clamp(P.pos.z,-9,BD+4),lookx=clamp(P.pos.x,-22,22);
  const d=camS.dist,cp=Math.cos(camS.pitch),sp=Math.sin(camS.pitch);
  const FY=floorY(),want=V(lookx+Math.sin(camS.yaw)*cp*d,sp*d+1+FY,lookz+Math.cos(camS.yaw)*cp*d);
  const k=1-Math.exp(-5*dt);camS.pos.lerp(want,k);camera.position.copy(camS.pos);camS.look.lerp(V(lookx,1+FY,lookz-1.8),k);camera.lookAt(camS.look);
  /* cutaway: drop whatever wall stands between camera and floor */
  const W=world.walls;W.west.visible=camera.position.x>-BW;W.east.visible=camera.position.x<BW;
  world.facade.visible=false;
}

/* ----- customers ----- */
let cid=1;const rigPool=[];
function getRig(){let r=rigPool.pop();if(!r){r=makeRig(GLTF.crowd,MB.tints[0],1.42);r.base=[];r.model.traverse(o=>{if(o.isMesh&&MB.tints.includes(o.material))r.base.push(o);});scene.add(r.root);r.bub=bubble();r.bub2=bubble();wearables(r);}r.root.visible=true;return r;}
function wearables(r){if(Q.t<1)return;const hd=r.bones.Head,sp2=r.bones.Spine2,k=Math.random(),C=pick(['#1F2B28','#7A1F2B','#1E3A8A','#0E5A44','#6B4A2F']);if(k<.22&&hd){const h=new THREE.Group();const br=new THREE.Mesh(CYL,mat(C,{roughness:.6}));br.scale.set(1.4,.06,1.4);h.add(br);const cr=new THREE.Mesh(CYL,mat(C,{roughness:.6}));cr.scale.set(.85,.56,.85);cr.position.y=.3;h.add(cr);h.position.set(0,1.42,0);hd.add(h);}else if(k<.42&&hd){const c=new THREE.Mesh(SPH,mat(C,{roughness:.6}));c.scale.set(1,.5,1);c.position.set(0,1.28,0);hd.add(c);const b=new THREE.Mesh(CYL,mat(C,{roughness:.6}));b.scale.set(.7,.05,.5);b.position.set(0,1.2,.9);hd.add(b);}else if(k<.62&&sp2){const b=new THREE.Mesh(BOX,mat(C,{roughness:.7}));b.scale.set(1.2,1.4,.5);b.position.set(0,.2,-1.15);sp2.add(b);}else if(k<.8&&sp2){const tie=new THREE.Mesh(new THREE.ConeGeometry(.2,.8,4),mat(C,{roughness:.5}));tie.rotation.x=Math.PI;tie.scale.z=.3;tie.position.set(0,-.05,1.1);sp2.add(tie);}}
function tintRig(r,m){r.base.forEach(b=>b.material=m);}
const DOOR=()=>V(0,0,10.4);
function slot(kind,i){if(kind==='teller')return V(0,0,-2.5+i*.94);if(kind==='newacct')return i<4?V(-9.6+i*.9,0,7.5):V(-6.8,0,8.4+(i-4)*.6);if(kind==='loan')return V(-11.5,0,-.3+Math.min(i,5)*.75);return V(0,0,0);}
const ICON={deposit:'💵',withdraw:'🏧',check:'🧾',newacct:'🤝',loan:'📝',run:'😱'};
function spawnCustomer(kind,req){
  if(G.cust.length>=(Q.t>=2?26:18))return null;
  const r=getRig();tintRig(r,pick(MB.tints));rigEye(r,'g');
  const side=Math.random()<.5?-1:1,c={id:cid++,kind,req,rig:r,pos:V(side*rand(6,16),0,14.2),path:[],state:'walk',wait:0,patience:clamp(rand(58,84)*(S.built.coffee?1.4:1),30,140),qi:-1,ry:0,bob:rand(0,6)};
  c.name=pick(NAMES1)+' '+pick(NAMES2);
  c.path.push(V(side*2,0,14.2),DOOR());
  if(kind==='newacct')c.path.push(V(-5.4,0,9.4));
  if(kind==='loan')c.path.push(V(-6,0,9.4),V(-9,0,8.6),V(-9.3,0,3.4));
  r.root.position.copy(c.pos);G.cust.push(c);G.q[kind==='run'?'teller':kind].push(c);c.qk=kind==='run'?'teller':kind;requeue(c.qk);
  setBubble(r.bub,ICON[req&&req.t]||ICON[kind]);return c;
}
function requeue(k){const q=G.q[k];q.forEach((c,i)=>{c.qi=i;c.slotP=slot(k,i);});}
function leaveQueue(c){const q=G.q[c.qk];const i=q.indexOf(c);if(i>=0){q.splice(i,1);requeue(c.qk);}}
function dismiss(c,mood){leaveQueue(c);c.state='leave';const x=c.pos.x<0?-2.4:2.4;c.path=[];
  if(c.pos.z<-1&&Math.abs(c.pos.x)<9)c.path.push(V(x,0,-2.8),V(x,0,7.6));else if(c.pos.x<-8)c.path.push(V(-9.2,0,8.8));
  c.path.push(DOOR(),V(x*.8,0,14.2),V(x>0?26:-26,0,14.2));setBubble(c.rig.bub,mood==='mad'?'😠':mood==='happy'?'😀':null);setBubble(c.rig.bub2,null);c.leaveMood=mood;if(mood==='happy')rigPlay(c.rig,pick(['Wave','Cheer','Clap']),true);}
function freeCust(c){G.cust.splice(G.cust.indexOf(c),1);c.rig.root.visible=false;c.rig.root.position.y=-20;setBubble(c.rig.bub,null);rigPool.push(c.rig);}
function updateCustomers(dt,simDt,t){
  for(const c of G.cust.slice()){
    const r=c.rig;let tgt=c.path[0]||((c.state==='walk'||c.state==='queue')?c.slotP:c.spot);
    let moving=false;
    if(tgt){const dx=tgt.x-c.pos.x,dz=tgt.z-c.pos.z,L=Math.hypot(dx,dz),sp=(c.kind==='run'?5.6:3.5)*Math.max(1,c.state==='leave'&&simDt<=0?1.6:S.speed||1)*(simDt>0||(c.state==='leave'&&!modalOpen())?1:0);
      if(L>.08&&sp>0){const st=Math.min(L,sp*dt);c.pos.x+=dx/L*st;c.pos.z+=dz/L*st;c.ry+=angDiff(Math.atan2(dx,dz),c.ry)*Math.min(1,dt*9);moving=true;c.bob+=dt*9;}
      else if(L<=.08){if(c.path.length){c.path.shift();}else if(c.state==='leave'){freeCust(c);continue;}else if(c.state==='toSpot'){c.state='atSpot';}else if(c.state==='walk'){c.state='queue';}}
    }
    if(c.state==='atSpot'||c.state==='service')c.ry+=angDiff(c.face||Math.PI,c.ry)*Math.min(1,dt*7);
    if(!moving&&c.state==='queue')c.ry+=angDiff(queueFace(c),c.ry)*Math.min(1,dt*6);
    r.root.position.set(c.pos.x,moving?Math.abs(Math.sin(c.bob))*.08:0,c.pos.z);r.root.rotation.set(moving?.1:0,c.ry,0,'YXZ');r.mixer.update(dt);
    r.bub.position.set(c.pos.x,1.95,c.pos.z);r.bub.material.depthTest=!!(camS.street||G.floor);
    /* patience only runs while waiting in line */
    if((c.state==='queue'||c.state==='walk')&&simDt>0){c.wait+=simDt;const f=c.wait/c.patience;if(f>.6&&!c.mad){c.mad=1;setBubble(r.bub,'😤');rigEye(r,'y');}if(f>.85&&c.mad===1){c.mad=2;setBubble(r.bub,'😠');rigEye(r,'r');}
      if(f>=1){gaveUp(c);}}
  }
}
const queueFace=c=>c.qk==='teller'?Math.PI:c.qk==='loan'?Math.PI:-Math.PI/2;

/* ----- staff in the room ----- */
function staffSpot(b,i){if(b.role==='teller'){const x=TELLER_X[i%4];return {x,z:COUNTER_Z-1.25,ry:0};}if(b.role==='rep')return {x:-11.5,z:4.8,ry:0};if(b.role==='loan')return {x:-11.5,z:-4.2,ry:0};if(b.role==='fraud')return {x:-11.5+i*1.1,z:-8.1,ry:Math.PI};if(b.role==='vault')return {x:-3,z:-8.2,ry:0};return {x:9.6,z:-7.2+i,ry:-1.2};}
function syncStaff(){
  const seen=new Set(),count={};
  S.staff.forEach(b=>{seen.add(b.id);let e=G.staffRigs.get(b.id);const i=count[b.role]=(count[b.role]||0)+0;count[b.role]++;
    if(!e){const r=makeRig(GLTF.crowd,MB.staff,1.42);scene.add(r.root);if(r.bones.Spine2){const tie=new THREE.Mesh(new THREE.ConeGeometry(.2,.85,4),mat('#F4C542',{roughness:.4,metalness:.5}));tie.rotation.x=Math.PI;tie.scale.z=.3;tie.position.set(0,-.05,1.1);r.bones.Spine2.add(tie);}const tag=new THREE.Sprite(new THREE.SpriteMaterial({map:iconTex(ROLES[b.role].icon),depthTest:false,transparent:true}));tag.scale.set(.44,.44,1);tag.position.set(0,0,0);tag.renderOrder=8;scene.add(tag);e={r,tag,p:V(),b};G.staffRigs.set(b.id,e);}
    const sp=staffSpot(b,i);e.home=sp;e.p.set(sp.x,0,sp.z);e.r.root.position.copy(e.p);e.r.root.rotation.y=sp.ry;e.tag.position.set(sp.x,1.86,sp.z);});
  for(const [id,e] of G.staffRigs)if(!seen.has(id)){scene.remove(e.r.root);scene.remove(e.tag);G.staffRigs.delete(id);}
}
function updateStaff(dt,t){for(const e of G.staffRigs.values()){e.tag.material.depthTest=!!(camS.street||G.floor);e.r.mixer.update(dt);if(e.b.role==='vault'&&S.phase==='day'&&(S.speed||0)>0){/* walks the corridor behind the counter */const a=(Math.sin(t*.7+e.b.id)+1)/2,x=lerp(-6,6,a);e.r.root.position.set(x,Math.abs(Math.sin(t*6))*.06,COUNTER_Z-2.6);e.r.root.rotation.y=Math.cos(t*.7+e.b.id)>0?Math.PI/2:-Math.PI/2;e.tag.position.set(x,1.86,COUNTER_Z-2.6);}}}
const lerp=(a,b,t)=>a+(b-a)*t;

/* mascot greeter + world pins */
function buildMascot(){const r=makeRig(GLTF.hero,MB.mascot,1.72);scene.add(r.root);r.root.position.set(4.2,0,5.3);r.root.rotation.y=0;world.mascot=r;r.model.traverse(o=>{if(o.isMesh)o.castShadow=Q.t>0;});
  const t=setInterval(()=>{if(document.hidden)return;rigPlay(r,pick(['Wave','Nod','Clap','RightHand','Think']),true);},7000);}
const v3=V();
function project(x,y,z){v3.set(x,y,z).project(camera);return {x:(v3.x+1)/2*innerWidth,y:(1-v3.y)/2*innerHeight,on:v3.z<1};}
