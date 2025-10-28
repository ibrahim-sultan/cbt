import { useEffect, useState } from 'react';
import { api } from '../../api.js';

export default function AdminResults() {
  const [examId, setExamId] = useState('');
  const [attempts, setAttempts] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const load = async (id) => {
    if (!id) return;
    const [a, an] = await Promise.all([
      api(`/exams/${id}/results`),
      api(`/exams/${id}/analytics`)
    ]);
    setAttempts(a);
    setAnalytics(an);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('examId');
    if (id) { setExamId(id); load(id); }
  }, []);

  const exportCsv = () => {
    const rows = [['student','attemptId','score','status']].concat(
      attempts.map((t) => [t.student?.email || t.student?.name || t.student, t._id, t.score ?? '', t.status])
    );
    const csv = rows.map((r) => r.map((x) => `"${String(x).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `results-${examId}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section style={{ marginTop: 16 }}>
      <h2>Results</h2>
      <div style={{ marginBottom: 8 }}>
        <input placeholder="Exam ID" value={examId} onChange={(e) => setExamId(e.target.value)} />
        <button onClick={() => load(examId)} style={{ marginLeft: 8 }}>Load</button>
        <button onClick={exportCsv} style={{ marginLeft: 8 }} disabled={!attempts.length}>Export CSV</button>
      </div>
      {analytics && (
        <p>Attempts: {analytics.attempts} | Average score: {analytics.average?.toFixed(2)}</p>
      )}
      <ul>
        {attempts.map((t) => (
          <li key={t._id}>
            {t.student?.email || t.student?.name || t.student} — score: {t.score ?? ''} — {t.status}
          </li>
        ))}
      </ul>
    </section>
  );
}
