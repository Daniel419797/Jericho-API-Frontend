'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { notificationService, Notification } from '@/services/notificationService';
import { Box, Heading, Text, Spinner, Center, Alert, AlertIcon, VStack, useColorModeValue } from '@chakra-ui/react';
import { formatDistanceToNow } from '@/utils/date-utils';

export default function NotificationDetailPage() {
    const params = useParams() as { id?: string };
    const id = params?.id;

    const { data: notification, isLoading, error } = useQuery<Notification | undefined>({
        queryKey: ['notification', id],
        queryFn: () => notificationService.getNotification(id as string),
        enabled: !!id,
    });

    if (isLoading) return <Center py={20}><Spinner size="xl" /></Center>;
    if (error) return <Alert status="error"><AlertIcon />Failed to load notification.</Alert>;
    if (!notification) return <Center py={20}><Text>Notification not found.</Text></Center>;

    const textColor = useColorModeValue('gray.600', 'gray.300');
    const mutedColor = useColorModeValue('gray.500', 'gray.400');

    return (
        <Box>
            <Heading size="lg" mb={4}>{notification.title}</Heading>
            <VStack align="start">
                <Text color={textColor}>{notification.message}</Text>
                <Text fontSize="sm" color={mutedColor}>{formatDistanceToNow(notification.timestamp)}</Text>
            </VStack>
        </Box>
    );
}
