import React, { useState } from 'react';
import { Pemesanan, StatusHistoryItem } from '@/lib/schema'; // (PATH DIPERBAIKI)

// --- UTILITY: Class Name Merger ---
import { cn } from '@/lib/utils';

// --- UI COMPONENTS ---
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip"; // Provider saja yang dipakai
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger,
    DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";

// --- Ikon BANTUAN ---
import {
    PlusCircle, Clock, CheckCircle2, XCircle, List, Grid, Calendar, Download, FileText, MapPin, Eye, Trash2, MoreVertical, Users, MessageSquare, Building2
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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const PemesananDetailModal = ({ pesanan, isOpen, onClose }: { pesanan: Pemesanan | null, isOpen: boolean, onClose: () => void }) => {
    if (!pesanan) return null;

    const statusConfig = {
        'Menunggu': { bg: 'bg-gradient-to-r from-yellow-400 to-orange-400', text: 'text-white', icon: <Clock className="w-4 h-4" /> },
        'Disetujui': { bg: 'bg-gradient-to-r from-purple-400 to-pink-400', text: 'text-white', icon: <CheckCircle2 className="w-4 h-4" /> },
        'Ditolak': { bg: 'bg-gradient-to-r from-red-400 to-rose-400', text: 'text-white', icon: <XCircle className="w-4 h-4" /> },
        'Selesai': { bg: 'bg-gradient-to-r from-green-400 to-emerald-400', text: 'text-white', icon: <CheckCircle2 className="w-4 h-4" /> },
        'Dibatalkan': { bg: 'bg-gradient-to-r from-gray-400 to-slate-400', text: 'text-white', icon: <XCircle className="w-4 h-4" /> },
    };

    const currentStatus = statusConfig[pesanan.status];
    const displayDate = pesanan.tanggalPengiriman ? new Date(pesanan.tanggalPengiriman).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-0 gap-0">
                {/* Header dengan gradient */}
                <div className={cn("relative overflow-hidden p-6 pb-8", currentStatus.bg)}>
                    <DialogHeader className="relative z-10">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <DialogTitle className="text-xl font-bold text-white mb-1 break-words leading-tight">
                                    {pesanan.acara}
                                </DialogTitle>
                                <DialogDescription className="text-white/90 text-sm">
                                    {displayDate} · {pesanan.waktu || '--:--'}
                                </DialogDescription>
                            </div>
                            <Badge className={cn("flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm border-white/30", currentStatus.text)}>
                                {currentStatus.icon}
                                <span className="font-semibold text-xs">{pesanan.status}</span>
                            </Badge>
                        </div>
                    </DialogHeader>
                    {/* Decorative circles */}
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                </div>

                {/* Content area */}
                <div className="p-5 space-y-4">
                    {/* Info Grid - Compact */}
                    <div className="grid grid-cols-2 gap-3">
                        <InfoCard icon={<MapPin className="w-4 h-4 text-blue-500" />} label="Lokasi" value={pesanan.lokasi} />
                        <InfoCard icon={<Users className="w-4 h-4 text-green-500" />} label="Tamu" value={pesanan.tamu} />
                        <InfoCard icon={<Building2 className="w-4 h-4 text-purple-500" />} label="Bagian" value={pesanan.untukBagian} />
                        <InfoCard icon={<FileText className="w-4 h-4 text-orange-500" />} label="Approval" value={pesanan.approval} />
                    </div>

                    <Separator className="dark:bg-slate-700" />

                    {/* Pengaju info */}
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-900/50">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {pesanan.yangMengajukan.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-500 dark:text-slate-400">Diajukan oleh</p>
                            <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{pesanan.yangMengajukan}</p>
                        </div>
                    </div>

                    {/* Catatan if exists */}
                    {pesanan.catatan && (
                        <div className="flex gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50">
                            <MessageSquare className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-0.5">Catatan</p>
                                <p className="text-sm text-amber-900 dark:text-amber-100 break-words leading-relaxed">{pesanan.catatan}</p>
                            </div>
                        </div>
                    )}

                    {/* Konsumsi - Colorful Cards */}
                    <div>
                        <h4 className="font-semibold text-sm mb-3 text-slate-700 dark:text-slate-200 flex items-center gap-2">
                            <span className="w-1 h-4 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
                            Detail Konsumsi ({pesanan.konsumsi.length})
                        </h4>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                            {pesanan.konsumsi.map((item, index) => {
                                const colors = [
                                    'from-rose-500 to-pink-500',
                                    'from-blue-500 to-cyan-500',
                                    'from-green-500 to-emerald-500',
                                    'from-purple-500 to-violet-500',
                                    'from-orange-500 to-amber-500',
                                ];
                                const colorClass = colors[index % colors.length];
                                
                                return (
                                    <div key={index} className="group flex items-center gap-3 p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-md hover:scale-[1.02] transition-all duration-200">
                                        <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white font-bold text-xs shadow-sm", colorClass)}>
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm text-slate-800 dark:text-slate-100 truncate">{item.jenis}</p>
                                        </div>
                                        <Badge variant="secondary" className="font-semibold text-xs tabular-nums shrink-0">
                                            {item.qty} {item.satuan}
                                        </Badge>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Timeline - Compact */}
                    {pesanan.statusHistory && pesanan.statusHistory.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-sm mb-3 text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                <span className="w-1 h-4 bg-gradient-to-b from-green-500 to-blue-500 rounded-full" />
                                Riwayat Status
                            </h4>
                            <div className="space-y-2">
                                {pesanan.statusHistory.map((item, index) => {
                                    const isLast = index === pesanan.statusHistory!.length - 1;
                                    return (
                                        <div key={index} className="flex gap-3 group">
                                            <div className="flex flex-col items-center">
                                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                    <div className="w-2 h-2 bg-white rounded-full" />
                                                </div>
                                                {!isLast && <div className="w-0.5 h-full bg-gradient-to-b from-slate-300 to-transparent dark:from-slate-600 mt-1" />}
                                            </div>
                                            <div className="flex-1 pb-3">
                                                <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{item.status}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                    {item.timestamp ? new Date(item.timestamp).toLocaleString('id-ID', { 
                                                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
                                                    }) : '-'} · {item.oleh}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <DialogFooter className="p-4 pt-2 border-t dark:border-slate-700">
                    <DialogClose asChild>
                        <Button type="button" className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md">
                            Tutup
                        </Button>
                    </DialogClose>
                </DialogFooter>

                {/* Custom scrollbar styles */}
                <style jsx>{`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 6px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: #cbd5e1;
                        border-radius: 3px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: #94a3b8;
                    }
                `}</style>
            </DialogContent>
        </Dialog>
    );
};

// Helper: Compact Info Card
const InfoCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | undefined | null }) => (
    <div className="flex gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:shadow-sm transition-shadow">
        <div className="flex-shrink-0 mt-0.5">{icon}</div>
        <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400 font-medium">{label}</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate" title={value || '-'}>{value || '-'}</p>
        </div>
    </div>
);

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
    <Card className="hover:shadow-lg active:shadow-xl transition-shadow p-2.5 xs:p-3 sm:p-4 h-full dark:bg-slate-800/80 dark:border-slate-600">
        <div className="flex items-center justify-between gap-1.5 xs:gap-2">
            <div className="flex flex-col min-w-0 flex-1">
                <p className="text-[9px] xs:text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-300 mb-0.5 xs:mb-1 truncate leading-tight">{title}</p>
                <p className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-none">{value}</p>
            </div>
            <div className={cn("p-1.5 xs:p-2 sm:p-2.5 rounded-md xs:rounded-lg flex-shrink-0", iconBgClass)}>
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
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 xs:gap-3 sm:gap-4 mb-4 xs:mb-5 sm:mb-8">
                        <StatCard 
                            icon={<Clock className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400" />} 
                            title="Menunggu" 
                            value={counts.Menunggu} 
                            iconBgClass="bg-yellow-100 dark:bg-yellow-500/20" 
                        />
                        <StatCard 
                            icon={<CheckCircle2 className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />} 
                            title="Selesai" 
                            value={counts.Selesai} 
                            iconBgClass="bg-green-100 dark:bg-green-500/20" 
                        />
                        <StatCard 
                            icon={<XCircle className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />} 
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

