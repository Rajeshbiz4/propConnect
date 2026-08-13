import {
  Building2,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Plus,
  Settings,
  Shield,
  Users,
  X,
} from 'lucide-react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES } from '../routes';

export default function Layout({ admin = false }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  const agentItems = [
    [ROUTES.app, LayoutDashboard, 'Dashboard'],
    [ROUTES.properties, Building2, 'Properties'],
    [ROUTES.newProperty, Plus, 'Add Property'],
    [ROUTES.enquiries, MessageSquare, 'Enquiries'],
    [ROUTES.profile, Settings, 'Profile'],
  ];

  const adminItems = [
    [ROUTES.admin, Shield, 'Admin Dashboard'],
    [ROUTES.adminAgents, Users, 'Agents'],
    [ROUTES.adminProperties, ClipboardList, 'Properties'],
  ];

  const items = admin ? adminItems : agentItems;

  const doLogout = () => {
    logout();
    navigate(ROUTES.login, { replace: true });
  };

  return (
    <div className="app-shell">
      {open && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}

      <aside className={`sidebar ${open ? 'open' : ''}`} aria-label="Main navigation">
        <div className="brand">
          <span className="brand-mark">P</span>
          <div>
            <strong>PropConnect</strong>
            <small>Broker Portal</small>
          </div>
        </div>

        <button
          type="button"
          className="sidebar-close"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        >
          <X size={20} />
        </button>

        <nav>
          {items.map(([to, Icon, label]) => (
            <NavLink
              end={to === ROUTES.app || to === ROUTES.admin}
              key={to}
              to={to}
              onClick={() => setOpen(false)}
            >
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {!admin && user?.publicSlug && (
          <Link className="public-link" to={ROUTES.publicAgent(user.publicSlug)} target="_blank">
            View public page ↗
          </Link>
        )}

        <button type="button" className="logout-btn" onClick={doLogout}>
          <LogOut size={18} /> Logout
        </button>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <button
            type="button"
            className="menu-btn"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <Menu size={22} />
          </button>
          <div className="topbar-user">
            <strong>{user?.agencyName || 'Admin'}</strong>
            <small>{user?.name}</small>
          </div>
        </header>
        <main className="content"><Outlet /></main>
      </div>
    </div>
  );
}
