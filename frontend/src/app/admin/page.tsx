'use client';

import {
  Container,
  Heading,
  Text,
  VStack,
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
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
  HStack,
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
} from '@chakra-ui/react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api-client';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { formatDate } from '@/utils/date-utils';

export default function AdminPage() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('member');

  const { isOpen: isRoleModalOpen, onOpen: onRoleModalOpen, onClose: onRoleModalClose } = useDisclosure();
  const { isOpen: isInviteModalOpen, onOpen: onInviteModalOpen, onClose: onInviteModalClose } = useDisclosure();

  const queryClient = useQueryClient();
  const toast = useToast();

  const {
    data: users,
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => apiClient.getUsers({ limit: 100 }),
  });

  const {
    data: roles,
    isLoading: rolesLoading,
    error: rolesError,
  } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: () => apiClient.getRoles(),
  });

  const updateRoleMutation = useMutation({
    mutationFn: (data: { userId: string; role: string }) => apiClient.updateUserRole(data),
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
    mutationFn: (data: { email: string; name: string; role: string }) => apiClient.inviteUser(data),
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

  return (
    <ProtectedRoute requireAdmin>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Box>
            <HStack justify="space-between" mb={4}>
              <Box>
                <Heading as="h1" size="xl" mb={2}>
                  Admin Panel
                </Heading>
                <Text color="gray.600" _dark={{ color: 'gray.400' }}>
                  Manage users and roles
                </Text>
              </Box>
              <Button colorScheme="brand" onClick={onInviteModalOpen}>
                Invite User
              </Button>
            </HStack>
          </Box>

          <Tabs>
            <TabList>
              <Tab>Users</Tab>
              <Tab>Roles</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                {usersLoading && (
                  <Center py={10}>
                    <Spinner size="xl" />
                  </Center>
                )}

                {usersError && (
                  <Alert status="error">
                    <AlertIcon />
                    <AlertDescription>
                      Failed to load users. {usersError instanceof Error ? usersError.message : 'Please try again.'}
                    </AlertDescription>
                  </Alert>
                )}

                {users && (
                  <Card>
                    <CardBody p={0}>
                      <Table>
                        <Thead>
                          <Tr>
                            <Th>Name</Th>
                            <Th>Email</Th>
                            <Th>Role</Th>
                            <Th>Status</Th>
                            <Th>Created</Th>
                            <Th>Last Login</Th>
                            <Th>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {users.data.map((user) => (
                            <Tr key={user.id}>
                              <Td>{user.name}</Td>
                              <Td>{user.email}</Td>
                              <Td>
                                <Badge colorScheme="blue">{user.role}</Badge>
                              </Td>
                              <Td>
                                <Badge colorScheme={getStatusColor(user.status)}>{user.status}</Badge>
                              </Td>
                              <Td>{formatDate(user.createdAt)}</Td>
                              <Td>{user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}</Td>
                              <Td>
                                <Button size="sm" onClick={() => handleOpenRoleModal(user.id, user.role)}>
                                  Edit Role
                                </Button>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </CardBody>
                  </Card>
                )}
              </TabPanel>

              <TabPanel>
                {rolesLoading && (
                  <Center py={10}>
                    <Spinner />
                  </Center>
                )}

                {rolesError && (
                  <Alert status="error">
                    <AlertIcon />
                    <AlertDescription>
                      Failed to load roles. {rolesError instanceof Error ? rolesError.message : 'Please try again.'}
                    </AlertDescription>
                  </Alert>
                )}

                {roles && (
                  <VStack spacing={4} align="stretch">
                    {roles.map((role) => (
                      <Card key={role.id}>
                        <CardBody>
                          <VStack align="start" spacing={2}>
                            <HStack justify="space-between" w="full">
                              <Heading size="md">{role.name}</Heading>
                              <Badge colorScheme="blue">{role.permissions.length} permissions</Badge>
                            </HStack>
                            <Text color="gray.600" _dark={{ color: 'gray.400' }}>
                              {role.description}
                            </Text>
                            {role.permissions.length > 0 && (
                              <HStack wrap="wrap" spacing={2} mt={2}>
                                {role.permissions.map((permission, idx) => (
                                  <Badge key={idx} variant="outline">
                                    {permission}
                                  </Badge>
                                ))}
                              </HStack>
                            )}
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Container>

      {/* Edit Role Modal */}
      <Modal isOpen={isRoleModalOpen} onClose={onRoleModalClose}>
        <ModalOverlay />
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
        <ModalOverlay />
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
    </ProtectedRoute>
  );
}
