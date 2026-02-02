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
} from '@chakra-ui/react';
import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { apiClient } from '@/services/api-client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await apiClient.request('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setIsSuccess(true);
      toast({
        title: 'Email sent',
        description: 'Check your email for password reset instructions.',
        status: 'success',
        duration: 5000,
      });
    } catch (error) {
      toast({
        title: 'Request failed',
        description: error instanceof Error ? error.message : 'Unable to process request',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="md" py={20}>
      <Card>
        <CardBody>
          <VStack spacing={6} align="stretch">
            <Heading as="h1" size="xl" textAlign="center">
              Forgot Password
            </Heading>
            <Text textAlign="center" color="gray.600" _dark={{ color: 'gray.400' }}>
              Enter your email address and we&apos;ll send you a link to reset your password.
            </Text>

            {isSuccess ? (
              <Alert status="success" borderRadius="md">
                <AlertIcon />
                <AlertDescription>
                  If an account exists with that email, you will receive password reset instructions.
                </AlertDescription>
              </Alert>
            ) : (
              <Box as="form" onSubmit={handleSubmit}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Enter your email"
                    />
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="brand"
                    width="full"
                    isLoading={isLoading}
                  >
                    Send Reset Link
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
