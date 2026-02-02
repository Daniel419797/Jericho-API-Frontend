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
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    FormControl,
    FormLabel,
    Input,
    Select,
    useToast,
    Avatar,
    IconButton,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    InputGroup,
    InputLeftElement,
    useColorModeValue,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
} from '@chakra-ui/react';
import { FiMoreVertical, FiSearch, FiUserPlus, FiEdit2, FiTrash2, FiUserX, FiUserCheck } from 'react-icons/fi';
import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/adminService';
import { formatDate } from '@/utils/date-utils';

export default function UsersPage() {
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [selectedUserName, setSelectedUserName] = useState<string>('');
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteName, setInviteName] = useState('');
    const [inviteRole, setInviteRole] = useState('member');
    const [searchQuery, setSearchQuery] = useState('');

    const { isOpen: isRoleModalOpen, onOpen: onRoleModalOpen, onClose: onRoleModalClose } = useDisclosure();
    const { isOpen: isInviteModalOpen, onOpen: onInviteModalOpen, onClose: onInviteModalClose } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const cancelRef = useRef<HTMLButtonElement>(null);

    const queryClient = useQueryClient();
    const toast = useToast();

    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const rowHoverBg = useColorModeValue('gray.50', 'gray.700');
    const mutedColor = useColorModeValue('gray.500', 'gray.400');

    const {
        data: users,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['admin-users'],
        queryFn: () => adminService.getUsers({ limit: 100 }),
    });

    const {
        data: roles,
    } = useQuery({
        queryKey: ['admin-roles'],
        queryFn: () => adminService.getRoles(),
    });

    const updateRoleMutation = useMutation({
        mutationFn: (data: { userId: string; role: string }) => adminService.updateUserRole(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            onRoleModalClose();
            toast({
                title: 'Role updated',
                description: 'User role has been updated successfully',
                status: 'success',
                duration: 3000,
            });
        },
        onError: (error) => {
            toast({
                title: 'Update failed',
                description: error instanceof Error ? error.message : 'Failed to update user role',
                status: 'error',
                duration: 5000,
            });
        },
    });

    const inviteUserMutation = useMutation({
        mutationFn: (data: { email: string; name: string; role: string }) => adminService.inviteUser(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            onInviteModalClose();
            setInviteEmail('');
            setInviteName('');
            setInviteRole('member');
            toast({
                title: 'Invitation sent',
                description: 'User invitation has been sent successfully',
                status: 'success',
                duration: 3000,
            });
        },
        onError: (error) => {
            toast({
                title: 'Invitation failed',
                description: error instanceof Error ? error.message : 'Failed to send invitation',
                status: 'error',
                duration: 5000,
            });
        },
    });

    const deleteUserMutation = useMutation({
        mutationFn: (userId: string) => adminService.deleteUser(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            onDeleteClose();
            setSelectedUserId(null);
            setSelectedUserName('');
            toast({
                title: 'User deleted',
                description: 'User has been deleted successfully',
                status: 'success',
                duration: 3000,
            });
        },
        onError: (error) => {
            toast({
                title: 'Delete failed',
                description: error instanceof Error ? error.message : 'Failed to delete user',
                status: 'error',
                duration: 5000,
            });
        },
    });

    const handleOpenRoleModal = (userId: string, currentRole: string) => {
        setSelectedUserId(userId);
        setSelectedRole(currentRole);
        onRoleModalOpen();
    };

    const handleUpdateRole = () => {
        if (selectedUserId && selectedRole) {
            updateRoleMutation.mutate({ userId: selectedUserId, role: selectedRole });
        }
    };

    const handleInviteUser = () => {
        if (inviteEmail && inviteName && inviteRole) {
            inviteUserMutation.mutate({ email: inviteEmail, name: inviteName, role: inviteRole });
        }
    };

    const handleOpenDeleteDialog = (userId: string, userName: string) => {
        setSelectedUserId(userId);
        setSelectedUserName(userName);
        onDeleteOpen();
    };

    const handleDeleteUser = () => {
        if (selectedUserId) {
            deleteUserMutation.mutate(selectedUserId);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'green';
            case 'inactive':
                return 'red';
            case 'pending':
                return 'yellow';
            default:
                return 'gray';
        }
    };

    const filteredUsers = (Array.isArray(users) ? users : users?.data ?? []).filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Box>
            {/* Page Header */}
            <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'stretch', md: 'center' }} gap={4} mb={6}>
                <Box>
                    <Heading as="h1" size={{ base: 'lg', md: 'xl' }} mb={2}>
                        Users
                    </Heading>
                    <Text color={mutedColor} fontSize={{ base: 'sm', md: 'md' }}>
                        Manage user accounts and permissions
                    </Text>
                </Box>
                <Button leftIcon={<FiUserPlus />} colorScheme="brand" onClick={onInviteModalOpen} w={{ base: 'full', md: 'auto' }}>
                    Invite User
                </Button>
            </Flex>

            {/* Search */}
            <InputGroup maxW={{ base: 'full', md: '400px' }} mb={6}>
                <InputLeftElement pointerEvents="none">
                    <FiSearch color="gray" />
                </InputLeftElement>
                <Input
                    placeholder="Search users..."
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
                        Failed to load users. {error instanceof Error ? error.message : 'Please try again.'}
                    </AlertDescription>
                </Alert>
            )}

            {filteredUsers && (
                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} overflowX="auto">
                    <CardBody p={0}>
                        <Table size={{ base: 'sm', md: 'md' }} minW="800px">
                            <Thead>
                                <Tr>
                                    <Th>User</Th>
                                    <Th>Role</Th>
                                    <Th>Status</Th>
                                    <Th>Created</Th>
                                    <Th>Last Login</Th>
                                    <Th width="50px"></Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {filteredUsers.map((user) => (
                                    <Tr key={user.id} _hover={{ bg: rowHoverBg }}>
                                        <Td>
                                            <HStack spacing={3}>
                                                <Avatar size="sm" name={user.name} bg="brand.500" />
                                                <VStack align="start" spacing={0}>
                                                    <Text fontWeight="medium">{user.name}</Text>
                                                    <Text fontSize="sm" color={mutedColor}>{user.email}</Text>
                                                </VStack>
                                            </HStack>
                                        </Td>
                                        <Td>
                                            <Badge colorScheme="blue" variant="subtle">{user.role}</Badge>
                                        </Td>
                                        <Td>
                                            <Badge colorScheme={getStatusColor(user.status)} variant="subtle">
                                                {user.status}
                                            </Badge>
                                        </Td>
                                        <Td>
                                            <Text fontSize="sm" color={mutedColor}>{formatDate(user.createdAt)}</Text>
                                        </Td>
                                        <Td>
                                            <Text fontSize="sm" color={mutedColor}>
                                                {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
                                            </Text>
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
                                                    <MenuItem icon={<FiEdit2 />} onClick={() => handleOpenRoleModal(user.id, user.role)}>
                                                        Edit Role
                                                    </MenuItem>
                                                    <MenuItem 
                                                        icon={<FiTrash2 />} 
                                                        color="red.500"
                                                        onClick={() => handleOpenDeleteDialog(user.id, user.name)}
                                                    >
                                                        Delete User
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

            {/* Edit Role Modal */}
            <Modal isOpen={isRoleModalOpen} onClose={onRoleModalClose}>
                <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(5px)" />
                <ModalContent>
                    <ModalHeader>Edit User Role</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl>
                            <FormLabel>Role</FormLabel>
                            <Select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                                {roles?.map((role) => (
                                    <option key={role.id} value={role.name}>
                                        {role.name}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onRoleModalClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="brand" onClick={handleUpdateRole} isLoading={updateRoleMutation.isPending}>
                            Update Role
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Invite User Modal */}
            <Modal isOpen={isInviteModalOpen} onClose={onInviteModalClose}>
                <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(5px)" />
                <ModalContent>
                    <ModalHeader>Invite User</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Email</FormLabel>
                                <Input
                                    type="email"
                                    placeholder="user@example.com"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Name</FormLabel>
                                <Input placeholder="Full Name" value={inviteName} onChange={(e) => setInviteName(e.target.value)} />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Role</FormLabel>
                                <Select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                                    {roles?.map((role) => (
                                        <option key={role.id} value={role.name}>
                                            {role.name}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onInviteModalClose}>
                            Cancel
                        </Button>
                        <Button
                            colorScheme="brand"
                            onClick={handleInviteUser}
                            isLoading={inviteUserMutation.isPending}
                            isDisabled={!inviteEmail || !inviteName || !inviteRole}
                        >
                            Send Invitation
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Delete User Confirmation */}
            <AlertDialog
                isOpen={isDeleteOpen}
                leastDestructiveRef={cancelRef}
                onClose={onDeleteClose}
            >
                <AlertDialogOverlay bg="blackAlpha.600" backdropFilter="blur(5px)">
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Delete User
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Are you sure you want to delete <strong>{selectedUserName}</strong>? This action cannot be undone.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onDeleteClose}>
                                Cancel
                            </Button>
                            <Button
                                colorScheme="red"
                                onClick={handleDeleteUser}
                                ml={3}
                                isLoading={deleteUserMutation.isPending}
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
