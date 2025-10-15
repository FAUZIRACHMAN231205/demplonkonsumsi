import * as z from 'zod';

export const formSchema = z.object({
  acara: z.string().min(3, "Nama acara minimal 3 karakter"),
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
  lokasi: z.string().min(3, "Lokasi wajib diisi"),
  jumlah: z.string().min(1, "Jumlah wajib diisi").regex(/^\d+$/, "Jumlah harus angka"),
  catatan: z.string().optional(),
});

export type Pemesanan = {
  id: string;
  acara: string;
  tanggal: string;
  lokasi: string;
  jumlah: string;
  catatan?: string;
  status: 'Menunggu' | 'Disetujui' | 'Ditolak';
  createdAt: string; // ISO Date String
}

