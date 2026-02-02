import { render, screen, waitFor } from '@testing-library/react';
import { ProtectedRoute } from '../ProtectedRoute';
import '@testing-library/jest-dom';

// Mock the zustand auth store
const mockUseAuthStore = jest.fn();
jest.mock('@/stores/authStore', () => ({
  __esModule: true,
  default: (selector: any) => selector(mockUseAuthStore()),
}));

// Mock the router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when authenticated', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', name: 'John Doe', email: 'john@example.com', role: 'user' },
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('shows loading spinner when loading', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', async () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth/login');
    });
  });

  it('redirects non-admin users from admin routes', async () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', name: 'John Doe', email: 'john@example.com', role: 'user' },
    });

    render(
      <ProtectedRoute requireAdmin>
        <div>Admin Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('allows admin users to access admin routes', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'admin' },
    });

    render(
      <ProtectedRoute requireAdmin>
        <div>Admin Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });
});
