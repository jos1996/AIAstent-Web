import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import SettingsLayout from './pages/SettingsLayout';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import HistoryPage from './pages/HistoryPage';
import RemindersPage from './pages/RemindersPage';
import LanguagePage from './pages/LanguagePage';
import BillingPage from './pages/BillingPage';
import HelpCenterPage from './pages/HelpCenterPage';
import LatestUpdatesPage from './pages/LatestUpdatesPage';
import TutorialsPage from './pages/TutorialsPage';
import AuthCallbackPage from './pages/AuthCallbackPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/settings/dashboard" replace />} />
          <Route path="/settings" element={<SettingsLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="updates" element={<LatestUpdatesPage />} />
            <Route path="tutorials" element={<TutorialsPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="reminders" element={<RemindersPage />} />
            <Route path="language" element={<LanguagePage />} />
            <Route path="billing" element={<BillingPage />} />
            <Route path="help" element={<HelpCenterPage />} />
          </Route>
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="*" element={<Navigate to="/settings/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
