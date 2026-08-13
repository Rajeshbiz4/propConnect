import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { http, errorMessage } from '../api/client';
import { ROUTES } from '../routes';

export default function AdminProperties() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    http.get('/admin/properties')
      .then((response) => setItems(response.data.items || []))
      .catch((err) => setError(errorMessage(err)));
  }, []);

  return (
    <>
      <div className="page-head"><div><h1>All properties</h1><p className="muted">Review listings across the platform.</p></div></div>
      {error && <div className="alert error">{error}</div>}
      <div className="panel table-wrap responsive-table">
        <table>
          <thead><tr><th>Property</th><th>Agent</th><th>Type</th><th>Location</th><th>Status</th><th>Views</th></tr></thead>
          <tbody>
            {items.map((property) => (
              <tr key={property._id}>
                <td data-label="Property">
                  {property.agent?.publicSlug
                    ? <Link target="_blank" to={ROUTES.publicProperty(property.agent.publicSlug, property._id)}><strong>{property.title}</strong></Link>
                    : <strong>{property.title}</strong>}
                  <small>{property.propertyCode}</small>
                </td>
                <td data-label="Agent">{property.agent?.agencyName || '—'}<small>{property.agent?.email}</small></td>
                <td data-label="Type">{property.purpose} / {property.propertyType}</td>
                <td data-label="Location">{[property.address?.area, property.address?.city].filter(Boolean).join(', ') || '—'}</td>
                <td data-label="Status"><span className={`status-pill status-${property.status}`}>{property.status}</span></td>
                <td data-label="Views">{property.viewCount || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length && <div className="empty-inline">No properties found.</div>}
      </div>
    </>
  );
}
