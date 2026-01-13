import type { Metadata } from 'next';
import { Providers } from '@/lib/providers';
import { ReactQueryProvider } from '@/lib/react-query-provider';
import { AuthProvider } from '@/contexts/auth-context';
import { NavBar } from '@/components/NavBar';
import { Box } from '@chakra-ui/react';

export const metadata: Metadata = {
  title: 'Jericho API Frontend',
  description: 'Frontend application for Jericho API',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ReactQueryProvider>
          <Providers>
            <AuthProvider>
              <NavBar />
              <Box as="main" minH="calc(100vh - 64px)">
                {children}
              </Box>
            </AuthProvider>
          </Providers>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
