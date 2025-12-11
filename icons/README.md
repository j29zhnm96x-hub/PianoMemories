Place the PNG you attached into this folder and name it `icon-source.png` (or any name). Then create the required favicon / PWA icon files:

Recommended filenames (used by the app):
- icons/icon-192.png  (192x192 PNG)
- icons/icon-512.png  (512x512 PNG)
- icons/icon-apple.png (optional, 180x180 for iOS)

Resizing examples (ImageMagick / magick) on Windows PowerShell:

```powershell
# If your attached image is saved as attachments/source.png
magick convert attachments\source.png -resize 192x192 icons\icon-192.png
magick convert attachments\source.png -resize 512x512 icons\icon-512.png
magick convert attachments\source.png -resize 180x180 icons\icon-apple.png
```

If you don't have ImageMagick, you can use online tools or any image editor. After placing the files, reload the site and re-add to Home Screen on your iPhone.

Notes for iOS Home Screen behavior:
- iOS uses the `apple-touch-icon` link in `index.html` for the Home Screen icon. The app already references `icons/icon-192.png` in the HTML and `manifest.json`.
- If you want a different icon specifically for iOS, create `icons/icon-apple.png` (180x180) and update `index.html` or replace `icons/icon-192.png` with the iOS-optimized image.

When you've placed the files, reply "icons added" and I will mark the todo complete and update the service worker cache if you want me to re-run any build steps.

Important note for iPhone Home Screen icon updates:

- iOS often caches the Home Screen icon. If you already added the site to your Home Screen, remove the existing icon before re-adding it.
- To remove: long-press the Home Screen icon and choose "Remove App" (you can keep the website data cleared separately).
- Optionally clear Safari cache: `Settings → Safari → Clear History and Website Data`.
- After placing `icon-apple.png` (180×180) and the other icons, open the site in Safari on your iPhone, load the page, then use "Share → Add to Home Screen".
- If testing from your computer, serve the site on your local network (e.g., `python -m http.server 4173`) and open `http://<your-computer-ip>:4173` in Safari on the iPhone.

If you say "icons added" I will mark the step complete and help you re-register the service worker if necessary.
