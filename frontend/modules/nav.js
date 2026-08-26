/**
 * nav.js — Scroll-aware navigation behaviour
 * Adds backdrop blur, active section highlighting
 */

export function initNav(player) {
  const nav = document.getElementById('nav');
  const links = document.querySelectorAll('.nav__link');
  const sections = ['hero','kalaam','naghme','safar','virasat'];

  // Scroll → frosted glass nav
  const observer = new IntersectionObserver(entries => {
    // Nav becomes scrolled once hero is 50% past
  }, { threshold: 0 });

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > 60;
    nav?.classList.toggle('is-scrolled', scrolled);
  }, { passive: true });

  // Section active state
  const sectionEls = sections.map(id => document.getElementById(id)).filter(Boolean);

  const sectionObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === `#${id}`));
      }
    });
  }, { rootMargin: '-40% 0px -40% 0px', threshold: 0 });

  sectionEls.forEach(el => sectionObs.observe(el));

  // Smooth scroll for anchor links
  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Brand click scrolls to top
  document.querySelector('.nav__brand')?.addEventListener('click', e => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
