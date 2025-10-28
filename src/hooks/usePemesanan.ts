import { useState, useEffect, useMemo, useCallback } from 'react';
// DIUBAH: Menggunakan alias path '@' untuk konsistensi
import { formSchema, type Pemesanan, type FormInputData, type StatusHistoryItem } from '@/lib/schema';
import { useToast } from "@/components/ui/use-toast"; // Gunakan hook toast dari shadcn
import * as z from 'zod'; // Impor z untuk error handling

// Tipe status yang valid
type OrderStatus = Pemesanan['status'];
type FilterStatus = OrderStatus | 'Semua';
type SortOrder = 'Terbaru' | 'Terlama';

// Antarmuka untuk informasi order yang akan dihapus
interface OrderToDeleteInfo {
  id: string;
  acara: string;
}

export function usePemesanan() {
  const [riwayat, setRiwayat] = useState<Pemesanan[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Pemesanan | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("Semua");
  const [sortOrder, setSortOrder] = useState<SortOrder>("Terbaru");
  const [searchDate, setSearchDate] = useState<string>('');
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // State untuk konfirmasi hapus
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [orderToDeleteInfo, setOrderToDeleteInfo] = useState<OrderToDeleteInfo | null>(null);

  const { toast } = useToast(); // Gunakan hook toast

  // --- LOCALSTORAGE EFFECTS ---
  useEffect(() => {
  	setIsLoading(true);
  	// Simulasi loading dan update status otomatis
  	const timer = setTimeout(() => {
  	  try {
  		const savedRiwayat = localStorage.getItem('riwayatPemesanan');
  
  		let loadedRiwayat: Pemesanan[] = [];
  		if (savedRiwayat) {
  		  loadedRiwayat = JSON.parse(savedRiwayat);
  		  // Pastikan konsumsi selalu array
  		  loadedRiwayat = loadedRiwayat.map(order => ({
  			...order,
  			konsumsi: Array.isArray(order.konsumsi) ? order.konsumsi : []
  		  }));
  		}


  		// Update status 'Menunggu'/'Disetujui' menjadi 'Selesai' jika tanggal sudah lewat
  		const today = new Date();
  		today.setHours(0, 0, 0, 0);

  		const updatedRiwayat = loadedRiwayat.map(order => {
  		  if ((order.status === 'Menunggu' || order.status === 'Disetujui') && new Date(order.tanggalPengiriman) < today) {
  			  // Cek apakah sudah ada status 'Selesai' sebelumnya
  			  const alreadyFinished = order.statusHistory?.some(h => h.status === 'Pesanan Selesai');
  			  if (!alreadyFinished) {
  				  const newHistoryEntry: StatusHistoryItem = {
  					  timestamp: new Date().toLocaleString('id-ID'),
  					  status: 'Pesanan Selesai',
  					  oleh: 'Sistem',
  				  };
  				  return { ...order, status: 'Selesai' as OrderStatus, statusHistory: [...(order.statusHistory || []), newHistoryEntry] };
  			  }
  		  }
  		  return order;
  		});

  		setRiwayat(updatedRiwayat);

  	  } catch (error) {
  		console.error("Gagal memuat atau memproses data dari localStorage:", error);
  		toast({ title: "Error", description: "Gagal memuat data tersimpan.", variant: "destructive" });
  	  } finally {
  		setIsLoading(false);
  	  }
  	}, 500); // Penundaan simulasi
  	return () => clearTimeout(timer); // Cleanup timer
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Hanya dijalankan sekali saat mount


  // Efek untuk menyimpan ke localStorage ketika riwayat berubah (dan tidak sedang loading)
  useEffect(() => {
  	if (!isLoading) {
  	  try {
  		localStorage.setItem('riwayatPemesanan', JSON.stringify(riwayat));
  	  } catch (error) {
  		console.error("Gagal menyimpan data ke localStorage:", error);
  		toast({ title: "Error", description: "Gagal menyimpan perubahan.", variant: "destructive" });
  	  }
  	}
  }, [riwayat, isLoading, toast]);

  // --- DATA COMPUTATION (Filter & Sort) ---
  const { counts, filteredAndSortedRiwayat } = useMemo(() => {
  	// Inisialisasi counts
  	const calculatedCounts: Record<OrderStatus | 'Total', number> = {
  	  Menunggu: 0,
  	  Disetujui: 0,
  	  Ditolak: 0,
  	  Selesai: 0,
  	  Dibatalkan: 0,
  	  Total: riwayat.length,
  	};

  	// Hitung jumlah untuk setiap status
  	riwayat.forEach(r => {
  	  if (r.status in calculatedCounts) {
  		calculatedCounts[r.status]++;
  	  }
  	});

  	// Filter berdasarkan status dan tanggal
  	const filtered = riwayat.filter(r => {
  	  const statusMatch = filterStatus === "Semua" || r.status === filterStatus;
  	  // Perhatikan nama field tanggal di data Pemesanan (mungkin 'tanggalPengiriman' atau 'tanggal')
  	  const dateMatch = !searchDate || r.tanggalPengiriman === searchDate; // Sesuaikan jika perlu
  	  return statusMatch && dateMatch;
  	});

  	// Urutkan hasil filter
  	const sorted = [...filtered].sort((a, b) => {
  	  // Pastikan ada tanggal yang valid untuk dibandingkan
  	  const dateA = a.tanggalPengiriman ? new Date(a.tanggalPengiriman).getTime() : 0;
  	  const dateB = b.tanggalPengiriman ? new Date(b.tanggalPengiriman).getTime() : 0;
  	  return sortOrder === 'Terbaru' ? dateB - dateA : dateA - dateB;
  	});

  	return {
  	  counts: calculatedCounts,
  	  filteredAndSortedRiwayat: sorted,
  	};
  }, [riwayat, filterStatus, sortOrder, searchDate]);

  // --- ACTIONS ---
  const addOrder = useCallback((values: FormInputData) => {
  	const initialHistory: StatusHistoryItem = {
  	  timestamp: new Date().toLocaleString('id-ID'), // Format tanggal lokal
  	  status: 'Pesanan Dibuat',
  	  oleh: values.yangMengajukan || 'Pemesan', // Ambil dari form jika ada
  	};

  	const newOrder: Pemesanan = {
  	  ...values,
  	  id: crypto.randomUUID(),
  	  status: 'Menunggu', // Status awal
  	  createdAt: new Date().toISOString(),
  	  statusHistory: [initialHistory],
  	  tanggal: values.tanggalPengiriman, // Pastikan field 'tanggal' diset untuk konsistensi
  	  // Pastikan konsumsi selalu array saat membuat order baru
  	  konsumsi: Array.isArray(values.konsumsi) ? values.konsumsi : []
  	};

  	// Validasi dengan Zod sebelum menambahkan (opsional tapi bagus)
  	try {
  		// Validasi values sebelum menyimpannya sebagai newOrder
  		formSchema.parse(values);
  		// Pastikan newOrder juga valid (meskipun seharusnya sudah karena berasal dari values)
  		// Anda bisa menambahkan validasi terpisah untuk Pemesanan jika perlu
  		setRiwayat(prevRiwayat => [newOrder, ...prevRiwayat]);
  		toast({ title: "🎉 Pemesanan Berhasil!", description: "Pesanan telah ditambahkan ke riwayat." });
  		return true; // Indicate success
  	} catch (error) {
  		 if (error instanceof z.ZodError) {
  		  console.error("Validation errors:", error.issues);
  		  // Menampilkan error validasi pertama ke user
  		  const firstError = error.issues[0];
  		  toast({
  			  title: "Input Tidak Valid",
  			  description: `${firstError.path.join('.')} - ${firstError.message}`,
  			  variant: "destructive",
  		  });
  		} else {
  		  console.error("Gagal menambahkan pesanan:", error);
  		  toast({ title: "Error", description: "Gagal menambahkan pesanan.", variant: "destructive" });
  		}
  		return false; // Indicate failure
  	}
  }, [toast]); // Include toast in dependencies

  const updateStatus = useCallback((id: string, newStatus: 'Disetujui' | 'Ditolak' | 'Dibatalkan', updatedBy: string = 'Admin') => {
  	setRiwayat(prevRiwayat =>
  	  prevRiwayat.map(item => {
  		if (item.id === id) {
  		  const statusTextMap = {
  			  'Disetujui': 'Pesanan Disetujui',
  			  'Ditolak': 'Pesanan Ditolak',
  			  'Dibatalkan': 'Pesanan Dibatalkan',
  			  'Selesai': 'Pesanan Selesai', // Mungkin diperlukan jika manual
  			  'Menunggu': 'Pesanan Menunggu' // Seharusnya tidak terjadi dari update manual
  		  };
  		  const newHistoryEntry: StatusHistoryItem = {
  			  timestamp: new Date().toLocaleString('id-ID'),
  			  status: statusTextMap[newStatus] || `Status diubah menjadi ${newStatus}`,
  			  oleh: updatedBy,
  		  };
  		  // Hanya tambahkan history jika status benar-benar berubah
  		  if (item.status !== newStatus) {
  			  return {
  				  ...item,
  				  status: newStatus,
  				  statusHistory: [...(item.statusHistory || []), newHistoryEntry]
  			  };
  		  }
  		}
  		return item;
  	  })
  	);
  	toast({ title: "Status Diperbarui", description: `Pesanan kini ${newStatus}.` });
  }, [toast]); // Include toast in dependencies


  // Fungsi untuk membuka modal konfirmasi hapus
  const openDeleteConfirm = useCallback((id: string, acara: string) => {
  	setOrderToDeleteInfo({ id, acara });
  	setIsDeleteConfirmOpen(true);
  }, []);

  // Fungsi untuk menutup modal konfirmasi hapus
  const closeDeleteConfirm = useCallback(() => {
  	setOrderToDeleteInfo(null);
  	setIsDeleteConfirmOpen(false);
  }, []);

 // Fungsi yang dipanggil saat tombol "Ya, Hapus" ditekan
 const confirmDeleteOrder = useCallback(() => {
  	if (orderToDeleteInfo) {
  	  setRiwayat(prev => prev.filter(item => item.id !== orderToDeleteInfo.id));
  	  toast({ title: "Pesanan Dihapus", description: `Pesanan "${orderToDeleteInfo.acara}" telah berhasil dihapus.` });
  	  closeDeleteConfirm(); // Tutup modal setelah menghapus
  	}
  }, [orderToDeleteInfo, toast, closeDeleteConfirm]); // Include dependencies

  const exportCSV = useCallback(() => {
  	if (filteredAndSortedRiwayat.length === 0) {
  	  toast({ title: "Tidak Ada Data", description: "Tidak ada data riwayat untuk diekspor.", variant:"destructive" });
  	  return;
  	}

  	// Header CSV yang disederhanakan
  	const headers = ["Acara", "Tgl Pengiriman", "Waktu", "Lokasi", "Pengaju", "Bagian", "Status", "Konsumsi (Jenis|Satuan|Qty)"];
  	
  	const rows = filteredAndSortedRiwayat.map(o => {
  		// Pastikan o.konsumsi adalah array sebelum memanggil .map()
  		const konsumsiArray = Array.isArray(o.konsumsi) ? o.konsumsi : [];
  		const konsumsiString = konsumsiArray.map(k => `${k.jenis}|${k.satuan}|${k.qty}`).join('; ');

  		// Pilih kolom yang sesuai dengan header baru
  		return [
  		  `"${(o.acara ?? '').replace(/"/g, '""')}"`,
  		  o.tanggalPengiriman || '',
  		  o.waktu || '',
  		  `"${(o.lokasi ?? '').replace(/"/g, '""')}"`,
  		  `"${(o.yangMengajukan ?? '').replace(/"/g, '""')}"`,
  		  `"${(o.untukBagian ?? '').replace(/"/g, '""')}"`,
  		  o.status,
  		  `"${konsumsiString}"`, // Kolom konsumsi
  		].join(",");
  	});

  	const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
  	const link = document.createElement("a");
  	link.href = encodeURI(csvContent);
  	link.download = `riwayat_pemesanan_${new Date().toISOString().split('T')[0]}.csv`;
  	document.body.appendChild(link); // Required for Firefox
  	link.click();
  	document.body.removeChild(link);
  	toast({ title: "Ekspor Berhasil", description: "Data riwayat telah diekspor ke CSV." });
  }, [filteredAndSortedRiwayat, toast]); // Include dependencies

  const viewOrderDetails = useCallback((order: Pemesanan) => {
  	setSelectedOrder(order);
  	setIsDetailDialogOpen(true);
  }, []);

  	// Fungsi untuk menampilkan toast (bisa dipanggil dari mana saja)
  	const showToast = useCallback((title: string, description: string, variant?: "default" | "destructive") => {
  		toast({ title, description, variant });
  }, [toast]);


  return {
  	riwayat, // Data asli
  	filteredAndSortedRiwayat, // Data yang sudah difilter & sort
  	counts, // Jumlah status
  	selectedOrder, // Order yang dipilih untuk detail
  	isDetailDialogOpen, // Status modal detail
  	isLoading, // Status loading
  	searchDate, // State tanggal pencarian
  	filterStatus, // State filter status
  	sortOrder, // State urutan
  	isDeleteConfirmOpen, // Status modal konfirmasi hapus
  	orderToDeleteInfo, // Info order yang akan dihapus
  	actions: {
  	  addOrder,
  	  updateStatus,
  	  // deleteOrder: confirmDeleteOrder, // Ganti nama agar lebih jelas ini adalah konfirmasi
  	  exportCSV,
  	  viewOrderDetails,
  	  setFilterStatus,
  	  setSortOrder,
  	  setSearchDate,
  	  setIsDetailDialogOpen,
  	  openDeleteConfirm,  // Action untuk membuka modal hapus
  	  closeDeleteConfirm, // Action untuk menutup modal hapus
  	  confirmDeleteOrder, // Action untuk konfirmasi penghapusan
  	  showToast, // Tambahkan showToast ke actions
  	},
  };
}

