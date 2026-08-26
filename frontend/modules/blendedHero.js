/**
 * blendedHero.js — "कलाम-ओ-नग़्मा" (Blended Shayari & Songs)
 * Interactive Hero Module linking Sahir's literary poetry directly
 * to exact trimmed vocal audio clips from his immortal film songs.
 * Supports continuous auto-play across stanzas and displays the Song Name in playback.
 */

export const BLENDED_STANZAS = [
  {
    id: 1,
    line1: "बर्बादियों का सोग मनाना फ़ुज़ूल था,",
    line2: "बर्बादियों का जश्न मनाता चला गया।",
    source: "तल्ख़ियाँ (1943)",
    songTitle: "मैं ज़िंदगी का साथ निभाता चला गया",
    film: "हम दोनों (1961)",
    singer: "मोहम्मद रफ़ी",
    composer: "जयदेव",
    audioClip: "/audio/sahir_stanza_1_barbadiyon.mp3?v=2",
    tag: "फ़लसफ़ा · Philosophy"
  },
  {
    id: 2,
    line1: "ग़म और ख़ुशी में फ़र्क़ न महसूस हो जहाँ,",
    line2: "मैं दिल को उस मक़ाम पे लाता चला गया।",
    source: "तल्ख़ियाँ (1943)",
    songTitle: "मैं ज़िंदगी का साथ निभाता चला गया",
    film: "हम दोनों (1961)",
    singer: "मोहम्मद रफ़ी",
    composer: "जयदेव",
    audioClip: "/audio/sahir_stanza_2_gham_o_khushi.mp3?v=2",
    tag: "इश्क़ ओ ज़िंदगी"
  },
  {
    id: 3,
    line1: "वो अफ़्साना जिसे अंजाम तक लाना न हो मुमकिन,",
    line2: "उसे इक ख़ूब-सूरत मोड़ दे कर छोड़ना अच्छा।",
    source: "तल्ख़ियाँ (1943)",
    songTitle: "चलो इक बार फिर से अजनबी बन जाएँ हम दोनों",
    film: "गुमराह (1963)",
    singer: "महेंद्र कपूर",
    composer: "रवि",
    audioClip: "/audio/sahir_stanza_3_woh_afsana.mp3?v=2",
    tag: "विदा · Farewell"
  },
  {
    id: 4,
    line1: "कभी ख़ुद पे कभी हालात पे रोना आया,",
    line2: "बात निकली तो हर इक बात पे रोना आया।",
    source: "तल्ख़ियाँ (1943)",
    songTitle: "कभी ख़ुद पे कभी हालात पे रोना आया",
    film: "हम दोनों (1961)",
    singer: "मोहम्मद रफ़ी",
    composer: "जयदेव",
    audioClip: "/audio/sahir_stanza_4_kabhi_khud_pe.mp3?v=2",
    tag: "उदासी · Melancholy"
  },
  {
    id: 5,
    line1: "कभी कभी मेरे दिल में ख़याल आता है,",
    line2: "कि जैसे तुझ को बनाया गया है मेरे लिए।",
    source: "तल्ख़ियाँ (1943)",
    songTitle: "कभी कभी मेरे दिल में ख़याल आता है",
    film: "कभी कभी (1976)",
    singer: "मुकेश",
    composer: "ख़य्याम",
    audioClip: "/audio/sahir_stanza_5_kabhi_kabhie.mp3?v=2",
    tag: "इश्क़ · Romance"
  },
  {
    id: 6,
    line1: "ये महलों, ये तख़्तों, ये ताजों की दुनिया,",
    line2: "ये इन्साँ के दुश्मन समाजों की दुनिया।",
    source: "नज़्म 'चकले' / प्यासा",
    songTitle: "ये दुनिया अगर मिल भी जाए तो क्या है",
    film: "प्यासा (1957)",
    singer: "मोहम्मद रफ़ी",
    composer: "एस. डी. बर्मन",
    audioClip: "/audio/sahir_stanza_7_yeh_mehlon.mp3?v=2",
    tag: "इंक़िलाब · Conscience"
  },
  {
    id: 7,
    line1: "मैं पल दो पल का शायर हूँ,",
    line2: "पल दो पल मेरी कहानी है।",
    source: "आओ कि कोई ख़्वाब बुनें",
    songTitle: "मैं पल दो पल का शायर हूँ",
    film: "कभी कभी (1976)",
    singer: "मुकेश",
    composer: "ख़य्याम",
    audioClip: "/audio/sahir_stanza_8_pal_do_pal.mp3?v=2",
    tag: "हयात · Ephemeral Life"
  },
  {
    id: 8,
    line1: "जाने वो कैसे लोग थे जिनके प्यार को प्यार मिला,",
    line2: "हमने तो जब कलियाँ माँगी काँटों का हार मिला।",
    source: "प्यासा (1957)",
    songTitle: "जाने वो कैसे लोग थे जिनके प्यार को प्यार मिला",
    film: "प्यासा (1957)",
    singer: "हेमंत कुमार",
    composer: "एस. डी. बर्मन",
    audioClip: "/audio/sahir_stanza_9_jaane_woh.mp3?v=2",
    tag: "दर्द · Pathos"
  },
  {
    id: 9,
    line1: "मिलती है ज़िंदगी में मोहब्बत कभी कभी,",
    line2: "होती है दिलबरों की इनायत कभी कभी।",
    source: "तल्ख़ियाँ (1943)",
    songTitle: "मिलती है ज़िंदगी में मोहब्बत कभी कभी",
    film: "आँखें (1968)",
    singer: "लता मंगेशकर",
    composer: "रवि",
    audioClip: "/audio/sahir_stanza_10_milti_hai.mp3?v=2",
    tag: "मोहब्बत · Grace"
  }
];

