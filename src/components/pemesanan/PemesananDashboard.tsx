import React, { useEffect, useMemo, useState } from 'react';
import {
    Calendar,
    CheckCircle2,
    ChevronDown,
    Clock,
    Download,
    Eye,
    FileText,
    Grid,
    List,
    MapPin,
    MoreVertical,
    PlusCircle,
    SlidersHorizontal,
    Trash2,
    XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Pemesanan } from '@/lib/schema';
import { cn } from '@/lib/utils';

const STATUS_FILTER_OPTIONS: Array<Pemesanan['status'] | 'Semua'> = ['Semua', 'Menunggu', 'Disetujui', 'Ditolak', 'Selesai', 'Dibatalkan'];

const STATUS_PROGRESS: Record<Pemesanan['status'], number> = {
    Menunggu: 25,
    Disetujui: 75,
    Ditolak: 0,
    Selesai: 100,
    Dibatalkan: 0,
};

const STATUS_CONFIG: Record<Pemesanan['status'], {
    list: string;
    grid: string;
    icon: React.ReactNode;
    bg: string;
    glow: string;
    border: string;
    particles: string[];
    emoji: string;
}> = {
    Menunggu: {
        list: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        grid: 'ring-1 ring-yellow-200 dark:ring-yellow-500/40',
        icon: <Clock className="w-3 h-3" />,
        bg: 'bg-gradient-to-br from-amber-500/30 via-orange-500/20 to-yellow-400/20',
        glow: 'shadow-[0_10px_40px_rgba(251,191,36,0.35)]',
        border: 'border-amber-200/60 dark:border-amber-500/40',
        particles: ['⏳', '✨', '🕒'],
        emoji: '⏳',
    },
    Disetujui: {
        list: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        grid: 'ring-1 ring-purple-200 dark:ring-purple-500/40',
        icon: <CheckCircle2 className="w-3 h-3" />,
        bg: 'bg-gradient-to-br from-purple-500/30 via-indigo-500/20 to-fuchsia-500/20',
        glow: 'shadow-[0_10px_40px_rgba(167,139,250,0.35)]',
        border: 'border-purple-200/60 dark:border-purple-500/40',
        particles: ['🎉', '✨', '💜'],
        emoji: '🎉',
    },
    Ditolak: {
        list: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        grid: 'ring-1 ring-red-200 dark:ring-red-500/40',
        icon: <XCircle className="w-3 h-3" />,
        bg: 'bg-gradient-to-br from-rose-500/30 via-red-500/20 to-pink-500/20',
        glow: 'shadow-[0_10px_40px_rgba(248,113,113,0.35)]',
        border: 'border-rose-200/60 dark:border-rose-500/40',
        particles: ['⚠️', '💥', '❌'],
        emoji: '⚠️',
    },
    Selesai: {
        list: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        grid: 'ring-1 ring-green-200 dark:ring-green-500/40',
        icon: <CheckCircle2 className="w-3 h-3" />,
        bg: 'bg-gradient-to-br from-emerald-500/30 via-green-500/20 to-teal-500/20',
        glow: 'shadow-[0_10px_40px_rgba(34,197,94,0.35)]',
        border: 'border-emerald-200/60 dark:border-emerald-500/40',
        particles: ['🌿', '🌟', '✅'],
        emoji: '✅',
    },
    Dibatalkan: {
        list: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
        grid: 'ring-1 ring-slate-200 dark:ring-slate-600/40',
        icon: <XCircle className="w-3 h-3" />,
        bg: 'bg-gradient-to-br from-slate-500/20 via-slate-600/20 to-slate-700/20',
        glow: 'shadow-[0_10px_40px_rgba(71,85,105,0.35)]',
        border: 'border-slate-200/60 dark:border-slate-600/40',
        particles: ['💤', '🌫️', '🌀'],
        emoji: '🌀',
    },
};

const STATUS_PROGRESS_COLOR: Record<Pemesanan['status'], string> = {
    Menunggu: 'from-amber-400 to-orange-500',
    Disetujui: 'from-purple-500 to-indigo-500',
    Ditolak: 'from-rose-500 to-red-500',
    Selesai: 'from-emerald-500 to-green-500',
    Dibatalkan: 'from-slate-500 to-slate-700',
};

