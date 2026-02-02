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
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    Button,
    Spinner,
    Center,
    Alert,
    AlertIcon,
    AlertDescription,
    IconButton,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    InputGroup,
    InputLeftElement,
    Input,
    useColorModeValue,
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
    Code,
} from '@chakra-ui/react';
import { FiMoreVertical, FiSearch, FiPlus, FiCopy, FiTrash2, FiKey } from 'react-icons/fi';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api-client';
import { formatDate } from '@/utils/date-utils';

interface ApiKey {
    id: string;
    name: string;
    projectId: string;
    isActive: boolean;
    permissions: string[];
    createdAt: string;
}

export default function ApiKeysPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [newKeyName, setNewKeyName] = useState('');
    const [createdKey, setCreatedKey] = useState<string | null>(null);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isDevOpen, onOpen: onDevOpen, onClose: onDevClose } = useDisclosure();
    const queryClient = useQueryClient();
    const toast = useToast();

    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const rowHoverBg = useColorModeValue('gray.50', 'gray.700');
    const modalBg = useColorModeValue('gray.100', 'gray.700');
    const mutedColor = useColorModeValue('gray.500', 'gray.400');

    const { data: apiKeys, isLoading, error } = useQuery<ApiKey[]>({
        queryKey: ['api-keys'],
        queryFn: () => apiClient.request<ApiKey[]>('/api-keys'),
    });

    const createKeyMutation = useMutation({
        mutationFn: (name: string) => apiClient.request<{ rawKey: string }>('/api-keys', {
            method: 'POST',
            body: JSON.stringify({ name }),
        }),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['api-keys'] });
            setCreatedKey(data.rawKey);
            setNewKeyName('');
            toast({
                title: 'API Key created',
                status: 'success',
                duration: 3000,
            });
        },
        onError: (error) => {
            toast({
                title: 'Failed to create API key',
                description: error instanceof Error ? error.message : 'Unknown error',
                status: 'error',
                duration: 5000,
            });
        },
    });

    const revokeKeyMutation = useMutation({
        mutationFn: (id: string) => apiClient.request(`/api-keys/${id}`, {
            method: 'DELETE',
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['api-keys'] });
            toast({
                title: 'API Key revoked',
                status: 'success',
                duration: 3000,
            });
        },
    });

    const handleCreateKey = () => {
        if (newKeyName) {
            createKeyMutation.mutate(newKeyName);
        }
    };

    // Dev admin key UI state
    const [devAdminKey, setDevAdminKey] = useState('');
    const [devPayload, setDevPayload] = useState('{}');
    const [createdDevKey, setCreatedDevKey] = useState<string | null>(null);
    const [isCreatingDev, setIsCreatingDev] = useState(false);

    const handleCreateDevKey = async () => {
        setIsCreatingDev(true);
        try {
            let payload = {};
            try {
                payload = JSON.parse(devPayload || '{}');
            } catch (err) {
                // ignore, will send empty object
            }

            const res = await apiClient.request<any>('/v1/auth/dev-create-admin-key', {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: { 'x-dev-admin-key': devAdminKey },
            });

            const any = res as any;
            const raw = any.apiKey || any.apiKey?.apiKey || any.apiKey?.raw || any.rawKey || any.raw || any.key?.apiKey;
            if (raw) {
                setCreatedDevKey(raw);
            } else if (any.apiKey && typeof any.apiKey === 'string') {
                setCreatedDevKey(any.apiKey);
            } else if (any.apiKey && any.apiKey.apiKey) {
                setCreatedDevKey(any.apiKey.apiKey);
            } else {
                // fallback: stringify whole response
                setCreatedDevKey(JSON.stringify(any));
            }
        } catch (err) {
            toast({ title: 'Failed to create dev key', description: err instanceof Error ? err.message : 'Unknown error', status: 'error' });
        } finally {
            setIsCreatingDev(false);
        }
    };

    const handleCopyKey = (key: string) => {
        navigator.clipboard.writeText(key);
        toast({
            title: 'Copied to clipboard',
            status: 'success',
            duration: 2000,
        });
    };

    const handleCloseModal = () => {
        setCreatedKey(null);
        onClose();
    };

    const filteredKeys = apiKeys?.filter(key =>
        key.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Box>
            {/* Page Header */}
            <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'stretch', md: 'center' }} gap={4} mb={6}>
                <Box>
                    <Heading as="h1" size={{ base: 'lg', md: 'xl' }} mb={2}>
                        API Keys
                    </Heading>
                    <Text color={mutedColor} fontSize={{ base: 'sm', md: 'md' }}>
                        Manage API keys for your applications
                    </Text>
                </Box>
                <Flex direction={{ base: 'column', sm: 'row' }} gap={2}>
                    <Button leftIcon={<FiPlus />} colorScheme="brand" onClick={onOpen} w={{ base: 'full', sm: 'auto' }}>
                        Create API Key
                    </Button>
                    <Button leftIcon={<FiKey />} variant="outline" onClick={onDevOpen} w={{ base: 'full', sm: 'auto' }}>
                        Create Dev Admin Key
                    </Button>
                </Flex>
            </Flex>

            {/* Search */}
            <InputGroup maxW={{ base: 'full', md: '400px' }} mb={6}>
                <InputLeftElement pointerEvents="none">
                    <FiSearch color="gray" />
                </InputLeftElement>
                <Input
                    placeholder="Search API keys..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    bg={cardBg}
                />
            </InputGroup>

            {isLoading && (
                <Center py={20}>
                    <Spinner size="xl" color="brand.500" thickness="4px" />
                </Center>
            )}

            {error && (
                <Alert status="error" borderRadius="lg">
                    <AlertIcon />
                    <AlertDescription>
                        Failed to load API keys. {error instanceof Error ? error.message : 'Please try again.'}
                    </AlertDescription>
                </Alert>
            )}

            {filteredKeys && (
                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} overflowX="auto">
                    <CardBody p={0}>
                        <Table size={{ base: 'sm', md: 'md' }} minW="700px">
                            <Thead>
                                <Tr>
                                    <Th>Name</Th>
                                    <Th>Status</Th>
                                    <Th>Permissions</Th>
                                    <Th>Created</Th>
                                    <Th width="50px"></Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {filteredKeys.map((key) => (
                                    <Tr key={key.id} _hover={{ bg: rowHoverBg }}>
                                        <Td>
                                            <HStack spacing={3}>
                                                <Box
                                                    p={2}
                                                    borderRadius="lg"
                                                    bg="brand.50"
                                                    _dark={{ bg: 'rgba(33, 150, 243, 0.15)' }}
                                                >
                                                    <FiKey color="var(--chakra-colors-brand-500)" />
                                                </Box>
                                                <Text fontWeight="medium">{key.name}</Text>
                                            </HStack>
                                        </Td>
                                        <Td>
                                            <Badge
                                                colorScheme={key.isActive ? 'green' : 'red'}
                                                variant="subtle"
                                            >
                                                {key.isActive ? 'Active' : 'Revoked'}
                                            </Badge>
                                        </Td>
                                        <Td>
                                            <HStack spacing={1}>
                                                {key.permissions.slice(0, 2).map((perm, idx) => (
                                                    <Badge key={idx} variant="outline" fontSize="xs">
                                                        {perm}
                                                    </Badge>
                                                ))}
                                                {key.permissions.length > 2 && (
                                                    <Badge variant="subtle" fontSize="xs">
                                                        +{key.permissions.length - 2}
                                                    </Badge>
                                                )}
                                            </HStack>
                                        </Td>
                                        <Td>
                                            <Text fontSize="sm" color={mutedColor}>{formatDate(key.createdAt)}</Text>
                                        </Td>
                                        <Td>
                                            <Menu>
                                                <MenuButton
                                                    as={IconButton}
                                                    icon={<FiMoreVertical />}
                                                    variant="ghost"
                                                    size="sm"
                                                />
                                                <MenuList>
                                                    <MenuItem
                                                        icon={<FiTrash2 />}
                                                        color="red.500"
                                                        onClick={() => revokeKeyMutation.mutate(key.id)}
                                                        isDisabled={!key.isActive}
                                                    >
                                                        Revoke Key
                                                    </MenuItem>
                                                </MenuList>
                                            </Menu>
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </CardBody>
                </Card>
            )}

            {/* Create API Key Modal */}
            <Modal isOpen={isOpen} onClose={handleCloseModal}>
                <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(5px)" />
                <ModalContent>
                    <ModalHeader>{createdKey ? 'API Key Created' : 'Create API Key'}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {createdKey ? (
                            <VStack spacing={4} align="stretch">
                                <Alert status="warning" borderRadius="lg">
                                    <AlertIcon />
                                    Copy this key now. You won&apos;t be able to see it again!
                                </Alert>
                                <Box p={4} bg={modalBg} borderRadius="lg">
                                    <HStack justify="space-between">
                                        <Code fontSize="sm" wordBreak="break-all">{createdKey}</Code>
                                        <IconButton
                                            aria-label="Copy key"
                                            icon={<FiCopy />}
                                            size="sm"
                                            onClick={() => handleCopyKey(createdKey)}
                                        />
                                    </HStack>
                                </Box>
                            </VStack>
                        ) : (
                            <FormControl>
                                <FormLabel>Key Name</FormLabel>
                                <Input
                                    placeholder="e.g., Production API Key"
                                    value={newKeyName}
                                    onChange={(e) => setNewKeyName(e.target.value)}
                                />
                            </FormControl>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        {createdKey ? (
                            <Button colorScheme="brand" onClick={handleCloseModal}>
                                Done
                            </Button>
                        ) : (
                            <>
                                <Button variant="ghost" mr={3} onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button
                                    colorScheme="brand"
                                    onClick={handleCreateKey}
                                    isLoading={createKeyMutation.isPending}
                                    isDisabled={!newKeyName}
                                >
                                    Create Key
                                </Button>
                            </>
                        )}
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Dev Admin Key Modal */}
            <Modal isOpen={isDevOpen} onClose={() => { setCreatedDevKey(null); onDevClose(); }}>
                <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(5px)" />
                <ModalContent>
                    <ModalHeader>{createdDevKey ? 'Dev Admin Key Created' : 'Create Dev Admin Key'}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {createdDevKey ? (
                            <VStack spacing={4} align="stretch">
                                <Alert status="warning" borderRadius="lg">
                                    <AlertIcon />
                                    Copy this key now. You won&apos;t be able to see it again!
                                </Alert>
                                <Box p={4} bg={modalBg} borderRadius="lg">
                                    <HStack justify="space-between">
                                        <Code fontSize="sm" wordBreak="break-all">{createdDevKey}</Code>
                                        <IconButton aria-label="Copy key" icon={<FiCopy />} size="sm" onClick={() => { navigator.clipboard.writeText(createdDevKey); toast({ title: 'Copied to clipboard', status: 'success' }); }} />
                                    </HStack>
                                </Box>
                            </VStack>
                        ) : (
                            <VStack spacing={4} align="stretch">
                                <FormControl>
                                    <FormLabel>Dev Admin Key (x-dev-admin-key)</FormLabel>
                                    <Input placeholder="Paste your DEV_ADMIN_KEY" value={devAdminKey} onChange={(e) => setDevAdminKey(e.target.value)} />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Request Payload (JSON)</FormLabel>
                                    <Input placeholder='{"projectId":"...","name":"dev-admin-key"}' value={devPayload} onChange={(e) => setDevPayload(e.target.value)} />
                                </FormControl>
                            </VStack>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        {createdDevKey ? (
                            <Button colorScheme="brand" onClick={() => { setCreatedDevKey(null); onDevClose(); }}>Done</Button>
                        ) : (
                            <>
                                <Button variant="ghost" mr={3} onClick={() => { setDevAdminKey(''); setDevPayload('{}'); onDevClose(); }}>Cancel</Button>
                                <Button colorScheme="brand" onClick={handleCreateDevKey} isLoading={isCreatingDev} isDisabled={!devAdminKey}>
                                    Create Dev Admin Key
                                </Button>
                            </>
                        )}
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}