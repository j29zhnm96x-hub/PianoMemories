// PianoMemories - Simon-style piano memory game
// Assumptions: audio samples named like C4.mp3, Csharp4.mp3, Dflat4.mp3, etc. placed in /audio/
// Uses middle C octave (C4) as the base; easy mode = a fifth window; normal = 1 octave; hard = 2 octaves.

(() => {
  const scaleSelect = document.getElementById('scale-select');
  const modeInputs = Array.from(document.querySelectorAll('input[name="mode"]'));
  const gameInputs = Array.from(document.querySelectorAll('input[name="game"]'));
  const playBtn = document.getElementById('play-btn');
  const desktopPlayBtn = document.getElementById('desktop-play-btn');
  const homeBtn = document.getElementById('home-btn');
  const assistToggle = document.getElementById('assist-toggle');
  const selectedScaleOnlyEl = document.getElementById('selected-scale-only');
  const selectedScaleOnlyWrap = document.getElementById('selected-scale-only-wrap');
  const soundToggle = document.getElementById('sound-toggle');
  const flipHint = document.getElementById('flip-hint');
  const orientationMsg = document.getElementById('orientation-message');
  const portraitScreen = document.getElementById('portrait-screen');
  const helpScreen = document.getElementById('help-screen');
  const landscapeScreen = document.getElementById('landscape-screen');
  const keyboardEl = document.getElementById('keyboard');
  const levelDisplay = document.getElementById('level-display');
  const statusText = document.getElementById('status-text');
  const pausedBadge = document.getElementById('paused-badge');
  const pausedBadgePortrait = document.getElementById('paused-badge-portrait');
  const centerBox = document.getElementById('center-box');
  const selectedScaleEl = document.getElementById('selected-scale');
  const selectedModeEl = document.getElementById('selected-mode');
  const inlineError = document.getElementById('inline-error');
  const bestEasyEl = document.getElementById('best-easy');
  const bestNormalEl = document.getElementById('best-normal');
  const bestHardEl = document.getElementById('best-hard');
  const bestKnowKeyEl = document.getElementById('best-know-key');
  const bestKnowScaleEl = document.getElementById('best-know-scale');
  const maxDisplayEl = document.getElementById('max-display');
  const memoryModeHalf = document.getElementById('memory-mode-half');
  const helpBtn = document.getElementById('help-btn');
  const helpBackBtn = document.getElementById('help-back-btn');
  const langBtn = document.getElementById('lang-btn');
  const langModal = document.getElementById('lang-modal');

  const NOTE_ORDER = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const FLAT_TO_SHARP = { Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#' };
  const MAJOR_STEPS = [0, 2, 4, 5, 7, 9, 11];

  // ---------------------------
  // i18n
  // ---------------------------

  const LANG_STORAGE_KEY = 'pianomem_lang';
  const SUPPORTED_LANGS = ['en', 'hr', 'pl', 'it', 'es'];

  const I18N = {
    en: {
      'orientation.rotate': 'Rotate your device to landscape to play.',
      'app.title': 'PianoMemories',
      'home.help': 'Help',
      'home.scale': 'Scale',

      'home.games': 'Games',
      'game.memory': 'Memory',
      'game.knowKey': 'Know the key',
      'game.knowScale': 'Know the scale',
      'scale.random': 'Random key',
      'scale.C': 'C Major',
      'scale.C#': 'C# Major',
      'scale.D': 'D Major',
      'scale.D#': 'D# Major',
      'scale.E': 'E Major',
      'scale.F': 'F Major',
      'scale.F#': 'F# Major',
      'scale.G': 'G Major',
      'scale.G#': 'G# Major',
      'scale.A': 'A Major',
      'scale.A#': 'A# Major',
      'scale.B': 'B Major',

      'home.mode': 'Mode',
      'mode.easy': 'Easy (fifth)',
      'mode.normal': 'Normal (1 octave)',
      'mode.hard': 'Hard (2 octaves)',

      'home.settings': 'Settings',
      'settings.showNoteNames': 'Show note names',
      'settings.scaleOnly': 'Selected Major scale only',
      'settings.soundOn': 'Sound on',

      'home.achievements': 'Achievements',
      'ach.easy': 'Easy best',
      'ach.normal': 'Normal best',
      'ach.hard': 'Hard best',
      'ach.knowKey': 'Know the key best',
      'ach.knowScale': 'Know the scale best',

      'home.flip': 'FLIP THE PHONE TO PLAY',
      'home.play': 'Play',

      'lang.title': 'Language',
      'lang.close': 'Close',

      'help.title': 'Help',
      'help.back': 'Back',
      'help.index': 'Index',
      'help.idx.what': 'What is PianoMemories?',
      'help.idx.benefits': 'How it helps you',
      'help.idx.how': 'How to play',
        'help.idx.games': 'Games',
        'help.idx.knowKey': 'Know the key',
        'help.idx.knowScale': 'Know the scale',
      'help.idx.scale': 'Scale & Random key',
        'help.idx.modes': 'Modes (Memory)',
      'help.idx.play': 'Play screen',
      'help.idx.settings': 'Settings',
      'help.idx.ach': 'Achievements & Max',
      'help.idx.mistakes': 'Mistakes & restart',
      'help.idx.tips': 'Tips',

      'help.what.title': 'What is PianoMemories?',
      'help.what.body': 'PianoMemories is a Simon-style memory game on a piano keyboard. The app plays a growing sequence of notes and you repeat it by tapping the keys.',
      'help.benefits.title': 'How it helps you',
      'help.benefits.body': 'It trains musical memory, pitch recognition, and finger-to-note mapping. By staying inside a chosen major key, it also reinforces scale awareness and common note patterns.',
      'help.how.title': 'How to play',
        'help.how.li1': 'Choose a game (Memory / Know the key / Know the scale).',
        'help.how.li2': 'Choose a Scale (used by Memory and Know the scale).',
        'help.how.li3': 'If you play Memory, choose a Mode (Easy / Normal / Hard).',
        'help.how.li4': 'Flip your phone to landscape and tap Play.',
        'help.how.li5': 'Follow the prompt in the top bar and tap the correct keys.',

        'help.games.title': 'Games',
        'help.games.li1': '<strong>Memory</strong>: the app plays a growing sequence and you repeat it.',
        'help.games.li2': '<strong>Know the key</strong>: reaction-time trainer for finding random notes.',
        'help.games.li3': '<strong>Know the scale</strong>: speed trainer for playing a major scale in order.',
        'help.games.li4': '<strong>Modes</strong> apply only to Memory.',

        'help.knowKey.title': 'Know the key',
        'help.knowKey.li1': 'Tap <strong>Play</strong> to start a 3-2-1 countdown.',
        'help.knowKey.li2': 'A note name appears in the middle box (example: <strong>C#</strong>) and its tone plays.',
        'help.knowKey.li3': 'Tap the matching key as fast as you can.',
        'help.knowKey.li4': 'There are 12 rounds (each note appears once). A wrong tap ends the run.',
        'help.knowKey.li5': 'Your total time is shown at the end and saved as your best.',

        'help.knowScale.title': 'Know the scale',
        'help.knowScale.li1': 'Choose a Scale (or Random key) and tap <strong>Play</strong>.',
        'help.knowScale.li2': 'The middle box shows the scale name (example: <strong>D Major</strong>).',
        'help.knowScale.li3': 'Play the 7 notes of the major scale in exact order starting from the root.',
        'help.knowScale.li4': 'A wrong note or wrong order ends the run.',
        'help.knowScale.li5': 'Your time is measured for the whole 7-note sequence and saved as your best.',
      'help.scale.title': 'Scale & Random key',
        'help.scale.li1': '<strong>Memory</strong>: the game picks notes only from the selected major key, so you practice inside that key.',
        'help.scale.li2': '<strong>Know the scale</strong>: uses the selected Scale; if set to Random key, each restart picks a new scale.',
        'help.scale.li3': '<strong>Know the key</strong>: the Scale setting is ignored (the keyboard is always C4–B4).',
        'help.modes.title': 'Modes (Memory)',
        'help.modes.li0': '<strong>Modes</strong> only affect the Memory game.',
      'help.modes.li1': '<strong>Easy (fifth)</strong>: a smaller keyboard window from the root up to the fifth.',
      'help.modes.li2': '<strong>Normal (1 octave)</strong>: notes span one octave from the root.',
      'help.modes.li3': '<strong>Hard (2 octaves)</strong>: notes span two octaves from the root.',
      'help.play.title': 'Play screen',
        'help.play.li1': '<strong>Top bar</strong>: shows status and a prompt for the current game. Memory shows Scale/Mode/Level; the other games show a center prompt box.',
      'help.play.li2': '<strong>Blue highlight</strong>: shows notes played by the app during the sequence.',
      'help.play.li3': '<strong>Red highlight</strong>: shows your taps while repeating the sequence.',
        'help.play.li4': '<strong>Max</strong>: shows your best result for the selected game (best level for Memory, best time for the other games).',
      'help.settings.title': 'Settings',
        'help.settings.li0': '<strong>Show note names</strong> is disabled in Know the key and Know the scale.',
        'help.settings.li1': '<strong>Show note names</strong>: shows labels on the keys (Memory only).',
      'help.settings.li2': '<strong>Selected Major scale only</strong>: when enabled, only notes that belong to the selected major key show labels (useful for learning the scale).',
      'help.settings.li3': '<strong>Sound on</strong>: enables piano samples (or a fallback tone if missing).',
      'help.ach.title': 'Achievements & Max',
        'help.ach.li1': '<strong>Achievements</strong> on the home screen show best levels for Memory modes and best times for the other games.',
        'help.ach.li2': '<strong>Max</strong> (green) on the play screen shows the best for the currently selected game.',
      'help.mistakes.title': 'Mistakes & restart',
      'help.mistakes.li1': 'If you tap a wrong note, you’ll see a message and input stops for that run.',
      'help.mistakes.li2': 'Tap anywhere to dismiss the message.',
      'help.mistakes.li3': 'Press <strong>Restart</strong> to start over and try again.',
      'help.mistakes.li4': 'If you flip to portrait while a run is active, the game pauses. If you flip to portrait during Game Over, the Game Over state is dismissed. Changing game settings in portrait will reset a paused run.',
      'help.tips.title': 'Tips',
      'help.tips.li1': 'Start with Easy mode and one key (C Major), then add more keys.',
      'help.tips.li2': 'Use “Selected Major scale only” to focus on scale tones while still seeing the full keyboard window.',
      'help.tips.li3': 'Try Random key to build fast recognition across all major keys.',

      'play.home': 'Home',
      'play.ready': 'Ready',
      'play.level': 'Level',
      'play.max': 'Max',
      'play.play': 'Play',
      'play.restart': 'Restart',
      'play.tapToBegin': 'Tap Play to begin',
      'play.wrong': 'Wrong note! Try again',

      'kk.total': 'Total: {t} ({i}/{n})',
      'kk.final': 'Total: {t}',
      'ks.time': 'Time: {t} ({i}/7)',
      'ks.final': 'Time: {t}',

      'status.listen': 'Listen…',
      'status.listenCount': 'Listen… ({i}/{n})',
      'status.yourTurn': 'Your turn',
      'status.won': 'Next round',
      'status.paused': 'Paused',
      'status.tryAgain': 'Try again',
      'status.gameOver': 'Game Over',

      'gameOver.body': '<div class="gameover-banner"><div class="go-line1">Wrong note</div><div class="go-line2">Game Over</div><div class="go-line3">Tap <strong>Restart</strong> to retry</div></div>',

      'error.noPlayable': 'No playable notes in range',
      'scale.prefix': 'Scale: {name}',
      'mode.prefix': 'Mode: {name}',
    },

    hr: {
      'orientation.rotate': 'Okrenite uređaj vodoravno za igranje.',
      'app.title': 'PianoMemories',
      'home.help': 'Pomoć',
      'home.scale': 'Ljestvica',

      'home.games': 'Igre',
      'game.memory': 'Memory',
      'game.knowKey': 'Know the key',
      'game.knowScale': 'Know the scale',
      'scale.random': 'Nasumični tonalitet',
      'scale.C': 'C-dur',
      'scale.C#': 'C#-dur',
      'scale.D': 'D-dur',
      'scale.D#': 'D#-dur',
      'scale.E': 'E-dur',
      'scale.F': 'F-dur',
      'scale.F#': 'F#-dur',
      'scale.G': 'G-dur',
      'scale.G#': 'G#-dur',
      'scale.A': 'A-dur',
      'scale.A#': 'A#-dur',
      'scale.B': 'H-dur',

      'home.mode': 'Način',
      'mode.easy': 'Lako (kvinta)',
      'mode.normal': 'Normalno (1 oktava)',
      'mode.hard': 'Teško (2 oktave)',

      'home.settings': 'Postavke',
      'settings.showNoteNames': 'Prikaži nazive nota',
      'settings.scaleOnly': 'Samo odabrana durska ljestvica',
      'settings.soundOn': 'Zvuk uključen',

      'home.achievements': 'Postignuća',
      'ach.easy': 'Najbolje (Lako)',
      'ach.normal': 'Najbolje (Normalno)',
      'ach.hard': 'Najbolje (Teško)',
      'ach.knowKey': 'Know the key (najbolje)',
      'ach.knowScale': 'Know the scale (najbolje)',

      'home.flip': 'OKRENI TELEFON ZA IGRU',
      'home.play': 'Igraj',

      'lang.title': 'Jezik',
      'lang.close': 'Zatvori',

      'help.title': 'Pomoć',
      'help.back': 'Natrag',
      'help.index': 'Sadržaj',
      'help.idx.what': 'Što je PianoMemories?',
      'help.idx.benefits': 'Kako pomaže',
      'help.idx.how': 'Kako igrati',
      'help.idx.games': 'Igre',
      'help.idx.knowKey': 'Know the key',
      'help.idx.knowScale': 'Know the scale',
      'help.idx.scale': 'Ljestvica i nasumični tonalitet',
      'help.idx.modes': 'Načini (Memory)',
      'help.idx.play': 'Ekran igre',
      'help.idx.settings': 'Postavke',
      'help.idx.ach': 'Postignuća i Maks',
      'help.idx.mistakes': 'Pogreške i restart',
      'help.idx.tips': 'Savjeti',

      'help.what.title': 'Što je PianoMemories?',
      'help.what.body': 'PianoMemories je igra pamćenja poput Simona na klavijaturi. Aplikacija svira sve dulji niz nota, a vi ga ponavljate dodirom tipki.',
      'help.benefits.title': 'Kako pomaže',
      'help.benefits.body': 'Trenira glazbeno pamćenje, prepoznavanje visine i povezivanje prstiju s notama. Igranje unutar odabranog dura učvršćuje svijest o ljestvici i čestim obrascima.',
      'help.how.title': 'Kako igrati',
      'help.how.li1': 'Odaberite igru (Memory / Know the key / Know the scale).',
      'help.how.li2': 'Odaberite ljestvicu (koristi Memory i Know the scale).',
      'help.how.li3': 'Ako igrate Memory, odaberite način (Lako / Normalno / Teško).',
      'help.how.li4': 'Okrenite telefon vodoravno i dodirnite Igraj.',
      'help.how.li5': 'Pratite upute u gornjoj traci i dodirnite točne tipke.',

      'help.games.title': 'Igre',
      'help.games.li1': '<strong>Memory</strong>: aplikacija svira sve dulji niz, a vi ga ponavljate.',
      'help.games.li2': '<strong>Know the key</strong>: trening reakcije za pronalaženje nasumičnih nota.',
      'help.games.li3': '<strong>Know the scale</strong>: trening brzine za sviranje durske ljestvice po redu.',
      'help.games.li4': '<strong>Načini</strong> vrijede samo za Memory.',

      'help.knowKey.title': 'Know the key',
      'help.knowKey.li1': 'Dodirnite <strong>Igraj</strong> za odbrojavanje 3-2-1.',
      'help.knowKey.li2': 'U sredini se prikaže naziv note (npr. <strong>C#</strong>) i čuje se ton.',
      'help.knowKey.li3': 'Dodirnite odgovarajuću tipku što brže možete.',
      'help.knowKey.li4': 'Ima 12 rundi (svaka nota jednom). Pogrešan dodir završava rundu.',
      'help.knowKey.li5': 'Na kraju se prikaže ukupno vrijeme i sprema se kao najbolje.',

      'help.knowScale.title': 'Know the scale',
      'help.knowScale.li1': 'Odaberite ljestvicu (ili nasumičnu) i dodirnite <strong>Igraj</strong>.',
      'help.knowScale.li2': 'U sredini se prikaže naziv ljestvice (npr. <strong>D-dur</strong>).',
      'help.knowScale.li3': 'Odsvirajte 7 tonova durske ljestvice točnim redom od osnove.',
      'help.knowScale.li4': 'Pogrešna nota ili redoslijed završava rundu.',
      'help.knowScale.li5': 'Vrijeme se mjeri za cijelu sekvencu od 7 nota i sprema se kao najbolje.',
      'help.scale.title': 'Ljestvica i nasumični tonalitet',
      'help.scale.li1': '<strong>Memory</strong>: igra bira note samo iz odabrane durske ljestvice.',
      'help.scale.li2': '<strong>Know the scale</strong>: koristi odabranu ljestvicu; ako je Nasumično, svaki restart bira novu.',
      'help.scale.li3': '<strong>Know the key</strong>: postavka ljestvice se ignorira (tipkovnica je uvijek C4–B4).',
      'help.modes.title': 'Načini (Memory)',
      'help.modes.li0': '<strong>Načini</strong> utječu samo na igru Memory.',
      'help.modes.li1': '<strong>Lako (kvinta)</strong>: manji prozor tipkovnice od osnove do kvinte.',
      'help.modes.li2': '<strong>Normalno (1 oktava)</strong>: note obuhvaćaju jednu oktavu od osnove.',
      'help.modes.li3': '<strong>Teško (2 oktave)</strong>: note obuhvaćaju dvije oktave od osnove.',
      'help.play.title': 'Ekran igre',
      'help.play.li1': '<strong>Gornja traka</strong>: prikazuje status i upute za odabranu igru. Memory prikazuje ljestvicu/način/razinu; ostale igre prikazuju središnji okvir s uputom.',
      'help.play.li2': '<strong>Plavo osvjetljenje</strong>: note koje svira aplikacija tijekom niza.',
      'help.play.li3': '<strong>Crveno osvjetljenje</strong>: vaši dodiri tijekom ponavljanja.',
      'help.play.li4': '<strong>Maks</strong>: prikazuje najbolje za odabranu igru (najbolja razina za Memory, najbolje vrijeme za ostale).',
      'help.settings.title': 'Postavke',
      'help.settings.li0': '<strong>Prikaži nazive nota</strong> je onemogućeno u Know the key i Know the scale.',
      'help.settings.li1': '<strong>Prikaži nazive nota</strong>: prikazuje oznake na tipkama (samo Memory).',
      'help.settings.li2': '<strong>Samo odabrana durska ljestvica</strong>: kad je uključeno, oznake se prikazuju samo za note u odabranoj ljestvici.',
      'help.settings.li3': '<strong>Zvuk uključen</strong>: koristi uzorke klavira (ili zamjenski ton ako nedostaju).',
      'help.ach.title': 'Postignuća i Maks',
      'help.ach.li1': '<strong>Postignuća</strong> prikazuju najbolje razine za Memory načine i najbolja vremena za ostale igre.',
      'help.ach.li2': '<strong>Maks</strong> (zeleno) prikazuje najbolje za trenutno odabranu igru.',
      'help.mistakes.title': 'Pogreške i restart',
      'help.mistakes.li1': 'Ako dodirnete pogrešnu notu, vidjet ćete poruku i unos se zaustavlja za tu rundu.',
      'help.mistakes.li2': 'Dodirnite bilo gdje da zatvorite poruku.',
      'help.mistakes.li3': 'Pritisnite <strong>Ponovno</strong> za novi početak i pokušaj.',
      'help.mistakes.li4': 'Ako okrenete telefon u portret tijekom aktivne runde, igra se pauzira. Ako okrenete u portret tijekom Kraj igre, stanje Kraj igre se uklanja. Promjena postavki u portret modu resetira pauziranu rundu.',
      'help.tips.title': 'Savjeti',
      'help.tips.li1': 'Počnite s načinom Lako i jednim tonalitetom (C-dur), zatim dodajte ostale.',
      'help.tips.li2': 'Koristite „Samo odabrana durska ljestvica” za fokus na tonove ljestvice.',
      'help.tips.li3': 'Isprobajte nasumični tonalitet za prepoznavanje svih durskih ljestvica.',

      'play.home': 'Početna',
      'play.ready': 'Spremno',
      'play.level': 'Razina',
      'play.max': 'Maks',
      'play.play': 'Igraj',
      'play.restart': 'Ponovno',
      'play.tapToBegin': 'Dodirnite Igraj za početak',
      'play.wrong': 'Pogrešna nota! Pokušaj ponovno',

      'kk.total': 'Ukupno: {t} ({i}/{n})',
      'kk.final': 'Ukupno: {t}',
      'ks.time': 'Vrijeme: {t} ({i}/7)',
      'ks.final': 'Vrijeme: {t}',

      'status.listen': 'Slušaj…',
      'status.listenCount': 'Slušaj… ({i}/{n})',
      'status.yourTurn': 'Tvoj red',
      'status.won': 'Sljedeća runda',
      'status.paused': 'Pauza',
      'status.tryAgain': 'Pokušaj ponovno',
      'status.gameOver': 'Kraj igre',

      'gameOver.body': '<div class="gameover-banner"><div class="go-line1">Pogrešna nota</div><div class="go-line2">Kraj igre</div><div class="go-line3">Dodirni <strong>Ponovno</strong> za novi pokušaj</div></div>',

      'error.noPlayable': 'Nema nota u rasponu',
      'scale.prefix': 'Ljestvica: {name}',
      'mode.prefix': 'Način: {name}',
    },

    pl: {
      'orientation.rotate': 'Obróć urządzenie poziomo, aby grać.',
      'app.title': 'PianoMemories',
      'home.help': 'Pomoc',
      'home.scale': 'Skala',

      'home.games': 'Gry',
      'game.memory': 'Memory',
      'game.knowKey': 'Know the key',
      'game.knowScale': 'Know the scale',
      'scale.random': 'Losowa tonacja',
      'scale.C': 'C-dur',
      'scale.C#': 'C#-dur',
      'scale.D': 'D-dur',
      'scale.D#': 'D#-dur',
      'scale.E': 'E-dur',
      'scale.F': 'F-dur',
      'scale.F#': 'F#-dur',
      'scale.G': 'G-dur',
      'scale.G#': 'G#-dur',
      'scale.A': 'A-dur',
      'scale.A#': 'A#-dur',
      'scale.B': 'H-dur',

      'home.mode': 'Tryb',
      'mode.easy': 'Łatwy (kwinta)',
      'mode.normal': 'Normalny (1 oktawa)',
      'mode.hard': 'Trudny (2 oktawy)',

      'home.settings': 'Ustawienia',
      'settings.showNoteNames': 'Pokaż nazwy nut',
      'settings.scaleOnly': 'Tylko wybrana skala durowa',
      'settings.soundOn': 'Dźwięk włączony',

      'home.achievements': 'Osiągnięcia',
      'ach.easy': 'Najlepszy (Łatwy)',
      'ach.normal': 'Najlepszy (Normalny)',
      'ach.hard': 'Najlepszy (Trudny)',
      'ach.knowKey': 'Know the key (najlepszy)',
      'ach.knowScale': 'Know the scale (najlepszy)',

      'home.flip': 'OBRÓĆ TELEFON, ABY GRAĆ',
      'home.play': 'Graj',

      'lang.title': 'Język',
      'lang.close': 'Zamknij',

      'help.title': 'Pomoc',
      'help.back': 'Wróć',
      'help.index': 'Spis treści',
      'help.idx.what': 'Czym jest PianoMemories?',
      'help.idx.benefits': 'Jak pomaga',
      'help.idx.how': 'Jak grać',
      'help.idx.games': 'Gry',
      'help.idx.knowKey': 'Know the key',
      'help.idx.knowScale': 'Know the scale',
      'help.idx.scale': 'Skala i losowa tonacja',
      'help.idx.modes': 'Tryby (Memory)',
      'help.idx.play': 'Ekran gry',
      'help.idx.settings': 'Ustawienia',
      'help.idx.ach': 'Osiągnięcia i Max',
      'help.idx.mistakes': 'Pomyłki i restart',
      'help.idx.tips': 'Wskazówki',

      'help.what.title': 'Czym jest PianoMemories?',
      'help.what.body': 'PianoMemories to gra pamięciowa w stylu „Simon” na klawiaturze fortepianu. Aplikacja odtwarza coraz dłuższą sekwencję nut, a Ty ją powtarzasz, stukając w klawisze.',
      'help.benefits.title': 'Jak pomaga',
      'help.benefits.body': 'Trenuje pamięć muzyczną, rozpoznawanie wysokości i skojarzenie palców z dźwiękami. Gra w wybranej tonacji durowej wzmacnia też świadomość skali i typowych wzorców.',
      'help.how.title': 'Jak grać',
      'help.how.li1': 'Wybierz grę (Memory / Know the key / Know the scale).',
      'help.how.li2': 'Wybierz Skalę (używa jej Memory i Know the scale).',
      'help.how.li3': 'Jeśli grasz w Memory, wybierz tryb (Łatwy / Normalny / Trudny).',
      'help.how.li4': 'Obróć telefon poziomo i stuknij Graj.',
      'help.how.li5': 'Kieruj się podpowiedzią na górnym pasku i stukaj właściwe klawisze.',

      'help.games.title': 'Gry',
      'help.games.li1': '<strong>Memory</strong>: aplikacja odtwarza coraz dłuższą sekwencję, a Ty ją powtarzasz.',
      'help.games.li2': '<strong>Know the key</strong>: trening czasu reakcji na losowe nuty.',
      'help.games.li3': '<strong>Know the scale</strong>: trening szybkości grania skali durowej po kolei.',
      'help.games.li4': '<strong>Tryby</strong> dotyczą tylko gry Memory.',

      'help.knowKey.title': 'Know the key',
      'help.knowKey.li1': 'Stuknij <strong>Graj</strong>, aby rozpocząć odliczanie 3-2-1.',
      'help.knowKey.li2': 'W środkowym polu pojawi się nazwa nuty (np. <strong>C#</strong>) i zabrzmi jej dźwięk.',
      'help.knowKey.li3': 'Stuknij pasujący klawisz jak najszybciej.',
      'help.knowKey.li4': 'Jest 12 rund (każda nuta raz). Błędny klawisz kończy próbę.',
      'help.knowKey.li5': 'Na końcu zobaczysz łączny czas i zapisze się on jako najlepszy.',

      'help.knowScale.title': 'Know the scale',
      'help.knowScale.li1': 'Wybierz Skalę (lub Losowa tonacja) i stuknij <strong>Graj</strong>.',
      'help.knowScale.li2': 'Środkowe pole pokazuje nazwę skali (np. <strong>D-dur</strong>).',
      'help.knowScale.li3': 'Zagraj 7 dźwięków skali durowej w dokładnej kolejności od prymy.',
      'help.knowScale.li4': 'Błędna nuta lub kolejność kończy próbę.',
      'help.knowScale.li5': 'Czas mierzony jest dla całej sekwencji 7 nut i zapisywany jako najlepszy.',
      'help.scale.title': 'Skala i losowa tonacja',
      'help.scale.li1': '<strong>Memory</strong>: gra wybiera nuty tylko z wybranej tonacji durowej.',
      'help.scale.li2': '<strong>Know the scale</strong>: używa wybranej Skali; jeśli jest Losowa, każdy restart wybiera nową.',
      'help.scale.li3': '<strong>Know the key</strong>: ustawienie Skala jest ignorowane (klawiatura zawsze C4–B4).',
      'help.modes.title': 'Tryby (Memory)',
      'help.modes.li0': '<strong>Tryby</strong> wpływają tylko na grę Memory.',
      'help.modes.li1': '<strong>Łatwy (kwinta)</strong>: mniejsze okno klawiatury od podstawy do kwinty.',
      'help.modes.li2': '<strong>Normalny (1 oktawa)</strong>: nuty obejmują jedną oktawę od podstawy.',
      'help.modes.li3': '<strong>Trudny (2 oktawy)</strong>: nuty obejmują dwie oktawy od podstawy.',
      'help.play.title': 'Ekran gry',
      'help.play.li1': '<strong>Pasek górny</strong>: pokazuje status i podpowiedź dla wybranej gry. Memory pokazuje Skala/Tryb/Poziom; pozostałe gry pokazują środkowe pole z podpowiedzią.',
      'help.play.li2': '<strong>Niebieskie podświetlenie</strong>: nuty odtwarzane przez aplikację podczas sekwencji.',
      'help.play.li3': '<strong>Czerwone podświetlenie</strong>: Twoje stuknięcia podczas powtarzania.',
      'help.play.li4': '<strong>Max</strong>: pokazuje najlepszy wynik dla wybranej gry (poziom dla Memory, czas dla pozostałych).',
      'help.settings.title': 'Ustawienia',
      'help.settings.li0': '<strong>Pokaż nazwy nut</strong> jest wyłączone w Know the key i Know the scale.',
      'help.settings.li1': '<strong>Pokaż nazwy nut</strong>: wyświetla etykiety na klawiszach (tylko Memory).',
      'help.settings.li2': '<strong>Tylko wybrana skala durowa</strong>: gdy włączone, etykiety pokazują się tylko dla nut należących do wybranej skali.',
      'help.settings.li3': '<strong>Dźwięk włączony</strong>: używa sampli fortepianu (lub tonu zastępczego, jeśli brak).',
      'help.ach.title': 'Osiągnięcia i Max',
      'help.ach.li1': '<strong>Osiągnięcia</strong> pokazują najlepsze poziomy dla trybów Memory oraz najlepsze czasy dla pozostałych gier.',
      'help.ach.li2': '<strong>Max</strong> (zielone) pokazuje najlepszy wynik dla aktualnie wybranej gry.',
      'help.mistakes.title': 'Pomyłki i restart',
      'help.mistakes.li1': 'Jeśli stukniesz złą nutę, zobaczysz komunikat i wejście zostanie zatrzymane dla tej próby.',
      'help.mistakes.li2': 'Stuknij gdziekolwiek, aby zamknąć komunikat.',
      'help.mistakes.li3': 'Naciśnij <strong>Restart</strong>, aby zacząć od nowa i spróbować ponownie.',
      'help.mistakes.li4': 'Jeśli obrócisz telefon do trybu portretu podczas aktywnej rundy, gra zostanie wstrzymana. Obrócenie do portretu podczas "Koniec gry" usuwa stan Koniec gry. Zmiana ustawien w trybie portretu zresetuje wstrzymana runde.',
      'help.tips.title': 'Wskazówki',
      'help.tips.li1': 'Zacznij od trybu Łatwy i jednej tonacji (C-dur), potem dodawaj kolejne.',
      'help.tips.li2': 'Użyj „Tylko wybrana skala durowa”, aby skupić się na dźwiękach skali.',
      'help.tips.li3': 'Wypróbuj Losowa tonacja, aby szybciej rozpoznawać wszystkie tonacje durowe.',

      'play.home': 'Start',
      'play.ready': 'Gotowe',
      'play.level': 'Poziom',
      'play.max': 'Max',
      'play.play': 'Graj',
      'play.restart': 'Restart',
      'play.tapToBegin': 'Stuknij Graj, aby zacząć',
      'play.wrong': 'Zła nuta! Spróbuj ponownie',

      'kk.total': 'Suma: {t} ({i}/{n})',
      'kk.final': 'Suma: {t}',
      'ks.time': 'Czas: {t} ({i}/7)',
      'ks.final': 'Czas: {t}',

      'status.listen': 'Słuchaj…',
      'status.listenCount': 'Słuchaj… ({i}/{n})',
      'status.yourTurn': 'Twoja kolej',
      'status.won': 'Następna runda',
      'status.paused': 'Pauza',
      'status.tryAgain': 'Spróbuj ponownie',
      'status.gameOver': 'Koniec gry',

      'gameOver.body': '<div class="gameover-banner"><div class="go-line1">Zła nuta</div><div class="go-line2">Koniec gry</div><div class="go-line3">Stuknij <strong>Restart</strong>, aby spróbować ponownie</div></div>',

      'error.noPlayable': 'Brak nut w zakresie',
      'scale.prefix': 'Skala: {name}',
      'mode.prefix': 'Tryb: {name}',
    },

    it: {
      'orientation.rotate': 'Ruota il dispositivo in orizzontale per giocare.',
      'app.title': 'PianoMemories',
      'home.help': 'Aiuto',
      'home.scale': 'Scala',

      'home.games': 'Giochi',
      'game.memory': 'Memory',
      'game.knowKey': 'Know the key',
      'game.knowScale': 'Know the scale',
      'scale.random': 'Tonalità casuale',
      'scale.C': 'Do maggiore',
      'scale.C#': 'Do# maggiore',
      'scale.D': 'Re maggiore',
      'scale.D#': 'Re# maggiore',
      'scale.E': 'Mi maggiore',
      'scale.F': 'Fa maggiore',
      'scale.F#': 'Fa# maggiore',
      'scale.G': 'Sol maggiore',
      'scale.G#': 'Sol# maggiore',
      'scale.A': 'La maggiore',
      'scale.A#': 'La# maggiore',
      'scale.B': 'Si maggiore',

      'home.mode': 'Modalità',
      'mode.easy': 'Facile (quinta)',
      'mode.normal': 'Normale (1 ottava)',
      'mode.hard': 'Difficile (2 ottave)',

      'home.settings': 'Impostazioni',
      'settings.showNoteNames': 'Mostra i nomi delle note',
      'settings.scaleOnly': 'Solo la scala maggiore selezionata',
      'settings.soundOn': 'Audio attivo',

      'home.achievements': 'Traguardi',
      'ach.easy': 'Migliore (Facile)',
      'ach.normal': 'Migliore (Normale)',
      'ach.hard': 'Migliore (Difficile)',
      'ach.knowKey': 'Know the key (migliore)',
      'ach.knowScale': 'Know the scale (migliore)',

      'home.flip': 'GIRA IL TELEFONO PER GIOCARE',
      'home.play': 'Gioca',

      'lang.title': 'Lingua',
      'lang.close': 'Chiudi',

      'help.title': 'Aiuto',
      'help.back': 'Indietro',
      'help.index': 'Indice',
      'help.idx.what': 'Cos’è PianoMemories?',
      'help.idx.benefits': 'Come ti aiuta',
      'help.idx.how': 'Come giocare',
      'help.idx.games': 'Giochi',
      'help.idx.knowKey': 'Know the key',
      'help.idx.knowScale': 'Know the scale',
      'help.idx.scale': 'Scala e tonalità casuale',
      'help.idx.modes': 'Modalità (Memory)',
      'help.idx.play': 'Schermata di gioco',
      'help.idx.settings': 'Impostazioni',
      'help.idx.ach': 'Traguardi e Max',
      'help.idx.mistakes': 'Errori e riavvio',
      'help.idx.tips': 'Consigli',

      'help.what.title': 'Cos’è PianoMemories?',
      'help.what.body': 'PianoMemories è un gioco di memoria in stile Simon su una tastiera di pianoforte. L’app riproduce una sequenza di note sempre più lunga e tu la ripeti toccando i tasti.',
      'help.benefits.title': 'Come ti aiuta',
      'help.benefits.body': 'Allena la memoria musicale, il riconoscimento dell’altezza e l’associazione dita-nota. Restando in una tonalità maggiore scelta, rafforza anche la consapevolezza della scala e dei pattern comuni.',
      'help.how.title': 'Come giocare',
      'help.how.li1': 'Scegli un gioco (Memory / Know the key / Know the scale).',
      'help.how.li2': 'Scegli una Scala (usata da Memory e Know the scale).',
      'help.how.li3': 'Se giochi a Memory, scegli una modalità (Facile / Normale / Difficile).',
      'help.how.li4': 'Gira il telefono in orizzontale e tocca Gioca.',
      'help.how.li5': 'Segui il prompt nella barra in alto e tocca i tasti corretti.',

      'help.games.title': 'Giochi',
      'help.games.li1': '<strong>Memory</strong>: l’app riproduce una sequenza crescente e tu la ripeti.',
      'help.games.li2': '<strong>Know the key</strong>: allenamento del tempo di reazione su note casuali.',
      'help.games.li3': '<strong>Know the scale</strong>: allenamento di velocità per suonare una scala maggiore in ordine.',
      'help.games.li4': '<strong>Modalità</strong> solo per Memory.',

      'help.knowKey.title': 'Know the key',
      'help.knowKey.li1': 'Tocca <strong>Gioca</strong> per iniziare il conto alla rovescia 3-2-1.',
      'help.knowKey.li2': 'Nel riquadro centrale appare il nome della nota (es: <strong>C#</strong>) e viene riprodotto il suono.',
      'help.knowKey.li3': 'Tocca il tasto corrispondente il più velocemente possibile.',
      'help.knowKey.li4': 'Ci sono 12 round (ogni nota una volta). Un errore termina la partita.',
      'help.knowKey.li5': 'Il tempo totale viene mostrato alla fine e salvato come migliore.',

      'help.knowScale.title': 'Know the scale',
      'help.knowScale.li1': 'Scegli una Scala (o Tonalità casuale) e tocca <strong>Gioca</strong>.',
      'help.knowScale.li2': 'Il riquadro centrale mostra il nome della scala (es: <strong>Re maggiore</strong>).',
      'help.knowScale.li3': 'Suona le 7 note della scala maggiore in ordine esatto partendo dalla fondamentale.',
      'help.knowScale.li4': 'Una nota sbagliata o fuori ordine termina la partita.',
      'help.knowScale.li5': 'Il tempo è misurato sull’intera sequenza di 7 note e salvato come migliore.',
      'help.scale.title': 'Scala e tonalità casuale',
      'help.scale.li1': '<strong>Memory</strong>: il gioco sceglie note solo dalla scala maggiore selezionata.',
      'help.scale.li2': '<strong>Know the scale</strong>: usa la Scala selezionata; con Tonalità casuale, ogni restart sceglie una nuova scala.',
      'help.scale.li3': '<strong>Know the key</strong>: l’impostazione Scala è ignorata (tastiera sempre C4–B4).',
      'help.modes.title': 'Modalità (Memory)',
      'help.modes.li0': '<strong>Modalità</strong> influiscono solo su Memory.',
      'help.modes.li1': '<strong>Facile (quinta)</strong>: finestra più piccola dalla fondamentale alla quinta.',
      'help.modes.li2': '<strong>Normale (1 ottava)</strong>: note su un’ottava dalla fondamentale.',
      'help.modes.li3': '<strong>Difficile (2 ottave)</strong>: note su due ottave dalla fondamentale.',
      'help.play.title': 'Schermata di gioco',
      'help.play.li1': '<strong>Barra superiore</strong>: mostra lo stato e un prompt per il gioco selezionato. Memory mostra Scala/Modalità/Livello; gli altri giochi mostrano un riquadro centrale.',
      'help.play.li2': '<strong>Evidenziazione blu</strong>: note riprodotte dall’app durante la sequenza.',
      'help.play.li3': '<strong>Evidenziazione rossa</strong>: i tuoi tocchi mentre ripeti la sequenza.',
      'help.play.li4': '<strong>Max</strong>: mostra il miglior risultato per il gioco selezionato (livello per Memory, tempo per gli altri).',
      'help.settings.title': 'Impostazioni',
      'help.settings.li0': '<strong>Mostra i nomi delle note</strong> è disattivato in Know the key e Know the scale.',
      'help.settings.li1': '<strong>Mostra i nomi delle note</strong>: mostra le etichette sui tasti (solo Memory).',
      'help.settings.li2': '<strong>Solo la scala maggiore selezionata</strong>: se attivo, mostra etichette solo per le note della scala selezionata.',
      'help.settings.li3': '<strong>Audio attivo</strong>: abilita i campioni di pianoforte (o un tono di fallback).',
      'help.ach.title': 'Traguardi e Max',
      'help.ach.li1': '<strong>Traguardi</strong> nella home mostrano i migliori livelli per le modalità di Memory e i migliori tempi per gli altri giochi.',
      'help.ach.li2': '<strong>Max</strong> (verde) mostra il migliore per il gioco selezionato.',
      'help.mistakes.title': 'Errori e riavvio',
      'help.mistakes.li1': 'Se tocchi una nota sbagliata, vedrai un messaggio e l\u2019input si fermerà per quella partita.',
      'help.mistakes.li2': 'Tocca ovunque per chiudere il messaggio.',
      'help.mistakes.li3': 'Premi <strong>Restart</strong> per ricominciare e riprovare.',
      'help.mistakes.li4': 'Se giri il telefono in verticale durante una partita attiva, il gioco viene messo in pausa. Se giri in verticale durante Game Over, lo stato Game Over viene rimosso. Modificare le impostazioni in verticale resetta la partita in pausa.',
      'help.tips.title': 'Consigli',
      'help.tips.li1': 'Inizia con Facile e una tonalità (Do maggiore), poi aggiungine altre.',
      'help.tips.li2': 'Usa “Solo la scala maggiore selezionata” per concentrarti sui gradi della scala.',
      'help.tips.li3': 'Prova Tonalità casuale per allenare il riconoscimento in tutte le tonalità maggiori.',

      'play.home': 'Home',
      'play.ready': 'Pronto',
      'play.level': 'Livello',
      'play.max': 'Max',
      'play.play': 'Gioca',
      'play.restart': 'Restart',
      'play.tapToBegin': 'Tocca Gioca per iniziare',
      'play.wrong': 'Nota sbagliata! Riprova',

      'kk.total': 'Totale: {t} ({i}/{n})',
      'kk.final': 'Totale: {t}',
      'ks.time': 'Tempo: {t} ({i}/7)',
      'ks.final': 'Tempo: {t}',

      'status.listen': 'Ascolta…',
      'status.listenCount': 'Ascolta… ({i}/{n})',
      'status.yourTurn': 'Tocca a te',
      'status.won': 'Prossimo round',
      'status.paused': 'In pausa',
      'status.tryAgain': 'Riprova',
      'status.gameOver': 'Game Over',

      'gameOver.body': '<div class="gameover-banner"><div class="go-line1">Nota sbagliata</div><div class="go-line2">Game Over</div><div class="go-line3">Tocca <strong>Restart</strong> per riprovare</div></div>',

      'error.noPlayable': 'Nessuna nota disponibile nell’intervallo',
      'scale.prefix': 'Scala: {name}',
      'mode.prefix': 'Modalità: {name}',
    },

    es: {
      'orientation.rotate': 'Gira el dispositivo a horizontal para jugar.',
      'app.title': 'PianoMemories',
      'home.help': 'Ayuda',
      'home.scale': 'Escala',

      'home.games': 'Juegos',
      'game.memory': 'Memory',
      'game.knowKey': 'Know the key',
      'game.knowScale': 'Know the scale',
      'scale.random': 'Tonalidad aleatoria',
      'scale.C': 'Do mayor',
      'scale.C#': 'Do# mayor',
      'scale.D': 'Re mayor',
      'scale.D#': 'Re# mayor',
      'scale.E': 'Mi mayor',
      'scale.F': 'Fa mayor',
      'scale.F#': 'Fa# mayor',
      'scale.G': 'Sol mayor',
      'scale.G#': 'Sol# mayor',
      'scale.A': 'La mayor',
      'scale.A#': 'La# mayor',
      'scale.B': 'Si mayor',

      'home.mode': 'Modo',
      'mode.easy': 'Fácil (quinta)',
      'mode.normal': 'Normal (1 octava)',
      'mode.hard': 'Difícil (2 octavas)',

      'home.settings': 'Ajustes',
      'settings.showNoteNames': 'Mostrar nombres de notas',
      'settings.scaleOnly': 'Solo la escala mayor seleccionada',
      'settings.soundOn': 'Sonido activado',

      'home.achievements': 'Logros',
      'ach.easy': 'Mejor (Fácil)',
      'ach.normal': 'Mejor (Normal)',
      'ach.hard': 'Mejor (Difícil)',
      'ach.knowKey': 'Know the key (mejor)',
      'ach.knowScale': 'Know the scale (mejor)',

      'home.flip': 'GIRA EL TELÉFONO PARA JUGAR',
      'home.play': 'Jugar',

      'lang.title': 'Idioma',
      'lang.close': 'Cerrar',

      'help.title': 'Ayuda',
      'help.back': 'Atrás',
      'help.index': 'Índice',
      'help.idx.what': '¿Qué es PianoMemories?',
      'help.idx.benefits': 'Cómo te ayuda',
      'help.idx.how': 'Cómo jugar',
      'help.idx.games': 'Juegos',
      'help.idx.knowKey': 'Know the key',
      'help.idx.knowScale': 'Know the scale',
      'help.idx.scale': 'Escala y tonalidad aleatoria',
      'help.idx.modes': 'Modos (Memory)',
      'help.idx.play': 'Pantalla de juego',
      'help.idx.settings': 'Ajustes',
      'help.idx.ach': 'Logros y Max',
      'help.idx.mistakes': 'Errores y reinicio',
      'help.idx.tips': 'Consejos',

      'help.what.title': '¿Qué es PianoMemories?',
      'help.what.body': 'PianoMemories es un juego de memoria estilo Simon en un teclado de piano. La app reproduce una secuencia de notas cada vez más larga y tú la repites tocando las teclas.',
      'help.benefits.title': 'Cómo te ayuda',
      'help.benefits.body': 'Entrena la memoria musical, el reconocimiento de alturas y la relación dedo-nota. Al permanecer en una tonalidad mayor elegida, también refuerza la conciencia de la escala y patrones comunes.',
      'help.how.title': 'Cómo jugar',
      'help.how.li1': 'Elige un juego (Memory / Know the key / Know the scale).',
      'help.how.li2': 'Elige una Escala (la usan Memory y Know the scale).',
      'help.how.li3': 'Si juegas a Memory, elige un modo (Fácil / Normal / Difícil).',
      'help.how.li4': 'Gira el teléfono a horizontal y toca Jugar.',
      'help.how.li5': 'Sigue el prompt en la barra superior y toca las teclas correctas.',

      'help.games.title': 'Juegos',
      'help.games.li1': '<strong>Memory</strong>: la app reproduce una secuencia creciente y tú la repites.',
      'help.games.li2': '<strong>Know the key</strong>: entrenamiento de tiempo de reacción con notas aleatorias.',
      'help.games.li3': '<strong>Know the scale</strong>: entrenamiento de velocidad para tocar una escala mayor en orden.',
      'help.games.li4': '<strong>Modos</strong> solo para Memory.',

      'help.knowKey.title': 'Know the key',
      'help.knowKey.li1': 'Toca <strong>Jugar</strong> para iniciar la cuenta atrás 3-2-1.',
      'help.knowKey.li2': 'En el cuadro central aparece el nombre de la nota (ej.: <strong>C#</strong>) y se reproduce su sonido.',
      'help.knowKey.li3': 'Toca la tecla correspondiente lo más rápido posible.',
      'help.knowKey.li4': 'Hay 12 rondas (cada nota una vez). Un fallo termina la partida.',
      'help.knowKey.li5': 'El tiempo total se muestra al final y se guarda como tu mejor.',

      'help.knowScale.title': 'Know the scale',
      'help.knowScale.li1': 'Elige una Escala (o Tonalidad aleatoria) y toca <strong>Jugar</strong>.',
      'help.knowScale.li2': 'El cuadro central muestra el nombre de la escala (ej.: <strong>Re Mayor</strong>).',
      'help.knowScale.li3': 'Toca las 7 notas de la escala mayor en orden exacto empezando por la tónica.',
      'help.knowScale.li4': 'Una nota incorrecta o fuera de orden termina la partida.',
      'help.knowScale.li5': 'El tiempo se mide para toda la secuencia de 7 notas y se guarda como tu mejor.',
      'help.scale.title': 'Escala y tonalidad aleatoria',
      'help.scale.li1': '<strong>Memory</strong>: el juego elige notas solo de la escala mayor seleccionada.',
      'help.scale.li2': '<strong>Know the scale</strong>: usa la Escala seleccionada; si es Aleatoria, cada reinicio elige una nueva.',
      'help.scale.li3': '<strong>Know the key</strong>: el ajuste de Escala se ignora (teclado siempre C4–B4).',
      'help.modes.title': 'Modos (Memory)',
      'help.modes.li0': '<strong>Modos</strong> solo afectan a Memory.',
      'help.modes.li1': '<strong>Fácil (quinta)</strong>: ventana más pequeña desde la raíz hasta la quinta.',
      'help.modes.li2': '<strong>Normal (1 octava)</strong>: notas en una octava desde la raíz.',
      'help.modes.li3': '<strong>Difícil (2 octavas)</strong>: notas en dos octavas desde la raíz.',
      'help.play.title': 'Pantalla de juego',
      'help.play.li1': '<strong>Barra superior</strong>: muestra el estado y un prompt para el juego seleccionado. Memory muestra Escala/Modo/Nivel; los otros juegos muestran un cuadro central.',
      'help.play.li2': '<strong>Resaltado azul</strong>: notas tocadas por la app durante la secuencia.',
      'help.play.li3': '<strong>Resaltado rojo</strong>: tus toques al repetir.',
      'help.play.li4': '<strong>Max</strong>: muestra tu mejor resultado para el juego seleccionado (nivel para Memory, tiempo para los otros).',
      'help.settings.title': 'Ajustes',
      'help.settings.li0': '<strong>Mostrar nombres de notas</strong> está desactivado en Know the key y Know the scale.',
      'help.settings.li1': '<strong>Mostrar nombres de notas</strong>: muestra etiquetas en las teclas (solo Memory).',
      'help.settings.li2': '<strong>Solo la escala mayor seleccionada</strong>: si está activado, muestra etiquetas solo para notas de la escala seleccionada.',
      'help.settings.li3': '<strong>Sonido activado</strong>: habilita muestras de piano (o un tono de respaldo).',
      'help.ach.title': 'Logros y Max',
      'help.ach.li1': '<strong>Logros</strong> muestran los mejores niveles para los modos de Memory y los mejores tiempos para los otros juegos.',
      'help.ach.li2': '<strong>Max</strong> (verde) muestra el mejor resultado para el juego seleccionado.',
      'help.mistakes.title': 'Errores y reinicio',
      'help.mistakes.li1': 'Si tocas una nota incorrecta, verás un mensaje y la entrada se detendrá para esa partida.',
      'help.mistakes.li2': 'Toca en cualquier lugar para cerrar el mensaje.',
      'help.mistakes.li3': 'Pulsa <strong>Reiniciar</strong> para empezar de nuevo e intentarlo otra vez.',
      'help.mistakes.li4': 'Si giras el telefono a vertical durante una ronda activa, el juego se pausa. Si giras a vertical durante Fin de la partida, el estado se descarta. Cambiar ajustes en vertical reiniciara la ronda pausada.',
      'help.tips.title': 'Consejos',
      'help.tips.li1': 'Empieza con el modo Fácil y una tonalidad (Do mayor), luego añade más.',
      'help.tips.li2': 'Usa “Solo la escala mayor seleccionada” para centrarte en los grados de la escala.',
      'help.tips.li3': 'Prueba Tonalidad aleatoria para entrenar el reconocimiento de todas las tonalidades mayores.',

      'play.home': 'Inicio',
      'play.ready': 'Listo',
      'play.level': 'Nivel',
      'play.max': 'Max',
      'play.play': 'Jugar',
      'play.restart': 'Reiniciar',
      'play.tapToBegin': 'Toca Jugar para empezar',
      'play.wrong': '¡Nota incorrecta! Inténtalo de nuevo',

      'kk.total': 'Total: {t} ({i}/{n})',
      'kk.final': 'Total: {t}',
      'ks.time': 'Tiempo: {t} ({i}/7)',
      'ks.final': 'Tiempo: {t}',

      'status.listen': 'Escucha…',
      'status.listenCount': 'Escucha… ({i}/{n})',
      'status.yourTurn': 'Tu turno',
      'status.won': 'Siguiente ronda',
      'status.paused': 'En pausa',
      'status.tryAgain': 'Inténtalo de nuevo',
      'status.gameOver': 'Fin de la partida',

      'gameOver.body': '<div class="gameover-banner"><div class="go-line1">Nota incorrecta</div><div class="go-line2">Fin de la partida</div><div class="go-line3">Toca <strong>Reiniciar</strong> para reintentar</div></div>',

      'error.noPlayable': 'No hay notas disponibles en el rango',
      'scale.prefix': 'Escala: {name}',
      'mode.prefix': 'Modo: {name}',
    },
  };

  const GAME_STORAGE_KEY = 'pianomem_game';
  const GAMES = {
    memory: 'memory',
    knowKey: 'knowKey',
    knowScale: 'knowScale',
  };

  let currentLang = null;

  function getStoredLang() {
    try {
      const raw = String(localStorage.getItem(LANG_STORAGE_KEY) || '').trim().toLowerCase();
      return SUPPORTED_LANGS.includes(raw) ? raw : 'en';
    } catch (e) {
      return 'en';
    }
  }

  function setStoredLang(lang) {
    if (!SUPPORTED_LANGS.includes(lang)) return;
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch (e) {}
  }

  function translate(key, vars) {
    const lang = currentLang || getStoredLang();
    const table = I18N[lang] || I18N.en;
    let val = (table && table[key]) || I18N.en[key] || '';
    if (vars && val) {
      Object.keys(vars).forEach((k) => {
        const re = new RegExp(`\\{${k}\\}`, 'g');
        val = val.replace(re, String(vars[k]));
      });
    }
    return val;
  }

  function applyLanguage(lang) {
    const resolved = SUPPORTED_LANGS.includes(lang) ? lang : 'en';
    currentLang = resolved;
    setStoredLang(resolved);
    document.documentElement.setAttribute('lang', resolved);

    if (langBtn) langBtn.textContent = resolved.toUpperCase();

    Array.from(document.querySelectorAll('[data-i18n]')).forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const val = translate(key);
      if (!val) return;

      const tag = (el.tagName || '').toUpperCase();
      const allowHtml = String(key).startsWith('help.') && tag !== 'OPTION';
      if (allowHtml) el.innerHTML = val;
      else el.textContent = val;
    });

    // Keep dynamic labels in sync
    updateInfoTexts();
    // Ensure play button matches state
    if (playBtn) playBtn.textContent = state.started ? translate('play.restart') : translate('play.play');
  }

  function openLangModal() {
    if (!langModal) return;
    langModal.classList.remove('hidden');
    langModal.setAttribute('aria-hidden', 'false');
  }

  function closeLangModal() {
    if (!langModal) return;
    langModal.classList.add('hidden');
    langModal.setAttribute('aria-hidden', 'true');
  }

  function bindLangModal() {
    if (!langBtn || !langModal) return;

    langBtn.addEventListener('click', openLangModal);

    const closeEls = Array.from(langModal.querySelectorAll('[data-close="1"]'));
    closeEls.forEach((el) => el.addEventListener('click', closeLangModal));

    const options = Array.from(langModal.querySelectorAll('[data-lang]'));
    options.forEach((btn) => {
      btn.addEventListener('click', () => {
        const lang = String(btn.getAttribute('data-lang') || '').toLowerCase();
        applyLanguage(lang);
        closeLangModal();
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLangModal();
    });
  }

  const state = {
    game: GAMES.memory,
    sequence: [],
    userIndex: 0,
    canInput: false,
    playing: false,
    gameOver: false,
    paused: false,
    pausedPhase: 'input',
    seqToken: 0,
    nextRoundTimer: null,
    pendingNextRound: false,
    scaleRoot: 'C',
    scaleChoice: 'random',
    randomPinnedRoot: null,
    mode: 'normal',
    baseOctave: 4,
    showNoteNamesPref: true,
    showNoteNames: true,
    selectedScaleOnly: false,
    notePool: [],
    visibleNotesSet: new Set(),
    started: false,

    knowKey: {
      phase: 'idle',
      remainingNotes: [],
      currentNote: null,
      roundIndex: 0,
      totalMs: 0,
      noteStartTs: 0,
      pauseAt: 0,
      countdownRemaining: 0,
    },

    knowScale: {
      phase: 'idle',
      rootPc: 'C',
      scaleNotes: [],
      expectedIndex: 0,
      startTs: 0,
      pauseAt: 0,
    },
  };

  const audioCache = new Map();
  let audioCtx = null;

  const BEST_KEYS = {
    easy: 'pianomem_best_easy',
    normal: 'pianomem_best_normal',
    hard: 'pianomem_best_hard',
  };

  const BEST_TIME_KEYS = {
    knowKey: 'pianomem_best_know_key_ms',
    knowScale: 'pianomem_best_know_scale_ms',
  };

  function setElHidden(el, hidden) {
    if (!el) return;
    if (hidden) el.classList.add('hidden');
    else el.classList.remove('hidden');
  }

  function formatTimeMs(ms) {
    const v = Number(ms);
    const safe = Number.isFinite(v) && v > 0 ? v : 0;
    return `${(safe / 1000).toFixed(2)}s`;
  }

  function rangeSemitoneOffsetForMode(mode) {
    if (mode === 'easy') return 7; // perfect fifth
    if (mode === 'hard') return 24; // two octaves
    return 12; // normal: one octave
  }

  function modeLabel(mode) {
    if (mode === 'easy') return translate('mode.easy');
    if (mode === 'hard') return translate('mode.hard');
    return translate('mode.normal');
  }

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

  function loadBestTimeMs(kind) {
    const key = BEST_TIME_KEYS[kind];
    if (!key) return 0;
    try {
      const v = parseInt(localStorage.getItem(key) || '0', 10);
      return Number.isFinite(v) && v > 0 ? v : 0;
    } catch (e) {
      return 0;
    }
  }

  function saveBestTimeMs(kind, ms) {
    const key = BEST_TIME_KEYS[kind];
    if (!key) return;
    const n = Math.max(0, Math.floor(Number(ms) || 0));
    if (!Number.isFinite(n) || n <= 0) return;
    try {
      const prev = loadBestTimeMs(kind);
      if (!prev || n < prev) localStorage.setItem(key, String(n));
    } catch (e) {}
  }

  function saveBest(mode, value) {
    const key = BEST_KEYS[mode];
    if (!key) return;
    try {
      localStorage.setItem(key, String(Math.max(0, value | 0)));
    } catch (e) {}
  }

  function updateAchievementsUI() {
    const bestEasy = loadBest('easy');
    const bestNormal = loadBest('normal');
    const bestHard = loadBest('hard');
    if (bestEasyEl) bestEasyEl.textContent = String(bestEasy);
    if (bestNormalEl) bestNormalEl.textContent = String(bestNormal);
    if (bestHardEl) bestHardEl.textContent = String(bestHard);

    const bestKnowKey = loadBestTimeMs('knowKey');
    const bestKnowScale = loadBestTimeMs('knowScale');
    if (bestKnowKeyEl) bestKnowKeyEl.textContent = formatTimeMs(bestKnowKey);
    if (bestKnowScaleEl) bestKnowScaleEl.textContent = formatTimeMs(bestKnowScale);

    if (maxDisplayEl) {
      if (state.game === GAMES.memory) {
        const mode = state.mode || 'normal';
        maxDisplayEl.textContent = String(loadBest(mode));
      } else if (state.game === GAMES.knowKey) {
        maxDisplayEl.textContent = formatTimeMs(bestKnowKey);
      } else if (state.game === GAMES.knowScale) {
        maxDisplayEl.textContent = formatTimeMs(bestKnowScale);
      }
    }
  }

  function maybeUpdateBest(currentLevel) {
    const mode = state.mode || 'normal';
    const best = loadBest(mode);
    if (currentLevel > best) {
      saveBest(mode, currentLevel);
    }
    updateAchievementsUI();
  }

  function setCenterBox(text) {
    if (!centerBox) return;
    if (text === null || text === undefined || text === '') {
      centerBox.textContent = '—';
      setElHidden(centerBox, true);
      return;
    }
    centerBox.textContent = String(text);
    setElHidden(centerBox, false);
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

  function buildFixedOctaveNotesC4toB4() {
    return NOTE_ORDER.map(pc => ({ note: `${pc}${state.baseOctave}`, pc, natural: isNatural(pc) }));
  }

  function renderKeyboardFromTapeItems(items, rootPcForScaleColors) {
    keyboardEl.innerHTML = '';
    const whiteContainer = document.createElement('div');
    whiteContainer.className = 'white-keys';
    const blackContainer = document.createElement('div');
    blackContainer.className = 'black-keys';

    const scaleSet = rootPcForScaleColors ? new Set(buildScale(rootPcForScaleColors)) : new Set();

    const notes = items;
    let whiteCount = notes.reduce((acc, n) => acc + (n.natural ? 1 : 0), 0);
    const firstIsNatural = notes.length > 0 ? notes[0].natural : true;
    const lastIsNatural = notes.length > 0 ? notes[notes.length - 1].natural : true;
    const leftPlaceholder = firstIsNatural ? 0 : 0.5;
    const rightPlaceholder = lastIsNatural ? 0 : 0.5;
    const totalSlots = whiteCount + leftPlaceholder + rightPlaceholder;
    const slotPercent = 100 / totalSlots;

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
      whiteSlots.push({ center, widthSlots: 1, placeholder: false, note: item.note, pc: item.pc });
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

    for (const slot of whiteSlots) {
      const el = document.createElement('div');
      el.className = 'key white-key' + (slot.placeholder ? ' placeholder' : '');
      el.style.width = `${slot.widthSlots * slotPercent}%`;
      if (!slot.placeholder) {
        el.dataset.note = slot.note;
        el.dataset.pc = slot.pc;
        if (scaleSet.has(slot.pc)) el.classList.add('in-scale');
        const label = document.createElement('span');
        label.className = 'key-label';
        label.textContent = slot.note;
        el.appendChild(label);
      }
      whiteContainer.appendChild(el);
    }

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
      blackKey.dataset.pc = item.pc;
      if (scaleSet.has(item.pc)) blackKey.classList.add('in-scale');
      const labelB = document.createElement('span');
      labelB.className = 'key-label';
      labelB.textContent = item.note;
      blackKey.appendChild(labelB);
      blackKey.style.width = `${blackWidthPercent}%`;
      blackKey.style.left = `${left}%`;

      blackContainer.appendChild(blackKey);
      blackKeys.push({ el: blackKey, left });
    }

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

  function buildTapeNotes() {
    // Fixed tape: 4 octaves from (baseOctave-1) to (baseOctave+2) to accommodate hard mode
    const tapeStartOct = state.baseOctave - 1;
    const tapeOctaves = 4;
    const tapeNotes = [];
    for (let o = tapeStartOct; o < tapeStartOct + tapeOctaves; o++) {
      for (const pc of NOTE_ORDER) {
        tapeNotes.push({ note: `${pc}${o}`, pc, natural: isNatural(pc) });
      }
    }
    return tapeNotes;
  }

  function getWindowRange(tapeNotes, rootPc, mode) {
    const rootNote = `${rootPc}${state.baseOctave}`;
    const rootIdxTape = tapeNotes.findIndex(n => n.note === rootNote);
    if (rootIdxTape === -1) return null;

    const endOffset = rangeSemitoneOffsetForMode(mode);
    const endIdxTape = rootIdxTape + endOffset;
    if (endIdxTape < 0 || endIdxTape >= tapeNotes.length) return null;

    // Window: from semitone before root to semitone after end
    let startIdx = Math.max(0, rootIdxTape - 1);
    let endIdx = Math.min(tapeNotes.length - 1, endIdxTape + 1);

    // Expand to include any black keys just outside the boundary
    while (startIdx > 0 && !tapeNotes[startIdx - 1].natural) startIdx -= 1;
    while (endIdx < tapeNotes.length - 1 && !tapeNotes[endIdx + 1].natural) endIdx += 1;

    return { rootIdxTape, endIdxTape, startIdx, endIdx };
  }

  function buildNotePool(scaleRoot, mode) {
    const rootPc = canonicalPitch(scaleRoot);
    const tapeNotes = buildTapeNotes();
    const range = getWindowRange(tapeNotes, rootPc, mode);
    if (!range) return [];

    const scale = new Set(buildScale(rootPc));
    const notes = [];
    for (let i = range.rootIdxTape; i <= range.endIdxTape; i++) {
      const item = tapeNotes[i];
      if (scale.has(item.pc)) notes.push(item.note);
    }
    return notes;
  }

  function isNatural(pc) {
    return ['C', 'D', 'E', 'F', 'G', 'A', 'B'].includes(pc);
  }

  function buildKeyboard(root, mode) {
    const rootPc = canonicalPitch(root);
    if (!NOTE_ORDER.includes(rootPc)) return;

    const tapeNotes = buildTapeNotes();
    const range = getWindowRange(tapeNotes, rootPc, mode);
    if (!range) return;
    const notes = tapeNotes.slice(range.startIdx, range.endIdx + 1);

    renderKeyboardFromTapeItems(notes, rootPc);
  }

  function buildKeyboardForKnowKey() {
    const items = buildFixedOctaveNotesC4toB4();
    renderKeyboardFromTapeItems(items, null);
  }

  function buildKeyboardForKnowScale(rootPc) {
    const tapeNotes = buildTapeNotes();
    const rootName = canonicalPitch(rootPc);
    const rootNote = `${rootName}${state.baseOctave}`;
    const rootIdxTape = tapeNotes.findIndex(n => n.note === rootNote);
    if (rootIdxTape === -1) return;
    const endIdxTape = rootIdxTape + 11;
    if (endIdxTape >= tapeNotes.length) return;
    const slice = tapeNotes.slice(rootIdxTape, endIdxTape + 1);
    renderKeyboardFromTapeItems(slice, rootName);
  }

  function attachKeyListeners() {
    keyboardEl.querySelectorAll('.key').forEach(key => {
      key.addEventListener('pointerdown', onKeyPress);
      key.addEventListener('pointerup', onKeyRelease);
      key.addEventListener('pointerleave', onKeyRelease);
    });
  }

  function onKeyPress(e) {
    if (state.gameOver) return;
    const note = e.currentTarget.dataset.note;
    highlightKey(note, 'active-user');
    playSample(note);
    if (state.canInput && !state.playing) {
      handleUserInputForCurrentGame(note);
    }
  }

  function onKeyRelease(e) {
    const note = e.currentTarget.dataset.note;
    unhighlightKey(note, 'active-user');
  }

  const highlightTimers = new Map();

  function highlightKey(note, cls = 'active-sequence') {
    const el = keyboardEl.querySelector(`[data-note="${note}"]`);
    if (el) {
      const durationMs = cls === 'active-sequence' ? 440 : 220;
      el.classList.add(cls);

      const timerKey = `${note}|${cls}`;
      const prev = highlightTimers.get(timerKey);
      if (prev) clearTimeout(prev);
      highlightTimers.set(
        timerKey,
        setTimeout(() => {
          el.classList.remove(cls);
          highlightTimers.delete(timerKey);
        }, durationMs)
      );
    }
  }

  function unhighlightKey(note, cls) {
    const el = keyboardEl.querySelector(`[data-note="${note}"]`);
    if (el) el.classList.remove(cls);

    const timerKey = `${note}|${cls}`;
    const prev = highlightTimers.get(timerKey);
    if (prev) {
      clearTimeout(prev);
      highlightTimers.delete(timerKey);
    }
  }

  async function playSequence() {
    const myToken = ++state.seqToken;
    state.playing = true;
    state.canInput = false;
    for (let i = 0; i < state.sequence.length; i++) {
      if (state.gameOver || state.paused || myToken !== state.seqToken) {
        state.playing = false;
        state.canInput = false;
        return;
      }
      const note = state.sequence[i];
      statusText.textContent = translate('status.listenCount', { i: i + 1, n: state.sequence.length });
      highlightKey(note, 'active-sequence');
      await playSample(note);
      await wait(450);
    }
    if (state.gameOver || state.paused || myToken !== state.seqToken) {
      state.playing = false;
      state.canInput = false;
      return;
    }
    statusText.textContent = translate('status.yourTurn');
    state.playing = false;
    state.canInput = true;
    state.userIndex = 0;
  }

  function handleUserInputForCurrentGame(note) {
    if (state.game === GAMES.memory) {
      handleUserInputMemory(note);
      return;
    }
    if (state.game === GAMES.knowKey) {
      handleUserInputKnowKey(note);
      return;
    }
    if (state.game === GAMES.knowScale) {
      handleUserInputKnowScale(note);
      return;
    }
  }

  function handleUserInputMemory(note) {
    const expected = state.sequence[state.userIndex];
    if (note === expected) {
      state.userIndex += 1;
      if (state.userIndex >= state.sequence.length) {
        levelDisplay.textContent = state.sequence.length + 1;
        statusText.textContent = translate('status.won');
        hideInlineError();
        state.canInput = false;
        state.pendingNextRound = true;
        if (state.nextRoundTimer) clearTimeout(state.nextRoundTimer);
        state.nextRoundTimer = setTimeout(() => {
          state.nextRoundTimer = null;
          if (state.paused || state.gameOver) return;
          state.pendingNextRound = false;
          nextRound();
        }, 650);
      }
    } else {
      endGameOverWrongNote();
    }
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function handleUserInputKnowKey(note) {
    const target = state.knowKey.currentNote;
    if (!target) return;
    if (note !== target) {
      endGameOverWrongNote();
      return;
    }

    const now = performance.now();
    const reaction = Math.max(0, now - (state.knowKey.noteStartTs || now));
    state.knowKey.totalMs += reaction;
    state.knowKey.roundIndex += 1;
    state.canInput = false;

    if (state.knowKey.roundIndex >= 12) {
      const totalMs = Math.floor(state.knowKey.totalMs);
      statusText.textContent = translate('kk.final', { t: formatTimeMs(totalMs) });
      saveBestTimeMs('knowKey', totalMs);
      updateAchievementsUI();
      setCenterBox('—');
      if (playBtn) playBtn.textContent = translate('play.restart');
      return;
    }

    statusText.textContent = translate('kk.total', {
      t: formatTimeMs(state.knowKey.totalMs),
      i: state.knowKey.roundIndex,
      n: 12,
    });
    scheduleNextKnowKeyPrompt();
  }

  function scheduleNextKnowKeyPrompt() {
    const myToken = state.seqToken;
    setTimeout(() => {
      if (state.gameOver || state.paused || myToken !== state.seqToken) return;
      nextKnowKeyPrompt();
    }, 220);
  }

  async function runCountdown3(myToken, targetStateObj) {
    targetStateObj.countdownRemaining = 3;
    while (targetStateObj.countdownRemaining > 0) {
      if (state.gameOver || state.paused || myToken !== state.seqToken) return false;
      if (statusText) statusText.textContent = String(targetStateObj.countdownRemaining);
      await wait(650);
      targetStateObj.countdownRemaining -= 1;
    }
    return true;
  }

  function startKnowKeyGame() {
    if (isTouchDevice() && !isLandscape()) {
      orientationMsg.classList.remove('hidden');
      return;
    }
    ensureAudioUnlocked();
    hydrateSettings();

    state.sequence = [];
    state.userIndex = 0;
    state.started = true;
    state.gameOver = false;
    state.paused = false;
    state.canInput = false;
    state.playing = false;
    state.pendingNextRound = false;
    if (state.nextRoundTimer) {
      clearTimeout(state.nextRoundTimer);
      state.nextRoundTimer = null;
    }
    document.body.classList.remove('game-over');
    hideInlineError();

    const myToken = ++state.seqToken;
    if (playBtn) playBtn.textContent = translate('play.restart');
    if (pausedBadge) pausedBadge.classList.add('hidden');
    if (pausedBadgePortrait) pausedBadgePortrait.classList.add('hidden');

    state.knowKey.phase = 'countdown';
    state.knowKey.totalMs = 0;
    state.knowKey.roundIndex = 0;
    state.knowKey.currentNote = null;
    state.knowKey.remainingNotes = shuffle(NOTE_ORDER).map(pc => `${pc}${state.baseOctave}`);
    setCenterBox('—');

    (async () => {
      const ok = await runCountdown3(myToken, state.knowKey);
      if (!ok) return;
      if (state.gameOver || state.paused || myToken !== state.seqToken) return;
      state.knowKey.phase = 'running';
      statusText.textContent = translate('kk.total', { t: formatTimeMs(0), i: 0, n: 12 });
      nextKnowKeyPrompt();
    })();
  }

  function nextKnowKeyPrompt() {
    if (state.gameOver || state.paused) return;
    const next = state.knowKey.remainingNotes.pop();
    if (!next) {
      const totalMs = Math.floor(state.knowKey.totalMs);
      statusText.textContent = translate('kk.final', { t: formatTimeMs(totalMs) });
      saveBestTimeMs('knowKey', totalMs);
      updateAchievementsUI();
      setCenterBox('—');
      state.canInput = false;
      return;
    }
    state.knowKey.currentNote = next;
    const pc = String(next).replace(/\d+$/, '');
    setCenterBox(pc);
    playSample(next);
    state.knowKey.noteStartTs = performance.now();
    state.canInput = true;
  }

  function startKnowScaleGame() {
    if (isTouchDevice() && !isLandscape()) {
      orientationMsg.classList.remove('hidden');
      return;
    }
    ensureAudioUnlocked();
    hydrateSettings();

    state.sequence = [];
    state.userIndex = 0;
    state.started = true;
    state.gameOver = false;
    state.paused = false;
    state.canInput = false;
    state.playing = false;
    state.pendingNextRound = false;
    if (state.nextRoundTimer) {
      clearTimeout(state.nextRoundTimer);
      state.nextRoundTimer = null;
    }
    document.body.classList.remove('game-over');
    hideInlineError();

    const myToken = ++state.seqToken;
    if (playBtn) playBtn.textContent = translate('play.restart');
    if (pausedBadge) pausedBadge.classList.add('hidden');
    if (pausedBadgePortrait) pausedBadgePortrait.classList.add('hidden');

    // Pick a scale root. If Random is selected, each start/restart picks a new root.
    const rootPc = state.scaleChoice === 'random' ? pickRandom(NOTE_ORDER) : canonicalPitch(state.scaleChoice);
    if (state.scaleChoice === 'random') state.randomPinnedRoot = rootPc;
    else state.randomPinnedRoot = null;
    state.scaleRoot = rootPc;
    state.knowScale.rootPc = rootPc;

    // Build the exact 7-note major scale in ascending pitch (may cross octave)
    const tapeNotes = buildTapeNotes();
    const rootNote = `${rootPc}${state.baseOctave}`;
    const rootIdxTape = tapeNotes.findIndex(n => n.note === rootNote);
    if (rootIdxTape === -1) {
      showInlineError(translate('error.noPlayable'));
      return;
    }
    const scaleNotes = MAJOR_STEPS.map(step => {
      const idx = rootIdxTape + step;
      return tapeNotes[idx] ? tapeNotes[idx].note : null;
    }).filter(Boolean);
    if (scaleNotes.length !== 7) {
      showInlineError(translate('error.noPlayable'));
      return;
    }
    state.knowScale.scaleNotes = scaleNotes;
    state.knowScale.expectedIndex = 0;
    // Start measuring time on the first correct (root) tap.
    state.knowScale.startTs = 0;
    state.knowScale.phase = 'running';

    // Keyboard range is root -> 7th (no higher root)
    buildKeyboardForKnowScale(rootPc);
    state.visibleNotesSet = new Set(
      Array.from(keyboardEl.querySelectorAll('.key[data-note]')).map(el => el.dataset.note)
    );

    setCenterBox(scaleDisplayName(rootPc));
    statusText.textContent = translate('ks.time', { t: formatTimeMs(0), i: 0 });
    state.canInput = true;
    updateInfoTexts();
    updateAchievementsUI();
    if (myToken !== state.seqToken) return;
  }

  function handleUserInputKnowScale(note) {
    const expected = state.knowScale.scaleNotes[state.knowScale.expectedIndex];
    if (!expected) return;
    if (note !== expected) {
      endGameOverWrongNote();
      return;
    }

    const now = performance.now();
    if (state.knowScale.expectedIndex === 0 && !state.knowScale.startTs) {
      state.knowScale.startTs = now;
    }

    state.knowScale.expectedIndex += 1;
    const elapsed = Math.max(0, now - (state.knowScale.startTs || now));
    if (state.knowScale.expectedIndex >= 7) {
      const totalMs = Math.floor(elapsed);
      statusText.textContent = translate('ks.final', { t: formatTimeMs(totalMs) });
      saveBestTimeMs('knowScale', totalMs);
      updateAchievementsUI();
      state.canInput = false;
      if (playBtn) playBtn.textContent = translate('play.restart');
      return;
    }

    statusText.textContent = translate('ks.time', {
      t: formatTimeMs(elapsed),
      i: state.knowScale.expectedIndex,
    });
  }

  function endGameOverWrongNote() {
    // Cancel any in-flight async loops (countdowns, prompts)
    state.seqToken++;
    state.canInput = false;
    state.playing = false;
    state.gameOver = true;
    state.paused = false;
    state.pendingNextRound = false;
    if (state.nextRoundTimer) {
      clearTimeout(state.nextRoundTimer);
      state.nextRoundTimer = null;
    }

    document.body.classList.add('game-over');

    statusText.textContent = translate('status.gameOver');
    if (pausedBadge) pausedBadge.classList.add('hidden');
    if (pausedBadgePortrait) pausedBadgePortrait.classList.add('hidden');
    showInlineError(translate('gameOver.body'));
    if (playBtn) playBtn.textContent = translate('play.restart');
  }

  function pauseGameForPortrait() {
    if (!state.started || state.gameOver) return;

    if (state.game !== GAMES.memory) {
      state.paused = true;
      state.pausedPhase = 'input';
      state.canInput = false;
      state.playing = false;
      state.seqToken++;
      if (state.game === GAMES.knowKey) state.knowKey.pauseAt = performance.now();
      if (state.game === GAMES.knowScale) state.knowScale.pauseAt = performance.now();
      if (statusText) statusText.textContent = '';
      if (pausedBadge) pausedBadge.classList.remove('hidden');
      if (pausedBadgePortrait) {
        positionPausedPortraitBadge();
        pausedBadgePortrait.classList.remove('hidden');
      }
      return;
    }

    state.paused = true;
    state.pausedPhase = state.pendingNextRound ? 'between' : (state.playing ? 'sequence' : 'input');
    state.canInput = false;
    state.playing = false;

    // Cancel any in-flight sequence playback and pending timers
    state.seqToken++;
    if (state.nextRoundTimer) {
      clearTimeout(state.nextRoundTimer);
      state.nextRoundTimer = null;
    }
    // Do not display explicit "Paused" text — keep status text unchanged
    if (statusText) statusText.textContent = '';
    if (pausedBadge) pausedBadge.classList.remove('hidden');
    if (pausedBadgePortrait) {
      positionPausedPortraitBadge();
      pausedBadgePortrait.classList.remove('hidden');
    }
  }

  function resumeGameFromPause() {
    if (!state.started || state.gameOver || !state.paused) return;

    if (state.game !== GAMES.memory) {
      state.paused = false;
      if (pausedBadge) pausedBadge.classList.add('hidden');
      if (pausedBadgePortrait) pausedBadgePortrait.classList.add('hidden');

      const now = performance.now();
      if (state.game === GAMES.knowKey) {
        if (state.knowKey.pauseAt) {
          const delta = now - state.knowKey.pauseAt;
          if (state.knowKey.noteStartTs) state.knowKey.noteStartTs += delta;
          state.knowKey.pauseAt = 0;
        }
        state.canInput = state.knowKey.phase === 'running';
        statusText.textContent = translate('kk.total', {
          t: formatTimeMs(state.knowKey.totalMs),
          i: state.knowKey.roundIndex,
          n: 12,
        });
        return;
      }

      if (state.game === GAMES.knowScale) {
        if (state.knowScale.pauseAt) {
          const delta = now - state.knowScale.pauseAt;
          if (state.knowScale.startTs) state.knowScale.startTs += delta;
          state.knowScale.pauseAt = 0;
        }
        const elapsed = Math.max(0, now - (state.knowScale.startTs || now));
        statusText.textContent = translate('ks.time', {
          t: formatTimeMs(elapsed),
          i: state.knowScale.expectedIndex,
        });
        state.canInput = state.knowScale.phase === 'running';
        return;
      }
    }

    state.paused = false;
    if (pausedBadge) pausedBadge.classList.add('hidden');
    if (pausedBadgePortrait) pausedBadgePortrait.classList.add('hidden');
    if (state.pausedPhase === 'between') {
      state.pendingNextRound = false;
      nextRound();
      return;
    }
    if (state.pausedPhase === 'sequence') {
      state.userIndex = 0;
      statusText.textContent = translate('status.listen');
      playSequence();
      return;
    }
    // input phase
    statusText.textContent = translate('status.yourTurn');
    state.playing = false;
    state.canInput = true;
  }

  function positionPausedPortraitBadge() {
    if (!pausedBadgePortrait || !langBtn) return;
    // Use fixed positioning computed from the language button so iOS won't clip it
    const btnRect = langBtn.getBoundingClientRect();
    const left = btnRect.left + btnRect.width / 2;
    const top = btnRect.bottom + 8; // 8px below the button
    pausedBadgePortrait.style.position = 'fixed';
    pausedBadgePortrait.style.left = `${left}px`;
    pausedBadgePortrait.style.top = `${top}px`;
    pausedBadgePortrait.style.transform = 'translateX(-50%)';
    pausedBadgePortrait.style.zIndex = '9999';
  }

  function nextRound() {
    if (!state.notePool || state.notePool.length === 0) {
      showInlineError(translate('error.noPlayable'));
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
    // Memory game start
    if (!force && isTouchDevice() && !isLandscape()) {
      orientationMsg.classList.remove('hidden');
      return;
    }
    ensureAudioUnlocked();
    hydrateSettings();
    state.notePool = buildNotePool(state.scaleRoot, state.mode)
      .filter(n => state.visibleNotesSet.has(n));
    state.sequence = [];
    state.started = true;
    state.gameOver = false;
    state.paused = false;
    state.pendingNextRound = false;
    if (state.nextRoundTimer) {
      clearTimeout(state.nextRoundTimer);
      state.nextRoundTimer = null;
    }
    state.seqToken++;
    document.body.classList.remove('game-over');
    playBtn.textContent = translate('play.restart');
    levelDisplay.textContent = '1';
    statusText.textContent = translate('status.listen');
    if (pausedBadge) pausedBadge.classList.add('hidden');
    if (pausedBadgePortrait) pausedBadgePortrait.classList.add('hidden');
    hideInlineError();
    nextRound();
  }

  function startCurrentGame(force = false) {
    if (state.game === GAMES.memory) {
      startGame(force);
      return;
    }
    if (state.game === GAMES.knowKey) {
      startKnowKeyGame();
      return;
    }
    if (state.game === GAMES.knowScale) {
      startKnowScaleGame();
      return;
    }
  }

  function restartGame() {
    // Memory game restart
    // On phones, portrait is the home/settings screen. Restarting here should
    // reset the run but keep it paused until the user returns to landscape.
    if (isTouchDevice() && !isLandscape()) {
      state.sequence = [];
      state.userIndex = 0;
      state.started = true;
      state.gameOver = false;
      state.paused = true;
      state.pausedPhase = 'between';
      state.pendingNextRound = true;
      state.canInput = false;
      state.playing = false;
      if (state.nextRoundTimer) {
        clearTimeout(state.nextRoundTimer);
        state.nextRoundTimer = null;
      }
      state.seqToken++;
      document.body.classList.remove('game-over');
      levelDisplay.textContent = '1';
      statusText.textContent = '';
      hideInlineError();
      return;
    }

    state.sequence = [];
    state.userIndex = 0;
    state.gameOver = false;
    state.paused = false;
    state.pendingNextRound = false;
    if (state.nextRoundTimer) {
      clearTimeout(state.nextRoundTimer);
      state.nextRoundTimer = null;
    }
    state.seqToken++;
    document.body.classList.remove('game-over');
    levelDisplay.textContent = '1';
    statusText.textContent = translate('status.listen');
    if (pausedBadge) pausedBadge.classList.add('hidden');
    state.canInput = false;
    hideInlineError();
    nextRound();
  }

  function restartCurrentGame() {
    if (state.game === GAMES.memory) {
      restartGame();
      return;
    }
    // For the new games, restart simply re-runs start logic.
    if (isTouchDevice() && !isLandscape()) {
      // Match Memory behavior: keep as a paused run until landscape
      state.started = true;
      state.gameOver = false;
      state.paused = true;
      state.pausedPhase = 'input';
      state.canInput = false;
      state.playing = false;
      state.seqToken++;
      document.body.classList.remove('game-over');
      hideInlineError();
      if (statusText) statusText.textContent = '';
      return;
    }
    startCurrentGame(true);
  }

  function goHome() {
    // stop current game and return to portrait home screen
    state.sequence = [];
    state.userIndex = 0;
    state.canInput = false;
    state.playing = false;
    state.started = false;
    state.gameOver = false;
    state.paused = false;
    state.pendingNextRound = false;
    if (state.nextRoundTimer) {
      clearTimeout(state.nextRoundTimer);
      state.nextRoundTimer = null;
    }
    state.seqToken++;
    document.body.classList.remove('game-over');
      statusText.textContent = '';
      if (pausedBadge) pausedBadge.classList.add('hidden');
      if (pausedBadgePortrait) pausedBadgePortrait.classList.add('hidden');
    playBtn.textContent = translate('play.play');
    setCenterBox(null);
    showPortrait();
  }

  function scaleDisplayName(root) {
    return translate(`scale.${root}`) || root;
  }

  function ensureOrientation() {
    const landscape = isLandscape();
    if (landscape) {
      orientationMsg.classList.add('hidden');
      showLandscape();
      hydrateSettings();
      if (state.started && state.paused) {
        resumeGameFromPause();
      } else {
        statusText.textContent = state.started ? (statusText.textContent || translate('status.listen')) : translate('play.tapToBegin');
      }
    } else {
      if (state.gameOver) {
        // Dismiss game over if user returns to portrait
        goHome();
        return;
      }
      if (state.started) {
        pauseGameForPortrait();
        showPortrait();
        return;
      }
      showPortrait();
    }
  }

  function showLandscape() {
    portraitScreen.classList.add('hidden');
    if (helpScreen) helpScreen.classList.add('hidden');
    landscapeScreen.classList.remove('hidden');
  }

  function showPortrait() {
    portraitScreen.classList.remove('hidden');
    if (helpScreen) helpScreen.classList.add('hidden');
    landscapeScreen.classList.add('hidden');
    orientationMsg.classList.add('hidden');
    updateAchievementsUI();
  }

  function showHelp() {
    if (!helpScreen) return;
    portraitScreen.classList.add('hidden');
    landscapeScreen.classList.add('hidden');
    helpScreen.classList.remove('hidden');
    orientationMsg.classList.add('hidden');
  }

  function hideHelp() {
    if (!helpScreen) return;
    helpScreen.classList.add('hidden');
    showPortrait();
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js').catch(() => {});
      });
    }
  }

  function bindUI() {
    bindLangModal();
    // initialize assist toggle state
    if (assistToggle) {
      try {
        const saved = localStorage.getItem('pianomem_show_assist');
        if (saved !== null) assistToggle.checked = saved === '1';
      } catch (e) {}
      state.showNoteNamesPref = !!assistToggle.checked;
      applyAssistState(assistToggle.checked);
      assistToggle.addEventListener('change', () => {
        state.showNoteNamesPref = !!assistToggle.checked;
        applyAssistState(assistToggle.checked);
        applyGameUiConstraints();
      });
      // initialize selected-scale-only control
      if (selectedScaleOnlyEl) {
        try {
          const saved2 = localStorage.getItem('pianomem_selected_scale_only');
          if (saved2 !== null) selectedScaleOnlyEl.checked = saved2 === '1';
        } catch (e) {}
        applySelectedScaleOnly(!!selectedScaleOnlyEl.checked);
        selectedScaleOnlyEl.addEventListener('change', () => applySelectedScaleOnly(selectedScaleOnlyEl.checked));
      }
    }
    playBtn.addEventListener('click', () => {
      ensureAudioUnlocked();
      if (!state.started) startCurrentGame();
      else restartCurrentGame();
    });
    if (desktopPlayBtn) {
      desktopPlayBtn.addEventListener('click', () => {
        showLandscape();
        startCurrentGame(true);
      });
    }
    if (homeBtn) homeBtn.addEventListener('click', goHome);

    if (helpBtn) helpBtn.addEventListener('click', showHelp);
    if (helpBackBtn) helpBackBtn.addEventListener('click', hideHelp);

    // Smooth in-panel scrolling for Help index links
    if (helpScreen) {
      helpScreen.addEventListener('click', (e) => {
        const a = e.target && e.target.closest ? e.target.closest('a[href^="#help-"]') : null;
        if (!a) return;
        const id = a.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        const scroller = helpScreen.querySelector('.help-scroll');
        if (target && scroller) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }

    // Keep random pinned until the user changes scale
    scaleSelect.addEventListener('change', () => {
      state.scaleChoice = scaleSelect.value;
      if (state.scaleChoice !== 'random') {
        state.randomPinnedRoot = null;
      }
      hydrateSettings();
    });

    // Game selection
    if (gameInputs && gameInputs.length) {
      gameInputs.forEach(r => r.addEventListener('change', () => {
        const v = gameInputs.find(x => x.checked)?.value || GAMES.memory;
        setGame(v);
      }));
    }

    modeInputs.forEach(r => r.addEventListener('change', hydrateSettings));
    window.addEventListener('orientationchange', ensureOrientation);
    window.addEventListener('resize', ensureOrientation);
    window.addEventListener('resize', () => {
      try { positionPausedPortraitBadge(); } catch (e) {}
    });
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
      if (state.gameOver) return;
      if (isInlineErrorVisible()) hideInlineError();
    };
    // Use capture so a key press doesn't immediately dismiss a banner that was just shown
    document.addEventListener('pointerdown', dismissInlineError, { passive: true, capture: true });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') dismissInlineError();
    });
  }

  function hydrateSettings() {
    // Game selection may not exist on older markup
    if (gameInputs && gameInputs.length) {
      state.game = gameInputs.find(r => r.checked)?.value || state.game || GAMES.memory;
    }
    state.mode = modeInputs.find(r => r.checked)?.value || 'normal';
    state.scaleChoice = scaleSelect.value;

    applyGameUiConstraints();

    if (state.scaleChoice === 'random') {
      if (!state.randomPinnedRoot) {
        state.randomPinnedRoot = pickRandom(NOTE_ORDER);
      }
      state.scaleRoot = state.randomPinnedRoot;
    } else {
      state.randomPinnedRoot = null;
      state.scaleRoot = canonicalPitch(state.scaleChoice);
    }

    // Build the keyboard for the selected game
    if (state.game === GAMES.memory) {
      buildKeyboard(state.scaleRoot, state.mode);
    } else if (state.game === GAMES.knowKey) {
      buildKeyboardForKnowKey();
    } else if (state.game === GAMES.knowScale) {
      buildKeyboardForKnowScale(state.scaleRoot);
    }
    state.visibleNotesSet = new Set(
      Array.from(keyboardEl.querySelectorAll('.key[data-note]')).map(el => el.dataset.note)
    );
    updateInfoTexts();
    updateAchievementsUI();
    // keep flip hint visible; it should always instruct the user to flip the phone

    // If the user changes game-related settings while paused in portrait, end the paused run.
    if (!isLandscape() && state.started && state.paused) {
      goHome();
    }
  }

  function setGame(gameValue) {
    const v = String(gameValue || '').trim();
    if (!Object.values(GAMES).includes(v)) return;
    state.game = v;
    try { localStorage.setItem(GAME_STORAGE_KEY, v); } catch (e) {}
    // Changing game always resets any paused run (matches memory behavior when changing settings)
    if (!isLandscape() && state.started && state.paused) {
      goHome();
      return;
    }
    hydrateSettings();
    updateInfoTexts();
    updateAchievementsUI();
  }

  function applyGameUiConstraints() {
    // Mode controls only apply to Memory
    const isMemory = state.game === GAMES.memory;
    if (memoryModeHalf) {
      if (isMemory) memoryModeHalf.classList.remove('is-disabled');
      else memoryModeHalf.classList.add('is-disabled');
    }
    modeInputs.forEach((el) => {
      try { el.disabled = !isMemory; } catch (e) {}
    });

    // Scale selector stays enabled; Know the key ignores it, Know the scale uses it.

    // Show note names must be disabled in new games (without overwriting user preference)
    const forceNoLabels = state.game !== GAMES.memory;
    if (assistToggle) {
      try { assistToggle.disabled = forceNoLabels; } catch (e) {}
    }

    if (forceNoLabels) {
      document.body.classList.add('assist-hidden');
      if (selectedScaleOnlyWrap) selectedScaleOnlyWrap.style.display = 'none';
      if (selectedScaleOnlyEl) {
        try { selectedScaleOnlyEl.disabled = true; } catch (e) {}
      }
      document.body.classList.remove('assist-selected-only');
    } else {
      // Restore based on preference
      document.body.classList.toggle('assist-hidden', !state.showNoteNamesPref);
      if (selectedScaleOnlyWrap) selectedScaleOnlyWrap.style.display = state.showNoteNamesPref ? 'flex' : 'none';
      if (selectedScaleOnlyEl) {
        try { selectedScaleOnlyEl.disabled = !state.showNoteNamesPref; } catch (e) {}
      }
      if (state.showNoteNamesPref && state.selectedScaleOnly) document.body.classList.add('assist-selected-only');
      else document.body.classList.remove('assist-selected-only');
    }
  }

  // Assist toggle handling: show/hide key labels and small hints
  function applyAssistState(enabled) {
    state.showNoteNames = !!enabled;
    document.body.classList.toggle('assist-hidden', !enabled);
    if (selectedScaleOnlyWrap) selectedScaleOnlyWrap.style.display = enabled ? 'flex' : 'none';
    if (!enabled) {
      state.selectedScaleOnly = false;
      if (selectedScaleOnlyEl) selectedScaleOnlyEl.checked = false;
      document.body.classList.remove('assist-selected-only');
    } else {
      if (state.selectedScaleOnly) document.body.classList.add('assist-selected-only');
      else document.body.classList.remove('assist-selected-only');
    }
    try { localStorage.setItem('pianomem_show_assist', enabled ? '1' : '0'); } catch (e) {}
  }

  function applySelectedScaleOnly(enabled) {
    state.selectedScaleOnly = !!enabled;
    if (state.selectedScaleOnly) document.body.classList.add('assist-selected-only');
    else document.body.classList.remove('assist-selected-only');
    try { localStorage.setItem('pianomem_selected_scale_only', enabled ? '1' : '0'); } catch (e) {}
  }


  function updateInfoTexts() {
    if (state.game === GAMES.memory) {
      setCenterBox(null);
      setElHidden(selectedScaleEl, false);
      setElHidden(selectedModeEl, false);
      setElHidden(levelDisplay && levelDisplay.parentElement ? levelDisplay.parentElement : null, false);
      if (selectedScaleEl) selectedScaleEl.textContent = translate('scale.prefix', { name: scaleDisplayName(state.scaleRoot) });
      if (selectedModeEl) selectedModeEl.textContent = translate('mode.prefix', { name: modeLabel(state.mode) });
      return;
    }

    // New games
    setElHidden(selectedScaleEl, true);
    setElHidden(selectedModeEl, true);
    setElHidden(levelDisplay && levelDisplay.parentElement ? levelDisplay.parentElement : null, true);

    if (state.game === GAMES.knowKey) {
      // centerBox is managed by the game loop
      return;
    }
    if (state.game === GAMES.knowScale) {
      setCenterBox(scaleDisplayName(state.scaleRoot));
      return;
    }
  }

  function showInlineError(msg) {
    if (!inlineError) return;
    if (typeof msg === 'string' && msg.includes('<')) inlineError.innerHTML = msg;
    else inlineError.textContent = msg;
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
  applyLanguage(getStoredLang());
  registerServiceWorker();
  showPortrait();

  // Restore saved game selection
  try {
    const savedGame = localStorage.getItem(GAME_STORAGE_KEY);
    if (savedGame && gameInputs && gameInputs.length) {
      const match = gameInputs.find(r => r.value === savedGame);
      if (match) match.checked = true;
      state.game = match ? match.value : GAMES.memory;
    }
  } catch (e) {}

  // default to Random key on first load
  try { scaleSelect.value = 'random'; } catch (e) {}
  state.scaleChoice = 'random';
  state.randomPinnedRoot = null;
  hydrateSettings();
  ensureOrientation();
})();
