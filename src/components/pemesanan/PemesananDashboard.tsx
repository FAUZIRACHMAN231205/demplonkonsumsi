import React, { useState, useEffect, useMemo, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- UTILITY: Class Name Merger ---
function cn(...inputs) {
    const classes = new Set();
    inputs.forEach(arg => {
        if (!arg) return;
        if (typeof arg === 'string') {
            classes.add(arg);
        } else if (typeof arg === 'object') {
            Object.keys(arg).forEach(key => {
                if (arg[key]) {
                    classes.add(key);
                }
            });
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
    status: 'Akan Datang' | 'Selesai' | 'Dibatalkan';
    statusHistory: StatusHistoryItem[];
    [key: string]: any;
}

// --- UI COMPONENTS ---
const Button = forwardRef(({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const base = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
    const variants = {
        default: "bg-blue-600 text-white hover:bg-blue-700",
        ghost: "hover:bg-slate-100",
        outline: "border border-slate-300 hover:bg-slate-100",
    };
    const sizes = {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md"
    };
    return <button className={cn(base, variants[variant], sizes[size], className)} ref={ref} {...props} />;
});

const Card = ({ children, className, ...props }) => <div className={cn("rounded-xl border bg-white text-slate-900 shadow-sm", className)} {...props}>{children}</div>;
const CardHeader = ({ children, className, ...props }) => <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props}>{children}</div>;
const CardTitle = ({ children, className, ...props }) => <h3 className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props}>{children}</h3>;
const CardContent = ({ children, className, ...props }) => <div className={cn("p-6 pt-0", className)} {...props}>{children}</div>;

// --- Komponen Tooltip ---
const TooltipContext = React.createContext();
const TooltipProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [content, setContent] = useState('');
    const contextValue = useMemo(() => ({ isOpen, setIsOpen, position, setPosition, content, setContent }), [isOpen, position, content]);
    return (
        <TooltipContext.Provider value={contextValue}>
            {children}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.1 }}
                        className="fixed z-[100] rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-md"
                        style={{ top: position.y, left: position.x }}
                    >
                        {content}
                    </motion.div>
                )}
            </AnimatePresence>
        </TooltipContext.Provider>
    );
};
const useTooltip = () => React.useContext(TooltipContext);
const Tooltip = ({ children, content }) => {
    const { setIsOpen, setPosition, setContent } = useTooltip();
    const handleMouseEnter = (e) => {
        setContent(content);
        const rect = e.currentTarget.getBoundingClientRect();
        setPosition({ x: rect.left + rect.width / 2 - 40, y: rect.top - rect.height - 10 });
        setIsOpen(true);
    };
    const handleMouseLeave = () => setIsOpen(false);
    return React.cloneElement(children, { onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave });
};

// --- IKON BANTUAN ---
const PlusCircle = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>;
const ClockIcon = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const CheckCircle2 = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="m9 12 2 2 4-4" /></svg>;
const XCircleIcon = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>;
const XIcon = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const ListIcon = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="8" x2="21" y1="6" y2="6"></line><line x1="8" x2="21" y1="12" y2="12"></line><line x1="8" x2="21" y1="18" y2="18"></line><line x1="3" x2="3.01" y1="6" y2="6"></line><line x1="3" x2="3.01" y1="12" y2="12"></line><line x1="3" x2="3.01" y1="18" y2="18"></line></svg>;
const GridIcon = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><line x1="3" x2="21" y1="9" y2="9"></line><line x1="3" x2="21" y1="15" y2="15"></line><line x1="9" x2="9" y1="3" y2="21"></line><line x1="15" x2="15" y1="3" y2="21"></line></svg>;
const CalendarIcon = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>;
const Download = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" x2="12" y1="15" y2="3"></line></svg>;
const FileTextIcon = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" x2="8" y1="13" y2="13"></line><line x1="16" x2="8" y1="17" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const MapPinIcon = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const Eye = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const Trash2 = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const AlertTriangleIcon = ({ className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" x2="12" y1="9" y2="13"></line><line x1="12" x2="12.01" y1="17" y2="17"></line></svg>;

