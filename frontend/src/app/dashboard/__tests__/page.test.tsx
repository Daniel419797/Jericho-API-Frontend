import { render, screen, waitFor } from '@testing-library/react';
import DashboardPage from '../page';
import '@testing-library/jest-dom';

// Mock the API client
jest.mock('@/services/api-client', () => ({
  apiClient: {
    getDashboardData: jest.fn(),
  },
}));

// Mock the Chakra UI components
jest.mock('@chakra-ui/react', () => {
  const actual = jest.requireActual('@chakra-ui/react');
  return {
    ...actual,
  };
});

// Mock the useQuery hook
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({
    data: {
      stats: {
        projectsCount: 5,
        unreadMessagesCount: 3,
        activeProjectsCount: 4,
      },
      recentActivities: [
        {
          id: '1',
          type: 'project_created',
          description: 'New project created',
          timestamp: '2024-01-01T00:00:00Z',
          userId: '1',
          userName: 'John Doe',
        },
      ],
    },
    isLoading: false,
    error: null,
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

describe('DashboardPage', () => {
  it('renders dashboard with stats', async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Welcome back, John Doe!')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument(); // Projects count
      expect(screen.getByText('3')).toBeInTheDocument(); // Messages count
    });
  });

  it('displays recent activities', async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
      expect(screen.getByText('New project created')).toBeInTheDocument();
      const johnDoeElements = screen.getAllByText(/John Doe/);
      expect(johnDoeElements.length).toBeGreaterThan(0);
    });
  });
});
