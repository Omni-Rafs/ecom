// AURA store UI — products, cart, tilt, magnetic buttons, reveals, counters
// Depends on assets.js (AURA_IMG) being loaded first.

// ============ DATA ============
const PRODUCTS = [
  {id:1, name:"Flux Pro Headphones", sub:"Adaptive ANC \u00b7 60h battery", price:329, was:399, tag:"Best seller", rating:"4.9", reviews:"3.2k", img:AURA_IMG.headphones},
  {id:2, name:"Pulse Titanium Watch", sub:"Health AI \u00b7 7-day battery", price:449, was:null, tag:"New", rating:"4.8", reviews:"1.9k", img:AURA_IMG.watch},
  {id:3, name:"Orbit Smart Speaker", sub:"360\u00b0 sound \u00b7 room tuning", price:199, was:249, tag:"-20%", rating:"4.7", reviews:"4.4k", img:AURA_IMG.speaker},
  {id:4, name:"Nano Buds X", sub:"Spatial audio \u00b7 ANC", price:179, was:null, tag:"Hot", rating:"4.9", reviews:"2.6k", img:AURA_IMG.earbuds},
];
const $ = s => document.querySelector(s);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ============ PRELOADER ============
// Hero intro animations are gated behind body.loaded so they play *after*
// the preloader lifts instead of finishing behind it.
function siteReady(){
  $('#preloader').classList.add('done');
  document.body.classList.add('loaded');
}
window.addEventListener('load', () => setTimeout(siteReady, 700));
setTimeout(siteReady, 3200); // safety

// ============ MARQUEE ============
// Duplicate the track content so the -50% translate loop is seamless
// (a single copy left a visible gap every cycle).
const marqueeTrack = $('#marqueeTrack');
marqueeTrack.innerHTML += marqueeTrack.innerHTML;

// ============ PRODUCT GRID ============
$('#productGrid').innerHTML = PRODUCTS.map(p => `
  <div class="card reveal tilt" data-id="${p.id}">
    <div class="card-media"><span class="card-tag">${p.tag}</span><img src="${p.img}" alt="${p.name}" loading="lazy"></div>
    <div class="card-body">
      <div class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;<em>${p.rating} (${p.reviews})</em></div>
      <h3>${p.name}</h3>
      <div class="card-sub">${p.sub}</div>
      <div class="card-row">
        <div class="price">$${p.price}${p.was ? `<small>$${p.was}</small>` : ''}</div>
        <button class="add-btn" data-add="${p.id}">Add to cart</button>
      </div>
    </div>
  </div>`).join('');

