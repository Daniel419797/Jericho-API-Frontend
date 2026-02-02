'use client';

import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Code,
  IconButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spinner,
  Center,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { projectService } from '@/services/projectService';
import { apiClient } from '@/services/api-client';
import { roleService } from '@/services/roleService';
import { Project } from '@/types/project';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { FiCopy, FiPlus, FiKey } from 'react-icons/fi';
import { ArrowBackIcon } from '@chakra-ui/icons';
import Link from 'next/link';
import { tokenStorage } from '@/utils/token-storage';
import { useMemo } from 'react';

export default function ProjectSettingsPage() {
  const params = useParams() as { id?: string };
  const projectId = params.id as string;
  const router = useRouter();
  const toast = useToast();

  const codeBg = useColorModeValue('gray.100', 'gray.700');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  const panelBg = useColorModeValue('gray.50', 'gray.700');

  const { data: project, isLoading } = useQuery<Project | undefined>({
    queryKey: ['project', projectId],
    queryFn: () => projectService.getProject(projectId),
    enabled: !!projectId,
  });

  // General
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Database
  const [databaseType, setDatabaseType] = useState('POSTGRESQL');
  const [dbHost, setDbHost] = useState('');
  const [dbPort, setDbPort] = useState<number | ''>('');
  const [dbUser, setDbUser] = useState('');
  const [dbPassword, setDbPassword] = useState('');
  const [testing, setTesting] = useState(false);

  // Registration fields
  const [regFields, setRegFields] = useState<any[]>([]);
  const [metadataJson, setMetadataJson] = useState('');

  useEffect(() => {
    if (project) {
      setName(project.name || '');
      setDescription(project.description || '');
      setDatabaseType(project.databaseType || 'POSTGRESQL');
      const cfg = (project.databaseConfig || {}) as any;
      setDbHost(cfg.host || '');
      setDbPort(cfg.port || '');
      setDbUser(cfg.user || '');
      setDbPassword('');
      setRegFields(((project.metadata || {}) as any).registrationFields || []);
      setMetadataJson(JSON.stringify(project.metadata || {}, null, 2));
    }
  }, [project]);

  const saveGeneral = async () => {
    try {
      await projectService.updateProject(projectId, { name, description });
      toast({ title: 'Saved', status: 'success' });
    } catch (err) {
      toast({ title: 'Save failed', status: 'error' });
    }
  };

  const testDb = async () => {
    setTesting(true);
    try {
      const cfg: any = { host: dbHost };
      if (dbPort) cfg.port = dbPort;
      if (dbUser) cfg.user = dbUser;
      if (dbPassword) cfg.password = dbPassword;
      const res = await projectService.testDatabase(projectId, cfg);
      toast({ title: res?.ok ? 'Connection OK' : 'Connection failed', status: res?.ok ? 'success' : 'error', description: res?.message });
    } catch (err: any) {
      toast({ title: 'Test failed', status: 'error', description: err?.message });
    } finally {
      setTesting(false);
    }
  };

  const saveRegFields = async () => {
    try {
      await projectService.patchRegistrationFields(projectId, regFields);
      toast({ title: 'Registration fields updated', status: 'success' });
    } catch (err) {
      toast({ title: 'Update failed', status: 'error' });
    }
  };

  const saveMetadata = async () => {
    try {
      const parsed = JSON.parse(metadataJson || '{}');
      await projectService.updateProject(projectId, { metadata: parsed });
      toast({ title: 'Metadata saved', status: 'success' });
    } catch (err: any) {
      toast({ title: 'Invalid JSON', status: 'error', description: err?.message });
    }
  };

  // API Keys (project-scoped)
  const { isOpen: isKeyOpen, onOpen: onKeyOpen, onClose: onKeyClose } = useDisclosure();
  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const { data: apiKeys, isLoading: keysLoading, refetch: refetchKeys } = useQuery({
    queryKey: ['project-api-keys', projectId],
    queryFn: () => apiClient.request<any[]>(`/api-keys?projectId=${projectId}`),
    enabled: !!projectId,
  });

  const handleCreateKey = async () => {
    if (!newKeyName) return;
    try {
      const res = await apiClient.request<{ rawKey?: string }>('/api-keys', {
        method: 'POST',
        body: JSON.stringify({ name: newKeyName, projectId }),
      });
      setCreatedKey(res.rawKey || null);
      setNewKeyName('');
      refetchKeys();
    } catch (err: any) {
      toast({ title: 'Failed to create API key', status: 'error', description: err?.message });
    }
  };

  const handleRevokeKey = async (id: string) => {
    try {
      await apiClient.request(`/api-keys/${id}`, { method: 'DELETE' });
      toast({ title: 'Key revoked', status: 'success' });
      refetchKeys();
    } catch (err: any) {
      toast({ title: 'Failed to revoke', status: 'error', description: err?.message });
    }
  };

  // Dev admin token generator (client-side UI)
  const [adminEmail, setAdminEmail] = useState('');
  const [adminSub, setAdminSub] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [pasteAccess, setPasteAccess] = useState('');
  const [pasteRefresh, setPasteRefresh] = useState('');

  // Determine visibility client-side to avoid SSR mismatch and to allow localhost
  const showDevAdmin = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const envFlag = process.env.NEXT_PUBLIC_ENABLE_DEV_ADMIN === 'true';
    const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
    return envFlag || isLocal;
  }, []);

  const generateAdminToken = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/dev-admin-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, sub: adminSub, password: adminPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to generate token');

      const tokens = data.tokens ?? data;
      if (!tokens?.accessToken || !tokens?.refreshToken) throw new Error('Invalid response');

      tokenStorage.setTokens({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
      setGeneratedToken(tokens.accessToken);
      toast({ title: 'Admin token generated and stored', status: 'success' });
    } catch (err: any) {
      toast({ title: 'Generate failed', status: 'error', description: err?.message });
    } finally {
      setIsGenerating(false);
    }
  };

  // Modules toggles
  const toggleableModules = ['attendance', 'files', 'messaging', 'notifications', 'roles', 'schemas'];
  const [enabledModules, setEnabledModules] = useState<string[]>([]);

  useEffect(() => {
    if (project) {
      setEnabledModules(((project.metadata || {}).enabledModules as string[]) || []);
    }
  }, [project]);

  const toggleModule = (m: string) => {
    setEnabledModules((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  };

  const saveModules = async () => {
    try {
      const meta = { ...(project?.metadata || {}), enabledModules };
      await projectService.updateProject(projectId, { metadata: meta });
      toast({ title: 'Modules updated', status: 'success' });
    } catch (err: any) {
      toast({ title: 'Save failed', status: 'error', description: err?.message });
    }
  };

  // Roles
  const { data: roles, isLoading: rolesLoading, refetch: refetchRoles } = useQuery({
    queryKey: ['roles', projectId],
    queryFn: () => roleService.listRoles(projectId),
    enabled: !!projectId,
  });

  const [roleName, setRoleName] = useState('');
  const [rolePermissions, setRolePermissions] = useState('manage');

  const createRole = async () => {
    if (!roleName) return toast({ title: 'Name required', status: 'warning' });
    try {
      await roleService.createRole({ name: roleName, projectId, permissions: rolePermissions ? [rolePermissions] : [] });
      setRoleName('');
      refetchRoles();
      toast({ title: 'Role created', status: 'success' });
    } catch (err: any) {
      toast({ title: 'Create failed', status: 'error', description: err?.message });
    }
  };

  const removeRole = async (id: string) => {
    try {
      await roleService.deleteRole(id);
      refetchRoles();
      toast({ title: 'Role deleted', status: 'success' });
    } catch (err: any) {
      toast({ title: 'Delete failed', status: 'error', description: err?.message });
    }
  };

  if (!projectId) return <Center py={20}><Text>Project not specified</Text></Center>;

  return (
    <ProtectedRoute>
      <Box>
        <HStack mb={6}>
          <IconButton
            as={Link}
            href={`/dashboard/projects/${projectId}`}
            aria-label="Back to project"
            icon={<ArrowBackIcon />}
            variant="ghost"
            size="sm"
          />
          <Heading size="lg">Project Settings</Heading>
        </HStack>
        {isLoading && <Center py={10}><Spinner /></Center>}

        {project && (
          <Tabs>
            <TabList>
              <Tab>General</Tab>
              <Tab>Database</Tab>
              <Tab>Registration Fields</Tab>
              <Tab>Metadata</Tab>
              <Tab>Modules</Tab>
              <Tab>API Keys</Tab>
              <Tab>Roles</Tab>
              {showDevAdmin && <Tab>Dev</Tab>}
            </TabList>

            <TabPanels>
              <TabPanel>
                <VStack align="stretch">
                  <FormControl>
                    <FormLabel>Name</FormLabel>
                    <Input value={name} onChange={(e) => setName(e.target.value)} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Description</FormLabel>
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                  </FormControl>
                  <HStack justify="end">
                    <Button onClick={saveGeneral} colorScheme="brand">Save</Button>
                  </HStack>
                </VStack>
              </TabPanel>

              <TabPanel>
                <VStack align="stretch">
                  <FormControl>
                    <FormLabel>Database Type</FormLabel>
                    <Select value={databaseType} onChange={(e) => setDatabaseType(e.target.value)}>
                      <option value="POSTGRESQL">PostgreSQL</option>
                      <option value="MYSQL">MySQL</option>
                      <option value="MONGODB">MongoDB</option>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Host</FormLabel>
                    <Input value={dbHost} onChange={(e) => setDbHost(e.target.value)} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Port</FormLabel>
                    <Input value={dbPort as any} onChange={(e) => setDbPort(e.target.value ? Number(e.target.value) : '')} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>User</FormLabel>
                    <Input value={dbUser} onChange={(e) => setDbUser(e.target.value)} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Password</FormLabel>
                    <Input value={dbPassword} onChange={(e) => setDbPassword(e.target.value)} type="password" />
                  </FormControl>

                  <HStack justify="space-between">
                    <Button onClick={testDb} isLoading={testing}>Test Connection</Button>
                    <Button colorScheme="brand" onClick={() => projectService.updateProject(projectId, { databaseConfig: { host: dbHost, port: dbPort, user: dbUser } }).then(() => toast({ title: 'Saved', status: 'success' })).catch(() => toast({ title: 'Save failed', status: 'error' }))}>Save DB</Button>
                  </HStack>
                </VStack>
              </TabPanel>

              <TabPanel>
                <VStack align="stretch">
                  <Text mb={2}>Registration fields define custom signup fields for this project.</Text>
                  {regFields.map((f, idx) => (
                    <Box key={idx} p={2} borderWidth="1px" borderRadius="md">
                      <HStack>
                        <Input value={f.key} placeholder="key" onChange={(e) => { const copy = [...regFields]; copy[idx].key = e.target.value; setRegFields(copy); }} />
                        <Input value={f.label} placeholder="label" onChange={(e) => { const copy = [...regFields]; copy[idx].label = e.target.value; setRegFields(copy); }} />
                        <Select value={f.type} onChange={(e) => { const copy = [...regFields]; copy[idx].type = e.target.value; setRegFields(copy); }}>
                          <option value="text">text</option>
                          <option value="number">number</option>
                          <option value="email">email</option>
                          <option value="date">date</option>
                          <option value="select">select</option>
                        </Select>
                        <Button onClick={() => { setRegFields(regFields.filter((_, i) => i !== idx)); }}>Remove</Button>
                      </HStack>
                    </Box>
                  ))}

                  <HStack>
                    <Button onClick={() => setRegFields([...regFields, { key: '', label: '', type: 'text', required: false }])}>Add Field</Button>
                    <Button colorScheme="brand" onClick={saveRegFields}>Save Fields</Button>
                  </HStack>
                </VStack>
              </TabPanel>

              <TabPanel>
                <VStack align="stretch">
                  <Text mb={2}>Project metadata (JSON)</Text>
                  <Textarea value={metadataJson} onChange={(e) => setMetadataJson(e.target.value)} minH="200px" fontFamily="mono" />
                  <HStack justify="end">
                    <Button colorScheme="brand" onClick={saveMetadata}>Save Metadata</Button>
                  </HStack>
                </VStack>
              </TabPanel>

              <TabPanel>
                <VStack align="stretch">
                  <Text mb={2}>Enabled Modules</Text>
                  {toggleableModules.map((m) => (
                    <HStack key={m} justify="space-between" p={2} borderWidth="1px" borderRadius="md">
                      <Text textTransform="capitalize">{m}</Text>
                      <Button size="sm" onClick={() => toggleModule(m)} variant={enabledModules.includes(m) ? 'solid' : 'outline'} colorScheme={enabledModules.includes(m) ? 'brand' : undefined}>{enabledModules.includes(m) ? 'Enabled' : 'Enable'}</Button>
                    </HStack>
                  ))}
                  <HStack justify="end">
                    <Button colorScheme="brand" onClick={saveModules}>Save Modules</Button>
                  </HStack>
                </VStack>
              </TabPanel>

              <TabPanel>
                <VStack align="stretch">
                  <HStack justify="space-between">
                    <Text mb={2}>Project API keys (one-time raw key shown on create)</Text>
                    <Button leftIcon={<FiPlus />} onClick={onKeyOpen}>Create Key</Button>
                  </HStack>

                  {keysLoading && <Center py={6}><Spinner /></Center>}

                  {apiKeys?.length === 0 && !keysLoading && <Text color="gray.500">No API keys for this project.</Text>}

                  {apiKeys?.map((k: any) => (
                    <HStack key={k.id} p={3} borderWidth="1px" borderRadius="md" justify="space-between">
                      <HStack>
                        <Box p={2} borderRadius="lg" bg="brand.50"><FiKey color="var(--chakra-colors-brand-500)" /></Box>
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="medium">{k.name}</Text>
                          <Text fontSize="sm" color="gray.500">{k.permissions?.join(', ') || '—'}</Text>
                        </VStack>
                      </HStack>
                      <HStack>
                        <Button size="sm" onClick={() => { navigator.clipboard?.writeText(k.id); toast({ title: 'Copied id' }); }}>Copy ID</Button>
                        <Button size="sm" colorScheme="red" onClick={() => handleRevokeKey(k.id)} isDisabled={!k.isActive}>Revoke</Button>
                      </HStack>
                    </HStack>
                  ))}

                  <Modal isOpen={isKeyOpen} onClose={() => { setCreatedKey(null); onKeyClose(); }}>
                    <ModalOverlay />
                    <ModalContent>
                      <ModalHeader>Create API Key</ModalHeader>
                      <ModalCloseButton />
                      <ModalBody>
                        {createdKey ? (
                          <VStack align="stretch">
                            <Text>Copy this key now — it will not be shown again.</Text>
                            <Box p={3} bg={codeBg} borderRadius="md"><Code wordBreak="break-all">{createdKey}</Code></Box>
                            <IconButton aria-label="Copy" icon={<FiCopy />} onClick={() => { navigator.clipboard?.writeText(createdKey); toast({ title: 'Copied' }); }} />
                          </VStack>
                        ) : (
                          <FormControl>
                            <FormLabel>Key Name</FormLabel>
                            <Input value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} placeholder="e.g., Automation key" />
                          </FormControl>
                        )}
                      </ModalBody>
                      <ModalFooter>
                        {createdKey ? (
                          <Button onClick={() => { setCreatedKey(null); onKeyClose(); }} colorScheme="brand">Done</Button>
                        ) : (
                          <>
                            <Button variant="ghost" mr={3} onClick={() => { setCreatedKey(null); onKeyClose(); }}>Cancel</Button>
                            <Button colorScheme="brand" onClick={handleCreateKey} isDisabled={!newKeyName}>Create</Button>
                          </>
                        )}
                      </ModalFooter>
                    </ModalContent>
                  </Modal>

                  {/* Dev UI moved to its own tab for easier discovery */}
                </VStack>
              </TabPanel>

              <TabPanel>
                <VStack align="stretch">
                  <HStack justify="space-between">
                    <Text mb={2}>Roles for this project</Text>
                  </HStack>

                  {rolesLoading && <Center py={6}><Spinner /></Center>}

                  {roles?.map((r: any) => (
                    <HStack key={r.id} p={3} borderWidth="1px" borderRadius="md" justify="space-between">
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium">{r.name}</Text>
                        <Text fontSize="sm" color={mutedColor}>{(r.permissions || []).join(', ')}</Text>
                      </VStack>
                      <HStack>
                        <Button size="sm" onClick={() => { navigator.clipboard?.writeText(r.id); toast({ title: 'Copied id' }); }}>Copy ID</Button>
                        <Button size="sm" colorScheme="red" onClick={() => removeRole(r.id)}>Delete</Button>
                      </HStack>
                    </HStack>
                  ))}

                  <Box p={3} borderWidth="1px" borderRadius="md">
                    <FormControl>
                      <FormLabel>Role name</FormLabel>
                      <Input value={roleName} onChange={(e) => setRoleName(e.target.value)} placeholder="e.g., Admin" />
                    </FormControl>
                    <FormControl mt={3}>
                      <FormLabel>Default permission</FormLabel>
                      <Select value={rolePermissions} onChange={(e) => setRolePermissions(e.target.value)}>
                        <option value="manage">manage</option>
                        <option value="read">read</option>
                      </Select>
                    </FormControl>
                    <HStack justify="end" mt={3}>
                      <Button colorScheme="brand" onClick={createRole} isDisabled={!roleName}>Create Role</Button>
                    </HStack>
                  </Box>
                </VStack>
              </TabPanel>

              {showDevAdmin && (
                <TabPanel>
                  <VStack align="stretch">
                    <Box mt={1} p={3} borderWidth="1px" borderRadius="md">
                      <Text fontWeight="medium">Dev Admin Token (development only)</Text>
                      <Text fontSize="sm" color={mutedColor} mb={2}>Generate a signed admin JWT for local development.</Text>

                      <FormControl>
                        <FormLabel>Email</FormLabel>
                        <Input value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="admin@example.com" />
                      </FormControl>

                      <FormControl mt={2}>
                        <FormLabel>Sub (user id)</FormLabel>
                        <Input value={adminSub} onChange={(e) => setAdminSub(e.target.value)} placeholder="uuid" />
                      </FormControl>

                      <FormControl mt={2}>
                        <FormLabel>Dev password</FormLabel>
                        <Input value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="dev password" type="password" />
                      </FormControl>

                      <HStack mt={3}>
                        <Button colorScheme="brand" isLoading={isGenerating} onClick={generateAdminToken}>Generate</Button>
                        <Button onClick={() => { navigator.clipboard?.writeText(generatedToken || ''); toast({ title: 'Copied' }); }} isDisabled={!generatedToken}>Copy Token</Button>
                      </HStack>

                      {generatedToken && (
                        <Box mt={3} p={3} bg={panelBg} borderRadius="md">
                          <Code wordBreak="break-all">{generatedToken}</Code>
                        </Box>
                      )}

                      <Box mt={4} p={3} borderWidth="1px" borderRadius="md" bg={panelBg}>
                        <Text fontWeight="medium" mb={2}>Paste tokens (manual)</Text>
                        <FormControl>
                          <FormLabel>Access Token</FormLabel>
                          <Input value={pasteAccess} onChange={(e) => setPasteAccess(e.target.value)} placeholder="paste access token here" />
                        </FormControl>
                        <FormControl mt={2}>
                          <FormLabel>Refresh Token</FormLabel>
                          <Input value={pasteRefresh} onChange={(e) => setPasteRefresh(e.target.value)} placeholder="paste refresh token here" />
                        </FormControl>
                        <HStack mt={3}>
                          <Button colorScheme="brand" onClick={() => {
                            try {
                              tokenStorage.setTokens({ accessToken: pasteAccess, refreshToken: pasteRefresh });
                              toast({ title: 'Tokens stored', status: 'success' });
                              setPasteAccess(''); setPasteRefresh('');
                            } catch (err: any) {
                              toast({ title: 'Failed to store tokens', status: 'error', description: err?.message });
                            }
                          }} isDisabled={!pasteAccess || !pasteRefresh}>Save Tokens</Button>
                          <Button variant="ghost" onClick={() => { tokenStorage.clearTokens(); toast({ title: 'Tokens cleared' }); }}>Clear Tokens</Button>
                        </HStack>
                      </Box>
                    </Box>
                  </VStack>
                </TabPanel>
              )}
            </TabPanels>
          </Tabs>
        )}
      </Box>
    </ProtectedRoute>
  );
}
