'use client';

import { useState } from 'react';
import { Box, useBreakpointValue, Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton, IconButton, useDisclosure } from '@chakra-ui/react';
import { FiMenu } from 'react-icons/fi';
import { Sidebar } from './Sidebar';
import { DashboardHeader } from './DashboardHeader';
import { ProtectedRoute } from '@/components/ProtectedRoute';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { isOpen: isMobileOpen, onOpen: onMobileOpen, onClose: onMobileClose } = useDisclosure();

    // Responsive breakpoint
    const isMobile = useBreakpointValue({ base: true, lg: false });

    const sidebarWidth = isCollapsed ? '70px' : '260px';

    return (
        <ProtectedRoute>
            <Box minH="100vh">
                {/* Desktop Sidebar */}
                {!isMobile && (
                    <Sidebar
                        isCollapsed={isCollapsed}
                        onToggle={() => setIsCollapsed(!isCollapsed)}
                    />
                )}

                {/* Mobile Sidebar Drawer */}
                {isMobile && (
                    <>
                        <IconButton
                            aria-label="Open menu"
                            icon={<FiMenu />}
                            position="fixed"
                            top={4}
                            left={4}
                            zIndex={101}
                            onClick={onMobileOpen}
                            variant="solid"
                            colorScheme="brand"
                        />
                        <Drawer
                            isOpen={isMobileOpen}
                            placement="left"
                            onClose={onMobileClose}
                            size="xs"
                        >
                            <DrawerOverlay />
                            <DrawerContent>
                                <DrawerCloseButton zIndex={102} />
                                <Sidebar isCollapsed={false} onToggle={() => { }} />
                            </DrawerContent>
                        </Drawer>
                    </>
                )}

                {/* Header */}
                <DashboardHeader sidebarWidth={isMobile ? '0px' : sidebarWidth} />

                {/* Main Content */}
                <Box
                    ml={isMobile ? 0 : sidebarWidth}
                    pt="64px"
                    minH="100vh"
                    transition="margin-left 0.2s ease"
                    p={{ base: 4, md: 6 }}
                >
                    {children}
                </Box>
            </Box>
        </ProtectedRoute>
    );
}
