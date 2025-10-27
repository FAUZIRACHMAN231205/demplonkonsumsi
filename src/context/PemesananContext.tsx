import React, { createContext, useContext, ReactNode } from 'react';
import { usePemesanan } from '@/hooks/usePemesanan'; // Pastikan path ini benar

// Tipe nilai yang akan disediakan oleh context
// Ambil tipe return dari usePemesanan, tapi hapus 'showToast' dari 'actions'
type UsePemesananReturnType = ReturnType<typeof usePemesanan>;
type PemesananContextType = Omit<UsePemesananReturnType, 'actions'> & {
  actions: Omit<UsePemesananReturnType['actions'], 'showToast'>; // Hapus showToast dari tipe actions
};


// Buat Context dengan nilai awal undefined (atau nilai default jika perlu)
const PemesananContext = createContext<PemesananContextType | undefined>(undefined);

// Buat Provider Component
interface PemesananProviderProps {
  children: ReactNode;
}

export const PemesananProvider: React.FC<PemesananProviderProps> = ({ children }) => {
  // Panggil hook usePemesanan di dalam Provider
  const pemesananState = usePemesanan();

  // Sediakan state dan actions dari hook melalui Context Provider
  return (
    <PemesananContext.Provider value={pemesananState}>
      {children}
    </PemesananContext.Provider>
  );
};

// Buat custom hook untuk menggunakan context ini
export const useSharedPemesanan = () => {
  const context = useContext(PemesananContext);
  if (context === undefined) {
    throw new Error('useSharedPemesanan must be used within a PemesananProvider');
  }
  return context;
};

