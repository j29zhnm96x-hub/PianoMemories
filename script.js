// PianoMemories - Simon-style piano memory game
// Assumptions: audio samples named like C4.mp3, Csharp4.mp3, Dflat4.mp3, etc. placed in /audio/
// Uses middle C octave (C4) as the base; normal mode = 1 octave (C4-B4), hard = 2 octaves (C4-B5).

(() => {
  const scaleSelect = document.getElementById('scale-select');
  const modeInputs = Array.from(document.querySelectorAll('input[name="mode"]'));
  const playBtn = document.getElementById('play-btn');
  const desktopPlayBtn = document.getElementById('desktop-play-btn');
  const homeBtn = document.getElementById('home-btn');
  const assistToggle = document.getElementById('assist-toggle');
  const soundToggle = document.getElementById('sound-toggle');
  const flipHint = document.getElementById('flip-hint');
  const orientationMsg = document.getElementById('orientation-message');
  const portraitScreen = document.getElementById('portrait-screen');
  const landscapeScreen = document.getElementById('landscape-screen');
  const keyboardEl = document.getElementById('keyboard');
  const levelDisplay = document.getElementById('level-display');
  const statusText = document.getElementById('status-text');
  const selectedScaleEl = document.getElementById('selected-scale');
  const selectedModeEl = document.getElementById('selected-mode');
  const inlineError = document.getElementById('inline-error');
  const bestNormalEl = document.getElementById('best-normal');
  const bestHardEl = document.getElementById('best-hard');
  const maxDisplayEl = document.getElementById('max-display');

  const NOTE_ORDER = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const FLAT_TO_SHARP = { Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#' };
  const MAJOR_STEPS = [0, 2, 4, 5, 7, 9, 11];

  const state = {
    sequence: [],
    userIndex: 0,
    canInput: false,
    playing: false,
    scaleRoot: 'C',
    scaleChoice: 'random',
    randomPinnedRoot: null,
    mode: 'normal',
    baseOctave: 4,
    octaveSpan: 1,
    notePool: [],
    visibleNotesSet: new Set(),
    started: false,
  };

  const audioCache = new Map();
  let audioCtx = null;

  const BEST_KEYS = {
    normal: 'pianomem_best_normal',
    hard: 'pianomem_best_hard',
  };

  function loadBest(mode) {
    const key = BEST_KEYS[mode];
    if (!key) return 0;
    try {
      const v = parseInt(localStorage.getItem(key) || '0', 10);
      return Number.isFinite(v) && v > 0 ? v : 0;
    } catch (e) {
      return 0;
    }
  }

  function saveBest(mode, value) {
    const key = BEST_KEYS[mode];
    if (!key) return;
    try {
      localStorage.setItem(key, String(Math.max(0, value | 0)));
    } catch (e) {}
  }

  function updateAchievementsUI() {
    const bestNormal = loadBest('normal');
    const bestHard = loadBest('hard');
    if (bestNormalEl) bestNormalEl.textContent = String(bestNormal);
    if (bestHardEl) bestHardEl.textContent = String(bestHard);

    const mode = state.mode || 'normal';
    if (maxDisplayEl) maxDisplayEl.textContent = String(loadBest(mode));
  }

  function maybeUpdateBest(currentLevel) {
    const mode = state.mode || 'normal';
    const best = loadBest(mode);
    if (currentLevel > best) {
      saveBest(mode, currentLevel);
    }
    updateAchievementsUI();
  }

  function initAudioContext() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      audioCtx = Ctx ? new Ctx() : null;
    }
  }

  function ensureAudioUnlocked() {
    initAudioContext();
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
  }

  function noteToFile(note) {
    // Convert note like C#4 -> Csharp4.mp3; Db4 -> Dflat4.mp3
    return `audio/${note.replace('#', 'sharp').replace('b', 'flat')}.mp3`;
  }

  async function playSample(note) {
    if (!soundToggle.checked) return;
    ensureAudioUnlocked();
    const src = noteToFile(note);
    if (!audioCache.has(src)) {
      const audio = new Audio(src);
      audio.preload = 'auto';
      audioCache.set(src, audio);
    }
    const audio = audioCache.get(src).cloneNode(true);
    try {
      await audio.play();
    } catch (err) {
      beepFallback(note);
    }
  }

  function beepFallback(note) {
    ensureAudioUnlocked();
    if (!audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const now = audioCtx.currentTime;
      const freq = noteToFreq(note);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.2, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) {
      // ignore
    }
  }

  function noteToFreq(note) {
    // A4 = 440Hz
    const match = note.match(/^([A-G])(#|b)?(\d)$/);
    if (!match) return 440;
    let [, letter, accidental, octave] = match;
    let name = letter + (accidental || '');
    name = FLAT_TO_SHARP[name] || name;
    const semitone = NOTE_ORDER.indexOf(name);
    const midi = (parseInt(octave, 10) + 1) * 12 + semitone;
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function canonicalPitch(name) {
    return FLAT_TO_SHARP[name] || name;
  }

  function buildScale(root) {
    const rootName = canonicalPitch(root);
    const rootIdx = NOTE_ORDER.indexOf(rootName);
    if (rootIdx === -1) return [];
    return MAJOR_STEPS.map(step => NOTE_ORDER[(rootIdx + step) % 12]);
  }

  function buildNotePool(scaleRoot, octaveSpan) {
    const scale = buildScale(scaleRoot);
    const notes = [];
    for (let o = state.baseOctave; o < state.baseOctave + octaveSpan; o++) {
      for (const pc of scale) {
        notes.push(`${pc}${o}`);
      }
    }
    // include the top root so the full octave is playable/visible
    const topRoot = canonicalPitch(scale[0]);
    notes.push(`${topRoot}${state.baseOctave + octaveSpan}`);
    return notes;
  }

  function isNatural(pc) {
    return ['C', 'D', 'E', 'F', 'G', 'A', 'B'].includes(pc);
  }

  function buildKeyboard(root, octaves) {
    keyboardEl.innerHTML = '';
    const whiteContainer = document.createElement('div');
    whiteContainer.className = 'white-keys';
    const blackContainer = document.createElement('div');
    blackContainer.className = 'black-keys';

    const rootPc = canonicalPitch(root);
    if (!NOTE_ORDER.includes(rootPc)) return;

    // Fixed tape: 4 octaves from (baseOctave-1) to (baseOctave+2) to accommodate hard mode
    const tapeStartOct = state.baseOctave - 1;
    const tapeOctaves = 4;
    const tapeNotes = [];
    for (let o = tapeStartOct; o < tapeStartOct + tapeOctaves; o++) {
      for (const pc of NOTE_ORDER) {
        tapeNotes.push({ note: `${pc}${o}`, pc, natural: isNatural(pc) });
      }
    }

    // Window: from semitone before root to semitone after top root
    const rootNote = `${rootPc}${state.baseOctave}`;
    const topRoot = `${rootPc}${state.baseOctave + octaves}`;
    const rootIdxTape = tapeNotes.findIndex(n => n.note === rootNote);
    const topIdxTape = tapeNotes.findIndex(n => n.note === topRoot);
    if (rootIdxTape === -1 || topIdxTape === -1) return;
    let startIdx = Math.max(0, rootIdxTape - 1);
    let endIdx = Math.min(tapeNotes.length - 1, topIdxTape + 1);
    
    // Expand to include any black keys just outside the boundary
    while (startIdx > 0 && !tapeNotes[startIdx - 1].natural) {
      startIdx -= 1;
    }
    while (endIdx < tapeNotes.length - 1 && !tapeNotes[endIdx + 1].natural) {
      endIdx += 1;
    }
    const notes = tapeNotes.slice(startIdx, endIdx + 1);

    let whiteCount = notes.reduce((acc, n) => acc + (n.natural ? 1 : 0), 0);

    const firstIsNatural = notes.length > 0 ? notes[0].natural : true;
    const lastIsNatural = notes.length > 0 ? notes[notes.length - 1].natural : true;

    const leftPlaceholder = firstIsNatural ? 0 : 0.5;
    const rightPlaceholder = lastIsNatural ? 0 : 0.5;

    const totalSlots = whiteCount + leftPlaceholder + rightPlaceholder;
    const slotPercent = 100 / totalSlots;

    // Build slots (including placeholders) so we know exact centers
    const whiteSlots = [];
    const naturalSlotIndices = [];
    let slotCursor = 0;
    let slotIndex = 0;

    if (leftPlaceholder > 0) {
      const w = leftPlaceholder;
      const center = (slotCursor + w / 2) * slotPercent;
      whiteSlots.push({ center, widthSlots: w, placeholder: true });
      slotCursor += w;
      slotIndex += 1;
    }

    for (const item of notes) {
      if (!item.natural) continue;
      const center = (slotCursor + 0.5) * slotPercent;
      whiteSlots.push({ center, widthSlots: 1, placeholder: false, note: item.note });
      naturalSlotIndices.push(slotIndex);
      slotCursor += 1;
      slotIndex += 1;
    }

    if (rightPlaceholder > 0) {
      const w = rightPlaceholder;
      const center = (slotCursor + w / 2) * slotPercent;
      whiteSlots.push({ center, widthSlots: w, placeholder: true });
      slotCursor += w;
      slotIndex += 1;
    }

    // render white keys
    for (const slot of whiteSlots) {
      const el = document.createElement('div');
      el.className = 'key white-key' + (slot.placeholder ? ' placeholder' : '');
      el.style.width = `${slot.widthSlots * slotPercent}%`;
      if (!slot.placeholder) {
        el.dataset.note = slot.note;
        const label = document.createElement('span');
        label.className = 'key-label';
        label.textContent = slot.note;
        el.appendChild(label);
      }
      whiteContainer.appendChild(el);
    }

    // render black keys using centers between adjacent white slots (placeholders included)
    const blackKeys = [];
    let naturalsSeen = 0;
    for (const item of notes) {
      if (item.natural) {
        naturalsSeen += 1;
        continue;
      }
      const prevSlotIdx = naturalsSeen === 0 ? 0 : naturalSlotIndices[naturalsSeen - 1];
      const nextSlotIdx = naturalsSeen < naturalSlotIndices.length ? naturalSlotIndices[naturalsSeen] : whiteSlots.length - 1;
      const prevCenter = whiteSlots[prevSlotIdx].center;
      const nextCenter = whiteSlots[nextSlotIdx].center;
      const center = (prevCenter + nextCenter) / 2;
      const blackWidthPercent = slotPercent * 0.58;
      const left = Math.max(0, center - blackWidthPercent / 2);

      const blackKey = document.createElement('div');
      blackKey.className = 'key black-key';
      blackKey.dataset.note = item.note;
      const labelB = document.createElement('span');
      labelB.className = 'key-label';
      labelB.textContent = item.note;
      blackKey.appendChild(labelB);
      blackKey.style.width = `${blackWidthPercent}%`;
      blackKey.style.left = `${left}%`;

      blackContainer.appendChild(blackKey);
      blackKeys.push({ el: blackKey, left });
    }

    // Shift far-left black key 6px left, far-right black key 12px right (works for 1- and 2-octave)
    if (blackKeys.length > 0) {
      let minIdx = 0;
      let maxIdx = 0;
      for (let i = 1; i < blackKeys.length; i++) {
        if (blackKeys[i].left < blackKeys[minIdx].left) minIdx = i;
        if (blackKeys[i].left > blackKeys[maxIdx].left) maxIdx = i;
      }
      blackKeys[minIdx].el.style.transform = 'translateX(-6px)';
      if (maxIdx !== minIdx) {
        blackKeys[maxIdx].el.style.transform = 'translateX(12px)';
      }
    }

    keyboardEl.appendChild(whiteContainer);
    keyboardEl.appendChild(blackContainer);
    attachKeyListeners();
  }

  function attachKeyListeners() {
    keyboardEl.querySelectorAll('.key').forEach(key => {
      key.addEventListener('pointerdown', onKeyPress);
      key.addEventListener('pointerup', onKeyRelease);
      key.addEventListener('pointerleave', onKeyRelease);
    });
  }

  function onKeyPress(e) {
    const note = e.currentTarget.dataset.note;
    highlightKey(note, 'active-user');
    playSample(note);
    if (state.canInput && !state.playing) {
      handleUserInput(note);
    }
  }

  function onKeyRelease(e) {
    const note = e.currentTarget.dataset.note;
    unhighlightKey(note, 'active-user');
  }

  function highlightKey(note, cls = 'active-sequence') {
    const el = keyboardEl.querySelector(`[data-note="${note}"]`);
    if (el) {
      el.classList.add(cls);
      setTimeout(() => el.classList.remove(cls), 220);
    }
  }

  function unhighlightKey(note, cls) {
    const el = keyboardEl.querySelector(`[data-note="${note}"]`);
    if (el) el.classList.remove(cls);
  }

  async function playSequence() {
    state.playing = true;
    state.canInput = false;
    for (let i = 0; i < state.sequence.length; i++) {
      const note = state.sequence[i];
      statusText.textContent = `Listen… (${i + 1}/${state.sequence.length})`;
      highlightKey(note, 'active-sequence');
      await playSample(note);
      await wait(450);
    }
    statusText.textContent = 'Your turn';
    state.playing = false;
    state.canInput = true;
    state.userIndex = 0;
  }

  function handleUserInput(note) {
    const expected = state.sequence[state.userIndex];
    if (note === expected) {
      state.userIndex += 1;
      if (state.userIndex >= state.sequence.length) {
        levelDisplay.textContent = state.sequence.length + 1;
        statusText.textContent = 'Nice! Listen to the next round';
        hideInlineError();
        state.canInput = false;
        setTimeout(nextRound, 650);
      }
    } else {
      statusText.textContent = 'Try again';
      showInlineError('Wrong note! Try again');
      state.canInput = false;
    }
  }

  function nextRound() {
    if (!state.notePool || state.notePool.length === 0) {
      showInlineError('No playable notes in range');
      state.canInput = false;
      state.playing = false;
      return;
    }
    const nextNote = pickRandom(state.notePool);
    state.sequence.push(nextNote);
    levelDisplay.textContent = state.sequence.length;
    maybeUpdateBest(state.sequence.length);
    playSequence();
  }

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function wait(ms) {
    return new Promise(res => setTimeout(res, ms));
  }

  function startGame(force = false) {
    if (!force && isTouchDevice() && !isLandscape()) {
      orientationMsg.textContent = 'Rotate to landscape to play.';
      orientationMsg.classList.remove('hidden');
      return;
    }
    ensureAudioUnlocked();
    hydrateSettings();
    state.notePool = buildNotePool(state.scaleRoot, state.octaveSpan)
      .filter(n => state.visibleNotesSet.has(n));
    state.sequence = [];
    state.started = true;
    playBtn.textContent = 'Restart';
    levelDisplay.textContent = '1';
    statusText.textContent = 'Listen…';
    hideInlineError();
    nextRound();
  }

  function restartGame() {
    state.sequence = [];
    state.userIndex = 0;
    levelDisplay.textContent = '1';
    statusText.textContent = 'Listen…';
    state.canInput = false;
    hideInlineError();
    nextRound();
  }

  function goHome() {
    // stop current game and return to portrait home screen
    state.sequence = [];
    state.userIndex = 0;
    state.canInput = false;
    state.playing = false;
    state.started = false;
    statusText.textContent = '';
    playBtn.textContent = 'Play';
    showPortrait();
  }

  const SCALE_DISPLAY = {
    C: 'C Major', 'C#': 'C# Major', D: 'D Major', 'D#': 'D# Major', E: 'E Major',
    F: 'F Major', 'F#': 'F# Major', G: 'G Major', 'G#': 'G# Major', A: 'A Major', 'A#': 'A# Major', B: 'B Major'
  };

  function ensureOrientation() {
    const landscape = isLandscape();
    if (landscape) {
      orientationMsg.classList.add('hidden');
      showLandscape();
      hydrateSettings();
      statusText.textContent = state.started ? statusText.textContent || 'Listen…' : 'Tap Play to begin';
    } else {
      if (state.started) {
        goHome();
      } else {
        showPortrait();
      }
    }
  }

  function showLandscape() {
    portraitScreen.classList.add('hidden');
    landscapeScreen.classList.remove('hidden');
  }

  function showPortrait() {
    portraitScreen.classList.remove('hidden');
    landscapeScreen.classList.add('hidden');
    orientationMsg.classList.add('hidden');
    state.started = false;
    updateAchievementsUI();
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js').catch(() => {});
      });
    }
  }

  function bindUI() {
    // initialize assist toggle state
    if (assistToggle) {
      try {
        const saved = localStorage.getItem('pianomem_show_assist');
        if (saved !== null) assistToggle.checked = saved === '1';
      } catch (e) {}
      applyAssistState(assistToggle.checked);
      assistToggle.addEventListener('change', () => applyAssistState(assistToggle.checked));
    }
    playBtn.addEventListener('click', () => {
      ensureAudioUnlocked();
      if (!state.started) startGame();
      else restartGame();
    });
    if (desktopPlayBtn) {
      desktopPlayBtn.addEventListener('click', () => {
        showLandscape();
        startGame(true);
      });
    }
    if (homeBtn) homeBtn.addEventListener('click', goHome);

    // Keep random pinned until the user changes scale
    scaleSelect.addEventListener('change', () => {
      state.scaleChoice = scaleSelect.value;
      if (state.scaleChoice !== 'random') {
        state.randomPinnedRoot = null;
      }
      hydrateSettings();
    });

    modeInputs.forEach(r => r.addEventListener('change', hydrateSettings));
    window.addEventListener('orientationchange', ensureOrientation);
    window.addEventListener('resize', ensureOrientation);
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        state.canInput = false;
      }
    });
    document.addEventListener('selectstart', (e) => e.preventDefault());
    // prevent double-tap zoom on iOS
    document.addEventListener('dblclick', (e) => e.preventDefault(), { passive: false });
    document.addEventListener('gesturestart', (e) => e.preventDefault());

    // Tap anywhere to dismiss the "Wrong note" banner
    const dismissInlineError = () => {
      if (isInlineErrorVisible()) hideInlineError();
    };
    // Use capture so a key press doesn't immediately dismiss a banner that was just shown
    document.addEventListener('pointerdown', dismissInlineError, { passive: true, capture: true });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') dismissInlineError();
    });
  }

  function hydrateSettings() {
    state.mode = modeInputs.find(r => r.checked)?.value || 'normal';
    state.octaveSpan = state.mode === 'hard' ? 2 : 1;
    state.scaleChoice = scaleSelect.value;

    if (state.scaleChoice === 'random') {
      if (!state.randomPinnedRoot) {
        state.randomPinnedRoot = pickRandom(Object.keys(SCALE_DISPLAY));
      }
      state.scaleRoot = state.randomPinnedRoot;
    } else {
      state.randomPinnedRoot = null;
      state.scaleRoot = canonicalPitch(state.scaleChoice);
    }

    buildKeyboard(state.scaleRoot, state.octaveSpan);
    state.visibleNotesSet = new Set(
      Array.from(keyboardEl.querySelectorAll('.key[data-note]')).map(el => el.dataset.note)
    );
    updateInfoTexts();
    updateAchievementsUI();
    // keep flip hint visible; it should always instruct the user to flip the phone
  }

  // Assist toggle handling: show/hide key labels and small hints
  function applyAssistState(enabled) {
    document.body.classList.toggle('assist-hidden', !enabled);
    try { localStorage.setItem('pianomem_show_assist', enabled ? '1' : '0'); } catch (e) {}
  }


  function updateInfoTexts() {
    selectedScaleEl.textContent = `Scale: ${SCALE_DISPLAY[state.scaleRoot] || state.scaleRoot}`;
    selectedModeEl.textContent = `Mode: ${state.mode === 'hard' ? 'Hard (2 octaves)' : 'Normal (1 octave)'}`;
  }

  function showInlineError(msg) {
    if (!inlineError) return;
    inlineError.textContent = msg;
    inlineError.classList.remove('hidden');
  }

  function hideInlineError() {
    if (!inlineError) return;
    inlineError.classList.add('hidden');
  }

  function isInlineErrorVisible() {
    return inlineError && !inlineError.classList.contains('hidden');
  }

  function isTouchDevice() {
    return ('ontouchstart' in window) || (navigator.maxTouchPoints || 0) > 0;
  }

  function isLandscape() {
    return window.matchMedia('(orientation: landscape)').matches;
  }

  // Init
  bindUI();
  registerServiceWorker();
  showPortrait();
  // default to Random key on first load
  try { scaleSelect.value = 'random'; } catch (e) {}
  state.scaleChoice = 'random';
  state.randomPinnedRoot = null;
  hydrateSettings();
  ensureOrientation();
})();
