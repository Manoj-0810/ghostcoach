import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UploadProvider } from './context/UploadContext';
import Navbar from './components/Common/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import SessionDetailPage from './pages/SessionDetailPage';
import ProgressPage from './pages/ProgressPage';
import LoadingSpinner from './components/Common/LoadingSpinner';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Navbar /><DashboardPage /></ProtectedRoute>} />
      <Route path="/upload" element={<ProtectedRoute><Navbar /><UploadPage /></ProtectedRoute>} />
      <Route path="/sessions/:id" element={<ProtectedRoute><Navbar /><SessionDetailPage /></ProtectedRoute>} />
      <Route path="/progress" element={<ProtectedRoute><Navbar /><ProgressPage /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UploadProvider>
          <div className="min-h-screen bg-gray-950">
            <AppRoutes />
          </div>
        </UploadProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
