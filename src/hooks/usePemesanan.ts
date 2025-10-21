import { useState, useEffect, useMemo } from 'react';
import { formSchema, Pemesanan } from '../lib/schema';
import * as z from 'zod';

export function usePemesanan() {
  const [riwayat, setRiwayat] = useState<Pemesanan[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Pemesanan | null>(null);
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [sortOrder, setSortOrder] = useState("Terbaru");
  const [searchDate, setSearchDate] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [toast, setToast] = useState<{ title: string; description: string; show: boolean }>({ title: '', description: '', show: false });
  const [isLoading, setIsLoading] = useState(true);

  // --- LOCALSTORAGE EFFECTS ---
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => { // Simulate loading
      try {
        const savedRiwayat = localStorage.getItem('riwayatPemesanan');
        if (savedRiwayat) {
          setRiwayat(JSON.parse(savedRiwayat));
        }
      } catch (error) {
        console.error("Gagal memuat data dari localStorage:", error);
        showToast("Error", "Gagal memuat data tersimpan.");
      }
      setIsLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem('riwayatPemesanan', JSON.stringify(riwayat));
      } catch (error) {
        console.error("Gagal menyimpan data ke localStorage:", error);
        showToast("Error", "Gagal menyimpan perubahan.");
      }
    }
  }, [riwayat, isLoading]);

  // --- HELPER FUNCTIONS ---
  const showToast = (title: string, description: string) => {
    setToast({ title, description, show: true });
    setTimeout(() => setToast({ title: '', description: '', show: false }), 3000);
  };

  // --- DATA COMPUTATION ---
  const { counts, filteredAndSortedRiwayat } = useMemo(() => {
    const calculatedCounts = {
        Menunggu: 0,
        Disetujui: 0,
        Ditolak: 0,
    };
    
    riwayat.forEach(r => {
        if (r.status in calculatedCounts) calculatedCounts[r.status]++;
    });

    const filtered = riwayat.filter(r => {
        const statusMatch = filterStatus === "Semua" || r.status === filterStatus;
        const dateMatch = !searchDate || r.tanggal === searchDate; 
        return statusMatch && dateMatch;
    });
    
    const sorted = filtered.sort((a, b) => {
        const dateA = new Date(a.tanggal).getTime();
        const dateB = new Date(b.tanggal).getTime();
        return sortOrder === 'Terbaru' ? dateB - dateA : dateA - dateB;
    });

    return {
        counts: calculatedCounts,
        filteredAndSortedRiwayat: sorted,
    };
  }, [riwayat, filterStatus, sortOrder, searchDate]);

  // --- ACTIONS ---
  const addOrder = (values: z.infer<typeof formSchema>) => {
    const newOrder: Pemesanan = {
      ...values,
      id: crypto.randomUUID(),
      status: 'Menunggu',
      createdAt: new Date().toISOString(),
    };
    setRiwayat(prevRiwayat => [newOrder, ...prevRiwayat]);
    showToast("🎉 Pemesanan Berhasil!", "Pesanan telah ditambahkan ke riwayat.");
    return true; // Indicate success
  };

  const updateStatus = (id: string, acara: string, status: 'Disetujui' | 'Ditolak') => {
    setRiwayat(prevRiwayat =>
      prevRiwayat.map(item =>
        item.id === id ? { ...item, status } : item
      )
    );
    showToast("Status Diperbarui", `Pesanan "${acara}" kini ${status}.`);
  };

  const deleteOrder = (id: string, acara: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus pesanan "${acara}"?`)) {
      setRiwayat(prev => prev.filter(item => item.id !== id));
      showToast("Pesanan Dihapus", `Pesanan "${acara}" telah berhasil dihapus.`);
    }
  };

  const exportCSV = () => {
    const headers = ["Acara", "Tanggal", "Lokasi", "Status", "Catatan"];
    const rows = filteredAndSortedRiwayat.map(o => [
      `"${o.acara.replace(/"/g, '""')}"`,
      o.tanggal,
      `"${o.lokasi.replace(/"/g, '""')}"`,
      o.status,
      `"${(o.catatan ?? "").replace(/"/g, '""')}"`
    ].join(","));
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "riwayat_pemesanan.csv";
    link.click();
  };
  
  const viewOrderDetails = (order: Pemesanan) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  return {
    riwayat,
    filteredAndSortedRiwayat,
    counts,
    selectedOrder,
    isDialogOpen,
    toast,
    isLoading,
    searchDate,
    actions: {
      addOrder,
      updateStatus,
      deleteOrder,
      exportCSV,
      viewOrderDetails,
      setFilterStatus,
      setSortOrder,
      setSearchDate,
      setIsDialogOpen,
    },
  };
}

