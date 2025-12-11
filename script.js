// PianoMemories - Simon-style piano memory game
// Assumptions: audio samples named like C4.mp3, Csharp4.mp3, Dflat4.mp3, etc. placed in /audio/
// Uses middle C octave (C4) as the base; normal mode = 1 octave (C4-B4), hard = 2 octaves (C4-B5).

(() => {
  const scaleSelect = document.getElementById('scale-select');
  const modeInputs = Array.from(document.querySelectorAll('input[name="mode"]'));
  const startBtn = document.getElementById('start-btn');
  const restartBtn = document.getElementById('restart-btn');
  const assistToggle = document.getElementById('assist-toggle');
  const soundToggle = document.getElementById('sound-toggle');
  const orientationMsg = document.getElementById('orientation-message');
  const portraitScreen = document.getElementById('portrait-screen');
  const landscapeScreen = document.getElementById('landscape-screen');
  const keyboardEl = document.getElementById('keyboard');
  const levelDisplay = document.getElementById('level-display');
  const statusText = document.getElementById('status-text');
  const selectedScaleEl = document.getElementById('selected-scale');
  const selectedModeEl = document.getElementById('selected-mode');

  const NOTE_ORDER = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const FLAT_TO_SHARP = { Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#' };
  const MAJOR_STEPS = [0, 2, 4, 5, 7, 9, 11];

  const state = {
    sequence: [],
    userIndex: 0,
    canInput: false,
    playing: false,
    scaleRoot: 'C',
    mode: 'normal',
    baseOctave: 4,
    octaveSpan: 1,
    notePool: [],
    started: false,
  };

  const audioCache = new Map();
  let audioCtx = null;

  function initAudioContext() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      audioCtx = Ctx ? new Ctx() : null;
    }
  }

  function noteToFile(note) {
    // Convert note like C#4 -> Csharp4.mp3; Db4 -> Dflat4.mp3
    return `audio/${note.replace('#', 'sharp').replace('b', 'flat')}.mp3`;
  }

  async function playSample(note) {
    if (!soundToggle.checked) return;
    initAudioContext();
    const src = noteToFile(note);
    if (!audioCache.has(src)) {
      const audio = new Audio(src);
      audio.preload = 'auto';
      audioCache.set(src, audio);
    }
    const audio = audioCache.get(src).cloneNode();
    try {
      await audio.play();
    } catch (err) {
      beepFallback(note);
    }
  }

  function beepFallback(note) {
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
    return notes;
  }

  function buildKeyboard(baseOctave, octaves) {
    keyboardEl.innerHTML = '';
    const whiteContainer = document.createElement('div');
    whiteContainer.className = 'white-keys';
    const blackContainer = document.createElement('div');
    blackContainer.className = 'black-keys';

    const whiteNames = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const blackMap = { C: 'C#', D: 'D#', F: 'F#', G: 'G#', A: 'A#' };
    const totalWhite = octaves * whiteNames.length;
    let whiteIndex = 0;

    for (let o = baseOctave; o < baseOctave + octaves; o++) {
      for (let i = 0; i < whiteNames.length; i++) {
        const name = `${whiteNames[i]}${o}`;
        const whiteKey = document.createElement('div');
        whiteKey.className = 'key white-key';
        whiteKey.dataset.note = name;
        const label = document.createElement('span');
        label.className = 'key-label';
        label.textContent = name;
        whiteKey.appendChild(label);
        whiteContainer.appendChild(whiteKey);

        const baseName = whiteNames[i];
        const blackName = blackMap[baseName];
        if (blackName && !(baseName === 'E' || baseName === 'B')) {
          const blackNote = `${blackName}${o}`;
          const blackKey = document.createElement('div');
          blackKey.className = 'key black-key';
          blackKey.dataset.note = blackNote;
          const labelB = document.createElement('span');
          labelB.className = 'key-label';
          labelB.textContent = blackNote;
          blackKey.appendChild(labelB);

          // precise percent-based sizing so black keys center between adjacent whites
          const whiteKeyPercent = 100 / totalWhite; // percent width of one white key
          const blackWidthPercent = whiteKeyPercent * 0.62; // black key ~62% of white width
          const left = ( (whiteIndex + 1) * whiteKeyPercent ) - (blackWidthPercent / 2);
          blackKey.style.width = `${blackWidthPercent}%`;
          blackKey.style.left = `${left}%`;
          blackContainer.appendChild(blackKey);
        }
        whiteIndex++;
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
        state.canInput = false;
        setTimeout(nextRound, 650);
      }
    } else {
      statusText.textContent = 'Oops! Try again';
      state.canInput = false;
    }
  }

  function nextRound() {
    const nextNote = pickRandom(state.notePool);
    state.sequence.push(nextNote);
    levelDisplay.textContent = state.sequence.length;
    playSequence();
  }

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function wait(ms) {
    return new Promise(res => setTimeout(res, ms));
  }

  function startGame() {
    state.mode = modeInputs.find(r => r.checked)?.value || 'normal';
    state.octaveSpan = state.mode === 'hard' ? 2 : 1;
    state.scaleRoot = scaleSelect.value === 'random' ? pickRandom(Object.keys(SCALE_DISPLAY)) : scaleSelect.value;
    selectedScaleEl.textContent = `Scale: ${SCALE_DISPLAY[state.scaleRoot] || state.scaleRoot}`;
    selectedModeEl.textContent = `Mode: ${state.mode === 'hard' ? 'Hard (2 octaves)' : 'Normal (1 octave)'}`;

    state.notePool = buildNotePool(state.scaleRoot, state.octaveSpan);
    state.sequence = [];
    state.started = true;
    levelDisplay.textContent = '1';
    statusText.textContent = 'Waiting for landscape…';
    showLandscape();
    ensureOrientation();
    // Wait for user to rotate device to landscape, then play first note 1s after flip
    waitForLandscapeThenPlayFirst();
  }

  function waitForLandscapeThenPlayFirst() {
    const m = window.matchMedia('(orientation: landscape)');
    function startAfterDelay() {
      // small delay to allow the device to settle
      setTimeout(() => {
        statusText.textContent = 'Listen…';
        nextRound();
      }, 1000);
    }

    if (m.matches) {
      startAfterDelay();
      return;
    }

    statusText.textContent = 'Please rotate to landscape to begin';
    orientationMsg.classList.remove('hidden');

    const onChange = (ev) => {
      const matches = ev.matches === undefined ? ev.currentTarget.matches : ev.matches;
      if (matches) {
        // stop listening
        try { m.removeEventListener('change', onChange); } catch(e){ try{ m.removeListener(onChange); }catch(e){} }
        orientationMsg.classList.add('hidden');
        startAfterDelay();
      }
    };

    try { m.addEventListener('change', onChange); } catch(e) { try{ m.addListener(onChange); } catch(e){} }
  }

  function restartGame() {
    if (!state.started) return;
    state.sequence = [];
    state.userIndex = 0;
    levelDisplay.textContent = '1';
    statusText.textContent = 'Listen…';
    state.canInput = false;
    nextRound();
  }

  const SCALE_DISPLAY = {
    C: 'C Major', Db: 'Db Major', D: 'D Major', Eb: 'Eb Major', E: 'E Major',
    F: 'F Major', Gb: 'Gb Major', G: 'G Major', Ab: 'Ab Major', A: 'A Major', Bb: 'Bb Major', B: 'B Major'
  };

  function ensureOrientation() {
    const isLandscape = window.matchMedia('(orientation: landscape)').matches;
    if (state.started) {
      orientationMsg.classList.toggle('hidden', isLandscape);
    } else {
      orientationMsg.classList.add('hidden');
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
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js').catch(() => {});
      });
    }
  }

  function bindUI() {
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', restartGame);
    window.addEventListener('orientationchange', ensureOrientation);
    window.addEventListener('resize', ensureOrientation);
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        state.canInput = false;
      }
    });
  }

  // Build keyboard once (covers both modes)
  buildKeyboard(state.baseOctave, 2);
  bindUI();
  registerServiceWorker();
  showPortrait();
})();
