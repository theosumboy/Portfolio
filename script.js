/* ============================================================
   AKSHAT SINHA — PORTFOLIO SCRIPT
   Intro growth-chart sequence + scroll-driven reveals
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);

/* ---------------------------------------------------------------
   0. Respect reduced-motion users: skip straight to content
   --------------------------------------------------------------- */
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------------
   1. Background particles (fixed pinned scene)
   --------------------------------------------------------------- */
function buildParticles(){
  const wrap = document.getElementById('bg-particles');
  const count = window.innerWidth < 700 ? 16 : 34;
  for(let i=0;i<count;i++){
    const p = document.createElement('span');
    const size = 2 + Math.random()*3;
    p.style.width = size+'px';
    p.style.height = size+'px';
    p.style.left = Math.random()*100+'%';
    p.style.top = Math.random()*100+'%';
    p.style.opacity = 0.15 + Math.random()*0.35;
    wrap.appendChild(p);
    gsap.to(p, {
      y: (Math.random()*80+40) * (Math.random()>0.5?1:-1),
      x: (Math.random()*40+10) * (Math.random()>0.5?1:-1),
      duration: 6 + Math.random()*8,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: Math.random()*4
    });
  }
}
buildParticles();

/* ---------------------------------------------------------------
   2. Intro sequence — growth chart building into the reveal
   --------------------------------------------------------------- */
const introEl = document.getElementById('intro');
const skipBtn = document.getElementById('skip-intro');

function finishIntro(){
  introEl.classList.add('intro-done');
  gsap.to(introEl, {
    autoAlpha: 0,
    duration: 0.7,
    ease: 'power2.inOut',
    onComplete(){
      introEl.style.display = 'none';
      revealHero();
    }
  });
}

function revealHero(){
  gsap.to('#hero .reveal-up', {
    opacity: 1,
    y: 0,
    duration: 1.3,
    stagger: 0.2,
    ease: 'power3.out',
    onComplete: runHeroCounters
  });
}

/* Runs the hero KPI count-ups once, right as the hero itself reveals
   (kept separate from the scroll-triggered counters below, since the
   hero is already in the viewport and would otherwise fire silently
   behind the intro overlay). */
function runHeroCounters(){
  document.querySelectorAll('.hero-kpi-num').forEach((el) => {
    const to = parseFloat(el.dataset.countTo);
    const suffix = el.dataset.suffix || '';
    const obj = { v: 0 };
    gsap.to(obj, {
      v: to,
      duration: 1.3,
      ease: 'power2.out',
      onUpdate(){ el.textContent = Math.round(obj.v) + suffix; },
      onComplete(){ el.textContent = (to >= 1000 ? to.toLocaleString() : to) + suffix; }
    });
  });
}

const introKillTargets = '#chart-grid, #chart-baseline, .chart-bar, #chart-area, #chart-trend, #chart-trend-dot, #chart-counter, #chart-counter-label, #chart-pulse, #intro-svg, #intro-text .line, #intro-tagline';

