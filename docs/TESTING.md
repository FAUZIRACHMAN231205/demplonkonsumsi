# Panduan Testing & Skrip

File ini menjelaskan skrip NPM yang ditambahkan untuk mempercepat dan menstabilkan proses testing pada proyek.

Gunakan PowerShell (pwsh.exe) di Windows seperti contoh di bawah.

## Skrip penting (package.json)

- `npm run test` — jalankan Vitest dalam mode watch (default)
- `npm run test:run` — jalankan semua test sekali (CI-friendly)
- `npm run test:fast` — jalankan test sekali tanpa worker threads (kadang lebih cepat pada CI/Windows)
- `npm run test:watch` — jalankan Vitest dalam watch mode (alias `test`)
- `npm run coverage` — jalankan test dan hasilkan laporan coverage (lcov + html)

## Contoh penggunaan (PowerShell)

# Install dependensi

npm ci

# Jalankan test satu kali (dot reporter)

npm run test:run

# Jalankan test lebih cepat (no worker threads)

npm run test:fast

# Jalankan test dan buka coverage (jika Anda mau)

npm run coverage

# Laporan HTML akan tersedia di `coverage/index.html`

## Tips untuk debugging test yang lambat atau flaky

- Gunakan `npm run test:fast` jika startup/worker overhead besar pada mesin Windows.
- Pastikan tidak menjalankan banyak instance paralel dari Vitest.
- Untuk tes yang bergantung pada localStorage, gunakan `PemesananProvider` atau injeksikan `storageAdapter` (ada `src/lib/mockStorage.ts`) supaya tes deterministik.

## Apa yang diubah di repo

- Ditambahkan skrip NPM: `test:run`, `test:fast`, `test:watch`, `coverage`.
- `vitest.config.ts` dituning untuk mempercepat startup (mengurangi pre-bundling untuk beberapa dependency heavy dan mempersempit pattern `include`).

Jika Anda ingin saya menambahkan bagian ini ke `README.md` utama, beri tahu saya dan saya akan memperbarui file `README.md` secara langsung (saya akan berhati-hati untuk tidak menimpa konten lain).
