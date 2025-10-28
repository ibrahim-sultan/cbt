import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import StudentExam from './pages/StudentExam.jsx';
import StudentResults from './pages/StudentResults.jsx';
import StudentReview from './pages/StudentReview.jsx';
import AuthForgot from './pages/AuthForgot.jsx';
import AuthReset from './pages/AuthReset.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminQuestions from './pages/admin/AdminQuestions.jsx';
import AdminExams from './pages/admin/AdminExams.jsx';
import AdminMonitoring from './pages/admin/AdminMonitoring.jsx';
import AdminResults from './pages/admin/AdminResults.jsx';
import AdminAnnouncements from './pages/admin/AdminAnnouncements.jsx';
import AdminGrade from './pages/admin/AdminGrade.jsx';

function RequireAuth({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

function RequireAdmin({ children }) {
  const role = localStorage.getItem('role');
  return role === 'admin' || role === 'instructor' ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot" element={<AuthForgot />} />
        <Route path="/reset" element={<AuthReset />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <StudentDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/results"
          element={
            <RequireAuth>
              <StudentResults />
            </RequireAuth>
          }
        />
        <Route
          path="/review"
          element={
            <RequireAuth>
              <StudentReview />
            </RequireAuth>
          }
        />
        <Route
          path="/exam/:id"
          element={
            <RequireAuth>
              <StudentExam />
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
            </RequireAuth>
          }
        >
          <Route index element={<AdminQuestions />} />
          <Route path="questions" element={<AdminQuestions />} />
          <Route path="exams" element={<AdminExams />} />
          <Route path="monitor" element={<AdminMonitoring />} />
          <Route path="results" element={<AdminResults />} />
          <Route path="announcements" element={<AdminAnnouncements />} />
          <Route path="grade" element={<AdminGrade />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