if(prefersReduced){
  introEl.style.display = 'none';
  revealHero();
} else {
  const tl = gsap.timeline({ delay: 0.3 });
  const counterEl = document.getElementById('chart-counter');
  const counterObj = { v: 0 };

  tl
    // ---- GRID + BASELINE: the dashboard sets the scene ----
    .to('#chart-grid', { opacity: 1, duration: 0.6, ease: 'power1.out' })
    .fromTo('#chart-baseline', { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power1.out' }, '-=0.3')

    // ---- BARS RISE: staggered growth, anchored to the baseline ----
    .to('.chart-bar', {
      height: (i, el) => +el.dataset.h,
      y: (i, el) => 620 - el.dataset.h,
      duration: 0.9,
      stagger: 0.12,
      ease: 'power3.out'
    }, '-=0.1')

    // ---- TREND LINE: sweeps across the bar tops ----
    .to('#chart-trend', { attr: { 'stroke-dashoffset': 0 }, duration: 0.9, ease: 'power2.inOut' }, '-=0.25')
    .to('#chart-area', { opacity: 1, duration: 0.6, ease: 'power1.out' }, '-=0.5')
    .to('#chart-trend-dot', { opacity: 1, duration: 0.3, ease: 'power1.out' }, '-=0.2')

    // ---- COUNTER: the payoff number ticks up live ----
    .to('#chart-counter', { opacity: 1, duration: 0.3 }, '-=0.1')
    .to('#chart-counter-label', { opacity: 1, duration: 0.3 }, '<')
    .to(counterObj, {
      v: 1000,
      duration: 1.1,
      ease: 'power2.out',
      onUpdate(){ counterEl.textContent = Math.round(counterObj.v) + '%'; }
    }, '-=0.05')
    .call(() => { counterEl.textContent = '1,000%+'; })

    // ---- PULSE: a soft glow lands on the peak (kept tight so it never reaches the text above) ----
    .fromTo('#chart-pulse',
      { attr: { r: 0 }, opacity: 0.9 },
      { attr: { r: 38 }, opacity: 0, duration: 0.7, ease: 'power2.out' },
      '-=0.15')

    // ---- HOLD, then dissolve the chart out ----
    .to({}, { duration: 0.6 })
    .to('#chart-grid, #chart-baseline, .chart-bar, #chart-area, #chart-trend, #chart-trend-dot, #chart-counter, #chart-counter-label', {
      opacity: 0, y: '-=18', duration: 0.6, ease: 'power2.in'
    })

    // ---- NAME + TAGLINE REVEAL ----
    .to('#intro-text .line-1', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.3')
    .to('#intro-text .line-2', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.55')
    .to('#intro-tagline', { opacity: 1, duration: 0.8, ease: 'power2.out' }, '-=0.3')
    .to(skipBtn, { opacity: 1, duration: 0.5 }, '-=0.6')

    // ---- HOLD, then dismiss into the main site ----
    .to({}, { duration: 2.0 })
    .call(finishIntro);
}

skipBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  gsap.killTweensOf(introKillTargets);
  finishIntro();
});

/* Also let an impatient user click anywhere to skip after 1.2s */
let skippable = false;
setTimeout(() => { skippable = true; }, 1200);
introEl.addEventListener('click', (e) => {
  if(skippable && e.target !== skipBtn && !skipBtn.contains(e.target)){
    gsap.killTweensOf(introKillTargets);
    finishIntro();
  }
});

/* ---------------------------------------------------------------
   3. Scroll-driven reveals for every section
   --------------------------------------------------------------- */
function initScrollReveals(){
  gsap.utils.toArray('.about-copy p, .about-copy .lead, .fact').forEach((el, i) => {
    gsap.fromTo(el, { opacity:0, y:24 }, {
      opacity:1, y:0, duration:0.7, ease:'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%' },
      delay: i * 0.05
    });
  });

  gsap.utils.toArray('.tl-item').forEach((el) => {
    gsap.fromTo(el, { opacity:0, x:-24 }, {
      opacity:1, x:0, duration:0.7, ease:'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' }
    });
  });

  gsap.utils.toArray('.project-card').forEach((el, i) => {
    gsap.fromTo(el, { opacity:0, y:32 }, {
      opacity:1, y:0, duration:0.7, ease:'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%' },
      delay: (i % 2) * 0.08
    });
  });

  gsap.utils.toArray('.skill-group').forEach((el, i) => {
    gsap.fromTo(el, { opacity:0, y:24 }, {
      opacity:1, y:0, duration:0.6, ease:'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%' },
      delay: i * 0.06
    });
  });

  gsap.fromTo('.cert-strip', { opacity:0 }, {
    opacity:1, duration:0.8,
    scrollTrigger: { trigger: '.cert-strip', start: 'top 92%' }
  });

  gsap.fromTo('.contact-wrap .lead, .contact-link', { opacity:0, y:24 }, {
    opacity:1, y:0, duration:0.7, stagger:0.08, ease:'power3.out',
    scrollTrigger: { trigger: '.contact-wrap', start: 'top 85%' }
  });

  gsap.utils.toArray('.section-head').forEach((el) => {
    gsap.fromTo(el, { opacity:0, y:16 }, {
      opacity:1, y:0, duration:0.6, ease:'power3.out',
      scrollTrigger: { trigger: el, start: 'top 92%' }
    });
  });

  // Parallax on the fixed background scene
  gsap.to('.bg-glow-1', {
    y: 120, x: -40,
    scrollTrigger: { trigger: '#content', start: 'top top', end: 'bottom bottom', scrub: 1 }
  });
  gsap.to('.bg-glow-2', {
    y: -160, x: 30,
    scrollTrigger: { trigger: '#content', start: 'top top', end: 'bottom bottom', scrub: 1 }
  });
  gsap.to('.bg-stadium', {
    y: -60,
    scrollTrigger: { trigger: '#content', start: 'top top', end: 'bottom bottom', scrub: 1 }
  });
}
initScrollReveals();

