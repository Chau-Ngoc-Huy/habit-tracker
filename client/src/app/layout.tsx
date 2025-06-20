import Providers from '@/store/providers/Providers';
import '@/styles/globals.css';

export const metadata = {
  title: 'Habit Tracker',
  description: 'Track your habits and goals',
  icons: {
    icon: '/hg2.png'
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
} 