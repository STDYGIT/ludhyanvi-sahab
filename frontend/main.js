/**
 * main.js — Sahir Ludhianvi Tribute
 * GSAP Hero Intro + ScrollTrigger + API modules + YouTube Player
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initKalaam } from './modules/kalaam.js';
import { initNaghme } from './modules/naghme.js';
import { initPlayer } from './modules/player.js';
import { initNav } from './modules/nav.js';
import { initVirasat } from './modules/virasat.js';
import { initBlendedHero } from './modules/blendedHero.js';

gsap.registerPlugin(ScrollTrigger);

/* ── HERO INTRO SEQUENCE (~2.7s) ─────────────────────────────────────────── */
function runHeroIntro() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    // Instant reveal for accessibility
    gsap.set([
      '.nav__brand', '.nav__links', '.nav__audio-btn',
      '#hero-eyebrow', '#hero-anchor-line',
      '#hero-line1', '#hero-line2',
      '#hero-sig', '#hero-cta',
      '#hero-portrait'
    ], { opacity: 1, transform: 'none', clipPath: 'none' });
    return;
  }

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // 0.0s – 0.8s: Brass anchor line scales in
  tl.to('#hero-anchor-line', {
    width: '64px',
    duration: 0.8,
    ease: 'power2.inOut',
  }, 0.0);

  // 0.5s – 1.5s: Portrait reveals via opacity
  tl.fromTo('#hero-portrait', 
    { opacity: 0, y: 15 },
    { opacity: 0.95, y: 0, duration: 1.2, ease: 'power2.out' },
    0.5
  );

  // Hero eyebrow
  tl.to('#hero-eyebrow', {
    opacity: 1,
    y: 0,
    duration: 0.7,
  }, 0.8);

  // 1.0s – 1.8s: Line 1 translates up & fades in
  tl.to('#hero-line1', {
    opacity: 1,
    y: 0,
    duration: 0.85,
  }, 1.0);

  // 1.4s – 2.2s: Line 2 translates up & fades in
  tl.to('#hero-line2', {
    opacity: 1,
    y: 0,
    duration: 0.85,
  }, 1.4);

  // 1.8s – 2.5s: Signature and CTA
  tl.to('#hero-sig', {
    opacity: 1,
    y: 0,
    duration: 0.6,
  }, 1.8);

  tl.to('#hero-cta', {
    opacity: 1,
    y: 0,
    duration: 0.6,
  }, 2.0);

  // 2.0s – 2.7s: Navigation enters
  tl.to('.nav__brand', {
    opacity: 1,
    y: 0,
    duration: 0.6,
  }, 2.0);
  tl.to('.nav__links', {
    opacity: 1,
    y: 0,
    duration: 0.6,
  }, 2.1);
  tl.to('.nav__audio-btn', {
    opacity: 1,
    y: 0,
    duration: 0.5,
  }, 2.2);
}

/* ── SCROLL TRIGGERS ──────────────────────────────────────────────────────── */
function initScrollAnimations() {
  // Section headers
  gsap.utils.toArray('.section-header').forEach(el => {
    gsap.from(el, {
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        once: true,
      },
      opacity: 0,
      y: 28,
      duration: 0.8,
      ease: 'power3.out',
    });
  });

  // Safar fragments stagger in
  gsap.from('.safar__fragment', {
    scrollTrigger: {
      trigger: '.safar__grid',
      start: 'top 80%',
      once: true,
    },
    opacity: 0,
    y: 24,
    duration: 0.7,
    ease: 'power2.out',
    stagger: 0.08,
  });

  // Virasat closing lines
  gsap.to('#virasat-line1', {
    scrollTrigger: {
      trigger: '#virasat',
      start: 'top 70%',
      once: true,
    },
    opacity: 1,
    y: 0,
    duration: 1,
    ease: 'power3.out',
  });
  gsap.to('#virasat-line2', {
    scrollTrigger: {
      trigger: '#virasat',
      start: 'top 70%',
      once: true,
    },
    opacity: 1,
    y: 0,
    duration: 1,
    delay: 0.25,
    ease: 'power3.out',
  });

  // Kalaam spread
  gsap.from('.kalaam__spread', {
    scrollTrigger: {
      trigger: '.kalaam__spread',
      start: 'top 80%',
      once: true,
    },
    opacity: 0,
    y: 32,
    duration: 0.9,
    ease: 'power3.out',
  });

  // Song items
  gsap.from('.naghme__list', {
    scrollTrigger: {
      trigger: '.naghme__list',
      start: 'top 85%',
      once: true,
    },
    opacity: 0,
    y: 20,
    duration: 0.8,
    ease: 'power2.out',
  });
}