/* ---------------------------------------------------------------
   4. Data-viz interactions — counters, sparklines, charts, network
   --------------------------------------------------------------- */
function initCounters(){
  document.querySelectorAll('[data-count-to]:not(.hero-kpi-num)').forEach((el) => {
    const to = parseFloat(el.dataset.countTo);
    const suffix = el.dataset.suffix || '';
    const obj = { v: 0 };
    gsap.to(obj, {
      v: to,
      duration: 1.4,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      onUpdate(){
        const val = Math.round(obj.v);
        el.textContent = (to >= 1000 ? val.toLocaleString() : val) + suffix;
      },
      onComplete(){
        el.textContent = (to >= 1000 ? to.toLocaleString() : to) + suffix;
      }
    });
  });
}

function initSparklines(){
  gsap.utils.toArray('.spark-path').forEach((path) => {
    const len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    gsap.to(path, {
      strokeDashoffset: 0,
      duration: 1.2,
      ease: 'power2.out',
      scrollTrigger: { trigger: path, start: 'top 90%', once: true }
    });
  });
}

function initTrajectory(){
  const fill = document.querySelector('.timeline-fill');
  if(fill){
    gsap.to(fill, {
      height: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: '.timeline',
        start: 'top 75%',
        end: 'bottom 60%',
        scrub: 0.6
      }
    });
  }
  gsap.utils.toArray('.tl-marker').forEach((m) => {
    gsap.to(m, {
      scale: 1,
      duration: 0.5,
      ease: 'back.out(2)',
      scrollTrigger: { trigger: m, start: 'top 85%', once: true }
    });
  });
}

function initFunnels(){
  gsap.utils.toArray('.funnel-row').forEach((row, i) => {
    ScrollTrigger.create({
      trigger: row,
      start: 'top 90%',
      once: true,
      onEnter: () => gsap.delayedCall(i * 0.12, () => row.classList.add('in-view'))
    });
  });
}

function initGrowthCharts(){
  gsap.utils.toArray('.metric-growth').forEach((chart) => {
    const bars = chart.querySelectorAll('.mg-bar');
    const line = chart.querySelector('.mg-line');
    if(line){
      const len = line.getTotalLength();
      gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
    }
    const gtl = gsap.timeline({
      scrollTrigger: { trigger: chart, start: 'top 85%', once: true }
    });
    gtl.to(bars, {
      height: (i, el) => +el.dataset.h,
      y: (i, el) => 86 - el.dataset.h,
      duration: 0.7,
      stagger: 0.08,
      ease: 'power3.out'
    });
    if(line){
      gtl.to(line, { strokeDashoffset: 0, duration: 0.6, ease: 'power2.inOut' }, '-=0.2');
    }
  });
}

