// ============ THREE.JS HERO (with 2D canvas fallback) ============
const canvas = document.getElementById('scene');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function fallback2D(){
  const ctx = canvas.getContext('2d');
  let w, h, pts = [];
  const N = 110;
  function size(){ w = canvas.width = canvas.clientWidth * devicePixelRatio; h = canvas.height = canvas.clientHeight * devicePixelRatio; }
  size(); addEventListener('resize', size);
  for(let i=0;i<N;i++) pts.push({x:Math.random(), y:Math.random(), vx:(Math.random()-.5)*.0006, vy:(Math.random()-.5)*.0006, r:Math.random()*1.8+.6});
  let mx=.5, my=.42;
  addEventListener('mousemove', e=>{ mx=e.clientX/innerWidth; my=e.clientY/innerHeight; });
  function frame(){
    ctx.clearRect(0,0,w,h);
    // ambient glow follows mouse
    const g = ctx.createRadialGradient(mx*w, my*h, 0, mx*w, my*h, Math.max(w,h)*.5);
    g.addColorStop(0,'rgba(94,159,232,.14)'); g.addColorStop(.5,'rgba(143,123,239,.05)'); g.addColorStop(1,'transparent');
    ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    for(const p of pts){
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0||p.x>1)p.vx*=-1; if(p.y<0||p.y>1)p.vy*=-1;
    }
    ctx.strokeStyle='rgba(94,159,232,.10)'; ctx.lineWidth=1;
    for(let i=0;i<N;i++) for(let j=i+1;j<N;j++){
      const a=pts[i],b=pts[j],dx=(a.x-b.x)*w,dy=(a.y-b.y)*h,d=dx*dx+dy*dy;
      if(d<(w*.09)**2){ ctx.beginPath(); ctx.moveTo(a.x*w,a.y*h); ctx.lineTo(b.x*w,b.y*h); ctx.stroke(); }
    }
    for(const p of pts){
      ctx.beginPath(); ctx.arc(p.x*w, p.y*h, p.r*devicePixelRatio, 0, 7);
      ctx.fillStyle='rgba(158,197,242,.75)'; ctx.fill();
    }
    if(!reduceMotion) requestAnimationFrame(frame);
  }
  frame();
}

async function initThree(){
  let THREE;
  try { THREE = await import('https://unpkg.com/three@0.161.0/build/three.module.js'); }
  catch(_) {
    try { THREE = await import('https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js'); }
    catch(_2) { fallback2D(); return; }
  }
  const renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 2, .1, 100);
  camera.position.z = 8;

  // Starfield of glowing particles
  const N = 2600, pos = new Float32Array(N*3), col = new Float32Array(N*3);
  const cA = new THREE.Color('#5E9FE8'), cB = new THREE.Color('#8F7BEF'), tmp = new THREE.Color();
  for(let i=0;i<N;i++){
    const r = 4 + Math.random()*9, th = Math.random()*Math.PI*2, ph = Math.acos(2*Math.random()-1);
    pos[i*3]   = r*Math.sin(ph)*Math.cos(th);
    pos[i*3+1] = r*Math.sin(ph)*Math.sin(th)*.6;
    pos[i*3+2] = r*Math.cos(ph) - 4;
    tmp.lerpColors(cA, cB, Math.random());
    col[i*3]=tmp.r; col[i*3+1]=tmp.g; col[i*3+2]=tmp.b;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
  geo.setAttribute('color', new THREE.BufferAttribute(col,3));
  const stars = new THREE.Points(geo, new THREE.PointsMaterial({size:.05, vertexColors:true, transparent:true, opacity:.85, depthWrite:false, blending:THREE.AdditiveBlending}));
  scene.add(stars);

  // Wireframe torus knot centerpiece
  const knot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1.7, .42, 180, 24),
    new THREE.MeshBasicMaterial({color:0x5E9FE8, wireframe:true, transparent:true, opacity:.16})
  );
  knot.position.set(0, .2, 0);
  scene.add(knot);
  const knot2 = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.6, 1),
    new THREE.MeshBasicMaterial({color:0x8F7BEF, wireframe:true, transparent:true, opacity:.07})
  );
  scene.add(knot2);

  let mx=0, my=0, scrollK=0;
  addEventListener('mousemove', e => { mx = (e.clientX/innerWidth-.5)*2; my = (e.clientY/innerHeight-.5)*2; });
  addEventListener('scroll', () => { scrollK = Math.min(scrollY/innerHeight, 1); }, {passive:true});
  function resize(){
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w/h; camera.updateProjectionMatrix();
  }
  resize(); addEventListener('resize', resize);

  // Only render while the hero is on screen and the tab is visible —
  // no wasted GPU work while the user reads the rest of the page.
  let heroVisible = true, running = false;
  const clock = new THREE.Clock();
  function frame(){
    if(!heroVisible || document.hidden){ running = false; return; }
    const t = clock.getElapsedTime();
    knot.rotation.x = t*.18; knot.rotation.y = t*.24;
    const breathe = 1 + Math.sin(t*.8)*.035; // gentle organic pulse
    knot.scale.setScalar(breathe);
    knot2.rotation.y = -t*.06; knot2.rotation.z = t*.04;
    stars.rotation.y = t*.02 + mx*.12;
    stars.rotation.x = my*.08;
    // mouse parallax + slight scroll dolly for depth as the hero exits
    camera.position.x += (mx*.7 - camera.position.x)*.04;
    camera.position.y += ((-my*.5 - scrollK*1.6) - camera.position.y)*.06;
    camera.position.z = 8 + scrollK*1.2;
    camera.lookAt(0,0,0);
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  function play(){ if(!running){ running = true; requestAnimationFrame(frame); } }
  new IntersectionObserver(es => { heroVisible = es[0].isIntersecting; if(heroVisible) play(); }, {threshold:0})
    .observe(canvas);
  document.addEventListener('visibilitychange', () => { if(!document.hidden) play(); });
  play();
}
if(reduceMotion){ fallback2D(); } else { initThree(); }
