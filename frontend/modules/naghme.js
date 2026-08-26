/**
 * naghme.js — Song catalog section
 * Supports:
 *  1. Featured Selection (top 6 iconic songs)
 *  2. Full 60-Song Archive organized into Film-by-Film Accordions
 *  3. Live Search / Filter across title, film, singer, year
 *  4. Expand All / Collapse All controls
 *  5. Auto-expand accordion when track is played from player/queue
 */

let allSongs = [];
let activePlayer = null;
let currentViewMode = 'featured'; // 'featured' | 'all'

export function initNaghme(songs, player) {
  allSongs = songs;
  activePlayer = player;

  const countEl = document.getElementById('naghme-count');
  if (countEl) {
    countEl.textContent = `${songs.length} कालजयी नग़्मे · Full Discography`;
  }

  // Bind controls in HTML
  setupControls();
  renderCatalog();
}

function setupControls() {
  const container = document.getElementById('naghme-controls-bar');
  if (!container) return;

  container.innerHTML = `
    <div class="naghme-toolbar">
      <!-- View mode tabs -->
      <div class="naghme-tabs" role="tablist" aria-label="Song View Options">
        <button class="naghme-tab is-active" id="tab-featured" data-mode="featured" role="tab" aria-selected="true">
          <span>चयनित नग़्मे</span>
          <span class="naghme-tab__badge">6</span>
        </button>
        <button class="naghme-tab" id="tab-all" data-mode="all" role="tab" aria-selected="false">
          <span>सम्पूर्ण संग्रह (फ़िल्मवार)</span>
          <span class="naghme-tab__badge">${allSongs.length}</span>
        </button>
      </div>

      <!-- Search and expand actions -->
      <div class="naghme-actions">
        <div class="naghme-search-wrap">
          <svg class="naghme-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" id="naghme-search" class="naghme-search-input" placeholder="गीत, फ़िल्म या गायक खोजें..." aria-label="नग़्मे खोजें" />
          <button id="naghme-search-clear" class="naghme-search-clear" aria-label="Clear search" style="display:none;">✕</button>
        </div>

        <button id="naghme-expand-toggle" class="naghme-btn-secondary" style="display:none;">
          <span id="naghme-expand-text">सब खोलें</span>
        </button>
      </div>
    </div>
  `;

  // Tab switching
  const tabs = container.querySelectorAll('.naghme-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      currentViewMode = tab.dataset.mode;

      const expandBtn = document.getElementById('naghme-expand-toggle');
      if (expandBtn) {
        expandBtn.style.display = currentViewMode === 'all' ? 'inline-flex' : 'none';
      }

      renderCatalog();
    });
  });

  // Search filter
  const searchInput = document.getElementById('naghme-search');
  const clearBtn = document.getElementById('naghme-search-clear');

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      if (clearBtn) clearBtn.style.display = q ? 'block' : 'none';
      
      // If user types search, automatically show all matching results
      if (q && currentViewMode === 'featured') {
        currentViewMode = 'all';
        const tabAll = document.getElementById('tab-all');
        const tabFeat = document.getElementById('tab-featured');
        tabAll?.classList.add('is-active');
        tabAll?.setAttribute('aria-selected', 'true');
        tabFeat?.classList.remove('is-active');
        tabFeat?.setAttribute('aria-selected', 'false');
      }
      renderCatalog(q);
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      clearBtn.style.display = 'none';
      renderCatalog();
    });
  }

  // Expand / Collapse all toggle
  const expandToggle = document.getElementById('naghme-expand-toggle');
  let allExpanded = false;
  if (expandToggle) {
    expandToggle.addEventListener('click', () => {
      allExpanded = !allExpanded;
      const expandText = document.getElementById('naghme-expand-text');
      if (expandText) expandText.textContent = allExpanded ? 'सब समेटें' : 'सब खोलें';

      const list = document.getElementById('naghme-list');
      if (!list) return;

      list.querySelectorAll('.accordion').forEach(acc => {
        const trigger = acc.querySelector('.accordion__trigger');
        const panel = acc.querySelector('.accordion__panel');
        if (allExpanded) {
          trigger?.classList.add('is-open');
          trigger?.setAttribute('aria-expanded', 'true');
          panel?.classList.add('is-open');
          const inner = panel?.querySelector('.accordion__panel-inner');
          if (panel && inner) panel.style.maxHeight = inner.scrollHeight + 'px';
        } else {
          trigger?.classList.remove('is-open');
          trigger?.setAttribute('aria-expanded', 'false');
          panel?.classList.remove('is-open');
          if (panel) panel.style.maxHeight = '0px';
        }
      });
    });
  }
}

