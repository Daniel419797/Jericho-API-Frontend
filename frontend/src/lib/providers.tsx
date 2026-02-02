'use client';

import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { theme } from './theme';
import { useEffect } from 'react';
import useAuthStore from '@/stores/authStore';

export function Providers({ children }: { children: React.ReactNode }) {
  // Initialize auth store once on client mount
  useEffect(() => {
    try {
      useAuthStore.getState().init();
    } catch (e) {
      // safe noop in non-browser or test environments
    }
  }, []);

  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>{children}</ChakraProvider>
    </>
  );
}
