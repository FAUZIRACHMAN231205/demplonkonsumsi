// screenshots using Playwright
// Usage:
// 1) npm i -D playwright
// 2) npx playwright install chromium
// 3) node scripts/screenshot.js

(async () => {
  try {
    const path = await import('node:path');
    const fs = await import('node:fs');
    const { chromium } = await import('playwright');

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

    // coverage report (local file)
    const coveragePath = path.resolve(__dirname, '..', 'report', 'coverage', 'index.html');
    if (fs.existsSync(coveragePath)) {
      await page.goto('file://' + coveragePath);
      await page.screenshot({ path: path.resolve(__dirname, '..', 'report', 'screenshots', 'coverage.png'), fullPage: true });
      console.log('Saved coverage screenshot: report/screenshots/coverage.png');
    } else {
      console.warn('Coverage HTML not found at', coveragePath);
    }

    // If you have the dev server running, screenshot app pages as well.
    // We'll try a couple of common routes and retry a few times while the dev server compiles.
    const urls = [
      { url: 'http://localhost:3000', out: 'homepage.png' },
      { url: 'http://localhost:3000/admin/dashboard', out: 'admin_dashboard.png' }
    ];

    for (const u of urls) {
      const outPath = path.resolve(__dirname, '..', 'report', 'screenshots', u.out);
      let success = false;
      // retry loop: try for up to ~15 seconds
      for (let i = 0; i < 15; i++) {
        try {
          await page.goto(u.url, { waitUntil: 'networkidle', timeout: 5000 });
          await page.screenshot({ path: outPath, fullPage: true });
          console.log(`Saved ${u.out}: report/screenshots/${u.out}`);
          success = true;
          break;
        } catch {
          // wait 1s and retry
          await new Promise((r) => setTimeout(r, 1000));
        }
      }
      if (!success) console.warn(`Failed to capture ${u.url} after retries`);
    }

    await browser.close();
  } catch (err) {
    console.error('Error taking screenshots:', err);
    process.exit(1);
  }
})();
