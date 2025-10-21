import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- KOMPONEN UI STUB ---
const Button = ({ children, className, ...props }) => <button className={className} {...props}>{children}</button>;
const Card = ({ children, ...props }) => <div {...props}>{children}</div>;
const CardHeader = ({ children, ...props }) => <div {...props}>{children}</div>;
const CardTitle = ({ children, ...props }) => <h3 {...props}>{children}</h3>;
const CardContent = ({ children, ...props }) => <div {...props}>{children}</div>;

// --- TIPE DATA ---
interface StatusHistoryItem {
    timestamp: string;
    status: string;
    oleh: string;
}

interface Pemesanan {
    id: string;
    acara: string;
    tanggal: string;
    waktu: string;
    lokasi: string;
    status: 'Menunggu' | 'Disetujui' | 'Ditolak';
    statusHistory: StatusHistoryItem[]; // Riwayat status untuk timeline
    [key: string]: any;
}

// --- IKON BANTUAN ---
const PlusCircle = ({className = ""}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>;
const ClockIcon = ({className = ""}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const CheckCircle2 = ({className = ""}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>;
const XCircleIcon = ({className = ""}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>;
const Download = ({className = ""}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>;
const Eye = ({className = ""}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;
const FileTextIcon = ({className = ""}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>;
const Trash2 = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>;
const CalendarIcon = ({className = ""}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const MapPinIcon = ({className = ""}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const ListIcon = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>;
const GridIcon = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>;
const XIcon = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const AlertTriangleIcon = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className={className}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" x2="12" y1="9" y2="13"></line><line x1="12" x2="12.01" y1="17" y2="17"></line></svg>;


// --- KOMPONEN BARU: TIMELINE STATUS ---
const StatusTimeline = ({ history }) => (
    <div className="mt-6">
        <h4 className="font-semibold text-lg mb-4 text-gray-800">Status Order</h4>
        <div className="relative border-l-2 border-slate-200 ml-3">
            {Array.isArray(history) && history.length > 0 ? (
                history.map((item, index) => (
                    <div key={index} className="mb-8 flex items-start">
                        <div className="absolute -left-4 top-1 h-7 w-7 bg-green-500 rounded-full flex items-center justify-center text-white">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div className="ml-8">
                            <p className="font-semibold text-gray-700">[{item.timestamp}] : {item.status}</p>
                            <p className="text-sm text-gray-500">oleh {item.oleh}</p>
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-sm text-gray-500 ml-8">Tidak ada riwayat status yang tersedia.</p>
            )}
        </div>
    </div>
);

// --- KOMPONEN BARU: MODAL DETAIL PEMESANAN ---
const PemesananDetailModal = ({ pesanan, onClose }) => {
    if (!pesanan) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-6 border-b flex justify-between items-center">
                        <h3 className="text-2xl font-bold text-gray-800">Detail Pesanan</h3>
                        <Button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100">
                            <XIcon className="w-6 h-6 text-slate-500" />
                        </Button>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-4">
                            <div><strong className="block text-slate-500">Acara:</strong> <span className="text-gray-800">{pesanan.acara}</span></div>
                            <div><strong className="block text-slate-500">Tanggal:</strong> <span className="text-gray-800">{pesanan.tanggal}</span></div>
                            <div><strong className="block text-slate-500">Waktu:</strong> <span className="text-gray-800">{pesanan.waktu}</span></div>
                            <div><strong className="block text-slate-500">Lokasi:</strong> <span className="text-gray-800">{pesanan.lokasi}</span></div>
                            {/* Tambahkan field lain jika perlu */}
                        </div>
                        <StatusTimeline history={pesanan.statusHistory} />
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// --- KOMPONEN BARU: MODAL KONFIRMASI HAPUS ---
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, orderAcara }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, y: -20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: -20, opacity: 0 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center"
                >
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                        <AlertTriangleIcon className="h-8 w-8 text-red-600" />
                    </div>
                    <h3 className="mt-5 text-2xl font-bold text-gray-800">Hapus Pesanan</h3>
                    <p className="mt-2 text-gray-600">
                        Apakah Anda yakin ingin menghapus pesanan <strong className="font-semibold text-gray-800">"{orderAcara}"</strong>? Tindakan ini tidak dapat dibatalkan.
                    </p>
                    <div className="mt-8 flex justify-center gap-4">
                        <Button onClick={onClose} className="w-full rounded-lg bg-slate-200 px-6 py-3 text-base font-semibold text-gray-800 hover:bg-slate-300 transition-colors">
                            Batalkan
                        </Button>
                        <Button onClick={onConfirm} className="w-full rounded-lg bg-red-600 px-6 py-3 text-base font-semibold text-white hover:bg-red-700 transition-colors">
                            Ya, Hapus
                        </Button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};


// --- KOMPONEN STATCARD ---
const StatCard = ({ icon, title, value, colorClass }) => (
  <div className={`p-5 rounded-xl shadow-lg flex items-center space-x-4 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${colorClass}`}>
    <div className="text-4xl opacity-80">{icon}</div>
    <div>
      <p className="font-bold text-2xl">{value}</p>
      <p className="text-sm uppercase font-semibold opacity-70 tracking-wider">{title}</p>
    </div>
  </div>
);


// --- KOMPONEN UTAMA DASHBOARD ---
const PemesananDashboard = ({ 
    isLoading, 
    filteredAndSortedRiwayat: initialRiwayat = [], 
    counts = { Menunggu: 0, Disetujui: 0, Ditolak: 0 }, 
    actions = {} as any, 
    onNewOrderClick = () => {},
}) => {
  
  const [riwayatPemesanan, setRiwayatPemesanan] = useState(initialRiwayat);
  const [searchDate, setSearchDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [sortOrder, setSortOrder] = useState('Terbaru');
  const [viewMode, setViewMode] = useState('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPemesanan, setSelectedPemesanan] = useState<Pemesanan | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<{id: string, acara: string} | null>(null);

  useEffect(() => {
    setRiwayatPemesanan(initialRiwayat);
  }, [initialRiwayat]);

  const finalRiwayat = useMemo(() => {
    const dataToProcess = Array.isArray(riwayatPemesanan) ? riwayatPemesanan : [];
    return dataToProcess
      .filter(item => {
        if (searchDate && item.tanggal !== searchDate) return false;
        if (filterStatus !== 'Semua' && item.status !== filterStatus) return false;
        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.tanggal).getTime();
        const dateB = new Date(b.tanggal).getTime();
        return sortOrder === 'Terbaru' ? dateB - dateA : dateA - dateB;
      });
  }, [riwayatPemesanan, searchDate, filterStatus, sortOrder]);

  const handleViewDetails = (pemesanan) => {
    setSelectedPemesanan(pemesanan);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPemesanan(null);
  };

  const handleUpdateStatus = (id: string, newStatus: 'Disetujui' | 'Ditolak') => {
    const orderToUpdate = riwayatPemesanan.find(item => item.id === id);
    if (!orderToUpdate) return;

    const newHistoryEntry: StatusHistoryItem = {
        timestamp: new Date().toLocaleString('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        }),
        status: `Pesanan Di${newStatus}`,
        oleh: 'Sistem Admin'
    };

    const updatedOrder = {
        ...orderToUpdate,
        status: newStatus,
        statusHistory: [...(orderToUpdate.statusHistory || []), newHistoryEntry]
    };

    setRiwayatPemesanan(currentRiwayat =>
        currentRiwayat.map(item => (item.id === id ? updatedOrder : item))
    );
  };

  const handleOpenDeleteModal = (id: string, acara: string) => {
    setOrderToDelete({ id, acara });
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setOrderToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (!orderToDelete) return;
    setRiwayatPemesanan(currentRiwayat =>
        currentRiwayat.filter(item => item.id !== orderToDelete.id)
    );
    handleCloseDeleteModal();
  };
    
  useEffect(() => {
    const handleEsc = (event) => {
       if (event.keyCode === 27) {
         handleCloseModal();
         handleCloseDeleteModal();
       }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const statusClasses = {
    Disetujui: 'border-green-500 bg-green-100 hover:bg-green-200 shadow-sm',
    Ditolak: 'border-red-500 bg-red-100 hover:bg-red-200 shadow-sm',
    Menunggu: 'border-yellow-500 bg-yellow-100 hover:bg-yellow-200 shadow-sm',
  };

  return (
    <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Dasbor Pesanan</h2>
                    <p className="text-gray-500">Selamat datang! Berikut ringkasan pesanan Anda.</p>
                </div>
                <Button size="lg" onClick={onNewOrderClick} className="w-full md:w-auto transform hover:scale-105 transition-transform duration-300 bg-blue-600 text-white hover:bg-blue-700 h-11 px-8 rounded-md inline-flex items-center justify-center">
                    <PlusCircle className="mr-2 h-5 w-5" /> Buat Pesanan Baru
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <StatCard icon={<ClockIcon/>} title="Menunggu" value={counts.Menunggu} colorClass="bg-gradient-to-br from-yellow-400 to-orange-500 text-white" />
                <StatCard icon={<CheckCircle2/>} title="Disetujui" value={counts.Disetujui} colorClass="bg-gradient-to-br from-green-400 to-teal-500 text-white" />
                <StatCard icon={<XCircleIcon/>} title="Ditolak" value={counts.Ditolak} colorClass="bg-gradient-to-br from-red-500 to-pink-600 text-white" />
            </div>

            <Card className="rounded-lg border bg-white text-slate-900 shadow-sm">
                <CardHeader className="flex flex-row justify-between items-center p-6">
                    <div>
                      <CardTitle className="text-2xl font-semibold">Riwayat Pemesanan</CardTitle>
                    </div>
                    <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
                        <Button onClick={() => setViewMode('list')} className={`h-8 w-8 inline-flex items-center justify-center rounded transition-colors ${viewMode === 'list' ? 'bg-white shadow-md text-blue-600' : 'bg-transparent text-slate-500 hover:bg-slate-200'}`}>
                            <ListIcon className="w-5 h-5" />
                        </Button>
                        <Button onClick={() => setViewMode('grid')} className={`h-8 w-8 inline-flex items-center justify-center rounded transition-colors ${viewMode === 'grid' ? 'bg-white shadow-md text-blue-600' : 'bg-transparent text-slate-500 hover:bg-slate-200'}`}>
                            <GridIcon className="w-5 h-5" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 pb-4 border-b border-gray-200">
                        <div className="flex flex-wrap gap-2">
                            <div className="relative">
                                 <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="date"
                                    value={searchDate}
                                    onChange={(e) => setSearchDate(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <select 
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as 'Semua' | 'Menunggu' | 'Disetujui' | 'Ditolak')} 
                                className="w-full sm:w-[180px] h-10 border border-slate-300 rounded-md px-3 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="Semua">Semua Status</option>
                                <option value="Menunggu">Menunggu</option>
                                <option value="Disetujui">Disetujui</option>
                                <option value="Ditolak">Ditolak</option>
                            </select>
                             <select 
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value as 'Terbaru' | 'Terlama')} 
                                className="w-full sm:w-[180px] h-10 border border-slate-300 rounded-md px-3 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="Terbaru">Terbaru</option>
                                <option value="Terlama">Terlama</option>
                            </select>
                        </div>
                        <Button variant="outline" onClick={actions.exportCSV} className="border border-slate-300 hover:bg-slate-100 h-10 py-2 px-4 inline-flex items-center justify-center rounded-md">
                            <Download className="mr-2 h-4 w-4" /> Export CSV
                        </Button>
                    </div>
                    <div className={viewMode === 'list' ? "space-y-3" : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"}>
                        {isLoading ? <p className="text-center text-slate-500 py-8 md:col-span-2 xl:col-span-3">Memuat data...</p> : 
                         finalRiwayat.length === 0 ? (
                            <div className="text-center py-12 md:col-span-2 xl:col-span-3">
                                <FileTextIcon className="text-gray-300 w-24 h-24 mx-auto"/>
                                <h4 className="text-xl font-semibold text-gray-700 mt-4">Tidak Ada Pesanan Ditemukan</h4>
                                <p className="text-gray-500">Ubah filter Anda atau buat pesanan baru.</p>
                            </div>
                         ) : (
                           <AnimatePresence>
                             {finalRiwayat.map((item: Pemesanan, index: number) => (
                                <motion.div 
                                    key={item.id} 
                                    layout 
                                    initial={{ opacity: 0, y: 20 }} 
                                    animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05 } }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`p-4 rounded-lg flex transition-all duration-300 border-l-4 ${statusClasses[item.status]} ${viewMode === 'list' ? 'flex-col sm:flex-row justify-between sm:items-center gap-4' : 'flex-col gap-3'}`}
                                >
                                    <div className="space-y-2 w-full">
                                        <p className="font-bold text-gray-800">{item.acara}</p>
                                        <div className={`text-sm text-gray-500 flex flex-wrap gap-x-4 gap-y-1 ${viewMode === 'grid' ? 'flex-col items-start !gap-y-2' : 'items-center'}`}>
                                            <div className="flex items-center gap-1.5">
                                                <CalendarIcon className="w-4 h-4" />
                                                <span>{item.tanggal}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <ClockIcon className="w-4 h-4" />
                                                <span>{item.waktu || '--:--'}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <MapPinIcon className="w-4 h-4" />
                                                <span>{item.lokasi}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className={`flex items-center flex-wrap gap-2 ${viewMode === 'list' ? 'justify-end' : 'justify-between w-full border-t border-slate-200 pt-3 mt-2'}`}>
                                        <div className="flex-shrink-0">
                                            {item.status === 'Menunggu' ? (
                                                <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-100 p-1 shadow-inner">
                                                    <span className='flex items-center gap-1.5 px-2 py-1 text-xs font-bold rounded-md bg-yellow-100 text-yellow-800'>
                                                        <ClockIcon className="w-3 h-3" />
                                                        {item.status}
                                                    </span>
                                                    <div className="h-5 w-px bg-slate-300"></div>
                                                    <Button size="sm" onClick={() => handleUpdateStatus(item.id, 'Disetujui')} className="h-7 px-2 rounded-md bg-blue-600 text-white text-xs hover:bg-blue-700">Setujui</Button>
                                                    <Button variant="destructive" size="sm" onClick={() => handleUpdateStatus(item.id, 'Ditolak')} className="h-7 px-2 rounded-md bg-red-500 text-white text-xs hover:bg-red-600">Tolak</Button>
                                                </div>
                                            ) : (
                                                <span className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full ${
                                                    item.status === 'Disetujui' ? 'bg-green-100 text-green-800' : 
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {item.status === 'Disetujui' ? <CheckCircle2 className="w-3 h-3" /> : <XCircleIcon className="w-3 h-3" />}
                                                    {item.status}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center">
                                            <Button variant="ghost" size="icon" onClick={() => handleViewDetails(item)} className="h-10 w-10 hover:bg-slate-200/50 inline-flex items-center justify-center rounded-md">
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-100 h-10 w-10 inline-flex items-center justify-center rounded-md" onClick={() => handleOpenDeleteModal(item.id, item.acara)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                             ))}
                           </AnimatePresence>
                         )
                        }
                    </div>
                </CardContent>
            </Card>
        </motion.div>
        
        {isModalOpen && <PemesananDetailModal pesanan={selectedPemesanan} onClose={handleCloseModal} />}
        <DeleteConfirmationModal 
            isOpen={isDeleteModalOpen}
            onClose={handleCloseDeleteModal}
            onConfirm={handleConfirmDelete}
            orderAcara={orderToDelete?.acara}
        />
    </>
  );
}

export default PemesananDashboard;

