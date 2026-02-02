'use client';

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Badge,
  Card,
  CardBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Center,
  Icon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Alert,
  AlertIcon,
  AlertDescription,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  useToast,
  useColorModeValue,
  IconButton,
  Flex,
} from '@chakra-ui/react';
import { ArrowBackIcon, CheckIcon, ViewIcon } from '@chakra-ui/icons';
import { FiPackage, FiAlertTriangle, FiCheck, FiX } from 'react-icons/fi';
import Link from 'next/link';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { marketplaceService } from '@/services/marketplaceService';
import { MarketplaceApp, MarketplaceInstallEnriched } from '@/types/marketplace';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { formatDate } from '@/utils/date-utils';

function getStatusColor(status?: string) {
  switch (status) {
    case 'approved':
      return 'green';
    case 'pending':
      return 'yellow';
    case 'rejected':
      return 'red';
    case 'archived':
      return 'gray';
    default:
      return 'gray';
  }
}

export default function MarketplaceAdminPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedApp, setSelectedApp] = useState<MarketplaceApp | null>(null);

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  const tableBg = useColorModeValue('gray.50', 'gray.700');

  const {
    data: apps,
    isLoading: appsLoading,
    error: appsError,
  } = useQuery<MarketplaceApp[]>({
    queryKey: ['admin-marketplace-apps'],
    queryFn: () => marketplaceService.adminListApps(),
  });

  const {
    data: installs,
    isLoading: installsLoading,
    error: installsError,
  } = useQuery<MarketplaceInstallEnriched[]>({
    queryKey: ['admin-marketplace-installs'],
    queryFn: () => marketplaceService.adminListInstalls(),
  });

  const approveMutation = useMutation({
    mutationFn: (appId: string) => marketplaceService.approveApp(appId),
    onSuccess: () => {
      toast({
        title: 'App approved',
        status: 'success',
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-marketplace-apps'] });
      onClose();
    },
    onError: (err: any) => {
      toast({
        title: 'Approval failed',
        description: err.message || 'Please try again',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const handleApprove = (app: MarketplaceApp) => {
    setSelectedApp(app);
    onOpen();
  };

  const confirmApprove = () => {
    if (selectedApp?.id) {
      approveMutation.mutate(selectedApp.id);
    }
  };

  const pendingApps = apps?.filter((a) => a.status === 'pending') || [];
  const approvedApps = apps?.filter((a) => a.status === 'approved') || [];
  const otherApps = apps?.filter((a) => !['pending', 'approved'].includes(a.status || '')) || [];

  return (
    <ProtectedRoute>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <HStack>
            <IconButton
              as={Link}
              href="/dashboard/marketplace"
              aria-label="Back to marketplace"
              icon={<ArrowBackIcon />}
              variant="ghost"
            />
            <Box>
              <Heading size="lg">Marketplace Admin</Heading>
              <Text color={mutedColor}>Review and manage marketplace apps</Text>
            </Box>
          </HStack>

          {/* Stats */}
          <Flex gap={4} flexWrap="wrap">
            <Card bg={cardBg} border="1px" borderColor={borderColor} flex="1" minW="150px">
              <CardBody textAlign="center">
                <Text fontSize="3xl" fontWeight="bold" color="yellow.500">
                  {pendingApps.length}
                </Text>
                <Text color={mutedColor}>Pending Review</Text>
              </CardBody>
            </Card>
            <Card bg={cardBg} border="1px" borderColor={borderColor} flex="1" minW="150px">
              <CardBody textAlign="center">
                <Text fontSize="3xl" fontWeight="bold" color="green.500">
                  {approvedApps.length}
                </Text>
                <Text color={mutedColor}>Approved</Text>
              </CardBody>
            </Card>
            <Card bg={cardBg} border="1px" borderColor={borderColor} flex="1" minW="150px">
              <CardBody textAlign="center">
                <Text fontSize="3xl" fontWeight="bold" color="brand.500">
                  {installs?.length || 0}
                </Text>
                <Text color={mutedColor}>Total Installs</Text>
              </CardBody>
            </Card>
          </Flex>

          <Tabs>
            <TabList>
              <Tab>
                Pending ({pendingApps.length})
              </Tab>
              <Tab>All Apps ({apps?.length || 0})</Tab>
              <Tab>Installs ({installs?.length || 0})</Tab>
            </TabList>

            <TabPanels>
              {/* Pending Apps */}
              <TabPanel px={0}>
                {appsLoading && (
                  <Center py={10}>
                    <Spinner size="xl" />
                  </Center>
                )}

                {appsError && (
                  <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    <AlertDescription>Failed to load apps.</AlertDescription>
                  </Alert>
                )}

                {!appsLoading && pendingApps.length === 0 && (
                  <Center py={10}>
                    <VStack>
                      <Icon as={FiCheck} boxSize={12} color="green.500" />
                      <Text color={mutedColor}>No pending apps to review</Text>
                    </VStack>
                  </Center>
                )}

                {pendingApps.length > 0 && (
                  <Card bg={cardBg} border="1px" borderColor={borderColor}>
                    <Box overflowX="auto">
                      <Table>
                        <Thead bg={tableBg}>
                          <Tr>
                            <Th>App</Th>
                            <Th>Version</Th>
                            <Th>Author</Th>
                            <Th>Lint</Th>
                            <Th>Submitted</Th>
                            <Th>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {pendingApps.map((app) => (
                            <Tr key={app.id}>
                              <Td>
                                <VStack align="start" spacing={0}>
                                  <Text fontWeight="medium">{app.name}</Text>
                                  <Text fontSize="xs" color={mutedColor}>
                                    {app.manifest?.marketplace?.category || 'general'}
                                  </Text>
                                </VStack>
                              </Td>
                              <Td>{app.manifest?.version || '1.0.0'}</Td>
                              <Td>{app.manifest?.author || 'Unknown'}</Td>
                              <Td>
                                {app.lintValid ? (
                                  <Badge colorScheme="green">Valid</Badge>
                                ) : app.lintWarnings?.length ? (
                                  <Badge colorScheme="yellow">
                                    {app.lintWarnings.length} warnings
                                  </Badge>
                                ) : (
                                  <Badge>Unknown</Badge>
                                )}
                              </Td>
                              <Td>{app.createdAt ? formatDate(app.createdAt) : '-'}</Td>
                              <Td>
                                <HStack>
                                  <IconButton
                                    as={Link}
                                    href={`/dashboard/marketplace/${app.id}`}
                                    aria-label="View app"
                                    icon={<ViewIcon />}
                                    size="sm"
                                    variant="ghost"
                                  />
                                  <Button
                                    size="sm"
                                    colorScheme="green"
                                    leftIcon={<CheckIcon />}
                                    onClick={() => handleApprove(app)}
                                  >
                                    Approve
                                  </Button>
                                </HStack>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  </Card>
                )}
              </TabPanel>

              {/* All Apps */}
              <TabPanel px={0}>
                {appsLoading && (
                  <Center py={10}>
                    <Spinner size="xl" />
                  </Center>
                )}

                {!appsLoading && (!apps || apps.length === 0) && (
                  <Center py={10}>
                    <VStack>
                      <Icon as={FiPackage} boxSize={12} color={mutedColor} />
                      <Text color={mutedColor}>No apps submitted yet</Text>
                    </VStack>
                  </Center>
                )}

                {apps && apps.length > 0 && (
                  <Card bg={cardBg} border="1px" borderColor={borderColor}>
                    <Box overflowX="auto">
                      <Table>
                        <Thead bg={tableBg}>
                          <Tr>
                            <Th>App</Th>
                            <Th>Status</Th>
                            <Th>Visibility</Th>
                            <Th>Type</Th>
                            <Th>Version</Th>
                            <Th>Created</Th>
                            <Th>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {apps.map((app) => (
                            <Tr key={app.id}>
                              <Td>
                                <Text fontWeight="medium">{app.name}</Text>
                              </Td>
                              <Td>
                                <Badge colorScheme={getStatusColor(app.status)}>
                                  {app.status}
                                </Badge>
                              </Td>
                              <Td>
                                <Badge variant="outline">{app.visibility}</Badge>
                              </Td>
                              <Td>{app.type || 'external'}</Td>
                              <Td>{app.manifest?.version || '1.0.0'}</Td>
                              <Td>{app.createdAt ? formatDate(app.createdAt) : '-'}</Td>
                              <Td>
                                <HStack>
                                  <IconButton
                                    as={Link}
                                    href={`/dashboard/marketplace/${app.id}`}
                                    aria-label="View app"
                                    icon={<ViewIcon />}
                                    size="sm"
                                    variant="ghost"
                                  />
                                  {app.status === 'pending' && (
                                    <Button
                                      size="sm"
                                      colorScheme="green"
                                      onClick={() => handleApprove(app)}
                                    >
                                      Approve
                                    </Button>
                                  )}
                                </HStack>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  </Card>
                )}
              </TabPanel>

              {/* Installs */}
              <TabPanel px={0}>
                {installsLoading && (
                  <Center py={10}>
                    <Spinner size="xl" />
                  </Center>
                )}

                {installsError && (
                  <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    <AlertDescription>Failed to load installs.</AlertDescription>
                  </Alert>
                )}

                {!installsLoading && (!installs || installs.length === 0) && (
                  <Center py={10}>
                    <VStack>
                      <Icon as={FiPackage} boxSize={12} color={mutedColor} />
                      <Text color={mutedColor}>No installations yet</Text>
                    </VStack>
                  </Center>
                )}

                {installs && installs.length > 0 && (
                  <Card bg={cardBg} border="1px" borderColor={borderColor}>
                    <Box overflowX="auto">
                      <Table>
                        <Thead bg={tableBg}>
                          <Tr>
                            <Th>App</Th>
                            <Th>Project ID</Th>
                            <Th>Installer</Th>
                            <Th>Payment</Th>
                            <Th>Installed</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {installs.map((item) => (
                            <Tr key={item.install.id}>
                              <Td>
                                <Text fontWeight="medium">
                                  {item.app?.name || item.install.appId}
                                </Text>
                              </Td>
                              <Td>
                                <Text fontSize="sm" fontFamily="mono">
                                  {item.install.projectId.slice(0, 8)}...
                                </Text>
                              </Td>
                              <Td>
                                <Text fontSize="sm" fontFamily="mono">
                                  {item.install.installerUserId.slice(0, 8)}...
                                </Text>
                              </Td>
                              <Td>
                                {item.paymentIntent ? (
                                  <Badge
                                    colorScheme={
                                      item.paymentIntent.status === 'succeeded'
                                        ? 'green'
                                        : 'yellow'
                                    }
                                  >
                                    {item.paymentIntent.status} - $
                                    {(item.paymentIntent.amount / 100).toFixed(2)}
                                  </Badge>
                                ) : (
                                  <Badge colorScheme="gray">Free</Badge>
                                )}
                              </Td>
                              <Td>{item.install.createdAt ? formatDate(item.install.createdAt) : '-'}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  </Card>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>

        {/* Approve Modal */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Approve App</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <Text>
                  Are you sure you want to approve <strong>{selectedApp?.name}</strong>?
                </Text>

                {selectedApp?.lintWarnings && selectedApp.lintWarnings.length > 0 && (
                  <Alert status="warning" borderRadius="md">
                    <AlertIcon />
                    <Box>
                      <Text fontWeight="bold">Lint Warnings Present</Text>
                      <Text fontSize="sm">
                        This app has {selectedApp.lintWarnings.length} warning(s).
                      </Text>
                    </Box>
                  </Alert>
                )}

                <Text fontSize="sm" color={mutedColor}>
                  Once approved, this app will be visible in the public marketplace and
                  available for installation.
                </Text>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="green"
                onClick={confirmApprove}
                isLoading={approveMutation.isPending}
              >
                Approve
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Container>
    </ProtectedRoute>
  );
}
