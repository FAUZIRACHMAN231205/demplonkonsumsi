import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { Toaster } from "@/components/ui/toaster"; // Impor Toaster
import { PemesananProvider } from '@/context/PemesananContext'; // Import Provider
import { ThemeProvider } from "@/components/theme-provider"; // Import ThemeProvider

function MyApp({ Component, pageProps }: AppProps) {
  return (
    // Bungkus dengan ThemeProvider untuk dark mode support
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
    >
      {/* Bungkus seluruh aplikasi dengan Provider agar state bisa dibagi */}
      <PemesananProvider>
        <Component {...pageProps} />
        <Toaster /> {/* Toaster untuk menampilkan notifikasi */}
      </PemesananProvider>
    </ThemeProvider>
  );
}

export default MyApp;

