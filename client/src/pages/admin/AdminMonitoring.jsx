import { useEffect, useState } from 'react';
import { api } from '../../api.js';

export default function AdminMonitoring() {
  const [active, setActive] = useState([]);
  const [stats, setStats] = useState({});

  const load = async () => {
    const [a] = await Promise.all([
      api('/monitor/active')
    ]);
    setActive(a);
  };

  const loadStats = async (examId) => {
    const s = await api(`/monitor/stats?examId=${examId}`);
    setStats(s);
  };

  useEffect(() => { load(); }, []);

  return (
    <section style={{ marginTop: 16 }}>
      <h2>Monitoring</h2>
      <div style={{ marginBottom: 8 }}>
        <label>Exam ID: </label>
        <input placeholder="optional examId for stats" onBlur={(e) => loadStats(e.target.value)} />
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr><th align="left">Student</th><th align="left">Attempt ID</th><th align="left">Cheat Events</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {active.map((a) => {
            const s = stats[a._id] || {};
            const cheatCount = (s.tab_switch || 0) + (s.copy || 0) + (s.paste || 0) + (s.suspicious || 0);
            return (
              <tr key={a._id}>
                <td>{a.student?.name || a.student?.email || a.student}</td>
                <td>{a._id}</td>
                <td>{cheatCount}</td>
                <td><button onClick={async () => { await api(`/monitor/${a._id}/force-submit`, { method: 'POST' }); load(); }}>Force Submit</button></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
