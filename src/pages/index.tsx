import React, { useEffect, useRef, useState } from 'react';
import { useSharedPemesanan } from '@/context/PemesananContext';
import PemesananDashboard from '@/components/pemesanan/PemesananDashboard';
import PemesananForm from '@/components/pemesanan/PemesananForm';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
} from '@/components/ui/alert-dialog';
import { AlertTriangle, X } from 'lucide-react';
import type { FormInputData } from '@/lib/schema';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function Home() {
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const modalRef = useRef<HTMLDivElement | null>(null);

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

    const { addOrder, closeDeleteConfirm, confirmDeleteOrder } = actions;

    const handleStartNewOrder = () => setIsFormModalOpen(true);
    const handleCloseForm = () => setIsFormModalOpen(false);

    const handleFormSubmit = (values: FormInputData) => {
        const success = addOrder(values);
        if (success) {
            setIsFormModalOpen(false);
        }
        return success;
    };

    useEffect(() => {
        if (!isFormModalOpen) return;
        const modalEl = modalRef.current;
        if (!modalEl) return;

        let startY = 0;
        let currentY = 0;
        let isDragging = false;

        const handlePointerDown = (event: PointerEvent) => {
            if (event.pointerType === 'mouse' && window.innerWidth > 640) {
                return;
            }
            isDragging = true;
            startY = event.clientY;
            modalEl.setPointerCapture(event.pointerId);
        };

        const handlePointerMove = (event: PointerEvent) => {
            if (!isDragging) return;
            currentY = event.clientY - startY;
            if (currentY < 0) currentY = 0;
            modalEl.style.transform = `translateY(${currentY}px)`;
        };

        const resetTransform = () => {
            modalEl.style.transition = 'transform 0.2s ease-out';
            modalEl.style.transform = 'translateY(0)';
            window.setTimeout(() => {
                modalEl.style.transition = '';
            }, 200);
        };

        const handlePointerUp = () => {
            if (!isDragging) return;
            isDragging = false;
            if (currentY > 120) {
                handleCloseForm();
            } else {
                resetTransform();
            }
        };

        modalEl.addEventListener('pointerdown', handlePointerDown);
        modalEl.addEventListener('pointermove', handlePointerMove);
        modalEl.addEventListener('pointerup', handlePointerUp);
        modalEl.addEventListener('pointercancel', handlePointerUp);

        return () => {
            modalEl.removeEventListener('pointerdown', handlePointerDown);
            modalEl.removeEventListener('pointermove', handlePointerMove);
            modalEl.removeEventListener('pointerup', handlePointerUp);
            modalEl.removeEventListener('pointercancel', handlePointerUp);
        };
    }, [isFormModalOpen]);

    return (
        <div className="bg-slate-50 dark:bg-slate-900 min-h-screen font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300 ease-out">
            <div className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Dasbor Konsumsi</p>
                        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Pemesanan Konsumsi</h1>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
                            Kelola semua pesanan konsumsi acara Anda dari satu tempat, lengkap dengan status terkini.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                    </div>
                </div>

                <section>
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
                </section>
            </div>

            <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
                <DialogContent
                    ref={modalRef}
                    className="max-h-[95vh] overflow-y-auto p-0 sm:max-w-4xl"
                    hideCloseButton
                >
                    <DialogHeader className="border-b border-slate-100 bg-white/80 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/70">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <DialogTitle className="text-xl font-semibold">Pesanan baru</DialogTitle>
                                <DialogDescription>Isi detail kebutuhan konsumsi lalu simpan untuk tim.</DialogDescription>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={handleCloseForm}
                                aria-label="Tutup form pemesanan"
                                title="Tutup form"
                                className="group h-10 w-10 rounded-2xl border border-slate-200/80 bg-white/80 text-slate-500 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-400 dark:border-slate-700/70 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:bg-slate-800/90 dark:hover:text-white"
                            >
                                <X className="h-5 w-5 transition-transform duration-200 group-hover:scale-105" aria-hidden="true" />
                                <span className="sr-only">Tutup</span>
                            </Button>
                        </div>
                    </DialogHeader>
                    <div className="px-2 pb-6 pt-4 sm:px-6">
                        <PemesananForm
                            riwayat={riwayat}
                            onFormSubmit={handleFormSubmit}
                            onReturnToDashboard={handleCloseForm}
                            onRequestClose={handleCloseForm}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteConfirmOpen} onOpenChange={closeDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <AlertDialogTitle className="text-center">Hapus Pesanan?</AlertDialogTitle>
                        <AlertDialogDescription className="text-center">
                            Anda yakin ingin menghapus pesanan <strong>&quot;{orderToDeleteInfo?.acara}&quot;</strong>? Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={closeDeleteConfirm}>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeleteOrder} className="bg-red-600 text-white hover:bg-red-700">
                            Ya, hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
