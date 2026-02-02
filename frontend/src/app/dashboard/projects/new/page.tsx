'use client';

import {
  Box,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Button,
  Checkbox,
  VStack,
  HStack,
  Stack,
  useToast,
  useColorModeValue,
  IconButton,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import Link from 'next/link';
import { useState } from 'react';
import useAuthStore from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { projectService } from '@/services/projectService';

export default function NewProjectPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [databaseType, setDatabaseType] = useState('POSTGRESQL');
  const [loading, setLoading] = useState(false);
  const [onboardingKey, setOnboardingKey] = useState<string | null>(null);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const toast = useToast();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const cardBg = useColorModeValue('white', 'gray.800');
  const keyBg = useColorModeValue('gray.50', 'gray.700');
  const alertBg = useColorModeValue('yellow.50', 'yellow.900');

  const toggleableModules = ['attendance', 'files', 'messaging', 'notifications', 'roles', 'schemas'];
  const [enabledModules, setEnabledModules] = useState<string[]>([]);

  const [dbHost, setDbHost] = useState('');
  const [dbPort, setDbPort] = useState<number | ''>('');
  const [dbUser, setDbUser] = useState('');
  const [dbPassword, setDbPassword] = useState('');
  const [connectionString, setConnectionString] = useState('');

  const [regFields, setRegFields] = useState<any[]>([]);

  const toggleModule = (m: string) => {
    setEnabledModules((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: 'Name required', status: 'warning', duration: 3000 });
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        ownerId: user?.id,
        databaseType,
        databaseConfig: databaseType === 'SUPABASE' ? { connectionString } : { host: dbHost, port: dbPort || undefined, user: dbUser || undefined, password: dbPassword || undefined, connectionString: connectionString || undefined },
        metadata: { enabledModules, registrationFields: regFields },
      };

      const res = await projectService.createProject(payload);
      toast({ title: 'Project created', status: 'success', duration: 3000 });
      // show onboarding api key if returned (one-time)
      // Some backends may ignore metadata or description on create; ensure they're set
      const needsMetadata = !(res.project?.metadata && Object.keys(res.project.metadata).length > 0) && (enabledModules.length || regFields.length);
      const desiredDescription = description.trim() || undefined;
      const needsDescription = desiredDescription && (!res.project?.description || res.project.description !== desiredDescription);

      if (needsMetadata || needsDescription) {
        const updatePayload: any = {};
        if (needsMetadata) updatePayload.metadata = { enabledModules, registrationFields: regFields };
        if (needsDescription) updatePayload.description = desiredDescription;
        try {
          await projectService.updateProject(res.project.id, updatePayload);
          toast({ title: 'Project updated', status: 'success' });
        } catch (err) {
          toast({ title: 'Failed to persist project details', status: 'warning' });
        }
      }

      if (res.apiKey) {
        setOnboardingKey(res.apiKey);
        setCreatedProjectId(res.project.id);
      } else {
        router.push(`/dashboard/projects/${res.project.id}`);
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Failed to create project', status: 'error', duration: 4000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box bg={cardBg} p={6} borderRadius="md">
      <HStack mb={4}>
        <IconButton
          as={Link}
          href="/dashboard/projects"
          aria-label="Back to projects"
          icon={<ArrowBackIcon />}
          variant="ghost"
          size="sm"
        />
        <Heading size="lg">Create Project</Heading>
      </HStack>
      {onboardingKey && (
        <Box mb={6} p={4} borderRadius="md" bg={alertBg}>
          <Heading size="sm" mb={2}>Onboarding API key (save this now)</Heading>
          <Text fontSize="sm" mb={2}>This key is shown only once. Store it securely.</Text>
          <Box mb={3} p={3} bg={keyBg} borderRadius="sm" borderWidth="1px">
            <Text as="code" fontSize="sm">{onboardingKey}</Text>
          </Box>
          <HStack spacing={2}>
            <Button onClick={() => { navigator.clipboard?.writeText(onboardingKey); toast({ title: 'Copied to clipboard', status: 'success' }); }}>Copy key</Button>
            <Button colorScheme="brand" onClick={() => createdProjectId && router.push(`/dashboard/projects/${createdProjectId}`)}>
              Continue
            </Button>
          </HStack>
        </Box>
      )}
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <FormControl isRequired>
            <FormLabel>Project Name</FormLabel>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My project" />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Database Type</FormLabel>
            <Select value={databaseType} onChange={(e) => setDatabaseType(e.target.value)}>
              <option value="POSTGRESQL">PostgreSQL</option>
              <option value="MYSQL">MySQL</option>
              <option value="MONGODB">MongoDB</option>
              <option value="SUPABASE">Supabase</option>
            </Select>
          </FormControl>

          {/* Database config inputs */}
          {databaseType !== 'SUPABASE' && (
            <Stack>
              <FormControl>
                <FormLabel>DB Host</FormLabel>
                <Input value={dbHost} onChange={(e) => setDbHost(e.target.value)} placeholder="db.example.com" />
              </FormControl>
              <HStack>
                <FormControl>
                  <FormLabel>Port</FormLabel>
                  <Input value={dbPort as any} onChange={(e) => setDbPort(e.target.value ? Number(e.target.value) : '')} placeholder="5432" />
                </FormControl>
                <FormControl>
                  <FormLabel>User</FormLabel>
                  <Input value={dbUser} onChange={(e) => setDbUser(e.target.value)} placeholder="db user" />
                </FormControl>
              </HStack>
              <FormControl>
                <FormLabel>Password</FormLabel>
                <Input value={dbPassword} onChange={(e) => setDbPassword(e.target.value)} type="password" />
              </FormControl>
            </Stack>
          )}

          {databaseType === 'SUPABASE' && (
            <FormControl>
              <FormLabel>Connection String</FormLabel>
              <Input value={connectionString} onChange={(e) => setConnectionString(e.target.value)} placeholder="postgresql://..." />
            </FormControl>
          )}

          <FormControl>
            <FormLabel>Description</FormLabel>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
          </FormControl>

          <Box>
            <Text mb={2} fontWeight="medium">Enable Modules</Text>
            <VStack align="start">
              {toggleableModules.map((m) => (
                <Checkbox key={m} isChecked={enabledModules.includes(m)} onChange={() => toggleModule(m)}>{m}</Checkbox>
              ))}
            </VStack>
          </Box>

          <Box>
            <Text mb={2} fontWeight="medium">Registration Fields</Text>
            {regFields.map((f, idx) => (
              <HStack key={idx} mb={2}>
                <Input value={f.key} placeholder="key" onChange={(e) => { const copy = [...regFields]; copy[idx].key = e.target.value; setRegFields(copy); }} />
                <Input value={f.label} placeholder="label" onChange={(e) => { const copy = [...regFields]; copy[idx].label = e.target.value; setRegFields(copy); }} />
                <Select value={f.type} onChange={(e) => { const copy = [...regFields]; copy[idx].type = e.target.value; setRegFields(copy); }}>
                  <option value="text">text</option>
                  <option value="number">number</option>
                  <option value="email">email</option>
                  <option value="phone">phone</option>
                  <option value="date">date</option>
                  <option value="select">select</option>
                </Select>
                <Button onClick={() => setRegFields(regFields.filter((_, i) => i !== idx))}>Remove</Button>
              </HStack>
            ))}
            <HStack>
              <Button onClick={() => setRegFields([...regFields, { key: '', label: '', type: 'text', required: false }])}>Add Field</Button>
            </HStack>
          </Box>

          <HStack justify="end">
            <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button colorScheme="brand" type="submit" isLoading={loading}>Create</Button>
          </HStack>
        </VStack>
      </form>
    </Box>
  );
}
