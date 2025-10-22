import React, { useState, useMemo, forwardRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- UTILITY: Class Name Merger ---
function cn(...inputs) {
    const classes = new Set();
    inputs.forEach(arg => {
        if (!arg) return;
        if (typeof arg === 'string' || typeof arg === 'number') {
            classes.add(String(arg));
        } else if (Array.isArray(arg)) {
            arg.forEach(c => c && classes.add(String(c)));
        } else if (typeof arg === 'object') {
            Object.keys(arg).forEach(key => arg[key] && classes.add(key));
        }
    });
    return Array.from(classes).join(' ');
}

// --- TIPE DATA ---
interface StatusHistoryItem {
    timestamp: string;
    status: string;
    oleh: string;
}

interface Pemesanan {
    id: string;
    acara: string;
    tanggal: string;
    waktu: string;
    lokasi: string;
    status: 'Menunggu' | 'Disetujui' | 'Ditolak';
    statusHistory: StatusHistoryItem[];
    [key: string]: any;
}


// --- UI COMPONENTS ---
const Button = forwardRef(({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const base = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
    const variants = {
        default: "bg-blue-600 text-white hover:bg-blue-600/90",
        destructive: "bg-red-500 text-white hover:bg-red-500/90",
        outline: "border border-slate-300 hover:bg-slate-100",
    };
    const sizes = { default: "h-10 py-2 px-4", sm: "h-9 px-3 rounded-md", lg: "h-11 px-8 rounded-md" };
    return <button className={cn(base, variants[variant], sizes[size], className)} ref={ref} {...props} />;
});

const Card = forwardRef(({ className, ...props }, ref) => <div ref={ref} className={cn("rounded-xl border bg-white text-slate-900 shadow-sm", className)} {...props} />);
const CardHeader = forwardRef(({ className, ...props }, ref) => <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />);
const CardTitle = forwardRef(({ className, ...props }, ref) => <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />);
const CardContent = forwardRef(({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />);


// --- IKON BANTUAN ---
const ClockIcon = ({className = ""}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const CheckCircle2 = ({className = ""}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>;
const XCircleIcon = ({className = ""}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>;
const Download = ({className = ""}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>;
const FileTextIcon = ({className = ""}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>;
const CalendarIcon = ({className = ""}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const MapPinIcon = ({className = ""}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const ListIcon = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>;
const GridIcon = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>;


const StatCard = ({ icon, title, value, iconBgClass }) => (
    <Card className="transition-all duration-300 hover:shadow-lg p-4 h-full">
        <div className="flex items-center justify-between">
            <div className="flex flex-col">
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <p className="text-2xl font-bold text-slate-800">{value}</p>
            </div>
            <div className={`p-2 rounded-lg ${iconBgClass}`}>
                 {icon}
            </div>
        </div>
    </Card>
);

const AdminDashboard = () => {
  
  // Data dummy dan state akan dikelola di sini.
  // Untuk aplikasi nyata, ini akan berasal dari API atau state management.
  const [riwayatPemesanan, setRiwayatPemesanan] = useState([
        { id: '1', acara: 'Rapat Koordinasi Bulanan', tanggal: '2025-10-22', waktu: 'Pagi', lokasi: 'Gedung Utama, Ruang Rapat Cempaka', status: 'Menunggu', statusHistory: [{ timestamp: '21 Okt 2025, 10:30:00', status: 'Pesanan Dibuat', oleh: 'Riza Ilhamsyah' }] },
        { id: '2', acara: 'Pelatihan Internal K3', tanggal: '2025-10-23', waktu: 'Siang', lokasi: 'Gedung Training Center, Ruang 1', status: 'Disetujui', statusHistory: [{ timestamp: '20 Okt 2025, 14:00:00', status: 'Pesanan Dibuat', oleh: 'Riza Ilhamsyah' },{ timestamp: '21 Okt 2025, 09:00:00', status: 'Pesanan Disetujui', oleh: 'Jojok Satriadi' }] },
        { id: '3', acara: 'Bahan Minum Karyawan', tanggal: '2025-10-24', waktu: 'Pagi', lokasi: 'Gedung Produksi, Area Istirahat', status: 'Ditolak', statusHistory: [{ timestamp: '19 Okt 2025, 11:00:00', status: 'Pesanan Dibuat', oleh: 'Riza Ilhamsyah' },{ timestamp: '19 Okt 2025, 15:30:00', status: 'Pesanan Ditolak', oleh: 'Jojok Satriadi' }] },
  ]);
  const [searchDate, setSearchDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [sortOrder, setSortOrder] = useState('Terbaru');
  const [viewMode, setViewMode] = useState('list');

  const counts = useMemo(() => ({
      Menunggu: riwayatPemesanan.filter(p => p.status === 'Menunggu').length,
      Disetujui: riwayatPemesanan.filter(p => p.status === 'Disetujui').length,
      Ditolak: riwayatPemesanan.filter(p => p.status === 'Ditolak').length,
  }), [riwayatPemesanan]);
  
  const handleUpdateStatus = (id, newStatus) => {
        setRiwayatPemesanan(currentRiwayat =>
            currentRiwayat.map(item => {
                if (item.id === id) {
                    const newHistoryEntry = { timestamp: new Date().toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }), status: `Pesanan Di${newStatus}`, oleh: 'Admin' };
                    return { ...item, status: newStatus, statusHistory: [...item.statusHistory, newHistoryEntry] };
                }
                return item;
            })
        );
    };

  const finalRiwayat = useMemo(() => {
    return riwayatPemesanan
      .filter(item => {
        if (searchDate && item.tanggal !== searchDate) return false;
        if (filterStatus !== 'Semua' && item.status !== filterStatus) return false;
        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.tanggal).getTime();
        const dateB = new Date(b.tanggal).getTime();
        return sortOrder === 'Terbaru' ? dateB - dateA : dateA - dateB;
      });
  }, [riwayatPemesanan, searchDate, filterStatus, sortOrder]);

  const statusConfig = {
    Disetujui: { list: 'bg-purple-100 text-purple-800', grid: 'border-purple-500', icon: <CheckCircle2 className="w-3 h-3" /> },
    Ditolak: { list: 'bg-red-100 text-red-800', grid: 'border-red-500', icon: <XCircleIcon className="w-3 h-3" /> },
    Menunggu: { list: 'bg-yellow-100 text-yellow-800', grid: 'border-yellow-500', icon: <ClockIcon className="w-3 h-3" /> },
  };

  return (
     <div className="bg-slate-50 min-h-screen font-['Poppins',_sans-serif]">
        <style>{` @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;800&display=swap');`}</style>
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Dasbor Admin</h2>
                        <p className="text-gray-500">Kelola dan setujui pesanan yang masuk.</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    <StatCard 
                        title="Menunggu Persetujuan" 
                        value={counts.Menunggu} 
                        icon={<ClockIcon className="h-5 w-5 text-yellow-600"/>} 
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
                        icon={<XCircleIcon className="h-5 w-5 text-red-600"/>} 
                        iconBgClass="bg-red-100" 
                    />
                </div>

                <Card className="rounded-lg border bg-white text-slate-900 shadow-sm">
                    <CardHeader className="flex flex-row justify-between items-center p-6">
                        <div><CardTitle className="text-2xl font-semibold">Daftar Pesanan Masuk</CardTitle></div>
                         <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1"><Button onClick={() => setViewMode('list')} className={`h-8 w-8 inline-flex items-center justify-center rounded transition-colors ${viewMode === 'list' ? 'bg-white shadow-md text-slate-900' : 'bg-transparent text-slate-600 hover:bg-slate-200'}`}><ListIcon className="w-5 h-5" /></Button><Button onClick={() => setViewMode('grid')} className={`h-8 w-8 inline-flex items-center justify-center rounded transition-colors ${viewMode === 'grid' ? 'bg-white shadow-md text-slate-900' : 'bg-transparent text-slate-600 hover:bg-slate-200'}`}><GridIcon className="w-5 h-5" /></Button></div>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 pb-4 border-b border-gray-200">
                            <div className="flex flex-wrap gap-2">
                                <div className="relative"><div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><CalendarIcon className="h-4 w-4 text-gray-400" /></div><input type="date" value={searchDate} onChange={(e) => setSearchDate(e.target.value)} className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/></div>
                                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as 'Semua' | 'Menunggu' | 'Disetujui' | 'Ditolak')} className="w-full sm:w-[180px] h-10 border border-slate-300 rounded-md px-3 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="Semua">Semua Status</option><option value="Menunggu">Menunggu</option><option value="Disetujui">Disetujui</option><option value="Ditolak">Ditolak</option></select>
                                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as 'Terbaru' | 'Terlama')} className="w-full sm:w-[180px] h-10 border border-slate-300 rounded-md px-3 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="Terbaru">Terbaru</option><option value="Terlama">Terlama</option></select>
                            </div>
                            <Button variant="outline" className="border border-slate-300 hover:bg-slate-100 h-10 py-2 px-4 inline-flex items-center justify-center rounded-md"><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
                        </div>
                         <div className={viewMode === 'list' ? "space-y-3" : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"}>
                            {finalRiwayat.length === 0 ? (<div className="text-center py-12 md:col-span-2 xl:col-span-3"><FileTextIcon className="text-gray-300 w-24 h-24 mx-auto"/><h4 className="text-xl font-semibold text-gray-700 mt-4">Tidak Ada Pesanan Ditemukan</h4><p className="text-gray-500">Saat ini tidak ada pesanan yang masuk.</p></div>) : (
                               <AnimatePresence>
                                 {finalRiwayat.map((item: Pemesanan, index: number) => {
                                    const config = statusConfig[item.status];
                                    return (
                                        <motion.div key={item.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col">
                                            <div className="p-4 flex-grow">
                                                <p className="font-bold text-gray-800">{item.acara}</p>
                                                <div className="text-sm text-gray-500 mt-2 space-y-1">
                                                    <div className="flex items-center gap-1.5"><CalendarIcon className="w-4 h-4" /><span>{item.tanggal} - {item.waktu}</span></div>
                                                    <div className="flex items-center gap-1.5"><MapPinIcon className="w-4 h-4" /><span>{item.lokasi}</span></div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-end gap-2 border-t border-slate-100 p-3 bg-slate-50/50 rounded-b-lg">
                                                {item.status === 'Menunggu' ? (
                                                    <>
                                                        <Button onClick={() => handleUpdateStatus(item.id, 'Ditolak')} size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">Tolak</Button>
                                                        <Button onClick={() => handleUpdateStatus(item.id, 'Disetujui')} size="sm">Setujui</Button>
                                                    </>
                                                ) : (
                                                    <span className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full ${config.list}`}>{config.icon} {item.status}</span>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                               </AnimatePresence>
                             )
                            }
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </main>
    </div>
  );
}

export default AdminDashboard;
