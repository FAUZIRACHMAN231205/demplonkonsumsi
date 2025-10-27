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


// --- Komponen StatCard (bisa diambil dari Dashboard atau didefinisikan ulang) ---
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
        'Menunggu': { list: 'bg-yellow-100 text-yellow-800', grid: 'border-yellow-500', icon: <Clock className="w-3 h-3" /> },
        'Disetujui': { list: 'bg-purple-100 text-purple-800', grid: 'border-purple-500', icon: <CheckCircle2 className="w-3 h-3" /> },
        'Ditolak': { list: 'bg-red-100 text-red-800', grid: 'border-red-500', icon: <XCircle className="w-3 h-3" /> },
        'Selesai': { list: 'bg-green-100 text-green-800', grid: 'border-green-500', icon: <CheckCircle2 className="w-3 h-3" /> },
        'Dibatalkan': { list: 'bg-gray-100 text-gray-800', grid: 'border-gray-500', icon: <XCircle className="w-3 h-3" /> },
    };


 return (
     <TooltipProvider>
        <div className="bg-slate-50 min-h-screen font-['Poppins',_sans-serif]">
            <style>{` @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;800&display=swap'); body { font-family: 'Poppins', sans-serif; } `}</style>
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800">Dasbor Admin</h2>
                            <p className="text-gray-500">Kelola dan setujui pesanan yang masuk.</p>
                        </div>
                         {/* Tambahkan tombol kembali ke halaman pemesan jika perlu */}
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

                    <Card className="rounded-lg border bg-white text-slate-900 shadow-sm overflow-hidden">
                        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center p-6 bg-slate-50 border-b">
                            <CardTitle className="text-xl font-semibold">Daftar Pesanan Masuk</CardTitle>
                             <div className="flex items-center gap-1 rounded-lg bg-slate-200 p-1 self-start sm:self-center">
                                 <Tooltip>
                                     <TooltipTrigger asChild>
                                         <Button variant="ghost" size="sm" onClick={() => setViewMode('list')} className={cn("p-1.5 h-7 w-7", viewMode === 'list' && 'bg-white shadow-sm text-blue-600')}>
                                             <List className="w-4 h-4" />
                                          </Button>
                                     </TooltipTrigger>
                                     <TooltipContent>Tampilan Daftar</TooltipContent>
                                 </Tooltip>
                                 <Tooltip>
                                     <TooltipTrigger asChild>
                                         <Button variant="ghost" size="sm" onClick={() => setViewMode('grid')} className={cn("p-1.5 h-7 w-7", viewMode === 'grid' && 'bg-white shadow-sm text-blue-600')}>
                                             <Grid className="w-4 h-4" />
                                         </Button>
                                     </TooltipTrigger>
                                     <TooltipContent>Tampilan Grid</TooltipContent>
                                </Tooltip>
                             </div>
                        </CardHeader>
                        <CardContent className="p-4 md:p-6">
                             {/* Filter controls, gunakan state dan actions dari hook */}
                            <div className="flex flex-col xl:flex-row justify-between items-center gap-4 mb-4 pb-4 border-b">
                                <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full">
                                    <div className="relative flex-grow min-w-[150px]">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Calendar className="h-4 w-4 text-gray-400" /></div>
                                        <input
                                            type="date"
                                            value={searchDate}
                                            onChange={(e) => setSearchDate(e.target.value)}
                                            className="h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                    </div>
                                    <select
                                        value={filterStatus}
                                        // PERBAIKAN: Menambahkan tipe data untuk 'e'
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value as Pemesanan['status'] | 'Semua')}
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
                                        // PERBAIKAN: Menambahkan tipe data untuk 'e'
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortOrder(e.target.value as 'Terbaru' | 'Terlama')}
                                        className="h-9 w-full sm:w-auto flex-grow min-w-[150px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                     >
                                         <option value="Terbaru">Terbaru Dibuat</option>
                                         <option value="Terlama">Pengiriman Terlama</option>
                                     </select>
                                </div>
                                <Button variant="outline" size="sm" onClick={exportCSV} className="w-full xl:w-auto flex-shrink-0">
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
                                 <div className="text-center py-12 text-slate-500">
                                      <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                      <h4 className="text-lg font-semibold text-slate-700">Tidak Ada Pesanan</h4>
                                      <p className="text-sm mt-1">Tidak ada pesanan yang sesuai dengan filter.</p>
                                 </div>)
                             ) : (
                                 <div className={cn(viewMode === 'list' ? "space-y-3" : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4")}>
                                     {/* Log sebelum mapping data */}
                                     {console.log("[AdminDashboard] Mapping data:", filteredAndSortedRiwayat.length, "items")}
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
                                                       className="bg-white hover:bg-slate-50 rounded-lg shadow-sm border flex flex-col sm:flex-row items-center p-3 gap-3 w-full"
                                                    >
                                                       <div className="flex-grow space-y-1 text-sm">
                                                           <div className="flex justify-between items-start">
                                                               <p className="font-bold text-gray-800 ">{item.acara} </p>
                                                               <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                                                   {createdAtDate ? createdAtDate.toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'2-digit'}) : '--'}
                                                               </span>
                                                           </div>
                                                            <p className="text-xs text-gray-500">{item.yangMengajukan}</p>
                                                            <div className="flex items-center gap-3 text-xs text-gray-500 pt-1">
                                                                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{displayDate ? displayDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short'}) : '--'}</span>
                                                                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{item.waktu || '--:--'}</span>
                                                                <span className="flex items-center gap-1 truncate"><MapPin className="w-3.5 h-3.5 flex-shrink-0" />{item.lokasi}</span>
                                                            </div>
                                                       </div>
                                                       <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 mt-2 sm:mt-0">
                                                            {item.status === 'Menunggu' ? (
                                                               <>
                                                                   <Button onClick={() => updateStatus(item.id, 'Ditolak', 'Admin')} size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 h-8 px-2 text-xs">Tolak</Button>
                                                                   <Button onClick={() => updateStatus(item.id, 'Disetujui', 'Admin')} size="sm" className="h-8 px-2 text-xs bg-green-600 hover:bg-green-700">Setujui</Button>
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
                                           // Tampilan Grid
                                           return (
                                               <motion.div
                                                   key={item.id} layout
                                                   initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                   className={cn("rounded-lg flex flex-col bg-white border-l-4 shadow-sm hover:shadow-md transition-shadow", config.grid)}
                                                >
                                                   <div className="p-4 space-y-1.5 flex-grow">
                                                        <p className="font-bold text-gray-800 text-sm leading-tight">{item.acara}</p>
                                                        <p className="text-xs text-gray-500">{item.yangMengajukan}</p>
                                                        <div className="flex items-center gap-2 text-xs text-gray-500 pt-1">
                                                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{displayDate ? displayDate.toLocaleDateString('id-ID', { day:'2-digit', month:'short'}) : '--'}</span>
                                                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{item.waktu || '--:--'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                                            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                                                            <span className="line-clamp-1">{item.lokasi}</span>
                                                        </div>
                                                   </div>
                                                   <div className="border-t p-3 flex justify-between items-center bg-slate-50/50">
                                                        {item.status === 'Menunggu' ? (
                                                           <div className="flex gap-2">
                                                                <Button onClick={() => updateStatus(item.id, 'Ditolak', 'Admin')} size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 h-7 px-2 text-xs">Tolak</Button>
                                                                <Button onClick={() => updateStatus(item.id, 'Disetujui', 'Admin')} size="sm" className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700">Setujui</Button>
                                                           </div>
                                                       ) : (
                                                           <span className={cn("flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full", config.list)}>
                                                                {config.icon} {item.status}
                                                            </span>
                                                       )}
                                                        {/* Bisa tambahkan tombol detail jika perlu */}
                                                        <span className="text-xs text-gray-400 whitespace-nowrap">
                                                          {createdAtDate ? createdAtDate.toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'2-digit'}) : '--'}
                                                        </span>
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