'use client';

import {
  Container,
  Heading,
  Text,
  VStack,
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Card,
  CardBody,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  AlertDescription,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  HStack,
} from '@chakra-ui/react';
import { DownloadIcon } from '@chakra-ui/icons';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api-client';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { formatDate, formatDateTime } from '@/utils/date-utils';
import { formatFileSize } from '@/utils/file-utils';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;

  const {
    data: project,
    isLoading: projectLoading,
    error: projectError,
  } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => apiClient.getProject(projectId),
  });

  const {
    data: members,
    isLoading: membersLoading,
    error: membersError,
  } = useQuery({
    queryKey: ['project-members', projectId],
    queryFn: () => apiClient.getProjectMembers(projectId),
  });

  const {
    data: files,
    isLoading: filesLoading,
    error: filesError,
  } = useQuery({
    queryKey: ['project-files', projectId],
    queryFn: () => apiClient.getProjectFiles(projectId),
  });

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      const blob = await apiClient.downloadFile(fileId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'purple';
      case 'admin':
        return 'red';
      case 'member':
        return 'blue';
      case 'viewer':
        return 'gray';
      default:
        return 'gray';
    }
  };

  return (
    <ProtectedRoute>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          {projectLoading && (
            <Center py={10}>
              <Spinner size="xl" />
            </Center>
          )}

          {projectError && (
            <Alert status="error">
              <AlertIcon />
              <AlertDescription>
                Failed to load project. {projectError instanceof Error ? projectError.message : 'Please try again.'}
              </AlertDescription>
            </Alert>
          )}

          {project && (
            <>
              <Box>
                <Heading as="h1" size="xl" mb={2}>
                  {project.name}
                </Heading>
                <Text color="gray.600" _dark={{ color: 'gray.400' }}>
                  {project.description || 'No description'}
                </Text>
              </Box>

              <Tabs>
                <TabList>
                  <Tab>Overview</Tab>
                  <Tab>Members ({members?.length || 0})</Tab>
                  <Tab>Files ({files?.length || 0})</Tab>
                </TabList>

                <TabPanels>
                  <TabPanel>
                    <Card>
                      <CardBody>
                        <VStack align="start" spacing={4}>
                          <Box>
                            <Text fontWeight="bold" mb={1}>
                              Created
                            </Text>
                            <Text color="gray.600" _dark={{ color: 'gray.400' }}>
                              {formatDate(project.createdAt)}
                            </Text>
                          </Box>
                          <Box>
                            <Text fontWeight="bold" mb={1}>
                              Last Updated
                            </Text>
                            <Text color="gray.600" _dark={{ color: 'gray.400' }}>
                              {formatDate(project.updatedAt)}
                            </Text>
                          </Box>
                          <Box>
                            <Text fontWeight="bold" mb={1}>
                              Statistics
                            </Text>
                            <HStack spacing={4}>
                              <Badge colorScheme="blue">{project.memberCount} members</Badge>
                              <Badge colorScheme="green">{project.fileCount} files</Badge>
                            </HStack>
                          </Box>
                        </VStack>
                      </CardBody>
                    </Card>
                  </TabPanel>

                  <TabPanel>
                    {membersLoading && (
                      <Center py={10}>
                        <Spinner />
                      </Center>
                    )}

                    {membersError && (
                      <Alert status="error">
                        <AlertIcon />
                        <AlertDescription>
                          Failed to load members.{' '}
                          {membersError instanceof Error ? membersError.message : 'Please try again.'}
                        </AlertDescription>
                      </Alert>
                    )}

                    {members && (
                      <>
                        {members.length === 0 ? (
                          <Center py={10}>
                            <Text color="gray.500" _dark={{ color: 'gray.400' }}>
                              No members yet
                            </Text>
                          </Center>
                        ) : (
                          <Card>
                            <CardBody p={0}>
                              <Table>
                                <Thead>
                                  <Tr>
                                    <Th>Name</Th>
                                    <Th>Email</Th>
                                    <Th>Role</Th>
                                    <Th>Joined</Th>
                                  </Tr>
                                </Thead>
                                <Tbody>
                                  {members.map((member) => (
                                    <Tr key={member.id}>
                                      <Td>{member.userName}</Td>
                                      <Td>{member.userEmail}</Td>
                                      <Td>
                                        <Badge colorScheme={getRoleBadgeColor(member.role)}>{member.role}</Badge>
                                      </Td>
                                      <Td>{formatDate(member.joinedAt)}</Td>
                                    </Tr>
                                  ))}
                                </Tbody>
                              </Table>
                            </CardBody>
                          </Card>
                        )}
                      </>
                    )}
                  </TabPanel>

                  <TabPanel>
                    {filesLoading && (
                      <Center py={10}>
                        <Spinner />
                      </Center>
                    )}

                    {filesError && (
                      <Alert status="error">
                        <AlertIcon />
                        <AlertDescription>
                          Failed to load files.{' '}
                          {filesError instanceof Error ? filesError.message : 'Please try again.'}
                        </AlertDescription>
                      </Alert>
                    )}

                    {files && (
                      <>
                        {files.length === 0 ? (
                          <Center py={10}>
                            <Text color="gray.500" _dark={{ color: 'gray.400' }}>
                              No files yet
                            </Text>
                          </Center>
                        ) : (
                          <Card>
                            <CardBody p={0}>
                              <Table>
                                <Thead>
                                  <Tr>
                                    <Th>Name</Th>
                                    <Th>Size</Th>
                                    <Th>Uploaded By</Th>
                                    <Th>Uploaded At</Th>
                                    <Th>Actions</Th>
                                  </Tr>
                                </Thead>
                                <Tbody>
                                  {files.map((file) => (
                                    <Tr key={file.id}>
                                      <Td>{file.name}</Td>
                                      <Td>{formatFileSize(file.size)}</Td>
                                      <Td>{file.uploadedBy}</Td>
                                      <Td>{formatDateTime(file.uploadedAt)}</Td>
                                      <Td>
                                        <Button
                                          size="sm"
                                          leftIcon={<DownloadIcon />}
                                          onClick={() => handleDownload(file.id, file.name)}
                                        >
                                          Download
                                        </Button>
                                      </Td>
                                    </Tr>
                                  ))}
                                </Tbody>
                              </Table>
                            </CardBody>
                          </Card>
                        )}
                      </>
                    )}
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </>
          )}
        </VStack>
      </Container>
    </ProtectedRoute>
  );
}
