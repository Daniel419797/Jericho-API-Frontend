'use client';

import {
    Box,
    Heading,
    Text,
    VStack,
    Input,
    InputGroup,
    InputLeftElement,
    Button,
    HStack,
    Flex,
    Card,
    CardBody,
    SimpleGrid,
    Spinner,
    Center,
    Alert,
    AlertIcon,
    AlertDescription,
    Select,
    Badge,
    useColorModeValue,
} from '@chakra-ui/react';
import { SearchIcon, AddIcon } from '@chakra-ui/icons';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { projectService } from '@/services/projectService';
import Link from 'next/link';
import { formatDate } from '@/utils/date-utils';
import { tokenStorage } from '@/utils/token-storage';

export default function ProjectsPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'updatedAt'>('updatedAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const { data, isLoading, error } = useQuery({
        queryKey: ['projects', page, search, sortBy, sortOrder],
        queryFn: () =>
            projectService.getProjects({
                page,
                limit: 12,
                search: search || undefined,
                sortBy,
                sortOrder,
            }),
    });

    // Normalize API response to avoid runtime errors when shape is unexpected
    const projectsList = data?.data ?? [];
    const totalPages = data?.totalPages ?? 1;

    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const mutedColor = useColorModeValue('gray.500', 'gray.400');
    const subtleColor = useColorModeValue('gray.400', 'gray.500');

    const debugEnabled = process.env.NEXT_PUBLIC_ENABLE_DEV_ADMIN === 'true' || typeof window !== 'undefined' && ['localhost','127.0.0.1'].includes(window.location.hostname);
    const accessToken = typeof window !== 'undefined' ? tokenStorage.getAccessToken() : null;

    return (
        <Box>
            {/* Page Header */}
            <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'stretch', md: 'center' }} gap={4} mb={6}>
                <Box>
                    <Heading as="h1" size={{ base: 'lg', md: 'xl' }} mb={2}>
                        Projects
                    </Heading>
                    <Text color={mutedColor} fontSize={{ base: 'sm', md: 'md' }}>
                        Manage your projects here
                    </Text>
                </Box>
                <Flex direction={{ base: 'column', sm: 'row' }} gap={2}>
                    <Link href="/dashboard/projects/mine">
                        <Button variant="outline" w={{ base: 'full', sm: 'auto' }}>My Projects</Button>
                    </Link>
                    <Link href="/dashboard/projects/new">
                        <Button leftIcon={<AddIcon />} colorScheme="brand" w={{ base: 'full', sm: 'auto' }}>New Project</Button>
                    </Link>
                </Flex>
            </Flex>

            {/* Filters */}
            <Flex direction={{ base: 'column', sm: 'row' }} gap={4} mb={6}>
                <InputGroup maxW={{ base: 'full', md: 'md' }} flex={1}>
                    <InputLeftElement pointerEvents="none">
                        <SearchIcon color="gray.400" />
                    </InputLeftElement>
                    <Input
                        placeholder="Search projects..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        bg={cardBg}
                    />
                </InputGroup>

                <Select
                    maxW={{ base: 'full', sm: '200px' }}
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                        const [newSortBy, newSortOrder] = e.target.value.split('-') as [
                            'name' | 'createdAt' | 'updatedAt',
                            'asc' | 'desc'
                        ];
                        setSortBy(newSortBy);
                        setSortOrder(newSortOrder);
                        setPage(1);
                    }}
                    bg={cardBg}
                >
                    <option value="updatedAt-desc">Recently Updated</option>
                    <option value="createdAt-desc">Newest First</option>
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                </Select>
            </Flex>

            {isLoading && (
                <Center py={20}>
                    <Spinner size="xl" color="brand.500" thickness="4px" />
                </Center>
            )}

            {/* {debugEnabled && (
                <Box mb={4} p={3} borderWidth="1px" borderRadius="md" bg="yellow.50">
                    <Text fontSize="sm">Debug: projectsList length = {projectsList.length}</Text>
                    <Text fontSize="sm">Access token present: {accessToken ? 'yes' : 'no'}</Text>
                </Box>
            )} */}

            {error && (
                <Alert status="error" borderRadius="lg">
                    <AlertIcon />
                    <AlertDescription>
                        Failed to load projects. {error instanceof Error ? error.message : 'Please try again.'}
                    </AlertDescription>
                </Alert>
            )}

            {data && (
                <>
                    {projectsList.length === 0 ? (
                        <Center py={20}>
                            <VStack spacing={4}>
                                <Text fontSize="lg" color={mutedColor}>
                                    {search ? 'No projects found matching your search.' : 'No projects yet.'}
                                </Text>
                                {!search && (
                                    <Button leftIcon={<AddIcon />} colorScheme="brand">
                                        Create Your First Project
                                    </Button>
                                )}
                            </VStack>
                        </Center>
                    ) : (
                        <>
                            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                                {projectsList.map((project) => (
                                    <Card
                                        key={project.id}
                                        bg={cardBg}
                                        borderWidth="1px"
                                        borderColor={borderColor}
                                        transition="all 0.2s ease"
                                    >
                                        <CardBody>
                                            <VStack align="start" spacing={3}>
                                                <HStack justify="space-between" w="full">
                                                    <Box>
                                                        <Link href={`/projects/${project.id}`}>
                                                            <Heading size="md" noOfLines={1}>
                                                                {project.name}
                                                            </Heading>
                                                        </Link>
                                                        <Text color={mutedColor} noOfLines={2} minH="48px">
                                                            {project.description || 'No description'}
                                                        </Text>
                                                        <HStack spacing={2} mt={2}>
                                                            <Badge colorScheme="blue">{project.memberCount} members</Badge>
                                                            <Badge colorScheme="green">{project.fileCount} files</Badge>
                                                        </HStack>
                                                        <Text fontSize="sm" color={subtleColor}>
                                                            Updated {formatDate(project.updatedAt)}
                                                        </Text>
                                                    </Box>

                                                    <VStack>
                                                        <Link href={`/dashboard/projects/${project.id}/settings`}> 
                                                            <Button size="sm" variant="outline">Settings</Button>
                                                        </Link>
                                                    </VStack>
                                                </HStack>
                                            </VStack>
                                        </CardBody>
                                    </Card>
                                ))}
                            </SimpleGrid>

                            {totalPages > 1 && (
                                <HStack justify="center" spacing={2} mt={8}>
                                    <Button
                                        size="sm"
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        isDisabled={page === 1}
                                    >
                                        Previous
                                    </Button>
                                    <Text fontSize="sm" color={mutedColor}>
                                        Page {page} of {data.totalPages}
                                    </Text>
                                    <Button
                                        size="sm"
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        isDisabled={page === totalPages}
                                    >
                                        Next
                                    </Button>
                                </HStack>
                            )}
                        </>
                    )}
                </>
            )}
        </Box>
    );
}
