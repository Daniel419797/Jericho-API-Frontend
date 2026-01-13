'use client';

import {
  Container,
  Heading,
  Text,
  VStack,
  Box,
  HStack,
  Card,
  CardBody,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  AlertDescription,
  Input,
  Button,
  Avatar,
  Badge,
  Textarea,
  Divider,
} from '@chakra-ui/react';
import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api-client';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { formatDateTime } from '@/utils/date-utils';
import { AttachmentIcon } from '@chakra-ui/icons';

export default function MessagingPage() {
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const {
    data: channels,
    isLoading: channelsLoading,
    error: channelsError,
  } = useQuery({
    queryKey: ['channels'],
    queryFn: () => apiClient.getChannels(),
  });

  const {
    data: messages,
    isLoading: messagesLoading,
    error: messagesError,
  } = useQuery({
    queryKey: ['messages', selectedChannelId],
    queryFn: () =>
      selectedChannelId
        ? apiClient.getMessages({ channelId: selectedChannelId, limit: 50 })
        : Promise.resolve(null),
    enabled: !!selectedChannelId,
    refetchInterval: 5000, // Poll for new messages every 5 seconds
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data: { channelId: string; content: string }) =>
      apiClient.sendMessage({ channelId: data.channelId, content: data.content }),
    onSuccess: () => {
      setMessageContent('');
      queryClient.invalidateQueries({ queryKey: ['messages', selectedChannelId] });
    },
  });

  useEffect(() => {
    if (channels && channels.length > 0 && !selectedChannelId) {
      setSelectedChannelId(channels[0].id);
    }
  }, [channels, selectedChannelId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (messageContent.trim() && selectedChannelId) {
      sendMessageMutation.mutate({
        channelId: selectedChannelId,
        content: messageContent,
      });
    }
  };

  const selectedChannel = channels?.find((c) => c.id === selectedChannelId);

  return (
    <ProtectedRoute>
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

          <HStack align="stretch" spacing={4} h="600px">
            {/* Channels List */}
            <Card flex="0 0 250px">
              <CardBody>
                <VStack align="stretch" spacing={2}>
                  <Heading size="sm" mb={2}>
                    Channels
                  </Heading>
                  {channelsLoading && (
                    <Center py={4}>
                      <Spinner />
                    </Center>
                  )}
                  {channelsError && (
                    <Alert status="error" size="sm">
                      <AlertIcon />
                      <Text fontSize="sm">Failed to load</Text>
                    </Alert>
                  )}
                  {channels && channels.length === 0 && (
                    <Text fontSize="sm" color="gray.500" _dark={{ color: 'gray.400' }}>
                      No channels yet
                    </Text>
                  )}
                  {channels?.map((channel) => (
                    <Box
                      key={channel.id}
                      p={3}
                      borderRadius="md"
                      cursor="pointer"
                      bg={selectedChannelId === channel.id ? 'brand.50' : 'transparent'}
                      _dark={{
                        bg: selectedChannelId === channel.id ? 'brand.900' : 'transparent',
                      }}
                      _hover={{
                        bg: selectedChannelId === channel.id ? 'brand.50' : 'gray.50',
                        _dark: {
                          bg: selectedChannelId === channel.id ? 'brand.900' : 'gray.700',
                        },
                      }}
                      onClick={() => setSelectedChannelId(channel.id)}
                    >
                      <HStack justify="space-between">
                        <VStack align="start" spacing={0} flex={1}>
                          <Text fontWeight="medium" noOfLines={1}>
                            {channel.name}
                          </Text>
                          {channel.description && (
                            <Text fontSize="xs" color="gray.500" _dark={{ color: 'gray.400' }} noOfLines={1}>
                              {channel.description}
                            </Text>
                          )}
                        </VStack>
                        {channel.unreadCount > 0 && <Badge colorScheme="red">{channel.unreadCount}</Badge>}
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              </CardBody>
            </Card>

            {/* Messages */}
            <Card flex={1}>
              <CardBody display="flex" flexDirection="column" p={0}>
                {!selectedChannelId ? (
                  <Center flex={1}>
                    <Text color="gray.500" _dark={{ color: 'gray.400' }}>
                      Select a channel to view messages
                    </Text>
                  </Center>
                ) : (
                  <>
                    {/* Channel Header */}
                    <Box p={4} borderBottom="1px" borderColor="gray.200" _dark={{ borderColor: 'gray.700' }}>
                      <Heading size="md">{selectedChannel?.name}</Heading>
                      {selectedChannel?.description && (
                        <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                          {selectedChannel.description}
                        </Text>
                      )}
                    </Box>

                    {/* Messages List */}
                    <Box flex={1} overflowY="auto" p={4}>
                      {messagesLoading && (
                        <Center py={10}>
                          <Spinner />
                        </Center>
                      )}

                      {messagesError && (
                        <Alert status="error">
                          <AlertIcon />
                          <AlertDescription>
                            Failed to load messages.{' '}
                            {messagesError instanceof Error ? messagesError.message : 'Please try again.'}
                          </AlertDescription>
                        </Alert>
                      )}

                      {messages && messages.data.length === 0 && (
                        <Center py={10}>
                          <Text color="gray.500" _dark={{ color: 'gray.400' }}>
                            No messages yet. Start the conversation!
                          </Text>
                        </Center>
                      )}

                      {messages && messages.data.length > 0 && (
                        <VStack align="stretch" spacing={3}>
                          {messages.data.map((message) => (
                            <HStack key={message.id} align="start" spacing={3}>
                              <Avatar size="sm" name={message.senderName} />
                              <VStack align="start" spacing={1} flex={1}>
                                <HStack>
                                  <Text fontWeight="bold" fontSize="sm">
                                    {message.senderName}
                                  </Text>
                                  <Text fontSize="xs" color="gray.500" _dark={{ color: 'gray.400' }}>
                                    {formatDateTime(message.createdAt)}
                                  </Text>
                                </HStack>
                                <Text>{message.content}</Text>
                                {message.attachments && message.attachments.length > 0 && (
                                  <VStack align="start" spacing={1} mt={1}>
                                    {message.attachments.map((attachment) => (
                                      <HStack
                                        key={attachment.id}
                                        fontSize="sm"
                                        color="brand.500"
                                        cursor="pointer"
                                        _hover={{ textDecoration: 'underline' }}
                                      >
                                        <AttachmentIcon />
                                        <Text>{attachment.fileName}</Text>
                                      </HStack>
                                    ))}
                                  </VStack>
                                )}
                              </VStack>
                            </HStack>
                          ))}
                          <div ref={messagesEndRef} />
                        </VStack>
                      )}
                    </Box>

                    <Divider />

                    {/* Message Input */}
                    <Box p={4}>
                      <HStack spacing={2}>
                        <Textarea
                          placeholder="Type your message..."
                          value={messageContent}
                          onChange={(e) => setMessageContent(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          resize="none"
                          rows={2}
                        />
                        <VStack>
                          <Button
                            colorScheme="brand"
                            onClick={handleSendMessage}
                            isLoading={sendMessageMutation.isPending}
                            isDisabled={!messageContent.trim()}
                          >
                            Send
                          </Button>
                        </VStack>
                      </HStack>
                    </Box>
                  </>
                )}
              </CardBody>
            </Card>
          </HStack>
        </VStack>
      </Container>
    </ProtectedRoute>
  );
}
