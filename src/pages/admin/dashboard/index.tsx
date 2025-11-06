// PERBAIKAN: Menghapus 'forwardRef', 'useEffect' karena tidak dipakai
import React, { useMemo, useState } from "react"; 
// DIUBAH: Impor hook dari context, bukan dari direktori hooks
import { useSharedPemesanan } from '@/context/PemesananContext';
import { Pemesanan } from '../../../lib/schema'; // Sesuaikan path jika perlu
// Impor UI components & icons jika perlu
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip"; // Provider saja
import { cn } from "@/lib/utils";
import {
  Clock, CheckCircle2, XCircle, Download, FileText, Calendar
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


// --- Komponen StatCard (bisa diambil dari Dashboard atau didefinisikan ulang) ---
const StatCard = ({ icon, title, value, iconBgClass }: { icon: React.ReactNode, title: string, value: number, iconBgClass: string }) => (
    <Card className="hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 p-2.5 xs:p-3 sm:p-4 h-full dark:bg-slate-800 cursor-pointer group">
        <div className="flex items-center justify-between gap-1.5 xs:gap-2">
            <div className="flex flex-col min-w-0 flex-1">
                <p className="text-[9px] xs:text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 truncate leading-tight group-hover:text-slate-700 dark:group-hover:text-slate-100 transition-colors">{title}</p>
                <p className="text-lg xs:text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-none mt-0.5 xs:mt-1 group-hover:scale-110 transition-transform duration-300 origin-left">{value}</p>
            </div>
            <div className={cn("p-1.5 xs:p-2 sm:p-2.5 rounded-md xs:rounded-lg flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300", iconBgClass)}>
                 {icon}
            </div>
        </div>
    </Card>
);

// --- Komponen Utama Admin Dashboard ---
const AdminDashboard = () => {

    // DIUBAH: Gunakan hook dari context
    // Pastikan Anda memanggil hook ini, bukan usePemesanan() langsung
    const {
        filteredAndSortedRiwayat, // Data yang sudah difilter/sort
        counts,
        actions,
        searchDate,
        filterStatus,
        sortOrder,
    } = useSharedPemesanan(); // Gunakan shared hook

  // Pencarian & pagination lokal
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

    // Gunakan actions dari hook untuk filter/sort
    // Kita tidak perlu mendefinisikan ulang fungsi ini karena sudah ada di 'actions'
  const { setFilterStatus, setSortOrder, setSearchDate, exportCSV, updateStatus } = actions;

  // Filter baris berdasarkan query (acara/lokasi/pengaju/bagian)
  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return filteredAndSortedRiwayat;
    return filteredAndSortedRiwayat.filter((r) => {
      const s = (v?: string) => (v || "").toLowerCase();
      return (
        s(r.acara).includes(q) ||
        s(r.lokasi).includes(q) ||
        s(r.yangMengajukan).includes(q) ||
        s(r.untukBagian).includes(q)
      );
    });
  }, [filteredAndSortedRiwayat, query]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, filteredRows.length);
  const pageRows = filteredRows.slice(startIdx, endIdx);


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
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 xs:gap-3 sm:gap-4 mb-4 xs:mb-5 sm:mb-8">
                        <StatCard
                            title="Menunggu"
                            value={counts.Menunggu}
                            icon={<Clock className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-yellow-600"/>}
                            iconBgClass="bg-yellow-100 dark:bg-yellow-500/20"
                        />
                        <StatCard
                            title="Disetujui"
                            value={counts.Disetujui}
                            icon={<CheckCircle2 className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-purple-600"/>}
                            iconBgClass="bg-purple-100 dark:bg-purple-500/20"
                        />
                        <StatCard
                            title="Ditolak"
                            value={counts.Ditolak}
                            icon={<XCircle className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-red-600"/>}
                            iconBgClass="bg-red-100 dark:bg-red-500/20"
                        />
                         {/* Mungkin tambahkan Selesai & Dibatalkan juga */}
                    </div>

          <Card className="rounded-lg border bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-slate-100 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 p-6 bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-700">
              <CardTitle className="text-xl font-semibold dark:text-gray-100">Daftar Pesanan Masuk</CardTitle>
              <div className="w-full sm:w-auto flex gap-2">
                <input
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                  placeholder="Cari acara, lokasi, pengaju, bagian..."
                  className="h-9 w-full sm:w-72 rounded-md border border-input bg-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <Button variant="outline" size="sm" onClick={exportCSV} className="flex-shrink-0 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-600">
                  <Download className="mr-2 h-4 w-4" /> Export CSV
                </Button>
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
                {/* Tombol Export dipindahkan ke header */}
                             </div>

                             {/* Tabel Pesanan (shadcn/ui) */}
                             {filteredRows.length === 0 ? (
                               <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                                 <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                 <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Tidak Ada Pesanan</h4>
                                 <p className="text-sm mt-1">Tidak ada pesanan yang sesuai dengan filter.</p>
                               </div>
                             ) : (
                               <div className="overflow-hidden rounded-md border dark:border-slate-700">
                                 <Table>
                                   <TableHeader>
                                     <TableRow>
                                       <TableHead>Acara</TableHead>
                                       <TableHead>Tgl Pengiriman</TableHead>
                                       <TableHead>Waktu</TableHead>
                                       <TableHead>Lokasi</TableHead>
                                       <TableHead>Pengaju</TableHead>
                                       <TableHead>Bagian</TableHead>
                                       <TableHead>Status</TableHead>
                                       <TableHead className="text-right">Konsumsi</TableHead>
                                       <TableHead className="text-right">Aksi</TableHead>
                                     </TableRow>
                                   </TableHeader>
                                   <TableBody>
                                     {pageRows.map((item) => {
                                       const displayDate = item.tanggalPengiriman ? new Date(item.tanggalPengiriman) : null;
                                       const statusBadge = (
                                         <span className={cn(
                                           "inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full",
                                           statusConfig[item.status].list
                                         )}>
                                           {statusConfig[item.status].icon}
                                           {item.status}
                                         </span>
                                       );
                                       return (
                                         <TableRow key={item.id}>
                                           <TableCell className="font-medium max-w-[240px] truncate" title={item.acara}>{item.acara}</TableCell>
                                           <TableCell>{displayDate ? displayDate.toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric'}) : '-'}</TableCell>
                                           <TableCell>{item.waktu || '--:--'}</TableCell>
                                           <TableCell className="max-w-[220px] truncate" title={item.lokasi}>{item.lokasi}</TableCell>
                                           <TableCell className="max-w-[180px] truncate" title={item.yangMengajukan}>{item.yangMengajukan}</TableCell>
                                           <TableCell className="max-w-[160px] truncate" title={item.untukBagian}>{item.untukBagian}</TableCell>
                                           <TableCell>{statusBadge}</TableCell>
                                           <TableCell className="text-right tabular-nums">{Array.isArray(item.konsumsi) ? item.konsumsi.length : 0}</TableCell>
                                           <TableCell className="text-right">
                                             {item.status === 'Menunggu' ? (
                                               <div className="flex justify-end gap-2">
                                                 <Button onClick={() => updateStatus(item.id, 'Ditolak', 'Admin')} size="sm" variant="outline" className="h-8 px-2 text-xs">Tolak</Button>
                                                 <Button onClick={() => updateStatus(item.id, 'Disetujui', 'Admin')} size="sm" className="h-8 px-2 text-xs">Setujui</Button>
                                               </div>
                                             ) : (
                                               <span className="text-xs text-slate-400">—</span>
                                             )}
                                           </TableCell>
                                         </TableRow>
                                       );
                                     })}
                                   </TableBody>
                                 </Table>
                               </div>
                             )}

                             {/* Pagination */}
                             <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
                               <div className="text-xs text-slate-500 dark:text-slate-400">
                                 Menampilkan {filteredRows.length === 0 ? 0 : startIdx + 1}–{endIdx} dari {filteredRows.length}
                               </div>
                               <div className="flex items-center gap-2">
                                 <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Sebelumnya</Button>
                                 <span className="text-sm tabular-nums">Hal {currentPage} / {totalPages}</span>
                                 <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Berikutnya</Button>
                               </div>
                             </div>
                        </CardContent>
                    </Card>
            </main>
        </div>
    </TooltipProvider>
 );
}

export default AdminDashboard;