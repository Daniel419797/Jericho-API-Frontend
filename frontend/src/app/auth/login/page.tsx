'use client';

import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  VStack,
  Text,
  useToast,
  Card,
  CardBody,
  Badge,
} from '@chakra-ui/react';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useAuthStore from '@/stores/authStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const adminLogin = useAuthStore((s) => s.adminLogin);
  const router = useRouter();
  const toast = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await adminLogin({ email, password });
      toast({
        title: 'Admin login successful',
        status: 'success',
        duration: 3000,
      });
      router.push('/dashboard');
    } catch (error) {
      toast({
        title: 'Admin login failed',
        description: error instanceof Error ? error.message : 'Invalid credentials or not authorized',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="md" py={{ base: 10, md: 20 }} px={{ base: 4, md: 6 }}>
      <Card>
        <CardBody p={{ base: 4, md: 6 }}>
          <VStack spacing={6} align="stretch">
            <Box textAlign="center">
              <Badge colorScheme="purple" fontSize="sm" mb={2}>
                Admin Portal
              </Badge>
              <Heading as="h1" size={{ base: 'lg', md: 'xl' }}>
                Admin Login
              </Heading>
            </Box>
            <Text textAlign="center" color="gray.600" _dark={{ color: 'gray.400' }} fontSize={{ base: 'sm', md: 'md' }}>
              Sign in with your admin credentials
            </Text>

            <Box as="form" onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    data-testid="email-input"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your admin email"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Password</FormLabel>
                  <Input
                    type="password"
                    data-testid="password-input"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="purple"
                  width="full"
                  isLoading={isLoading}
                  data-testid="login-button"
                >
                  Sign In as Admin
                </Button>

                <Text textAlign="center" fontSize="sm" color="gray.500">
                  <Link href="/auth/forgot-password" style={{ color: 'var(--chakra-colors-brand-500)' }}>
                    Forgot your password?
                  </Link>
                </Text>
              </VStack>
            </Box>
          </VStack>
        </CardBody>
      </Card>
    </Container>
  );
}
