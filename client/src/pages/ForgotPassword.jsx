import { useState } from 'react';
import { Link } from 'react-router-dom';
import { http, errorMessage } from '../api/client';
import { ROUTES } from '../routes';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setBusy(true);
    try {
      const { data } = await http.post('/auth/forgot-password', { email });
      setResult(data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Reset password</h1>
        <p className="muted">Enter your registered email.</p>
        {error && <div className="alert error">{error}</div>}
        {result && (
          <div className="alert success">
            {result.message}
            {result.devResetToken && <><br /><Link to={ROUTES.resetPassword(result.devResetToken)}>Open development reset link</Link></>}
          </div>
        )}
        <form onSubmit={submit} className="form-stack">
          <label>Email<input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <button className="btn primary" disabled={busy}>{busy ? 'Please wait...' : 'Generate reset'}</button>
        </form>
        <p><Link to={ROUTES.login}>← Back to login</Link></p>
      </div>
    </div>
  );
}
