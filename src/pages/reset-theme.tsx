import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ResetTheme() {
  const router = useRouter();

  useEffect(() => {
    // Clear theme dari localStorage
    localStorage.removeItem('theme');
    
    // Redirect ke home
    router.push('/');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Resetting theme preferences...</p>
    </div>
  );
}
