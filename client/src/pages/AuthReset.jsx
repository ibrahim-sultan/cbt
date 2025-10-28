import { useState } from 'react';
import { api } from '../api.js';

export default function AuthReset() {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [ok, setOk] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    await api('/auth/reset-confirm', { method: 'POST', body: { token, password } });
    setOk(true);
  };

  return (
    <main style={{ padding: 24 }}>
      <h2>Reset Password</h2>
      <form onSubmit={onSubmit}>
        <input placeholder="Token" value={token} onChange={(e) => setToken(e.target.value)} />
        <input type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Reset</button>
      </form>
      {ok && <p>Done. You can log in now.</p>}
    </main>
  );
}
