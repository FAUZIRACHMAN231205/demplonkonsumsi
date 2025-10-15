import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/Select';
import { Pemesanan } from '../../lib/schema';

// --- Helper Icons (as SVG components) ---
const PlusCircle = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const CheckCircle2 = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>;
const XCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>;
const Download = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>;
const Eye = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;
const FileTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>;


const StatCard = ({ icon, title, value, colorClass }) => (
  <div className={`p-5 rounded-xl shadow-lg flex items-center space-x-4 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${colorClass}`}>
    <div className="text-4xl opacity-80">{icon}</div>
    <div>
      <p className="font-bold text-2xl">{value}</p>
      <p className="text-sm uppercase font-semibold opacity-70 tracking-wider">{title}</p>
    </div>
  </div>
);

const PemesananDashboard = ({ isLoading, filteredAndSortedRiwayat, counts, actions, onNewOrderClick }) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
                <h2 className="text-3xl font-bold text-gray-800">Dasbor Pesanan</h2>
                <p className="text-gray-500">Selamat datang! Berikut ringkasan pesanan Anda.</p>
            </div>
            <Button size="lg" onClick={onNewOrderClick} className="w-full md:w-auto transform hover:scale-105 transition-transform duration-300">
                <PlusCircle className="mr-2 h-5 w-5" /> Buat Pesanan Baru
            </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <StatCard icon={<ClockIcon/>} title="Menunggu" value={counts.Menunggu} colorClass="bg-gradient-to-br from-yellow-400 to-orange-500 text-white" />
            <StatCard icon={<CheckCircle2/>} title="Disetujui" value={counts.Disetujui} colorClass="bg-gradient-to-br from-green-400 to-teal-500 text-white" />
            <StatCard icon={<XCircleIcon/>} title="Ditolak" value={counts.Ditolak} colorClass="bg-gradient-to-br from-red-500 to-pink-600 text-white" />
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Riwayat Pemesanan</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 pb-4 border-b border-gray-200">
                    <div className="flex gap-2">
                        <Select onValueChange={actions.setFilterStatus} defaultValue="Semua">
                            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter Status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Semua">Semua Status</SelectItem>
                                <SelectItem value="Menunggu">Menunggu</SelectItem>
                                <SelectItem value="Disetujui">Disetujui</SelectItem>
                                <SelectItem value="Ditolak">Ditolak</SelectItem>
                            </SelectContent>
                        </Select>
                         <Select onValueChange={actions.setSortOrder} defaultValue="Terbaru">
                            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Urutkan" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Terbaru">Terbaru</SelectItem>
                                <SelectItem value="Terlama">Terlama</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button variant="outline" onClick={actions.exportCSV}>
                        <Download className="mr-2 h-4 w-4" /> Export CSV
                    </Button>
                </div>
                <div className="space-y-3">
                    {isLoading ? <p className="text-center text-slate-500 py-8">Memuat data...</p> : 
                     filteredAndSortedRiwayat.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-300 w-24 h-24 mx-auto"><FileTextIcon/></div>
                            <h4 className="text-xl font-semibold text-gray-700 mt-4">Belum Ada Pesanan</h4>
                            <p className="text-gray-500">Klik "Buat Pesanan Baru" untuk memulai.</p>
                        </div>
                     ) : (
                       <AnimatePresence>
                         {filteredAndSortedRiwayat.map((item: Pemesanan, index: number) => (
                            <motion.div 
                              key={item.id} 
                              layout 
                              initial={{ opacity: 0, y: 20 }} 
                              animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05 } }}
                              exit={{ opacity: 0, x: -20 }}
                              className="border border-gray-200 p-4 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-slate-50 transition-colors"
                            >
                                <div>
                                    <p className="font-bold text-gray-800">{item.acara}</p>
                                    <p className="text-sm text-gray-500">{item.tanggal} • {item.lokasi}</p>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <span className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full ${
                                        item.status === 'Disetujui' ? 'bg-green-100 text-green-800' : 
                                        item.status === 'Ditolak' ? 'bg-red-100 text-red-800' : 
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {item.status === 'Disetujui' ? <CheckCircle2 className="w-3 h-3" /> : item.status === 'Ditolak' ? <XCircleIcon className="w-3 h-3" /> : <ClockIcon className="w-3 h-3" />}
                                        {item.status}
                                    </span>
                                    <Button variant="ghost" size="icon" onClick={() => actions.viewOrderDetails(item)}>
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                    {item.status === 'Menunggu' && (
                                        <>
                                            <Button size="sm" onClick={() => actions.updateStatus(item.id, item.acara, 'Disetujui')}>Setujui</Button>
                                            <Button variant="destructive" size="sm" onClick={() => actions.updateStatus(item.id, item.acara, 'Ditolak')}>Tolak</Button>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                         ))}
                       </AnimatePresence>
                     )
                    }
                </div>
            </CardContent>
        </Card>
    </motion.div>
  );
}

export default PemesananDashboard;

