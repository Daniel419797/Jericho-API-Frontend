import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import useAuthStore from '@/stores/authStore';
import { authService } from '@/services/authService';
import { tokenStorage } from '@/utils/token-storage';

jest.mock('@/services/authService', () => ({
  authService: {
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    getCurrentUser: jest.fn(),
  },
}));

const mockPayload = {
  tokens: {
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4MmYyZTVmMi1mOTEwLTQ4NmQtYWMyOC1lNWNlZjI5NDk2MDgiLCJlbWFpbCI6ImRhbm55cDQxOTRAZ21haWwuY29tIiwidHlwZSI6ImFjY2VzcyIsImlhdCI6MTc2ODI3NTYyMiwiZXhwIjoxNzY4ODgwNDIyfQ.C2Xz7crBado_AAS23MfYLuGGmL4prjMwUwHcDzYCW0E',
    refreshToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4MmYyZTVmMi1mOTEwLTQ4NmQtYWMyOC1lNWNlZjI5NDk2MDgiLCJqdGkiOiJjYjMxNzM4MzEzZTA2Njk5Yzk0NTdlZmM1YTNkOTdmMCIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzY4Mjc1NjIyLCJleHAiOjE3NzA4Njc2MjJ9.VFzLi4tQBReVQEWu2nTyz4omgxiCYVsbRI8I6uErKSk',
  },
  user: {
    id: '82f2e5f2-f910-486d-ac28-e5cef2949608',
    email: 'dannyp4194@gmail.com',
    isActive: true,
    createdAt: '2026-01-13T03:30:47.119198+00:00',
    updatedAt: '2026-01-13T03:30:47.119198+00:00',
    isEmailVerified: false,
    tier: 'casual',
  },
};

function TestConsumer() {
  const register = useAuthStore((s) => s.register);
  const user = useAuthStore((s) => s.user);
  return (
    <div>
      <button
        onClick={async () => {
          await register({ name: 'Test User', email: 'dannyp4194@gmail.com', password: 'password123' });
        }}
      >
        Register
      </button>
      <div data-testid="user-email">{user?.email ?? ''}</div>
    </div>
  );
}

describe('AuthProvider.register', () => {
  beforeEach(() => {
    // Ensure AuthProvider does not attempt to init auth from existing tokens
    jest.spyOn(tokenStorage, 'hasTokens').mockReturnValue(false);
  });

  afterEach(() => {
    jest.resetAllMocks();
    // reset zustand store state inside act for React testing
    try {
      // eslint-disable-next-line testing-library/no-unnecessary-act
      const { act } = require('@testing-library/react');
      act(() => {
        useAuthStore.setState({ user: null, isLoading: false, isAuthenticated: false });
      });
    } catch (e) {}
  });

  it('calls apiClient.register, stores tokens and sets user', async () => {
    (authService.register as jest.Mock).mockResolvedValueOnce(mockPayload);

    const setTokensSpy = jest.spyOn(tokenStorage, 'setTokens');

    render(<TestConsumer />);

    const userClick = userEvent.setup();
    await userClick.click(screen.getByText('Register'));

    await waitFor(() => {
      expect(setTokensSpy).toHaveBeenCalledWith(mockPayload.tokens);
    });

    expect(screen.getByTestId('user-email')).toHaveTextContent(mockPayload.user.email);
  });
});
