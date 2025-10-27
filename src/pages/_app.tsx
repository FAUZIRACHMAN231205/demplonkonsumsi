import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { Toaster } from "@/components/ui/toaster"; // Impor Toaster
import { PemesananProvider } from '@/context/PemesananContext'; // Import Provider

function MyApp({ Component, pageProps }: AppProps) {
  return (
    // Bungkus seluruh aplikasi dengan Provider agar state bisa dibagi
    <PemesananProvider>
      <Component {...pageProps} />
      <Toaster /> {/* Toaster untuk menampilkan notifikasi */}
    </PemesananProvider>
  );
}

export default MyApp;

