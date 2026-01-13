'use client';

import {
  Container,
  Heading,
  Text,
  VStack,
  Box,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  AlertDescription,
  List,
  ListItem,
  HStack,
  Badge,
} from '@chakra-ui/react';
import { useAuth } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api-client';
import { formatDistanceToNow } from '@/utils/date-utils';

export default function DashboardPage() {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => apiClient.getDashboardData(),
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project_created':
        return '📁';
      case 'message_sent':
        return '💬';
      case 'file_uploaded':
        return '📄';
      case 'member_joined':
        return '👤';
      default:
        return '•';
    }
  };

  return (
    <ProtectedRoute>
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

          {isLoading && (
            <Center py={10}>
              <Spinner size="xl" />
            </Center>
          )}

          {error && (
            <Alert status="error">
              <AlertIcon />
              <AlertDescription>
                Failed to load dashboard data. {error instanceof Error ? error.message : 'Please try again.'}
              </AlertDescription>
            </Alert>
          )}

          {data && (
            <>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                <Card>
                  <CardHeader>
                    <Heading size="md">Projects</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack align="start" spacing={2}>
                      <Text fontSize="3xl" fontWeight="bold">
                        {data.stats.projectsCount}
                      </Text>
                      <Text color="gray.600" _dark={{ color: 'gray.400' }}>
                        Total projects
                      </Text>
                      {data.stats.activeProjectsCount > 0 && (
                        <Badge colorScheme="green">
                          {data.stats.activeProjectsCount} active
                        </Badge>
                      )}
                    </VStack>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <Heading size="md">Messages</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack align="start" spacing={2}>
                      <Text fontSize="3xl" fontWeight="bold">
                        {data.stats.unreadMessagesCount}
                      </Text>
                      <Text color="gray.600" _dark={{ color: 'gray.400' }}>
                        Unread messages
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <Heading size="md">Activity</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack align="start" spacing={2}>
                      <Text fontSize="3xl" fontWeight="bold">
                        {data.recentActivities.length}
                      </Text>
                      <Text color="gray.600" _dark={{ color: 'gray.400' }}>
                        Recent activities
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              </SimpleGrid>

              <Card>
                <CardHeader>
                  <Heading size="md">Recent Activity</Heading>
                </CardHeader>
                <CardBody>
                  {data.recentActivities.length === 0 ? (
                    <Text color="gray.500" _dark={{ color: 'gray.400' }}>
                      No recent activity
                    </Text>
                  ) : (
                    <List spacing={3}>
                      {data.recentActivities.map((activity) => (
                        <ListItem key={activity.id}>
                          <HStack spacing={3} align="start">
                            <Text fontSize="xl">{getActivityIcon(activity.type)}</Text>
                            <VStack align="start" spacing={0} flex={1}>
                              <Text>{activity.description}</Text>
                              <Text fontSize="sm" color="gray.500" _dark={{ color: 'gray.400' }}>
                                {activity.userName} • {formatDistanceToNow(activity.timestamp)}
                              </Text>
                            </VStack>
                          </HStack>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </CardBody>
              </Card>
            </>
          )}
        </VStack>
      </Container>
    </ProtectedRoute>
  );
}
