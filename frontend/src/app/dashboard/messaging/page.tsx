'use client';

import {
    Box,
    Heading,
    Text,
    VStack,
    HStack,
    Flex,
    Card,
    CardBody,
    InputGroup,
    InputLeftElement,
    Input,
    Avatar,
    useColorModeValue,
    Badge,
    Icon,
    Divider,
} from '@chakra-ui/react';
import { FiSearch, FiMessageSquare, FiUsers } from 'react-icons/fi';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { messagingService } from '@/services/messagingService';
import { Channel } from '@/types/message';
import { formatDistanceToNow } from '@/utils/date-utils';

export default function MessagingPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const hoverBg = useColorModeValue('gray.50', 'gray.700');
    const selectedBg = useColorModeValue('brand.50', 'rgba(33, 150, 243, 0.15)');
    const mutedColor = useColorModeValue('gray.500', 'gray.400');
    const subtleColor = useColorModeValue('gray.300', 'gray.600');

    const { data: channels } = useQuery<Channel[]>({
        queryKey: ['messaging-channels'],
        queryFn: () => messagingService.getChannels(),
    });

    const filteredChannels = channels?.filter(channel =>
        channel.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedChannelData = channels?.find(c => c.id === selectedChannel);

    return (
        <Box>
            {/* Page Header */}
            <Box mb={6}>
                <Heading as="h1" size={{ base: 'lg', md: 'xl' }} mb={2}>
                    Messaging
                </Heading>
                <Text color={mutedColor} fontSize={{ base: 'sm', md: 'md' }}>
                    Real-time messaging and chat channels
                </Text>
            </Box>

            <Flex direction={{ base: 'column', lg: 'row' }} gap={6} h={{ base: 'auto', lg: 'calc(100vh - 220px)' }}>
                {/* Channels List */}
                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} w={{ base: 'full', lg: '350px' }} flexShrink={0}>
                    <CardBody p={0}>
                        <VStack align="stretch" spacing={0}>
                            {/* Search */}
                            <Box p={4} borderBottom="1px" borderColor={borderColor}>
                                <InputGroup>
                                    <InputLeftElement pointerEvents="none">
                                        <FiSearch color="gray" />
                                    </InputLeftElement>
                                    <Input
                                        placeholder="Search channels..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        variant="filled"
                                    />
                                </InputGroup>
                            </Box>

                            {/* Channel List */}
                            <VStack
                                align="stretch"
                                spacing={0}
                                overflowY="auto"
                                maxH={{ base: '300px', lg: 'calc(100vh - 340px)' }}
                            >
                                {filteredChannels?.map((channel) => (
                                    <HStack
                                        key={channel.id}
                                        p={4}
                                        cursor="pointer"
                                        bg={selectedChannel === channel.id ? selectedBg : 'transparent'}
                                        _hover={{ bg: selectedChannel === channel.id ? selectedBg : hoverBg }}
                                        transition="all 0.15s ease"
                                        onClick={() => setSelectedChannel(channel.id)}
                                        spacing={3}
                                    >
                                        <Avatar size="md" name={channel.name} bg="brand.500" />
                                        <VStack align="start" spacing={0} flex={1} minW={0}>
                                            <HStack justify="space-between" w="full">
                                                <Text fontWeight="medium" noOfLines={1}>{channel.name}</Text>
                                                <Text fontSize="xs" color={mutedColor}>
                                                    {channel.lastMessageAt && formatDistanceToNow(channel.lastMessageAt)}
                                                </Text>
                                            </HStack>
                                            <Text fontSize="sm" color={mutedColor} noOfLines={1}>
                                                {channel.description || 'No description'}
                                            </Text>
                                        </VStack>
                                        {channel.unreadCount > 0 && (
                                            <Badge colorScheme="brand" borderRadius="full">
                                                {channel.unreadCount}
                                            </Badge>
                                        )}
                                    </HStack>
                                ))}

                                {(!filteredChannels || filteredChannels.length === 0) && (
                                    <VStack py={10} spacing={3}>
                                        <Icon as={FiUsers} boxSize={8} color={mutedColor} />
                                        <Text color={mutedColor} fontSize="sm">No channels yet</Text>
                                    </VStack>
                                )}
                            </VStack>
                        </VStack>
                    </CardBody>
                </Card>

                {/* Chat Area */}
                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} flex={1}>
                    <CardBody>
                        {selectedChannelData ? (
                            <VStack align="stretch" h="full">
                                {/* Chat Header */}
                                <HStack justify="space-between" pb={4} borderBottom="1px" borderColor={borderColor}>
                                    <HStack spacing={3}>
                                        <Avatar size="sm" name={selectedChannelData.name} bg="brand.500" />
                                        <VStack align="start" spacing={0}>
                                            <Text fontWeight="medium">
                                                {selectedChannelData.name}
                                            </Text>
                                            <Text fontSize="xs" color={mutedColor}>
                                                {selectedChannelData.description || 'No description'}
                                            </Text>
                                        </VStack>
                                    </HStack>
                                </HStack>

                                {/* Messages Area */}
                                <VStack flex={1} align="center" justify="center" spacing={4}>
                                    <Icon as={FiMessageSquare} boxSize={12} color={subtleColor} />
                                    <Text color={mutedColor}>Messages will appear here</Text>
                                </VStack>

                                {/* Input Area */}
                                <Divider />
                                <InputGroup pt={4}>
                                    <Input placeholder="Type a message..." variant="filled" />
                                </InputGroup>
                            </VStack>
                        ) : (
                            <VStack h="full" justify="center" spacing={4}>
                                <Icon as={FiMessageSquare} boxSize={16} color={subtleColor} />
                                <Text color={mutedColor} fontSize="lg">Select a channel to start messaging</Text>
                            </VStack>
                        )}
                    </CardBody>
                </Card>
            </Flex>
        </Box>
    );
}