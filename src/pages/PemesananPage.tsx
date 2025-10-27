import React, { useState, useEffect } from 'react'; // Keep useEffect import for potential future use
import { motion, AnimatePresence } from 'framer-motion';
// DIUBAH: Menggunakan alias path '@/' lagi, asumsi ini benar
import { usePemesanan } from '@/hooks/usePemesanan';

// DIUBAH: Menggunakan alias path '@/' lagi
import PemesananDashboard from '@/components/pemesanan/PemesananDashboard';
import PemesananForm from '@/components/pemesanan/PemesananForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from 'lucide-react';

// Toaster should ideally be in _app.tsx, remove import if it is
// import { Toaster } from "@/components/ui/toaster";
import type { Pemesanan, StatusHistoryItem } from '@/lib/schema';

// Helper function cn - Asumsi diimpor dari utils
import { cn } from '@/lib/utils';

// == KOMPONEN HELPER ==

const DetailItem = ({ label, value, fullWidth = false, badgeStatus }: { label: string, value: string | undefined | null, fullWidth?: boolean, badgeStatus?: Pemesanan['status'] }) => {
     const statusClasses = badgeStatus ? {
        'Menunggu': 'bg-yellow-100 text-yellow-800 border-yellow-300',
        'Disetujui': 'bg-purple-100 text-purple-800 border-purple-300',
        'Ditolak': 'bg-red-100 text-red-800 border-red-300',
        'Selesai': 'bg-green-100 text-green-800 border-green-300',
        'Dibatalkan': 'bg-gray-100 text-gray-800 border-gray-300',
        'Akan Datang': 'bg-blue-100 text-blue-800 border-blue-300', // Example if needed
     }[badgeStatus] : '';


    return (
        <div className={cn("text-sm", fullWidth && "col-span-2")}>
            <strong className="block text-slate-500">{label}:</strong>
             {badgeStatus ? (
                 <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium border", statusClasses)}>
                     {value || "-"}
                 </span>
             ) : (
                 <span className="text-gray-800 break-words">{value || "-"}</span>
             )}
        </div>
    );
};

// Komponen Timeline Status
const StatusTimeline = ({ history }: { history?: StatusHistoryItem[] }) => (
    <div className="mt-6">
        <h4 className="font-semibold text-lg mb-4 text-gray-800">Riwayat Status</h4>
        <div className="relative border-l-2 border-slate-200 ml-3">
            {Array.isArray(history) && history.length > 0 ? (
                history.map((item, index) => (
                    <div key={index} className="mb-6 pl-8 relative before:absolute before:left-[-11px] before:top-[5px] before:h-5 before:w-5 before:bg-blue-500 before:rounded-full before:border-4 before:border-white">
                        <p className="font-semibold text-gray-700">{item.status}</p>
                        <p className="text-sm text-gray-500">
                            {/* Safely format date, handle invalid dates */}
                            {item.timestamp ? (() => {
                                try {
                                    // Attempt to parse ISO string or existing locale string
                                    
                                    // PERBAIKAN 1: Mengubah 'let' menjadi 'const'
                                    const date = new Date(item.timestamp);
                                    
                                    // Check if the date is valid
                                    if (!isNaN(date.getTime())) {
                                        // Format valid date
                                        return date.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                                    } else {
                                        // If parsing fails, maybe it's already formatted? Return as is.
                                        // Or return a specific error message if it's truly invalid.
                                        console.warn(`Invalid date format in statusHistory timestamp: ${item.timestamp}`);
                                        return item.timestamp; // Or 'Tanggal tidak valid'
                                    }
                                } catch (e) {
                                    console.error(`Error parsing date: ${item.timestamp}`, e);
                                    return 'Error tanggal'; // Indicate error
                                }
                             })() : 'Tanggal tidak ada'} oleh {item.oleh}
                        </p>
                    </div>
                  ))
            ) : <p className="text-sm text-gray-500 ml-8">Tidak ada riwayat status.</p>}
        </div>
    </div>
);
// == AKHIR KOMPONEN HELPER ==


