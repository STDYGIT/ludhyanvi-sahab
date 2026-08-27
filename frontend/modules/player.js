/**
 * player.js — Dual Engine Audio Player (HTML5 Audio with YouTube fallback)
 * Provides instant clip playback, continuous stanza flow, seek bar, and queue drawer.
 */

let html5Audio = new Audio();
let ytPlayer = null;
let ytReady  = false;
let songs    = [];
let currentIdx = -1;
let _isPlaying = false;
let currentMode = 'html5'; // 'html5' | 'yt'
let seekTimer  = null;
let isSeeking  = false;
let wasPlayingBeforeSeek = false;
let stanzaEndCallbacks = [];
let playbackChangeCallbacks = [];

// DOM refs
let elPlayer, elTitle, elMeta, elPlayIcon,
    elSeek, elElapsed, elDuration,
    elQueueBtn, elQueueList, elQueueCount,
    elQueueDrawer, elVol;

const PLAY_SVG  = '<path d="M8 5v14l11-7z"/>';
const PAUSE_SVG = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';

function pad(n) { return String(Math.floor(n)).padStart(2, '0'); }
function fmtTime(s) {
  if (!s || isNaN(s)) return '—';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${pad(sec)}`;
}

/* ── HTML5 Audio Setup ───────────────────────────────────────────────────── */
function initHtml5Audio() {
  html5Audio.volume = 0.85;

  html5Audio.addEventListener('play', () => {
    _isPlaying = true;
    if (elPlayIcon) elPlayIcon.innerHTML = PAUSE_SVG;
    updateNavBtn(true);
    playbackChangeCallbacks.forEach(cb => cb(true));
  });

  html5Audio.addEventListener('pause', () => {
    _isPlaying = false;
    if (elPlayIcon) elPlayIcon.innerHTML = PLAY_SVG;
    updateNavBtn(false);
    playbackChangeCallbacks.forEach(cb => cb(false));
  });

  html5Audio.addEventListener('timeupdate', () => {
    if (isSeeking) return; // Don't fight with seek drag
    const cur = html5Audio.currentTime || 0;
    const dur = html5Audio.duration || 0;
    if (elElapsed) elElapsed.textContent = fmtTime(cur);
    if (dur > 0 && elDuration) elDuration.textContent = fmtTime(dur);
    if (dur > 0 && elSeek && document.activeElement !== elSeek) {
      elSeek.value = (cur / dur) * 100;
    }
  });

  html5Audio.addEventListener('ended', () => {
    _isPlaying = false;
    if (elPlayIcon) elPlayIcon.innerHTML = PLAY_SVG;
    updateNavBtn(false);
    playbackChangeCallbacks.forEach(cb => cb(false));

    // Notify stanza end listeners
    stanzaEndCallbacks.forEach(cb => cb());
  });

  html5Audio.addEventListener('error', (e) => {
    console.warn('HTML5 audio error — checking fallback', e);
    if (currentIdx >= 0 && songs[currentIdx] && songs[currentIdx].youtube_id) {
      playYouTube(songs[currentIdx].youtube_id);
    }
  });
}

/* ── YOUTUBE IFrame API Setup (Fallback) ─────────────────────────────────── */
function loadYTApi() {
  if (window.YT) { initYTPlayer(); return; }
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
  window.onYouTubeIframeAPIReady = initYTPlayer;
}

function initYTPlayer() {
  ytPlayer = new window.YT.Player('yt-player-container', {
    width: '1',
    height: '1',
    playerVars: { playsinline: 1, autoplay: 0, controls: 0, enablejsapi: 1 },
    events: {
      onReady: () => {
        ytReady = true;
        ytPlayer.setVolume(85);
      },
      onStateChange: (e) => {
        if (e.data === window.YT.PlayerState.PLAYING) {
          _isPlaying = true;
          if (elPlayIcon) elPlayIcon.innerHTML = PAUSE_SVG;
          updateNavBtn(true);
          startSeekTimer();
          playbackChangeCallbacks.forEach(cb => cb(true));
        } else if (e.data === window.YT.PlayerState.PAUSED) {
          _isPlaying = false;
          if (elPlayIcon) elPlayIcon.innerHTML = PLAY_SVG;
          updateNavBtn(false);
          clearInterval(seekTimer);
          playbackChangeCallbacks.forEach(cb => cb(false));
        } else if (e.data === window.YT.PlayerState.ENDED) {
          clearInterval(seekTimer);
          _isPlaying = false;
          if (elPlayIcon) elPlayIcon.innerHTML = PLAY_SVG;
          stanzaEndCallbacks.forEach(cb => cb());
        }
      },
      onError: (err) => {
        console.warn('YouTube playback error:', err);
      }
    }
  });
}

function startSeekTimer() {
  clearInterval(seekTimer);
  seekTimer = setInterval(() => {
    if (currentMode === 'yt' && ytPlayer && ytReady) {
      const cur = ytPlayer.getCurrentTime?.() || 0;
      const dur = ytPlayer.getDuration?.()    || 0;
      if (elElapsed) elElapsed.textContent = fmtTime(cur);
      if (elDuration) elDuration.textContent = fmtTime(dur);
      if (dur > 0 && elSeek && document.activeElement !== elSeek) {
        elSeek.value = (cur / dur) * 100;
      }
    }
  }, 400);
}

/* ── TRACK MANAGEMENT ────────────────────────────────────────────────────── */
function loadTrack(idx) {
  if (idx < 0 || idx >= songs.length) return;
  currentIdx = idx;
  const song = songs[idx];

  if (elPlayer) elPlayer.classList.add('is-visible');
  if (elTitle) elTitle.textContent = song.title;
  if (elMeta)  elMeta.textContent  = `${song.singer || 'साहिर लुधियानवी'} · ${song.film || ''} · ${song.year || ''}`;
  if (elSeek)  elSeek.value = 0;
  if (elElapsed) elElapsed.textContent = '0:00';
  if (elDuration) elDuration.textContent = fmtTime(song.duration_seconds || 0);

  // Sync active UI states
  document.querySelectorAll('.song-item').forEach(el => {
    const flatIdx = el.dataset.flatIdx !== undefined ? +el.dataset.flatIdx : +el.dataset.idx;
    el.classList.toggle('is-active', flatIdx === idx);
  });
  document.querySelectorAll('.queue-item').forEach((el, i) => {
    el.classList.toggle('is-active', i === idx);
  });

  // For full film songs, prefer YouTube streaming so backend is never needed!
  if (song.youtube_id) {
    playYouTube(song.youtube_id);
  } else if (song.audio_url) {
    playHtml5(song.audio_url);
  }

  renderQueue();
  scrollQueueToActive();
}

function playHtml5(url) {
  currentMode = 'html5';
  if (ytPlayer && ytReady && typeof ytPlayer.stopVideo === 'function') {
    try { ytPlayer.stopVideo(); } catch (_) {}
  }

  const targetSrc = url.startsWith('http') ? url : window.location.origin + url;
  if (html5Audio.src !== targetSrc) {
    html5Audio.src = targetSrc;
  }
  html5Audio.currentTime = 0;
  html5Audio.play().catch(e => console.warn('HTML5 play error:', e));
}

function playYouTube(ytId) {
  currentMode = 'yt';
  html5Audio.pause();

  if (ytReady && ytPlayer) {
    ytPlayer.loadVideoById(ytId);
  }
}

/**
 * Direct playback of a trimmed stanza clip (e.g. /audio/sahir_stanza_1_barbadiyon.mp3)
 */
function playClip({ audioUrl, title = 'सदा-ए-साहिर', meta = 'साहिर लुधियानवी' }) {
  if (elPlayer) elPlayer.classList.add('is-visible');
  if (elTitle) elTitle.textContent = title;
  if (elMeta)  elMeta.textContent  = meta;
  if (elSeek)  elSeek.value = 0;
  if (elElapsed) elElapsed.textContent = '0:00';

  playHtml5(audioUrl);
}

function play() {
  if (elPlayer) elPlayer.classList.add('is-visible');
  if (currentMode === 'html5') {
    if (!html5Audio.src && songs.length > 0) {
      loadTrack(0);
    } else {
      html5Audio.play().catch(() => {});
    }
  } else if (currentMode === 'yt' && ytReady && ytPlayer) {
    ytPlayer.playVideo();
  }
}

function pause() {
  if (currentMode === 'html5') {
    html5Audio.pause();
  } else if (currentMode === 'yt' && ytReady && ytPlayer) {
    ytPlayer.pauseVideo();
  }
  _isPlaying = false;
  if (elPlayIcon) elPlayIcon.innerHTML = PLAY_SVG;
  updateNavBtn(false);
}

function nextTrack() {
  if (songs.length === 0) return;
  const next = (currentIdx + 1) % songs.length;
  loadTrack(next);
}

function prevTrack() {
  if (songs.length === 0) return;
  const prev = (currentIdx - 1 + songs.length) % songs.length;
  loadTrack(prev);
}

function isPlaying() {
  return _isPlaying;
}

/* ── QUEUE DRAWER ────────────────────────────────────────────────────────── */
function renderQueue() {
  if (!elQueueList) return;
  if (elQueueCount) elQueueCount.textContent = songs.length;
  elQueueList.innerHTML = songs.map((s, i) => `
    <div class="queue-item${i === currentIdx ? ' is-active' : ''}" data-idx="${i}" role="button" tabindex="0">
      <span class="queue-item__idx">${String(i + 1).padStart(2, '0')}</span>
      <span class="queue-item__title">${s.title}</span>
      <span class="queue-item__year">${s.year || ''}</span>
    </div>
  `).join('');

  elQueueList.querySelectorAll('.queue-item').forEach(el => {
    el.addEventListener('click', () => loadTrack(+el.dataset.idx));
    el.addEventListener('keydown', e => { if (e.key === 'Enter') loadTrack(+el.dataset.idx); });
  });
}

function scrollQueueToActive() {
  const active = elQueueList?.querySelector('.queue-item.is-active');
  if (active) active.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function updateNavBtn(playing) {
  const btn = document.getElementById('nav-audio-btn');
  btn?.classList.toggle('is-playing', playing);
}

/* ── KEYBOARD SHORTCUTS ─────────────────────────────────────────────────── */
function bindKeys() {
  document.addEventListener('keydown', e => {
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    switch (e.key) {
      case ' ':
        e.preventDefault();
        _isPlaying ? pause() : play();
        break;
      case 'ArrowRight':
        if (currentMode === 'html5') {
          html5Audio.currentTime = Math.min(html5Audio.duration || 0, html5Audio.currentTime + 5);
        } else if (ytReady && ytPlayer) {
          const t = (ytPlayer.getCurrentTime() || 0) + 5;
          ytPlayer.seekTo(t, true);
        }
        break;
      case 'ArrowLeft':
        if (currentMode === 'html5') {
          html5Audio.currentTime = Math.max(0, html5Audio.currentTime - 5);
        } else if (ytReady && ytPlayer) {
          const t = Math.max(0, (ytPlayer.getCurrentTime() || 0) - 5);
          ytPlayer.seekTo(t, true);
        }
        break;
      case 'n': case 'N': nextTrack(); break;
      case 'p': case 'P': prevTrack(); break;
    }
  });
}

/* ── INIT ────────────────────────────────────────────────────────────────── */
export function initPlayer(songList) {
  songs = songList || [];

  elPlayer     = document.getElementById('player');
  elTitle      = document.getElementById('player-title');
  elMeta       = document.getElementById('player-meta');
  elPlayIcon   = document.getElementById('player-play-icon');
  elSeek       = document.getElementById('player-seek');
  elElapsed    = document.getElementById('player-elapsed');
  elDuration   = document.getElementById('player-duration');
  elQueueBtn   = document.getElementById('player-queue-btn');
  elQueueList  = document.getElementById('player-queue-list');
  elQueueCount = document.getElementById('player-queue-count');
  elQueueDrawer = document.getElementById('player-queue');
  elVol        = document.getElementById('player-vol');

  initHtml5Audio();

  // Play / pause
  document.getElementById('player-play')?.addEventListener('click', () => {
    _isPlaying ? pause() : play();
  });
  document.getElementById('player-next')?.addEventListener('click', nextTrack);
  document.getElementById('player-prev')?.addEventListener('click', prevTrack);

  // Bulletproof seek function for HTML5 and YouTube
  function performSeek(percent) {
    const val = Math.max(0, Math.min(100, parseFloat(percent) || 0));

    if (currentMode === 'html5') {
      let dur = html5Audio.duration;
      // Fallback if audio duration isn't reported by browser yet
      if (!dur || isNaN(dur) || !isFinite(dur) || dur <= 0) {
        if (songs[currentIdx] && songs[currentIdx].duration_seconds) {
          dur = songs[currentIdx].duration_seconds;
        }
      }
      if (dur && isFinite(dur) && dur > 0) {
        const targetTime = Math.min(dur - 0.2, Math.max(0, (val / 100) * dur));
        html5Audio.currentTime = targetTime;
        if (elElapsed) elElapsed.textContent = fmtTime(targetTime);
        if (_isPlaying) {
          html5Audio.play().catch(e => console.warn('Play after seek warning:', e));
        }
      }
    } else if (currentMode === 'yt' && ytReady && ytPlayer) {
      let dur = 0;
      try { dur = ytPlayer.getDuration(); } catch (_) {}
      if (!dur || isNaN(dur) || dur <= 0) {
        if (songs[currentIdx] && songs[currentIdx].duration_seconds) {
          dur = songs[currentIdx].duration_seconds;
        }
      }
      if (dur && isFinite(dur) && dur > 0) {
        const targetTime = Math.min(dur - 0.5, Math.max(0, (val / 100) * dur));
        try {
          ytPlayer.seekTo(targetTime, true);
          if (elElapsed) elElapsed.textContent = fmtTime(targetTime);
          if (_isPlaying) {
            ytPlayer.playVideo();
          }
        } catch (e) {
          console.warn('YT seek error:', e);
        }
      }
    }
  }

  elSeek?.addEventListener('mousedown', () => { isSeeking = true; });
  elSeek?.addEventListener('touchstart', () => { isSeeking = true; }, { passive: true });

  elSeek?.addEventListener('input', (e) => {
    isSeeking = true;
    performSeek(e.target.value);
  });

  elSeek?.addEventListener('change', (e) => {
    isSeeking = false;
    performSeek(e.target.value);
  });

  elSeek?.addEventListener('mouseup', () => { isSeeking = false; });
  elSeek?.addEventListener('touchend', () => { isSeeking = false; }, { passive: true });

  // Volume
  elVol?.addEventListener('input', () => {
    const val = (+elVol.value) / 100;
    html5Audio.volume = val;
    if (ytReady && ytPlayer) ytPlayer.setVolume(+elVol.value);
  });

  // Queue toggle
  elQueueBtn?.addEventListener('click', () => {
    const open = elQueueBtn.getAttribute('aria-expanded') === 'true';
    elQueueBtn.setAttribute('aria-expanded', !open);
    if (elQueueDrawer) elQueueDrawer.hidden = open;
    if (!open) {
      renderQueue();
      scrollQueueToActive();
    }
  });

  renderQueue();
  loadYTApi();
  bindKeys();

  return {
    loadTrack,
    playClip,
    play,
    pause,
    isPlaying,
    nextTrack,
    prevTrack,
    onStanzaEnd: (cb) => {
      stanzaEndCallbacks.push(cb);
    },
    onPlaybackChange: (cb) => {
      playbackChangeCallbacks.push(cb);
    }
  };
}