let stanzas = [...BLENDED_STANZAS];
let currentIndex = 0;
let activePlayer = null;
let isPlayingContinuous = false;
let silentCycleTimer = null;

const DEVANAGARI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

function toDevanagariNum(n) {
  return String(n).padStart(2, '0').split('').map(d => DEVANAGARI_DIGITS[+d] || d).join('');
}

export function initBlendedHero(player, dbStanzas = []) {
  activePlayer = player;

  if (Array.isArray(dbStanzas) && dbStanzas.length > 0) {
    stanzas = dbStanzas.map(s => ({
      id: s.id,
      line1: s.line1,
      line2: s.line2,
      source: s.source,
      songTitle: s.song_title || s.songTitle,
      film: s.film,
      singer: s.singer,
      composer: s.composer,
      audioClip: s.audio_clip || s.audioClip,
      tag: s.tag,
    }));
  }

  const prevBtn = document.getElementById('hero-blended-prev');
  const nextBtn = document.getElementById('hero-blended-next');
  const playBtn = document.getElementById('hero-stanza-play-btn');
  const card    = document.querySelector('.hero__blended-card');

  if (!playBtn) return;

  renderStanza(currentIndex);

  prevBtn?.addEventListener('click', () => {
    stopSilentCycle();
    showStanza(currentIndex - 1, isPlayingContinuous);
  });

  nextBtn?.addEventListener('click', () => {
    stopSilentCycle();
    showStanza(currentIndex + 1, isPlayingContinuous);
  });

  playBtn.addEventListener('click', () => {
    if (isPlayingContinuous) {
      stopPlayback();
    } else {
      startPlayback();
    }
  });

  card?.addEventListener('mouseenter', () => {
    if (!isPlayingContinuous) stopSilentCycle();
  });
  card?.addEventListener('mouseleave', () => {
    if (!isPlayingContinuous) startSilentCycle();
  });

  // Listen to audio end from player to trigger automatic next stanza playback!
  if (activePlayer && activePlayer.onStanzaEnd) {
    activePlayer.onStanzaEnd(() => {
      if (isPlayingContinuous) {
        // Automatically advance to next stanza and play!
        showStanza(currentIndex + 1, true);
      }
    });
  }

  // Listen for manual pause on global player bar
  if (activePlayer && activePlayer.onPlaybackChange) {
    activePlayer.onPlaybackChange((playing) => {
      if (!playing && isPlayingContinuous) {
        isPlayingContinuous = false;
        updatePlayButtonState(false);
        startSilentCycle();
      }
    });
  }

  startSilentCycle();
}