export default function PemesananPage() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'form'>('dashboard');

  // Panggil hook usePemesanan di level atas
  const {
    riwayat,
    filteredAndSortedRiwayat,
    counts,
    actions,
    selectedOrder,
    isDetailDialogOpen,
    isLoading,
    searchDate,
    filterStatus,
    sortOrder,
    isDeleteConfirmOpen,
    orderToDeleteInfo,
  } = usePemesanan();

  // --- HAPUS useEffect INI ---
  /*
  useEffect(() => {
    console.log("PemesananPage rendered. Current view:", currentView);
    if (currentView === 'dashboard') {
        console.log("  isLoading:", isLoading);
        console.log("  counts:", counts);
    }
  }, [currentView, isLoading, counts]); // Hapus dependensi jika log dihapus
  */
  // --- AKHIR useEffect YANG DIHAPUS ---

  // Functions tetap di level atas
  const handleStartNewOrder = () => setCurrentView('form');
  const returnToDashboard = () => setCurrentView('dashboard');

  // Log di luar useEffect untuk melihat render
  console.log("[PemesananPage] Rendering. Current view:", currentView, "isLoading:", isLoading);

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900">
      <style>{` @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;800&display=swap'); body { font-family: 'Poppins', sans-serif; }`}</style>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
        <header className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 tracking-tight">Pemesanan Konsumsi</h1>
            <p className="text-base sm:text-lg text-gray-500 mt-1">Kelola semua pesanan konsumsi untuk acara Anda.</p>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentView} // Key is important for AnimatePresence
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
          >
            {/* Conditional rendering after hooks */}
            {currentView === 'dashboard' ? (
              <PemesananDashboard
                isLoading={isLoading}
                filteredAndSortedRiwayat={filteredAndSortedRiwayat}
                counts={counts}
                actions={actions}
                onNewOrderClick={handleStartNewOrder}
                searchDate={searchDate}
                filterStatus={filterStatus}
                sortOrder={sortOrder}
                // Modal state now handled by the Page, so these props might not be needed in Dashboard
                // selectedOrder={selectedOrder}
                // isDetailDialogOpen={isDetailDialogOpen}
              />
            ) : (
              <PemesananForm
                riwayat={riwayat} // Pass raw history for potentially needed data like unique acara
                onFormSubmit={(values) => {
                  console.log("[PemesananPage] Form submitted, attempting to add order:", values);
                  const success = actions.addOrder(values);
                  console.log("[PemesananPage] addOrder success status:", success);
                  // Optionally switch view after successful submission
                  // if (success) {
                  //     returnToDashboard();
                  // }
                  return success; // Return success status
                }}
                onReturnToDashboard={returnToDashboard}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Modal Detail - Kept at Page level */}
        <Dialog open={isDetailDialogOpen} onOpenChange={actions.setIsDetailDialogOpen}>
             <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
                 <DialogHeader>
                     <DialogTitle>Detail Pesanan: {selectedOrder?.acara}</DialogTitle>
                     <DialogDescription>
                           Informasi lengkap mengenai pesanan Anda.
                     </DialogDescription>
                 </DialogHeader>
                 <div className="grid gap-4 py-4">
                     {selectedOrder && (
                         <>
                             <div className="grid grid-cols-2 gap-4">
                                 <DetailItem label="Acara" value={selectedOrder.acara} />
                                 <DetailItem label="Tanggal Pengiriman" value={selectedOrder.tanggalPengiriman ? new Date(selectedOrder.tanggalPengiriman).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric'}) : '-'} />
                                 <DetailItem label="Waktu" value={selectedOrder.waktu} />
                                 <DetailItem label="Lokasi" value={selectedOrder.lokasi} />
                                 <DetailItem label="Jenis Tamu" value={selectedOrder.tamu} />
                                 <DetailItem label="Pengaju" value={selectedOrder.yangMengajukan} />
                                 <DetailItem label="Bagian" value={selectedOrder.untukBagian} />
                                 <DetailItem label="Approval" value={selectedOrder.approval} />
                                 <DetailItem label="Status" value={selectedOrder.status} badgeStatus={selectedOrder.status} />
                                 <DetailItem label="Tgl Permintaan" value={selectedOrder.tanggalPermintaan ? new Date(selectedOrder.tanggalPermintaan).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric'}) : '-'} />
                             </div>
                            {selectedOrder.catatan && <DetailItem label="Catatan" value={selectedOrder.catatan} fullWidth />}

                             <div className="mt-4">
                                 <h4 className="font-semibold text-md mb-2 text-gray-800">Detail Konsumsi</h4>
                                 <div className="space-y-2">
                                     {Array.isArray(selectedOrder.konsumsi) && selectedOrder.konsumsi.map((item, index) => (
                                         <div key={index} className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded-md border">
                                             <span className="font-medium text-slate-700">{index + 1}. {item.jenis}</span>
                                             <span className="text-slate-600">{item.qty} {item.satuan}</span>
                                         </div>
                                     ))}
                                 </div>
                             </div>
                              <StatusTimeline history={selectedOrder.statusHistory} />
                           </>
                     )}
                 </div>
                 <DialogFooter>
                     <DialogClose asChild>
                         <Button type="button" variant="secondary">
                             Tutup
                         </Button>
                     </DialogClose>
                 </DialogFooter>
             </DialogContent>
        </Dialog>

        {/* Modal Konfirmasi Hapus - Kept at Page level */}
        <AlertDialog open={isDeleteConfirmOpen} onOpenChange={actions.closeDeleteConfirm}>
             <AlertDialogContent>
                 <AlertDialogHeader>
                     <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                          <AlertTriangle className="h-6 w-6 text-red-600" />
                     </div>
                     <AlertDialogTitle className="text-center">Hapus Pesanan?</AlertDialogTitle>
                     <AlertDialogDescription className="text-center">
                          {/* PERBAIKAN 2: Mengganti " dengan &quot; */}
                          Anda yakin ingin menghapus pesanan <strong className="font-medium">&quot;{orderToDeleteInfo?.acara}&quot;</strong>? Tindakan ini tidak dapat dibatalkan.
                     </AlertDialogDescription>
                 </AlertDialogHeader>
                 <AlertDialogFooter>
                     <AlertDialogCancel onClick={actions.closeDeleteConfirm}>Batal</AlertDialogCancel>
                     <AlertDialogAction onClick={actions.confirmDeleteOrder} className="bg-red-600 hover:bg-red-700">
                         Ya, Hapus
                     </AlertDialogAction>
                 </AlertDialogFooter>
             </AlertDialogContent>
        </AlertDialog>

        {/* Toaster should be in _app.tsx */}
        {/* <Toaster /> */}

      </div>
    </div>
  );
}