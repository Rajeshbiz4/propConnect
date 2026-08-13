import { useState } from 'react';
import { Building2 } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { http, errorMessage } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES } from '../routes';

export default function Register() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', agencyName: '', email: '', mobile: '', whatsapp: '', password: '', city: '', officeAddress: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) {
    return <Navigate to={user.role === 'admin' ? ROUTES.admin : ROUTES.app} replace />;
  }

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { data } = await http.post('/auth/register', form);
      login(data);
      navigate(ROUTES.app, { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card wide">
        <div className="auth-logo"><Building2 /><span>PropConnect</span></div>
        <h1>Create broker account</h1>
        <p className="muted">Your public property page is created automatically.</p>
        {error && <div className="alert error">{error}</div>}
        <form onSubmit={submit} className="form-grid two">
          <label>Full name<input name="name" required value={form.name} onChange={change} /></label>
          <label>Agency name<input name="agencyName" required value={form.agencyName} onChange={change} /></label>
          <label>Email<input type="email" name="email" autoComplete="email" required value={form.email} onChange={change} /></label>
          <label>Mobile<input name="mobile" inputMode="tel" required value={form.mobile} onChange={change} /></label>
          <label>WhatsApp<input name="whatsapp" inputMode="tel" value={form.whatsapp} onChange={change} placeholder="Defaults to mobile" /></label>
          <label>City<input name="city" value={form.city} onChange={change} /></label>
          <label className="span-2">Office address<input name="officeAddress" value={form.officeAddress} onChange={change} /></label>
          <label className="span-2">Password
            <input type="password" name="password" autoComplete="new-password" minLength="8" required value={form.password} onChange={change} />
            <small>Minimum 8 characters</small>
          </label>
          <button className="btn primary span-2" disabled={busy}>{busy ? 'Creating...' : 'Create account'}</button>
        </form>
        <p className="center muted">Already registered? <Link to={ROUTES.login}>Login</Link></p>
      </div>
    </div>
  );
}
