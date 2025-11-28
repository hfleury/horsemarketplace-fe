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

  // Show login if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-dark">
        <div className="w-full max-w-md p-8 bg-dark-200 rounded-2xl border border-dark-300">
          <h1 className="text-3xl font-bold text-white text-center mb-8">
            Welcome to <span className="gradient-text">HorseMarket</span>
          </h1>
          <LoginForm />
        </div>
      </div>
    );
  }

  // Show homepage if authenticated
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