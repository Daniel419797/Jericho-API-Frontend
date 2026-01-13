'use client';

import {
  Container,
  Heading,
  Text,
  VStack,
  Box,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  Button,
  Textarea,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useToast,
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
  HStack,
  Code,
} from '@chakra-ui/react';
import { DeleteIcon, AddIcon } from '@chakra-ui/icons';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api-client';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { formatDate } from '@/utils/date-utils';

export default function SettingsPage() {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyExpiry, setNewKeyExpiry] = useState('90');

  const { isOpen: isKeyModalOpen, onOpen: onKeyModalOpen, onClose: onKeyModalClose } = useDisclosure();
  const queryClient = useQueryClient();
  const toast = useToast();

  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => apiClient.getUserProfile(),
  });

  const {
    data: apiKeys,
    isLoading: keysLoading,
    error: keysError,
  } = useQuery({
    queryKey: ['api-keys'],
    queryFn: () => apiClient.getApiKeys(),
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: { name?: string; bio?: string }) => apiClient.updateUserProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
        status: 'success',
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const createKeyMutation = useMutation({
    mutationFn: (data: { name: string; expiresInDays?: number }) => apiClient.createApiKey(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      onKeyModalClose();
      setNewKeyName('');
      setNewKeyExpiry('90');
      toast({
        title: 'API Key created',
        description: 'Your new API key has been created successfully',
        status: 'success',
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: 'Creation failed',
        description: error instanceof Error ? error.message : 'Failed to create API key',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const deleteKeyMutation = useMutation({
    mutationFn: (keyId: string) => apiClient.deleteApiKey(keyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast({
        title: 'API Key deleted',
        description: 'The API key has been deleted successfully',
        status: 'success',
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: 'Deletion failed',
        description: error instanceof Error ? error.message : 'Failed to delete API key',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const handleUpdateProfile = () => {
    const updates: { name?: string; bio?: string } = {};
    if (name && name !== profile?.name) updates.name = name;
    if (bio !== profile?.bio) updates.bio = bio;

    if (Object.keys(updates).length > 0) {
      updateProfileMutation.mutate(updates);
    }
  };

  const handleCreateKey = () => {
    if (newKeyName) {
      createKeyMutation.mutate({
        name: newKeyName,
        expiresInDays: newKeyExpiry ? parseInt(newKeyExpiry) : undefined,
      });
    }
  };

  // Set initial values when profile loads
  useState(() => {
    if (profile) {
      setName(profile.name);
      setBio(profile.bio || '');
    }
  });

  return (
    <ProtectedRoute>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Box>
            <Heading as="h1" size="xl" mb={2}>
              Settings
            </Heading>
            <Text color="gray.600" _dark={{ color: 'gray.400' }}>
              Manage your account settings
            </Text>
          </Box>

          <Tabs>
            <TabList>
              <Tab>Profile</Tab>
              <Tab>API Keys</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                {profileLoading && (
                  <Center py={10}>
                    <Spinner size="xl" />
                  </Center>
                )}

                {profileError && (
                  <Alert status="error">
                    <AlertIcon />
                    <AlertDescription>
                      Failed to load profile. {profileError instanceof Error ? profileError.message : 'Please try again.'}
                    </AlertDescription>
                  </Alert>
                )}

                {profile && (
                  <Card>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <FormControl>
                          <FormLabel>Email</FormLabel>
                          <Input value={profile.email} isReadOnly bg="gray.50" _dark={{ bg: 'gray.700' }} />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Name</FormLabel>
                          <Input
                            value={name || profile.name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Bio</FormLabel>
                          <Textarea
                            value={bio || profile.bio || ''}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell us about yourself"
                            rows={4}
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Role</FormLabel>
                          <Input value={profile.role} isReadOnly bg="gray.50" _dark={{ bg: 'gray.700' }} />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Member Since</FormLabel>
                          <Input
                            value={formatDate(profile.createdAt)}
                            isReadOnly
                            bg="gray.50"
                            _dark={{ bg: 'gray.700' }}
                          />
                        </FormControl>

                        <Button
                          colorScheme="brand"
                          onClick={handleUpdateProfile}
                          isLoading={updateProfileMutation.isPending}
                        >
                          Save Changes
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
                )}
              </TabPanel>

              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Heading size="md">API Keys</Heading>
                    <Button leftIcon={<AddIcon />} colorScheme="brand" size="sm" onClick={onKeyModalOpen}>
                      Create New Key
                    </Button>
                  </HStack>

                  {keysLoading && (
                    <Center py={10}>
                      <Spinner />
                    </Center>
                  )}

                  {keysError && (
                    <Alert status="error">
                      <AlertIcon />
                      <AlertDescription>
                        Failed to load API keys.{' '}
                        {keysError instanceof Error ? keysError.message : 'Please try again.'}
                      </AlertDescription>
                    </Alert>
                  )}

                  {apiKeys && (
                    <>
                      {apiKeys.length === 0 ? (
                        <Card>
                          <CardBody>
                            <Center py={6}>
                              <VStack spacing={3}>
                                <Text color="gray.500" _dark={{ color: 'gray.400' }}>
                                  No API keys yet
                                </Text>
                                <Button leftIcon={<AddIcon />} colorScheme="brand" size="sm" onClick={onKeyModalOpen}>
                                  Create Your First Key
                                </Button>
                              </VStack>
                            </Center>
                          </CardBody>
                        </Card>
                      ) : (
                        <Card>
                          <CardBody p={0}>
                            <Table>
                              <Thead>
                                <Tr>
                                  <Th>Name</Th>
                                  <Th>Key</Th>
                                  <Th>Created</Th>
                                  <Th>Last Used</Th>
                                  <Th>Expires</Th>
                                  <Th>Actions</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {apiKeys.map((key) => (
                                  <Tr key={key.id}>
                                    <Td>{key.name}</Td>
                                    <Td>
                                      <Code fontSize="xs">{key.key.substring(0, 20)}...</Code>
                                    </Td>
                                    <Td>{formatDate(key.createdAt)}</Td>
                                    <Td>{key.lastUsedAt ? formatDate(key.lastUsedAt) : 'Never'}</Td>
                                    <Td>{key.expiresAt ? formatDate(key.expiresAt) : 'Never'}</Td>
                                    <Td>
                                      <IconButton
                                        aria-label="Delete key"
                                        icon={<DeleteIcon />}
                                        size="sm"
                                        colorScheme="red"
                                        variant="ghost"
                                        onClick={() => deleteKeyMutation.mutate(key.id)}
                                      />
                                    </Td>
                                  </Tr>
                                ))}
                              </Tbody>
                            </Table>
                          </CardBody>
                        </Card>
                      )}
                    </>
                  )}
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Container>

      {/* Create API Key Modal */}
      <Modal isOpen={isKeyModalOpen} onClose={onKeyModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create API Key</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Key Name</FormLabel>
                <Input
                  placeholder="My API Key"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Expires In (days)</FormLabel>
                <Input
                  type="number"
                  placeholder="90"
                  value={newKeyExpiry}
                  onChange={(e) => setNewKeyExpiry(e.target.value)}
                />
                <Text fontSize="sm" color="gray.500" _dark={{ color: 'gray.400' }} mt={1}>
                  Leave empty for no expiration
                </Text>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onKeyModalClose}>
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
          </ModalFooter>
        </ModalContent>
      </Modal>
    </ProtectedRoute>
  );
}
