import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminLayout } from './components/admin/AdminLayout';
import { Users } from './pages/admin/Users';
import { Categories } from './pages/admin/Categories';
import { AuthProvider } from './context/AuthContext';
import CreateProduct from './pages/CreateProduct';
import { Listings } from './pages/Listings';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes with Main Layout */}
          <Route element={<Layout><Outlet /></Layout>}>
            <Route path="/" element={<Home />} />
            <Route path="/home-6" element={<Home />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<div className="container-custom py-20 text-center">Page Not Found</div>} />
            <Route path="*" element={<div className="container-custom py-20 text-center">Page Not Found</div>} />
          </Route>

          {/* Protected General Routes */}
          <Route element={<ProtectedRoute allowedRoles={['user', 'admin']} />}>
            <Route path="/create-ad" element={<CreateProduct />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<div className="p-4">Dashboard Overview (Coming Soon)</div>} />
              <Route path="users" element={<Users />} />
              <Route path="categories" element={<Categories />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;