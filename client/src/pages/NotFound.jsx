import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES } from '../routes';

export default function NotFound() {
  const { user } = useAuth();
  const home = user ? (user.role === 'admin' ? ROUTES.admin : ROUTES.app) : ROUTES.login;
  return (
    <div className="center-page">
      <div className="auth-card">
        <h1>404</h1>
        <p className="muted">The page you requested does not exist.</p>
        <Link className="btn primary" to={home}>Go home</Link>
      </div>
    </div>
  );
}
