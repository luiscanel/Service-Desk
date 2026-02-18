import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Layout } from './components/layout';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { TicketsPage } from './pages/tickets/TicketsPage';
import { UsersPage } from './pages/users/UsersPage';
import { AgentsPage } from './pages/agents/AgentsPage';
import { KnowledgePage } from './pages/knowledge/KnowledgePage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { MacrosPage } from './pages/macros/MacrosPage';
import { SlaPoliciesPage } from './pages/sla/SlaPoliciesPage';
import { AuditLogsPage } from './pages/audit/AuditLogsPage';
import { ScheduledReportsPage } from './pages/reports/ScheduledReportsPage';
import { DashboardWidgetsPage } from './pages/dashboard/DashboardWidgetsPage';
import { KnowledgeCategoriesPage } from './pages/knowledge-categories/KnowledgeCategoriesPage';
import { TagsPage } from './pages/tags/TagsPage';
import { TimeTrackingPage } from './pages/time-tracking/TimeTrackingPage';
import { WebSocketProvider } from './services/websocket';

function PrivateRoute() {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

function App() {
  return (
    <WebSocketProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<PrivateRoute />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="tickets" element={<TicketsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="agents" element={<AgentsPage />} />
            <Route path="knowledge" element={<KnowledgePage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="macros" element={<MacrosPage />} />
            <Route path="sla" element={<SlaPoliciesPage />} />
            <Route path="audit" element={<AuditLogsPage />} />
            <Route path="scheduled-reports" element={<ScheduledReportsPage />} />
            <Route path="dashboard-widgets" element={<DashboardWidgetsPage />} />
            <Route path="knowledge-categories" element={<KnowledgeCategoriesPage />} />
            <Route path="tags" element={<TagsPage />} />
            <Route path="time-tracking" element={<TimeTrackingPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </WebSocketProvider>
  );
}

export default App;
