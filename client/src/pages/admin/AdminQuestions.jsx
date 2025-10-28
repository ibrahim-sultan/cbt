import { useEffect, useState } from 'react';
import { api } from '../../api.js';

export default function AdminQuestions() {
  const [items, setItems] = useState([]);
  const [text, setText] = useState('');
  const [type, setType] = useState('mcq');
  const [options, setOptions] = useState('A,B,C,D');

  const load = async () => {
    const data = await api('/questions');
    setItems(data);
  };
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    const opts = options.split(',').map((t) => ({ text: t.trim() }));
    if (type !== 'short' && opts.length > 0) opts[0].isCorrect = true;
    await api('/questions', { method: 'POST', body: { text, type, options: opts } });
    setText('');
    load();
  };

  const remove = async (id) => {
    await api(`/questions/${id}`, { method: 'DELETE' });
    load();
  };

  const bulk = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    const token = localStorage.getItem('token');
    await fetch('/api/questions/bulk', { method: 'POST', body: form, headers: { Authorization: `Bearer ${token}` } });
    load();
  };

  return (
    <section style={{ marginTop: 16 }}>
      <h2>Questions</h2>
      <form onSubmit={create} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input placeholder="Question text" value={text} onChange={(e) => setText(e.target.value)} style={{ flex: 1 }} />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="mcq">MCQ</option>
          <option value="tf">True/False</option>
          <option value="short">Short</option>
        </select>
        <input placeholder="Options (comma)" value={options} onChange={(e) => setOptions(e.target.value)} style={{ width: 240 }} />
        <button type="submit">Add</button>
        <label style={{ marginLeft: 12 }}>
          Bulk upload: <input type="file" accept=".xlsx,.csv" onChange={bulk} />
        </label>
      </form>
      <ul>
        {items.map((q) => (
          <li key={q._id} style={{ margin: '8px 0' }}>
            <b>{q.type.toUpperCase()}</b> {q.text}
            <button style={{ marginLeft: 8 }} onClick={() => remove(q._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
