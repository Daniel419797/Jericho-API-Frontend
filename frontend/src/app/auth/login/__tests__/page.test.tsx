import { render, screen, fireEvent } from '@testing-library/react';
import LoginPage from '../page';
import '@testing-library/jest-dom';

// Mock the Chakra UI components
jest.mock('@chakra-ui/react', () => {
  const actual = jest.requireActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => jest.fn(),
  };
});

// Mock the useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock the auth context
jest.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({
    login: jest.fn(),
    logout: jest.fn(),
    user: null,
    isLoading: false,
    isAuthenticated: false,
  }),
}));

describe('LoginPage', () => {
  it('renders login form with email and password fields', () => {
    render(<LoginPage />);

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('login-button')).toBeInTheDocument();
  });

  it('allows user to type in email and password fields', () => {
    render(<LoginPage />);

    const emailInput = screen.getByTestId('email-input') as HTMLInputElement;
    const passwordInput = screen.getByTestId('password-input') as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('has a submit button with correct text', () => {
    render(<LoginPage />);

    const submitButton = screen.getByTestId('login-button');
    expect(submitButton).toHaveTextContent('Sign In');
  });
});
