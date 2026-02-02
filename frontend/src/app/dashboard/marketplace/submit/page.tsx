'use client';

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Textarea,
  Select,
  Button,
  Card,
  CardBody,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Checkbox,
  Badge,
  Alert,
  AlertIcon,
  AlertDescription,
  Code,
  useToast,
  useColorModeValue,
  IconButton,
  Divider,
  InputGroup,
  InputLeftAddon,
} from '@chakra-ui/react';
import { ArrowBackIcon, AddIcon } from '@chakra-ui/icons';
import { FiUpload, FiDatabase } from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { marketplaceService } from '@/services/marketplaceService';
import { MARKETPLACE_CATEGORIES, MarketplaceCategory, MarketplaceEntity, SubmitAppPayload } from '@/types/marketplace';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { EntityDesigner } from '@/components/marketplace/EntityDesigner';

const LICENSES = [
  { value: 'MIT', label: 'MIT' },
  { value: 'Apache-2.0', label: 'Apache 2.0' },
  { value: 'BSD-3-Clause', label: 'BSD 3-Clause' },
  { value: 'ISC', label: 'ISC' },
  { value: 'GPL-3.0', label: 'GPL 3.0' },
  { value: 'LGPL-3.0', label: 'LGPL 3.0' },
];

const APP_TYPES = [
  { value: 'schema', label: 'Schema Only (No Code)' },
  { value: 'external', label: 'External API' },
  { value: 'serverless', label: 'Serverless Function' },
  { value: 'container', label: 'Container' },
];

const PRICING_MODELS = [
  { value: 'free', label: 'Free' },
  { value: 'one-time', label: 'One-time Purchase' },
  { value: 'subscription', label: 'Subscription' },
];

