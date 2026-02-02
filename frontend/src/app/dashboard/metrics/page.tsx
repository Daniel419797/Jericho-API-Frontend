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
    SimpleGrid,
    Spinner,
    Center,
    Alert,
    AlertIcon,
    AlertDescription,
    Button,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Badge,
    useColorModeValue,
    Icon,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Textarea,
} from '@chakra-ui/react';
import { FiActivity, FiDatabase, FiServer, FiRefreshCw, FiKey, FiZap, FiAlertTriangle, FiCheck } from 'react-icons/fi';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '@/services/api-client';
import { tokenStorage } from '@/utils/token-storage';

interface ParsedMetrics {
    httpRequests: number;
    cacheHits: number;
    cacheMisses: number;
    cacheHitRate: number;
    rotationAttempts: number;
    rotationSuccesses: number;
    rotationFailures: number;
    apiKeyRequests: number;
    apiKeyFailures: number;
    connectionAttempts: number;
    connectionSuccesses: number;
    connectionFailures: number;
    mongoStreamsRunning: number;
    mongoStreamErrors: number;
    raw: string;
}

function parsePrometheusMetrics(raw: string): Omit<ParsedMetrics, 'raw'> {
    const getMetricValue = (name: string): number => {
        const regex = new RegExp(`^${name}\\s+(\\d+(?:\\.\\d+)?)`, 'm');
        const match = raw.match(regex);
        return match ? parseFloat(match[1]) : 0;
    };

    const cacheHits = getMetricValue('project_cache_hits_total');
    const cacheMisses = getMetricValue('project_cache_misses_total');
    const cacheHitRate = cacheHits + cacheMisses > 0 
        ? (cacheHits / (cacheHits + cacheMisses)) * 100 
        : 0;

    return {
        httpRequests: getMetricValue('http_requests_total'),
        cacheHits,
        cacheMisses,
        cacheHitRate,
        rotationAttempts: getMetricValue('rotation_attempts_total'),
        rotationSuccesses: getMetricValue('rotation_success_total'),
        rotationFailures: getMetricValue('rotation_failures_total'),
        apiKeyRequests: getMetricValue('api_key_requests_total'),
        apiKeyFailures: getMetricValue('api_key_auth_failures_total'),
        connectionAttempts: getMetricValue('connection_attempts_total'),
        connectionSuccesses: getMetricValue('connection_success_total'),
        connectionFailures: getMetricValue('connection_failures_total'),
        mongoStreamsRunning: getMetricValue('mongo_streams_running'),
        mongoStreamErrors: getMetricValue('mongo_stream_errors_total'),
    };
}

