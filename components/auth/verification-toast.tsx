'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';

export default function VerificationToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const toastShown = useRef(false);

  useEffect(() => {
    if (searchParams.get('verified') === 'true' && !toastShown.current) {
      toastShown.current = true;
      toast.success('Email verified successfully! Welcome to your dashboard.', {
        id: 'email-verified-toast',
      });

      // Clean up the verified query parameter without re-rendering or refreshing
      const params = new URLSearchParams(searchParams.toString());
      params.delete('verified');
      const newQuery = params.toString() ? `?${params.toString()}` : '';
      router.replace(`${pathname}${newQuery}`, { scroll: false });
    }
  }, [searchParams, pathname, router]);

  return null;
}