const getStatusProgress = (status: Pemesanan['status']) => STATUS_PROGRESS[status] ?? 0;

const StatusProgressBar = ({ status }: { status: Pemesanan['status'] }) => (
    <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-700/60 overflow-hidden">
        <div
            className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-300', STATUS_PROGRESS_COLOR[status])}
            style={{ width: `${getStatusProgress(status)}%` }}
        />
    </div>
);

interface PemesananDetailModalProps {
    pesanan: Pemesanan | null;
    isOpen: boolean;
    onClose: () => void;
}

const PemesananDetailModal: React.FC<PemesananDetailModalProps> = ({ pesanan, isOpen, onClose }) => {
    if (!pesanan) return null;

    const currentStatus = STATUS_CONFIG[pesanan.status];
    const displayDate = pesanan.tanggalPengiriman ? new Date(pesanan.tanggalPengiriman).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="w-full max-w-lg gap-0 p-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:max-w-xl">
                <div className="space-y-4 p-6">
                    <DialogHeader className="p-0">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-white leading-tight">
                                        {pesanan.acara}
                                    </DialogTitle>
                                    <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
                                        {pesanan.yangMengajukan || 'Pengaju tidak tercatat'}
                                    </DialogDescription>
                                </div>
                                <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold", currentStatus.list)}>
                                    {currentStatus.icon}
                                    <span className="capitalize">{pesanan.status}</span>
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-600 dark:text-slate-300">
                                <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1 dark:border-slate-700">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {displayDate}
                                </span>
                                <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1 dark:border-slate-700">
                                    <Clock className="h-3.5 w-3.5" />
                                    {pesanan.waktu || '--:--'}
                                </span>
                                <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1 dark:border-slate-700">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {pesanan.lokasi || 'Lokasi belum diisi'}
                                </span>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/40">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Tamu</p>
                            <p className="text-base font-medium text-slate-900 dark:text-white">{pesanan.tamu || '-'}</p>
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/40">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Untuk Bagian</p>
                            <p className="text-base font-medium text-slate-900 dark:text-white">{pesanan.untukBagian || '-'}</p>
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/40">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Approval</p>
                            <p className="text-base font-medium text-slate-900 dark:text-white">{pesanan.approval || '-'}</p>
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/40">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Status</p>
                            <p className="text-base font-medium text-slate-900 dark:text-white">{pesanan.status}</p>
                        </div>
                    </div>

                    {pesanan.catatan && (
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Catatan</p>
                            <p className="mt-1 leading-relaxed">{pesanan.catatan}</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm font-semibold text-slate-800 dark:text-slate-100">
                            <span>Menu ({pesanan.konsumsi.length} item)</span>
                            <FileText className="h-4 w-4 text-slate-400" />
                        </div>
                        <ul className="space-y-2 max-h-40 overflow-y-auto pr-1 text-sm">
                            {pesanan.konsumsi.map((item, index) => (
                                <li
                                    key={`${item.jenis}-${index}`}
                                    className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-slate-700 dark:border-slate-700 dark:text-slate-200"
                                >
                                    <div>
                                        <p className="font-medium">{item.jenis}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{item.satuan}</p>
                                    </div>
                                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{item.qty}×</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {pesanan.statusHistory && pesanan.statusHistory.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Riwayat Status</h4>
                            <ul className="space-y-2 text-sm">
                                {pesanan.statusHistory.map((item, index) => (
                                    <li
                                        key={`${item.status}-${index}`}
                                        className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700"
                                    >
                                        <p className="font-medium text-slate-900 dark:text-white">{item.status}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {item.timestamp
                                                ? new Date(item.timestamp).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                                                : '-'}
                                            {item.oleh ? ` • ${item.oleh}` : ''}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
                <div className="border-t border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                    <DialogClose asChild>
                        <Button type="button" className="w-full">
                            Tutup
                        </Button>
                    </DialogClose>
                </div>
            </DialogContent>
        </Dialog>
    );
};

// --- KOMPONEN WIDGET & STATS ---

const StatCard = ({ icon, title, value, iconBgClass }: { icon: React.ReactNode, title: string, value: number, iconBgClass: string }) => (
    <Card className="hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 p-2.5 xs:p-3 sm:p-4 h-full dark:bg-slate-800/80 dark:border-slate-600 cursor-pointer group">
        <div className="flex items-center justify-between gap-1.5 xs:gap-2">
            <div className="flex flex-col min-w-0 flex-1">
                <p className="text-[9px] xs:text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-300 mb-0.5 xs:mb-1 truncate leading-tight group-hover:text-slate-700 dark:group-hover:text-slate-100 transition-colors">{title}</p>
                <p className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-none group-hover:scale-110 transition-transform duration-300 origin-left">{value}</p>
            </div>
            <div className={cn("p-1.5 xs:p-2 sm:p-2.5 rounded-md xs:rounded-lg flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300", iconBgClass)}>
                {icon}
            </div>
        </div>
    </Card>
);

const formatSearchDateLabel = (value?: string) => {
    if (!value) return "Semua tanggal";
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
        ? value
        : parsed.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

const VIEW_MODE_STORAGE_KEY = 'dashboard:viewMode';

// --- Tipe Props Dashboard ---
interface PemesananDashboardProps {
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
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const storedMode = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
        if (storedMode === 'list' || storedMode === 'grid') {
            setViewMode(storedMode);
        }
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
    }, [viewMode]);
    const handleCloseModal = () => actions.setIsDetailDialogOpen(false);
    const handleMobileFilterToggle = () => {
        setIsMobileFilterOpen((prev) => !prev);
        if (typeof window !== 'undefined') {
            const target = document.getElementById('dashboard-filters');
            target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const filterSummaryChips = useMemo(() => ([
        { label: 'Status', value: filterStatus === 'Semua' ? 'Semua status' : filterStatus },
        { label: 'Urutan', value: sortOrder },
        { label: 'Tanggal', value: formatSearchDateLabel(searchDate) },
    ]), [filterStatus, sortOrder, searchDate]);
    const statusConfig = STATUS_CONFIG;
    return (
        <TooltipProvider>
            {/* Bungkus dengan Fragment (<>) untuk mengatasi error single child */}
            <>
                <div className="pb-28 sm:pb-0 theme-transition">

                    {/* Header - Mobile-First Optimized */}
                    <div className="flex flex-col gap-3 mb-6 sm:mb-8">
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
                            <div id="dashboard-filters" className="flex flex-col gap-3 mb-4 pb-4 border-b dark:border-slate-700">
                                <div className="sm:hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/70 p-3 space-y-2">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Ringkasan Filter</p>
                                            <p className="text-xs text-slate-400 dark:text-slate-500">Tap untuk membuka pengaturan</p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleMobileFilterToggle}
                                            className="h-9 px-3 rounded-lg"
                                        >
                                            {isMobileFilterOpen ? 'Tutup' : 'Atur'}
                                            <ChevronDown className={cn("h-4 w-4 ml-1 transition-transform", isMobileFilterOpen && 'rotate-180')} />
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {filterSummaryChips.map((chip) => (
                                            <span
                                                key={chip.label}
                                                className="inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/60 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-200"
                                            >
                                                <span className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">{chip.label}</span>
                                                <span className="font-semibold text-slate-700 dark:text-white">{chip.value}</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className={cn(
                                    "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
                                    isMobileFilterOpen ? 'sm:flex' : 'hidden sm:flex'
                                )}>
                                    <div className="flex flex-col gap-2 w-full sm:flex-1">
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
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Status</p>
                                                <span className="text-[10px] text-slate-400 dark:text-slate-500">Geser untuk opsi lain</span>
                                            </div>
                                            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 sm:overflow-visible sm:flex-wrap sm:-mx-0 sm:px-0">
                                                {STATUS_FILTER_OPTIONS.map((statusOption) => {
                                                    const isActive = filterStatus === statusOption;
                                                    return (
                                                        <button
                                                            key={statusOption}
                                                            type="button"
                                                            onClick={() => actions.setFilterStatus(statusOption)}
                                                            aria-pressed={isActive}
                                                            className={cn(
                                                                "flex-shrink-0 rounded-2xl border px-4 py-2 text-sm font-semibold transition-colors",
                                                                "dark:border-slate-600",
                                                                isActive
                                                                    ? "bg-blue-600 text-white border-blue-600 shadow"
                                                                    : "bg-white text-slate-600 border-slate-200 dark:bg-slate-800/70 dark:text-slate-200"
                                                            )}
                                                        >
                                                            {statusOption}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <select
                                            value={sortOrder}
                                            onChange={(e) => actions.setSortOrder(e.target.value as 'Terbaru' | 'Terlama')}
                                            className="h-11 sm:h-10 w-full rounded-lg sm:rounded-md border border-input bg-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-2 text-base sm:text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        >
                                            <option value="Terbaru">Terbaru</option>
                                            <option value="Terlama">Terlama</option>
                                        </select>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="default"
                                        onClick={actions.exportCSV} 
                                        className="w-full sm:w-auto h-11 sm:h-10 dark:bg-slate-700 dark:border-slate-600 dark:hover:bg-slate-600 text-base sm:text-sm"
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        Export CSV
                                    </Button>
                                </div>
                            </div>

                            {/* Daftar atau Grid Pesanan */}
                                {filteredAndSortedRiwayat.length === 0 ? (
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
                                <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'list' | 'grid')} className="w-full">
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
                                    
                                    <TabsContent value="list" className="space-y-2.5 mt-0">
                                        {filteredAndSortedRiwayat.map((item) => {
                                            const config = statusConfig[item.status] || statusConfig['Dibatalkan'];
                                            const displayDate = item.tanggalPengiriman ? new Date(item.tanggalPengiriman) : null;
                                            const readableDate = displayDate
                                                ? displayDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                                                : 'Tanggal belum ditentukan';
                                            const monthLabel = displayDate ? displayDate.toLocaleDateString('id-ID', { month: 'short' }) : null;
                                            const dayNumber = displayDate?.getDate();
                                            const progressValue = getStatusProgress(item.status);

                                            return (
                                                <div
                                                    key={item.id}
                                                    className={cn(
                                                        "group flex flex-col rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg",
                                                        config.grid
                                                    )}
                                                >
                                                    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4">
                                                        <div className="flex items-center gap-3">
                                                            {displayDate ? (
                                                                <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-slate-50 text-slate-700 border border-slate-200 dark:bg-slate-900/40 dark:text-slate-200 dark:border-slate-700">
                                                                    <span className="text-[10px] font-semibold uppercase tracking-wide">{monthLabel ?? '--'}</span>
                                                                    <span className="text-base font-bold text-slate-900 dark:text-white">{dayNumber ?? '--'}</span>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center justify-center w-12 h-12 rounded-xl border border-dashed border-slate-200 text-xs font-semibold text-slate-400 dark:border-slate-700 dark:text-slate-500">
                                                                    N/A
                                                                </div>
                                                            )}
                                                            <div className="space-y-0.5">
                                                                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">Acara</p>
                                                                <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white leading-tight line-clamp-2">
                                                                    {item.acara}
                                                                </h3>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold", config.list)}>
                                                                {config.icon}
                                                                <span className="capitalize">{item.status}</span>
                                                            </span>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="outline" size="sm" className="h-8 px-2">
                                                                        <MoreVertical className="w-4 h-4" />
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

                                                    <div className="grid gap-2 px-3.5 sm:px-4 pb-3 text-[13px] sm:text-sm text-slate-700 dark:text-slate-300">
                                                        <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-900/30">
                                                            <Calendar className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                                            <span className="font-medium">{readableDate}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-900/30">
                                                            <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                                            <span className="font-medium">{item.waktu || '--:--'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-900/30">
                                                            <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
                                                            <span className="line-clamp-1 font-medium">{item.lokasi || 'Lokasi belum diisi'}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2.5 px-3.5 sm:px-4 pb-3">
                                                        <StatusProgressBar status={item.status} />
                                                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap tabular-nums">{progressValue}%</span>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-3.5 py-3 sm:px-4 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/40">
                                                        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-200">
                                                            <FileText className="w-3.5 h-3.5" />
                                                            <span>{item.konsumsi.length} Item</span>
                                                        </div>
                                                        <div className="ml-auto flex items-center gap-2">
                                                            <Button
                                                                variant="secondary"
                                                                size="sm"
                                                                className="h-8 px-3 bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
                                                                onClick={() => actions.viewOrderDetails(item)}
                                                            >
                                                                Detail
                                                            </Button>
                                                            {item.status === 'Menunggu' && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-8 px-3"
                                                                    onClick={() => actions.openDeleteConfirm(item.id, item.acara)}
                                                                >
                                                                    Batalkan
                                                                </Button>
                                                            )}
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
                                            const monthLabel = displayDate ? displayDate.toLocaleDateString('id-ID', { month: 'short' }) : null;
                                            const dayNumber = displayDate?.getDate();
                                            const progressValue = getStatusProgress(item.status);

                                            return (
                                                <div
                                                    key={item.id}
                                                    className={cn(
                                                        "group flex h-full flex-col rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm ring-offset-2 ring-offset-white dark:ring-offset-slate-900 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl",
                                                        config.grid
                                                    )}
                                                >
                                                    <div className="flex items-start justify-between gap-3 p-4 sm:p-5">
                                                        <div className="flex items-center gap-3">
                                                            {displayDate ? (
                                                                <div className="flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900/30 dark:text-slate-200">
                                                                    <span className="text-[10px] font-semibold uppercase tracking-wide">{monthLabel ?? '--'}</span>
                                                                    <span className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{dayNumber ?? '--'}</span>
                                                                </div>
                                                            ) : (
                                                                <div className="flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border border-dashed border-slate-200 text-slate-400 dark:border-slate-700 dark:text-slate-500 text-xs font-semibold">
                                                                    N/A
                                                                </div>
                                                            )}
                                                            <div className="space-y-1">
                                                                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Acara</p>
                                                                <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white leading-tight line-clamp-2">
                                                                    {item.acara}
                                                                </h3>
                                                            </div>
                                                        </div>
                                                        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shadow-sm", config.list)}>
                                                            {config.icon}
                                                            <span className="capitalize">{item.status}</span>
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-col gap-3 px-4 sm:px-5 pb-4 flex-1">
                                                        <div className="grid gap-2 text-sm text-slate-700 dark:text-slate-300">
                                                            <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900/30">
                                                                <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                                                <span className="font-medium">{item.waktu || '--:--'}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900/30">
                                                                <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
                                                                <span className="line-clamp-1 font-medium">{item.lokasi || 'Lokasi belum diisi'}</span>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                                                                <span>Progress</span>
                                                                <span className="text-slate-700 dark:text-slate-200 tabular-nums">{progressValue}%</span>
                                                            </div>
                                                            <StatusProgressBar status={item.status} />
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-4 py-3 sm:px-5 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/40">
                                                        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-200">
                                                            <FileText className="w-3.5 h-3.5" />
                                                            <span>{item.konsumsi.length} Item</span>
                                                        </div>
                                                        <div className="ml-auto flex items-center gap-2">
                                                            <Button
                                                                onClick={() => actions.viewOrderDetails(item)}
                                                                className="flex-1 sm:flex-none bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 h-9 text-sm px-4"
                                                                size="sm"
                                                            >
                                                                <Eye className="w-4 h-4 mr-1.5" />
                                                                Lihat
                                                            </Button>
                                                            {item.status === 'Menunggu' && (
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="outline" size="sm" className="px-2.5 h-9">
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

                {/* Sticky mobile action rail */}
                <div className="sm:hidden fixed bottom-4 left-0 right-0 z-40 px-4">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur p-3 shadow-2xl flex items-center gap-2">
                        <Button
                            className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                            onClick={onNewOrderClick}
                        >
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Pesanan Baru
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-12 w-12 rounded-xl"
                            onClick={handleMobileFilterToggle}
                            aria-label="Buka filter"
                        >
                            <SlidersHorizontal className="w-5 h-5" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-12 w-12 rounded-xl"
                            onClick={actions.exportCSV}
                            aria-label="Export CSV"
                        >
                            <Download className="w-5 h-5" />
                        </Button>
                    </div>
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