// ============ CART ============
const cart = new Map();
const fmt = n => '$' + n.toLocaleString();
let renderedIds = [];
function renderCart({bump = true} = {}){
  const items = [...cart.values()];
  const count = items.reduce((a,i)=>a+i.qty,0);
  const total = items.reduce((a,i)=>a+i.qty*i.p.price,0);
  const cc = $('#cartCount');
  cc.textContent = count;
  if(bump){ cc.classList.add('bump'); setTimeout(()=>cc.classList.remove('bump'), 300); }
  $('#cartTotal').textContent = fmt(total);
  const ids = items.map(i=>i.p.id);
  const sameRows = ids.length === renderedIds.length && ids.every((id,i)=>id===renderedIds[i]);
  if(sameRows && ids.length){
    // Same line items — update quantities in place so images don't
    // flicker and the slide-in animation doesn't replay on every +/-.
    const rows = $('#drawerItems').querySelectorAll('.ci .qty > b');
    items.forEach(({qty}, i) => rows[i].textContent = qty);
  } else {
    $('#drawerItems').innerHTML = items.length ? items.map(({p,qty}) => `
      <div class="ci">
        <img src="${p.img}" alt="">
        <div class="ci-info"><b>${p.name}</b><span>${fmt(p.price)}</span></div>
        <div class="qty">
          <button data-dec="${p.id}" aria-label="Decrease">&minus;</button><b>${qty}</b><button data-inc="${p.id}" aria-label="Increase">+</button>
        </div>
      </div>`).join('')
      : '<div class="empty-cart"><i>&#128717;</i>Your cart is empty.<br>Beautiful gadgets await below.</div>';
  }
  renderedIds = ids;
}
renderCart({bump:false});
function addToCart(id, sourceEl){
  const p = PRODUCTS.find(x=>x.id===+id);
  if(!p) return;
  const cur = cart.get(p.id) || {p, qty:0};
  cur.qty++; cart.set(p.id, cur);
  renderCart();
  toast(`${p.name} added to cart`);
  // button success micro-interaction
  if(sourceEl && sourceEl.classList.contains('add-btn') && !sourceEl.classList.contains('added')){
    const label = sourceEl.textContent;
    sourceEl.classList.add('added');
    sourceEl.innerHTML = '&#10003; Added';
    setTimeout(()=>{ sourceEl.classList.remove('added'); sourceEl.textContent = label; }, 1200);
  }
  // fly-to-cart: X and Y animate on separate elements with different
  // easings, so the thumbnail travels along a natural arc.
  if(!reduceMotion && sourceEl){
    const card = sourceEl.closest('.card');
    const imgEl = card ? card.querySelector('img') : null;
    const from = (imgEl||sourceEl).getBoundingClientRect();
    const to = $('#cartOpen').getBoundingClientRect();
    const x0 = from.left + from.width/2 - 26, y0 = from.top + from.height/2 - 26;
    const dx = (to.left + to.width/2 - 26) - x0;
    const dy = (to.top + to.height/2 - 26) - y0;
    const fly = document.createElement('div');
    fly.className = 'fly';
    fly.style.left = x0 + 'px'; fly.style.top = y0 + 'px';
    const img = document.createElement('img');
    img.src = p.img;
    fly.appendChild(img);
    document.body.appendChild(fly);
    const dur = 750;
    fly.animate(
      [{transform:'translateX(0)'}, {transform:`translateX(${dx}px)`}],
      {duration:dur, easing:'cubic-bezier(.3,.75,.6,1)', fill:'forwards'});
    img.animate(
      [{transform:'translateY(0) scale(1) rotate(0deg)', opacity:1},
       {transform:`translateY(${dy}px) scale(.32) rotate(18deg)`, opacity:.25}],
      {duration:dur, easing:'cubic-bezier(.45,-0.25,.75,.45)', fill:'forwards'})
      .onfinish = () => fly.remove();
  }
}
document.addEventListener('click', e => {
  const add = e.target.closest('[data-add]');
  if(add){ addToCart(add.dataset.add, add); return; }
  const inc = e.target.closest('[data-inc]');
  if(inc){ const c = cart.get(+inc.dataset.inc); if(c){c.qty++; renderCart();} return; }
  const dec = e.target.closest('[data-dec]');
  if(dec){ const c = cart.get(+dec.dataset.dec); if(c){ c.qty--; if(c.qty<=0) cart.delete(c.p.id); renderCart(); } return; }
});
const drawer = $('#drawer'), overlay = $('#overlay');
const openCart = () => {
  drawer.classList.add('open'); overlay.classList.add('open');
  document.body.style.overflow = 'hidden'; // lock page scroll behind drawer
  $('#cartClose').focus();
};
const closeCart = () => {
  if(!drawer.classList.contains('open')) return;
  drawer.classList.remove('open'); overlay.classList.remove('open');
  document.body.style.overflow = '';
  $('#cartOpen').focus();
};
$('#cartOpen').addEventListener('click', openCart);
$('#cartClose').addEventListener('click', closeCart);
overlay.addEventListener('click', closeCart);
document.addEventListener('keydown', e => { if(e.key==='Escape') closeCart(); });
$('#checkoutBtn').addEventListener('click', () => toast('Demo store \u2014 checkout coming soon \u2728'));

// ============ TOAST ============
let toastTimer;
function toast(msg){
  $('#toastMsg').textContent = msg;
  const t = $('#toast');
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>t.classList.remove('show'), 2200);
}

// ============ NEWSLETTER ============
$('#nlForm').addEventListener('submit', e => { e.preventDefault(); toast('You\u2019re on the list. Welcome to orbit \ud83d\udef0'); e.target.reset(); });