function renderCatalog(query = '') {
  const list = document.getElementById('naghme-list');
  if (!list) return;

  const filtered = query
    ? allSongs.filter(s => {
        const text = `${s.title} ${s.film} ${s.singer} ${s.year}`.toLowerCase();
        return text.includes(query);
      })
    : allSongs;

  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="naghme-empty">
        <p class="naghme-empty__text">" ${query} " से संबंधित कोई नग़्मा नहीं मिला।</p>
        <button class="naghme-btn-secondary" onclick="document.getElementById('naghme-search').value=''; document.getElementById('naghme-search').dispatchEvent(new Event('input'));">सारे नग़्मे देखें</button>
      </div>
    `;
    return;
  }

  if (currentViewMode === 'featured' && !query) {
    renderFeaturedView(list);
  } else {
    renderAccordionView(list, filtered, Boolean(query));
  }
}

function renderFeaturedView(list) {
  // Curated 6 representative songs across iconic films
  const featuredIndices = [0, 1, 2, 3, 4, 5];
  const featuredSongs = featuredIndices.map(i => ({ ...allSongs[i], flatIdx: i })).filter(s => s && s.title);

  const songItems = featuredSongs.map(s => renderSongRow(s)).join('');

  list.innerHTML = `
    <div class="naghme-featured-wrap">
      <div class="naghme-featured-grid">
        ${songItems}
      </div>
      <div class="naghme-featured-footer">
        <button class="naghme-btn-expand-all" id="btn-show-all-accordion">
          <span>सम्पूर्ण संग्रह देखें (${allSongs.length} नग़्मे फ़िल्मवार)</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </div>
    </div>
  `;

  // Bind click & keyboard
  bindSongClicks(list);

  document.getElementById('btn-show-all-accordion')?.addEventListener('click', () => {
    const tabAll = document.getElementById('tab-all');
    tabAll?.click();
  });
}

function renderAccordionView(list, songsToRender, isSearching) {
  // Group songs by Film
  const groups = [];
  const filmMap = new Map();

  songsToRender.forEach(s => {
    const origIdx = allSongs.indexOf(s);
    const film = s.film || 'अन्य कालजयी गीत';
    if (!filmMap.has(film)) {
      filmMap.set(film, groups.length);
      groups.push({ film, year: s.year, songs: [] });
    }
    groups[filmMap.get(film)].songs.push({ ...s, flatIdx: origIdx });
  });

  list.innerHTML = groups.map((g, gi) => {
    // If searching, open all; otherwise open first group only
    const isOpen = isSearching || gi === 0;
    const songRows = g.songs.map(s => renderSongRow(s)).join('');

    return `
      <div class="accordion" data-group="${gi}">
        <button class="accordion__trigger${isOpen ? ' is-open' : ''}"
                aria-expanded="${isOpen}"
                aria-controls="acc-panel-${gi}">
          <div class="accordion__film-wrap">
            <span class="accordion__film">${g.film}</span>
            <span class="accordion__badge">${g.songs.length} गीत</span>
          </div>
          <div class="accordion__meta">
            <span class="accordion__year">${g.year ? '· ' + g.year : ''}</span>
            <span class="accordion__chevron" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </span>
          </div>
        </button>
        <div class="accordion__panel${isOpen ? ' is-open' : ''}"
             id="acc-panel-${gi}"
             role="region"
             style="${isOpen ? 'max-height: none;' : 'max-height: 0px;'}"
             aria-label="${g.film}">
          <div class="accordion__panel-inner">
            ${songRows}
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Accordion toggle clicks
  list.querySelectorAll('.accordion__trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const isOpen = trigger.classList.contains('is-open');
      const panel = trigger.nextElementSibling;
      if (!panel) return;

      if (isOpen) {
        trigger.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
        panel.style.maxHeight = panel.scrollHeight + 'px';
        panel.offsetHeight; // reflow
        panel.classList.remove('is-open');
        panel.style.maxHeight = '0px';
      } else {
        trigger.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
        panel.classList.add('is-open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
        panel.addEventListener('transitionend', () => {
          if (panel.classList.contains('is-open')) panel.style.maxHeight = 'none';
        }, { once: true });
      }
    });
  });

  bindSongClicks(list);
}

function renderSongRow(s) {
  const num = String(s.flatIdx + 1).padStart(2, '0');
  const meta = [s.singer, s.film, s.year].filter(Boolean).join(' · ');

  return `
    <div class="song-item" data-flat-idx="${s.flatIdx}" role="button" tabindex="0"
         aria-label="${s.title} — ${meta}">
      <div class="song-item__index">
        <span class="song-item__num">${num}</span>
        <span class="song-item__micro-wave" aria-hidden="true">
          <span></span><span></span><span></span>
        </span>
      </div>
      <div class="song-item__body">
        <p class="song-item__title">${s.title}</p>
        <p class="song-item__meta">${meta}</p>
      </div>
      <div class="song-item__actions">
        <button class="song-item__play-icon" aria-label="Play ${s.title}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </button>
      </div>
    </div>
  `;
}

function bindSongClicks(container) {
  container.querySelectorAll('.song-item').forEach(el => {
    el.addEventListener('click', () => {
      const idx = +el.dataset.flatIdx;
      if (activePlayer) {
        activePlayer.loadTrack(idx);
        activePlayer.play();
      }
    });
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const idx = +el.dataset.flatIdx;
        if (activePlayer) {
          activePlayer.loadTrack(idx);
          activePlayer.play();
        }
      }
    });
  });
}
