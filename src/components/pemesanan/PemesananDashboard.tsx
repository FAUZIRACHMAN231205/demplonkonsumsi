import React, { useState } from 'react';
import { Pemesanan } from '@/lib/schema';

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

// --- Komponen Modal Detail ---
import { Dialog, DialogContent, DialogTitle, DialogClose } from '@/components/ui/dialog';

const PemesananDetailModal = ({ pesanan, isOpen, onClose }: { pesanan: Pemesanan | null, isOpen: boolean, onClose: () => void }) => {
    if (!pesanan) return null;

    const statusConfig = {
        'Menunggu': { 
            bg: 'bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500',
            glow: 'shadow-[0_0_40px_rgba(251,191,36,0.4)]',
            text: 'text-white', 
            icon: <Clock className="w-4 h-4" />,
            emoji: '⏰',
            particles: '🌟💫✨',
            border: 'border-amber-400/30'
        },
        'Disetujui': { 
            bg: 'bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500',
            glow: 'shadow-[0_0_40px_rgba(168,85,247,0.4)]',
            text: 'text-white', 
            icon: <CheckCircle2 className="w-4 h-4" />,
            emoji: '🎊',
            particles: '🎉🎊🥳',
            border: 'border-purple-400/30'
        },
        'Ditolak': { 
            bg: 'bg-gradient-to-br from-red-500 via-rose-500 to-pink-600',
            glow: 'shadow-[0_0_40px_rgba(239,68,68,0.4)]',
            text: 'text-white', 
            icon: <XCircle className="w-4 h-4" />,
            emoji: '😔',
            particles: '💔😢🚫',
            border: 'border-red-400/30'
        },
        'Selesai': { 
            bg: 'bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600',
            glow: 'shadow-[0_0_40px_rgba(16,185,129,0.4)]',
            text: 'text-white', 
            icon: <CheckCircle2 className="w-4 h-4" />,
            emoji: '🎉',
            particles: '🎉🏆✨',
            border: 'border-emerald-400/30'
        },
        'Dibatalkan': { 
            bg: 'bg-gradient-to-br from-slate-500 via-gray-600 to-zinc-700',
            glow: 'shadow-[0_0_40px_rgba(100,116,139,0.4)]',
            text: 'text-white', 
            icon: <XCircle className="w-4 h-4" />,
            emoji: '⛔',
            particles: '🚫⚠️❌',
            border: 'border-slate-400/30'
        },
    };

    const currentStatus = statusConfig[pesanan.status];
    const displayDate = pesanan.tanggalPengiriman ? new Date(pesanan.tanggalPengiriman).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[420px] max-h-[90vh] overflow-hidden p-0 gap-0 border-0 bg-transparent backdrop-blur-3xl animate-in zoom-in-95 slide-in-from-bottom-5 duration-300">
                {/* Glassmorphism Container */}
                <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl shadow-2xl">
                    
                    {/* Animated Background Blobs */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className={cn("absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl opacity-30 animate-pulse", currentStatus.bg)} />
                        <div className={cn("absolute -bottom-20 -left-20 w-60 h-60 rounded-full blur-3xl opacity-20 animate-pulse delay-1000", currentStatus.bg)} />
                    </div>

                    {/* Hero Header dengan 3D Effect */}
                    <div className={cn("relative overflow-hidden p-6 pb-20", currentStatus.bg, currentStatus.glow)}>
                        {/* Animated Particles Background */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-2 left-4 text-2xl animate-bounce delay-100">{currentStatus.particles[0]}</div>
                            <div className="absolute top-8 right-8 text-xl animate-bounce delay-300">{currentStatus.particles[1]}</div>
                            <div className="absolute top-16 left-1/2 text-lg animate-bounce delay-500">{currentStatus.particles[2]}</div>
                            <div className="absolute bottom-4 right-4 text-2xl animate-bounce delay-700">{currentStatus.particles[0]}</div>
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-start gap-3">
                                {/* 3D Emoji Badge */}
                                <div className="relative group">
                                    <div className={cn("absolute inset-0 rounded-3xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-300", currentStatus.bg)} />
                                    <div className="relative w-16 h-16 rounded-3xl bg-white/30 backdrop-blur-xl flex items-center justify-center text-4xl shadow-2xl ring-4 ring-white/40 transform hover:scale-110 hover:rotate-12 transition-all duration-300 cursor-pointer">
                                        <span className="animate-bounce">{currentStatus.emoji}</span>
                                    </div>
                                </div>
                                
                                <div className="flex-1 min-w-0 pt-2">
                                    <DialogTitle className="text-base font-black text-white mb-2 break-words leading-tight drop-shadow-2xl tracking-tight">
                                        {pesanan.acara}
                                    </DialogTitle>
                                    <div className="flex flex-wrap items-center gap-2 text-white/95 text-xs font-medium">
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>{displayDate}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>{pesanan.waktu || '--:--'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Floating Status Badge dengan Glassmorphism */}
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 z-20">
                            <div className={cn("px-5 py-2.5 rounded-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-2xl ring-1", currentStatus.border, currentStatus.glow)}>
                                <div className="flex items-center gap-2">
                                    <div className={cn("p-1.5 rounded-lg", currentStatus.bg)}>
                                        {currentStatus.icon}
                                    </div>
                                    <span className="font-black text-sm bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-100 dark:to-white bg-clip-text text-transparent">
                                        {pesanan.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                {/* Content - Scrollable dengan Glassmorphism */}
                <div className="overflow-y-auto max-h-[calc(90vh-240px)] custom-scrollbar pt-12 pb-4">
                    <div className="px-4 space-y-3">
                    
                    {/* Quick Info Grid dengan Neomorphism */}
                    <div className="grid grid-cols-2 gap-2.5">
                        <GlassCard icon="📍" color="blue" label="Lokasi" value={pesanan.lokasi} />
                        <GlassCard icon="👥" color="green" label="Tamu" value={pesanan.tamu} />
                        <GlassCard icon="🏢" color="purple" label="Bagian" value={pesanan.untukBagian} />
                        <GlassCard icon="✍️" color="orange" label="Approval" value={pesanan.approval} />
                    </div>

                    {/* Pengaju - Holographic Card */}
                    <div className="group relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-blue-500/90 via-indigo-600/90 to-purple-600/90 backdrop-blur-xl shadow-xl border border-white/20 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                        {/* Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                        
                        {/* Floating Emoji */}
                        <div className="absolute top-2 right-2 text-5xl opacity-10 group-hover:opacity-20 group-hover:scale-125 transition-all duration-500">👤</div>
                        
                        <div className="relative flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-white/30 rounded-2xl blur-lg" />
                                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-white/40 to-white/10 backdrop-blur-sm flex items-center justify-center text-white font-black text-lg shadow-lg ring-2 ring-white/30 group-hover:ring-4 group-hover:scale-110 transition-all duration-300">
                                    {pesanan.yangMengajukan.charAt(0).toUpperCase()}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider mb-0.5">Pengaju</p>
                                <p className="text-white font-bold text-sm truncate drop-shadow-lg">{pesanan.yangMengajukan}</p>
                            </div>
                        </div>
                    </div>

                    {/* Catatan - Neon Glow Card */}
                    {pesanan.catatan && (
                        <div className="group relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-amber-400/90 via-orange-500/90 to-rose-500/90 backdrop-blur-xl shadow-xl border border-white/20 hover:shadow-[0_0_30px_rgba(251,191,36,0.5)] transition-all duration-300">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                            
                            <div className="absolute top-2 right-2 text-5xl opacity-10">💭</div>
                            
                            <div className="relative flex gap-2.5">
                                <div className="flex-shrink-0 text-2xl transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">📝</div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white/90 text-[10px] font-black uppercase tracking-wider mb-1">Catatan Penting</p>
                                    <p className="text-white text-xs leading-relaxed drop-shadow">{pesanan.catatan}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Konsumsi - Card Grid dengan Micro Animations */}
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="relative group/title">
                                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl blur-md opacity-50 group-hover/title:opacity-75 transition-opacity" />
                                <div className="relative px-3 py-1.5 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg">
                                    <span className="text-white text-xl">🍱</span>
                                </div>
                            </div>
                            <h4 className="font-black text-sm bg-gradient-to-r from-slate-700 to-slate-900 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                                Menu ({pesanan.konsumsi.length} item)
                            </h4>
                        </div>
                        
                        <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1 custom-scrollbar">
                            {pesanan.konsumsi.map((item, index) => {
                                const foodEmojis = ['🍕', '☕', '🍰', '🥤', '🍜', '🍱', '🥗', '🍔', '🌮', '🍣'];
                                const gradients = [
                                    'from-rose-500 to-pink-600',
                                    'from-blue-500 to-cyan-600',
                                    'from-green-500 to-emerald-600',
                                    'from-purple-500 to-violet-600',
                                    'from-orange-500 to-amber-600',
                                    'from-teal-500 to-cyan-600',
                                    'from-indigo-500 to-blue-600',
                                    'from-fuchsia-500 to-pink-600',
                                ];
                                const gradient = gradients[index % gradients.length];
                                const emoji = foodEmojis[index % foodEmojis.length];
                                
                                return (
                                    <div key={index} className="group relative overflow-hidden rounded-xl p-2.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border-2 border-slate-200/50 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-xl hover:scale-[1.03] transition-all duration-300">
                                        {/* Gradient Overlay on Hover */}
                                        <div className={cn("absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-300", gradient)} />
                                        
                                        <div className="relative flex items-center gap-2.5">
                                            <div className={cn("relative w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg text-base group-hover:scale-110 group-hover:rotate-12 transition-all duration-300", gradient)}>
                                                <span className="relative z-10">{emoji}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">{item.jenis}</p>
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{item.satuan}</p>
                                            </div>
                                            <div className={cn("relative px-2.5 py-1 rounded-lg bg-gradient-to-r text-white font-black text-xs shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300", gradient)}>
                                                <div className="absolute inset-0 bg-white/20 rounded-lg animate-pulse" />
                                                <span className="relative">{item.qty}×</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Timeline - Futuristic Design */}
                    {pesanan.statusHistory && pesanan.statusHistory.length > 0 && (
                        <div className="relative">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="relative group/title">
                                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl blur-md opacity-50 group-hover/title:opacity-75 transition-opacity" />
                                    <div className="relative px-3 py-1.5 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 shadow-lg">
                                        <span className="text-white text-xl">⏱️</span>
                                    </div>
                                </div>
                                <h4 className="font-black text-sm bg-gradient-to-r from-slate-700 to-slate-900 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                                    Riwayat Status
                                </h4>
                            </div>
                            
                            <div className="relative pl-6 space-y-2">
                                {/* Vertical Line with Gradient */}
                                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 opacity-30" />
                                
                                {pesanan.statusHistory.map((item, index) => {
                                    const statusEmojis: Record<string, string> = {
                                        'Pesanan Dibuat': '📝',
                                        'Pesanan Disetujui': '✅',
                                        'Pesanan Ditolak': '❌',
                                        'Pesanan Selesai': '🎉',
                                        'Pesanan Dibatalkan': '🚫',
                                    };
                                    const emoji = statusEmojis[item.status] || '📌';
                                    
                                    return (
                                        <div key={index} className="relative group/item">
                                            {/* Timeline Node */}
                                            <div className="absolute -left-6 top-0">
                                                <div className="relative">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-md opacity-50 group-hover/item:opacity-100 transition-opacity" />
                                                    <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl text-sm transform group-hover/item:scale-125 group-hover/item:rotate-12 transition-all duration-300">
                                                        {emoji}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Content Card */}
                                            <div className="relative overflow-hidden rounded-xl p-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/5 to-pink-500/0 group-hover/item:via-purple-500/10 transition-colors duration-300" />
                                                
                                                <div className="relative">
                                                    <p className="font-black text-xs text-slate-800 dark:text-slate-100 mb-1">{item.status}</p>
                                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight">
                                                        {item.timestamp ? new Date(item.timestamp).toLocaleString('id-ID', { 
                                                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
                                                        }) : '-'} • <span className="font-bold">{item.oleh}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    </div>
                </div>

                {/* Footer - Holographic Button */}
                <div className="relative p-4 border-t border-white/10 bg-gradient-to-r from-slate-50/50 to-white/50 dark:from-slate-900/50 dark:to-slate-800/50 backdrop-blur-xl">
                    <DialogClose asChild>
                        <Button type="button" className="group relative w-full h-12 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-black text-sm shadow-2xl hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] transition-all duration-300 hover:scale-[1.02] border-2 border-white/20">
                            {/* Shine Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                            
                            <span className="relative flex items-center justify-center gap-2">
                                <span className="text-xl animate-pulse">✨</span>
                                <span className="drop-shadow-lg">Tutup</span>
                                <span className="text-xl animate-pulse delay-150">✨</span>
                            </span>
                        </Button>
                    </DialogClose>
                </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

// GlassCard Component - Glassmorphism
const GlassCard = ({ icon, color, label, value }: { icon: string, color: string, label: string, value: string | undefined | null }) => {
    const colorMap = {
        blue: 'from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30',
        green: 'from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30',
        purple: 'from-purple-500/20 to-fuchsia-500/20 hover:from-purple-500/30 hover:to-fuchsia-500/30',
        orange: 'from-orange-500/20 to-rose-500/20 hover:from-orange-500/30 hover:to-rose-500/30',
    };
    
    return (
        <div className={cn("group relative overflow-hidden rounded-2xl p-3 bg-gradient-to-br backdrop-blur-xl border border-white/20 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300", colorMap[color as keyof typeof colorMap])}>
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            
            {/* Background Emoji */}
            <div className="absolute top-1 right-1 text-4xl opacity-5 group-hover:opacity-10 group-hover:scale-125 transition-all duration-500">{icon}</div>
            
            <div className="relative flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm flex items-center justify-center shadow-lg text-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[9px] uppercase tracking-wider text-slate-600 dark:text-slate-300 font-black leading-tight">{label}</p>
                    <p className="text-xs font-black text-slate-800 dark:text-slate-100 truncate leading-tight mt-0.5 drop-shadow" title={value || '-'}>{value || '-'}</p>
                </div>
            </div>
        </div>
    );
};

// MiniCard removed (unused) — kept out to avoid lint warning; re-add if needed later.

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

