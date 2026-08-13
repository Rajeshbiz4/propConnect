import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import { useAuth } from './contexts/AuthContext';
import { ROUTES } from './routes';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import PropertyForm from './pages/PropertyForm';
import Enquiries from './pages/Enquiries';
import Profile from './pages/Profile';
import PublicAgentPage from './pages/PublicAgentPage';
import PublicPropertyDetail from './pages/PublicPropertyDetail';
import AdminDashboard from './pages/AdminDashboard';
import AdminAgents from './pages/AdminAgents';
import AdminProperties from './pages/AdminProperties';
import NotFound from './pages/NotFound';

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="center-page"><div className="spinner" /></div>;
  if (!user) return <Navigate to={ROUTES.login} replace />;
  return <Navigate to={user.role === 'admin' ? ROUTES.admin : ROUTES.app} replace />;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path={ROUTES.home} element={<HomeRedirect />} />
        <Route path={ROUTES.login} element={<Login />} />
        <Route path={ROUTES.register} element={<Register />} />
        <Route path={ROUTES.forgotPassword} element={<ForgotPassword />} />
        <Route path="/reset-password" element={<Navigate to={ROUTES.forgotPassword} replace />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route path="/agent/:slug" element={<PublicAgentPage />} />
        <Route path="/agent/:slug/property/:id" element={<PublicPropertyDetail />} />
        <Route path="/agent/:slug/properties/:id" element={<PublicPropertyDetail />} />

        <Route
          path="/app"
          element={
            <ProtectedRoute roles={['agent']}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Navigate to={ROUTES.app} replace />} />
          <Route path="properties" element={<Properties />} />
          <Route path="properties/new" element={<PropertyForm />} />
          <Route path="properties/:id" element={<PropertyForm />} />
          <Route path="properties/:id/edit" element={<PropertyForm />} />
          <Route path="enquiries" element={<Enquiries />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <Layout admin />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<Navigate to={ROUTES.admin} replace />} />
          <Route path="agents" element={<AdminAgents />} />
          <Route path="properties" element={<AdminProperties />} />
        </Route>

        {/* Friendly aliases for old/bookmarked links. */}
        <Route path="/dashboard" element={<Navigate to={ROUTES.app} replace />} />
        <Route path="/properties" element={<Navigate to={ROUTES.properties} replace />} />
        <Route path="/properties/new" element={<Navigate to={ROUTES.newProperty} replace />} />
        <Route path="/enquiries" element={<Navigate to={ROUTES.enquiries} replace />} />
        <Route path="/profile" element={<Navigate to={ROUTES.profile} replace />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
