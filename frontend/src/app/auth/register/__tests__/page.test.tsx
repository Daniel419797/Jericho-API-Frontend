import { render, screen, fireEvent } from '@testing-library/react';
import RegisterPage from '../page';
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
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    user: null,
    isLoading: false,
    isAuthenticated: false,
  }),
}));

describe('RegisterPage', () => {
  it('renders registration form with name, email and password fields', () => {
    render(<RegisterPage />);

    expect(screen.getByRole('heading', { name: /Register/i })).toBeInTheDocument();
    expect(screen.getByTestId('name-input')).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('confirm-password-input')).toBeInTheDocument();
    expect(screen.getByTestId('register-button')).toBeInTheDocument();
  });

  it('allows user to type in name, email and password fields', () => {
    render(<RegisterPage />);

    const nameInput = screen.getByTestId('name-input') as HTMLInputElement;
    const emailInput = screen.getByTestId('email-input') as HTMLInputElement;
    const passwordInput = screen.getByTestId('password-input') as HTMLInputElement;
    const confirmInput = screen.getByTestId('confirm-password-input') as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmInput, { target: { value: 'password123' } });

    expect(nameInput.value).toBe('John Doe');
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
    expect(confirmInput.value).toBe('password123');
  });

  it('has a submit button with correct text', () => {
    render(<RegisterPage />);

    const submitButton = screen.getByTestId('register-button');
    expect(submitButton).toHaveTextContent('Register');
  });
});
