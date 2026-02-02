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
    CardHeader,
    Button,
    FormControl,
    FormLabel,
    Input,
    Code,
    Switch,
    Divider,
    useColorModeValue,
    useToast,
    Avatar,
    Select,
} from '@chakra-ui/react';
import { FiSave, FiUser, FiBell, FiShield, FiGlobe } from 'react-icons/fi';
import { useState } from 'react';
import useAuthStore from '@/stores/authStore';
import { tokenStorage } from '@/utils/token-storage';
import { useMemo } from 'react';

export default function SettingsPage() {
    const user = useAuthStore((s) => s.user);
    const toast = useToast();

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        timezone: 'UTC',
        language: 'en',
        emailNotifications: true,
        pushNotifications: true,
        weeklyDigest: false,
        twoFactorEnabled: false,
    });

    // Dev generator state
    const [devEmail, setDevEmail] = useState('');
    const [devSub, setDevSub] = useState('');
    const [devPassword, setDevPassword] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedAccess, setGeneratedAccess] = useState<string | null>(null);

    const showDev = useMemo(() => {
        if (typeof window === 'undefined') return false;
        return process.env.NEXT_PUBLIC_ENABLE_DEV_ADMIN === 'true' || ['localhost', '127.0.0.1'].includes(window.location.hostname);
    }, []);

    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const mutedColor = useColorModeValue('gray.500', 'gray.400');
    const codeBg = useColorModeValue('gray.50', 'gray.700');

    const handleSave = () => {
        toast({
            title: 'Settings saved',
            description: 'Your settings have been updated successfully.',
            status: 'success',
            duration: 3000,
        });
    };

    return (
        <Box>
            {/* Page Header */}
            <Box mb={6}>
                <Heading as="h1" size={{ base: 'lg', md: 'xl' }} mb={2}>
                    Settings
                </Heading>
                <Text color={mutedColor} fontSize={{ base: 'sm', md: 'md' }}>
                    Manage your account and application preferences
                </Text>
            </Box>

            <VStack spacing={6} align="stretch" maxW={{ base: 'full', md: '800px' }}>
                {/* Profile Settings */}
                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                    <CardHeader pb={0}>
                        <HStack spacing={3}>
                            <FiUser />
                            <Heading size="md">Profile</Heading>
                        </HStack>
                    </CardHeader>
                    <CardBody>
                        <VStack spacing={6} align="stretch">
                            <Flex direction={{ base: 'column', sm: 'row' }} align={{ base: 'center', sm: 'flex-start' }} gap={4}>
                                <Avatar size="xl" name={formData.name || formData.email} bg="brand.500" />
                                <VStack align={{ base: 'center', sm: 'start' }} spacing={2}>
                                    <Button size="sm" colorScheme="brand" variant="outline">
                                        Change Photo
                                    </Button>
                                    <Text fontSize="sm" color="gray.500">
                                        JPG, PNG or GIF. Max 2MB.
                                    </Text>
                                </VStack>
                            </Flex>

                            <Divider />

                            <FormControl>
                                <FormLabel>Full Name</FormLabel>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Your name"
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Email Address</FormLabel>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="your@email.com"
                                />
                            </FormControl>
                        </VStack>
                    </CardBody>
                </Card>

                {/* Regional Settings */}
                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                    <CardHeader pb={0}>
                        <HStack spacing={3}>
                            <FiGlobe />
                            <Heading size="md">Regional</Heading>
                        </HStack>
                    </CardHeader>
                    <CardBody>
                        <VStack spacing={4} align="stretch">
                            <FormControl>
                                <FormLabel>Timezone</FormLabel>
                                <Select
                                    value={formData.timezone}
                                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                                >
                                    <option value="UTC">UTC</option>
                                    <option value="America/New_York">Eastern Time (ET)</option>
                                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                                    <option value="Europe/London">London (GMT)</option>
                                    <option value="Europe/Paris">Paris (CET)</option>
                                    <option value="Asia/Tokyo">Tokyo (JST)</option>
                                </Select>
                            </FormControl>

                            <FormControl>
                                <FormLabel>Language</FormLabel>
                                <Select
                                    value={formData.language}
                                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                >
                                    <option value="en">English</option>
                                    <option value="es">Español</option>
                                    <option value="fr">Français</option>
                                    <option value="de">Deutsch</option>
                                    <option value="ja">日本語</option>
                                </Select>
                            </FormControl>
                        </VStack>
                    </CardBody>
                </Card>

                {/* Notification Settings */}
                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                    <CardHeader pb={0}>
                        <HStack spacing={3}>
                            <FiBell />
                            <Heading size="md">Notifications</Heading>
                        </HStack>
                    </CardHeader>
                    <CardBody>
                        <VStack spacing={4} align="stretch">
                            <HStack justify="space-between">
                                <VStack align="start" spacing={0}>
                                    <Text fontWeight="medium">Email Notifications</Text>
                                    <Text fontSize="sm" color="gray.500">
                                        Receive notifications via email
                                    </Text>
                                </VStack>
                                <Switch
                                    colorScheme="brand"
                                    isChecked={formData.emailNotifications}
                                    onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })}
                                />
                            </HStack>

                            <Divider />

                            <HStack justify="space-between">
                                <VStack align="start" spacing={0}>
                                    <Text fontWeight="medium">Push Notifications</Text>
                                    <Text fontSize="sm" color="gray.500">
                                        Receive push notifications in browser
                                    </Text>
                                </VStack>
                                <Switch
                                    colorScheme="brand"
                                    isChecked={formData.pushNotifications}
                                    onChange={(e) => setFormData({ ...formData, pushNotifications: e.target.checked })}
                                />
                            </HStack>

                            <Divider />

                            <HStack justify="space-between">
                                <VStack align="start" spacing={0}>
                                    <Text fontWeight="medium">Weekly Digest</Text>
                                    <Text fontSize="sm" color="gray.500">
                                        Receive a weekly summary email
                                    </Text>
                                </VStack>
                                <Switch
                                    colorScheme="brand"
                                    isChecked={formData.weeklyDigest}
                                    onChange={(e) => setFormData({ ...formData, weeklyDigest: e.target.checked })}
                                />
                            </HStack>
                        </VStack>
                    </CardBody>
                </Card>

                {/* Security Settings */}
                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                    <CardHeader pb={0}>
                        <HStack spacing={3}>
                            <FiShield />
                            <Heading size="md">Security</Heading>
                        </HStack>
                    </CardHeader>
                    <CardBody>
                        <VStack spacing={4} align="stretch">
                            <HStack justify="space-between">
                                <VStack align="start" spacing={0}>
                                    <Text fontWeight="medium">Two-Factor Authentication</Text>
                                    <Text fontSize="sm" color="gray.500">
                                        Add an extra layer of security to your account
                                    </Text>
                                </VStack>
                                <Switch
                                    colorScheme="brand"
                                    isChecked={formData.twoFactorEnabled}
                                    onChange={(e) => setFormData({ ...formData, twoFactorEnabled: e.target.checked })}
                                />
                            </HStack>

                            <Divider />

                            <HStack justify="space-between">
                                <VStack align="start" spacing={0}>
                                    <Text fontWeight="medium">Change Password</Text>
                                    <Text fontSize="sm" color="gray.500">
                                        Update your password regularly for security
                                    </Text>
                                </VStack>
                                <Button size="sm" variant="outline">
                                    Change Password
                                </Button>
                            </HStack>
                        </VStack>
                    </CardBody>
                </Card>

                {/* Save Button */}
                <HStack justify="flex-end">
                    <Button size="lg" colorScheme="brand" leftIcon={<FiSave />} onClick={handleSave}>
                        Save Changes
                    </Button>
                </HStack>
                
                {/* Paste tokens (global dev helper) */}
                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                    <CardHeader pb={0}>
                        <HStack spacing={3}>
                            <FiShield />
                            <Heading size="md">Dev Tokens (manual)</Heading>
                        </HStack>
                    </CardHeader>
                    <CardBody>
                        <VStack align="stretch" spacing={3}>
                            <Text fontSize="sm" color="gray.500">Paste an access and refresh token for local testing. This isunsafe for production.</Text>
                            <FormControl>
                                <FormLabel>Access Token</FormLabel>
                                <Input id="paste-access" placeholder="paste access token" />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Refresh Token</FormLabel>
                                <Input id="paste-refresh" placeholder="paste refresh token" />
                            </FormControl>
                            <HStack justify="end">
                                <Button variant="ghost" onClick={() => { tokenStorage.clearTokens(); toast({ title: 'Tokens cleared' }); }}>Clear Tokens</Button>
                                <Button colorScheme="brand" onClick={() => {
                                    try {
                                        const a = (document.getElementById('paste-access') as HTMLInputElement)?.value || '';
                                        const r = (document.getElementById('paste-refresh') as HTMLInputElement)?.value || '';
                                        if (!a || !r) throw new Error('Both tokens required');
                                        tokenStorage.setTokens({ accessToken: a, refreshToken: r });
                                        toast({ title: 'Tokens stored', status: 'success' });
                                    } catch (err: any) {
                                        toast({ title: 'Failed to store tokens', status: 'error', description: err?.message });
                                    }
                                }}>Save Tokens</Button>
                            </HStack>
                        </VStack>
                    </CardBody>
                </Card>

                {showDev && (
                    <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                        <CardHeader pb={0}>
                            <HStack spacing={3}>
                                <FiShield />
                                <Heading size="md">Generate Dev Admin Token</Heading>
                            </HStack>
                        </CardHeader>
                        <CardBody>
                            <VStack align="stretch" spacing={3}>
                                <Text fontSize="sm" color="gray.500">Generate a signed admin access/refresh token from the local server (dev only).</Text>
                                <FormControl>
                                    <FormLabel>Email</FormLabel>
                                    <Input value={devEmail} onChange={(e) => setDevEmail(e.target.value)} placeholder="admin@example.com" />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Sub (user id)</FormLabel>
                                    <Input value={devSub} onChange={(e) => setDevSub(e.target.value)} placeholder="user id (optional)" />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Dev password</FormLabel>
                                    <Input value={devPassword} onChange={(e) => setDevPassword(e.target.value)} placeholder="dev password" type="password" />
                                </FormControl>
                                <HStack justify="end">
                                    <Button variant="ghost" onClick={() => { setDevEmail(''); setDevSub(''); setDevPassword(''); setGeneratedAccess(null); }}>Reset</Button>
                                    <Button colorScheme="brand" isLoading={isGenerating} onClick={async () => {
                                        setIsGenerating(true);
                                        try {
                                            const res = await fetch('/api/dev-admin-token', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ email: devEmail || undefined, sub: devSub || undefined, password: devPassword || undefined }),
                                            });
                                            const data = await res.json();
                                            if (!res.ok) throw new Error(data?.error || 'Failed to generate token');
                                            const tokens = data.tokens ?? data;
                                            if (!tokens?.accessToken || !tokens?.refreshToken) throw new Error('Invalid response');
                                            tokenStorage.setTokens({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
                                            setGeneratedAccess(tokens.accessToken);
                                            toast({ title: 'Admin token generated and stored', status: 'success' });
                                        } catch (err: any) {
                                            toast({ title: 'Generate failed', status: 'error', description: err?.message });
                                        } finally {
                                            setIsGenerating(false);
                                        }
                                    }}>Generate & Save</Button>
                                </HStack>
                                {generatedAccess && (
                                    <Box p={3} bg={codeBg} borderRadius="md">
                                        <Code wordBreak="break-all">{generatedAccess}</Code>
                                    </Box>
                                )}
                            </VStack>
                        </CardBody>
                    </Card>
                )}
            </VStack>
        </Box>
    );
}