import React, { useState } from 'react';
import { Pemesanan, StatusHistoryItem } from '@/lib/schema'; // (PATH DIPERBAIKI)

// --- UTILITY: Class Name Merger ---
import { cn } from '@/lib/utils';

// --- UI COMPONENTS ---
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Gunakan Tooltip shadcn
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger,
    DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";

// --- IKON BANTUAN ---
import {
    PlusCircle, Clock, CheckCircle2, XCircle, List, Grid, Calendar, Download, FileText, MapPin, Eye, Trash2, MoreVertical
} from 'lucide-react';

// --- HELPER: Calculate Status Progress ---
const getStatusProgress = (status: Pemesanan['status']): number => {
    const progressMap: Record<Pemesanan['status'], number> = {
        'Menunggu': 25,
        'Disetujui': 50,
        'Ditolak': 100,
        'Selesai': 100,
        'Dibatalkan': 100,
    };
    return progressMap[status] || 0;
};

const getStatusColor = (status: Pemesanan['status']): string => {
    const colorMap: Record<Pemesanan['status'], string> = {
        'Menunggu': 'bg-yellow-500',
        'Disetujui': 'bg-purple-500',
        'Ditolak': 'bg-red-500',
        'Selesai': 'bg-green-500',
        'Dibatalkan': 'bg-gray-500',
    };
    return colorMap[status] || 'bg-gray-500';
};

