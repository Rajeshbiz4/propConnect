import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { http, errorMessage } from '../api/client';
import { ROUTES } from '../routes';

function money(value) {
  return value
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)
    : 'Price on request';
}

function digits(value = '') {
  return value.replace(/\D/g, '');
}

export default function PublicPropertyDetail() {
  const { slug, id } = useParams();
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [formError, setFormError] = useState('');
  const [sent, setSent] = useState('');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    tenantName: '',
    mobile: '',
    email: '',
    message: 'I am interested in this property. Please contact me.',
  });

  useEffect(() => {
    let active = true;
    setLoadError('');
    setData(null);
    http.get(`/public/agents/${slug}/properties/${id}`)
      .then((response) => active && setData(response.data))
      .catch((error) => active && setLoadError(errorMessage(error)));
    return () => { active = false; };
  }, [slug, id]);

  const mapsUrl = useMemo(() => {
    if (!data) return '';
    const address = data.property.address || {};
    if (address.latitude != null && address.longitude != null) {
      return `https://www.google.com/maps?q=${address.latitude},${address.longitude}`;
    }
    const query = [address.fullAddress, address.landmark, address.area, address.city, address.state]
      .filter(Boolean)
      .join(', ');
    return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : '';
  }, [data]);

  if (loadError) {
    return (
      <div className="center-page">
        <div className="auth-card">
          <h1>Property unavailable</h1>
          <p>{loadError}</p>
          <Link to={ROUTES.publicAgent(slug)}>Back to listings</Link>
        </div>
      </div>
    );
  }

  if (!data) return <div className="center-page"><div className="spinner" /></div>;

  const { property: p, agent } = data;
  const price = p.purpose === 'sale' ? p.sellingPrice : p.monthlyRent;
  const whatsappNumber = digits(agent.whatsapp || agent.mobile);
  const whatsapp = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hello, I am interested in ${p.title} (${p.propertyCode}). Please share more details.`)}`
    : '';

  const facts = [
    ['BHK', p.bhk],
    ['Carpet area', p.carpetArea ? `${p.carpetArea} ${p.areaUnit}` : ''],
    ['Furnishing', p.furnishing],
    ['Floor', p.floor !== undefined && p.floor !== null ? `${p.floor} / ${p.totalFloors || '—'}` : ''],
    ['Deposit', p.deposit ? money(p.deposit) : ''],
    ['Maintenance', p.maintenance ? money(p.maintenance) : ''],
    ['Available from', p.availableFrom ? new Date(p.availableFrom).toLocaleDateString() : ''],
    ['Preferred tenant', p.preferredTenant],
  ].filter(([, value]) => value);

  const submit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSent('');
    setBusy(true);
    try {
      const response = await http.post('/enquiries/public', { propertyId: p._id, ...form });
      setSent(response.data.message || 'Enquiry sent successfully.');
      setForm((current) => ({ ...current, tenantName: '', mobile: '', email: '' }));
    } catch (error) {
      setFormError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="detail-page">
      <div className="detail-top">
        <Link to={ROUTES.publicAgent(slug)}><ArrowLeft size={17} /> Back to {agent.agencyName}</Link>
      </div>

      <div className="gallery">
        {p.images?.length
          ? p.images.map((img) => <img key={img._id} src={img.url} alt={p.title} loading="lazy" />)
          : <div className="gallery-empty">No photos uploaded</div>}
      </div>

      <div className="detail-layout">
        <main className="detail-main">
          <span className="eyebrow dark">{p.purpose} · {p.propertyType} · {p.propertyCode}</span>
          <h1>{p.title}</h1>
          <p className="detail-price">{money(price)}{p.purpose === 'rent' && price ? <small>/month</small> : null}</p>
          <p className="location-line"><MapPin size={18} />{[p.address?.societyName, p.address?.area, p.address?.city].filter(Boolean).join(', ') || 'Location not added'}</p>

          {facts.length > 0 && (
            <div className="facts">
              {facts.map(([key, value]) => (
                <div key={key}><span>{key}</span><strong>{value}</strong></div>
              ))}
            </div>
          )}

          {p.description && <section className="detail-section"><h2>Description</h2><p>{p.description}</p></section>}

          {p.amenities?.length > 0 && (
            <section className="detail-section">
              <h2>Amenities</h2>
              <div className="amenity-list">{p.amenities.map((amenity) => <span key={amenity}><Check size={16} />{amenity}</span>)}</div>
            </section>
          )}

          <section className="detail-section">
            <h2>Location</h2>
            <p>{[p.address?.fullAddress, p.address?.landmark, p.address?.area, p.address?.city, p.address?.state, p.address?.pinCode].filter(Boolean).join(', ') || 'Location details not added.'}</p>
            {mapsUrl && <a target="_blank" rel="noreferrer" href={mapsUrl}>View on Google Maps ↗</a>}
          </section>
        </main>

        <aside>
          <div className="contact-card">
            <h2>Contact {agent.name}</h2>
            <p className="muted">{agent.agencyName}</p>
            {agent.mobile && <a className="btn primary full" href={`tel:${agent.mobile}`}><Phone size={17} /> {agent.mobile}</a>}
            {whatsapp && <a className="btn whatsapp full" target="_blank" rel="noreferrer" href={whatsapp}><MessageCircle size={17} /> WhatsApp agent</a>}
            <hr />
            <h3>Send enquiry</h3>
            {sent && <div className="alert success">{sent}</div>}
            {formError && <div className="alert error">{formError}</div>}
            <form onSubmit={submit} className="form-stack">
              <label>Name<input required value={form.tenantName} onChange={(e) => setForm({ ...form, tenantName: e.target.value })} /></label>
              <label>Mobile<input required inputMode="tel" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} /></label>
              <label>Email (optional)<input type="email" inputMode="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
              <label>Message<textarea rows="3" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></label>
              <button className="btn primary full" disabled={busy}><Send size={17} /> {busy ? 'Sending...' : 'Send enquiry'}</button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}
