'use client';

import { Container, Heading, Text, VStack, Box, SimpleGrid, Card, CardHeader, CardBody } from '@chakra-ui/react';
import { useAuth } from '@/contexts/auth-context';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading as="h1" size="xl" mb={2}>
            Dashboard
          </Heading>
          <Text color="gray.600" _dark={{ color: 'gray.400' }}>
            Welcome back, {user?.name}!
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          <Card>
            <CardHeader>
              <Heading size="md">Projects</Heading>
            </CardHeader>
            <CardBody>
              <Text>You have 0 projects</Text>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <Heading size="md">Messages</Heading>
            </CardHeader>
            <CardBody>
              <Text>You have 0 messages</Text>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <Heading size="md">Activity</Heading>
            </CardHeader>
            <CardBody>
              <Text>No recent activity</Text>
            </CardBody>
          </Card>
        </SimpleGrid>
      </VStack>
    </Container>
  );
}
