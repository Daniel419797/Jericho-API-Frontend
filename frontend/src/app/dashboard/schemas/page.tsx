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
    Badge,
    Button,
    Spinner,
    Center,
    Alert,
    AlertIcon,
    AlertDescription,
    SimpleGrid,
    useColorModeValue,
    Icon,
    Code,
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
    Select,
    useToast,
    IconButton,
    Checkbox,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
} from '@chakra-ui/react';
import { FiDatabase, FiPlus, FiCheckCircle, FiAlertCircle, FiEdit2, FiTrash2, FiMoreVertical } from 'react-icons/fi';
import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api-client';
import { formatDate } from '@/utils/date-utils';

interface SchemaField {
    name: string;
    type: string;
    required: boolean;
}

interface Schema {
    id: string;
    name: string;
    projectId: string;
    fields: SchemaField[];
    version: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

const FIELD_TYPES = ['string', 'number', 'boolean', 'date', 'array', 'object', 'email', 'url', 'uuid'];

export default function SchemasPage() {
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const mutedColor = useColorModeValue('gray.500', 'gray.400');
    const subtleColor = useColorModeValue('gray.400', 'gray.500');

    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const cancelRef = useRef<HTMLButtonElement>(null);
    const queryClient = useQueryClient();
    const toast = useToast();

    const [isEditing, setIsEditing] = useState(false);
    const [selectedSchemaId, setSelectedSchemaId] = useState<string | null>(null);
    const [selectedSchemaName, setSelectedSchemaName] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        fields: [{ name: '', type: 'string', required: false }] as SchemaField[],
    });

    const { data: schemas, isLoading, error } = useQuery<Schema[]>({
        queryKey: ['schemas'],
        queryFn: () => apiClient.request<Schema[]>('/schemas'),
    });

    const createSchemaMutation = useMutation({
        mutationFn: (data: { name: string; fields: SchemaField[] }) =>
            apiClient.request('/schemas', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schemas'] });
            handleCloseModal();
            toast({
                title: 'Schema created',
                status: 'success',
                duration: 3000,
            });
        },
        onError: (error) => {
            toast({
                title: 'Failed to create schema',
                description: error instanceof Error ? error.message : 'Unknown error',
                status: 'error',
                duration: 5000,
            });
        },
    });

    const updateSchemaMutation = useMutation({
        mutationFn: (data: { id: string; name: string; fields: SchemaField[] }) =>
            apiClient.request(`/schemas/${data.id}`, {
                method: 'PUT',
                body: JSON.stringify({ name: data.name, fields: data.fields }),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schemas'] });
            handleCloseModal();
            toast({
                title: 'Schema updated',
                status: 'success',
                duration: 3000,
            });
        },
        onError: (error) => {
            toast({
                title: 'Failed to update schema',
                description: error instanceof Error ? error.message : 'Unknown error',
                status: 'error',
                duration: 5000,
            });
        },
    });

    const deleteSchemaMutation = useMutation({
        mutationFn: (schemaId: string) =>
            apiClient.request(`/schemas/${schemaId}`, { method: 'DELETE' }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schemas'] });
            onDeleteClose();
            toast({
                title: 'Schema deleted',
                status: 'success',
                duration: 3000,
            });
        },
        onError: (error) => {
            toast({
                title: 'Failed to delete schema',
                description: error instanceof Error ? error.message : 'Unknown error',
                status: 'error',
                duration: 5000,
            });
        },
    });

    const handleOpenCreateModal = () => {
        setIsEditing(false);
        setSelectedSchemaId(null);
        setFormData({ name: '', fields: [{ name: '', type: 'string', required: false }] });
        onOpen();
    };

    const handleOpenEditModal = (schema: Schema) => {
        setIsEditing(true);
        setSelectedSchemaId(schema.id);
        setFormData({
            name: schema.name,
            fields: schema.fields.length > 0 ? schema.fields : [{ name: '', type: 'string', required: false }],
        });
        onOpen();
    };

    const handleCloseModal = () => {
        setIsEditing(false);
        setSelectedSchemaId(null);
        setFormData({ name: '', fields: [{ name: '', type: 'string', required: false }] });
        onClose();
    };

    const handleOpenDeleteDialog = (schemaId: string, schemaName: string) => {
        setSelectedSchemaId(schemaId);
        setSelectedSchemaName(schemaName);
        onDeleteOpen();
    };

    const handleSubmit = () => {
        const validFields = formData.fields.filter((f) => f.name.trim() !== '');
        if (isEditing && selectedSchemaId) {
            updateSchemaMutation.mutate({
                id: selectedSchemaId,
                name: formData.name,
                fields: validFields,
            });
        } else {
            createSchemaMutation.mutate({
                name: formData.name,
                fields: validFields,
            });
        }
    };

    const handleDeleteSchema = () => {
        if (selectedSchemaId) {
            deleteSchemaMutation.mutate(selectedSchemaId);
        }
    };

    const addField = () => {
        setFormData((prev) => ({
            ...prev,
            fields: [...prev.fields, { name: '', type: 'string', required: false }],
        }));
    };

    const removeField = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            fields: prev.fields.filter((_, i) => i !== index),
        }));
    };

    const updateField = (index: number, updates: Partial<SchemaField>) => {
        setFormData((prev) => ({
            ...prev,
            fields: prev.fields.map((f, i) => (i === index ? { ...f, ...updates } : f)),
        }));
    };

    return (
        <Box>
            {/* Page Header */}
            <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'stretch', md: 'center' }} gap={4} mb={6}>
                <Box>
                    <Heading as="h1" size={{ base: 'lg', md: 'xl' }} mb={2}>
                        Schemas
                    </Heading>
                    <Text color={mutedColor} fontSize={{ base: 'sm', md: 'md' }}>
                        Define and manage data schemas for your projects
                    </Text>
                </Box>
                <Button leftIcon={<FiPlus />} colorScheme="brand" onClick={handleOpenCreateModal} w={{ base: 'full', md: 'auto' }}>
                    Create Schema
                </Button>
            </Flex>

            {isLoading && (
                <Center py={20}>
                    <Spinner size="xl" color="brand.500" thickness="4px" />
                </Center>
            )}

            {error && (
                <Alert status="error" borderRadius="lg">
                    <AlertIcon />
                    <AlertDescription>
                        Failed to load schemas. {error instanceof Error ? error.message : 'Please try again.'}
                    </AlertDescription>
                </Alert>
            )}

            {schemas && schemas.length > 0 && (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {schemas.map((schema) => (
                        <Card
                            key={schema.id}
                            bg={cardBg}
                            borderWidth="1px"
                            borderColor={borderColor}
                            _hover={{ shadow: 'lg', borderColor: 'brand.400' }}
                            transition="all 0.2s ease"
                        >
                            <CardBody>
                                <VStack align="start" spacing={4}>
                                    <HStack justify="space-between" w="full">
                                        <HStack spacing={3}>
                                            <Box
                                                p={2}
                                                borderRadius="lg"
                                                bg="cyan.50"
                                                _dark={{ bg: 'rgba(0, 188, 212, 0.15)' }}
                                            >
                                                <Icon as={FiDatabase} boxSize={5} color="cyan.500" />
                                            </Box>
                                            <VStack align="start" spacing={0}>
                                                <Heading size="sm">{schema.name}</Heading>
                                                <Text fontSize="xs" color={mutedColor}>v{schema.version}</Text>
                                            </VStack>
                                        </HStack>
                                        <HStack>
                                            <Icon
                                                as={schema.isActive ? FiCheckCircle : FiAlertCircle}
                                                color={schema.isActive ? 'green.500' : 'yellow.500'}
                                            />
                                            <Menu>
                                                <MenuButton
                                                    as={IconButton}
                                                    icon={<FiMoreVertical />}
                                                    variant="ghost"
                                                    size="sm"
                                                />
                                                <MenuList>
                                                    <MenuItem
                                                        icon={<FiEdit2 />}
                                                        onClick={() => handleOpenEditModal(schema)}
                                                    >
                                                        Edit Schema
                                                    </MenuItem>
                                                    <MenuItem
                                                        icon={<FiTrash2 />}
                                                        color="red.500"
                                                        onClick={() => handleOpenDeleteDialog(schema.id, schema.name)}
                                                    >
                                                        Delete Schema
                                                    </MenuItem>
                                                </MenuList>
                                            </Menu>
                                        </HStack>
                                    </HStack>

                                    <VStack align="start" spacing={2} w="full">
                                        <Text fontSize="sm" fontWeight="medium" color="gray.600" _dark={{ color: 'gray.400' }}>
                                            Fields ({schema.fields.length})
                                        </Text>
                                        <VStack align="stretch" w="full" spacing={1}>
                                            {schema.fields.slice(0, 4).map((field, idx) => (
                                                <HStack key={idx} justify="space-between" fontSize="sm">
                                                    <HStack spacing={2}>
                                                        <Code fontSize="xs">{field.name}</Code>
                                                        {field.required && (
                                                            <Badge colorScheme="red" size="sm" fontSize="10px">
                                                                REQ
                                                            </Badge>
                                                        )}
                                                    </HStack>
                                                    <Badge variant="outline" colorScheme="gray" fontSize="xs">
                                                        {field.type}
                                                    </Badge>
                                                </HStack>
                                            ))}
                                            {schema.fields.length > 4 && (
                                                <Text fontSize="xs" color={mutedColor}>
                                                    +{schema.fields.length - 4} more fields
                                                </Text>
                                            )}
                                        </VStack>
                                    </VStack>

                                    <Text fontSize="xs" color={subtleColor} w="full">
                                        Updated {formatDate(schema.updatedAt)}
                                    </Text>
                                </VStack>
                            </CardBody>
                        </Card>
                    ))}
                </SimpleGrid>
            )}

            {schemas?.length === 0 && (
                <Center py={20}>
                    <VStack spacing={4}>
                        <Icon as={FiDatabase} boxSize={12} color={subtleColor} />
                        <Text color={mutedColor}>No schemas defined yet</Text>
                        <Button leftIcon={<FiPlus />} colorScheme="brand" onClick={handleOpenCreateModal}>
                            Create Your First Schema
                        </Button>
                    </VStack>
                </Center>
            )}

            {/* Create/Edit Schema Modal */}
            <Modal isOpen={isOpen} onClose={handleCloseModal} size="xl">
                <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(5px)" />
                <ModalContent>
                    <ModalHeader>{isEditing ? 'Edit Schema' : 'Create Schema'}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4} align="stretch">
                            <FormControl isRequired>
                                <FormLabel>Schema Name</FormLabel>
                                <Input
                                    placeholder="e.g., UserProfile"
                                    value={formData.name}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                                />
                            </FormControl>

                            <Box>
                                <HStack justify="space-between" mb={2}>
                                    <Text fontWeight="medium">Fields</Text>
                                    <Button size="sm" leftIcon={<FiPlus />} onClick={addField}>
                                        Add Field
                                    </Button>
                                </HStack>
                                <Table size="sm">
                                    <Thead>
                                        <Tr>
                                            <Th>Name</Th>
                                            <Th>Type</Th>
                                            <Th>Required</Th>
                                            <Th width="50px"></Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {formData.fields.map((field, index) => (
                                            <Tr key={index}>
                                                <Td>
                                                    <Input
                                                        size="sm"
                                                        placeholder="field_name"
                                                        value={field.name}
                                                        onChange={(e) => updateField(index, { name: e.target.value })}
                                                    />
                                                </Td>
                                                <Td>
                                                    <Select
                                                        size="sm"
                                                        value={field.type}
                                                        onChange={(e) => updateField(index, { type: e.target.value })}
                                                    >
                                                        {FIELD_TYPES.map((type) => (
                                                            <option key={type} value={type}>{type}</option>
                                                        ))}
                                                    </Select>
                                                </Td>
                                                <Td>
                                                    <Checkbox
                                                        isChecked={field.required}
                                                        onChange={(e) => updateField(index, { required: e.target.checked })}
                                                    />
                                                </Td>
                                                <Td>
                                                    <IconButton
                                                        aria-label="Remove field"
                                                        icon={<FiTrash2 />}
                                                        size="sm"
                                                        variant="ghost"
                                                        colorScheme="red"
                                                        onClick={() => removeField(index)}
                                                        isDisabled={formData.fields.length <= 1}
                                                    />
                                                </Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </Box>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button
                            colorScheme="brand"
                            onClick={handleSubmit}
                            isLoading={createSchemaMutation.isPending || updateSchemaMutation.isPending}
                            isDisabled={!formData.name}
                        >
                            {isEditing ? 'Update Schema' : 'Create Schema'}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Delete Schema Confirmation */}
            <AlertDialog
                isOpen={isDeleteOpen}
                leastDestructiveRef={cancelRef}
                onClose={onDeleteClose}
            >
                <AlertDialogOverlay bg="blackAlpha.600" backdropFilter="blur(5px)">
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Delete Schema
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Are you sure you want to delete <strong>{selectedSchemaName}</strong>? This action cannot be undone.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onDeleteClose}>
                                Cancel
                            </Button>
                            <Button
                                colorScheme="red"
                                onClick={handleDeleteSchema}
                                ml={3}
                                isLoading={deleteSchemaMutation.isPending}
                            >
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
}
