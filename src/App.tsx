import { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginForm from './components/auth/LoginForm';
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

  // Listen for login event from Header
  useEffect(() => {
    const handleShowLogin = () => setShowLogin(true);
    window.addEventListener('show-login', handleShowLogin);
    return () => window.removeEventListener('show-login', handleShowLogin);
  }, []);

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