function renderStanza(idx) {
  const item = stanzas[idx];
  if (!item) return;

  const l1 = document.getElementById('hero-stanza-line1');
  const l2 = document.getElementById('hero-stanza-line2');
  const meta = document.getElementById('hero-blended-meta');
  const time = document.getElementById('hero-stanza-time');
  const counter = document.getElementById('hero-blended-counter');

  if (l1) l1.textContent = item.line1;
  if (l2) l2.textContent = item.line2;

  if (meta) {
    meta.innerHTML = `
      <span class="hero__meta-item"><strong class="hero__meta-label">कलाम:</strong> ${item.source}</span>
      <span class="hero__meta-sep">·</span>
      <span class="hero__meta-item"><strong class="hero__meta-label">नग़्मा:</strong> ${item.songTitle}</span>
      <span class="hero__meta-sep">·</span>
      <span class="hero__meta-item"><strong class="hero__meta-label">फ़िल्म:</strong> ${item.film}</span>
    `;
  }

  if (time) time.textContent = `[ ${item.tag} ]`;
  if (counter) {
    counter.textContent = `${toDevanagariNum(idx + 1)} / ${toDevanagariNum(stanzas.length)}`;
  }
}

function showStanza(newIdx, shouldAutoPlay = false) {
  const len = stanzas.length;
  if (len === 0) return;
  currentIndex = ((newIdx % len) + len) % len;

  const verseWrap = document.getElementById('hero-blended-lines');
  if (verseWrap) {
    verseWrap.classList.add('is-transitioning');
    setTimeout(() => {
      renderStanza(currentIndex);
      verseWrap.classList.remove('is-transitioning');
      if (shouldAutoPlay) {
        playCurrentStanza();
      }
    }, 200);
  } else {
    renderStanza(currentIndex);
    if (shouldAutoPlay) {
      playCurrentStanza();
    }
  }
}

function startPlayback() {
  isPlayingContinuous = true;
  stopSilentCycle();
  updatePlayButtonState(true);
  playCurrentStanza();
}

function stopPlayback() {
  isPlayingContinuous = false;
  if (activePlayer) activePlayer.pause();
  updatePlayButtonState(false);
  startSilentCycle();
}

function playCurrentStanza() {
  const item = stanzas[currentIndex];
  if (!item || !activePlayer) return;

  // Show the Song Name in player bar as requested
  activePlayer.playClip({
    audioUrl: item.audioClip,
    title: item.songTitle,
    meta: `${item.film} · ${item.singer} · [${item.source}]`
  });
  updatePlayButtonState(true);
}

function updatePlayButtonState(playing) {
  const btn = document.getElementById('hero-stanza-play-btn');
  const txt = document.getElementById('hero-stanza-play-text');
  const icon = document.getElementById('hero-stanza-play-icon');
  const card = document.querySelector('.hero__blended-card');

  if (!btn) return;

  btn.classList.toggle('is-playing', playing);
  card?.classList.toggle('is-playing', playing);

  if (playing) {
    if (txt) txt.textContent = "नग़्मा बज रहा है...";
    if (icon) {
      icon.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
    }
  } else {
    if (txt) txt.textContent = "इस शेर का सुर सुनें";
    if (icon) {
      icon.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
    }
  }
}

function startSilentCycle() {
  clearInterval(silentCycleTimer);
  silentCycleTimer = setInterval(() => {
    if (!isPlayingContinuous) {
      showStanza(currentIndex + 1, false);
    }
  }, 10000);
}

function stopSilentCycle() {
  clearInterval(silentCycleTimer);
}
