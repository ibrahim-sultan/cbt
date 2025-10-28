import { useEffect, useState } from 'react';
import { api } from '../../api.js';

export default function AdminGroups() {
  const [groups, setGroups] = useState([]);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [emails, setEmails] = useState('');
  const [selected, setSelected] = useState('');
  const [members, setMembers] = useState([]);

  const load = async () => {
    const data = await api('/groups');
    setGroups(data);
  };
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    await api('/groups', { method: 'POST', body: { code, name } });
    setCode(''); setName('');
    load();
  };

  const addMembers = async () => {
    const list = emails.split(/[,;\s]+/).map((s) => s.trim()).filter(Boolean);
    if (!selected || list.length === 0) return;
    await api(`/groups/${selected}/members`, { method: 'POST', body: { emails: list } });
    setEmails('');
    if (selected) {
      const m = await api(`/groups/${selected}/members`);
      setMembers(m);
    }
  };

  const onSelect = async (code) => {
    setSelected(code);
    if (code) {
      const m = await api(`/groups/${code}/members`);
      setMembers(m);
    } else {
      setMembers([]);
    }
  };

  return (
    <section style={{ marginTop: 16 }}>
      <h2>Groups</h2>
      <form onSubmit={create} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input placeholder="Code" value={code} onChange={(e) => setCode(e.target.value)} />
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <button type="submit">Create</button>
      </form>

      <div style={{ marginTop: 12 }}>
        <label>Selected group: </label>
        <select value={selected} onChange={(e) => onSelect(e.target.value)}>
          <option value="">-- pick --</option>
          {groups.map((g) => (
            <option key={g._id} value={g.code}>{g.code} — {g.name}</option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: 12 }}>
        <textarea rows={3} style={{ width: 400 }} placeholder="Add members by email (comma/space separated)"
          value={emails} onChange={(e) => setEmails(e.target.value)} />
        <div><button onClick={addMembers} disabled={!selected}>Add Members</button></div>
      </div>

      <div style={{ marginTop: 12 }}>
        <h3>Members</h3>
        <ul>
          {members.map((u) => (
            <li key={u._id}>{u.email || u.name}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
