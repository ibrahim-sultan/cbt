import { useEffect, useState } from 'react';
import { api } from '../../api.js';

export default function AdminAnnouncements() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const load = async () => {
    const data = await api('/announcements');
    setItems(data);
  };
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    await api('/announcements', { method: 'POST', body: { title, body } });
    setTitle(''); setBody('');
    load();
  };

  const remove = async (id) => {
    await api(`/announcements/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <section style={{ marginTop: 16 }}>
      <h2>Announcements</h2>
      <form onSubmit={create} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input placeholder="Message" value={body} onChange={(e) => setBody(e.target.value)} style={{ width: 400 }} />
        <button type="submit">Post</button>
      </form>
      <ul>
        {items.map((a) => (
          <li key={a._id}>
            <b>{a.title}</b>: {a.body}
            <button style={{ marginLeft: 8 }} onClick={() => remove(a._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
