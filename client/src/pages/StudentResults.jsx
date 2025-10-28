import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function StudentResults() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    (async () => {
      const data = await api('/exams/results/mine');
      setItems(data);
    })();
  }, []);
  return (
    <main style={{ padding: 24 }}>
      <h2>My Results</h2>
      <ul>
        {items.map((t) => (
          <li key={t._id}>
            {t.exam?.title || t.exam} — {t.status} — score: {t.score ?? ''}
            {t.status !== 'in_progress' && (
              <a style={{ marginLeft: 8 }} href={`/review?attemptId=${t._id}`}>View</a>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
