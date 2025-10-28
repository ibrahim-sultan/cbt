import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function StudentDashboard() {
  const [exams, setExams] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setStatus('loading');
      try {
        const data = await api('/exams/assigned');
        setExams(data);
        setStatus('done');
      } catch (e) {
        setError('Failed to load exams');
        setStatus('error');
      }
    })();
  }, []);

  const startExam = async (id) => {
    try {
      await api(`/exams/${id}/start`, { method: 'POST' });
      window.location.href = `/exam/${id}`;
    } catch (e) {
      alert('Failed to start exam');
    }
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>My Exams</h1>
      {status === 'loading' && <p>Loading...</p>}
      {error && <p style={{ color: 'tomato' }}>{error}</p>}
      <ul>
        {exams.map((ex) => (
          <li key={ex._id} style={{ marginBottom: 8 }}>
            <b>{ex.title}</b> — duration {ex.durationMinutes}m
            <div>
              <button onClick={() => startExam(ex._id)}>Start</button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
