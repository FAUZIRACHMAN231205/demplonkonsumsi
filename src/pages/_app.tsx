import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { Toaster } from "@/components/ui/toaster"; // Impor Toaster

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <Toaster /> {/* Tambahkan Toaster di sini */}
    </>
  );
}

export default MyApp;
