import { useEffect, useState } from 'react';
import { http, errorMessage } from '../api/client';

const statuses = ['new', 'contacted', 'visit-scheduled', 'interested', 'not-interested', 'closed'];

export default function Enquiries() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  const load = () => {
    setError('');
    http.get('/enquiries')
      .then((response) => setItems(response.data.items || []))
      .catch((err) => setError(errorMessage(err)));
  };

  useEffect(load, []);

  const update = async (id, status) => {
    try {
      await http.put(`/enquiries/${id}/status`, { status });
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <>
      <div className="page-head"><div><h1>Enquiries</h1><p className="muted">Track tenant leads from your public property pages.</p></div></div>
      {error && <div className="alert error">{error}</div>}
      <div className="panel table-wrap responsive-table">
        <table>
          <thead><tr><th>Tenant</th><th>Property</th><th>Contact</th><th>Message</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id}>
                <td data-label="Tenant"><strong>{item.tenantName}</strong></td>
                <td data-label="Property">{item.property?.title || 'Property removed'}<small>{item.property?.propertyCode}</small></td>
                <td data-label="Contact"><a href={`tel:${item.mobile}`}>{item.mobile}</a>{item.email && <small>{item.email}</small>}</td>
                <td data-label="Message" className="message-cell">{item.message || '—'}</td>
                <td data-label="Status">
                  <select value={item.status} onChange={(e) => update(item._id, e.target.value)}>
                    {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </td>
                <td data-label="Date">{new Date(item.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length && <div className="empty-inline">No enquiries yet.</div>}
      </div>
    </>
  );
}
