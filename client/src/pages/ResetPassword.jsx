import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { http, errorMessage } from '../api/client';
import { ROUTES } from '../routes';

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!token) return <Navigate to={ROUTES.forgotPassword} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { data } = await http.post(`/auth/reset-password/${token}`, { password });
      setMsg(data.message);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Choose new password</h1>
        {msg && <div className="alert success">{msg}. <Link to={ROUTES.login}>Login now</Link></div>}
        {error && <div className="alert error">{error}</div>}
        <form onSubmit={submit} className="form-stack">
          <label>New password<input type="password" autoComplete="new-password" minLength="8" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
          <button className="btn primary" disabled={busy}>{busy ? 'Resetting...' : 'Reset password'}</button>
        </form>
      </div>
    </div>
  );
}