export default function SubmitAppPage() {
  const router = useRouter();
  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  const codeBg = useColorModeValue('gray.50', 'gray.700');

  // Basic Info
  const [name, setName] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('');
  const [license, setLicense] = useState('MIT');
  const [visibility, setVisibility] = useState<'private' | 'public'>('public');
  const [appType, setAppType] = useState<'schema' | 'external' | 'serverless' | 'container'>('schema');

  // Marketplace
  const [category, setCategory] = useState<MarketplaceCategory>('general');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [documentation, setDocumentation] = useState('');
  const [support, setSupport] = useState('');

  // Pricing
  const [pricingModel, setPricingModel] = useState<'free' | 'one-time' | 'subscription'>('free');
  const [price, setPrice] = useState<number>(0);
  const [currency, setCurrency] = useState('USD');

  // Capabilities
  const [databases, setDatabases] = useState<string[]>(['postgresql']);
  const [cacheSupport, setCacheSupport] = useState(false);
  const [queueSupport, setQueueSupport] = useState(false);
  const [storageSupport, setStorageSupport] = useState(false);
  const [realtimeSupport, setRealtimeSupport] = useState(false);

  // Entities (No-Code Schema Definitions)
  const [entities, setEntities] = useState<MarketplaceEntity[]>([]);

  // Permissions
  const [requiresAuth, setRequiresAuth] = useState(true);
  const [scopes, setScopes] = useState<string[]>(['read:own', 'write:own']);

  // Compatibility
  const [jerichoVersion, setJerichoVersion] = useState('>=1.0.0');

  // Dependencies
  const [requiredApis, setRequiredApis] = useState<string[]>([]);
  const [apiInput, setApiInput] = useState('');

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const addApi = () => {
    if (apiInput.trim() && !requiredApis.includes(apiInput.trim())) {
      setRequiredApis([...requiredApis, apiInput.trim()]);
      setApiInput('');
    }
  };

  const removeApi = (api: string) => {
    setRequiredApis(requiredApis.filter((a) => a !== api));
  };

  const toggleDatabase = (db: string) => {
    if (databases.includes(db)) {
      setDatabases(databases.filter((d) => d !== db));
    } else {
      setDatabases([...databases, db]);
    }
  };

  const toggleScope = (scope: string) => {
    if (scopes.includes(scope)) {
      setScopes(scopes.filter((s) => s !== scope));
    } else {
      setScopes([...scopes, scope]);
    }
  };

  // Validation based on app type
  const isFormValid = (): boolean => {
    // Common required fields
    if (!name.trim()) return false;
    if (!description.trim()) return false;

    if (appType === 'schema') {
      // Schema-only apps require at least one entity with at least one field
      if (entities.length === 0) return false;
      for (const entity of entities) {
        if (!entity.name.trim()) return false;
        if (entity.fields.length === 0) return false;
        for (const field of entity.fields) {
          if (!field.name.trim()) return false;
        }
      }
      return true;
    }

    // Other types require version and other fields
    if (!version.trim()) return false;
    return true;
  };

  const submitMutation = useMutation({
    mutationFn: (payload: SubmitAppPayload) => marketplaceService.submitApp(payload),
    onSuccess: (data) => {
      toast({
        title: 'App submitted successfully',
        description: data.lintWarnings?.length
          ? `${data.lintWarnings.length} warnings found`
          : 'Your app is pending review',
        status: 'success',
        duration: 5000,
      });
      router.push(`/dashboard/marketplace/${data.app.id}`);
    },
    onError: (err: any) => {
      toast({
        title: 'Submission failed',
        description: err.message || 'Please try again',
        status: 'error',
        duration: 5000,
      });
    },
  });

  const handleSubmit = () => {
    if (!isFormValid()) {
      toast({ title: 'Please fill all required fields', status: 'warning', duration: 3000 });
      return;
    }

    // Build payload based on app type
    let payload: SubmitAppPayload;

    if (appType === 'schema') {
      // Schema-only apps have a simplified manifest
      payload = {
        name: name.trim(),
        description: description.trim(),
        visibility,
        type: 'schema',
        manifest: {
          name: name.trim(),
          version: '1.0.0',
          description: description.trim(),
          entities,
          marketplace: {
            category,
            tags: tags.length > 0 ? tags : undefined,
          },
          pricing:
            pricingModel !== 'free'
              ? {
                  model: pricingModel,
                  price: price * 100,
                  currency,
                }
              : undefined,
        },
      };
    } else {
      // Full manifest for other types
      payload = {
        name: name.trim(),
        description: description.trim(),
        visibility,
        type: appType,
        manifest: {
          name: name.trim(),
          version: version.trim(),
          description: description.trim(),
          author: author.trim(),
          license,
          entry: 'bootstrap.ts',
          compatibility: {
            jericho: jerichoVersion,
          },
          capabilities: {
            database: databases,
            cache: cacheSupport,
            queue: queueSupport,
            storage: storageSupport,
            realtime: realtimeSupport,
          },
          permissions: {
            requiresAuth,
            scopes,
          },
          entities: entities.length > 0 ? entities : undefined,
          requiredApis: requiredApis.length > 0 ? requiredApis : undefined,
          marketplace: {
            category,
            tags: tags.length > 0 ? tags : undefined,
            documentation: documentation.trim() || undefined,
            support: support.trim() || undefined,
          },
          pricing:
            pricingModel !== 'free'
              ? {
                  model: pricingModel,
                  price: price * 100,
                  currency,
                }
              : undefined,
        },
      };
    }

    submitMutation.mutate(payload);
  };

  // Preview manifest changes based on type
  const previewManifest = appType === 'schema'
    ? {
        name: name || 'inventory-manager',
        description: description || 'Manage your product inventory',
        entities: entities.length > 0 ? entities : [
          {
            name: 'Product',
            fields: [
              { name: 'name', type: 'string', required: true },
              { name: 'price', type: 'number', required: true },
            ],
          },
        ],
        marketplace: {
          category,
          tags: tags.length > 0 ? tags : undefined,
        },
        pricing: pricingModel !== 'free' ? { model: pricingModel, price: price * 100, currency } : undefined,
      }
    : {
        name: name || 'my-module',
        version: version || '1.0.0',
        description: description || 'A new Jericho module',
        author: author || 'Your Name <email@example.com>',
        license,
        entry: 'bootstrap.ts',
        compatibility: { jericho: jerichoVersion },
        capabilities: {
          database: databases,
          cache: cacheSupport,
          queue: queueSupport,
          storage: storageSupport,
          realtime: realtimeSupport,
        },
        permissions: { requiresAuth, scopes },
        entities: entities.length > 0 ? entities : undefined,
        requiredApis: requiredApis.length > 0 ? requiredApis : undefined,
        marketplace: {
          category,
          tags: tags.length > 0 ? tags : undefined,
          documentation: documentation || undefined,
          support: support || undefined,
        },
        pricing: pricingModel !== 'free' ? { model: pricingModel, price: price * 100, currency } : undefined,
      };

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
              <Heading size="lg">Submit App to Marketplace</Heading>
              <Text color={mutedColor}>Create a new module for the Jericho ecosystem</Text>
            </Box>
          </HStack>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
            {/* Form */}
            <VStack spacing={6} align="stretch">
              <Tabs>
                <TabList>
                  <Tab>Basic Info</Tab>
                  <Tab>Entities</Tab>
                  {appType !== 'schema' && <Tab>Marketplace</Tab>}
                  {appType !== 'schema' && <Tab>Capabilities</Tab>}
                  {appType !== 'schema' && <Tab>Permissions</Tab>}
                </TabList>

                <TabPanels>
                  {/* Basic Info */}
                  <TabPanel px={0}>
                    <Card bg={cardBg} border="1px" borderColor={borderColor}>
                      <CardBody>
                        <VStack spacing={4} align="stretch">
                          {/* Type selector - always shown first */}
                          <FormControl isRequired>
                            <FormLabel>App Type</FormLabel>
                            <Select
                              value={appType}
                              onChange={(e) =>
                                setAppType(
                                  e.target.value as 'schema' | 'external' | 'serverless' | 'container'
                                )
                              }
                            >
                              {APP_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>
                                  {t.label}
                                </option>
                              ))}
                            </Select>
                            <FormHelperText>
                              {appType === 'schema'
                                ? 'Define data entities - no code required!'
                                : 'Write custom code for advanced functionality'}
                            </FormHelperText>
                          </FormControl>

                          <Divider />

                          <FormControl isRequired>
                            <FormLabel>App Name</FormLabel>
                            <Input
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder={appType === 'schema' ? 'inventory-manager' : 'my-awesome-module'}
                            />
                            <FormHelperText>Use lowercase with hyphens</FormHelperText>
                          </FormControl>

                          <FormControl isRequired>
                            <FormLabel>Description</FormLabel>
                            <Textarea
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              placeholder={appType === 'schema' ? 'Manage your product inventory' : 'What does your module do?'}
                              rows={3}
                            />
                          </FormControl>

                          {/* Fields only for non-schema types */}
                          {appType !== 'schema' && (
                            <>
                              <FormControl isRequired>
                                <FormLabel>Version</FormLabel>
                                <Input
                                  value={version}
                                  onChange={(e) => setVersion(e.target.value)}
                                  placeholder="1.0.0"
                                />
                                <FormHelperText>Semantic versioning (e.g., 1.0.0)</FormHelperText>
                              </FormControl>

                              <FormControl>
                                <FormLabel>Author</FormLabel>
                                <Input
                                  value={author}
                                  onChange={(e) => setAuthor(e.target.value)}
                                  placeholder="Your Name <email@example.com>"
                                />
                              </FormControl>

                              <HStack spacing={4}>
                                <FormControl>
                                  <FormLabel>License</FormLabel>
                                  <Select
                                    value={license}
                                    onChange={(e) => setLicense(e.target.value)}
                                  >
                                    {LICENSES.map((l) => (
                                      <option key={l.value} value={l.value}>
                                        {l.label}
                                      </option>
                                    ))}
                                  </Select>
                                </FormControl>

                                <FormControl>
                                  <FormLabel>Visibility</FormLabel>
                                  <Select
                                    value={visibility}
                                    onChange={(e) =>
                                      setVisibility(e.target.value as 'private' | 'public')
                                    }
                                  >
                                    <option value="public">Public</option>
                                    <option value="private">Private</option>
                                  </Select>
                                </FormControl>
                              </HStack>

                              <FormControl>
                                <FormLabel>Jericho Compatibility</FormLabel>
                                <Input
                                  value={jerichoVersion}
                                  onChange={(e) => setJerichoVersion(e.target.value)}
                                  placeholder=">=1.0.0"
                                />
                              </FormControl>
                            </>
                          )}
                        </VStack>
                      </CardBody>
                    </Card>
                  </TabPanel>

                  {/* Entities (No-Code) */}
                  <TabPanel px={0}>
                    <Card bg={cardBg} border="1px" borderColor={borderColor}>
                      <CardBody>
                        <VStack spacing={4} align="stretch">
                          <HStack>
                            <FiDatabase />
                            <Heading size="sm">Data Entities</Heading>
                          </HStack>
                          <Text fontSize="sm" color={mutedColor}>
                            Define your app&apos;s data structures. Jericho will automatically create
                            database tables and CRUD APIs when users install your app.
                            <strong> No code required!</strong>
                          </Text>

                          <Alert status="info" borderRadius="md">
                            <AlertIcon />
                            <AlertDescription fontSize="sm">
                              Each entity becomes a schema with full CRUD endpoints at{' '}
                              <Code>/api/v1/content/:schemaId</Code>
                            </AlertDescription>
                          </Alert>

                          <EntityDesigner entities={entities} onChange={setEntities} />

                          {entities.length === 0 && (
                            <Text fontSize="sm" color={mutedColor} textAlign="center" py={4}>
                              No entities defined yet. Click &quot;Add Entity&quot; to create your first
                              data structure.
                            </Text>
                          )}
                        </VStack>
                      </CardBody>
                    </Card>
                  </TabPanel>

                  {/* Marketplace - only for non-schema types */}
                  {appType !== 'schema' && (
                    <TabPanel px={0}>
                      <Card bg={cardBg} border="1px" borderColor={borderColor}>
                        <CardBody>
                          <VStack spacing={4} align="stretch">
                            <FormControl>
                              <FormLabel>Category</FormLabel>
                              <Select
                                value={category}
                                onChange={(e) =>
                                  setCategory(e.target.value as MarketplaceCategory)
                                }
                              >
                                {MARKETPLACE_CATEGORIES.map((c) => (
                                  <option key={c.value} value={c.value}>
                                    {c.label}
                                  </option>
                                ))}
                              </Select>
                            </FormControl>

                            <FormControl>
                              <FormLabel>Tags</FormLabel>
                              <HStack>
                                <Input
                                  value={tagInput}
                                  onChange={(e) => setTagInput(e.target.value)}
                                  placeholder="Add a tag"
                                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                />
                                <Button onClick={addTag} leftIcon={<AddIcon />}>
                                  Add
                                </Button>
                              </HStack>
                              <HStack mt={2} flexWrap="wrap" gap={2}>
                                {tags.map((tag) => (
                                  <Badge
                                    key={tag}
                                    colorScheme="brand"
                                    cursor="pointer"
                                    onClick={() => removeTag(tag)}
                                  >
                                    {tag} ×
                                  </Badge>
                                ))}
                              </HStack>
                            </FormControl>

                            <Divider />

                            <Heading size="sm">Pricing</Heading>

                            <FormControl>
                              <FormLabel>Pricing Model</FormLabel>
                              <Select
                                value={pricingModel}
                                onChange={(e) =>
                                  setPricingModel(
                                    e.target.value as 'free' | 'one-time' | 'subscription'
                                  )
                                }
                              >
                                {PRICING_MODELS.map((p) => (
                                  <option key={p.value} value={p.value}>
                                    {p.label}
                                  </option>
                                ))}
                              </Select>
                            </FormControl>

                            {pricingModel !== 'free' && (
                              <HStack>
                                <FormControl>
                                  <FormLabel>Price</FormLabel>
                                  <InputGroup>
                                    <InputLeftAddon>$</InputLeftAddon>
                                    <Input
                                      type="number"
                                      value={price}
                                      onChange={(e) => setPrice(Number(e.target.value))}
                                      min={0}
                                      step={0.01}
                                    />
                                  </InputGroup>
                                </FormControl>

                                <FormControl>
                                  <FormLabel>Currency</FormLabel>
                                  <Select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                  >
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                    <option value="GBP">GBP</option>
                                  </Select>
                                </FormControl>
                              </HStack>
                            )}

                            <Divider />

                            <FormControl>
                              <FormLabel>Documentation URL</FormLabel>
                              <Input
                                value={documentation}
                                onChange={(e) => setDocumentation(e.target.value)}
                                placeholder="https://docs.example.com/my-module"
                              />
                            </FormControl>

                            <FormControl>
                              <FormLabel>Support URL</FormLabel>
                              <Input
                                value={support}
                                onChange={(e) => setSupport(e.target.value)}
                                placeholder="https://github.com/you/my-module/issues"
                              />
                            </FormControl>
                          </VStack>
                        </CardBody>
                      </Card>
                    </TabPanel>
                  )}

                  {/* Capabilities - only for non-schema types */}
                  {appType !== 'schema' && (
                    <TabPanel px={0}>
                      <Card bg={cardBg} border="1px" borderColor={borderColor}>
                        <CardBody>
                          <VStack spacing={4} align="stretch">
                            <FormControl>
                              <FormLabel>Database Support</FormLabel>
                              <SimpleGrid columns={2} spacing={2}>
                                {['postgresql', 'mysql', 'mongodb', 'supabase'].map((db) => (
                                  <Checkbox
                                    key={db}
                                    isChecked={databases.includes(db)}
                                    onChange={() => toggleDatabase(db)}
                                  >
                                    {db.charAt(0).toUpperCase() + db.slice(1)}
                                  </Checkbox>
                                ))}
                              </SimpleGrid>
                            </FormControl>

                            <Divider />

                            <FormControl>
                              <FormLabel>Additional Capabilities</FormLabel>
                              <VStack align="start" spacing={2}>
                                <Checkbox
                                  isChecked={cacheSupport}
                                  onChange={(e) => setCacheSupport(e.target.checked)}
                                >
                                  Cache Support
                                </Checkbox>
                                <Checkbox
                                  isChecked={queueSupport}
                                  onChange={(e) => setQueueSupport(e.target.checked)}
                                >
                                  Queue Support
                                </Checkbox>
                                <Checkbox
                                  isChecked={storageSupport}
                                  onChange={(e) => setStorageSupport(e.target.checked)}
                                >
                                  Storage Support
                                </Checkbox>
                                <Checkbox
                                  isChecked={realtimeSupport}
                                  onChange={(e) => setRealtimeSupport(e.target.checked)}
                                >
                                  Realtime Support
                                </Checkbox>
                              </VStack>
                            </FormControl>

                            <Divider />

                            <FormControl>
                              <FormLabel>Required APIs / Dependencies</FormLabel>
                              <HStack>
                                <Input
                                  value={apiInput}
                                  onChange={(e) => setApiInput(e.target.value)}
                                  placeholder="payment-gateway"
                                  onKeyDown={(e) =>
                                    e.key === 'Enter' && (e.preventDefault(), addApi())
                                  }
                                />
                                <Button onClick={addApi} leftIcon={<AddIcon />}>
                                  Add
                                </Button>
                              </HStack>
                              <HStack mt={2} flexWrap="wrap" gap={2}>
                                {requiredApis.map((api) => (
                                  <Badge
                                    key={api}
                                    colorScheme="orange"
                                    cursor="pointer"
                                    onClick={() => removeApi(api)}
                                  >
                                    {api} ×
                                  </Badge>
                                ))}
                              </HStack>
                            </FormControl>
                          </VStack>
                        </CardBody>
                      </Card>
                    </TabPanel>
                  )}

                  {/* Permissions - only for non-schema types */}
                  {appType !== 'schema' && (
                    <TabPanel px={0}>
                      <Card bg={cardBg} border="1px" borderColor={borderColor}>
                        <CardBody>
                          <VStack spacing={4} align="stretch">
                            <Checkbox
                              isChecked={requiresAuth}
                              onChange={(e) => setRequiresAuth(e.target.checked)}
                            >
                              Requires Authentication
                            </Checkbox>

                            <FormControl>
                              <FormLabel>Required Scopes</FormLabel>
                              <SimpleGrid columns={2} spacing={2}>
                                {['read:own', 'write:own', 'read:all', 'write:all', 'admin'].map(
                                  (scope) => (
                                    <Checkbox
                                      key={scope}
                                      isChecked={scopes.includes(scope)}
                                      onChange={() => toggleScope(scope)}
                                    >
                                      {scope}
                                    </Checkbox>
                                  )
                                )}
                              </SimpleGrid>
                            </FormControl>
                          </VStack>
                        </CardBody>
                      </Card>
                    </TabPanel>
                  )}
                </TabPanels>
              </Tabs>

              <Button
                colorScheme="brand"
                size="lg"
                leftIcon={<FiUpload />}
                onClick={handleSubmit}
                isLoading={submitMutation.isPending}
                isDisabled={!isFormValid()}
              >
                Submit App
              </Button>

              {/* Validation Hints for Schema Type */}
              {appType === 'schema' && !isFormValid() && (
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <AlertDescription fontSize="sm">
                    {!name.trim() && 'Enter an app name. '}
                    {!description.trim() && 'Enter a description. '}
                    {entities.length === 0 && 'Add at least one entity. '}
                    {entities.length > 0 && entities.some(e => !e.name.trim()) && 'All entities need a name. '}
                    {entities.length > 0 && entities.some(e => e.fields.length === 0) && 'All entities need at least one field. '}
                  </AlertDescription>
                </Alert>
              )}
            </VStack>

            {/* Preview */}
            <VStack spacing={4} align="stretch">
              <Heading size="md">Manifest Preview</Heading>
              <Card bg={cardBg} border="1px" borderColor={borderColor}>
                <CardBody>
                  <Box
                    bg={codeBg}
                    p={4}
                    borderRadius="md"
                    overflowX="auto"
                    maxH="600px"
                    overflowY="auto"
                  >
                    <Code
                      display="block"
                      whiteSpace="pre"
                      bg="transparent"
                      fontSize="xs"
                    >
                      {JSON.stringify(previewManifest, null, 2)}
                    </Code>
                  </Box>
                </CardBody>
              </Card>

              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <AlertDescription fontSize="sm">
                  Your app will be reviewed before appearing in the public marketplace.
                  Make sure to follow the{' '}
                  <Link href="#">
                    <Text as="span" color="brand.500" fontWeight="medium">
                      module guidelines
                    </Text>
                  </Link>
                  .
                </AlertDescription>
              </Alert>
            </VStack>
          </SimpleGrid>
        </VStack>
      </Container>
    </ProtectedRoute>
  );
}
