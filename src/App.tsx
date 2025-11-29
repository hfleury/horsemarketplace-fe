import { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';
import { authApi } from './api/auth';
import AuthAlert from './components/auth/AuthAlert';
import LoginForm from './components/auth/LoginForm';
import ResendVerification from './components/auth/ResendVerification';
import PageLayout from './components/layout/PageLayout';
import HomePage from './app/HomePage';

// Dark theme for MUI components (used in login form)
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8358FF',
    },
    background: {
      default: '#0D0D11',
      paper: '#1A1A1F',
    },
  },
});

function AppContent() {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);
  const [verifySeverity, setVerifySeverity] = useState<'success' | 'error' | 'info'>('info');

  // Listen for login event from Header
  useEffect(() => {
    const handleShowLogin = () => setShowLogin(true);
    window.addEventListener('show-login', handleShowLogin);
    return () => window.removeEventListener('show-login', handleShowLogin);
  }, []);

  // Check for email verification token in URL and attempt verification
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      if (!token) return;

      // perform verification
      authApi
        .verify(token)
        .then(() => {
          setVerifySeverity('success');
          setVerifyMessage('Your email has been verified. Thank you!');
        })
        .catch((err: any) => {
          setVerifySeverity('error');
          setVerifyMessage(err?.message || 'Failed to verify email. The token may be invalid or expired.');
        })
        .finally(() => {
          // remove token param from URL to avoid repeated attempts
          params.delete('token');
          const newQuery = params.toString();
          const newUrl = window.location.pathname + (newQuery ? `?${newQuery}` : '');
          window.history.replaceState({}, '', newUrl);
        });
    } catch (e) {
      // ignore
    }
  }, []);

  // If user navigated directly to /resend-verification, show the dedicated page
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  if (pathname === '/resend-verification') {
    return (
      <PageLayout>
        {verifyMessage && <AuthAlert severity={verifySeverity} message={verifyMessage} />}
        <ResendVerification />
      </PageLayout>
    );
  }

  if (showLogin && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-dark relative">
        <button
          onClick={() => setShowLogin(false)}
          className="absolute top-8 right-8 text-text-secondary hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="w-full max-w-md p-8 bg-dark-200 rounded-2xl border border-dark-300">
          <h1 className="text-3xl font-bold text-white text-center mb-8">
            Welcome to <span className="gradient-text">HorseMarket</span>
          </h1>
          <LoginForm />
        </div>
      </div>
    );
  }

  return (
    <PageLayout>
      {verifyMessage && <AuthAlert severity={verifySeverity} message={verifyMessage} />}
      <HomePage />
    </PageLayout>
  );
}

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;