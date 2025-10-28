import { useEffect, useState } from 'react';
import { api } from '../../api.js';

export default function AdminExams() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [durationMinutes, setDuration] = useState(60);
  const [questionCount, setCount] = useState(20);

  const load = async () => {
    const data = await api('/exams');
    setItems(data);
  };
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    await api('/exams', { method: 'POST', body: { title, durationMinutes, questionCount } });
    setTitle('');
    load();
  };

  const remove = async (id) => {
    await api(`/exams/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <section style={{ marginTop: 16 }}>
      <h2>Exams</h2>
      <form onSubmit={create} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input type="number" min="1" value={durationMinutes} onChange={(e) => setDuration(parseInt(e.target.value, 10) || 0)} />
        <input type="number" min="1" value={questionCount} onChange={(e) => setCount(parseInt(e.target.value, 10) || 0)} />
        <button type="submit">Create</button>
      </form>
      <ul>
        {items.map((ex) => (
          <li key={ex._id} style={{ margin: '8px 0' }}>
            <b>{ex.title}</b> — {ex.durationMinutes}m — {ex.questionCount} questions
            <button style={{ marginLeft: 8 }} onClick={() => remove(ex._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
