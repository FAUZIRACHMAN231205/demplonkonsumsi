import React, { useState, useEffect, useMemo, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pemesanan, StatusHistoryItem } from '@/lib/schema'; // (PATH DIPERBAIKI)
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // Impor AlertDialog

// --- UTILITY: Class Name Merger ---
import { cn } from '@/lib/utils';

// --- UI COMPONENTS ---
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Gunakan Tooltip shadcn

// --- IKON BANTUAN ---
import {
    PlusCircle, Clock, CheckCircle2, XCircle, List, Grid, Calendar, Download, FileText, MapPin, Eye, Trash2
} from 'lucide-react';

// --- KOMPONEN TIMELINE STATUS ---
const StatusTimeline = ({ history }: { history?: StatusHistoryItem[] }) => (
    <div className="mt-6">
        <h4 className="font-semibold text-lg mb-4 text-gray-800">Riwayat Status</h4>
        <div className="relative border-l-2 border-slate-200 ml-3">
            {Array.isArray(history) && history.length > 0 ? (
                history.map((item, index) => (
                    <div key={index} className="mb-8 pl-8 relative before:absolute before:left-[-11px] before:top-[5px] before:h-5 before:w-5 before:bg-blue-500 before:rounded-full before:border-4 before:border-white">
                        <p className="font-semibold text-gray-700">{item.status}</p>
                        <p className="text-sm text-gray-500">
                            {item.timestamp ? new Date(item.timestamp).toLocaleString('id-ID', {
                                day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                             }) : 'Tanggal tidak valid'} oleh {item.oleh}
                        </p>
                    </div>
                ))
            ) : <p className="text-sm text-gray-500 ml-8">Tidak ada riwayat status.</p>}
        </div>
    </div>
);

// --- Komponen Modal Detail ---
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog'; // (PATH DIPERBAIKI)

