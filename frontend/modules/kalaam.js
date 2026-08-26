/**
 * kalaam.js — Poetry section: rotating shayari with dynamic theme filtering
 */

let allPoems       = [];
let filteredPoems  = [];
let currentPoemIdx = 0;
let autoTimer      = null;
let activeTheme    = null;

const ROTATE_INTERVAL = 12000; // 12s

const DEVANAGARI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

function toDevanagariNum(n) {
  return String(n).padStart(2, '0').split('').map(d => DEVANAGARI_DIGITS[+d] || d).join('');
}

function pad2(n) { return String(n + 1).padStart(2, '0'); }

function renderPoem(poem) {
  const linesEl  = document.getElementById('kalaam-poem-lines');
  const sourceEl = document.getElementById('kalaam-poem-source');
  const typeEl   = document.getElementById('kalaam-poem-type');
  const numEl    = document.getElementById('kalaam-poem-number');
  const currEl   = document.getElementById('kalaam-current');
  const totalEl  = document.getElementById('kalaam-total');

  if (!linesEl || !poem) return;

  // Fade out transition
  linesEl.classList.add('is-transitioning');

  setTimeout(() => {
    // Split content on newlines → individual <p> tags
    const lines = (poem.content || poem.title || '').split('\n').filter(Boolean);
    linesEl.innerHTML = lines.map(l => `<p>${l}</p>`).join('');
    
    if (sourceEl) sourceEl.textContent = poem.source || 'तल्ख़ियाँ';
    if (typeEl) {
      const displayType = poem.theme_names 
        ? poem.theme_names.split(',')[0] 
        : (poem.type || 'शायरी');
      typeEl.textContent = displayType;
    }
    
    if (numEl) numEl.textContent = toDevanagariNum(currentPoemIdx + 1);
    if (currEl) currEl.textContent = pad2(currentPoemIdx);
    if (totalEl) totalEl.textContent = filteredPoems.length;
    
    linesEl.classList.remove('is-transitioning');
  }, 250);
}

function showPoem(idx) {
  if (!filteredPoems.length) return;
  currentPoemIdx = ((idx % filteredPoems.length) + filteredPoems.length) % filteredPoems.length;
  renderPoem(filteredPoems[currentPoemIdx]);
}

function startAutoRotate() {
  clearInterval(autoTimer);
  autoTimer = setInterval(() => showPoem(currentPoemIdx + 1), ROTATE_INTERVAL);
}

function stopAutoRotate() {
  clearInterval(autoTimer);
}

function filterByTheme(themeSlug, themeName) {
  activeTheme = themeSlug;

  if (!themeSlug) {
    filteredPoems = [...allPoems];
  } else {
    const slugLower = themeSlug.toLowerCase();
    
    filteredPoems = allPoems.filter(p => {
      const slugs = (p.theme_slugs || '').toLowerCase().split(',').map(s => s.trim());
      const names = (p.theme_names || '').split(',').map(s => s.trim());
      const type  = (p.type || '').toLowerCase();
      
      // Match against theme slugs, theme names, or poem type
      return (
        slugs.includes(slugLower) ||
        (themeName && names.includes(themeName)) ||
        type.includes(slugLower) ||
        (themeName && type.includes(themeName))
      );
    });

    if (filteredPoems.length === 0) {
      filteredPoems = [...allPoems];
    }
  }

  // Shuffle the filtered subset so each theme starts with fresh variety
  filteredPoems.sort(() => Math.random() - 0.5);

  currentPoemIdx = 0;
  showPoem(0);
  startAutoRotate();

  // Update total count
  const totalEl = document.getElementById('kalaam-total');
  if (totalEl) totalEl.textContent = filteredPoems.length;
}

export function initKalaam(poems, themes) {
  allPoems = poems || [];
  filteredPoems = [...allPoems];

  if (!allPoems.length) return;

  // Shuffle initial set
  filteredPoems.sort(() => Math.random() - 0.5);
  showPoem(0);
  startAutoRotate();

  // Navigation Controls
  document.getElementById('kalaam-prev')?.addEventListener('click', () => {
    showPoem(currentPoemIdx - 1);
    startAutoRotate();
  });
  document.getElementById('kalaam-next')?.addEventListener('click', () => {
    showPoem(currentPoemIdx + 1);
    startAutoRotate();
  });

  // Pause on hover
  const poemEl = document.getElementById('kalaam-poem');
  poemEl?.addEventListener('mouseenter', stopAutoRotate);
  poemEl?.addEventListener('mouseleave', startAutoRotate);

  // Theme pills setup
  const themesEl = document.getElementById('kalaam-themes');
  if (themesEl && themes && themes.length) {
    themesEl.innerHTML = ''; // Clear previous

    // "All / सब" pill
    const allPill = document.createElement('button');
    allPill.className = 'theme-pill is-active';
    allPill.textContent = 'सब';
    allPill.setAttribute('type', 'button');
    allPill.addEventListener('click', () => {
      themesEl.querySelectorAll('.theme-pill').forEach(p => p.classList.remove('is-active'));
      allPill.classList.add('is-active');
      filterByTheme(null, null);
    });
    themesEl.appendChild(allPill);

    // Individual Theme Pills
    themes.slice(0, 10).forEach(t => {
      const pill = document.createElement('button');
      pill.className = 'theme-pill';
      pill.textContent = t.name;
      pill.setAttribute('type', 'button');
      pill.setAttribute('data-slug', t.slug);
      
      pill.addEventListener('click', () => {
        themesEl.querySelectorAll('.theme-pill').forEach(p => p.classList.remove('is-active'));
        pill.classList.add('is-active');
        filterByTheme(t.slug, t.name);
      });
      themesEl.appendChild(pill);
    });
  }

  // Total count
  const totalEl = document.getElementById('kalaam-total');
  if (totalEl) totalEl.textContent = filteredPoems.length;
}
