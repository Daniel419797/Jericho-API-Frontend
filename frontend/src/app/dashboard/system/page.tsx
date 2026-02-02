'use client';

import {
    Box,
    Heading,
    Text,
    VStack,
    HStack,
    Card,
    CardBody,
    Badge,
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    useColorModeValue,
    Icon,
    Stat,
    StatLabel,
    StatNumber,
    SimpleGrid,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    Code,
    useToast,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    useDisclosure,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Spinner,
    Center,
} from '@chakra-ui/react';
import { FiServer, FiDatabase, FiRefreshCw, FiActivity, FiPlay, FiSquare, FiTrash2, FiPlus, FiFileText } from 'react-icons/fi';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api-client';

export default function SystemPage() {
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const mutedColor = useColorModeValue('gray.500', 'gray.400');
    const toast = useToast();
    const queryClient = useQueryClient();

    const { isOpen: isStreamModalOpen, onOpen: onStreamModalOpen, onClose: onStreamModalClose } = useDisclosure();
    const { isOpen: isLogModalOpen, onOpen: onLogModalOpen, onClose: onLogModalClose } = useDisclosure();
    const [newStreamProjectId, setNewStreamProjectId] = useState('');
    const [newStreamCollection, setNewStreamCollection] = useState('');

    // Mock system stats
    const systemStats = {
        uptime: '45 days, 12 hours',
        memoryUsage: '68%',
        cpuUsage: '23%',
        activeConnections: 156,
    };

    const { data: cachedProjects } = useQuery<{ id: string; name: string; cachedAt: string }[]>({
        queryKey: ['cached-projects'],
        queryFn: () => apiClient.request('/admin/cache/projects'),
    });

    const { data: streams, isLoading: streamsLoading } = useQuery<{ id: string; projectId: string; collection: string; status: string }[]>({
        queryKey: ['streams'],
        queryFn: () => apiClient.request('/admin/streams'),
    });

    const { data: rotationLog, isLoading: logLoading, refetch: refetchLog } = useQuery<string>({
        queryKey: ['rotation-log'],
        queryFn: () => apiClient.request('/admin/rotation/log?lines=100'),
        enabled: false,
    });

    const rotateMutation = useMutation({
        mutationFn: (type: 'db' | 'secrets') => apiClient.request(`/admin/rotate/${type}`, {
            method: 'POST',
            body: JSON.stringify({ dryRun: false }),
        }),
        onSuccess: (_, type) => {
            toast({
                title: 'Rotation triggered',
                description: `${type === 'db' ? 'Database' : 'Secrets'} rotation has been initiated.`,
                status: 'success',
                duration: 3000,
            });
        },
        onError: (error) => {
            toast({
                title: 'Rotation failed',
                description: error instanceof Error ? error.message : 'Unknown error',
                status: 'error',
                duration: 5000,
            });
        },
    });

    const invalidateCacheMutation = useMutation({
        mutationFn: (projectId: string) => apiClient.request(`/admin/cache/invalidate/${projectId}`, {
            method: 'POST',
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cached-projects'] });
            toast({
                title: 'Cache invalidated',
                status: 'success',
                duration: 3000,
            });
        },
    });

    const startStreamMutation = useMutation({
        mutationFn: (data: { projectId: string; collection: string }) =>
            apiClient.request('/admin/streams/start', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['streams'] });
            onStreamModalClose();
            setNewStreamProjectId('');
            setNewStreamCollection('');
            toast({
                title: 'Stream started',
                status: 'success',
                duration: 3000,
            });
        },
        onError: (error) => {
            toast({
                title: 'Failed to start stream',
                description: error instanceof Error ? error.message : 'Unknown error',
                status: 'error',
                duration: 5000,
            });
        },
    });

    const stopStreamMutation = useMutation({
        mutationFn: (data: { projectId: string; collection: string }) =>
            apiClient.request('/admin/streams/stop', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['streams'] });
            toast({
                title: 'Stream stopped',
                status: 'success',
                duration: 3000,
            });
        },
        onError: (error) => {
            toast({
                title: 'Failed to stop stream',
                description: error instanceof Error ? error.message : 'Unknown error',
                status: 'error',
                duration: 5000,
            });
        },
    });

    const handleViewRotationLog = async () => {
        await refetchLog();
        onLogModalOpen();
    };

    const handleStartNewStream = () => {
        if (newStreamProjectId && newStreamCollection) {
            startStreamMutation.mutate({
                projectId: newStreamProjectId,
                collection: newStreamCollection,
            });
        }
    };

    return (
        <Box>
            {/* Page Header */}
            <Box mb={6}>
                <Heading as="h1" size={{ base: 'lg', md: 'xl' }} mb={2}>
                    System Administration
                </Heading>
                <Text color={mutedColor} fontSize={{ base: 'sm', md: 'md' }}>
                    Manage cache, streams, and system operations
                </Text>
            </Box>

            {/* System Stats */}
            <SimpleGrid columns={{ base: 2, lg: 4 }} spacing={{ base: 3, md: 6 }} mb={6}>
                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                    <CardBody p={{ base: 3, md: 5 }}>
                        <Stat>
                            <StatLabel color={mutedColor} fontSize={{ base: 'xs', md: 'sm' }}>Uptime</StatLabel>
                            <StatNumber fontSize={{ base: 'sm', md: 'lg' }}>{systemStats.uptime}</StatNumber>
                        </Stat>
                    </CardBody>
                </Card>
                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                    <CardBody p={{ base: 3, md: 5 }}>
                        <Stat>
                            <StatLabel color={mutedColor} fontSize={{ base: 'xs', md: 'sm' }}>Memory Usage</StatLabel>
                            <StatNumber fontSize={{ base: 'sm', md: 'lg' }}>{systemStats.memoryUsage}</StatNumber>
                        </Stat>
                    </CardBody>
                </Card>
                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                    <CardBody p={{ base: 3, md: 5 }}>
                        <Stat>
                            <StatLabel color={mutedColor}>CPU Usage</StatLabel>
                            <StatNumber fontSize="lg">{systemStats.cpuUsage}</StatNumber>
                        </Stat>
                    </CardBody>
                </Card>
                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                    <CardBody>
                        <Stat>
                            <StatLabel color={mutedColor}>Active Connections</StatLabel>
                            <StatNumber fontSize="lg">{systemStats.activeConnections}</StatNumber>
                        </Stat>
                    </CardBody>
                </Card>
            </SimpleGrid>

            <Tabs colorScheme="brand">
                <TabList mb={6}>
                    <Tab>Cache</Tab>
                    <Tab>Streams</Tab>
                    <Tab>Rotation</Tab>
                </TabList>

                <TabPanels>
                    {/* Cache Tab */}
                    <TabPanel p={0}>
                        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                            <CardBody p={0}>
                                <Box p={4} borderBottom="1px" borderColor={borderColor}>
                                    <HStack justify="space-between">
                                        <Heading size="md">Cached Projects</Heading>
                                        <Badge colorScheme="blue">
                                            {cachedProjects?.length || 0} cached
                                        </Badge>
                                    </HStack>
                                </Box>
                                <Table>
                                    <Thead>
                                        <Tr>
                                            <Th>Project ID</Th>
                                            <Th>Name</Th>
                                            <Th>Cached At</Th>
                                            <Th width="100px">Actions</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {cachedProjects?.map((project: { id: string; name: string; cachedAt: string }) => (
                                            <Tr key={project.id}>
                                                <Td>
                                                    <Code fontSize="sm">{project.id}</Code>
                                                </Td>
                                                <Td>{project.name}</Td>
                                                <Td>
                                                    <Text fontSize="sm" color={mutedColor}>{project.cachedAt}</Text>
                                                </Td>
                                                <Td>
                                                    <Button
                                                        size="sm"
                                                        colorScheme="red"
                                                        variant="ghost"
                                                        leftIcon={<FiTrash2 />}
                                                        onClick={() => invalidateCacheMutation.mutate(project.id)}
                                                        isLoading={invalidateCacheMutation.isPending}
                                                    >
                                                        Invalidate
                                                    </Button>
                                                </Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </CardBody>
                        </Card>
                    </TabPanel>

                    {/* Streams Tab */}
                    <TabPanel p={0}>
                        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                            <CardBody p={0}>
                                <Box p={4} borderBottom="1px" borderColor={borderColor}>
                                    <HStack justify="space-between">
                                        <Heading size="md">Active Streams</Heading>
                                        <Button
                                            size="sm"
                                            leftIcon={<FiPlus />}
                                            colorScheme="brand"
                                            onClick={onStreamModalOpen}
                                        >
                                            Start New Stream
                                        </Button>
                                    </HStack>
                                </Box>
                                {streamsLoading ? (
                                    <Center py={10}>
                                        <Spinner />
                                    </Center>
                                ) : (
                                    <Table>
                                        <Thead>
                                            <Tr>
                                                <Th>Project</Th>
                                                <Th>Collection</Th>
                                                <Th>Status</Th>
                                                <Th width="150px">Actions</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {streams?.map((stream: { id: string; projectId: string; collection: string; status: string }) => (
                                                <Tr key={stream.id}>
                                                    <Td>
                                                        <Code fontSize="sm">{stream.projectId}</Code>
                                                    </Td>
                                                    <Td>{stream.collection}</Td>
                                                    <Td>
                                                        <Badge
                                                            colorScheme={stream.status === 'running' ? 'green' : 'gray'}
                                                            variant="subtle"
                                                        >
                                                            {stream.status}
                                                        </Badge>
                                                    </Td>
                                                    <Td>
                                                        <HStack spacing={2}>
                                                            <Button
                                                                size="sm"
                                                                colorScheme="green"
                                                                variant="ghost"
                                                                leftIcon={<FiPlay />}
                                                                isDisabled={stream.status === 'running'}
                                                                isLoading={startStreamMutation.isPending}
                                                                onClick={() => startStreamMutation.mutate({
                                                                    projectId: stream.projectId,
                                                                    collection: stream.collection,
                                                                })}
                                                            >
                                                                Start
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                colorScheme="red"
                                                                variant="ghost"
                                                                leftIcon={<FiSquare />}
                                                                isDisabled={stream.status !== 'running'}
                                                                isLoading={stopStreamMutation.isPending}
                                                                onClick={() => stopStreamMutation.mutate({
                                                                    projectId: stream.projectId,
                                                                    collection: stream.collection,
                                                                })}
                                                            >
                                                                Stop
                                                            </Button>
                                                        </HStack>
                                                    </Td>
                                                </Tr>
                                            ))}
                                            {(!streams || streams.length === 0) && (
                                                <Tr>
                                                    <Td colSpan={4}>
                                                        <Text color={mutedColor} textAlign="center" py={4}>
                                                            No streams configured
                                                        </Text>
                                                    </Td>
                                                </Tr>
                                            )}
                                        </Tbody>
                                    </Table>
                                )}
                            </CardBody>
                        </Card>
                    </TabPanel>

                    {/* Rotation Tab */}
                    <TabPanel p={0}>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                                <CardBody>
                                    <VStack align="start" spacing={4}>
                                        <HStack>
                                            <Box
                                                p={3}
                                                borderRadius="lg"
                                                bg="blue.50"
                                                _dark={{ bg: 'rgba(33, 150, 243, 0.15)' }}
                                            >
                                                <Icon as={FiDatabase} boxSize={6} color="blue.500" />
                                            </Box>
                                            <VStack align="start" spacing={0}>
                                                <Heading size="md">Database Rotation</Heading>
                                                <Text fontSize="sm" color={mutedColor}>Rotate database credentials</Text>
                                            </VStack>
                                        </HStack>
                                        <Text color={mutedColor} fontSize="sm">
                                            Trigger a secure rotation of database credentials. This will update all connection strings.
                                        </Text>
                                        <Button
                                            colorScheme="blue"
                                            leftIcon={<FiRefreshCw />}
                                            onClick={() => rotateMutation.mutate('db')}
                                            isLoading={rotateMutation.isPending}
                                        >
                                            Rotate Database
                                        </Button>
                                    </VStack>
                                </CardBody>
                            </Card>

                            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                                <CardBody>
                                    <VStack align="start" spacing={4}>
                                        <HStack>
                                            <Box
                                                p={3}
                                                borderRadius="lg"
                                                bg="purple.50"
                                                _dark={{ bg: 'rgba(159, 122, 234, 0.15)' }}
                                            >
                                                <Icon as={FiActivity} boxSize={6} color="purple.500" />
                                            </Box>
                                            <VStack align="start" spacing={0}>
                                                <Heading size="md">Secrets Rotation</Heading>
                                                <Text fontSize="sm" color={mutedColor}>Rotate API secrets</Text>
                                            </VStack>
                                        </HStack>
                                        <Text color={mutedColor} fontSize="sm">
                                            Trigger a secure rotation of API secrets and encryption keys.
                                        </Text>
                                        <Button
                                            colorScheme="purple"
                                            leftIcon={<FiRefreshCw />}
                                            onClick={() => rotateMutation.mutate('secrets')}
                                            isLoading={rotateMutation.isPending}
                                        >
                                            Rotate Secrets
                                        </Button>
                                    </VStack>
                                </CardBody>
                            </Card>

                            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                                <CardBody>
                                    <VStack align="start" spacing={4}>
                                        <HStack>
                                            <Box
                                                p={3}
                                                borderRadius="lg"
                                                bg="orange.50"
                                                _dark={{ bg: 'rgba(237, 137, 54, 0.15)' }}
                                            >
                                                <Icon as={FiFileText} boxSize={6} color="orange.500" />
                                            </Box>
                                            <VStack align="start" spacing={0}>
                                                <Heading size="md">Rotation Audit Log</Heading>
                                                <Text fontSize="sm" color={mutedColor}>View recent rotation events</Text>
                                            </VStack>
                                        </HStack>
                                        <Text color={mutedColor} fontSize="sm">
                                            View the audit log of all rotation operations performed on the system.
                                        </Text>
                                        <Button
                                            colorScheme="orange"
                                            leftIcon={<FiFileText />}
                                            onClick={handleViewRotationLog}
                                            isLoading={logLoading}
                                        >
                                            View Audit Log
                                        </Button>
                                    </VStack>
                                </CardBody>
                            </Card>
                        </SimpleGrid>
                    </TabPanel>
                </TabPanels>
            </Tabs>

            {/* Start New Stream Modal */}
            <Modal isOpen={isStreamModalOpen} onClose={onStreamModalClose}>
                <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(5px)" />
                <ModalContent>
                    <ModalHeader>Start New Stream</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Project ID</FormLabel>
                                <Input
                                    placeholder="Enter project ID"
                                    value={newStreamProjectId}
                                    onChange={(e) => setNewStreamProjectId(e.target.value)}
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Collection Name</FormLabel>
                                <Input
                                    placeholder="e.g., users, orders"
                                    value={newStreamCollection}
                                    onChange={(e) => setNewStreamCollection(e.target.value)}
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onStreamModalClose}>
                            Cancel
                        </Button>
                        <Button
                            colorScheme="brand"
                            onClick={handleStartNewStream}
                            isLoading={startStreamMutation.isPending}
                            isDisabled={!newStreamProjectId || !newStreamCollection}
                        >
                            Start Stream
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Rotation Audit Log Modal */}
            <Modal isOpen={isLogModalOpen} onClose={onLogModalClose} size="xl">
                <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(5px)" />
                <ModalContent>
                    <ModalHeader>Rotation Audit Log</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {logLoading ? (
                            <Center py={10}>
                                <Spinner />
                            </Center>
                        ) : (
                            <Textarea
                                value={typeof rotationLog === 'string' ? rotationLog : JSON.stringify(rotationLog, null, 2)}
                                isReadOnly
                                fontFamily="mono"
                                fontSize="sm"
                                minH="400px"
                                bg={cardBg}
                            />
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="brand" onClick={onLogModalClose}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}