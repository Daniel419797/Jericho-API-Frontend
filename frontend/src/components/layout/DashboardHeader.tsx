'use client';

import {
    Box,
    Flex,
    Input,
    InputGroup,
    InputLeftElement,
    IconButton,
    Avatar,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Badge,
    HStack,
    useColorModeValue,
    Text,
} from '@chakra-ui/react';
import { FiSearch, FiBell, FiLogOut } from 'react-icons/fi';
import Link from 'next/link';
import useAuthStore from '@/stores/authStore';
import { ColorModeToggle } from '@/components/ColorModeToggle';

interface DashboardHeaderProps {
    sidebarWidth: string;
}

export function DashboardHeader({ sidebarWidth }: DashboardHeaderProps) {
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);

    const bgColor = useColorModeValue('white', 'gray.900');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <Box
            as="header"
            position="sticky"
            top={0} 
            w={{ base: '100%', lg: `calc(100% - ${sidebarWidth})` }}
            left={{ base: 0, lg: sidebarWidth }}
            right={0}
            h="64px"
            bg={bgColor}
            borderBottom="1px"
            borderColor={borderColor}
            zIndex={99}
            transition="left 0.2s ease"
        >
            <Flex h="full" align="center" justify="space-between" px={{ base: 4, md: 6 }} pl={{ base: 16, lg: 6 }}>
                {/* Search */}
                <InputGroup maxW="400px" display={{ base: 'none', md: 'block' }}>
                    <InputLeftElement pointerEvents="none">
                        <FiSearch color="gray.400" />
                    </InputLeftElement>
                    <Input
                        placeholder="Search..."
                        variant="filled"
                        borderRadius="lg"
                        _focus={{ bg: useColorModeValue('white', 'gray.800'), borderColor: 'brand.400' }}
                    />
                </InputGroup>

                {/* Right side actions */}
                <HStack spacing={3}>
                    {/* Notifications */}
                    <Box position="relative">
                        <IconButton
                            aria-label="Notifications"
                            icon={<FiBell />}
                            variant="ghost"
                            size="md"
                            borderRadius="lg"
                        />
                        <Badge
                            position="absolute"
                            top={1}
                            right={1}
                            colorScheme="red"
                            borderRadius="full"
                            fontSize="xs"
                            minW="18px"
                            h="18px"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            3
                        </Badge>
                    </Box>

                    {/* Color Mode Toggle */}
                    <ColorModeToggle />

                    {/* User Menu */}
                    <Menu>
                        <MenuButton>
                            <HStack spacing={2} cursor="pointer">
                                <Avatar size="sm" name={user?.name || user?.email} bg="brand.500" />
                                <Box display={{ base: 'none', lg: 'block' }} textAlign="left">
                                    <Text fontSize="sm" fontWeight="medium">
                                        {user?.name || 'Admin'}
                                    </Text>
                                </Box>
                            </HStack>
                        </MenuButton>
                        <MenuList>
                            <MenuItem as={Link} href="/dashboard/settings">
                                Settings
                            </MenuItem>
                            <MenuItem icon={<FiLogOut />} onClick={handleLogout}>
                                Logout
                            </MenuItem>
                        </MenuList>
                    </Menu>
                </HStack>
            </Flex>
        </Box>
    );
}
