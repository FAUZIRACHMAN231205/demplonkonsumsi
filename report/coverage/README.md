Coverage report for DemplonKonsumsi (generated from a focused run)

Summary (local run on 2025-11-13):

- All files: 63.23% statements, 34.73% branches, 56.89% functions, 64.43% lines

What this contains

- `index.html` — full HTML report (open in a browser)
- `lcov.info` — lcov file useful for CI/reporting
- `lcov-report/` — detailed HTML per-file pages

Notes

- This coverage result was produced by running coverage only for the core test file `src/hooks/usePemesanan.test.tsx` to keep execution fast for the laporan.
- To regenerate full-project coverage, run `npm run coverage` (this may take longer).

How to view

1. Open `report/coverage/index.html` in your browser.
2. Or open `report/coverage/lcov-report/index.html` for the per-file view.

Quick PowerShell commands (from repo root)

```pwsh
# open HTML report (Windows)
Start-Process report\coverage\index.html

# copy coverage artifacts into report/coverage (if you run full coverage later)
New-Item -ItemType Directory -Force -Path .\report\coverage
Copy-Item -Path .\coverage\* -Destination .\report\coverage -Recurse -Force
```

If you want, I can now add a small section to the project `README.md` pointing to this folder — confirm and I will update `README.md` in-place.
