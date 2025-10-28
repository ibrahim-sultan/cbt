import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useSearchParams } from 'react-router-dom';

export default function StudentReview() {
  const [params] = useSearchParams();
  const [data, setData] = useState(null);
  const attemptId = params.get('attemptId') || '';

  useEffect(() => {
    if (attemptId) {
      api(`/exams/attempts/${attemptId}/review`).then(setData).catch(() => setData(null));
    }
  }, [attemptId]);

  return (
    <main style={{ padding: 24 }}>
      <h2>Attempt Review</h2>
      {!data && <p>Load a review from My Results.</p>}
      {data && (
        <ol>
          {data.details.map((d, idx) => (
            <li key={d.questionId} style={{ margin: '12px 0' }}>
              <div><b>Q{idx + 1}.</b> {d.text}</div>
              {d.type !== 'short' && (
                <ul>
                  {d.options.map((o, i) => (
                    <li key={i}>
                      {o.isCorrect ? '✓' : ''} {o.text}
                    </li>
                  ))}
                </ul>
              )}
              <div>Result: {d.isCorrect === true ? 'Correct' : d.isCorrect === false ? 'Wrong' : 'Pending'}</div>
              {d.explanation && <div style={{ fontStyle: 'italic' }}>Explanation: {d.explanation}</div>}
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
