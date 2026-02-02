"use client";

import {
    Box,
    Heading,
    Text,
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
    VStack,
    Badge,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatArrow,
    Icon,
    useColorModeValue,
} from '@chakra-ui/react';
import { FiFolder, FiUsers, FiMessageSquare, FiActivity, FiTrendingUp } from 'react-icons/fi';
import useAuthStore from '@/stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboardService';
import { formatDistanceToNow } from '@/utils/date-utils';

export default function DashboardPage() {
    const user = useAuthStore((s) => s.user);

    const { data, isLoading, error } = useQuery({
        queryKey: ['dashboard'],
        queryFn: () => dashboardService.getDashboardData(),
    });

    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const activityBg = useColorModeValue('gray.50', 'gray.700');
    const mutedColor = useColorModeValue('gray.500', 'gray.400');

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
        <Box>
            {/* Page Header */}
            <Box mb={8}>
                <Heading as="h1" size={{ base: 'lg', md: 'xl' }} mb={2}>
                    Dashboard
                </Heading>
                <Text color={mutedColor} fontSize={{ base: 'sm', md: 'md' }}>
                    Welcome back, {user?.name || 'Admin'}! Here&apos;s what&apos;s happening.
                </Text>
            </Box>

            {isLoading && (
                <Center py={20}>
                    <Spinner size="xl" color="brand.500" thickness="4px" />
                </Center>
            )}

            {error && (
                <Alert status="error" borderRadius="lg">
                    <AlertIcon />
                    <AlertDescription>
                        Failed to load dashboard data. {error instanceof Error ? error.message : 'Please try again.'}
                    </AlertDescription>
                </Alert>
            )}

            {data && (
                <VStack spacing={6} align="stretch">
                    {/* Stats Cards */}
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                            <CardBody>
                                <HStack spacing={4}>
                                    <Box
                                        p={3}
                                        borderRadius="lg"
                                        bg="brand.50"
                                        _dark={{ bg: 'rgba(33, 150, 243, 0.15)' }}
                                    >
                                        <Icon as={FiFolder} boxSize={6} color="brand.500" />
                                    </Box>
                                    <Stat>
                                        <StatLabel color={mutedColor}>Projects</StatLabel>
                                        <StatNumber fontSize="2xl">{data.stats.projectsCount}</StatNumber>
                                        {data.stats.activeProjectsCount > 0 && (
                                            <StatHelpText mb={0}>
                                                <StatArrow type="increase" />
                                                {data.stats.activeProjectsCount} active
                                            </StatHelpText>
                                        )}
                                    </Stat>
                                </HStack>
                            </CardBody>
                        </Card>

                        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                            <CardBody>
                                <HStack spacing={4}>
                                    <Box
                                        p={3}
                                        borderRadius="lg"
                                        bg="green.50"
                                        _dark={{ bg: 'rgba(72, 187, 120, 0.15)' }}
                                    >
                                        <Icon as={FiUsers} boxSize={6} color="green.500" />
                                    </Box>
                                    <Stat>
                                        <StatLabel color={mutedColor}>Users</StatLabel>
                                        <StatNumber fontSize="2xl">{data.stats.usersCount || 0}</StatNumber>
                                        <StatHelpText mb={0}>
                                            <StatArrow type="increase" />
                                            12% this month
                                        </StatHelpText>
                                    </Stat>
                                </HStack>
                            </CardBody>
                        </Card>

                        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                            <CardBody>
                                <HStack spacing={4}>
                                    <Box
                                        p={3}
                                        borderRadius="lg"
                                        bg="purple.50"
                                        _dark={{ bg: 'rgba(159, 122, 234, 0.15)' }}
                                    >
                                        <Icon as={FiMessageSquare} boxSize={6} color="purple.500" />
                                    </Box>
                                    <Stat>
                                        <StatLabel color={mutedColor}>Messages</StatLabel>
                                        <StatNumber fontSize="2xl">{data.stats.unreadMessagesCount}</StatNumber>
                                        <StatHelpText mb={0} color="orange.500">
                                            {data.stats.unreadMessagesCount} unread
                                        </StatHelpText>
                                    </Stat>
                                </HStack>
                            </CardBody>
                        </Card>

                        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                            <CardBody>
                                <HStack spacing={4}>
                                    <Box
                                        p={3}
                                        borderRadius="lg"
                                        bg="orange.50"
                                        _dark={{ bg: 'rgba(237, 137, 54, 0.15)' }}
                                    >
                                        <Icon as={FiTrendingUp} boxSize={6} color="orange.500" />
                                    </Box>
                                    <Stat>
                                        <StatLabel color={mutedColor}>API Requests</StatLabel>
                                        <StatNumber fontSize="2xl">{data.stats.apiRequestsCount || '12.5K'}</StatNumber>
                                        <StatHelpText mb={0}>
                                            <StatArrow type="increase" />
                                            8% vs last week
                                        </StatHelpText>
                                    </Stat>
                                </HStack>
                            </CardBody>
                        </Card>
                    </SimpleGrid>

                    {/* Recent Activity */}
                    <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                        <CardHeader pb={0}>
                            <HStack>
                                <Icon as={FiActivity} color="brand.500" />
                                <Heading size="md">Recent Activity</Heading>
                            </HStack>
                        </CardHeader>
                        <CardBody>
                            {data.recentActivities.length === 0 ? (
                                <Text color={mutedColor}>No recent activity</Text>
                            ) : (
                                <List spacing={4}>
                                    {data.recentActivities.map((activity) => (
                                        <ListItem
                                            key={activity.id}
                                            p={3}
                                            borderRadius="lg"
                                            bg={activityBg}
                                        >
                                            <HStack spacing={3} align="start">
                                                <Text fontSize="xl">{getActivityIcon(activity.type)}</Text>
                                                <VStack align="start" spacing={0} flex={1}>
                                                    <Text fontWeight="medium">{activity.description}</Text>
                                                    <Text fontSize="sm" color={mutedColor}>
                                                        {activity.userName} • {formatDistanceToNow(activity.timestamp)}
                                                    </Text>
                                                </VStack>
                                                <Badge colorScheme="brand" variant="subtle">
                                                    {activity.type.replace('_', ' ')}
                                                </Badge>
                                            </HStack>
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </CardBody>
                    </Card>
                </VStack>
            )}
        </Box>
    );
}
