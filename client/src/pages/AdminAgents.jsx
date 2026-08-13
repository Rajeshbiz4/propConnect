import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { http, errorMessage } from '../api/client';
import { ROUTES } from '../routes';

export default function AdminAgents() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  const load = () => {
    setError('');
    http.get('/admin/agents')
      .then((response) => setItems(response.data.items || []))
      .catch((err) => setError(errorMessage(err)));
  };

  useEffect(load, []);

  const change = async (id, status) => {
    try {
      await http.put(`/admin/agents/${id}/status`, { status });
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <>
      <div className="page-head"><div><h1>Agents</h1><p className="muted">Activate or block broker accounts.</p></div></div>
      {error && <div className="alert error">{error}</div>}
      <div className="panel table-wrap responsive-table">
        <table>
          <thead><tr><th>Agent</th><th>Agency</th><th>Contact</th><th>Public URL</th><th>Status</th><th>Joined</th></tr></thead>
          <tbody>
            {items.map((agent) => (
              <tr key={agent._id}>
                <td data-label="Agent"><strong>{agent.name}</strong><small>{agent.city}</small></td>
                <td data-label="Agency">{agent.agencyName}</td>
                <td data-label="Contact">{agent.mobile}<small>{agent.email}</small></td>
                <td data-label="Public URL"><Link target="_blank" to={ROUTES.publicAgent(agent.publicSlug)}>/{agent.publicSlug} ↗</Link></td>
                <td data-label="Status">
                  <select value={agent.status} onChange={(e) => change(agent._id, e.target.value)}>
                    <option value="active">active</option><option value="blocked">blocked</option>
                  </select>
                </td>
                <td data-label="Joined">{new Date(agent.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length && <div className="empty-inline">No agents found.</div>}
      </div>
    </>
  );
}