// Custom Progress Bar with dynamic color
const StatusProgressBar = ({ status }: { status: Pemesanan['status'] }) => {
    const progress = getStatusProgress(status);
    const colorClass = getStatusColor(status);
    
    return (
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
            <div 
                className={cn("h-full rounded-full transition-all duration-300", colorClass)}
                style={{ width: `${progress}%` }}
            />
        </div>
    );
};

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
                        <h4 className="font-semibold text-md mb-2 text-gray-800 dark:text-slate-200">Detail Konsumsi</h4>
                        <div className="space-y-2">
                            {pesanan.konsumsi.map((item, index) => (
                                <div key={index} className="flex justify-between items-center text-sm p-2 bg-slate-50 dark:bg-slate-700 rounded-md border dark:border-slate-600">
                                    <span className="font-medium text-slate-700 dark:text-slate-300">{index + 1}. {item.jenis}</span>
                                    <span className="text-slate-600 dark:text-slate-400">{item.qty} {item.satuan}</span>
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
    <Card className="hover:shadow-lg active:shadow-xl transition-shadow p-4 sm:p-5 h-full dark:bg-slate-800/80 dark:border-slate-600">
        <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-300 mb-1">{title}</p>
                <p className="text-3xl sm:text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 tabular-nums">{value}</p>
            </div>
            <div className={cn("p-3 rounded-xl flex-shrink-0", iconBgClass)}>
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
        'Menunggu': { list: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', grid: 'border-yellow-500', icon: <Clock className="w-3 h-3" /> },
        'Disetujui': { list: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', grid: 'border-purple-500', icon: <CheckCircle2 className="w-3 h-3" /> },
        'Ditolak': { list: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', grid: 'border-red-500', icon: <XCircle className="w-3 h-3" /> },
        'Selesai': { list: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', grid: 'border-green-500', icon: <CheckCircle2 className="w-3 h-3" /> },
        'Dibatalkan': { list: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200', grid: 'border-gray-500', icon: <XCircle className="w-3 h-3" /> },
    };

    return (
        <TooltipProvider>
            {/* Bungkus dengan Fragment (<>) untuk mengatasi error single child */}
            <>
                <div className="font-['Poppins',_sans-serif]">
                    <style>{` @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;800&display=swap');`}</style>

                    {/* Header - Mobile-First Optimized */}
                    <div className="flex flex-col gap-3 mb-6 sm:mb-8">
                        <div className="space-y-1">
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 leading-tight">Dasbor Pesanan</h2>
                            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">Selamat datang! Berikut ringkasan pesanan Anda.</p>
                        </div>
                        <Button 
                            size="lg" 
                            onClick={onNewOrderClick} 
                            className="w-full sm:w-auto sm:self-start transform active:scale-95 sm:hover:scale-105 transition-transform duration-200 shadow-lg hover:shadow-xl bg-gradient-to-r from-blue-500 to-indigo-600 h-12 text-base font-semibold"
                        >
                            <PlusCircle className="mr-2 h-5 w-5" />
                            <span>Buat Pesanan Baru</span>
                        </Button>
                    </div>

                    {/* Stat Cards - Mobile-First Optimized */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                        <StatCard 
                            icon={<Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400" />} 
                            title="Menunggu" 
                            value={counts.Menunggu} 
                            iconBgClass="bg-yellow-100 dark:bg-yellow-500/20" 
                        />
                        <StatCard 
                            icon={<CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />} 
                            title="Selesai" 
                            value={counts.Selesai} 
                            iconBgClass="bg-green-100 dark:bg-green-500/20" 
                        />
                        <StatCard 
                            icon={<XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" />} 
                            title="Ditolak/Batal" 
                            value={(counts.Ditolak || 0) + (counts.Dibatalkan || 0)} 
                            iconBgClass="bg-red-100 dark:bg-red-500/20" 
                        />
                    </div>

                    {/* Riwayat Pemesanan Card - Mobile-First */}
                    <Card className="overflow-hidden dark:bg-slate-800 dark:border-slate-700">
                        <CardHeader className="flex flex-col p-4 sm:p-6 gap-2 sm:gap-4 bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-700">
                            <CardTitle className="text-lg sm:text-xl dark:text-gray-100">Riwayat Pemesanan</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 sm:p-4 md:p-6 dark:bg-slate-800">
                            {/* Filter & Export Controls - Mobile-First */}
                            <div className="flex flex-col gap-3 mb-4 pb-4 border-b dark:border-slate-700">
                                {/* Mobile: Stack all filters vertically */}
                                <div className="flex flex-col gap-2 w-full">
                                    {/* Date Filter */}
                                    <div className="relative w-full">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                        </div>
                                        <input
                                            type="date"
                                            value={searchDate}
                                            onChange={(e) => actions.setSearchDate(e.target.value)}
                                            className="h-11 sm:h-10 w-full rounded-lg sm:rounded-md border border-input bg-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white pl-10 pr-3 py-2 text-base sm:text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        />
                                    </div>
                                    
                                    {/* Status & Sort Filters in 2 columns on mobile */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <select
                                            value={filterStatus}
                                            onChange={(e) => actions.setFilterStatus(e.target.value as Pemesanan['status'] | 'Semua')}
                                            className="h-11 sm:h-10 w-full rounded-lg sm:rounded-md border border-input bg-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 text-base sm:text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        >
                                            <option value="Semua">Semua</option>
                                            <option value="Menunggu">Menunggu</option>
                                            <option value="Disetujui">Disetujui</option>
                                            <option value="Ditolak">Ditolak</option>
                                            <option value="Selesai">Selesai</option>
                                            <option value="Dibatalkan">Dibatalkan</option>
                                        </select>
                                        <select
                                            value={sortOrder}
                                            onChange={(e) => actions.setSortOrder(e.target.value as 'Terbaru' | 'Terlama')}
                                            className="h-11 sm:h-10 w-full rounded-lg sm:rounded-md border border-input bg-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 text-base sm:text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        >
                                            <option value="Terbaru">Terbaru</option>
                                            <option value="Terlama">Terlama</option>
                                        </select>
                                    </div>
                                </div>
                                
                                {/* Export Button */}
                                <Button 
                                    variant="outline" 
                                    size="default"
                                    onClick={actions.exportCSV} 
                                    className="w-full h-11 sm:h-10 dark:bg-slate-700 dark:border-slate-600 dark:hover:bg-slate-600 text-base sm:text-sm"
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Export CSV
                                </Button>
                            </div>

                            {/* Daftar atau Grid Pesanan */}
                            {isLoading ? (
                                // Skeleton Loading - Mobile-First
                                <Tabs defaultValue="list" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2 h-11 sm:h-10 mb-4">
                                        <TabsTrigger value="list" className="flex items-center justify-center gap-2 text-sm sm:text-base">
                                            <List className="w-4 h-4" />
                                            <span>Daftar</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="grid" className="flex items-center justify-center gap-2 text-sm sm:text-base">
                                            <Grid className="w-4 h-4" />
                                            <span>Grid</span>
                                        </TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="list" className="space-y-3">
                                        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[100px] sm:h-[76px] w-full" />)}
                                    </TabsContent>
                                    <TabsContent value="grid" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                                        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[200px] sm:h-[150px] w-full" />)}
                                    </TabsContent>
                                </Tabs>
                            ) : filteredAndSortedRiwayat.length === 0 ? (
                                // Pesan Kosong - Mobile-First
                                <div className="text-center py-12 sm:py-16 px-4 text-slate-500">
                                    <FileText className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-50 dark:opacity-30" />
                                    <h4 className="text-base sm:text-lg font-semibold text-slate-700 dark:text-slate-300">Tidak Ada Pesanan Ditemukan</h4>
                                    <p className="text-sm mt-2 dark:text-slate-400 max-w-sm mx-auto">Coba ubah filter atau buat pesanan baru.</p>
                                    <Button onClick={onNewOrderClick} className="mt-6 h-11 sm:h-10 text-base sm:text-sm">
                                        <PlusCircle className="mr-2 h-4 w-4" />Buat Pesanan Baru
                                    </Button>
                                </div>
                            ) : (
                                // Tabs dengan List dan Grid View - Mobile-First Optimized
                                <Tabs defaultValue={viewMode} onValueChange={(value) => setViewMode(value as 'list' | 'grid')} className="w-full">
                                    <TabsList className="grid w-full grid-cols-2 h-11 sm:h-10 mb-4">
                                        <TabsTrigger value="list" className="flex items-center justify-center gap-2 text-sm sm:text-base data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
                                            <List className="w-4 h-4" />
                                            <span>Daftar</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="grid" className="flex items-center justify-center gap-2 text-sm sm:text-base data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
                                            <Grid className="w-4 h-4" />
                                            <span>Grid</span>
                                        </TabsTrigger>
                                    </TabsList>
                                    
                                    <TabsContent value="list" className="space-y-3 mt-0">
                                    {filteredAndSortedRiwayat.map((item) => {
                                        const config = statusConfig[item.status] || statusConfig['Dibatalkan'];
                                        const displayDate = item.tanggalPengiriman ? new Date(item.tanggalPengiriman) : null;

                                        // Tampilan List Item - Mobile-First Optimized
                                            return (
                                                <div
                                                    key={item.id}
                                                    className="bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 active:bg-slate-100 dark:active:bg-slate-600 rounded-xl shadow-sm border dark:border-slate-600 flex flex-col p-4 gap-3 w-full transition-colors"
                                                >
                                                    {/* Mobile: Header Row with Date & Status */}
                                                    <div className="flex items-center justify-between gap-3">
                                                        {/* Date Badge */}
                                                        <div className={cn("flex items-center gap-2 px-3 py-2 rounded-lg flex-shrink-0", config.list)}>
                                                            {displayDate ? (
                                                                <>
                                                                    <span className="text-xs font-bold uppercase leading-none">{displayDate.toLocaleDateString('id-ID', { month: 'short' })}</span>
                                                                    <span className="text-xl sm:text-2xl font-extrabold leading-none">{displayDate.getDate()}</span>
                                                                </>
                                                            ) : ( <span className="text-sm font-bold">--</span> )}
                                                        </div>
                                                        
                                                        {/* Status & Actions */}
                                                        <div className="flex items-center gap-2">
                                                            <span className={cn("flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap", config.list)}>
                                                                {config.icon}
                                                                <span className="hidden xs:inline">{item.status}</span>
                                                            </span>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="sm" className="p-2.5 h-9 w-9 rounded-lg dark:hover:bg-slate-600 active:scale-95">
                                                                        <MoreVertical className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="w-44">
                                                                    <DropdownMenuItem onClick={() => actions.viewOrderDetails(item)} className="cursor-pointer h-10">
                                                                        <Eye className="w-4 h-4 mr-2" />
                                                                        Lihat Detail
                                                                    </DropdownMenuItem>
                                                                    {item.status === 'Menunggu' && (
                                                                        <>
                                                                            <DropdownMenuSeparator />
                                                                            <DropdownMenuItem 
                                                                                onClick={() => actions.openDeleteConfirm(item.id, item.acara)} 
                                                                                className="cursor-pointer h-10 text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                                                                            >
                                                                                <Trash2 className="w-4 h-4 mr-2" />
                                                                                Hapus
                                                                            </DropdownMenuItem>
                                                                        </>
                                                                    )}
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Content */}
                                                    <div className="space-y-2.5">
                                                        <h3 className="font-bold text-gray-800 dark:text-slate-100 text-base sm:text-lg leading-tight line-clamp-2">{item.acara}</h3>
                                                        
                                                        <div className="flex flex-col gap-1.5 text-sm text-gray-600 dark:text-slate-400">
                                                            <div className="flex items-center gap-2">
                                                                <Clock className="w-4 h-4 flex-shrink-0 text-blue-500" />
                                                                <span className="font-medium">{item.waktu || '--:--'}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <MapPin className="w-4 h-4 flex-shrink-0 text-red-500" />
                                                                <span className="line-clamp-1 font-medium">{item.lokasi}</span>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Progress Bar */}
                                                        <div className="flex items-center gap-3 pt-1">
                                                            <StatusProgressBar status={item.status} />
                                                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap tabular-nums">
                                                                {getStatusProgress(item.status)}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </TabsContent>
                                    
                                    <TabsContent value="grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-0">
                                        {filteredAndSortedRiwayat.map((item) => {
                                            const config = statusConfig[item.status] || statusConfig['Dibatalkan'];
                                            const displayDate = item.tanggalPengiriman ? new Date(item.tanggalPengiriman) : null;
                                            
                                            // Tampilan Grid Item - Mobile-First Optimized
                                            return (
                                                <div
                                                        key={item.id}
                                                        className={cn(
                                                            "group relative rounded-xl flex flex-col bg-white dark:bg-slate-800 border-2 shadow-lg hover:shadow-2xl active:shadow-xl overflow-hidden transition-shadow",
                                                            config.grid
                                                        )}
                                                    >
                                                        {/* Decorative gradient overlay */}
                                                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        
                                                        {/* Status Badge - Floating style */}
                                                        <div className="absolute top-3 right-3 z-10">
                                                            <span
                                                                className={cn("flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold rounded-full shadow-md backdrop-blur-sm", config.list)}
                                                            >
                                                                {config.icon}
                                                                <span className="hidden xs:inline">{item.status}</span>
                                                            </span>
                                                        </div>

                                                        {/* Date Badge - Creative circular design */}
                                                        <div className="absolute top-3 left-3 z-10">
                                                            {displayDate ? (
                                                                <div 
                                                                    className={cn("flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg font-bold", config.list)}
                                                                >
                                                                    <span className="text-[10px] sm:text-xs uppercase leading-none">{displayDate.toLocaleDateString('id-ID', { month: 'short' })}</span>
                                                                    <span className="text-lg sm:text-xl leading-none mt-0.5">{displayDate.getDate()}</span>
                                                                </div>
                                                            ) : (
                                                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-400 text-xs font-bold">N/A</div>
                                                            )}
                                                        </div>

                                                        {/* Main Content */}
                                                        <div className="p-4 sm:p-5 pt-16 sm:pt-20 space-y-3 flex-grow">
                                                            {/* Title with gradient on hover */}
                                                            <h3 className="font-bold text-gray-800 dark:text-slate-100 text-base leading-tight line-clamp-2 sm:group-hover:text-transparent sm:group-hover:bg-clip-text sm:group-hover:bg-gradient-to-r sm:group-hover:from-blue-600 sm:group-hover:to-purple-600">
                                                                {item.acara}
                                                            </h3>
                                                            
                                                            {/* Info items with icons */}
                                                            <div className="space-y-2">
                                                                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-slate-400 bg-gray-50 dark:bg-slate-700/50 rounded-lg px-3 py-2">
                                                                    <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                                                    <span className="font-medium">{item.waktu || '--:--'}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-slate-400 bg-gray-50 dark:bg-slate-700/50 rounded-lg px-3 py-2">
                                                                    <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
                                                                    <span className="line-clamp-1 font-medium">{item.lokasi}</span>
                                                                </div>
                                                            </div>

                                                            {/* Status Progress Bar */}
                                                            <div className="space-y-1.5">
                                                                <div className="flex items-center justify-between text-xs">
                                                                    <span className="font-medium text-slate-600 dark:text-slate-400">Progress</span>
                                                                    <span className="font-semibold text-slate-700 dark:text-slate-300 tabular-nums">{getStatusProgress(item.status)}%</span>
                                                                </div>
                                                                <StatusProgressBar status={item.status} />
                                                            </div>

                                                            {/* Konsumsi count badge */}
                                                            <div className="flex items-center gap-2 text-xs">
                                                                <div className="bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30 text-orange-700 dark:text-orange-300 px-2.5 sm:px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5">
                                                                    <FileText className="w-3.5 h-3.5" />
                                                                    <span>{item.konsumsi.length} Item</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Action Buttons - Mobile-First */}
                                                        <div className="border-t dark:border-slate-700 p-3 sm:p-3.5 bg-gradient-to-br from-slate-50/80 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-900/50 backdrop-blur-sm">
                                                            <div className="flex items-center gap-2">
                                                                {/* View Button - Primary */}
                                                                <Button
                                                                    onClick={() => actions.viewOrderDetails(item)}
                                                                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 active:scale-95 transition-transform h-10 sm:h-9 text-sm"
                                                                    size="sm"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                    <span>Lihat</span>
                                                                </Button>

                                                                {/* Dropdown Menu for more actions */}
                                                                {item.status === 'Menunggu' && (
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button variant="outline" size="sm" className="px-2.5 h-10 sm:h-9 active:scale-95">
                                                                                <MoreVertical className="w-4 h-4" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end" className="w-44">
                                                                            <DropdownMenuItem 
                                                                                onClick={() => actions.openDeleteConfirm(item.id, item.acara)} 
                                                                                className="cursor-pointer h-10 text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                                                                            >
                                                                                <Trash2 className="w-4 h-4 mr-2" />
                                                                                Hapus
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                        })}
                                    </TabsContent>
                                </Tabs>
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

