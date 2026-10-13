'use strict';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- mobile navigation ---------- */
const navbar = $('[data-navbar]');
const navToggler = $('[data-nav-toggler]');

function setNav(open) {
  navbar.classList.toggle('active', open);
  navToggler.classList.toggle('active', open);
  navToggler.setAttribute('aria-expanded', String(open));
}
navToggler.addEventListener('click', () => setNav(!navbar.classList.contains('active')));
$$('[data-nav-link]').forEach(l => l.addEventListener('click', () => setNav(false)));
document.addEventListener('click', e => {
  if (navbar.classList.contains('active') && !navbar.contains(e.target) && !navToggler.contains(e.target)) setNav(false);
});

/* ---------- search overlay ---------- */
const searchBox = $('[data-search-box]');
const searchInput = $('[data-search-input]');
const searchForm = $('[data-search-form]');
const searchHint = $('[data-search-hint]');
const searchOpen = $('[data-search-open]');
let lastFocus = null;

function setSearch(open) {
  searchBox.classList.toggle('active', open);
  document.body.style.overflow = open ? 'hidden' : '';
  if (open) {
    lastFocus = document.activeElement;
    searchHint.textContent = 'Press Esc to close';
    setTimeout(() => searchInput.focus(), 50);
  } else if (lastFocus) {
    lastFocus.focus();
  }
}
searchOpen.addEventListener('click', () => setSearch(true));
$('[data-search-close]').addEventListener('click', () => setSearch(false));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (searchBox.classList.contains('active')) setSearch(false);
    else if (navbar.classList.contains('active')) { setNav(false); navToggler.focus(); }
  }
  if ((e.key === '/' || (e.key === 'k' && (e.ctrlKey || e.metaKey))) &&
      !/input|textarea/i.test(document.activeElement.tagName)) {
    e.preventDefault();
    setSearch(true);
  }
});

// Lightweight on-page search: jumps to the first heading/paragraph that matches.
searchForm.addEventListener('submit', e => {
  e.preventDefault();
  const q = searchInput.value.trim().toLowerCase();
  if (!q) return;
  const target = $$('main h2, main h3, main p, .footer h2').find(el => el.textContent.toLowerCase().includes(q));
  if (!target) {
    searchHint.textContent = `No results for “${searchInput.value.trim()}”`;
    return;
  }
  lastFocus = null;
  setSearch(false);
  const box = target.closest('.one-card, .blog-card') || target;
  box.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  box.classList.remove('search-hit');
  void box.offsetWidth;
  box.classList.add('search-hit');
});

/* ---------- header, back-to-top, progress bar, parallax ---------- */
const header = $('[data-header]');
const backTop = $('[data-back-top-btn]');
const progress = $('.scroll-progress');
const heroBg = $('[data-parallax]');
let ticking = false;

function onScroll() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  header.classList.toggle('active', y > 40);
  backTop.classList.toggle('active', y > 400);
  progress.style.setProperty('--progress', max > 0 ? (y / max).toFixed(4) : 0);
  if (heroBg && !reduceMotion && y < window.innerHeight * 1.2) {
    heroBg.style.transform = `translate3d(0, ${y * 0.25}px, 0)`;
  }
  ticking = false;
}
window.addEventListener('scroll', () => {
  if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
}, { passive: true });
onScroll();

/* ---------- scroll reveal ---------- */
const revealEls = $$('.reveal');
if ('IntersectionObserver' in window && !reduceMotion) {
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in-view'); obs.unobserve(en.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('in-view'));
}

/* ---------- highlight current section in nav ---------- */
const links = $$('[data-nav-link]');
if ('IntersectionObserver' in window) {
  const sections = ['home', 'services', 'game', 'contact'].map(id => document.getElementById(id)).filter(Boolean);
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        links.forEach(l => l.classList.toggle('is-current', l.getAttribute('href') === '#' + en.target.id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => spy.observe(s));
}

/* ---------- footer year ---------- */
const yearEl = $('[data-year]');
if (yearEl) yearEl.textContent = new Date().getFullYear();
