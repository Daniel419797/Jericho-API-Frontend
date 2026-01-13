'use client';

import {
  Box,
  Flex,
  HStack,
  Link as ChakraLink,
  Container,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { ColorModeToggle } from './ColorModeToggle';

export function NavBar() {
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Box bg="white" _dark={{ bg: 'gray.800' }} px={4} shadow="sm">
      <Container maxW="container.xl">
        <Flex h={16} alignItems="center" justifyContent="space-between">
          <HStack spacing={8} alignItems="center">
            <ChakraLink
              as={Link}
              href="/"
              fontSize="xl"
              fontWeight="bold"
              _hover={{ textDecoration: 'none' }}
            >
              Jericho API
            </ChakraLink>

            {isAuthenticated && (
              <HStack as="nav" spacing={4} display={{ base: 'none', md: 'flex' }}>
                <ChakraLink as={Link} href="/dashboard">
                  Dashboard
                </ChakraLink>
                <ChakraLink as={Link} href="/projects">
                  Projects
                </ChakraLink>
                <ChakraLink as={Link} href="/messaging">
                  Messaging
                </ChakraLink>
                <ChakraLink as={Link} href="/admin">
                  Admin
                </ChakraLink>
              </HStack>
            )}
          </HStack>

          <HStack spacing={4}>
            <ColorModeToggle />

            {isAuthenticated ? (
              <Menu>
                <MenuButton as={Button} variant="ghost" rightIcon={<ChevronDownIcon />}>
                  <HStack>
                    <Avatar size="sm" name={user?.name} />
                  </HStack>
                </MenuButton>
                <MenuList>
                  <MenuItem as={Link} href="/settings">
                    Settings
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <Button as={Link} href="/auth/login" colorScheme="brand">
                Login
              </Button>
            )}
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}
