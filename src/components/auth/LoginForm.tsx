import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FormTextField from '../ui/FormTextField';
import { useAuth } from '../../hooks/useAuth';
import AuthAlert from './AuthAlert';
import { authApi } from '../../api/auth';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendSeverity, setResendSeverity] = useState<'success' | 'error' | 'info'>('info');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      // Redirect happens in App.tsx via router (or here if no router yet)
    } catch (err) {
      // Error already handled in context; UI shows via `error`
    }
  };

  const handleResendVerification = async () => {
    setResendMessage(null);
    // Prefer an email address for resending verification
    if (!username || !username.includes('@')) {
      setResendSeverity('error');
      setResendMessage('Please enter your email address above to resend verification.');
      return;
    }

    setResendLoading(true);
    try {
      await authApi.resendVerification(username);
      setResendSeverity('success');
      setResendMessage('Verification email sent — check your inbox.');
    } catch (err: any) {
      let msg = err?.message || 'Failed to resend verification email.';
      try {
        const match = /{.*}/.exec(err?.message || '');
        if (match) {
          const parsed = JSON.parse(match[0]);
          if (parsed && parsed.message) msg = parsed.message;
        }
      } catch (e) {
        // ignore
      }
      setResendSeverity('error');
      setResendMessage(msg);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      <FormTextField
        id="username"
        label="Username or Email Address"
        name="username"
        autoComplete="username"
        autoFocus
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <FormTextField
        name="password"
        label="Password"
        type="password"
        id="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <AuthAlert severity="error" message={error} />}
      {/* If the backend indicates email verification is required, show guidance and a resend action */}
      {error && /verify|verification|verified/i.test(error) && (
        <>
          <AuthAlert
            severity="info"
            message={
              'It looks like your email is not verified. Check your inbox for a verification link.'
            }
          />
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              onClick={handleResendVerification}
              disabled={resendLoading}
              variant="text"
            >
              {resendLoading ? 'Sending...' : 'Resend verification email'}
            </Button>
          </Box>
        </>
      )}

      {resendMessage && <AuthAlert severity={resendSeverity} message={resendMessage} />}
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={loading}
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
    </Box>
  );
};

export default LoginForm;