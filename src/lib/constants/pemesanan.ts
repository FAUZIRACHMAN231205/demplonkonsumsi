import type { Pemesanan } from '@/lib/schema';

export type SelectOption = { label: string; value: string };

export const STATUS_FILTER_OPTIONS: Array<Pemesanan['status'] | 'Semua'> = [
  'Semua',
  'Menunggu',
  'Disetujui',
  'Ditolak',
  'Selesai',
  'Dibatalkan',
];

export const DEFAULT_ACARA_OPTIONS: SelectOption[] = [
  { label: 'Bahan Minum Karyawan', value: 'Bahan Minum Karyawan' },
  { label: 'Baporkes', value: 'Baporkes' },
  { label: 'BK3N', value: 'BK3N' },
  { label: 'Extra fooding', value: 'Extra fooding' },
  { label: 'Extra Fooding Shift', value: 'Extra Fooding Shift' },
  { label: 'Extra Fooding SKJ', value: 'Extra Fooding SKJ' },
  { label: 'Festival Inovasi', value: 'Festival Inovasi' },
  { label: 'Halal bil halal', value: 'Halal bil halal' },
  { label: 'Rapat Koordinasi', value: 'Rapat Koordinasi' },
  { label: 'Pelatihan Internal', value: 'Pelatihan Internal' },
  { label: 'Acara Departemen', value: 'Acara Departemen' },
  { label: 'Lainnya', value: 'Lainnya' },
];

export const WAKTU_OPTIONS: SelectOption[] = [
  { label: 'Pagi', value: 'Pagi' },
  { label: 'Siang', value: 'Siang' },
  { label: 'Sore', value: 'Sore' },
  { label: 'Malam', value: 'Malam' },
  { label: 'Sahur', value: 'Sahur' },
  { label: 'Buka Puasa', value: 'Buka Puasa' },
];

export const LOKASI_OPTIONS: SelectOption[] = [
  { label: 'Gedung Utama, Ruang Rapat Cempaka', value: 'Gedung Utama, Ruang Rapat Cempaka' },
  { label: 'Gedung Produksi, Area Istirahat', value: 'Gedung Produksi, Area Istirahat' },
  { label: 'Wisma Kujang, Aula Serbaguna', value: 'Wisma Kujang, Aula Serbaguna' },
  { label: 'Gedung Training Center, Ruang 1', value: 'Gedung Training Center, Ruang 1' },
  { label: 'Kantor Departemen TI', value: 'Kantor Departemen TI' },
];

export const TAMU_OPTIONS: SelectOption[] = [
  { label: 'Perta', value: 'perta' },
  { label: 'Reguler', value: 'reguler' },
  { label: 'Standar', value: 'standar' },
  { label: 'VIP', value: 'vip' },
  { label: 'VVIP', value: 'vvip' },
];

export const BAGIAN_OPTIONS: SelectOption[] = [
  { label: 'Dep. Teknologi Informasi PKC (C001370000)', value: 'Dep. Teknologi Informasi PKC (C001370000)' },
  { label: 'Dep. Keuangan (C001380000)', value: 'Dep. Keuangan (C001380000)' },
  { label: 'Dep. SDM (C001390000)', value: 'Dep. SDM (C001390000)' },
];

export const APPROVAL_OPTIONS: SelectOption[] = [
  { label: 'Jojok Satriadi (1140122)', value: 'Jojok Satriadi (1140122)' },
  { label: 'Budi Santoso (1120321)', value: 'Budi Santoso (1120321)' },
  { label: 'Citra Lestari (1150489)', value: 'Citra Lestari (1150489)' },
];

export const SATUAN_OPTIONS: SelectOption[] = [
  { label: 'Box', value: 'Box' },
  { label: 'Porsi', value: 'Porsi' },
  { label: 'Paket', value: 'Paket' },
  { label: 'Kg', value: 'Kg' },
  { label: 'Cup', value: 'Cup' },
];
