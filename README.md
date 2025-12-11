# PianoMemories

A Simon-style memory game that uses a piano keyboard. Portrait for menus, landscape-only for gameplay. Offline-capable PWA.

## Project structure
- `index.html` — UI shell with portrait menu and landscape game view.
- `style.css` — responsive styling, keyboard visuals, safe-area handling, rotate overlay.
- `script.js` — game logic, scale handling, sequence playback, audio hooks, orientation gating, SW registration.
- `manifest.json` — PWA metadata.
- `service-worker.js` — precache and runtime cache for offline use.
- `audio/` — place your .mp3 samples here (see below).
- `icons/` — place PWA icons (192x192 and 512x512 PNG suggested).

## Audio assets
- Provide .mp3 128kbps samples for three octaves around middle C.
- File naming expected by the app: `C4.mp3`, `Csharp4.mp3`, `Dflat4.mp3`, etc. (accidentals use `sharp` / `flat`).
- Normal mode uses 1 octave (C4–B4); Hard uses 2 octaves (C4–B5).
- Place all files in `audio/`.

## Running locally
Use a simple static server so service workers and PWA assets load correctly:

```bash
# Python 3
python -m http.server 4173

# or Node
npx serve . -l 4173
```

Open `http://localhost:4173` on your device. Add to Home Screen on iOS for fullscreen.

## Notes
- If orientation is portrait during gameplay, a rotate overlay appears.
- If an audio file is missing or blocked, a short synthesized beep fallback plays.