// --- KOMPONEN TIMELINE STATUS ---
const StatusTimeline = ({ history }) => (
    <div className="mt-6">
        <h4 className="font-semibold text-lg mb-4 text-gray-800">Riwayat Status</h4>
        <div className="relative border-l-2 border-slate-200 ml-3">
            {Array.isArray(history) && history.length > 0 ? (
                history.map((item, index) => (
                    <div key={index} className="mb-8 flex items-start">
                        <div className="absolute -left-4 top-1 h-7 w-7 bg-blue-500 rounded-full flex items-center justify-center text-white"><CheckCircle2 className="w-5 h-5" /></div>
                        <div className="ml-8"><p className="font-semibold text-gray-700">{item.status}</p><p className="text-sm text-gray-500">Pada {item.timestamp} oleh {item.oleh}</p></div>
                    </div>
                ))
            ) : <p className="text-sm text-gray-500 ml-8">Tidak ada riwayat status.</p>}
        </div>
    </div>
);

// --- KOMPONEN MODAL ---
const PemesananDetailModal = ({ pesanan, onClose }) => {
    if (!pesanan) return null;
    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
                <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                    <div className="p-6 border-b flex justify-between items-center"><h3 className="text-2xl font-bold text-gray-800">Detail Pesanan</h3><Button variant="ghost" size="sm" onClick={onClose} className="p-2 rounded-full"><XIcon className="w-6 h-6 text-slate-500" /></Button></div>
                    <div className="p-6"><div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-4"><div><strong className="block text-slate-500 text-sm">Acara:</strong><span className="text-gray-800 text-lg font-semibold">{pesanan.acara}</span></div><div><strong className="block text-slate-500 text-sm">Tanggal:</strong><span className="text-gray-800">{pesanan.tanggal}</span></div><div><strong className="block text-slate-500 text-sm">Waktu:</strong><span className="text-gray-800">{pesanan.waktu}</span></div><div><strong className="block text-slate-500 text-sm">Lokasi:</strong><span className="text-gray-800">{pesanan.lokasi}</span></div></div><StatusTimeline history={pesanan.statusHistory} /></div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, orderAcara }) => {
    if (!isOpen) return null;
    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                <motion.div initial={{ scale: 0.9, y: -20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: -20, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100"><AlertTriangleIcon className="h-8 w-8 text-red-600" /></div><h3 className="mt-5 text-2xl font-bold text-gray-800">Hapus Pesanan</h3><p className="mt-2 text-gray-600">Anda yakin ingin menghapus pesanan <strong className="font-semibold text-gray-800">"{orderAcara}"</strong>? Tindakan ini tidak dapat dibatalkan.</p><div className="mt-8 flex justify-center gap-4"><Button onClick={onClose} className="w-full rounded-lg bg-slate-200 px-6 py-3 text-base font-semibold text-gray-800 hover:bg-slate-300">Tutup</Button><Button onClick={onConfirm} className="w-full rounded-lg bg-red-600 px-6 py-3 text-base font-semibold text-white hover:bg-red-700">Ya, Hapus</Button></div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// --- KOMPONEN WIDGET & STATS ---
const DateWidget = () => {
    const [time, setTime] = useState(new Date());
    useEffect(() => { const timerId = setInterval(() => setTime(new Date()), 60000); return () => clearInterval(timerId); }, []);
    const fullDate = time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const currentTime = time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }).replace(/\./g, ':');
    return (<Card className="flex flex-col justify-center text-center transition-all duration-300 hover:shadow-lg p-4 h-full"><p className="text-3xl font-extrabold text-slate-800 tracking-tight">{currentTime}</p><p className="text-sm text-slate-500">{fullDate}</p></Card>);
};
const StatCard = ({ icon, title, value, iconBgClass }) => (<Card className="transition-all duration-300 hover:shadow-lg p-4 h-full"><div className="flex items-center justify-between"><div className="flex flex-col"><p className="text-sm font-medium text-slate-500">{title}</p><p className="text-2xl font-bold text-slate-800">{value}</p></div><div className={cn("p-2 rounded-lg", iconBgClass)}>{icon}</div></div></Card>);

// --- Komponen Skeleton (Kerangka Pemuatan) ---
const Skeleton = ({ className }) => <div className={cn("animate-pulse rounded-md bg-slate-200", className)} />;

// --- Komponen Toast (Notifikasi) ---
const Toast = ({ message, show, onHide }) => (
    <AnimatePresence>
        {show && (
            <motion.div
                initial={{ opacity: 0, y: 50, x: '5%' }}
                animate={{ opacity: 1, y: 0, x: '5%' }}
                exit={{ opacity: 0, y: 20, x: '5%' }}
                className="fixed bottom-5 right-5 z-[100] flex items-center gap-2 rounded-lg bg-slate-900 p-4 text-white shadow-lg"
            >
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>{message}</span>
            </motion.div>
        )}
    </AnimatePresence>
);

// --- KOMPONEN UTAMA DASHBOARD ---
const PemesananDashboard = ({ onNewOrderClick, riwayatPemesanan: initialRiwayat = [], onDeleteOrder }) => {
    const dummyData = useMemo(() => [
        { id: '1', acara: 'Rapat Tahunan Klien', tanggal: '2025-10-20', waktu: '10:00', lokasi: 'Ruang Rapat Utama', status: 'Akan Datang', statusHistory: [{ timestamp: '19-10-2025 09:00', status: 'Dibuat', oleh: 'Pengguna' }] },
        { id: '2', acara: 'Sesi Pelatihan Internal', tanggal: '2025-11-15', waktu: '13:00', lokasi: 'Auditorium', status: 'Akan Datang', statusHistory: [{ timestamp: '20-10-2025 11:00', status: 'Dibuat', oleh: 'Pengguna' }] },
        { id: '3', acara: 'Wawancara Kandidat Manager', tanggal: '2025-10-23', waktu: '09:00', lokasi: 'Ruang HRD', status: 'Dibatalkan', statusHistory: [{ timestamp: '18-10-2025 16:00', status: 'Dibuat', oleh: 'Pengguna' }, { timestamp: '19-10-2025 10:00', status: 'Dibatalkan', oleh: 'Pengguna' }] },
    ], []);

    const [daftarPemesanan, setDaftarPemesanan] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, message: '' });

    const [searchDate, setSearchDate] = useState('');
    const [filterStatus, setFilterStatus] = useState('Semua');
    const [sortOrder, setSortOrder] = useState('Terbaru');
    const [viewMode, setViewMode] = useState('list');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPemesanan, setSelectedPemesanan] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState(null);

    useEffect(() => {
        setTimeout(() => {
            setDaftarPemesanan(initialRiwayat.length > 0 ? initialRiwayat : dummyData);
            setIsLoading(false);
        }, 1500);
    }, [initialRiwayat, dummyData]);

    useEffect(() => {
        if (isLoading) return;
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const updatedPemesanan = daftarPemesanan.map(p => {
            if (p.status === 'Akan Datang' && new Date(p.tanggal) < today) {
                return { ...p, status: 'Selesai', statusHistory: [...p.statusHistory, { timestamp: new Date().toLocaleDateString('id-ID'), status: 'Selesai', oleh: 'Sistem' }] };
            }
            return p;
        });
        if (JSON.stringify(updatedPemesanan) !== JSON.stringify(daftarPemesanan)) { setDaftarPemesanan(updatedPemesanan); }
    }, [daftarPemesanan, isLoading]);

    const counts = useMemo(() => ({
        'Akan Datang': daftarPemesanan.filter(p => p.status === 'Akan Datang').length,
        Selesai: daftarPemesanan.filter(p => p.status === 'Selesai').length,
        Dibatalkan: daftarPemesanan.filter(p => p.status === 'Dibatalkan').length,
    }), [daftarPemesanan]);

    const finalRiwayat = useMemo(() => {
        return daftarPemesanan
            .filter(item => (searchDate ? item.tanggal === searchDate : true) && (filterStatus !== 'Semua' ? item.status === filterStatus : true))
            .sort((a, b) => {
                const dateA = new Date(a.tanggal).getTime(); const dateB = new Date(b.tanggal).getTime();
                return sortOrder === 'Terbaru' ? dateB - dateA : dateA - dateB;
            });
    }, [daftarPemesanan, searchDate, filterStatus, sortOrder]);

    const handleViewDetails = (p) => { setSelectedPemesanan(p); setIsModalOpen(true); };
    const handleCloseModal = () => setIsModalOpen(false);
    const handleOpenDeleteModal = (id, acara) => { setOrderToDelete({ id, acara }); setIsDeleteModalOpen(true); };
    const handleCloseDeleteModal = () => setIsDeleteModalOpen(false);
    const handleConfirmDelete = () => {
        if (!orderToDelete) return;
        setDaftarPemesanan(prev => prev.filter(p => p.id !== orderToDelete.id)); 
        setToast({ show: true, message: 'Pesanan berhasil dihapus!' });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
        handleCloseDeleteModal();
    };

    useEffect(() => {
        const handleEsc = (e) => { if (e.keyCode === 27) { handleCloseModal(); handleCloseDeleteModal(); } };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);
    
    const statusConfig = {
        'Akan Datang': { list: 'bg-blue-100 text-blue-800', grid: 'border-blue-500', icon: <ClockIcon className="w-4 h-4" /> },
        Selesai: { list: 'bg-green-100 text-green-800', grid: 'border-green-500', icon: <CheckCircle2 className="w-4 h-4" /> },
        Dibatalkan: { list: 'bg-red-100 text-red-800', grid: 'border-red-500', icon: <XCircleIcon className="w-4 h-4" /> },
    };

    return (
        <TooltipProvider>
            <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Dasbor Pesanan</h2>
                        <p className="text-gray-500">Selamat datang! Berikut ringkasan pesanan Anda.</p>
                    </div>
                    <Button size="lg" onClick={onNewOrderClick} className="w-full md:w-auto transform hover:scale-105 transition-transform"><PlusCircle className="mr-2 h-5 w-5" />Buat Pesanan Baru</Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="sm:col-span-2 lg:col-span-1"><DateWidget /></div>
                    <StatCard icon={<ClockIcon className="w-6 h-6 text-blue-600" />} title="Akan Datang" value={counts['Akan Datang']} iconBgClass="bg-blue-100" />
                    <StatCard icon={<CheckCircle2 className="w-6 h-6 text-green-600" />} title="Selesai" value={counts.Selesai} iconBgClass="bg-green-100" />
                    <StatCard icon={<XCircleIcon className="w-6 h-6 text-red-600" />} title="Dibatalkan" value={counts.Dibatalkan} iconBgClass="bg-red-100" />
                </div>

                <Card>
                    <CardHeader className="flex flex-col md:flex-row justify-between md:items-center p-6 gap-4">
                        <CardTitle>Riwayat Pemesanan</CardTitle>
                        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 self-start md:self-center"><Button variant="ghost" size="sm" onClick={() => setViewMode('list')} className={cn("p-2", viewMode === 'list' && 'bg-white shadow-sm text-blue-600')}><ListIcon className="w-5 h-5" /></Button><Button variant="ghost" size="sm" onClick={() => setViewMode('grid')} className={cn("p-2", viewMode === 'grid' && 'bg-white shadow-sm text-blue-600')}><GridIcon className="w-5 h-5" /></Button></div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col xl:flex-row justify-between items-center gap-4 mb-4 pb-4 border-b">
                            <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full">
                                <div className="relative flex-grow"><div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><CalendarIcon className="h-4 w-4 text-gray-400" /></div><input type="date" value={searchDate} onChange={(e) => setSearchDate(e.target.value)} className="h-10 w-full rounded-md border bg-transparent pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/></div>
                                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="h-10 w-full sm:w-auto flex-grow rounded-md border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="Semua">Semua Status</option><option value="Akan Datang">Akan Datang</option><option value="Selesai">Selesai</option><option value="Dibatalkan">Dibatalkan</option></select>
                                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="h-10 w-full sm:w-auto flex-grow rounded-md border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="Terbaru">Terbaru</option><option value="Terlama">Terlama</option></select>
                            </div>
                            <Button variant="outline" className="w-full xl:w-auto flex-shrink-0"><Download className="mr-2 h-4 w-4" />Export CSV</Button>
                        </div>
                        
                        {isLoading ? (
                            <div className={cn(viewMode === 'list' ? "space-y-3" : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4")}>
                                {Array.from({ length: 4 }).map((_, i) => viewMode === 'list' ? <Skeleton key={i} className="h-[76px] w-full" /> : <Skeleton key={i} className="h-[150px] w-full" />)}
                            </div>
                        ) : finalRiwayat.length === 0 ? (
                            <div className="text-center py-12"><FileTextIcon className="text-gray-300 w-24 h-24 mx-auto"/><h4 className="text-xl font-semibold text-gray-700 mt-4">Tidak Ada Pesanan</h4><p className="text-gray-500 mb-4">Sepertinya Anda belum membuat pesanan apapun.</p><Button onClick={onNewOrderClick}><PlusCircle className="mr-2 h-4 w-4" />Buat Pesanan Pertama Anda</Button></div>
                        ) : (
                            <div className={cn(viewMode === 'list' ? "space-y-3" : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4")}>
                                <AnimatePresence>
                                    {finalRiwayat.map((item) => {
                                        const config = statusConfig[item.status];
                                        if (viewMode === 'list') {
                                            return (
                                                <motion.div key={item.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white hover:bg-slate-50 rounded-lg shadow-sm border flex items-center p-3 gap-4 w-full">
                                                    <div className={cn("flex-shrink-0 text-center w-20 p-2 rounded-lg", config.list)}><p className="text-sm font-bold uppercase">{new Date(item.tanggal).toLocaleDateString('id-ID', { month: 'short' })}</p><p className="text-2xl font-extrabold">{new Date(item.tanggal).getDate()}</p></div>
                                                    <div className="flex-grow space-y-1"><p className="font-bold text-gray-800">{item.acara}</p><div className="flex items-center gap-4 text-xs text-gray-500"><span className="flex items-center gap-1.5"><ClockIcon className="w-3.5 h-3.5" />{item.waktu || '--:--'}</span><span className="flex items-center gap-1.5"><MapPinIcon className="w-3.5 h-3.5" />{item.lokasi}</span></div></div>
                                                    <div className="flex items-center gap-1">
                                                        <span className={cn("flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full", config.list)}>{config.icon}{item.status}</span>
                                                        <Tooltip content="Lihat Detail"><Button variant="ghost" size="sm" onClick={() => handleViewDetails(item)} className="p-2 rounded-md"><Eye className="w-5 h-5 text-slate-500" /></Button></Tooltip>
                                                        {item.status === 'Akan Datang' && <Tooltip content="Hapus"><Button variant="ghost" size="sm" className="p-2 rounded-md text-red-500 hover:bg-red-100 hover:text-red-600" onClick={() => handleOpenDeleteModal(item.id, item.acara)}><Trash2 className="w-5 h-5" /></Button></Tooltip>}
                                                    </div>
                                                </motion.div>
                                            );
                                        }
                                        return (
                                            <motion.div key={item.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className={cn("rounded-lg flex flex-col bg-white border-l-4 shadow-sm hover:shadow-lg transition-shadow", config.grid)}>
                                                <div className="p-4 space-y-2 flex-grow"><p className="font-bold text-gray-800">{item.acara}</p><div className="flex items-center gap-4 text-xs text-gray-500"><span className="flex items-center gap-1.5"><CalendarIcon className="w-3.5 h-3.5" />{item.tanggal}</span><span className="flex items-center gap-1.5"><ClockIcon className="w-3.5 h-3.5" />{item.waktu || '--:--'}</span></div><div className="flex items-center gap-1.5 text-xs text-gray-500"><MapPinIcon className="w-3.5 h-3.5" />{item.lokasi}</div></div>
                                                <div className="border-t p-4 flex justify-between items-center">
                                                    <span className={cn("flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full", config.list)}>{config.icon}{item.status}</span>
                                                    <div className="flex items-center">
                                                        <Tooltip content="Lihat Detail"><Button variant="ghost" size="sm" onClick={() => handleViewDetails(item)} className="p-2 rounded-md"><Eye className="w-5 h-5 text-slate-500" /></Button></Tooltip>
                                                        {item.status === 'Akan Datang' && <Tooltip content="Hapus"><Button variant="ghost" size="sm" className="p-2 rounded-md text-red-500 hover:bg-red-100 hover:text-red-600" onClick={() => handleOpenDeleteModal(item.id, item.acara)}><Trash2 className="w-5 h-5" /></Button></Tooltip>}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            
            <AnimatePresence>{isModalOpen && <PemesananDetailModal pesanan={selectedPemesanan} onClose={handleCloseModal} />}</AnimatePresence>
            <DeleteConfirmationModal isOpen={isDeleteModalOpen} onClose={handleCloseDeleteModal} onConfirm={handleConfirmDelete} orderAcara={orderToDelete?.acara} />
            <Toast message={toast.message} show={toast.show} />
        </TooltipProvider>
    );
}

export default PemesananDashboard;

