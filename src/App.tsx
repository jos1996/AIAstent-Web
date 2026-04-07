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
import ReferralPage from './pages/ReferralPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import AIInterviewHelperPage from './pages/AIInterviewHelperPage';
import JobSearchPage from './pages/JobSearchPage';
import ComparisonPage from './pages/ComparisonPage';
import { competitors } from './data/competitors';
import HowToCrackInterviewPage from './pages/blog/HowToCrackInterviewPage';
import AIInterviewTipsPage from './pages/blog/AIInterviewTipsPage';
import STARMethodGuidePage from './pages/blog/STARMethodGuidePage';
import BestAIInterviewToolsPage from './pages/blog/BestAIInterviewToolsPage';
import AlternativesHubPage from './pages/alternatives/AlternativesHubPage';
import FinalRoundAIAlternativePage from './pages/alternatives/FinalRoundAIAlternativePage';
import LockedInAIAlternativePage from './pages/alternatives/LockedInAIAlternativePage';
import SenseiAIAlternativePage from './pages/alternatives/SenseiAIAlternativePage';
import ParakeetAIAlternativePage from './pages/alternatives/ParakeetAIAlternativePage';
import BeyzAIAlternativePage from './pages/alternatives/BeyzAIAlternativePage';
import InterviewsChatAlternativePage from './pages/alternatives/InterviewsChatAlternativePage';
import AiApplyAlternativePage from './pages/alternatives/AiApplyAlternativePage';
import LiveInterviewAIAlternativePage from './pages/alternatives/LiveInterviewAIAlternativePage';
import FinalRoundAICompare from './pages/compare/FinalRoundAICompare';
import LockedInAICompare from './pages/compare/LockedInAICompare';
import SenseiAICompare from './pages/compare/SenseiAICompare';
import ParakeetAICompare from './pages/compare/ParakeetAICompare';
import SoftwareEngineerPage from './pages/interview-prep/SoftwareEngineerPage';
import ProductManagerPage from './pages/interview-prep/ProductManagerPage';
import FinancePage from './pages/interview-prep/FinancePage';
import DataSciencePage from './pages/interview-prep/DataSciencePage';
import MarketingPage from './pages/interview-prep/MarketingPage';
import ConsultingPage from './pages/interview-prep/ConsultingPage';

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
            <Route path="job-search" element={<JobSearchPage />} />
            <Route path="referral" element={<ReferralPage />} />
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
          <Route path="/blog/best-ai-interview-helper-tools" element={<BestAIInterviewToolsPage />} />
          {/* Alternative Pages */}
          <Route path="/alternatives" element={<AlternativesHubPage />} />
          <Route path="/alternatives/final-round-ai-alternative" element={<FinalRoundAIAlternativePage />} />
          <Route path="/alternatives/lockedin-ai-alternative" element={<LockedInAIAlternativePage />} />
          <Route path="/alternatives/sensei-ai-alternative" element={<SenseiAIAlternativePage />} />
          <Route path="/alternatives/parakeet-ai-alternative" element={<ParakeetAIAlternativePage />} />
          <Route path="/alternatives/beyz-ai-alternative" element={<BeyzAIAlternativePage />} />
          <Route path="/alternatives/interviews-chat-alternative" element={<InterviewsChatAlternativePage />} />
          <Route path="/alternatives/aiapply-alternative" element={<AiApplyAlternativePage />} />
          <Route path="/alternatives/live-interview-ai-alternative" element={<LiveInterviewAIAlternativePage />} />
          {/* Comparison Pages */}
          <Route path="/compare/final-round-ai-vs-helplyai" element={<FinalRoundAICompare />} />
          <Route path="/compare/lockedin-ai-vs-helplyai" element={<LockedInAICompare />} />
          <Route path="/compare/sensei-ai-vs-helplyai" element={<SenseiAICompare />} />
          <Route path="/compare/parakeet-ai-vs-helplyai" element={<ParakeetAICompare />} />
          {/* Interview Prep Role Pages */}
          <Route path="/interview-prep/software-engineer" element={<SoftwareEngineerPage />} />
          <Route path="/interview-prep/product-manager" element={<ProductManagerPage />} />
          <Route path="/interview-prep/finance" element={<FinancePage />} />
          <Route path="/interview-prep/data-science" element={<DataSciencePage />} />
          <Route path="/interview-prep/marketing" element={<MarketingPage />} />
          <Route path="/interview-prep/consulting" element={<ConsultingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
