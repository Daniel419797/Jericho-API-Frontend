'use client';

import {
  Container,
  Heading,
  Text,
  VStack,
  Box,
  Input,
  InputGroup,
  InputLeftElement,
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
  Select,
  Badge,
} from '@chakra-ui/react';
import { SearchIcon, AddIcon } from '@chakra-ui/icons';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api-client';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Link from 'next/link';
import { formatDate } from '@/utils/date-utils';

export default function ProjectsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'updatedAt'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data, isLoading, error } = useQuery({
    queryKey: ['projects', page, search, sortBy, sortOrder],
    queryFn: () =>
      apiClient.getProjects({
        page,
        limit: 12,
        search: search || undefined,
        sortBy,
        sortOrder,
      }),
  });

  return (
    <ProtectedRoute>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Box>
            <HStack justify="space-between" mb={4}>
              <Box>
                <Heading as="h1" size="xl" mb={2}>
                  Projects
                </Heading>
                <Text color="gray.600" _dark={{ color: 'gray.400' }}>
                  Manage your projects here
                </Text>
              </Box>
              <Button leftIcon={<AddIcon />} colorScheme="brand">
                New Project
              </Button>
            </HStack>

            <HStack spacing={4}>
              <InputGroup maxW="md">
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder="Search projects..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </InputGroup>

              <Select
                maxW="200px"
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
              >
                <option value="updatedAt-desc">Recently Updated</option>
                <option value="createdAt-desc">Newest First</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
              </Select>
            </HStack>
          </Box>

          {isLoading && (
            <Center py={10}>
              <Spinner size="xl" />
            </Center>
          )}

          {error && (
            <Alert status="error">
              <AlertIcon />
              <AlertDescription>
                Failed to load projects. {error instanceof Error ? error.message : 'Please try again.'}
              </AlertDescription>
            </Alert>
          )}

          {data && (
            <>
              {data.data.length === 0 ? (
                <Center py={10}>
                  <VStack spacing={4}>
                    <Text fontSize="lg" color="gray.500" _dark={{ color: 'gray.400' }}>
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
                    {data.data.map((project) => (
                      <Card
                        key={project.id}
                        as={Link}
                        href={`/projects/${project.id}`}
                        cursor="pointer"
                        _hover={{
                          shadow: 'md',
                          transform: 'translateY(-2px)',
                          transition: 'all 0.2s',
                        }}
                      >
                        <CardBody>
                          <VStack align="start" spacing={3}>
                            <Heading size="md" noOfLines={1}>
                              {project.name}
                            </Heading>
                            <Text color="gray.600" _dark={{ color: 'gray.400' }} noOfLines={2} minH="48px">
                              {project.description || 'No description'}
                            </Text>
                            <HStack spacing={4} fontSize="sm" color="gray.500" _dark={{ color: 'gray.400' }}>
                              <Badge colorScheme="blue">{project.memberCount} members</Badge>
                              <Badge colorScheme="green">{project.fileCount} files</Badge>
                            </HStack>
                            <Text fontSize="sm" color="gray.500" _dark={{ color: 'gray.400' }}>
                              Updated {formatDate(project.updatedAt)}
                            </Text>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>

                  {data.totalPages > 1 && (
                    <HStack justify="center" spacing={2}>
                      <Button
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        isDisabled={page === 1}
                      >
                        Previous
                      </Button>
                      <Text fontSize="sm">
                        Page {page} of {data.totalPages}
                      </Text>
                      <Button
                        size="sm"
                        onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                        isDisabled={page === data.totalPages}
                      >
                        Next
                      </Button>
                    </HStack>
                  )}
                </>
              )}
            </>
          )}
        </VStack>
      </Container>
    </ProtectedRoute>
  );
}
