import { useEffect, useState } from 'react';
import { Building2, CircleCheck, Home, MessageSquare, Plus, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { http, errorMessage } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { appAbsoluteUrl, ROUTES } from '../routes';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    http.get('/dashboard').then((response) => setData(response.data)).catch((err) => setError(errorMessage(err)));
  }, []);

  const publicUrl = user?.publicSlug ? appAbsoluteUrl(ROUTES.publicAgent(user.publicSlug)) : '';

  const copy = async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt('Copy public property link', publicUrl);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">Welcome back, {user?.name}.</p>
        </div>
        <Link className="btn primary" to={ROUTES.newProperty}><Plus size={18} /> Add Property</Link>
      </div>
      {error && <div className="alert error">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card"><Building2 /><div><span>Total properties</span><strong>{data?.total ?? '—'}</strong></div></div>
        <div className="stat-card"><Home /><div><span>Vacant / Available</span><strong>{data ? data.vacant + data.available : '—'}</strong></div></div>
        <div className="stat-card"><CircleCheck /><div><span>Rented / Sold</span><strong>{data ? data.rented + data.sold : '—'}</strong></div></div>
        <div className="stat-card"><MessageSquare /><div><span>Enquiries</span><strong>{data?.enquiries ?? '—'}</strong></div></div>
      </div>

      <section className="panel">
        <div className="panel-head">
          <div><h2>Your public property page</h2><p className="muted">Share this single link with tenants.</p></div>
          <button type="button" onClick={copy} className="btn secondary" disabled={!publicUrl}><Share2 size={17} /> {copied ? 'Copied' : 'Copy link'}</button>
        </div>
        {publicUrl && (
          <div className="public-url">
            <code>{publicUrl}</code>
            <Link to={ROUTES.publicAgent(user.publicSlug)} target="_blank">Open ↗</Link>
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-head"><h2>Recently added</h2><Link to={ROUTES.properties}>View all</Link></div>
        {!data?.recent?.length
          ? <p className="muted">No properties yet. Add your first listing.</p>
          : (
            <div className="simple-list">
              {data.recent.map((property) => (
                <Link key={property._id} to={ROUTES.editProperty(property._id)}>
                  <div><strong>{property.title}</strong><small>{property.propertyCode} · {property.status}</small></div>
                  <span>{property.address?.area || property.address?.city || '—'} →</span>
                </Link>
              ))}
            </div>
          )}
      </section>
    </>
  );
}