export default function MetricsPage() {
    const [tabIndex, setTabIndex] = useState(0);

    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const successColor = useColorModeValue('green.500', 'green.300');
    const errorColor = useColorModeValue('red.500', 'red.300');
    const warningColor = useColorModeValue('orange.500', 'orange.300');
    const codeBg = useColorModeValue('gray.50', 'gray.900');
    const mutedColor = useColorModeValue('gray.500', 'gray.400');

    // Metrics endpoint is at root /metrics, not under /api/v1
    const metricsUrl = API_BASE_URL.replace(/\/api\/v1$/, '') + '/metrics';

    const { data: metricsData, isLoading, error, refetch, isFetching } = useQuery<ParsedMetrics>({
        queryKey: ['metrics'],
        queryFn: async () => {
            const accessToken = tokenStorage.getAccessToken();
            const headers: Record<string, string> = {};
            if (accessToken) {
                headers['Authorization'] = `Bearer ${accessToken}`;
            }
            const response = await fetch(metricsUrl, { headers });
            if (!response.ok) {
                throw new Error(`Failed to fetch metrics: ${response.status}`);
            }
            const raw = await response.text();
            const parsed = parsePrometheusMetrics(raw);
            return { ...parsed, raw };
        },
        refetchInterval: 30000, // Refresh every 30 seconds
    });

    return (
        <Box>
            {/* Page Header */}
            <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'stretch', md: 'center' }} gap={4} mb={6}>
                <Box>
                    <Heading as="h1" size={{ base: 'lg', md: 'xl' }} mb={2}>
                        System Metrics
                    </Heading>
                    <Text color={mutedColor} fontSize={{ base: 'sm', md: 'md' }}>
                        Real-time observability and performance monitoring
                    </Text>
                </Box>
                <Button
                    leftIcon={<FiRefreshCw />}
                    onClick={() => refetch()}
                    isLoading={isFetching}
                    colorScheme="brand"
                    variant="outline"
                    w={{ base: 'full', md: 'auto' }}
                >
                    Refresh
                </Button>
            </Flex>

            {isLoading && (
                <Center py={20}>
                    <Spinner size="xl" color="brand.500" thickness="4px" />
                </Center>
            )}

            {error && (
                <Alert status="error" borderRadius="lg" mb={6}>
                    <AlertIcon />
                    <AlertDescription>
                        Failed to load metrics. {error instanceof Error ? error.message : 'Please try again.'}
                    </AlertDescription>
                </Alert>
            )}

            {metricsData && (
                <Tabs index={tabIndex} onChange={setTabIndex}>
                    <Box overflowX="auto" pb={2}>
                        <TabList mb={6} minW="max-content">
                            <Tab fontSize={{ base: 'sm', md: 'md' }}>Overview</Tab>
                            <Tab fontSize={{ base: 'sm', md: 'md' }}>Cache</Tab>
                            <Tab fontSize={{ base: 'sm', md: 'md' }}>Connections</Tab>
                            <Tab fontSize={{ base: 'sm', md: 'md' }}>Security</Tab>
                            <Tab fontSize={{ base: 'sm', md: 'md' }}>Raw Metrics</Tab>
                        </TabList>
                    </Box>

                    <TabPanels>
                        {/* Overview Tab */}
                        <TabPanel p={0}>
                            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={6}>
                                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                                    <CardBody>
                                        <HStack spacing={4}>
                                            <Box p={3} borderRadius="lg" bg="blue.50" _dark={{ bg: 'rgba(33, 150, 243, 0.15)' }}>
                                                <Icon as={FiActivity} color="blue.500" boxSize={6} />
                                            </Box>
                                            <Stat>
                                                <StatLabel>HTTP Requests</StatLabel>
                                                <StatNumber>{metricsData.httpRequests.toLocaleString()}</StatNumber>
                                                <StatHelpText>Total processed</StatHelpText>
                                            </Stat>
                                        </HStack>
                                    </CardBody>
                                </Card>

                                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                                    <CardBody>
                                        <HStack spacing={4}>
                                            <Box p={3} borderRadius="lg" bg="green.50" _dark={{ bg: 'rgba(72, 187, 120, 0.15)' }}>
                                                <Icon as={FiDatabase} color="green.500" boxSize={6} />
                                            </Box>
                                            <Stat>
                                                <StatLabel>Cache Hit Rate</StatLabel>
                                                <StatNumber>{metricsData.cacheHitRate.toFixed(1)}%</StatNumber>
                                                <StatHelpText>{metricsData.cacheHits} hits / {metricsData.cacheMisses} misses</StatHelpText>
                                            </Stat>
                                        </HStack>
                                    </CardBody>
                                </Card>

                                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                                    <CardBody>
                                        <HStack spacing={4}>
                                            <Box p={3} borderRadius="lg" bg="purple.50" _dark={{ bg: 'rgba(159, 122, 234, 0.15)' }}>
                                                <Icon as={FiServer} color="purple.500" boxSize={6} />
                                            </Box>
                                            <Stat>
                                                <StatLabel>Mongo Streams</StatLabel>
                                                <StatNumber>{metricsData.mongoStreamsRunning}</StatNumber>
                                                <StatHelpText>{metricsData.mongoStreamErrors} errors</StatHelpText>
                                            </Stat>
                                        </HStack>
                                    </CardBody>
                                </Card>

                                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                                    <CardBody>
                                        <HStack spacing={4}>
                                            <Box p={3} borderRadius="lg" bg="orange.50" _dark={{ bg: 'rgba(237, 137, 54, 0.15)' }}>
                                                <Icon as={FiRefreshCw} color="orange.500" boxSize={6} />
                                            </Box>
                                            <Stat>
                                                <StatLabel>Key Rotations</StatLabel>
                                                <StatNumber>{metricsData.rotationSuccesses}</StatNumber>
                                                <StatHelpText>{metricsData.rotationFailures} failures</StatHelpText>
                                            </Stat>
                                        </HStack>
                                    </CardBody>
                                </Card>
                            </SimpleGrid>

                            {/* Status Cards */}
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                                    <CardHeader pb={0}>
                                        <Heading size="md">System Health</Heading>
                                    </CardHeader>
                                    <CardBody>
                                        <VStack align="stretch" spacing={3}>
                                            <HStack justify="space-between">
                                                <Text>Database Connections</Text>
                                                <Badge colorScheme={metricsData.connectionFailures > 0 ? 'red' : 'green'}>
                                                    {metricsData.connectionFailures > 0 ? 'Issues Detected' : 'Healthy'}
                                                </Badge>
                                            </HStack>
                                            <HStack justify="space-between">
                                                <Text>Cache Performance</Text>
                                                <Badge colorScheme={metricsData.cacheHitRate >= 80 ? 'green' : metricsData.cacheHitRate >= 50 ? 'yellow' : 'red'}>
                                                    {metricsData.cacheHitRate >= 80 ? 'Optimal' : metricsData.cacheHitRate >= 50 ? 'Fair' : 'Poor'}
                                                </Badge>
                                            </HStack>
                                            <HStack justify="space-between">
                                                <Text>Key Rotation</Text>
                                                <Badge colorScheme={metricsData.rotationFailures === 0 ? 'green' : 'yellow'}>
                                                    {metricsData.rotationFailures === 0 ? 'All Successful' : `${metricsData.rotationFailures} Failed`}
                                                </Badge>
                                            </HStack>
                                            <HStack justify="space-between">
                                                <Text>API Authentication</Text>
                                                <Badge colorScheme={metricsData.apiKeyFailures === 0 ? 'green' : 'yellow'}>
                                                    {metricsData.apiKeyFailures === 0 ? 'No Failures' : `${metricsData.apiKeyFailures} Auth Failures`}
                                                </Badge>
                                            </HStack>
                                        </VStack>
                                    </CardBody>
                                </Card>

                                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                                    <CardHeader pb={0}>
                                        <Heading size="md">Quick Stats</Heading>
                                    </CardHeader>
                                    <CardBody>
                                        <SimpleGrid columns={2} spacing={4}>
                                            <VStack align="start" spacing={1}>
                                                <Text fontSize="sm" color={mutedColor}>Connection Attempts</Text>
                                                <Text fontSize="xl" fontWeight="bold">{metricsData.connectionAttempts}</Text>
                                            </VStack>
                                            <VStack align="start" spacing={1}>
                                                <Text fontSize="sm" color={mutedColor}>Successful Connections</Text>
                                                <Text fontSize="xl" fontWeight="bold" color={successColor}>{metricsData.connectionSuccesses}</Text>
                                            </VStack>
                                            <VStack align="start" spacing={1}>
                                                <Text fontSize="sm" color={mutedColor}>API Key Requests</Text>
                                                <Text fontSize="xl" fontWeight="bold">{metricsData.apiKeyRequests}</Text>
                                            </VStack>
                                            <VStack align="start" spacing={1}>
                                                <Text fontSize="sm" color={mutedColor}>Rotation Attempts</Text>
                                                <Text fontSize="xl" fontWeight="bold">{metricsData.rotationAttempts}</Text>
                                            </VStack>
                                        </SimpleGrid>
                                    </CardBody>
                                </Card>
                            </SimpleGrid>
                        </TabPanel>

                        {/* Cache Tab */}
                        <TabPanel p={0}>
                            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={6}>
                                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                                    <CardBody textAlign="center">
                                        <Icon as={FiCheck} boxSize={8} color={successColor} mb={2} />
                                        <Text fontSize="3xl" fontWeight="bold">{metricsData.cacheHits}</Text>
                                        <Text color={mutedColor}>Cache Hits</Text>
                                    </CardBody>
                                </Card>

                                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                                    <CardBody textAlign="center">
                                        <Icon as={FiAlertTriangle} boxSize={8} color={warningColor} mb={2} />
                                        <Text fontSize="3xl" fontWeight="bold">{metricsData.cacheMisses}</Text>
                                        <Text color={mutedColor}>Cache Misses</Text>
                                    </CardBody>
                                </Card>

                                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                                    <CardBody textAlign="center">
                                        <Icon as={FiZap} boxSize={8} color={metricsData.cacheHitRate >= 80 ? successColor : warningColor} mb={2} />
                                        <Text fontSize="3xl" fontWeight="bold">{metricsData.cacheHitRate.toFixed(1)}%</Text>
                                        <Text color={mutedColor}>Hit Rate</Text>
                                    </CardBody>
                                </Card>
                            </SimpleGrid>

                            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                                <CardHeader>
                                    <Heading size="md">Cache Performance Analysis</Heading>
                                </CardHeader>
                                <CardBody>
                                    <Text>
                                        {metricsData.cacheHitRate >= 80 
                                            ? '✅ Your cache is performing optimally. Most requests are being served from cache.'
                                            : metricsData.cacheHitRate >= 50
                                            ? '⚠️ Cache performance is fair. Consider reviewing cache TTL settings or increasing cache size.'
                                            : '❌ Cache performance is below optimal. Many requests are hitting the database directly. Consider tuning your caching strategy.'}
                                    </Text>
                                </CardBody>
                            </Card>
                        </TabPanel>

                        {/* Connections Tab */}
                        <TabPanel p={0}>
                            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={6}>
                                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                                    <CardBody textAlign="center">
                                        <Text fontSize="3xl" fontWeight="bold">{metricsData.connectionAttempts}</Text>
                                        <Text color={mutedColor}>Total Attempts</Text>
                                    </CardBody>
                                </Card>

                                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                                    <CardBody textAlign="center">
                                        <Text fontSize="3xl" fontWeight="bold" color={successColor}>{metricsData.connectionSuccesses}</Text>
                                        <Text color={mutedColor}>Successful</Text>
                                    </CardBody>
                                </Card>

                                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                                    <CardBody textAlign="center">
                                        <Text fontSize="3xl" fontWeight="bold" color={metricsData.connectionFailures > 0 ? errorColor : 'inherit'}>{metricsData.connectionFailures}</Text>
                                        <Text color={mutedColor}>Failed</Text>
                                    </CardBody>
                                </Card>
                            </SimpleGrid>

                            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                                <CardHeader>
                                    <Heading size="md">MongoDB Streams</Heading>
                                </CardHeader>
                                <CardBody>
                                    <HStack spacing={8}>
                                        <VStack>
                                            <Text fontSize="2xl" fontWeight="bold">{metricsData.mongoStreamsRunning}</Text>
                                            <Text color={mutedColor}>Active Streams</Text>
                                        </VStack>
                                        <VStack>
                                            <Text fontSize="2xl" fontWeight="bold" color={metricsData.mongoStreamErrors > 0 ? errorColor : 'inherit'}>
                                                {metricsData.mongoStreamErrors}
                                            </Text>
                                            <Text color={mutedColor}>Stream Errors</Text>
                                        </VStack>
                                    </HStack>
                                </CardBody>
                            </Card>
                        </TabPanel>

                        {/* Security Tab */}
                        <TabPanel p={0}>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
                                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                                    <CardHeader pb={0}>
                                        <HStack>
                                            <Icon as={FiKey} />
                                            <Heading size="md">API Key Authentication</Heading>
                                        </HStack>
                                    </CardHeader>
                                    <CardBody>
                                        <SimpleGrid columns={2} spacing={4}>
                                            <VStack align="start">
                                                <Text fontSize="sm" color={mutedColor}>Total Requests</Text>
                                                <Text fontSize="2xl" fontWeight="bold">{metricsData.apiKeyRequests}</Text>
                                            </VStack>
                                            <VStack align="start">
                                                <Text fontSize="sm" color={mutedColor}>Auth Failures</Text>
                                                <Text fontSize="2xl" fontWeight="bold" color={metricsData.apiKeyFailures > 0 ? errorColor : 'inherit'}>
                                                    {metricsData.apiKeyFailures}
                                                </Text>
                                            </VStack>
                                        </SimpleGrid>
                                    </CardBody>
                                </Card>

                                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                                    <CardHeader pb={0}>
                                        <HStack>
                                            <Icon as={FiRefreshCw} />
                                            <Heading size="md">Key Rotation</Heading>
                                        </HStack>
                                    </CardHeader>
                                    <CardBody>
                                        <SimpleGrid columns={3} spacing={4}>
                                            <VStack align="start">
                                                <Text fontSize="sm" color={mutedColor}>Attempts</Text>
                                                <Text fontSize="2xl" fontWeight="bold">{metricsData.rotationAttempts}</Text>
                                            </VStack>
                                            <VStack align="start">
                                                <Text fontSize="sm" color={mutedColor}>Successes</Text>
                                                <Text fontSize="2xl" fontWeight="bold" color={successColor}>{metricsData.rotationSuccesses}</Text>
                                            </VStack>
                                            <VStack align="start">
                                                <Text fontSize="sm" color={mutedColor}>Failures</Text>
                                                <Text fontSize="2xl" fontWeight="bold" color={metricsData.rotationFailures > 0 ? errorColor : 'inherit'}>
                                                    {metricsData.rotationFailures}
                                                </Text>
                                            </VStack>
                                        </SimpleGrid>
                                    </CardBody>
                                </Card>
                            </SimpleGrid>
                        </TabPanel>

                        {/* Raw Metrics Tab */}
                        <TabPanel p={0}>
                            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                                <CardHeader>
                                    <HStack justify="space-between">
                                        <Heading size="md">Raw Prometheus Metrics</Heading>
                                        <Button
                                            size="sm"
                                            onClick={() => navigator.clipboard?.writeText(metricsData.raw)}
                                        >
                                            Copy
                                        </Button>
                                    </HStack>
                                </CardHeader>
                                <CardBody>
                                    <Textarea
                                        value={metricsData.raw}
                                        readOnly
                                        fontFamily="mono"
                                        fontSize="sm"
                                        minH="400px"
                                        bg={codeBg}
                                    />
                                </CardBody>
                            </Card>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            )}
        </Box>
    );
}
