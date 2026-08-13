import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { http, errorMessage } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES } from '../routes';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) {
    return <Navigate to={user.role === 'admin' ? ROUTES.admin : ROUTES.app} replace />;
  }

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { data } = await http.post('/auth/login', form);
      login(data);
      const requestedPath = location.state?.from?.pathname;
      const roleHome = data.user.role === 'admin' ? ROUTES.admin : ROUTES.app;
      navigate(requestedPath || roleHome, { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo"><Building2 /><span>PropConnect</span></div>
        <h1>Welcome back</h1>
        <p className="muted">Manage your properties and tenant enquiries.</p>
        {error && <div className="alert error">{error}</div>}
        <form onSubmit={submit} className="form-stack">
          <label>Email
            <input
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label>Password
            <input
              type="password"
              required
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>
          <button className="btn primary" disabled={busy}>{busy ? 'Signing in...' : 'Login'}</button>
        </form>
        <div className="auth-links">
          <Link to={ROUTES.forgotPassword}>Forgot password?</Link>
          <span>New broker? <Link to={ROUTES.register}>Create account</Link></span>
        </div>
      </div>
    </div>
  );
}
