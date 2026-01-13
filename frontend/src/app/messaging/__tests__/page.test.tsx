import { render, screen, waitFor } from '@testing-library/react';
import MessagingPage from '../page';
import '@testing-library/jest-dom';

// Mock the API client
jest.mock('@/services/api-client', () => ({
  apiClient: {
    getChannels: jest.fn(),
    getMessages: jest.fn(),
    sendMessage: jest.fn(),
  },
}));

// Mock the useQuery and useMutation hooks
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn((options) => {
    if (options.queryKey[0] === 'channels') {
      return {
        data: [
          {
            id: '1',
            name: 'General',
            description: 'General discussion',
            unreadCount: 2,
            createdAt: '2024-01-01T00:00:00Z',
          },
        ],
        isLoading: false,
        error: null,
      };
    }
    return {
      data: null,
      isLoading: false,
      error: null,
    };
  }),
  useMutation: jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
  })),
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
  })),
}));

// Mock the auth context
jest.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({
    user: { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' },
    isLoading: false,
    isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));

// Mock the router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

describe('MessagingPage', () => {
  it('renders messaging page', async () => {
    render(<MessagingPage />);

    await waitFor(() => {
      expect(screen.getByText('Messaging')).toBeInTheDocument();
      expect(screen.getByText('View and send messages')).toBeInTheDocument();
    });
  });

  it('displays channel list', async () => {
    render(<MessagingPage />);

    await waitFor(() => {
      expect(screen.getByText('Channels')).toBeInTheDocument();
      const generalElements = screen.getAllByText('General');
      expect(generalElements.length).toBeGreaterThan(0);
      const descriptionElements = screen.getAllByText('General discussion');
      expect(descriptionElements.length).toBeGreaterThan(0);
    });
  });

  it('shows unread count badge', async () => {
    render(<MessagingPage />);

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument(); // Unread count badge
    });
  });
});
