import { useEffect, useState } from 'react';
import { Copy, Edit3, Plus, Share2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { http, errorMessage } from '../api/client';
import PropertyCard from '../components/PropertyCard';
import { useAuth } from '../contexts/AuthContext';
import { appAbsoluteUrl, ROUTES } from '../routes';

export default function Properties() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ status: '', purpose: '', propertyType: '' });

  const load = () => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
    setError('');
    http.get('/properties', { params })
      .then((response) => setItems(response.data.items || []))
      .catch((err) => setError(errorMessage(err)));
  };

  useEffect(load, [filters.status, filters.purpose, filters.propertyType]);

  const archive = async (id) => {
    if (!window.confirm('Archive this property?')) return;
    try {
      await http.delete(`/properties/${id}`);
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const duplicate = async (id) => {
    try {
      await http.post(`/properties/${id}/duplicate`);
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const share = async (id) => {
    if (!user?.publicSlug) return;
    const url = appAbsoluteUrl(ROUTES.publicProperty(user.publicSlug, id));
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt('Copy property link', url);
    }
  };

  return (
    <>
      <div className="page-head">
        <div><h1>Properties</h1><p className="muted">Manage all your rental and sale listings.</p></div>
        <Link className="btn primary" to={ROUTES.newProperty}><Plus size={18} /> Add Property</Link>
      </div>
      {error && <div className="alert error">{error}</div>}

      <div className="filters">
        <select aria-label="Status" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All status</option>
          <option value="vacant">Vacant</option><option value="rented">Rented</option><option value="available">Available</option><option value="sold">Sold</option><option value="temporarily-unavailable">Temporarily unavailable</option><option value="archived">Archived</option>
        </select>
        <select aria-label="Purpose" value={filters.purpose} onChange={(e) => setFilters({ ...filters, purpose: e.target.value })}>
          <option value="">Rent + Sale</option><option value="rent">Rent</option><option value="sale">Sale</option>
        </select>
        <select aria-label="Property type" value={filters.propertyType} onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}>
          <option value="">All property types</option>
          {['flat', 'house', 'bungalow', 'plot', 'shop', 'office', 'commercial', 'warehouse', 'pg', 'other'].map((x) => <option key={x} value={x}>{x}</option>)}
        </select>
      </div>

      {!items.length ? (
        <div className="empty-state"><div className="empty-icon">⌂</div><h2>No properties found</h2><p>Change filters or add a new property.</p></div>
      ) : (
        <div className="property-admin-grid">
          {items.map((property) => (
            <div key={property._id} className="admin-card-wrap">
              <PropertyCard property={property} />
              <div className="card-actions">
                <Link className="btn small secondary" to={ROUTES.editProperty(property._id)}><Edit3 size={15} /> Edit</Link>
                <button type="button" className="btn small ghost" onClick={() => duplicate(property._id)}><Copy size={15} /> Duplicate</button>
                <button type="button" className="btn small ghost" onClick={() => share(property._id)}><Share2 size={15} /> Share</button>
                <button type="button" className="btn small danger-link" onClick={() => archive(property._id)}><Trash2 size={15} /> Archive</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
