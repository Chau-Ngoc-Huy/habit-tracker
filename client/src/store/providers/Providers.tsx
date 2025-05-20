'use client';

import { AuthProvider } from '@/store/providers/AuthProviders';

export default function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
} 