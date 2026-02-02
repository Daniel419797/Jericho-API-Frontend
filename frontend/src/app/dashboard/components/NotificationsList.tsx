'use client';

import { VStack, Card, CardBody, Icon, Text, HStack, Badge } from '@chakra-ui/react';
import { FiInfo } from 'react-icons/fi';
import { formatDistanceToNow } from '@/utils/date-utils';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
}

export default function NotificationsList({ notifications }: { notifications: Notification[] }) {
    const getTypeIcon = (type: string) => {
        return FiInfo;
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'success':
                return 'green';
            case 'warning':
                return 'orange';
            case 'error':
                return 'red';
            default:
                return 'blue';
        }
    };

    return (
        <VStack spacing={4} align="stretch">
            {notifications.map((n) => (
                <Card key={n.id}>
                    <CardBody>
                        <HStack spacing={4} align="start">
                            <Icon as={getTypeIcon(n.type)} />
                            <VStack align="start" spacing={0} flex={1}>
                                <HStack justify="space-between" w="full">
                                    <Text fontWeight="semibold">{n.title}</Text>
                                    <Text fontSize="sm" color="gray.500">{formatDistanceToNow(n.timestamp)}</Text>
                                </HStack>
                                <Text color="gray.500" fontSize="sm">{n.message}</Text>
                            </VStack>
                            {!n.read && <Badge colorScheme="brand" borderRadius="full">New</Badge>}
                        </HStack>
                    </CardBody>
                </Card>
            ))}
        </VStack>
    );
}
