import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api('/auth/login', { method: 'POST', body: { email, password } });
      localStorage.setItem('token', res.token);
      navigate('/');
    } catch (e) {
      setError('Login failed');
    }
  };

  return (
    <div style={{ maxWidth: 360, margin: '10vh auto' }}>
      <h2>Login</h2>
      <form onSubmit={onSubmit}>
        <div>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%' }} />
        </div>
        <div>
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%' }} />
        </div>
        {error && <p style={{ color: 'tomato' }}>{error}</p>}
        <button type="submit">Sign in</button>
      </form>
    </div>
  );
}
