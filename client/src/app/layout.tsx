import type { Metadata } from 'next';
import '../App.css';

export const metadata: Metadata = {
  title: 'Habit Tracker',
  description: 'Track your habits and achieve your goals',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
} 