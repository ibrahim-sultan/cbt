import { useEffect, useState } from 'react';
import { api } from '../../api.js';

export default function AdminGrade() {
  const [attemptId, setAttemptId] = useState('');
  const [review, setReview] = useState(null);
  const [grades, setGrades] = useState({}); // qid -> {isCorrect, comment}

  const load = async (id) => {
    const data = await api(`/exams/attempts/${id}/review`);
    setReview(data);
    const init = {};
    for (const d of data.details) {
      if (d.type === 'short') init[d.questionId] = { isCorrect: d.isCorrect ?? null, comment: '' };
    }
    setGrades(init);
  };

  const save = async () => {
    const payload = Object.entries(grades)
      .filter(([, v]) => v.isCorrect !== null && typeof v.isCorrect !== 'undefined')
      .map(([question, v]) => ({ question, isCorrect: v.isCorrect, comment: v.comment }));
    await api(`/exams/attempts/${attemptId}/grade`, { method: 'PATCH', body: { grades: payload } });
    await load(attemptId);
    alert('Graded');
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('attemptId');
    if (id) { setAttemptId(id); load(id); }
  }, []);

  return (
    <section style={{ padding: 24 }}>
      <h2>Grade Attempt</h2>
      <div>
        <input placeholder="Attempt ID" value={attemptId} onChange={(e) => setAttemptId(e.target.value)} />
        <button onClick={() => load(attemptId)} style={{ marginLeft: 8 }}>Load</button>
        {review && <button onClick={save} style={{ marginLeft: 8 }}>Save</button>}
      </div>
      {review && (
        <ol>
          {review.details.map((d, idx) => (
            <li key={d.questionId} style={{ margin: '12px 0', padding: 8, border: '1px solid #333' }}>
              <div><b>Q{idx + 1}.</b> {d.text}</div>
              {d.type !== 'short' ? (
                <div>Auto-graded: {d.isCorrect ? 'Correct' : d.isCorrect === false ? 'Wrong' : 'N/A'}</div>
              ) : (
                <div>
                  <div>
                    <label>
                      <input type="radio" name={`g-${d.questionId}`} checked={grades[d.questionId]?.isCorrect === true}
                        onChange={() => setGrades((g) => ({ ...g, [d.questionId]: { ...(g[d.questionId] || {}), isCorrect: true } }))} /> Correct
                    </label>
                    <label style={{ marginLeft: 12 }}>
                      <input type="radio" name={`g-${d.questionId}`} checked={grades[d.questionId]?.isCorrect === false}
                        onChange={() => setGrades((g) => ({ ...g, [d.questionId]: { ...(g[d.questionId] || {}), isCorrect: false } }))} /> Wrong
                    </label>
                  </div>
                  <div>
                    <input placeholder="Comment" value={grades[d.questionId]?.comment || ''}
                      onChange={(e) => setGrades((g) => ({ ...g, [d.questionId]: { ...(g[d.questionId] || {}), comment: e.target.value } }))} />
                  </div>
                </div>
              )}
              {d.explanation && (
                <div style={{ marginTop: 6, fontStyle: 'italic' }}>Explanation: {d.explanation}</div>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
