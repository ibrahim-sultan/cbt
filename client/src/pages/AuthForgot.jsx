import { useState } from 'react';
import { api } from '../api.js';

export default function AuthForgot() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [sent, setSent] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    const res = await api('/auth/reset-request', { method: 'POST', body: { email } });
    setSent(true);
    setToken(res.token || '');
  };

  return (
    <main style={{ padding: 24 }}>
      <h2>Forgot Password</h2>
      <form onSubmit={onSubmit}>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button type="submit">Send Reset</button>
      </form>
      {sent && (
        <p>Token (dev): {token}</p>
      )}
    </main>
  );
}
