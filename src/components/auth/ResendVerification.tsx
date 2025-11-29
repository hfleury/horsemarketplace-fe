import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import FormTextField from '../ui/FormTextField';
import AuthAlert from './AuthAlert';
import { authApi } from '../../api/auth';

const ResendVerification: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [severity, setSeverity] = useState<'success' | 'error' | 'info'>('info');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('authUser');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.email) setEmail(parsed.email as string);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const normalize = (s: string) => s.trim().toLowerCase();

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setMessage(null);
    const val = email.trim();
    if (!val) {
      setSeverity('error');
      setMessage('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await authApi.resendVerification(normalize(val));
      setSeverity('success');
      setMessage('If the email exists, a verification message has been sent.');
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
      setSeverity('error');
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} className="max-w-md mx-auto p-8 bg-dark-200 rounded-2xl border border-dark-300">
      <Typography variant="h4" component="h1" sx={{ mb: 2 }} className="text-white">
        Resend Verification Email
      </Typography>
      <Typography variant="body2" sx={{ mb: 4 }} className="text-text-secondary">
        Enter the email associated with your account and we'll send a new verification link.
      </Typography>

      <FormTextField
        id="resend-email"
        label="Email"
        name="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      {message && <AuthAlert severity={severity} message={message} />}

      <Button type="submit" fullWidth variant="contained" sx={{ mt: 3 }} disabled={loading}>
        {loading ? 'Sending...' : 'Send Verification Email'}
      </Button>
    </Box>
  );
};

export default ResendVerification;
