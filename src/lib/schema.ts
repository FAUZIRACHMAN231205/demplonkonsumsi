import * as z from "zod";

// Skema untuk satu item konsumsi
export const konsumsiItemSchema = z.object({
  jenis: z.string().min(1, "Menu wajib diisi"),
  satuan: z.string().min(1, "Satuan wajib diisi"),
  qty: z.string().refine((val) => /^\d+$/.test(val) && parseInt(val, 10) > 0, {
    message: "Qty > 0",
  }),
});

// Skema utama form
export const formSchema = z.object({
  acara: z.string().min(3, "Nama acara harus diisi (minimal 3 karakter)."),
  tanggalPermintaan: z.string().refine((val) => val && !isNaN(Date.parse(val)), {
    message: "Tanggal permintaan harus valid.",
  }),
  tanggalPengiriman: z.string().refine((val) => val && !isNaN(Date.parse(val)), {
    message: "Tanggal pengiriman harus valid.",
  }),
  waktu: z.string().min(1, "Waktu harus dipilih."), // Pastikan ini sesuai dengan nilai yang diharapkan
  lokasi: z.string().min(3, "Lokasi harus diisi (minimal 3 karakter)."),
  tamu: z.string().min(1, "Jenis tamu harus dipilih."), // Pastikan ini sesuai dengan nilai yang diharapkan
  yangMengajukan: z.string().min(3, "Yang mengajukan harus dipilih."),
  untukBagian: z.string().min(3, "Bagian harus dipilih."),
  approval: z.string().min(3, "Approval harus dipilih."),
  konsumsi: z.array(konsumsiItemSchema).min(1, "Minimal harus ada satu item konsumsi."),
  catatan: z.string().optional(),
});

// Tipe data Status History
export type StatusHistoryItem = {
  timestamp: string;
  status: string; // Misal: "Pesanan Dibuat", "Pesanan Disetujui", "Pesanan Ditolak", "Pesanan Selesai", "Pesanan Dibatalkan"
  oleh: string; // Misal: "Riza Ilhamsyah", "Jojok Satriadi", "Sistem"
};


// Tipe data Pemesanan berdasarkan skema Zod + tambahan
export type Pemesanan = z.infer<typeof formSchema> & {
  id: string;
  status: 'Menunggu' | 'Disetujui' | 'Ditolak' | 'Selesai' | 'Dibatalkan'; // Sesuaikan status
  createdAt: string;
  statusHistory: StatusHistoryItem[]; // Tambahkan riwayat status
  // Ganti 'tanggalPermintaan' menjadi 'tanggal' agar konsisten dengan dashboard
  tanggal: string; // Menyamakan dengan field di dashboard
};

// Tipe data input form (tanpa id, status, createdAt, statusHistory)
export type FormInputData = z.infer<typeof formSchema>;