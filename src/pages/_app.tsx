import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { Toaster } from "@/components/ui/toaster"; // Impor Toaster
import { PemesananProvider } from '@/context/PemesananContext'; // Import Provider
import { ThemeProvider } from "@/components/theme-provider"; // Import ThemeProvider
import { Inter } from 'next/font/google';

// Gunakan Inter sebagai font utama aplikasi
const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

function MyApp({ Component, pageProps }: AppProps) {
  return (
    // Bungkus dengan ThemeProvider untuk dark mode support
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
    >
      {/* Bungkus seluruh aplikasi dengan Provider agar state bisa dibagi */}
      <div className={`${inter.variable} font-sans`}>
        <PemesananProvider>
          <Component {...pageProps} />
          <Toaster /> {/* Toaster untuk menampilkan notifikasi */}
        </PemesananProvider>
      </div>
    </ThemeProvider>
  );
}

export default MyApp;

