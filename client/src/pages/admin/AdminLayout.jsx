import { Link, Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Admin</h1>
      <nav style={{ display: 'flex', gap: 12 }}>
        <Link to="/admin/questions">Questions</Link>
        <Link to="/admin/exams">Exams</Link>
        <Link to="/admin/monitor">Monitoring</Link>
        <Link to="/admin/results">Results</Link>
        <Link to="/admin/announcements">Announcements</Link>
      </nav>
      <Outlet />
    </main>
  );
}