// ============ HEADER + SCROLL PROGRESS + HERO PARALLAX ============
const progress = $('#scrollProgress');
const heroInner = $('.hero-inner');
const scrollHint = $('.scroll-hint');
function onScroll(){
  $('#header').classList.toggle('scrolled', scrollY > 24);
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? scrollY/max : 0})`;
  if(!reduceMotion && scrollY < innerHeight){
    // hero content drifts up + fades as you scroll away — the 3D scene
    // stays put, creating gentle depth separation.
    const k = scrollY / innerHeight;
    heroInner.style.transform = `translateY(${scrollY * .22}px)`;
    heroInner.style.opacity = Math.max(1 - k*1.5, 0);
    scrollHint.style.opacity = Math.max(1 - k*4, 0);
  }
}
window.addEventListener('scroll', onScroll, {passive:true});
onScroll();

// ============ SCROLL REVEAL ============
// Grid children get a stagger delay; once the animation finishes the
// reveal classes are dropped so hover motion runs on clean base styles.
document.querySelectorAll('.grid, .feat-grid, .quotes').forEach(grid => {
  [...grid.children].forEach((el, i) => el.style.setProperty('--rd', `${Math.min(i*90, 450)}ms`));
});
const io = new IntersectionObserver(es => es.forEach(en => {
  if(!en.isIntersecting) return;
  const el = en.target;
  io.unobserve(el);
  el.classList.add('visible');
  const cleanup = () => { el.classList.remove('reveal','visible'); el.style.removeProperty('--rd'); };
  if(reduceMotion) cleanup();
  else el.addEventListener('animationend', cleanup, {once:true});
}), {threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

// ============ COUNTERS ============
const cio = new IntersectionObserver(es => es.forEach(en => {
  if(!en.isIntersecting) return; cio.unobserve(en.target);
  const el = en.target, target = parseFloat(el.dataset.count), dec = +(el.dataset.decimal||0), suf = el.dataset.suffix||'';
  const t0 = performance.now(), dur = reduceMotion ? 1 : 1400;
  (function tick(now){
    const k = Math.min((now-t0)/dur, 1), ease = 1-Math.pow(1-k,3);
    el.textContent = (target*ease).toFixed(dec) + suf;
    if(k<1) requestAnimationFrame(tick);
  })(t0);
}), {threshold:.5});
document.querySelectorAll('[data-count]').forEach(el=>cio.observe(el));

// ============ TILT CARDS ============
if(!reduceMotion && matchMedia('(hover:hover)').matches){
  // rAF-lerped tilt: the transform eases toward the cursor every frame
  // instead of jumping (or fighting a CSS transition), and the same
  // cursor position drives the specular sheen on the product image.
  document.querySelectorAll('.tilt').forEach(card => {
    let tx = 0, ty = 0, cx = 0, cy = 0, lift = 0, tLift = 0, raf = null;
    function tick(){
      cx += (tx-cx)*.14; cy += (ty-cy)*.14; lift += (tLift-lift)*.14;
      card.style.transform = `perspective(900px) rotateY(${cx.toFixed(3)}deg) rotateX(${cy.toFixed(3)}deg) translateY(${(-4*lift).toFixed(2)}px)`;
      if(Math.abs(tx-cx)+Math.abs(ty-cy)+Math.abs(tLift-lift) > .01) raf = requestAnimationFrame(tick);
      else { raf = null; if(!tLift) card.style.transform = ''; }
    }
    const start = () => { if(!raf) raf = requestAnimationFrame(tick); };
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX-r.left)/r.width - .5, y = (e.clientY-r.top)/r.height - .5;
      tx = x*8; ty = -y*8; tLift = 1;
      card.style.setProperty('--mx', `${((x+.5)*100).toFixed(1)}%`);
      card.style.setProperty('--my', `${((y+.5)*100).toFixed(1)}%`);
      start();
    });
    card.addEventListener('mouseleave', () => { tx = ty = tLift = 0; start(); });
  });
  // magnetic buttons
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      btn.style.transform = `translate(${(e.clientX-r.left-r.width/2)*.18}px, ${(e.clientY-r.top-r.height/2)*.28}px)`;
    });
    btn.addEventListener('mouseleave', () => btn.style.transform = '');
  });
  // custom cursor
  const dot = $('#cDot'), ring = $('#cRing');
  let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my;
  addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; dot.style.left=mx+'px'; dot.style.top=my+'px'; });
  (function loop(){ rx+=(mx-rx)*.16; ry+=(my-ry)*.16; ring.style.left=rx+'px'; ring.style.top=ry+'px'; requestAnimationFrame(loop); })();
  document.querySelectorAll('a,button,.card').forEach(el => {
    el.addEventListener('mouseenter', ()=>ring.classList.add('hovering'));
    el.addEventListener('mouseleave', ()=>ring.classList.remove('hovering'));
  });
}

// ============ PARALLAX SHOWCASE IMG ============
if(!reduceMotion){
  const pi = $('#parallaxImg');
  addEventListener('scroll', () => {
    const r = pi.getBoundingClientRect();
    if(r.bottom>0 && r.top<innerHeight){
      const k = (r.top+r.height/2-innerHeight/2)/innerHeight;
      pi.style.transform = `scale(1.12) translateY(${k*36}px)`;
    }
  }, {passive:true});
}

// Showcase parallax image source
document.getElementById('parallaxImg').src = AURA_IMG.headphones;
