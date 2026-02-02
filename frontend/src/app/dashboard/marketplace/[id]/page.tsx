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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spinner,
  Center,
  Icon,
  Divider,
  List,
  ListItem,
  ListIcon,
  Code,
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
  Select,
  useDisclosure,
  useToast,
  useColorModeValue,
  IconButton,
  SimpleGrid,
  Flex,
} from '@chakra-ui/react';
import { ArrowBackIcon, CheckIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import {
  FiPackage,
  FiUser,
  FiCalendar,
  FiDatabase,
  FiShield,
  FiCheck,
  FiAlertTriangle,
  FiDownload,
  FiCode,
  FiBook,
  FiGitBranch,
} from 'react-icons/fi';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { marketplaceService } from '@/services/marketplaceService';
import { projectService } from '@/services/projectService';
import { MarketplaceApp } from '@/types/marketplace';
import { Project } from '@/types/project';
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

function getPricingLabel(app: MarketplaceApp): string {
  const pricing = app.manifest?.pricing;
  if (!pricing || pricing.model === 'free' || !pricing.price) {
    return 'Free';
  }
  const price = pricing.price / 100;
  const currency = pricing.currency || 'USD';
  return `$${price.toFixed(2)} ${currency}`;
}

export default function MarketplaceAppDetailPage() {
  const params = useParams() as { id?: string };
  const appId = params.id as string;
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedProject, setSelectedProject] = useState<string>('');

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  const codeBg = useColorModeValue('gray.50', 'gray.700');
  const accentBg = useColorModeValue('brand.50', 'brand.900');

  const { data: app, isLoading, error } = useQuery<MarketplaceApp>({
    queryKey: ['marketplace-app', appId],
    queryFn: () => marketplaceService.getApp(appId),
    enabled: !!appId,
  });

  const { data: projects } = useQuery<Project[]>({
    queryKey: ['my-projects'],
    queryFn: () => projectService.getMyProjects(),
  });

  const installMutation = useMutation({
    mutationFn: () =>
      marketplaceService.installApp(appId, { projectId: selectedProject }),
    onSuccess: (data) => {
      toast({
        title: 'App installed successfully',
        status: 'success',
        duration: 3000,
      });
      onClose();
      queryClient.invalidateQueries({ queryKey: ['marketplace-app', appId] });
    },
    onError: (err: any) => {
      toast({
        title: 'Installation failed',
        description: err.message || 'Please try again',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const handleInstall = () => {
    if (!selectedProject) {
      toast({
        title: 'Please select a project',
        status: 'warning',
        duration: 3000,
      });
      return;
    }
    installMutation.mutate();
  };

  if (!appId) {
    return (
      <Center py={20}>
        <Text>App not specified</Text>
      </Center>
    );
  }

  return (
    <ProtectedRoute>
      <Container maxW="container.xl" py={8}>
        {isLoading && (
          <Center py={20}>
            <Spinner size="xl" />
          </Center>
        )}

        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <AlertDescription>Failed to load app details.</AlertDescription>
          </Alert>
        )}

        {app && (
          <VStack spacing={8} align="stretch">
            {/* Header */}
            <HStack justify="space-between" flexWrap="wrap" gap={4}>
              <HStack spacing={4}>
                <IconButton
                  as={Link}
                  href="/dashboard/marketplace"
                  aria-label="Back to marketplace"
                  icon={<ArrowBackIcon />}
                  variant="ghost"
                />
                <Box p={4} bg={accentBg} borderRadius="xl">
                  <Icon as={FiPackage} boxSize={8} color="brand.500" />
                </Box>
                <Box>
                  <HStack>
                    <Heading size="lg">{app.name}</Heading>
                    <Badge colorScheme={getStatusColor(app.status)}>{app.status}</Badge>
                  </HStack>
                  <Text color={mutedColor}>
                    v{app.manifest?.version || '1.0.0'} by{' '}
                    {app.manifest?.author || 'Unknown'}
                  </Text>
                </Box>
              </HStack>

              <HStack spacing={3}>
                <Text fontSize="xl" fontWeight="bold" color="brand.500">
                  {getPricingLabel(app)}
                </Text>
                <Button
                  colorScheme="brand"
                  size="lg"
                  leftIcon={<FiDownload />}
                  onClick={onOpen}
                  isDisabled={app.status !== 'approved'}
                >
                  Install
                </Button>
              </HStack>
            </HStack>

            {/* Warning for non-approved */}
            {app.status !== 'approved' && (
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <AlertDescription>
                  This app is {app.status} and cannot be installed yet.
                </AlertDescription>
              </Alert>
            )}

            {/* Lint Warnings */}
            {app.lintWarnings && app.lintWarnings.length > 0 && (
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <Box>
                  <Text fontWeight="bold">Lint Warnings</Text>
                  {app.lintWarnings.map((w, i) => (
                    <Text key={i} fontSize="sm">
                      • {w}
                    </Text>
                  ))}
                </Box>
              </Alert>
            )}

            {/* Main Content */}
            <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
              {/* Left Column - Description */}
              <Box gridColumn={{ lg: 'span 2' }}>
                <Tabs>
                  <TabList>
                    <Tab>Overview</Tab>
                    <Tab>Configuration</Tab>
                    <Tab>Permissions</Tab>
                  </TabList>

                  <TabPanels>
                    {/* Overview */}
                    <TabPanel px={0}>
                      <Card bg={cardBg} border="1px" borderColor={borderColor}>
                        <CardBody>
                          <VStack align="stretch" spacing={6}>
                            <Box>
                              <Heading size="sm" mb={2}>
                                Description
                              </Heading>
                              <Text color={mutedColor}>
                                {app.description ||
                                  app.manifest?.description ||
                                  'No description provided.'}
                              </Text>
                            </Box>

                            {app.manifest?.marketplace?.tags && (
                              <Box>
                                <Heading size="sm" mb={2}>
                                  Tags
                                </Heading>
                                <HStack flexWrap="wrap" gap={2}>
                                  {app.manifest.marketplace.tags.map((tag) => (
                                    <Badge key={tag} colorScheme="brand" variant="subtle">
                                      {tag}
                                    </Badge>
                                  ))}
                                </HStack>
                              </Box>
                            )}

                            {app.manifest?.capabilities && (
                              <Box>
                                <Heading size="sm" mb={2}>
                                  Capabilities
                                </Heading>
                                <SimpleGrid columns={2} spacing={2}>
                                  {app.manifest.capabilities.database && (
                                    <HStack>
                                      <Icon as={FiDatabase} color="brand.500" />
                                      <Text fontSize="sm">
                                        {app.manifest.capabilities.database.join(', ')}
                                      </Text>
                                    </HStack>
                                  )}
                                  {app.manifest.capabilities.cache && (
                                    <HStack>
                                      <Icon as={FiCheck} color="green.500" />
                                      <Text fontSize="sm">Cache Support</Text>
                                    </HStack>
                                  )}
                                  {app.manifest.capabilities.queue && (
                                    <HStack>
                                      <Icon as={FiCheck} color="green.500" />
                                      <Text fontSize="sm">Queue Support</Text>
                                    </HStack>
                                  )}
                                  {app.manifest.capabilities.storage && (
                                    <HStack>
                                      <Icon as={FiCheck} color="green.500" />
                                      <Text fontSize="sm">Storage Support</Text>
                                    </HStack>
                                  )}
                                  {app.manifest.capabilities.realtime && (
                                    <HStack>
                                      <Icon as={FiCheck} color="green.500" />
                                      <Text fontSize="sm">Realtime Support</Text>
                                    </HStack>
                                  )}
                                </SimpleGrid>
                              </Box>
                            )}

                            {app.manifest?.requiredApis &&
                              app.manifest.requiredApis.length > 0 && (
                                <Box>
                                  <Heading size="sm" mb={2}>
                                    Dependencies
                                  </Heading>
                                  <List spacing={1}>
                                    {app.manifest.requiredApis.map((api) => (
                                      <ListItem key={api} fontSize="sm">
                                        <ListIcon as={FiGitBranch} color="brand.500" />
                                        {api}
                                      </ListItem>
                                    ))}
                                  </List>
                                </Box>
                              )}
                          </VStack>
                        </CardBody>
                      </Card>
                    </TabPanel>

                    {/* Configuration */}
                    <TabPanel px={0}>
                      <Card bg={cardBg} border="1px" borderColor={borderColor}>
                        <CardBody>
                          <VStack align="stretch" spacing={4}>
                            <Heading size="sm">Config Schema</Heading>
                            {app.manifest?.configSchema ? (
                              <Box
                                bg={codeBg}
                                p={4}
                                borderRadius="md"
                                overflowX="auto"
                              >
                                <Code
                                  display="block"
                                  whiteSpace="pre"
                                  bg="transparent"
                                  fontSize="sm"
                                >
                                  {JSON.stringify(app.manifest.configSchema, null, 2)}
                                </Code>
                              </Box>
                            ) : (
                              <Text color={mutedColor}>No configuration required.</Text>
                            )}

                            {app.manifest?.sampleConfig && (
                              <>
                                <Heading size="sm" mt={4}>
                                  Sample Configuration
                                </Heading>
                                <Box
                                  bg={codeBg}
                                  p={4}
                                  borderRadius="md"
                                  overflowX="auto"
                                >
                                  <Code
                                    display="block"
                                    whiteSpace="pre"
                                    bg="transparent"
                                    fontSize="sm"
                                  >
                                    {JSON.stringify(app.manifest.sampleConfig, null, 2)}
                                  </Code>
                                </Box>
                              </>
                            )}
                          </VStack>
                        </CardBody>
                      </Card>
                    </TabPanel>

                    {/* Permissions */}
                    <TabPanel px={0}>
                      <Card bg={cardBg} border="1px" borderColor={borderColor}>
                        <CardBody>
                          <VStack align="stretch" spacing={4}>
                            {app.manifest?.permissions ? (
                              <>
                                <HStack>
                                  <Icon
                                    as={
                                      app.manifest.permissions.requiresAuth
                                        ? FiShield
                                        : FiCheck
                                    }
                                    color={
                                      app.manifest.permissions.requiresAuth
                                        ? 'orange.500'
                                        : 'green.500'
                                    }
                                  />
                                  <Text>
                                    {app.manifest.permissions.requiresAuth
                                      ? 'Requires Authentication'
                                      : 'No Authentication Required'}
                                  </Text>
                                </HStack>

                                {app.manifest.permissions.scopes &&
                                  app.manifest.permissions.scopes.length > 0 && (
                                    <Box>
                                      <Heading size="sm" mb={2}>
                                        Required Scopes
                                      </Heading>
                                      <HStack flexWrap="wrap" gap={2}>
                                        {app.manifest.permissions.scopes.map((scope) => (
                                          <Badge
                                            key={scope}
                                            colorScheme="orange"
                                            variant="subtle"
                                          >
                                            {scope}
                                          </Badge>
                                        ))}
                                      </HStack>
                                    </Box>
                                  )}
                              </>
                            ) : (
                              <Text color={mutedColor}>
                                No special permissions required.
                              </Text>
                            )}
                          </VStack>
                        </CardBody>
                      </Card>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Box>

              {/* Right Column - Info Sidebar */}
              <VStack spacing={4} align="stretch">
                <Card bg={cardBg} border="1px" borderColor={borderColor}>
                  <CardBody>
                    <VStack align="stretch" spacing={4}>
                      <Heading size="sm">App Details</Heading>

                      <HStack justify="space-between">
                        <Text color={mutedColor} fontSize="sm">
                          Version
                        </Text>
                        <Text fontWeight="medium" fontSize="sm">
                          {app.manifest?.version || '1.0.0'}
                        </Text>
                      </HStack>

                      <HStack justify="space-between">
                        <Text color={mutedColor} fontSize="sm">
                          License
                        </Text>
                        <Text fontWeight="medium" fontSize="sm">
                          {app.manifest?.license || 'MIT'}
                        </Text>
                      </HStack>

                      <HStack justify="space-between">
                        <Text color={mutedColor} fontSize="sm">
                          Type
                        </Text>
                        <Badge>{app.type || 'external'}</Badge>
                      </HStack>

                      <HStack justify="space-between">
                        <Text color={mutedColor} fontSize="sm">
                          Category
                        </Text>
                        <Badge colorScheme="brand">
                          {app.manifest?.marketplace?.category || 'general'}
                        </Badge>
                      </HStack>

                      <Divider />

                      <HStack>
                        <Icon as={FiCalendar} color={mutedColor} />
                        <Text fontSize="sm" color={mutedColor}>
                          Created {app.createdAt ? formatDate(app.createdAt) : 'Unknown'}
                        </Text>
                      </HStack>

                      {app.updatedAt && (
                        <HStack>
                          <Icon as={FiCalendar} color={mutedColor} />
                          <Text fontSize="sm" color={mutedColor}>
                            Updated {formatDate(app.updatedAt)}
                          </Text>
                        </HStack>
                      )}
                    </VStack>
                  </CardBody>
                </Card>

                {/* Links */}
                {(app.manifest?.marketplace?.documentation ||
                  app.manifest?.marketplace?.support) && (
                  <Card bg={cardBg} border="1px" borderColor={borderColor}>
                    <CardBody>
                      <VStack align="stretch" spacing={3}>
                        <Heading size="sm">Resources</Heading>

                        {app.manifest?.marketplace?.documentation && (
                          <Button
                            as="a"
                            href={app.manifest.marketplace.documentation}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="outline"
                            size="sm"
                            leftIcon={<FiBook />}
                            rightIcon={<ExternalLinkIcon />}
                          >
                            Documentation
                          </Button>
                        )}

                        {app.manifest?.marketplace?.support && (
                          <Button
                            as="a"
                            href={app.manifest.marketplace.support}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="outline"
                            size="sm"
                            leftIcon={<FiCode />}
                            rightIcon={<ExternalLinkIcon />}
                          >
                            Support / Issues
                          </Button>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>
                )}

                {/* Compatibility */}
                {app.manifest?.compatibility?.jericho && (
                  <Card bg={cardBg} border="1px" borderColor={borderColor}>
                    <CardBody>
                      <VStack align="stretch" spacing={2}>
                        <Heading size="sm">Compatibility</Heading>
                        <HStack>
                          <Icon as={FiCheck} color="green.500" />
                          <Text fontSize="sm">
                            Jericho {app.manifest.compatibility.jericho}
                          </Text>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                )}
              </VStack>
            </SimpleGrid>
          </VStack>
        )}

        {/* Install Modal */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Install {app?.name}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <Text>Select a project to install this app:</Text>
                <Select
                  placeholder="Select project"
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                >
                  {projects?.map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.name}
                    </option>
                  ))}
                </Select>

                {app?.manifest?.pricing?.price && app.manifest.pricing.price > 0 && (
                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <Box>
                      <Text fontWeight="bold">Payment Required</Text>
                      <Text fontSize="sm">
                        This app costs {getPricingLabel(app as MarketplaceApp)}. Payment
                        will be processed after installation.
                      </Text>
                    </Box>
                  </Alert>
                )}
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="brand"
                onClick={handleInstall}
                isLoading={installMutation.isPending}
              >
                Install
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Container>
    </ProtectedRoute>
  );
}
