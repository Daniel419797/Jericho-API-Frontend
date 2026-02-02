'use client';

import {
    Box,
    Flex,
    VStack,
    Text,
    Icon,
    IconButton,
    Tooltip,
    Divider,
    Avatar,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    useColorModeValue,
    Collapse,
} from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight, FiLogOut } from 'react-icons/fi';
import Link from 'next/link';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { sidebarNavSections, NavItem } from '@/lib/nav-config';
import useAuthStore from '@/stores/authStore';

interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
    const pathname = usePathname();
    // subscribe to store values with separate selectors to avoid
    // creating a new object reference on every render which could
    // unstable-ly change the `init` function identity and retrigger
    // the effect repeatedly.
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);
    const init = useAuthStore((s) => s.init);

    // initialize auth store once when Sidebar mounts
    useEffect(() => {
        init();
    }, [init]);

    // Colors
    const bgColor = useColorModeValue('white', 'gray.900');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const textColor = useColorModeValue('gray.600', 'gray.400');
    const activeColor = useColorModeValue('brand.500', 'brand.400');
    const activeBg = useColorModeValue('brand.50', 'rgba(33, 150, 243, 0.1)');
    const hoverBg = useColorModeValue('gray.100', 'gray.800');
    const sectionTitleColor = useColorModeValue('gray.500', 'gray.500');

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const isProbablyId = (s?: string) => {
        if (!s) return false;
        // UUID-like or long hex strings
        return /^[0-9a-fA-F-]{8,}$/.test(s) || s.includes('-') && s.length >= 16;
    };

    const displayName = user ? (user.name && !isProbablyId(user.name) ? user.name : (user.email && user.email.includes('@') ? user.email.split('@')[0] : 'Admin User')) : 'Admin User';
    const displayEmail = user?.email && user.email.includes('@') ? user.email : '';

    return (
        <Box
            as="nav"
            position="fixed"
            left={0}
            top={0}
            h="100vh"
            w={isCollapsed ? '70px' : '260px'}
            bg={bgColor}
            borderRight="1px"
            borderColor={borderColor}
            transition="width 0.2s ease"
            zIndex={100}
            display="flex"
            flexDirection="column"
            boxShadow="sm"
        >
            {/* Logo / Brand */}
            <Flex
                h="64px"
                align="center"
                justify={isCollapsed ? 'center' : 'space-between'}
                px={isCollapsed ? 2 : 4}
                borderBottom="1px"
                borderColor={borderColor}
            >
                <Collapse in={!isCollapsed} animateOpacity>
                    <Text
                        fontSize="xl"
                        fontWeight="bold"
                        bgGradient="linear(to-r, brand.400, brand.600)"
                        bgClip="text"
                    >
                        Jericho Admin
                    </Text>
                </Collapse>
                <IconButton
                    aria-label="Toggle sidebar"
                    icon={isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
                    variant="ghost"
                    size="sm"
                    onClick={onToggle}
                />
            </Flex>

            {/* Navigation */}
            <VStack
                flex={1}
                overflowY="auto"
                spacing={1}
                align="stretch"
                py={4}
                px={isCollapsed ? 2 : 3}
                css={{
                    '&::-webkit-scrollbar': { width: '4px' },
                    '&::-webkit-scrollbar-thumb': { background: '#888', borderRadius: '4px' },
                }}
            >
                {sidebarNavSections.map((section, sectionIdx) => (
                    <Box key={section.title} mb={4}>
                        {!isCollapsed && (
                            <Text
                                fontSize="xs"
                                fontWeight="semibold"
                                textTransform="uppercase"
                                letterSpacing="wider"
                                color={sectionTitleColor}
                                px={3}
                                mb={2}
                            >
                                {section.title}
                            </Text>
                        )}
                        {isCollapsed && sectionIdx > 0 && (
                            <Divider mb={2} />
                        )}
                        <VStack spacing={1} align="stretch">
                            {section.items.map((item: NavItem) => {
                                const active = isActive(item.href);
                                return (
                                    <Tooltip
                                        key={item.href}
                                        label={item.label}
                                        placement="right"
                                        isDisabled={!isCollapsed}
                                        hasArrow
                                    >
                                        <Link href={item.href} style={{ textDecoration: 'none' }}>
                                            <Flex
                                                align="center"
                                                px={3}
                                                py={2.5}
                                                borderRadius="lg"
                                                cursor="pointer"
                                                bg={active ? activeBg : 'transparent'}
                                                color={active ? activeColor : textColor}
                                                fontWeight={active ? 'semibold' : 'medium'}
                                                _hover={{ bg: active ? activeBg : hoverBg }}
                                                transition="all 0.15s ease"
                                                justify={isCollapsed ? 'center' : 'flex-start'}
                                            >
                                                <Icon
                                                    as={item.icon}
                                                    boxSize={5}
                                                    mr={isCollapsed ? 0 : 3}
                                                />
                                                {!isCollapsed && (
                                                    <Text fontSize="sm">{item.label}</Text>
                                                )}
                                            </Flex>
                                        </Link>
                                    </Tooltip>
                                );
                            })}
                        </VStack>
                    </Box>
                ))}
            </VStack>

            {/* User Section */}
            <Box
                borderTop="1px"
                borderColor={borderColor}
                p={isCollapsed ? 2 : 4}
            >
                <Menu placement="top-start">
                    <MenuButton
                        as={Flex}
                        align="center"
                        cursor="pointer"
                        p={2}
                        borderRadius="lg"
                        _hover={{ bg: hoverBg }}
                        transition="all 0.15s ease"
                        justify={isCollapsed ? 'center' : 'flex-start'}
                    >
                        <Avatar
                            size="sm"
                            name={displayName}
                            bg="brand.500"
                        />
                        {!isCollapsed && (
                            <Box ml={3} textAlign="left">
                                <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                                    {displayName}
                                </Text>
                                <Text fontSize="xs" color={textColor} noOfLines={1}>
                                    {displayEmail}
                                </Text>
                            </Box>
                        )}
                    </MenuButton>
                    <MenuList>
                        <MenuItem as={Link} href="/settings">
                            Settings
                        </MenuItem>
                        <MenuItem icon={<FiLogOut />} onClick={handleLogout}>
                            Logout
                        </MenuItem>
                    </MenuList>
                </Menu>
            </Box>
        </Box>
    );
}