const PemesananDetailModal = ({ pesanan, isOpen, onClose }: { pesanan: Pemesanan | null, isOpen: boolean, onClose: () => void }) => {
    if (!pesanan) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Detail Pesanan: {pesanan.acara}</DialogTitle>
                    <DialogDescription>
                        Informasi lengkap mengenai pesanan Anda.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {/* Detail Pesanan */}
                    <div className="grid grid-cols-2 gap-4">
                        <DetailItem label="Acara" value={pesanan.acara} />
                        <DetailItem label="Tanggal Pengiriman" value={pesanan.tanggalPengiriman ? new Date(pesanan.tanggalPengiriman).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric'}) : '-'} />
                        <DetailItem label="Waktu" value={pesanan.waktu} />
                        <DetailItem label="Lokasi" value={pesanan.lokasi} />
                        <DetailItem label="Jenis Tamu" value={pesanan.tamu} />
                        <DetailItem label="Pengaju" value={pesanan.yangMengajukan} />
                        <DetailItem label="Bagian" value={pesanan.untukBagian} />
                        <DetailItem label="Approval" value={pesanan.approval} />
                        <DetailItem label="Status" value={pesanan.status} badgeStatus={pesanan.status} />
                        <DetailItem label="Tgl Permintaan" value={pesanan.tanggalPermintaan ? new Date(pesanan.tanggalPermintaan).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric'}) : '-'} />
                    </div>
                    {pesanan.catatan && <DetailItem label="Catatan" value={pesanan.catatan} fullWidth />}

                    {/* Detail Konsumsi */}
                    <div className="mt-4">
                        <h4 className="font-semibold text-md mb-2 text-gray-800">Detail Konsumsi</h4>
                        <div className="space-y-2">
                            {pesanan.konsumsi.map((item, index) => (
                                <div key={index} className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded-md border">
                                    <span className="font-medium text-slate-700">{index + 1}. {item.jenis}</span>
                                    <span className="text-slate-600">{item.qty} {item.satuan}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <StatusTimeline history={pesanan.statusHistory} />
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
    );
};

// --- Helper component Detail Item ---
const DetailItem = ({ label, value, fullWidth = false, badgeStatus }: { label: string, value: string | undefined | null, fullWidth?: boolean, badgeStatus?: Pemesanan['status'] }) => {
    const statusClasses = badgeStatus ? {
        'Menunggu': 'bg-yellow-100 text-yellow-800 border-yellow-300',
        'Disetujui': 'bg-purple-100 text-purple-800 border-purple-300',
        'Ditolak': 'bg-red-100 text-red-800 border-red-300',
        'Selesai': 'bg-green-100 text-green-800 border-green-300',
        'Dibatalkan': 'bg-gray-100 text-gray-800 border-gray-300',
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

// --- KOMPONEN WIDGET & STATS ---

// --- Komponen DateWidget dihapus ---

const StatCard = ({ icon, title, value, iconBgClass }: { icon: React.ReactNode, title: string, value: number, iconBgClass: string }) => (
    <Card className="transition-all duration-300 hover:shadow-lg p-4 h-full">
        <div className="flex items-center justify-between">
            <div className="flex flex-col">
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <p className="text-2xl font-bold text-slate-800">{value}</p>
            </div>
            <div className={cn("p-2 rounded-lg", iconBgClass)}>
                {icon}
            </div>
        </div>
    </Card>
);

// --- Komponen Skeleton ---
const Skeleton = ({ className }: { className?: string }) => <div className={cn("animate-pulse rounded-md bg-slate-200", className)} />;

// --- Tipe Props Dashboard ---
interface PemesananDashboardProps {
    isLoading: boolean;
    filteredAndSortedRiwayat: Pemesanan[];
    counts: Record<Pemesanan['status'] | 'Total', number>;
    actions: {
        setFilterStatus: (status: Pemesanan['status'] | 'Semua') => void;
        setSortOrder: (order: 'Terbaru' | 'Terlama') => void;
        setSearchDate: (date: string) => void;
        exportCSV: () => void;
        viewOrderDetails: (order: Pemesanan) => void;
        openDeleteConfirm: (id: string, acara: string) => void;
        setIsDetailDialogOpen: (isOpen: boolean) => void;
    };
    onNewOrderClick: () => void;
    searchDate: string;
    filterStatus: Pemesanan['status'] | 'Semua';
    sortOrder: 'Terbaru' | 'Terlama';
    selectedOrder: Pemesanan | null;
    isDetailDialogOpen: boolean;
}

// --- KOMPONEN UTAMA DASHBOARD ---
const PemesananDashboard: React.FC<PemesananDashboardProps> = ({
    isLoading,
    filteredAndSortedRiwayat,
    counts,
    actions,
    onNewOrderClick,
    searchDate,
    filterStatus,
    sortOrder,
    selectedOrder,
    isDetailDialogOpen,
}) => {

    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const handleCloseModal = () => actions.setIsDetailDialogOpen(false);

    // Konfigurasi status
    const statusConfig: Record<Pemesanan['status'], { list: string, grid: string, icon: React.ReactNode }> = {
        'Menunggu': { list: 'bg-yellow-100 text-yellow-800', grid: 'border-yellow-500', icon: <Clock className="w-3 h-3" /> },
        'Disetujui': { list: 'bg-purple-100 text-purple-800', grid: 'border-purple-500', icon: <CheckCircle2 className="w-3 h-3" /> },
        'Ditolak': { list: 'bg-red-100 text-red-800', grid: 'border-red-500', icon: <XCircle className="w-3 h-3" /> },
        'Selesai': { list: 'bg-green-100 text-green-800', grid: 'border-green-500', icon: <CheckCircle2 className="w-3 h-3" /> },
        'Dibatalkan': { list: 'bg-gray-100 text-gray-800', grid: 'border-gray-500', icon: <XCircle className="w-3 h-3" /> },
    };

    return (
        <TooltipProvider>
            {/* Bungkus dengan Fragment (<>) untuk mengatasi error single child */}
            <>
                <div className="font-['Poppins',_sans-serif]">
                    <style>{` @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;800&display=swap');`}</style>

                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800">Dasbor Pesanan</h2>
                            <p className="text-gray-500">Selamat datang! Berikut ringkasan pesanan Anda.</p>
                        </div>
                        <Button size="lg" onClick={onNewOrderClick} className="w-full md:w-auto transform hover:scale-105 transition-transform duration-300 ease-in-out shadow-lg hover:shadow-xl bg-gradient-to-r from-blue-500 to-indigo-600">
                            <PlusCircle className="mr-2 h-5 w-5" />Buat Pesanan Baru
                        </Button>
                    </div>

                    {/* Stat Cards (DateWidget dihapus, grid disesuaikan) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        {/* <div className="sm:col-span-2 lg:col-span-1"><DateWidget /></div> -- DIHAPUS -- */}
                        <StatCard icon={<Clock className="w-6 h-6 text-yellow-600" />} title="Menunggu" value={counts.Menunggu} iconBgClass="bg-yellow-100" />
                        <StatCard icon={<CheckCircle2 className="w-6 h-6 text-green-600" />} title="Selesai" value={counts.Selesai} iconBgClass="bg-green-100" />
                        <StatCard icon={<XCircle className="w-6 h-6 text-red-600" />} title="Ditolak/Batal" value={(counts.Ditolak || 0) + (counts.Dibatalkan || 0)} iconBgClass="bg-red-100" />
                    </div>

                    {/* Riwayat Pemesanan Card */}
                    <Card className="overflow-hidden">
                        <CardHeader className="flex flex-col md:flex-row justify-between md:items-center p-6 gap-4 bg-slate-50 border-b">
                            <CardTitle className="text-xl">Riwayat Pemesanan</CardTitle>
                            {/* View Mode Toggle */}
                            <div className="flex items-center gap-1 rounded-lg bg-slate-200 p-1 self-start md:self-center">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="sm" onClick={() => setViewMode('list')} className={cn("p-2 h-8 w-8", viewMode === 'list' && 'bg-white shadow-sm text-blue-600')}>
                                            <List className="w-4 h-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Tampilan Daftar</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="sm" onClick={() => setViewMode('grid')} className={cn("p-2 h-8 w-8", viewMode === 'grid' && 'bg-white shadow-sm text-blue-600')}>
                                            <Grid className="w-4 h-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Tampilan Grid</TooltipContent>
                                </Tooltip>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 md:p-6">
                            {/* Filter & Export Controls */}
                            <div className="flex flex-col xl:flex-row justify-between items-center gap-4 mb-4 pb-4 border-b">
                                <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full">
                                    <div className="relative flex-grow min-w-[150px]">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            type="date"
                                            value={searchDate}
                                            onChange={(e) => actions.setSearchDate(e.target.value)}
                                            className="h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                    </div>
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => actions.setFilterStatus(e.target.value as Pemesanan['status'] | 'Semua')}
                                        className="h-9 w-full sm:w-auto flex-grow min-w-[150px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    >
                                        <option value="Semua">Semua Status</option>
                                        <option value="Menunggu">Menunggu</option>
                                        <option value="Disetujui">Disetujui</option>
                                        <option value="Ditolak">Ditolak</option>
                                        <option value="Selesai">Selesai</option>
                                        <option value="Dibatalkan">Dibatalkan</option>
                                    </select>
                                    <select
                                        value={sortOrder}
                                        onChange={(e) => actions.setSortOrder(e.target.value as 'Terbaru' | 'Terlama')}
                                        className="h-9 w-full sm:w-auto flex-grow min-w-[150px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    >
                                        <option value="Terbaru">Terbaru</option>
                                        <option value="Terlama">Terlama</option>
                                    </select>
                                </div>
                                <Button variant="outline" size="sm" onClick={actions.exportCSV} className="w-full xl:w-auto flex-shrink-0">
                                    <Download className="mr-2 h-4 w-4" />Export CSV
                                </Button>
                            </div>

                            {/* Daftar atau Grid Pesanan */}
                            {isLoading ? (
                                // Skeleton Loading
                                <div className={cn(viewMode === 'list' ? "space-y-3" : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4")}>
                                    {Array.from({ length: 4 }).map((_, i) => viewMode === 'list' ? <Skeleton key={i} className="h-[76px] w-full" /> : <Skeleton key={i} className="h-[150px] w-full" />)}
                                </div>
                            ) : filteredAndSortedRiwayat.length === 0 ? (
                                // Pesan Kosong
                                <div className="text-center py-12 text-slate-500">
                                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <h4 className="text-lg font-semibold text-slate-700">Tidak Ada Pesanan Ditemukan</h4>
                                    <p className="text-sm mt-1">Coba ubah filter atau buat pesanan baru.</p>
                                    <Button onClick={onNewOrderClick} className="mt-6">
                                        <PlusCircle className="mr-2 h-4 w-4" />Buat Pesanan Baru
                                    </Button>
                                </div>
                            ) : (
                                // Daftar atau Grid
                                <div className={cn(viewMode === 'list' ? "space-y-3" : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4")}>
                                    <AnimatePresence>
                                        {filteredAndSortedRiwayat.map((item) => {
                                            const config = statusConfig[item.status] || statusConfig['Dibatalkan'];
                                            const displayDate = item.tanggalPengiriman ? new Date(item.tanggalPengiriman) : null;

                                            if (viewMode === 'list') {
                                                // Tampilan List Item
                                                return (
                                                    <motion.div
                                                        key={item.id} layout
                                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="bg-white hover:bg-slate-50 rounded-lg shadow-sm border flex flex-col sm:flex-row items-stretch p-3 gap-3 w-full"
                                                    >
                                                        <div className={cn("flex-shrink-0 text-center w-full sm:w-20 p-2 rounded-lg flex sm:flex-col items-center justify-center", config.list)}>
                                                            {displayDate ? (
                                                                <>
                                                                    <p className="text-xs font-bold uppercase">{displayDate.toLocaleDateString('id-ID', { month: 'short' })}</p>
                                                                    <p className="text-2xl font-extrabold sm:mt-1">{displayDate.getDate()}</p>
                                                                </>
                                                            ) : ( <p className="text-sm font-bold">--</p> )}
                                                        </div>
                                                        <div className="flex-grow space-y-1 py-1">
                                                            <p className="font-bold text-gray-800 text-base leading-tight">{item.acara}</p>
                                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                                                                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{item.waktu || '--:--'}</span>
                                                                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{item.lokasi}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col sm:flex-row items-center justify-end sm:justify-start gap-1 sm:ml-auto flex-shrink-0">
                                                            <span className={cn("flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap", config.list)}>
                                                                {config.icon}{item.status}
                                                            </span>
                                                            <div className="flex">
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button variant="ghost" size="sm" onClick={() => actions.viewOrderDetails(item)} className="p-2 h-8 w-8 rounded-md">
                                                                            <Eye className="w-4 h-4 text-slate-500" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>Lihat Detail</TooltipContent>
                                                                </Tooltip>
                                                                {item.status === 'Menunggu' && (
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button variant="ghost" size="sm" className="p-2 h-8 w-8 rounded-md text-red-500 hover:bg-red-100 hover:text-red-600" onClick={() => actions.openDeleteConfirm(item.id, item.acara)}>
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>Hapus</TooltipContent>
                                                                    </Tooltip>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                );
                                            } else {
                                                // Tampilan Grid Item
                                                return (
                                                    <motion.div
                                                        key={item.id} layout
                                                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                                        transition={{ duration: 0.2 }}
                                                        className={cn("rounded-lg flex flex-col bg-white border-l-4 shadow-sm hover:shadow-md transition-shadow", config.grid)}
                                                    >
                                                        <div className="p-4 space-y-2 flex-grow">
                                                            <p className="font-bold text-gray-800 leading-tight">{item.acara}</p>
                                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{displayDate ? displayDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year:'numeric'}) : '--'}</span>
                                                                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{item.waktu || '--:--'}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                                                                <span className="line-clamp-1">{item.lokasi}</span>
                                                            </div>
                                                        </div>
                                                        <div className="border-t p-3 flex justify-between items-center bg-slate-50/50">
                                                            <span className={cn("flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full", config.list)}>
                                                                {config.icon}{item.status}
                                                            </span>
                                                            <div className="flex items-center">
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button variant="ghost" size="sm" onClick={() => actions.viewOrderDetails(item)} className="p-1 h-7 w-7 rounded-md">
                                                                            <Eye className="w-4 h-4 text-slate-500" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>Lihat Detail</TooltipContent>
                                                                </Tooltip>
                                                                {item.status === 'Menunggu' && (
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button variant="ghost" size="sm" className="p-1 h-7 w-7 rounded-md text-red-500 hover:bg-red-100 hover:text-red-600" onClick={() => actions.openDeleteConfirm(item.id, item.acara)}>
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>Hapus</TooltipContent>
                                                                    </Tooltip>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                );
                                            }
                                        })}
                                    </AnimatePresence>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Modal Detail */}
                <PemesananDetailModal
                    pesanan={selectedOrder}
                    isOpen={isDetailDialogOpen}
                    onClose={handleCloseModal}
                />
            </>
        </TooltipProvider>
    );
}

export default PemesananDashboard;

