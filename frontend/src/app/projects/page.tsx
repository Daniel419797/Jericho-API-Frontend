'use client';

import { Container, Heading, Text, VStack, Box } from '@chakra-ui/react';

export default function ProjectsPage() {
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading as="h1" size="xl" mb={2}>
            Projects
          </Heading>
          <Text color="gray.600" _dark={{ color: 'gray.400' }}>
            Manage your projects here
          </Text>
        </Box>

        <Text>Project management functionality will be implemented here.</Text>
      </VStack>
    </Container>
  );
}
