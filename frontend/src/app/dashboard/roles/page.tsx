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
    Wrap,
    WrapItem,
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
    useToast,
    Checkbox,
    CheckboxGroup,
    IconButton,
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
import { FiShield, FiPlus, FiEdit2, FiTrash2, FiMoreVertical } from 'react-icons/fi';
import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roleService } from '@/services/roleService';
import { apiClient } from '@/services/api-client';

const AVAILABLE_PERMISSIONS = [
    'read:users',
    'write:users',
    'delete:users',
    'read:projects',
    'write:projects',
    'delete:projects',
    'read:files',
    'write:files',
    'delete:files',
    'read:messages',
    'write:messages',
    'read:api-keys',
    'write:api-keys',
    'admin:full',
];

export default function RolesPage() {
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const mutedColor = useColorModeValue('gray.500', 'gray.400');

    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const cancelRef = useRef<HTMLButtonElement>(null);
    const queryClient = useQueryClient();
    const toast = useToast();

    const [isEditing, setIsEditing] = useState(false);
    const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
    const [selectedRoleName, setSelectedRoleName] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        permissions: [] as string[],
    });

    const {
        data: roles,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['roles'],
        queryFn: () => roleService.listRoles(),
    });

    const createRoleMutation = useMutation({
        mutationFn: (data: { name: string; description?: string; permissions: string[] }) =>
            roleService.createRole({ ...data, projectId: '' }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
            handleCloseModal();
            toast({
                title: 'Role created',
                description: 'New role has been created successfully',
                status: 'success',
                duration: 3000,
            });
        },
        onError: (error) => {
            toast({
                title: 'Failed to create role',
                description: error instanceof Error ? error.message : 'Unknown error',
                status: 'error',
                duration: 5000,
            });
        },
    });

    const updateRoleMutation = useMutation({
        mutationFn: (data: { id: string; name: string; description?: string; permissions: string[] }) =>
            apiClient.request(`/roles/${data.id}`, {
                method: 'PUT',
                body: JSON.stringify({ name: data.name, description: data.description, permissions: data.permissions }),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
            handleCloseModal();
            toast({
                title: 'Role updated',
                description: 'Role has been updated successfully',
                status: 'success',
                duration: 3000,
            });
        },
        onError: (error) => {
            toast({
                title: 'Failed to update role',
                description: error instanceof Error ? error.message : 'Unknown error',
                status: 'error',
                duration: 5000,
            });
        },
    });

    const deleteRoleMutation = useMutation({
        mutationFn: (roleId: string) => roleService.deleteRole(roleId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
            onDeleteClose();
            toast({
                title: 'Role deleted',
                description: 'Role has been deleted successfully',
                status: 'success',
                duration: 3000,
            });
        },
        onError: (error) => {
            toast({
                title: 'Failed to delete role',
                description: error instanceof Error ? error.message : 'Unknown error',
                status: 'error',
                duration: 5000,
            });
        },
    });

    const handleOpenCreateModal = () => {
        setIsEditing(false);
        setSelectedRoleId(null);
        setFormData({ name: '', description: '', permissions: [] });
        onOpen();
    };

    const handleOpenEditModal = (role: { id: string; name: string; description?: string; permissions: string[] }) => {
        setIsEditing(true);
        setSelectedRoleId(role.id);
        setFormData({
            name: role.name,
            description: role.description || '',
            permissions: role.permissions,
        });
        onOpen();
    };

    const handleCloseModal = () => {
        setIsEditing(false);
        setSelectedRoleId(null);
        setFormData({ name: '', description: '', permissions: [] });
        onClose();
    };

    const handleOpenDeleteDialog = (roleId: string, roleName: string) => {
        setSelectedRoleId(roleId);
        setSelectedRoleName(roleName);
        onDeleteOpen();
    };

    const handleSubmit = () => {
        if (isEditing && selectedRoleId) {
            updateRoleMutation.mutate({
                id: selectedRoleId,
                name: formData.name,
                description: formData.description,
                permissions: formData.permissions,
            });
        } else {
            createRoleMutation.mutate({
                name: formData.name,
                description: formData.description,
                permissions: formData.permissions,
            });
        }
    };

    const handleDeleteRole = () => {
        if (selectedRoleId) {
            deleteRoleMutation.mutate(selectedRoleId);
        }
    };

    const handlePermissionChange = (permissions: string[]) => {
        setFormData((prev) => ({ ...prev, permissions }));
    };

    return (
        <Box>
            {/* Page Header */}
            <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'stretch', md: 'center' }} gap={4} mb={6}>
                <Box>
                    <Heading as="h1" size={{ base: 'lg', md: 'xl' }} mb={2}>
                        Roles & Permissions
                    </Heading>
                    <Text color={mutedColor} fontSize={{ base: 'sm', md: 'md' }}>
                        Manage user roles and their permissions
                    </Text>
                </Box>
                <Button leftIcon={<FiPlus />} colorScheme="brand" onClick={handleOpenCreateModal} w={{ base: 'full', md: 'auto' }}>
                    Create Role
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
                        Failed to load roles. {error instanceof Error ? error.message : 'Please try again.'}
                    </AlertDescription>
                </Alert>
            )}

            {roles && (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {roles.map((role) => (
                        <Card
                            key={role.id}
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
                                                bg="brand.50"
                                                _dark={{ bg: 'rgba(33, 150, 243, 0.15)' }}
                                            >
                                                <Icon as={FiShield} boxSize={5} color="brand.500" />
                                            </Box>
                                            <Heading size="md">{role.name}</Heading>
                                        </HStack>
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
                                                    onClick={() => handleOpenEditModal(role)}
                                                >
                                                    Edit Role
                                                </MenuItem>
                                                <MenuItem
                                                    icon={<FiTrash2 />}
                                                    color="red.500"
                                                    onClick={() => handleOpenDeleteDialog(role.id, role.name)}
                                                >
                                                    Delete Role
                                                </MenuItem>
                                            </MenuList>
                                        </Menu>
                                    </HStack>

                                    <Badge colorScheme="blue" variant="subtle">
                                        {role.permissions.length} permissions
                                    </Badge>

                                    <Text color={mutedColor} fontSize="sm">
                                        {role.description || 'No description provided'}
                                    </Text>

                                    {role.permissions.length > 0 && (
                                        <Wrap spacing={2}>
                                            {role.permissions.slice(0, 5).map((permission, idx) => (
                                                <WrapItem key={idx}>
                                                    <Badge variant="outline" colorScheme="gray" fontSize="xs">
                                                        {permission}
                                                    </Badge>
                                                </WrapItem>
                                            ))}
                                            {role.permissions.length > 5 && (
                                                <WrapItem>
                                                    <Badge variant="subtle" colorScheme="gray" fontSize="xs">
                                                        +{role.permissions.length - 5} more
                                                    </Badge>
                                                </WrapItem>
                                            )}
                                        </Wrap>
                                    )}
                                </VStack>
                            </CardBody>
                        </Card>
                    ))}
                </SimpleGrid>
            )}

            {/* Create/Edit Role Modal */}
            <Modal isOpen={isOpen} onClose={handleCloseModal} size="lg">
                <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(5px)" />
                <ModalContent>
                    <ModalHeader>{isEditing ? 'Edit Role' : 'Create Role'}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4} align="stretch">
                            <FormControl isRequired>
                                <FormLabel>Role Name</FormLabel>
                                <Input
                                    placeholder="e.g., Manager"
                                    value={formData.name}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Description</FormLabel>
                                <Textarea
                                    placeholder="Describe what this role can do..."
                                    value={formData.description}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Permissions</FormLabel>
                                <CheckboxGroup value={formData.permissions} onChange={(values) => handlePermissionChange(values as string[])}>
                                    <SimpleGrid columns={2} spacing={2}>
                                        {AVAILABLE_PERMISSIONS.map((permission) => (
                                            <Checkbox key={permission} value={permission}>
                                                {permission}
                                            </Checkbox>
                                        ))}
                                    </SimpleGrid>
                                </CheckboxGroup>
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button
                            colorScheme="brand"
                            onClick={handleSubmit}
                            isLoading={createRoleMutation.isPending || updateRoleMutation.isPending}
                            isDisabled={!formData.name}
                        >
                            {isEditing ? 'Update Role' : 'Create Role'}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Delete Role Confirmation */}
            <AlertDialog
                isOpen={isDeleteOpen}
                leastDestructiveRef={cancelRef}
                onClose={onDeleteClose}
            >
                <AlertDialogOverlay bg="blackAlpha.600" backdropFilter="blur(5px)">
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Delete Role
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Are you sure you want to delete the role <strong>{selectedRoleName}</strong>? This action cannot be undone.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onDeleteClose}>
                                Cancel
                            </Button>
                            <Button
                                colorScheme="red"
                                onClick={handleDeleteRole}
                                ml={3}
                                isLoading={deleteRoleMutation.isPending}
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
