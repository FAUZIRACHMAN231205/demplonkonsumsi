import React, { createContext, useContext, ReactNode } from 'react';
import { usePemesanan, type UsePemesananReturn } from '@/hooks/usePemesanan';
import type { StorageAdapter } from '@/lib/storage';

// Gunakan tipe yang diekspor dari hook untuk memastikan konsistensi tipe
type PemesananContextType = UsePemesananReturn;


// Buat Context dengan nilai awal undefined (atau nilai default jika perlu)
const PemesananContext = createContext<PemesananContextType | undefined>(undefined);

// Buat Provider Component
interface PemesananProviderProps {
  children: ReactNode;
  /** Optional storage adapter to override default localStorage-based adapter */
  storageAdapter?: StorageAdapter;
}

export const PemesananProvider: React.FC<PemesananProviderProps> = ({ children, storageAdapter }) => {
  // Panggil hook usePemesanan di dalam Provider dan injeksikan adapter bila diberikan
  const pemesananState = usePemesanan(storageAdapter);

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

