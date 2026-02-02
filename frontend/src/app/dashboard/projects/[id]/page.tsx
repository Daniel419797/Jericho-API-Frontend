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
  List,
  ListItem,
  IconButton,
} from '@chakra-ui/react';
import { ArrowBackIcon, DownloadIcon } from '@chakra-ui/icons';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { projectService } from '@/services/projectService';
import { Project, ProjectMember, ProjectFile } from '@/types/project';
import { fileService } from '@/services/fileService';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { formatDate, formatDateTime } from '@/utils/date-utils';
import { formatFileSize } from '@/utils/file-utils';

export default function MyProjectDetailPage() {
  const params = useParams() as { id?: string };
  const projectId = params.id as string;

  const {
    data: project,
    isLoading: projectLoading,
    error: projectError,
  } = useQuery<Project | undefined>({
    queryKey: ['project', projectId],
    queryFn: () => projectService.getProject(projectId),
    enabled: !!projectId,
  });

  const {
    data: members,
    isLoading: membersLoading,
    error: membersError,
  } = useQuery<ProjectMember[] | undefined>({
    queryKey: ['project-members', projectId],
    queryFn: () => projectService.getProjectMembers(projectId),
    enabled: !!projectId,
  });

  const {
    data: files,
    isLoading: filesLoading,
    error: filesError,
  } = useQuery<ProjectFile[] | undefined>({
    queryKey: ['project-files', projectId],
    queryFn: () => projectService.getProjectFiles(projectId),
    enabled: !!projectId,
  });

  const {
    data: myProjects,
    isLoading: myProjectsLoading,
    error: myProjectsError,
  } = useQuery<Project[] | undefined>({
    queryKey: ['my-projects'],
    queryFn: () => projectService.getMyProjects(),
  });

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      const blob = await fileService.downloadFile(fileId);
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
                <HStack mb={2}>
                  <IconButton
                    as={Link}
                    href="/dashboard/projects"
                    aria-label="Back to projects"
                    icon={<ArrowBackIcon />}
                    variant="ghost"
                    size="sm"
                  />
                  <Heading as="h1" size="xl">
                    {project.name}
                  </Heading>
                </HStack>
                <Text color="gray.600" ml={10}>{project.description || 'No description'}</Text>
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
                            <Text color="gray.600">{formatDate(project.createdAt)}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="bold" mb={1}>
                              Last Updated
                            </Text>
                            <Text color="gray.600">{formatDate(project.updatedAt)}</Text>
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
                          {project.databaseType && (
                            <Box>
                              <Text fontWeight="bold" mb={1}>
                                Database
                              </Text>
                              <Text color="gray.600">{project.databaseType}</Text>
                            </Box>
                          )}
                          {project.metadata && (
                            <Box>
                              <Text fontWeight="bold" mb={1}>
                                Metadata
                              </Text>
                              <Text color="gray.600" fontSize="sm" whiteSpace="pre-wrap">
                                {JSON.stringify(project.metadata, null, 2)}
                              </Text>
                            </Box>
                          )}
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
                          Failed to load members. {membersError instanceof Error ? membersError.message : 'Please try again.'}
                        </AlertDescription>
                      </Alert>
                    )}

                    {members && (
                      <>
                        {members.length === 0 ? (
                          <Center py={10}>
                            <Text color="gray.500">No members yet</Text>
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
                          Failed to load files. {filesError instanceof Error ? filesError.message : 'Please try again.'}
                        </AlertDescription>
                      </Alert>
                    )}

                    {files && (
                      <>
                        {files.length === 0 ? (
                          <Center py={10}>
                            <Text color="gray.500">No files yet</Text>
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

              <Card mt={6}>
                <CardBody>
                  <Heading size="md" mb={3}>
                    Your Projects
                  </Heading>

                  {myProjectsLoading && (
                    <Center py={4}>
                      <Spinner size="sm" />
                    </Center>
                  )}

                  {myProjectsError && (
                    <Alert status="error" mb={2}>
                      <AlertIcon />
                      <AlertDescription>Failed to load your projects.</AlertDescription>
                    </Alert>
                  )}

                  {myProjects && (
                    myProjects.filter((p) => p.id !== project.id).length === 0 ? (
                      <Text color="gray.500">No other projects</Text>
                    ) : (
                      <List spacing={2}>
                        {myProjects
                          .filter((p) => p.id !== project.id)
                          .slice(0, 5)
                          .map((p) => (
                            <ListItem key={p.id}>
                              <Link href={`/dashboard/projects/${p.id}`}>
                                <Text fontWeight="medium">{p.name}</Text>
                                <Text fontSize="sm" color="gray.500">Updated {formatDate(p.updatedAt)}</Text>
                              </Link>
                            </ListItem>
                          ))}
                      </List>
                    )
                  )}
                </CardBody>
              </Card>
            </>
          )}
        </VStack>
      </Container>
    </ProtectedRoute>
  );
}
