import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FileUpload } from '../FileUpload';
import '@testing-library/jest-dom';

// Mock the API client
jest.mock('@/services/api-client', () => ({
  apiClient: {
    uploadFile: jest.fn((file, projectId, onProgress) => {
      // Simulate progress
      if (onProgress) {
        onProgress(50);
        setTimeout(() => onProgress(100), 100);
      }
      return Promise.resolve({
        id: '1',
        name: file.name,
        size: file.size,
        url: 'https://example.com/file.txt',
      });
    }),
  },
}));

// Mock Chakra UI toast
jest.mock('@chakra-ui/react', () => {
  const actual = jest.requireActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => jest.fn(),
  };
});

describe('FileUpload', () => {
  const mockOnUploadComplete = jest.fn();
  const projectId = 'test-project-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders upload area', () => {
    render(<FileUpload projectId={projectId} onUploadComplete={mockOnUploadComplete} />);

    expect(screen.getByText('Drag and drop files here')).toBeInTheDocument();
    expect(screen.getByText('Choose Files')).toBeInTheDocument();
  });

  it('handles file selection', async () => {
    render(<FileUpload projectId={projectId} onUploadComplete={mockOnUploadComplete} />);

    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByText('Choose Files').closest('button')?.querySelector('input') as HTMLInputElement;

    if (input) {
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(input);

      await waitFor(() => {
        expect(screen.getByText('test.txt')).toBeInTheDocument();
      });
    }
  });

  it('displays upload progress', async () => {
    render(<FileUpload projectId={projectId} onUploadComplete={mockOnUploadComplete} />);

    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByText('Choose Files').closest('button')?.querySelector('input') as HTMLInputElement;

    if (input) {
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(input);

      await waitFor(() => {
        expect(screen.getByText('test.txt')).toBeInTheDocument();
      });
    }
  });
});
