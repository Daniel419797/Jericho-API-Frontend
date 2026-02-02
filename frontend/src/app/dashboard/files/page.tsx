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
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    Button,
    Spinner,
    Center,
    Alert,
    AlertIcon,
    AlertDescription,
    IconButton,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    InputGroup,
    InputLeftElement,
    Input,
    useColorModeValue,
    Icon,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    useDisclosure,
    useToast,
    AlertDialog,
    AlertDialogOverlay,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogBody,
    AlertDialogFooter,
    Select,
} from '@chakra-ui/react';
import { FiMoreVertical, FiSearch, FiUpload, FiDownload, FiTrash2, FiFile, FiImage, FiFileText } from 'react-icons/fi';
import { useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api-client';
import { formatDate } from '@/utils/date-utils';
import { fileService } from '@/services/fileService';
import { projectService } from '@/services/projectService';

interface FileItem {
    id: string;
    filename: string;
    mimeType: string;
    size: number;
    createdAt: string;
}

interface Project {
    id: string;
    name: string;
}

interface FileUploadState {
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'success' | 'error';
    error?: string;
}

export default function FilesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const { isOpen: isUploadOpen, onOpen: onUploadOpen, onClose: onUploadClose } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [uploads, setUploads] = useState<FileUploadState[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cancelRef = useRef(null);
    const toast = useToast();
    const queryClient = useQueryClient();

    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const rowHoverBg = useColorModeValue('gray.50', 'gray.700');
    const dropzoneBg = useColorModeValue('gray.50', 'gray.700');
    const dropzoneActiveBg = useColorModeValue('brand.50', 'rgba(49, 130, 206, 0.1)');
    const progressBg = useColorModeValue('gray.200', 'gray.600');

    const { data: files, isLoading, error } = useQuery<FileItem[]>({
        queryKey: ['files'],
        queryFn: () => apiClient.request<FileItem[]>('/files'),
    });

    const { data: projectsData } = useQuery({
        queryKey: ['projects'],
        queryFn: () => projectService.getProjects(),
    });
    
    const projects = projectsData?.data ?? [];

    const deleteFileMutation = useMutation({
        mutationFn: (fileId: string) => apiClient.request(`/files/${fileId}`, { method: 'DELETE' }),
        onSuccess: () => {
            toast({ title: 'File deleted', status: 'success' });
            queryClient.invalidateQueries({ queryKey: ['files'] });
            onDeleteClose();
        },
        onError: (err: Error) => {
            toast({ title: 'Failed to delete file', description: err.message, status: 'error' });
        },
    });

    const handleUploadFiles = useCallback(async (filesToUpload: File[]) => {
        if (!selectedProjectId) {
            toast({ title: 'Please select a project', status: 'warning' });
            return;
        }

        const newUploads: FileUploadState[] = filesToUpload.map((file) => ({
            file,
            progress: 0,
            status: 'pending' as const,
        }));

        setUploads((prev) => [...prev, ...newUploads]);

        for (const file of filesToUpload) {
            try {
                setUploads((prev) =>
                    prev.map((u) =>
                        u.file === file ? { ...u, status: 'uploading' } : u
                    )
                );

                await fileService.uploadFile(file, selectedProjectId, (progress) => {
                    setUploads((prev) =>
                        prev.map((u) =>
                            u.file === file ? { ...u, progress } : u
                        )
                    );
                });

                setUploads((prev) =>
                    prev.map((u) =>
                        u.file === file ? { ...u, status: 'success', progress: 100 } : u
                    )
                );
            } catch (err) {
                setUploads((prev) =>
                    prev.map((u) =>
                        u.file === file
                            ? { ...u, status: 'error', error: err instanceof Error ? err.message : 'Upload failed' }
                            : u
                    )
                );
            }
        }

        queryClient.invalidateQueries({ queryKey: ['files'] });
    }, [selectedProjectId, toast, queryClient]);

    const handleDownload = async (file: FileItem) => {
        try {
            const blob = await fileService.downloadFile(file.id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = file.filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            toast({ title: 'Download failed', description: err instanceof Error ? err.message : 'Unknown error', status: 'error' });
        }
    };

    const handleDeleteFile = (file: FileItem) => {
        setFileToDelete(file);
        onDeleteOpen();
    };

    const confirmDelete = () => {
        if (fileToDelete) {
            deleteFileMutation.mutate(fileToDelete.id);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        handleUploadFiles(droppedFiles);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleUploadFiles(Array.from(e.target.files));
        }
    };

    const handleCloseUploadModal = () => {
        setUploads([]);
        setSelectedProjectId('');
        onUploadClose();
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const getFileIcon = (mimeType: string) => {
        if (mimeType.startsWith('image/')) return FiImage;
        if (mimeType.includes('pdf') || mimeType.includes('document')) return FiFileText;
        return FiFile;
    };

    const filteredFiles = files?.filter(file =>
        file.filename.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Box>
            {/* Page Header */}
            <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'stretch', md: 'center' }} gap={4} mb={6}>
                <Box>
                    <Heading as="h1" size={{ base: 'lg', md: 'xl' }} mb={2}>
                        Files & Media
                    </Heading>
                    <Text color="gray.500" fontSize={{ base: 'sm', md: 'md' }}>
                        Manage uploaded files and media assets
                    </Text>
                </Box>
                <Button leftIcon={<FiUpload />} colorScheme="brand" onClick={onUploadOpen} w={{ base: 'full', md: 'auto' }}>
                    Upload File
                </Button>
            </Flex>

            {/* Search */}
            <InputGroup maxW={{ base: 'full', md: '400px' }} mb={6}>
                <InputLeftElement pointerEvents="none">
                    <FiSearch color="gray" />
                </InputLeftElement>
                <Input
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    bg={cardBg}
                />
            </InputGroup>

            {isLoading && (
                <Center py={20}>
                    <Spinner size="xl" color="brand.500" thickness="4px" />
                </Center>
            )}

            {error && (
                <Alert status="error" borderRadius="lg">
                    <AlertIcon />
                    <AlertDescription>
                        Failed to load files. {error instanceof Error ? error.message : 'Please try again.'}
                    </AlertDescription>
                </Alert>
            )}

            {filteredFiles && (
                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} overflowX="auto">
                    <CardBody p={0}>
                        {filteredFiles.length === 0 ? (
                            <Center py={20}>
                                <VStack spacing={4}>
                                    <Icon as={FiFile} boxSize={12} color="gray.400" />
                                    <Text color="gray.500">No files uploaded yet</Text>
                                    <Button leftIcon={<FiUpload />} colorScheme="brand" onClick={onUploadOpen}>
                                        Upload Your First File
                                    </Button>
                                </VStack>
                            </Center>
                        ) : (
                            <Table size={{ base: 'sm', md: 'md' }} minW="600px">
                                <Thead>
                                    <Tr>
                                        <Th>File</Th>
                                        <Th>Size</Th>
                                        <Th>Type</Th>
                                        <Th>Uploaded</Th>
                                        <Th width="50px"></Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {filteredFiles.map((file) => (
                                        <Tr key={file.id} _hover={{ bg: rowHoverBg }}>
                                            <Td>
                                                <HStack spacing={3}>
                                                    <Box
                                                        p={2}
                                                        borderRadius="lg"
                                                        bg={file.mimeType.startsWith('image/') ? 'purple.50' : 'blue.50'}
                                                        _dark={{ bg: file.mimeType.startsWith('image/') ? 'rgba(159, 122, 234, 0.15)' : 'rgba(33, 150, 243, 0.15)' }}
                                                    >
                                                        <Icon
                                                            as={getFileIcon(file.mimeType)}
                                                            color={file.mimeType.startsWith('image/') ? 'purple.500' : 'blue.500'}
                                                        />
                                                    </Box>
                                                    <Text fontWeight="medium" noOfLines={1} maxW="300px">
                                                        {file.filename}
                                                    </Text>
                                                </HStack>
                                            </Td>
                                            <Td>
                                                <Text fontSize="sm" color="gray.500">{formatFileSize(file.size)}</Text>
                                            </Td>
                                            <Td>
                                                <Badge variant="subtle" colorScheme="gray">
                                                    {file.mimeType.split('/')[1]?.toUpperCase() || 'FILE'}
                                                </Badge>
                                            </Td>
                                            <Td>
                                                <Text fontSize="sm" color="gray.500">{formatDate(file.createdAt)}</Text>
                                            </Td>
                                            <Td>
                                                <Menu>
                                                    <MenuButton
                                                        as={IconButton}
                                                        icon={<FiMoreVertical />}
                                                        variant="ghost"
                                                        size="sm"
                                                    />
                                                    <MenuList>
                                                        <MenuItem icon={<FiDownload />} onClick={() => handleDownload(file)}>
                                                            Download
                                                        </MenuItem>
                                                        <MenuItem icon={<FiTrash2 />} color="red.500" onClick={() => handleDeleteFile(file)}>
                                                            Delete
                                                        </MenuItem>
                                                    </MenuList>
                                                </Menu>
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        )}
                    </CardBody>
                </Card>
            )}

            {/* Upload Modal */}
            <Modal isOpen={isUploadOpen} onClose={handleCloseUploadModal} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Upload Files</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <Select
                                placeholder="Select a project"
                                value={selectedProjectId}
                                onChange={(e) => setSelectedProjectId(e.target.value)}
                            >
                                {projects?.map((project) => (
                                    <option key={project.id} value={project.id}>
                                        {project.name}
                                    </option>
                                ))}
                            </Select>

                            <Box
                                w="full"
                                p={8}
                                borderWidth="2px"
                                borderStyle="dashed"
                                borderRadius="lg"
                                borderColor={isDragOver ? 'brand.400' : borderColor}
                                bg={isDragOver ? dropzoneActiveBg : dropzoneBg}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                textAlign="center"
                                cursor="pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <VStack spacing={2}>
                                    <Icon as={FiUpload} boxSize={8} color="gray.400" />
                                    <Text fontWeight="medium">
                                        Drag and drop files here, or click to browse
                                    </Text>
                                    <Text fontSize="sm" color="gray.500">
                                        Supports any file type up to 50MB
                                    </Text>
                                </VStack>
                            </Box>

                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                multiple
                                onChange={handleFileSelect}
                            />

                            {uploads.length > 0 && (
                                <VStack w="full" spacing={2} align="stretch">
                                    {uploads.map((upload, idx) => (
                                        <Box key={idx} p={3} borderWidth="1px" borderRadius="md">
                                            <HStack justify="space-between" mb={1}>
                                                <Text fontSize="sm" noOfLines={1}>
                                                    {upload.file.name}
                                                </Text>
                                                <Badge
                                                    colorScheme={
                                                        upload.status === 'success'
                                                            ? 'green'
                                                            : upload.status === 'error'
                                                            ? 'red'
                                                            : upload.status === 'uploading'
                                                            ? 'blue'
                                                            : 'gray'
                                                    }
                                                >
                                                    {upload.status}
                                                </Badge>
                                            </HStack>
                                            {upload.status === 'uploading' && (
                                                <Box w="full" bg={progressBg} borderRadius="full" h="4px">
                                                    <Box
                                                        bg="brand.500"
                                                        h="4px"
                                                        borderRadius="full"
                                                        w={`${upload.progress}%`}
                                                        transition="width 0.2s"
                                                    />
                                                </Box>
                                            )}
                                            {upload.error && (
                                                <Text fontSize="xs" color="red.500">{upload.error}</Text>
                                            )}
                                        </Box>
                                    ))}
                                </VStack>
                            )}
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={handleCloseUploadModal}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Delete Confirmation */}
            <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={onDeleteClose}>
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader>Delete File</AlertDialogHeader>
                        <AlertDialogBody>
                            Are you sure you want to delete &quot;{fileToDelete?.filename}&quot;? This action cannot be undone.
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onDeleteClose}>
                                Cancel
                            </Button>
                            <Button
                                colorScheme="red"
                                onClick={confirmDelete}
                                ml={3}
                                isLoading={deleteFileMutation.isPending}
                            >
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
}
