import React, { useState } from 'react';
import { useSharedPemesanan } from '@/context/PemesananContext';
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
import type { Pemesanan, StatusHistoryItem } from '@/lib/schema';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/theme-toggle';

// == KOMPONEN HELPER ==

const DetailItem = ({ label, value, fullWidth = false, badgeStatus }: { label: string, value: string | undefined | null, fullWidth?: boolean, badgeStatus?: Pemesanan['status'] }) => {
     const statusClasses = badgeStatus ? {
        'Menunggu': 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700',
        'Disetujui': 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700',
        'Ditolak': 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700',
        'Selesai': 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700',
        'Dibatalkan': 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600',
        'Akan Datang': 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700',
     }[badgeStatus] : '';

    return (
        <div className={cn("text-sm", fullWidth && "col-span-2")}>
            <strong className="block text-slate-500 dark:text-slate-400">{label}:</strong>
             {badgeStatus ? (
                 <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium border", statusClasses)}>
                     {value || "-"}
                 </span>
             ) : (
                 <span className="text-gray-800 dark:text-gray-200 break-words">{value || "-"}</span>
             )}
        </div>
    );
};

// Komponen Timeline Status
const StatusTimeline = ({ history }: { history?: StatusHistoryItem[] }) => (
    <div className="mt-6">
        <h4 className="font-semibold text-lg mb-4 text-gray-800 dark:text-gray-200">Riwayat Status</h4>
        <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-3">
            {Array.isArray(history) && history.length > 0 ? (
                history.map((item, index) => (
                    <div key={index} className="mb-6 pl-8 relative before:absolute before:left-[-11px] before:top-[5px] before:h-5 before:w-5 before:bg-blue-500 before:rounded-full before:border-4 before:border-white dark:before:border-slate-900">
                        <p className="font-semibold text-gray-700 dark:text-gray-300">{item.status}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {item.timestamp ? (() => {
                                try {
                                    const date = new Date(item.timestamp);
                                    if (!isNaN(date.getTime())) {
                                        return date.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                                    } else {
                                        console.warn(`Invalid date format in statusHistory timestamp: ${item.timestamp}`);
                                        return item.timestamp;
                                    }
                                } catch (e) {
                                    console.error(`Error parsing date: ${item.timestamp}`, e);
                                    return 'Error tanggal';
                                }
                             })() : 'Tanggal tidak ada'} oleh {item.oleh}
                        </p>
                    </div>
                  ))
            ) : <p className="text-sm text-gray-500 dark:text-gray-400 ml-8">Tidak ada riwayat status.</p>}
        </div>
    </div>
);
// == AKHIR KOMPONEN HELPER ==

export default function Home() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'form'>('dashboard');

    const {
    riwayat,
    filteredAndSortedRiwayat,
    counts,
    actions,
    selectedOrder,
    isDetailDialogOpen,
    searchDate,
    filterStatus,
    sortOrder,
    isDeleteConfirmOpen,
    orderToDeleteInfo,
    } = useSharedPemesanan();

  const handleStartNewOrder = () => setCurrentView('form');
  const returnToDashboard = () => setCurrentView('dashboard');

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen font-sans text-slate-900 dark:text-slate-100 transition-colors">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
        <header className="text-center mb-8 relative">
            <div className="absolute top-0 right-0">
              <ThemeToggle />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 dark:text-gray-100 tracking-tight">Pemesanan Konsumsi</h1>
            <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 mt-1">Kelola semua pesanan konsumsi untuk acara Anda.</p>
        </header>

                {currentView === 'dashboard' ? (
                    <PemesananDashboard
                        filteredAndSortedRiwayat={filteredAndSortedRiwayat}
                        counts={counts}
                        actions={actions}
                        onNewOrderClick={handleStartNewOrder}
                        searchDate={searchDate}
                        filterStatus={filterStatus}
                        sortOrder={sortOrder}
                        selectedOrder={selectedOrder}
                        isDetailDialogOpen={isDetailDialogOpen}
                    />
                ) : (
                    <PemesananForm
                        riwayat={riwayat}
                        onFormSubmit={(values) => {
                            console.log("[Home] Form submitted, attempting to add order:", values);
                            const success = actions.addOrder(values);
                            console.log("[Home] addOrder success status:", success);
                            return success;
                        }}
                        onReturnToDashboard={returnToDashboard}
                    />
                )}

        {/* Modal Detail */}
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
                                 <h4 className="font-semibold text-md mb-2 text-gray-800 dark:text-gray-200">Detail Konsumsi</h4>
                                 <div className="space-y-2">
                                     {Array.isArray(selectedOrder.konsumsi) && selectedOrder.konsumsi.map((item, index) => (
                                         <div key={index} className="flex justify-between items-center text-sm p-2 bg-slate-50 dark:bg-slate-800/60 rounded-md border dark:border-slate-700">
                                             <span className="font-medium text-slate-700 dark:text-slate-200">{index + 1}. {item.jenis}</span>
                                             <span className="text-slate-600 dark:text-slate-300">{item.qty} {item.satuan}</span>
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

        {/* Modal Konfirmasi Hapus */}
        <AlertDialog open={isDeleteConfirmOpen} onOpenChange={actions.closeDeleteConfirm}>
             <AlertDialogContent>
                 <AlertDialogHeader>
                     <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                          <AlertTriangle className="h-6 w-6 text-red-600" />
                     </div>
                     <AlertDialogTitle className="text-center">Hapus Pesanan?</AlertDialogTitle>
                     <AlertDialogDescription className="text-center">
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

      </div>
    </div>
  );
}
