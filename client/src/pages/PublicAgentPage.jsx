import { useEffect, useMemo, useState } from 'react';
import { Building2, MapPin, MessageCircle, Phone, RotateCcw } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { http, errorMessage } from '../api/client';
import PropertyCard from '../components/PropertyCard';
import { ROUTES } from '../routes';

const emptyFilters = { purpose: '', propertyType: '', bhk: '', area: '', minPrice: '', maxPrice: '' };

function digits(value = '') {
  return value.replace(/\D/g, '');
}

export default function PublicAgentPage() {
  const { slug } = useParams();
  const [agent, setAgent] = useState(null);
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [agentError, setAgentError] = useState('');
  const [listError, setListError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setAgentError('');
    http.get(`/public/agents/${slug}`)
      .then((response) => active && setAgent(response.data.agent))
      .catch((error) => active && setAgentError(errorMessage(error)));
    return () => { active = false; };
  }, [slug]);

  useEffect(() => {
    let active = true;
    const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== ''));
    setLoading(true);
    setListError('');
    http.get(`/public/agents/${slug}/properties`, { params })
      .then((response) => active && setItems(response.data.items || []))
      .catch((error) => active && setListError(errorMessage(error)))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [slug, filters]);

  const hasFilters = useMemo(() => Object.values(filters).some(Boolean), [filters]);

  if (agentError && !agent) return <PublicError message={agentError} />;

  return (
    <div className="public-page">
      <header className="public-header">
        <div className="public-nav">
          <div className="auth-logo light"><Building2 /><span>PropConnect</span></div>
          <Link className="btn light" to={ROUTES.login}>Broker login</Link>
        </div>

        {agent && (
          <div className="agent-hero">
            <div>
              <span className="eyebrow">Property catalogue</span>
              <h1>{agent.agencyName}</h1>
              <p>{agent.aboutAgency || `Properties listed by ${agent.name}`}</p>
              <div className="agent-info">
                <span><MapPin size={17} />{agent.city || 'India'}</span>
                {agent.reraNumber && <span>RERA: {agent.reraNumber}</span>}
              </div>
            </div>
            <div className="contact-stack">
              {agent.mobile && (
                <a className="btn light" href={`tel:${agent.mobile}`}><Phone size={17} /> Call {agent.name}</a>
              )}
              {(agent.whatsapp || agent.mobile) && (
                <a
                  className="btn whatsapp"
                  target="_blank"
                  rel="noreferrer"
                  href={`https://wa.me/${digits(agent.whatsapp || agent.mobile)}?text=${encodeURIComponent('Hello, I am viewing your property listings on PropConnect.')}`}
                >
                  <MessageCircle size={17} /> WhatsApp
                </a>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="public-content">
        <section className="search-panel">
          <div className="search-panel-heading">
            <div>
              <h2>Available properties</h2>
              <p className="muted">Find a property that matches your requirement.</p>
            </div>
            {hasFilters && (
              <button type="button" className="btn ghost small" onClick={() => setFilters(emptyFilters)}>
                <RotateCcw size={15} /> Clear filters
              </button>
            )}
          </div>

          <div className="public-filters">
            <select aria-label="Purpose" value={filters.purpose} onChange={(e) => setFilters({ ...filters, purpose: e.target.value })}>
              <option value="">Rent + Buy</option>
              <option value="rent">Rent</option>
              <option value="sale">Buy</option>
            </select>
            <select aria-label="Property type" value={filters.propertyType} onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}>
              <option value="">All types</option>
              {['flat', 'house', 'bungalow', 'plot', 'shop', 'office', 'commercial', 'warehouse', 'pg', 'other'].map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
            <select aria-label="BHK" value={filters.bhk} onChange={(e) => setFilters({ ...filters, bhk: e.target.value })}>
              <option value="">Any BHK</option>
              {['1RK', '1BHK', '2BHK', '3BHK', '4BHK', '4+BHK'].map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
            <input aria-label="Area" placeholder="Area e.g. Wakad" value={filters.area} onChange={(e) => setFilters({ ...filters, area: e.target.value })} />
            <input aria-label="Minimum price" inputMode="numeric" type="number" min="0" placeholder="Min price" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} />
            <input aria-label="Maximum price" inputMode="numeric" type="number" min="0" placeholder="Max price" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} />
          </div>
        </section>

        {listError && <div className="alert error">{listError}</div>}
        {loading ? (
          <div className="loading-panel"><div className="spinner" /></div>
        ) : items.length ? (
          <div className="public-grid">
            {items.map((property) => <PropertyCard key={property._id} property={property} publicSlug={slug} />)}
          </div>
        ) : (
          <div className="empty-state">
            <h2>No matching properties</h2>
            <p>Try changing the filters or contact the agent directly.</p>
          </div>
        )}
      </main>
    </div>
  );
}

function PublicError({ message }) {
  return (
    <div className="center-page">
      <div className="auth-card">
        <h1>Page unavailable</h1>
        <p>{message}</p>
        <Link to={ROUTES.login}>Broker login</Link>
      </div>
    </div>
  );
}
