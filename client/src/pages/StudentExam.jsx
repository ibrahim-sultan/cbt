import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';

export default function StudentExam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const timerRef = useRef();
  const attemptIdRef = useRef();

  useEffect(() => {
    (async () => {
      await api(`/exams/${id}/start`, { method: 'POST' });
      const data = await api(`/exams/${id}/attempt`);
      attemptIdRef.current = data.attemptId;
      setQuestions(data.questions);
      setAnswers(data.questions.map((q) => ({ question: q._id, selectedOptionIndexes: [] })));
    })();
  }, [id]);

  // Basic 30m timer placeholder (should come from exam.durationMinutes via another API in future)
  useEffect(() => {
    setTimeLeft(30 * 60);
    timerRef.current = setInterval(() => setTimeLeft((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (timeLeft === 0) submit();
  }, [timeLeft]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        api('/monitor/log', { method: 'POST', body: { examId: id, attemptId: attemptIdRef.current, type: 'tab_switch' } }).catch(() => {});
      }
    };
    const onCopy = (e) => {
      e.preventDefault();
      api('/monitor/log', { method: 'POST', body: { examId: id, attemptId: attemptIdRef.current, type: 'copy' } }).catch(() => {});
    };
    const onPaste = (e) => {
      e.preventDefault();
      api('/monitor/log', { method: 'POST', body: { examId: id, attemptId: attemptIdRef.current, type: 'paste' } }).catch(() => {});
    };
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v')) {
        e.preventDefault();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    document.addEventListener('copy', onCopy);
    document.addEventListener('paste', onPaste);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('copy', onCopy);
      document.removeEventListener('paste', onPaste);
      document.removeEventListener('keydown', onKey);
    };
  }, [id]);

  const toggleOption = (qi, oi) => {
    setAnswers((prev) => {
      const next = prev.slice();
      const sel = new Set(next[qi].selectedOptionIndexes);
      if (sel.has(oi)) sel.delete(oi);
      else sel.add(oi);
      next[qi] = { ...next[qi], selectedOptionIndexes: Array.from(sel).sort() };
      return next;
    });
  };

  const save = async () => {
    await api(`/exams/${id}/save`, { method: 'PATCH', body: { answers } });
  };

  const submit = async () => {
    try {
      const res = await api(`/exams/${id}/submit`, { method: 'POST', body: { answers } });
      alert(`Submitted. Score: ${res.score}`);
      navigate('/');
    } catch {
      alert('Submit failed');
    }
  };

  const mm = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <main style={{ padding: 24 }} onCopy={(e) => e.preventDefault()} onPaste={(e) => e.preventDefault()}>
      <h2>Exam</h2>
      <div>Time left: {timeLeft != null ? mm(timeLeft) : '...'} <button onClick={save}>Save</button> <button onClick={submit}>Submit</button></div>
      {questions.map((q, qi) => (
        <div key={q._id} style={{ padding: 12, margin: '12px 0', border: '1px solid #333' }}>
          <div><b>Q{qi + 1}.</b> {q.text}</div>
          <ul>
            {q.options.map((o, oi) => (
              <li key={oi}>
                <label>
                  <input
                    type="checkbox"
                    checked={(answers[qi]?.selectedOptionIndexes || []).includes(oi)}
                    onChange={() => toggleOption(qi, oi)}
                  />{' '}
                  {o.text}
                </label>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </main>
  );
}
