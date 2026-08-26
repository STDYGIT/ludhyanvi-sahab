/**
 * virasat.js — Legacy footer micro-interactions
 */

export function initVirasat() {
  // The GSAP scroll-triggered reveal is handled in main.js
  // This module handles any micro-interactions specific to the footer

  const divider = document.querySelector('.virasat__divider');
  if (divider) {
    // Pulse the divider on hover of the section
    const virasat = document.getElementById('virasat');
    virasat?.addEventListener('mouseenter', () => {
      divider.style.opacity = '0.7';
      divider.style.transition = 'opacity 600ms ease';
    });
    virasat?.addEventListener('mouseleave', () => {
      divider.style.opacity = '0.4';
    });
  }
}
