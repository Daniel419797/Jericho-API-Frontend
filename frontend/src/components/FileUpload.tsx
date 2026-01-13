'use client';

import { useState, useCallback } from 'react';
import {
  Box,
  VStack,
  Text,
  Button,
  Progress,
  HStack,
  Icon,
  useToast,
  List,
  ListItem,
  IconButton,
} from '@chakra-ui/react';
import { AttachmentIcon, CloseIcon, CheckIcon } from '@chakra-ui/icons';
import { apiClient } from '@/services/api-client';
import { FileUploadProgress } from '@/types/file';
import { formatFileSize } from '@/utils/file-utils';

interface FileUploadProps {
  projectId: string;
  onUploadComplete?: () => void;
}

export function FileUpload({ projectId, onUploadComplete }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploads, setUploads] = useState<FileUploadProgress[]>([]);
  const toast = useToast();

  const handleFiles = useCallback(
    async (files: File[]) => {
      const newUploads: FileUploadProgress[] = files.map((file) => ({
        file,
        progress: 0,
        status: 'pending' as const,
      }));

      setUploads((prev) => [...prev, ...newUploads]);

      // Use the callback to get the current uploads array
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        try {
          // Use functional state update to avoid stale closure
          setUploads((prev) => {
            const uploadIndex = prev.findIndex((u) => u.file === file);
            if (uploadIndex === -1) return prev;
            const updated = [...prev];
            updated[uploadIndex] = { ...updated[uploadIndex], status: 'uploading' as const };
            return updated;
          });

          await apiClient.uploadFile(file, projectId, (progress) => {
            setUploads((prev) => {
              const uploadIndex = prev.findIndex((u) => u.file === file);
              if (uploadIndex === -1) return prev;
              const updated = [...prev];
              updated[uploadIndex] = { ...updated[uploadIndex], progress };
              return updated;
            });
          });

          setUploads((prev) => {
            const uploadIndex = prev.findIndex((u) => u.file === file);
            if (uploadIndex === -1) return prev;
            const updated = [...prev];
            updated[uploadIndex] = { ...updated[uploadIndex], status: 'completed' as const, progress: 100 };
            return updated;
          });

          toast({
            title: 'Upload complete',
            description: `${file.name} uploaded successfully`,
            status: 'success',
            duration: 3000,
          });
        } catch (error) {
          setUploads((prev) => {
            const uploadIndex = prev.findIndex((u) => u.file === file);
            if (uploadIndex === -1) return prev;
            const updated = [...prev];
            updated[uploadIndex] = {
              ...updated[uploadIndex],
              status: 'error' as const,
              error: error instanceof Error ? error.message : 'Upload failed',
            };
            return updated;
          });

          toast({
            title: 'Upload failed',
            description: `Failed to upload ${file.name}`,
            status: 'error',
            duration: 5000,
          });
        }
      }

      if (onUploadComplete) {
        onUploadComplete();
      }
    },
    [projectId, onUploadComplete, toast]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    },
    [handleFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      handleFiles(files);
      // Reset input
      e.target.value = '';
    },
    [handleFiles]
  );

  const removeUpload = (index: number) => {
    setUploads((prev) => prev.filter((_, idx) => idx !== index));
  };

  return (
    <VStack spacing={4} align="stretch">
      <Box
        border="2px dashed"
        borderColor={isDragOver ? 'brand.500' : 'gray.300'}
        borderRadius="md"
        p={8}
        textAlign="center"
        bg={isDragOver ? 'gray.50' : 'transparent'}
        _dark={{
          borderColor: isDragOver ? 'brand.400' : 'gray.600',
          bg: isDragOver ? 'gray.700' : 'transparent',
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        cursor="pointer"
        transition="all 0.2s"
      >
        <VStack spacing={3}>
          <Icon as={AttachmentIcon} boxSize={12} color="gray.400" />
          <Text fontWeight="medium">Drag and drop files here</Text>
          <Text fontSize="sm" color="gray.500" _dark={{ color: 'gray.400' }}>
            or
          </Text>
          <Button as="label" colorScheme="brand" cursor="pointer">
            Choose Files
            <input type="file" multiple hidden onChange={handleFileSelect} />
          </Button>
        </VStack>
      </Box>

      {uploads.length > 0 && (
        <List spacing={2}>
          {uploads.map((upload, index) => (
            <ListItem key={index}>
              <Box
                p={3}
                border="1px"
                borderColor="gray.200"
                _dark={{ borderColor: 'gray.700' }}
                borderRadius="md"
              >
                <VStack align="stretch" spacing={2}>
                  <HStack justify="space-between">
                    <VStack align="start" spacing={0} flex={1}>
                      <Text fontWeight="medium" noOfLines={1}>
                        {upload.file.name}
                      </Text>
                      <Text fontSize="sm" color="gray.500" _dark={{ color: 'gray.400' }}>
                        {formatFileSize(upload.file.size)}
                      </Text>
                    </VStack>
                    <HStack>
                      {upload.status === 'completed' && <Icon as={CheckIcon} color="green.500" />}
                      {upload.status === 'error' && (
                        <IconButton
                          aria-label="Remove"
                          icon={<CloseIcon />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => removeUpload(index)}
                        />
                      )}
                      {upload.status !== 'error' && (
                        <IconButton
                          aria-label="Remove"
                          icon={<CloseIcon />}
                          size="sm"
                          variant="ghost"
                          onClick={() => removeUpload(index)}
                          isDisabled={upload.status === 'uploading'}
                        />
                      )}
                    </HStack>
                  </HStack>
                  {upload.status === 'uploading' && (
                    <Progress value={upload.progress} size="sm" colorScheme="brand" hasStripe isAnimated />
                  )}
                  {upload.status === 'error' && (
                    <Text fontSize="sm" color="red.500">
                      {upload.error}
                    </Text>
                  )}
                </VStack>
              </Box>
            </ListItem>
          ))}
        </List>
      )}
    </VStack>
  );
}
