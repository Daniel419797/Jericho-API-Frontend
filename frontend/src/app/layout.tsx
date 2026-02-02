import type { Metadata } from 'next';
import { Providers } from '@/lib/providers';
import { ReactQueryProvider } from '@/lib/react-query-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Jericho Admin Dashboard',
  description: 'Admin dashboard for Jericho API',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ReactQueryProvider>
          <Providers>
            {children}
          </Providers>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
