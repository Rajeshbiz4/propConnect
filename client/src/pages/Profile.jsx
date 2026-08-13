import { useEffect, useState } from 'react';
import { Copy, ExternalLink, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { http, errorMessage } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { appAbsoluteUrl, ROUTES } from '../routes';

function makeForm(user) {
  return { ...user, serviceAreas: (user?.serviceAreas || []).join(', ') };
}

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState(() => makeForm(user));
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => setForm(makeForm(user)), [user]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    try {
      const payload = {
        ...form,
        serviceAreas: String(form.serviceAreas || '').split(',').map((x) => x.trim()).filter(Boolean),
      };
      const { data } = await http.put('/profile', payload);
      updateUser(data.user);
      setForm(makeForm(data.user));
      setMsg('Profile updated');
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const url = form.publicSlug ? appAbsoluteUrl(ROUTES.publicAgent(form.publicSlug)) : '';

  const copyUrl = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt('Copy public URL', url);
    }
  };

  return (
    <>
      <div className="page-head"><div><h1>Agent profile</h1><p className="muted">This information is visible on your public broker page.</p></div></div>
      {msg && <div className="alert success">{msg}</div>}
      {error && <div className="alert error">{error}</div>}
      <form onSubmit={submit}>
        <section className="panel">
          <div className="form-grid two">
            <label>Name<input name="name" value={form.name || ''} onChange={change} /></label>
            <label>Agency name<input name="agencyName" value={form.agencyName || ''} onChange={change} /></label>
            <label>Mobile<input name="mobile" inputMode="tel" value={form.mobile || ''} onChange={change} /></label>
            <label>WhatsApp<input name="whatsapp" inputMode="tel" value={form.whatsapp || ''} onChange={change} /></label>
            <label>City<input name="city" value={form.city || ''} onChange={change} /></label>
            <label>RERA number<input name="reraNumber" value={form.reraNumber || ''} onChange={change} /></label>
            <label className="span-2">Office address<input name="officeAddress" value={form.officeAddress || ''} onChange={change} /></label>
            <label className="span-2">Service areas<input name="serviceAreas" value={form.serviceAreas || ''} onChange={change} /><small>Comma separated: Wakad, Baner, Hinjewadi</small></label>
            <label className="span-2">About agency<textarea name="aboutAgency" rows="4" value={form.aboutAgency || ''} onChange={change} /></label>
          </div>
        </section>

        <section className="panel">
          <h2>Public URL</h2>
          <div className="form-grid two public-url-grid">
            <label>URL name<input name="publicSlug" value={form.publicSlug || ''} onChange={change} /></label>
            <div className="public-url compact">
              <code>{url || 'Save a public URL name first'}</code>
              <button type="button" className="icon-btn" onClick={copyUrl} disabled={!url} title={copied ? 'Copied' : 'Copy URL'}><Copy size={17} /></button>
              {form.publicSlug && <Link to={ROUTES.publicAgent(form.publicSlug)} target="_blank" title="Open public page"><ExternalLink size={17} /></Link>}
            </div>
          </div>
        </section>

        <div className="sticky-actions"><button className="btn primary"><Save size={18} /> Save profile</button></div>
      </form>
    </>
  );
}
