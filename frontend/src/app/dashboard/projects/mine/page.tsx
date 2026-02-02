'use client';

import {
    Box,
    Heading,
    Text,
    VStack,
    Button,
    HStack,
    Card,
    CardBody,
    SimpleGrid,
    Spinner,
    Center,
    Alert,
    AlertIcon,
    AlertDescription,
    Badge,
    useColorModeValue,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { projectService } from '@/services/projectService';
import Link from 'next/link';
import { formatDate } from '@/utils/date-utils';

export default function MyProjectsPage() {
    const { data: projects, isLoading, error } = useQuery({
        queryKey: ['projects', 'mine'],
        queryFn: () => projectService.getMyProjects(),
    });

    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    return (
        <Box>
            <HStack justify="space-between" mb={6}>
                <Box>
                    <Heading as="h1" size="xl" mb={2}>
                        My Projects
                    </Heading>
                    <Text color="gray.500">Projects you are a member of</Text>
                </Box>
                <HStack spacing={2}>
                    <Link href="/dashboard/projects/new">
                        <Button leftIcon={<AddIcon />} colorScheme="brand">New Project</Button>
                    </Link>
                </HStack>
            </HStack>

            {isLoading && (
                <Center py={20}>
                    <Spinner size="xl" color="brand.500" thickness="4px" />
                </Center>
            )}

            {error && (
                <Alert status="error" borderRadius="lg">
                    <AlertIcon />
                    <AlertDescription>
                        Failed to load your projects. {error instanceof Error ? error.message : 'Please try again.'}
                    </AlertDescription>
                </Alert>
            )}

            {projects && (
                <>
                    {(projects?.length ?? 0) === 0 ? (
                        <Center py={20}>
                                <VStack spacing={4}>
                                <Text fontSize="lg" color="gray.500">
                                    You have no projects yet.
                                </Text>
                                <Link href="/dashboard/projects/new">
                                    <Button leftIcon={<AddIcon />} colorScheme="brand">Create Your First Project</Button>
                                </Link>
                            </VStack>
                        </Center>
                    ) : (
                        <>
                            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                                {projects?.map((project: any) => (
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
                                                        <Link href={`/dashboard/projects/${project.id}`}>
                                                            <Heading size="md" noOfLines={1}>
                                                                {project.name}
                                                            </Heading>
                                                        </Link>
                                                        <Text color="gray.500" noOfLines={2} minH="48px">
                                                            {project.description || 'No description'}
                                                        </Text>
                                                        <HStack spacing={2} mt={2}>
                                                            <Badge colorScheme="blue">{project.memberCount} members</Badge>
                                                            <Badge colorScheme="green">{project.fileCount} files</Badge>
                                                        </HStack>
                                                        <Text fontSize="sm" color="gray.400">
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

                            {/* My projects list is not paginated; remove pagination controls */}
                        </>
                    )}
                </>
            )}
        </Box>
    );
}