function initDonuts(){
  const CIRCUMFERENCE = 2 * Math.PI * 34;
  document.querySelectorAll('.metric-donut').forEach((donut) => {
    const pct = parseFloat(donut.dataset.pct);
    const fillCircle = donut.querySelector('.donut-fill');
    const numEl = donut.querySelector('.donut-num');
    const obj = { v: 0 };
    gsap.to(fillCircle, {
      strokeDashoffset: CIRCUMFERENCE * (1 - pct / 100),
      duration: 1.3,
      ease: 'power2.out',
      scrollTrigger: { trigger: donut, start: 'top 88%', once: true }
    });
    gsap.to(obj, {
      v: pct,
      duration: 1.3,
      ease: 'power2.out',
      scrollTrigger: { trigger: donut, start: 'top 88%', once: true },
      onUpdate(){ numEl.textContent = Math.round(obj.v) + '%'; }
    });
  });
}

function initSkillsNetwork(){
  const line = document.querySelector('.network-line');
  if(!line) return;
  const nodes = gsap.utils.toArray('.network-node');
  const circles = nodes.map((n) => n.querySelector('circle'));
  const labels = nodes.map((n) => n.querySelector('text'));
  const ntl = gsap.timeline({
    scrollTrigger: { trigger: '.skills-network', start: 'top 85%', once: true }
  });
  ntl
    .to(line, { strokeDashoffset: 0, duration: 1, ease: 'power2.inOut' })
    .to(circles, {
      attr: { r: (i, el) => +el.closest('.network-node').dataset.r },
      duration: 0.6, stagger: 0.15, ease: 'back.out(2)'
    }, '-=0.6')
    .to(labels, { opacity: 1, duration: 0.4, stagger: 0.15 }, '-=0.4');
}

function initSignalLine(){
  const path = document.querySelector('.signal-path');
  if(!path) return;
  const len = path.getTotalLength();
  gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
  gsap.to(path, {
    strokeDashoffset: 0,
    duration: 1.4,
    ease: 'power2.inOut',
    scrollTrigger: { trigger: '.signal-line', start: 'top 88%', once: true }
  });
}

function initNavActive(){
  const ids = ['about', 'experience', 'projects', 'skills', 'contact'];
  ids.forEach((id) => {
    const sectionEl = document.getElementById(id);
    const navLink = document.querySelector(`.nav-links a[data-nav="${id}"]`);
    const sectionNum = sectionEl ? sectionEl.querySelector('.section-num') : null;
    const sideLabel = sectionEl ? sectionEl.querySelector('.side-label-text') : null;
    if(!sectionEl || !navLink) return;
    const setActive = () => {
      document.querySelectorAll('.nav-links a').forEach((a) => a.classList.remove('active'));
      document.querySelectorAll('.section-num').forEach((n) => n.classList.remove('active'));
      document.querySelectorAll('.side-label-text').forEach((s) => s.classList.remove('active'));
      navLink.classList.add('active');
      if(sectionNum) sectionNum.classList.add('active');
      if(sideLabel) sideLabel.classList.add('active');
    };
    ScrollTrigger.create({
      trigger: sectionEl,
      start: 'top center',
      end: 'bottom center',
      onEnter: setActive,
      onEnterBack: setActive
    });
  });
}

function initMouseParallax(){
  if(prefersReduced || window.matchMedia('(pointer: coarse)').matches) return;
  const grid = document.querySelector('.bg-grid');
  if(!grid) return;
  const moveX = gsap.quickTo(grid, 'x', { duration: 1.4, ease: 'power3.out' });
  const moveY = gsap.quickTo(grid, 'y', { duration: 1.4, ease: 'power3.out' });
  window.addEventListener('mousemove', (e) => {
    moveX((e.clientX / window.innerWidth - 0.5) * 24);
    moveY((e.clientY / window.innerHeight - 0.5) * 24);
  });
}

/* ---------------------------------------------------------------
   5. Signature interaction layer
   --------------------------------------------------------------- */
