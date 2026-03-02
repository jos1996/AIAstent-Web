import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import RefundPolicyPage from './pages/RefundPolicyPage';
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
import AIInterviewHelperPage from './pages/AIInterviewHelperPage';
import ComparisonPage from './pages/ComparisonPage';
import { competitors } from './data/competitors';
import HowToCrackInterviewPage from './pages/blog/HowToCrackInterviewPage';
import AIInterviewTipsPage from './pages/blog/AIInterviewTipsPage';
import STARMethodGuidePage from './pages/blog/STARMethodGuidePage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/refund" element={<RefundPolicyPage />} />
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
          {/* SEO Pages */}
          <Route path="/ai-interview-helper" element={<AIInterviewHelperPage />} />
          {/* Competitor Comparison Pages */}
          <Route path="/vs/final-round-ai" element={<ComparisonPage competitor={competitors['final-round-ai']} />} />
          <Route path="/vs/lockedin-ai" element={<ComparisonPage competitor={competitors['lockedin-ai']} />} />
          <Route path="/vs/hirin-ai" element={<ComparisonPage competitor={competitors['hirin-ai']} />} />
          <Route path="/vs/parakeet-ai" element={<ComparisonPage competitor={competitors['parakeet-ai']} />} />
          <Route path="/vs/uncharted-career" element={<ComparisonPage competitor={competitors['uncharted-career']} />} />
          {/* Blog Pages */}
          <Route path="/blog/how-to-crack-interview" element={<HowToCrackInterviewPage />} />
          <Route path="/blog/ai-interview-tips" element={<AIInterviewTipsPage />} />
          <Route path="/blog/star-method-guide" element={<STARMethodGuidePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
