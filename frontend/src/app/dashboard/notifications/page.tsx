 'use client';

import { Box, Heading, Text, VStack, HStack, Flex, Button, Spinner, Center, Alert, AlertIcon, useColorModeValue } from '@chakra-ui/react';
import { FiCheck } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import { notificationService, Notification } from '@/services/notificationService';
import NotificationsList from '../components/NotificationsList';

export default function NotificationsPage() {
    const { data: notifications, isLoading, error } = useQuery<Notification[]>({
        queryKey: ['notifications'],
        queryFn: () => notificationService.getNotifications(),
    });

    const unreadCount = Array.isArray(notifications) ? notifications.filter((n: any) => !n.read).length : 0;
    const mutedColor = useColorModeValue('gray.500', 'gray.400');

    return (
        <Box>
            <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'stretch', md: 'center' }} gap={4} mb={6}>
                <Box>
                    <HStack spacing={3} flexWrap="wrap">
                        <Heading as="h1" size={{ base: 'lg', md: 'xl' }}>Notifications</Heading>
                        {unreadCount > 0 && (
                            <Text color="red.500">{unreadCount} new</Text>
                        )}
                    </HStack>
                    <Text color={mutedColor} mt={2} fontSize={{ base: 'sm', md: 'md' }}>Stay updated with your account activity</Text>
                </Box>
                <Button leftIcon={<FiCheck />} variant="outline" w={{ base: 'full', md: 'auto' }}>Mark All as Read</Button>
            </Flex>

            {isLoading && (
                <Center py={20}><Spinner size="xl" /></Center>
            )}

            {error && (
                <Alert status="error"><AlertIcon />Failed to load notifications.</Alert>
            )}

            {notifications && Array.isArray(notifications) && (
                <NotificationsList notifications={notifications} />
            )}
        </Box>
    );
}
