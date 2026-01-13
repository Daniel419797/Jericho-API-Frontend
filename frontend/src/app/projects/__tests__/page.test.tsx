import { render, screen, waitFor } from '@testing-library/react';
import ProjectsPage from '../page';
import '@testing-library/jest-dom';

// Mock the API client
jest.mock('@/services/api-client', () => ({
  apiClient: {
    getProjects: jest.fn(),
  },
}));

// Mock the useQuery hook
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({
    data: {
      data: [
        {
          id: '1',
          name: 'Test Project',
          description: 'A test project',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
          ownerId: '1',
          memberCount: 3,
          fileCount: 5,
        },
      ],
      total: 1,
      page: 1,
      limit: 12,
      totalPages: 1,
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

describe('ProjectsPage', () => {
  it('renders projects list', async () => {
    render(<ProjectsPage />);

    await waitFor(() => {
      expect(screen.getByText('Projects')).toBeInTheDocument();
      expect(screen.getByText('Manage your projects here')).toBeInTheDocument();
      expect(screen.getByText('Test Project')).toBeInTheDocument();
      expect(screen.getByText('A test project')).toBeInTheDocument();
    });
  });

  it('displays project statistics', async () => {
    render(<ProjectsPage />);

    await waitFor(() => {
      expect(screen.getByText('3 members')).toBeInTheDocument();
      expect(screen.getByText('5 files')).toBeInTheDocument();
    });
  });

  it('shows search input', async () => {
    render(<ProjectsPage />);

    const searchInput = screen.getByPlaceholderText('Search projects...');
    expect(searchInput).toBeInTheDocument();
  });

  it('shows new project button', async () => {
    render(<ProjectsPage />);

    const newButton = screen.getByText('New Project');
    expect(newButton).toBeInTheDocument();
  });
});
