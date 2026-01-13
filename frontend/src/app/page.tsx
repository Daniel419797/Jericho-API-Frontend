'use client';

import { Container, Heading, Text, Button, VStack } from '@chakra-ui/react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <Container maxW="container.xl" py={20}>
      <VStack spacing={8} align="center" textAlign="center">
        <Heading as="h1" size="2xl">
          Welcome to Jericho API Frontend
        </Heading>
        <Text fontSize="xl" color="gray.600" _dark={{ color: 'gray.400' }}>
          A production-ready Next.js application with authentication, API integration, and modern UI.
        </Text>
        {!isAuthenticated ? (
          <Button as={Link} href="/auth/login" colorScheme="brand" size="lg">
            Get Started
          </Button>
        ) : (
          <Button as={Link} href="/dashboard" colorScheme="brand" size="lg">
            Go to Dashboard
          </Button>
        )}
      </VStack>
    </Container>
  );
}
