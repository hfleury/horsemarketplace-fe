import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from './AuthContext';
import { useAuth } from '../hooks/useAuth';

vi.mock('../api/auth', () => ({
  authApi: { login: vi.fn() },
}));

function SessionProbe() {
  const { user, token } = useAuth();
  return <p>{user ? `${user.username}:${token}` : 'logged out'}</p>;
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <SessionProbe />
    </AuthProvider>
  );
}

describe('AuthProvider session restore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('restores a stored user that has an id', async () => {
    localStorage.setItem('authToken', 'tok-1');
    localStorage.setItem('authUser', JSON.stringify({ id: 'u1', username: 'anna', email: 'a@x.se' }));

    renderWithProvider();

    expect(await screen.findByText('anna:tok-1')).toBeInTheDocument();
  });

  it('logs out and clears storage when the stored user has no id', async () => {
    localStorage.setItem('authToken', 'tok-1');
    localStorage.setItem('authUser', JSON.stringify({ username: 'anna', email: 'a@x.se' }));

    renderWithProvider();

    expect(await screen.findByText('logged out')).toBeInTheDocument();
    expect(localStorage.getItem('authToken')).toBeNull();
    expect(localStorage.getItem('authUser')).toBeNull();
  });

  it('clears storage when the stored user is not valid JSON', async () => {
    localStorage.setItem('authToken', 'tok-1');
    localStorage.setItem('authUser', '{not json');

    renderWithProvider();

    expect(await screen.findByText('logged out')).toBeInTheDocument();
    expect(localStorage.getItem('authToken')).toBeNull();
  });
});