function initScrollProgress(){
  const fill = document.getElementById('scroll-progress-fill');
  if(!fill) return;
  gsap.to(fill, {
    width: '100%',
    ease: 'none',
    scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 }
  });
}

function initCustomCursor(){
  if(prefersReduced || window.matchMedia('(pointer: coarse)').matches) return;
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if(!dot || !ring) return;

  document.documentElement.classList.add('has-custom-cursor');

  const moveDotX = gsap.quickTo(dot, 'x', { duration: 0.1, ease: 'power3.out' });
  const moveDotY = gsap.quickTo(dot, 'y', { duration: 0.1, ease: 'power3.out' });
  const moveRingX = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3.out' });
  const moveRingY = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3.out' });

  window.addEventListener('mousemove', (e) => {
    moveDotX(e.clientX); moveDotY(e.clientY);
    moveRingX(e.clientX); moveRingY(e.clientY);
  });

  const hoverables = 'a, button, .project-card, .fact, .metric-donut, .tags span, .tl-item, .contact-link';
  document.querySelectorAll(hoverables).forEach((el) => {
    el.addEventListener('mouseenter', () => ring.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('cursor-hover'));
  });

  document.addEventListener('mousedown', () => gsap.to(ring, { scale: 0.72, duration: 0.15 }));
  document.addEventListener('mouseup', () => gsap.to(ring, { scale: 1, duration: 0.4, ease: 'back.out(3)' }));

  gsap.to([dot, ring], { opacity: 1, duration: 0.4, delay: 0.2 });
}

function initClickPing(){
  if(prefersReduced) return;
  document.addEventListener('click', (e) => {
    const ping = document.createElement('div');
    ping.className = 'click-ping';
    ping.style.left = e.clientX + 'px';
    ping.style.top = e.clientY + 'px';
    document.body.appendChild(ping);
    gsap.fromTo(ping,
      { scale: 0, opacity: 0.9 },
      {
        scale: 3.2, opacity: 0, duration: 0.65, ease: 'power2.out',
        onComplete(){ ping.remove(); }
      });
  });
}

function initMagneticButtons(){
  if(window.matchMedia('(pointer: coarse)').matches) return;
  document.querySelectorAll('.btn').forEach((btn) => {
    const moveX = gsap.quickTo(btn, 'x', { duration: 0.3, ease: 'power3.out' });
    const moveY = gsap.quickTo(btn, 'y', { duration: 0.3, ease: 'power3.out' });
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      moveX((e.clientX - r.left - r.width / 2) * 0.28);
      moveY((e.clientY - r.top - r.height / 2) * 0.28);
    });
    btn.addEventListener('mouseleave', () => { moveX(0); moveY(0); });
  });
}

function initStatusTicker(){
  const el = document.getElementById('status-ticker-text');
  if(!el) return;
  const phrases = [
    'Syncing metrics…',
    'Optimizing operations…',
    'Tracking growth…',
    'Auditing quality…',
    'Balancing supply & demand…',
    'Refreshing dashboard…'
  ];
  let i = 0;
  setInterval(() => {
    i = (i + 1) % phrases.length;
    gsap.to(el, {
      opacity: 0, duration: 0.35,
      onComplete(){
        el.textContent = phrases[i];
        gsap.to(el, { opacity: 1, duration: 0.35 });
      }
    });
  }, 3600);
}

initCounters();
initSparklines();
initTrajectory();
initFunnels();
initGrowthCharts();
initDonuts();
initSkillsNetwork();
initSignalLine();
initNavActive();
initMouseParallax();
initScrollProgress();
initCustomCursor();
initClickPing();
initMagneticButtons();
initStatusTicker();

/* ---------------------------------------------------------------
   6. Nav background intensifies on scroll
   --------------------------------------------------------------- */
ScrollTrigger.create({
  start: 'top -80',
  end: 99999,
  toggleClass: { targets: '#nav', className: 'nav-scrolled' }
});
