import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePemesanan } from '../hooks/usePemesanan';

import PemesananDashboard from '../components/pemesanan/PemesananDashboard';
import PemesananForm from '../components/pemesanan/PemesananForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/Dialog';

export default function PemesananPage() {
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' or 'form'
  
  const {
    riwayat,
    filteredAndSortedRiwayat,
    counts,
    actions,
    selectedOrder,
    isDialogOpen,
    toast,
    isLoading
  } = usePemesanan();

  const handleStartNewOrder = () => setCurrentView('form');
  const returnToDashboard = () => setCurrentView('dashboard');

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-6xl">
        <header className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">Pemesanan Konsumsi</h1>
            <p className="text-lg text-gray-500 mt-1">Kelola semua pesanan konsumsi untuk acara Anda.</p>
        </header>
        
        {currentView === 'dashboard' ? (
          <PemesananDashboard 
            isLoading={isLoading}
            filteredAndSortedRiwayat={filteredAndSortedRiwayat}
            counts={counts}
            actions={actions}
            onNewOrderClick={handleStartNewOrder}
          />
        ) : (
          <PemesananForm 
             riwayat={riwayat}
             onFormSubmit={actions.addOrder}
             onReturnToDashboard={returnToDashboard}
          />
        )}

        <Dialog open={isDialogOpen} onOpenChange={actions.setIsDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Detail Pesanan</DialogTitle>
                </DialogHeader>
                <div className="p-6 pt-0 space-y-3">
                    {selectedOrder && Object.entries(selectedOrder).filter(([key]) => !['id', 'createdAt'].includes(key)).map(([key, val]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <strong className="capitalize font-semibold text-slate-500">{key}:</strong> 
                          <span className="text-slate-900 text-right">{String(val) || "-"}</span>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
        
        <AnimatePresence>
            {toast.show && (
                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-5 right-5 bg-slate-900 text-white p-4 rounded-lg shadow-lg z-50 w-80">
                    <p className="font-bold">{toast.title}</p>
                    <p className="text-sm text-slate-300">{toast.description}</p>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}

