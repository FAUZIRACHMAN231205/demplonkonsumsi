This folder contains screenshots used for the laporan (report).

How to generate screenshots automatically (Windows / PowerShell):

1. Install Playwright (will download Chromium browser):

```pwsh
npm i -D playwright
npx playwright install chromium
```

2. Run the script:

```pwsh
node scripts/screenshot.js
```

3. Outputs will be saved to:

- `report/screenshots/coverage.png` — coverage HTML screenshot
- Optionally `report/screenshots/homepage.png` if you run the dev server and uncomment the sample code in `scripts/screenshot.js`.

Notes:

- Installing Playwright downloads browser binaries (additional disk/time). If you prefer not to install, open `report/coverage/index.html` in your browser and take manual screenshots, then save them into this folder.
- If you want, I can (a) add a package.json script to run this, or (b) run the automated steps here (but it will download browsers). Tell me which you prefer.