/* ── BOOT ────────────────────────────────────────────────────────────────── */
async function boot() {
  // Load API data — use env variable for production, fallback to localhost for dev
  const API = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '');
  let songs = [], poems = [], themes = [], stanzas = [];

  try {
    [songs, poems, themes, stanzas] = await Promise.all([
      fetch(`${API}/api/songs`).then(r => r.json()),
      fetch(`${API}/api/poems`).then(r => r.json()),
      fetch(`${API}/api/themes`).then(r => r.json()),
      fetch(`${API}/api/stanzas`).then(r => r.json()),
    ]);
  } catch (e) {
    console.warn('API unavailable — using fallback data', e);
    songs   = FALLBACK_SONGS;
    poems   = FALLBACK_POEMS;
    themes  = FALLBACK_THEMES;
    stanzas = [];
  }

  // Init modules
  const player = initPlayer(songs);
  initBlendedHero(player, stanzas);
  initNaghme(songs, player);
  initKalaam(poems, themes);
  initNav(player);
  initVirasat();

  // Animations
  runHeroIntro();
  initScrollAnimations();

  // Hero play button wires to player
  document.getElementById('hero-play-btn')?.addEventListener('click', () => {
    if (songs.length > 0) {
      player.loadTrack(0);
      player.play();
      document.getElementById('naghme')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  // Nav audio button
  document.getElementById('nav-audio-btn')?.addEventListener('click', () => {
    if (player.isPlaying()) {
      player.pause();
    } else {
      player.play();
    }
  });
}

/* ── FALLBACK DATA (when API is offline) ─────────────────────────────────── */
const FALLBACK_SONGS = [
  { id:1, title:'Yeh Dil Tum Bin Kahin Lagta Nahin', film:'Izzat', year:1968, singer:'Mohammed Rafi, Lata Mangeshkar', youtube_id:'UbrJ0QmAxiQ', audio_url:'' },
  { id:2, title:'Milti Hai Zindagi Mein Mohabbat', film:'Ankhen', year:1968, singer:'Lata Mangeshkar', youtube_id:'3YZmK9zj3TQ', audio_url:'' },
  { id:3, title:'Tera Mujhse Hai Pehle Ka Naata Koi', film:'Aa Gale Lag Jaa', year:1973, singer:'Kishore Kumar', youtube_id:'89lgb7dmXps', audio_url:'' },
  { id:4, title:'Wada Karo Nahin Chodoge Tum Mera Saath', film:'Aa Gale Lag Jaa', year:1973, singer:'Kishore Kumar, Lata Mangeshkar', youtube_id:'AL2YnJsE70w', audio_url:'' },
  { id:5, title:'Kabhi Kabhi Mere Dil Mein', film:'Kabhi Kabhie', year:1976, singer:'Lata Mangeshkar', youtube_id:'IuHMHUFXCg8', audio_url:'' },
];
const FALLBACK_POEMS = [
  { id:1, title:'वो अफ़्साना', content:'वो अफ़्साना जिसे अंजाम तक लाना न हो मुमकिन\nउसे इक ख़ूब-सूरत मोड़ दे कर छोड़ना अच्छा', type:'प्रेरणादायक', source:'तल्ख़ियाँ' },
  { id:2, title:'ले दे के', content:'ले दे के अपने पास फ़क़त इक नज़र तो है\nक्यूँ देखें ज़िंदगी को किसी की नज़र से हम', type:'ज़िंदगी', source:'तल्ख़ियाँ' },
];
const FALLBACK_THEMES = [
  { id:1, slug:'mohabbat', name:'मोहब्बत' },
  { id:2, slug:'zindagi', name:'ज़िंदगी' },
  { id:3, slug:'dard', name:'दर्द' },
];

document.addEventListener('DOMContentLoaded', boot);
