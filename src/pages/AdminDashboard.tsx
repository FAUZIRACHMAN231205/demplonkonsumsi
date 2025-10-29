// PERBAIKAN: Menghapus 'useMemo', 'forwardRef', 'useEffect' karena tidak dipakai
import React, { useState } from "react"; 
import { motion, AnimatePresence } from "framer-motion";
// DIUBAH: Impor hook dari context, bukan dari direktori hooks
import { useSharedPemesanan } from '@/context/PemesananContext';
import { Pemesanan } from '../lib/schema'; // Sesuaikan path jika perlu
// Impor UI components & icons jika perlu
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Gunakan Tooltip shadcn
import { cn } from "@/lib/utils";
import {
    Clock, CheckCircle2, XCircle, Download, FileText, Calendar, MapPin, List, Grid
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';


// --- Komponen StatCard (bisa diambil dari Dashboard atau didefinisikan ulang) ---
const StatCard = ({ icon, title, value, iconBgClass }: { icon: React.ReactNode, title: string, value: number, iconBgClass: string }) => (
    <Card className="transition-all duration-300 hover:shadow-lg p-4 h-full dark:bg-slate-800">
        <div className="flex items-center justify-between">
            <div className="flex flex-col">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
            </div>
            <div className={cn("p-2 rounded-lg", iconBgClass)}>
                 {icon}
            </div>
        </div>
    </Card>
);

// --- Komponen Skeleton ---
const Skeleton = ({ className }: { className?: string }) => <div className={cn("animate-pulse rounded-md bg-slate-200", className)} />;


// --- Komponen Utama Admin Dashboard ---
const AdminDashboard = () => {

    // DIUBAH: Gunakan hook dari context
    // Pastikan Anda memanggil hook ini, bukan usePemesanan() langsung
    const {
        filteredAndSortedRiwayat, // Data yang sudah difilter/sort
        counts,
        actions,
        isLoading,
        searchDate,
        filterStatus,
        sortOrder,
    } = useSharedPemesanan(); // Gunakan shared hook

    // Log data yang diterima dari context saat komponen render
    console.log("[AdminDashboard] Rendering...");
    console.log("[AdminDashboard] isLoading:", isLoading);
    console.log("[AdminDashboard] filterStatus:", filterStatus);
    console.log("[AdminDashboard] Data received (filteredAndSortedRiwayat):", filteredAndSortedRiwayat);


    // State lokal untuk view mode OK
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    // Gunakan actions dari hook untuk filter/sort
    // Kita tidak perlu mendefinisikan ulang fungsi ini karena sudah ada di 'actions'
    const { setFilterStatus, setSortOrder, setSearchDate, exportCSV, updateStatus } = actions;


    const statusConfig: Record<Pemesanan['status'], { list: string, grid: string, icon: React.ReactNode }> = {
        'Menunggu': { list: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/30 dark:text-yellow-200', grid: 'border-yellow-500', icon: <Clock className="w-3 h-3" /> },
        'Disetujui': { list: 'bg-purple-100 text-purple-800 dark:bg-purple-500/30 dark:text-purple-200', grid: 'border-purple-500', icon: <CheckCircle2 className="w-3 h-3" /> },
        'Ditolak': { list: 'bg-red-100 text-red-800 dark:bg-red-500/30 dark:text-red-200', grid: 'border-red-500', icon: <XCircle className="w-3 h-3" /> },
        'Selesai': { list: 'bg-green-100 text-green-800 dark:bg-green-500/30 dark:text-green-200', grid: 'border-green-500', icon: <CheckCircle2 className="w-3 h-3" /> },
        'Dibatalkan': { list: 'bg-gray-100 text-gray-800 dark:bg-gray-500/30 dark:text-gray-200', grid: 'border-gray-500', icon: <XCircle className="w-3 h-3" /> },
    };


 return (
     <TooltipProvider>
        <div className="bg-slate-50 dark:bg-slate-900 min-h-screen font-['Poppins',_sans-serif] transition-colors">
            <style>{` @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;800&display=swap'); body { font-family: 'Poppins', sans-serif; } `}</style>
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Dasbor Admin</h2>
                            <p className="text-gray-500 dark:text-gray-400">Kelola dan setujui pesanan yang masuk.</p>
                        </div>
                        <div>
                            <ThemeToggle />
                        </div>
                    </div>

                    {/* Gunakan counts dari hook */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        <StatCard
                            title="Menunggu Persetujuan"
                            value={counts.Menunggu}
                            icon={<Clock className="h-5 w-5 text-yellow-600"/>}
                            iconBgClass="bg-yellow-100"
                        />
                        <StatCard
                            title="Total Disetujui"
                            value={counts.Disetujui}
                            icon={<CheckCircle2 className="h-5 w-5 text-purple-600"/>}
                            iconBgClass="bg-purple-100"
                        />
                        <StatCard
                            title="Total Ditolak"
                            value={counts.Ditolak}
                            icon={<XCircle className="h-5 w-5 text-red-600"/>}
                            iconBgClass="bg-red-100"
                        />
                         {/* Mungkin tambahkan Selesai & Dibatalkan juga */}
                    </div>

                    <Card className="rounded-lg border bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-slate-100 shadow-sm overflow-hidden">
                        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center p-6 bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-700">
                            <CardTitle className="text-xl font-semibold dark:text-gray-100">Daftar Pesanan Masuk</CardTitle>
                             <div className="flex items-center gap-1 rounded-lg bg-slate-200 dark:bg-slate-700 p-1 self-start sm:self-center">
                                 <Tooltip>
                                     <TooltipTrigger asChild>
                                         <Button variant="ghost" size="sm" onClick={() => setViewMode('list')} className={cn("p-1.5 h-7 w-7", viewMode === 'list' && 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-blue-400')}>
                                             <List className="w-4 h-4" />
                                          </Button>
                                     </TooltipTrigger>
                                     <TooltipContent>Tampilan Daftar</TooltipContent>
                                 </Tooltip>
                                 <Tooltip>
                                     <TooltipTrigger asChild>
                                         <Button variant="ghost" size="sm" onClick={() => setViewMode('grid')} className={cn("p-1.5 h-7 w-7", viewMode === 'grid' && 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-blue-400')}>
                                             <Grid className="w-4 h-4" />
                                         </Button>
                                     </TooltipTrigger>
                                     <TooltipContent>Tampilan Grid</TooltipContent>
                                </Tooltip>
                             </div>
                        </CardHeader>
                        <CardContent className="p-4 md:p-6 dark:bg-slate-800">
                             {/* Filter controls, gunakan state dan actions dari hook */}
                            <div className="flex flex-col xl:flex-row justify-between items-center gap-4 mb-4 pb-4 border-b dark:border-slate-700">
                                <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full">
                                    <div className="relative flex-grow min-w-[150px]">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" /></div>
                                        <input
                                            type="date"
                                            value={searchDate}
                                            onChange={(e) => setSearchDate(e.target.value)}
                                            className="h-9 w-full rounded-md border border-input bg-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white pl-9 pr-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                    </div>
                                    <select
                                        value={filterStatus}
                                        // PERBAIKAN: Menambahkan tipe data untuk 'e'
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value as Pemesanan['status'] | 'Semua')}
                                        className="h-9 w-full sm:w-auto flex-grow min-w-[150px] rounded-md border border-input bg-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                     >
                                         <option value="Semua" className="dark:bg-slate-800">Semua Status</option>
                                         <option value="Menunggu" className="dark:bg-slate-800">Menunggu</option>
                                         <option value="Disetujui" className="dark:bg-slate-800">Disetujui</option>
                                         <option value="Ditolak" className="dark:bg-slate-800">Ditolak</option>
                                         <option value="Selesai" className="dark:bg-slate-800">Selesai</option>
                                         <option value="Dibatalkan" className="dark:bg-slate-800">Dibatalkan</option>
                                    </select>
                                    <select
                                        value={sortOrder}
                                        // PERBAIKAN: Menambahkan tipe data untuk 'e'
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortOrder(e.target.value as 'Terbaru' | 'Terlama')}
                                        className="h-9 w-full sm:w-auto flex-grow min-w-[150px] rounded-md border border-input bg-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                     >
                                         <option value="Terbaru" className="dark:bg-slate-800">Terbaru Dibuat</option>
                                         <option value="Terlama" className="dark:bg-slate-800">Pengiriman Terlama</option>
                                     </select>
                                </div>
                                <Button variant="outline" size="sm" onClick={exportCSV} className="w-full xl:w-auto flex-shrink-0 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-600">
                                    <Download className="mr-2 h-4 w-4" /> Export CSV
                                </Button>
                             </div>

                             {/* Daftar Pesanan, gunakan filteredAndSortedRiwayat */}
                            {isLoading ? (
                                 // Tampilkan skeleton loading jika isLoading true
                                 (console.log("[AdminDashboard] Showing loading skeleton."),
                                 <div className={cn(viewMode === 'list' ? "space-y-3" : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4")}>
                                      {Array.from({ length: 3 }).map((_, i) => viewMode === 'list' ? <Skeleton key={i} className="h-[70px] w-full" /> : <Skeleton key={i} className="h-[160px] w-full" />)}
                                 </div>)
                            ) : filteredAndSortedRiwayat.length === 0 ? (
                                 // Tampilkan pesan kosong jika tidak ada data setelah loading selesai
                                 (console.log("[AdminDashboard] No data to display."),
                                 <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                                      <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                      <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Tidak Ada Pesanan</h4>
                                      <p className="text-sm mt-1">Tidak ada pesanan yang sesuai dengan filter.</p>
                                 </div>)
                             ) : (
                                 <div className={cn(viewMode === 'list' ? "space-y-3" : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4")}>
                                     <AnimatePresence>
                                      {filteredAndSortedRiwayat.map((item: Pemesanan) => {
                                          const config = statusConfig[item.status] || statusConfig['Dibatalkan'];
                                          const displayDate = item.tanggalPengiriman ? new Date(item.tanggalPengiriman) : null;
                                          const createdAtDate = item.createdAt ? new Date(item.createdAt) : null;

                                          if (viewMode === 'list') {
                                               return (
                                                   <motion.div
                                                       key={item.id} layout
                                                       initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                       className="bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-lg shadow-sm border dark:border-slate-600 flex flex-col sm:flex-row items-center p-3 gap-3 w-full transition-colors"
                                                    >
                                                       <div className="flex-grow space-y-1 text-sm">
                                                           <div className="flex justify-between items-start">
                                                               <p className="font-bold text-gray-800 dark:text-slate-100">{item.acara} </p>
                                                               <span className="text-xs text-gray-400 dark:text-slate-400 whitespace-nowrap ml-2">
                                                                   {createdAtDate ? createdAtDate.toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'2-digit'}) : '--'}
                                                               </span>
                                                           </div>
                                                            <p className="text-xs text-gray-500 dark:text-slate-400">{item.yangMengajukan}</p>
                                                            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400 pt-1">
                                                                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{displayDate ? displayDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short'}) : '--'}</span>
                                                                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{item.waktu || '--:--'}</span>
                                                                <span className="flex items-center gap-1 truncate"><MapPin className="w-3.5 h-3.5 flex-shrink-0" />{item.lokasi}</span>
                                                            </div>
                                                       </div>
                                                       <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-end border-t dark:border-slate-600 sm:border-t-0 pt-2 sm:pt-0 mt-2 sm:mt-0">
                                                            {item.status === 'Menunggu' ? (
                                                               <>
                                                                   <Button onClick={() => updateStatus(item.id, 'Ditolak', 'Admin')} size="sm" variant="outline" className="text-red-600 dark:text-red-400 border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 h-8 px-2 text-xs">Tolak</Button>
                                                                   <Button onClick={() => updateStatus(item.id, 'Disetujui', 'Admin')} size="sm" className="h-8 px-2 text-xs bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800">Setujui</Button>
                                                               </>
                                                           ) : (
                                                               <span className={cn("flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full", config.list)}>
                                                                   {config.icon} {item.status}
                                                                </span>
                                                           )}
                                                       </div>
                                                   </motion.div>
                                               );
                                           }
                                           // Tampilan Grid - Redesigned with vibrant and interactive style
                                           return (
                                               <motion.div
                                                   key={item.id} layout
                                                   initial={{ opacity: 0, scale: 0.9, rotateY: -10 }} 
                                                   animate={{ opacity: 1, scale: 1, rotateY: 0 }} 
                                                   exit={{ opacity: 0, scale: 0.9, rotateY: 10 }}
                                                   whileHover={{ scale: 1.03, y: -6 }}
                                                   transition={{ duration: 0.3, ease: "easeOut" }}
                                                   className={cn(
                                                       "group relative rounded-xl flex flex-col bg-white dark:bg-slate-800 border-2 shadow-lg hover:shadow-2xl transition-all overflow-hidden cursor-pointer",
                                                       config.grid
                                                   )}
                                                >
                                                   {/* Animated gradient background on hover */}
                                                   <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 dark:from-blue-900/10 dark:via-purple-900/10 dark:to-pink-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                   
                                                   {/* Top decorative line */}
                                                   <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                   
                                                   {/* Status Badge - Enhanced floating style */}
                                                   <div className="absolute top-3 right-3 z-10">
                                                       {item.status === 'Menunggu' ? (
                                                           <motion.div 
                                                               animate={{ scale: [1, 1.05, 1] }}
                                                               transition={{ duration: 2, repeat: Infinity }}
                                                               className={cn("flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full shadow-lg backdrop-blur-sm border-2 border-yellow-300 dark:border-yellow-600", config.list)}
                                                           >
                                                               {config.icon}
                                                               <span>BARU</span>
                                                           </motion.div>
                                                       ) : (
                                                           <motion.span 
                                                               whileHover={{ scale: 1.1, rotate: -5 }}
                                                               className={cn("flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full shadow-md backdrop-blur-sm", config.list)}
                                                           >
                                                               {config.icon}
                                                               {item.status}
                                                           </motion.span>
                                                       )}
                                                   </div>

                                                   {/* Date Badge - Creative design */}
                                                   <div className="absolute top-3 left-3 z-10">
                                                       {displayDate ? (
                                                           <motion.div 
                                                               whileHover={{ scale: 1.15, rotate: -10 }}
                                                               transition={{ type: "spring", stiffness: 300 }}
                                                               className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 text-white shadow-xl font-bold"
                                                           >
                                                               <span className="text-[10px] uppercase leading-none opacity-90">{displayDate.toLocaleDateString('id-ID', { month: 'short' })}</span>
                                                               <span className="text-2xl leading-none mt-1">{displayDate.getDate()}</span>
                                                           </motion.div>
                                                       ) : (
                                                           <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-300 to-gray-400 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-white text-xs font-bold shadow-lg">N/A</div>
                                                       )}
                                                   </div>

                                                   {/* Main Content */}
                                                   <div className="relative p-5 pt-24 space-y-3 flex-grow">
                                                       {/* Title with shine effect on hover */}
                                                       <h3 className="font-bold text-gray-800 dark:text-slate-100 text-base leading-tight line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:via-purple-600 group-hover:to-pink-600 transition-all">
                                                           {item.acara}
                                                       </h3>
                                                       
                                                       {/* Submitter info */}
                                                       <div className="flex items-center gap-2 text-xs bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg px-3 py-2 border border-blue-100 dark:border-blue-800/30">
                                                           <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-[10px]">
                                                               {item.yangMengajukan.charAt(0).toUpperCase()}
                                                           </div>
                                                           <span className="font-semibold text-gray-700 dark:text-slate-300 line-clamp-1">{item.yangMengajukan}</span>
                                                       </div>
                                                       
                                                       {/* Info items with colorful icons */}
                                                       <div className="space-y-2">
                                                           <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-slate-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-3 py-2 border border-emerald-100 dark:border-emerald-800/30">
                                                               <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                                                               <span className="font-medium">{item.waktu || '--:--'}</span>
                                                           </div>
                                                           <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-slate-400 bg-rose-50 dark:bg-rose-900/20 rounded-lg px-3 py-2 border border-rose-100 dark:border-rose-800/30">
                                                               <MapPin className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                                                               <span className="line-clamp-1 font-medium">{item.lokasi}</span>
                                                           </div>
                                                       </div>

                                                       {/* Created date badge */}
                                                       <div className="flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-slate-500 pt-1">
                                                           <Calendar className="w-3 h-3" />
                                                           <span>Dibuat: {createdAtDate ? createdAtDate.toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'2-digit'}) : '--'}</span>
                                                       </div>
                                                   </div>

                                                   {/* Action Buttons - Modern split design */}
                                                   <div className="relative border-t-2 dark:border-slate-700 p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-sm">
                                                       {item.status === 'Menunggu' ? (
                                                           <div className="flex gap-2">
                                                               {/* Reject Button */}
                                                               <motion.button
                                                                   whileHover={{ scale: 1.05, x: -2 }}
                                                                   whileTap={{ scale: 0.95 }}
                                                                   onClick={() => updateStatus(item.id, 'Ditolak', 'Admin')}
                                                                   className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white text-sm font-bold rounded-lg shadow-md transition-all"
                                                               >
                                                                   <XCircle className="w-4 h-4" />
                                                                   <span>Tolak</span>
                                                               </motion.button>
                                                               
                                                               {/* Approve Button */}
                                                               <motion.button
                                                                   whileHover={{ scale: 1.05, x: 2 }}
                                                                   whileTap={{ scale: 0.95 }}
                                                                   onClick={() => updateStatus(item.id, 'Disetujui', 'Admin')}
                                                                   className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-sm font-bold rounded-lg shadow-md transition-all"
                                                               >
                                                                   <CheckCircle2 className="w-4 h-4" />
                                                                   <span>Setujui</span>
                                                               </motion.button>
                                                           </div>
                                                       ) : (
                                                           <div className="flex items-center justify-center py-1">
                                                               <span className={cn("flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg shadow-sm", config.list)}>
                                                                   {config.icon}
                                                                   <span>{item.status}</span>
                                                               </span>
                                                           </div>
                                                       )}
                                                   </div>
                                               </motion.div>
                                           );
                                      })}
                                     </AnimatePresence>
                                 </div>
                             )}
                        </CardContent>
                    </Card>
                </motion.div>
            </main>
        </div>
    </TooltipProvider>
 );
}

export default AdminDashboard;