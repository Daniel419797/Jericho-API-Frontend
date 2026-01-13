'use client';

import { Container, Heading, Text, VStack, Box } from '@chakra-ui/react';

export default function MessagingPage() {
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading as="h1" size="xl" mb={2}>
            Messaging
          </Heading>
          <Text color="gray.600" _dark={{ color: 'gray.400' }}>
            View and send messages
          </Text>
        </Box>

        <Text>Messaging functionality will be implemented here.</Text>
      </VStack>
    </Container>
  );
}
