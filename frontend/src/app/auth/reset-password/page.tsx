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
  Alert,
  AlertIcon,
  AlertDescription,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { useState, FormEvent, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/services/api-client';

function ResetPasswordContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        status: 'error',
        duration: 4000,
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 8 characters',
        status: 'error',
        duration: 4000,
      });
      return;
    }

    if (!token) {
      toast({
        title: 'Invalid reset link',
        description: 'No reset token found. Please request a new password reset.',
        status: 'error',
        duration: 5000,
      });
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.request('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });
      setIsSuccess(true);
      toast({
        title: 'Password reset successful',
        description: 'Your password has been updated. You can now sign in.',
        status: 'success',
        duration: 5000,
      });
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (error) {
      toast({
        title: 'Reset failed',
        description: error instanceof Error ? error.message : 'Unable to reset password',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <Container maxW="md" py={20}>
        <Card>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <AlertDescription>
                  Invalid or missing reset token. Please request a new password reset.
                </AlertDescription>
              </Alert>
              <Link href="/auth/forgot-password">
                <Button colorScheme="brand" width="full">
                  Request New Reset Link
                </Button>
              </Link>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxW="md" py={20}>
      <Card>
        <CardBody>
          <VStack spacing={6} align="stretch">
            <Heading as="h1" size="xl" textAlign="center">
              Reset Password
            </Heading>
            <Text textAlign="center" color="gray.600" _dark={{ color: 'gray.400' }}>
              Enter your new password below.
            </Text>

            {isSuccess ? (
              <Alert status="success" borderRadius="md">
                <AlertIcon />
                <AlertDescription>
                  Password reset successful! Redirecting to login...
                </AlertDescription>
              </Alert>
            ) : (
              <Box as="form" onSubmit={handleSubmit}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>New Password</FormLabel>
                    <Input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Confirm Password</FormLabel>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="brand"
                    width="full"
                    isLoading={isLoading}
                  >
                    Reset Password
                  </Button>
                </VStack>
              </Box>
            )}

            <Text textAlign="center" fontSize="sm" color="gray.500" _dark={{ color: 'gray.400' }}>
              Remember your password?{' '}
              <Link href="/auth/login" style={{ color: 'var(--chakra-colors-brand-500)' }}>
                Sign in
              </Link>
            </Text>
          </VStack>
        </CardBody>
      </Card>
    </Container>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <Container maxW="md" py={20}>
        <Center>
          <Spinner size="xl" />
        </Center>
      </Container>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
