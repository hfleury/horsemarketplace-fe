import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import FormTextField from '../ui/FormTextField';
import AuthAlert from './AuthAlert';
import { authApi } from '../../api/auth';

const SignupForm = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [severity, setSeverity] = useState<'success' | 'error' | 'info'>('info');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Basic client-side validation
    const u = username.trim();
    const em = email.trim().toLowerCase();
    if (!u || !em || !password) {
      setSeverity('error');
      setMessage('Please complete all required fields.');
      return;
    }
    if (password.length < 8) {
      setSeverity('error');
      setMessage('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setSeverity('error');
      setMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await authApi.createUser({ username: u, email: em, password });
      setSeverity('success');
      setMessage('Account created. Check your email for a verification link.');
      // After successful signup, navigate to home and open the login modal
      try {
        window.history.replaceState({}, '', '/');
        window.dispatchEvent(new Event('show-login'));
      } catch (e) {
        // fallback: navigate
        window.location.href = '/';
      }
      // Optionally clear form or suggest next steps
    } catch (err: any) {
      // Attempt to parse a JSON message from server error text
      let msg = err?.message || 'Failed to create account.';
      try {
        const match = /{.*}/.exec(err?.message || '');
        if (match) {
          const parsed = JSON.parse(match[0]);
          if (parsed && parsed.message) msg = parsed.message;
        }
      } catch (e) {
        // ignore
      }
      setSeverity('error');
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      <FormTextField
        id="signup-username"
        label="Username"
        name="username"
        autoComplete="username"
        autoFocus
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <FormTextField
        id="signup-email"
        label="Email Address"
        name="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <FormTextField
        name="password"
        label="Password"
        type="password"
        id="signup-password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <FormTextField
        name="confirmPassword"
        label="Confirm Password"
        type="password"
        id="signup-confirm-password"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />

      {message && <AuthAlert severity={severity} message={message} />}

      <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
        {loading ? 'Creating account...' : 'Create Account'}
      </Button>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="text"
          onClick={() => {
            // navigate to home and open login modal
            try {
              window.history.replaceState({}, '', '/');
              window.dispatchEvent(new Event('show-login'));
            } catch (e) {
              window.location.href = '/';
            }
          }}
        >
          Already have an account? Sign in
        </Button>
      </Box>
    </Box>
  );
};

export default SignupForm;
