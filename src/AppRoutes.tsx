import { Routes, Route, Navigate } from 'react-router-dom';
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
import MockInterviewPage from './pages/MockInterviewPage';
import ComparisonPage from './pages/ComparisonPage';
import { competitors } from './data/competitors';
import HowToCrackInterviewPage from './pages/blog/HowToCrackInterviewPage';
import RealTimeAIInterviewHelperPage from './pages/blog/RealTimeAIInterviewHelperPage';
import ZoomAIInterviewHelperPage from './pages/blog/ZoomAIInterviewHelperPage';
import OnlineInterviewHelperPage from './pages/blog/OnlineInterviewHelperPage';
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
import AIResumeBuilderPage from './pages/seo/AIResumeBuilderPage';
import MockInterviewAIPage from './pages/seo/MockInterviewAIPage';
import AIJobSearchPage from './pages/seo/AIJobSearchPage';
import FreeAIInterviewHelperPage from './pages/seo/FreeAIInterviewHelperPage';
import GoogleMeetAIInterviewHelperPage from './pages/seo/GoogleMeetAIInterviewHelperPage';
import MicrosoftTeamsAIInterviewHelperPage from './pages/seo/MicrosoftTeamsAIInterviewHelperPage';
import AIInterviewAnswerGeneratorPage from './pages/seo/AIInterviewAnswerGeneratorPage';
import OnlineInterviewHelperHubPage from './pages/seo/OnlineInterviewHelperHubPage';
import {
  GoogleInterviewAIPage,
  AmazonInterviewAIPage,
  MetaInterviewAIPage,
  MicrosoftInterviewAIPage,
  McKinseyInterviewAIPage,
  GoldmanSachsInterviewAIPage,
} from './pages/seo/companyPages';
import FAANGInterviewAIPage from './pages/seo/FAANGInterviewAIPage';
import CodingInterviewAIPage from './pages/seo/CodingInterviewAIPage';
import SystemDesignInterviewAIPage from './pages/seo/SystemDesignInterviewAIPage';
import BehavioralInterviewAIPage from './pages/seo/BehavioralInterviewAIPage';

/**
 * The single declarative route table for the app. Used by both:
 *   - `App.tsx` (browser, wraps in BrowserRouter + AuthProvider)
 *   - `entry-server.tsx` (SSR, wraps in StaticRouter only — no auth)
 */
export default function AppRoutes() {
  return (
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
        <Route path="mock-interview" element={<MockInterviewPage />} />
        <Route path="referral" element={<ReferralPage />} />
      </Route>
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      {/* SEO Pages */}
      <Route path="/ai-interview-helper" element={<AIInterviewHelperPage />} />
      <Route path="/online-interview-helper" element={<OnlineInterviewHelperHubPage />} />
      <Route path="/ai-resume-builder" element={<AIResumeBuilderPage />} />
      <Route path="/mock-interview-ai" element={<MockInterviewAIPage />} />
      <Route path="/ai-job-search" element={<AIJobSearchPage />} />
      <Route path="/free-ai-interview-helper" element={<FreeAIInterviewHelperPage />} />
      <Route path="/google-meet-ai-interview-helper" element={<GoogleMeetAIInterviewHelperPage />} />
      <Route path="/microsoft-teams-ai-interview-helper" element={<MicrosoftTeamsAIInterviewHelperPage />} />
      <Route path="/ai-interview-answer-generator" element={<AIInterviewAnswerGeneratorPage />} />
      {/* Company-specific SEO Pages (programmatic) */}
      <Route path="/google-interview-ai-helper" element={<GoogleInterviewAIPage />} />
      <Route path="/amazon-interview-ai-helper" element={<AmazonInterviewAIPage />} />
      <Route path="/meta-interview-ai-helper" element={<MetaInterviewAIPage />} />
      <Route path="/microsoft-interview-ai-helper" element={<MicrosoftInterviewAIPage />} />
      <Route path="/mckinsey-case-interview-ai" element={<McKinseyInterviewAIPage />} />
      <Route path="/goldman-sachs-interview-ai" element={<GoldmanSachsInterviewAIPage />} />
      <Route path="/faang-interview-ai-helper" element={<FAANGInterviewAIPage />} />
      {/* Round-type SEO Pages */}
      <Route path="/coding-interview-ai-helper" element={<CodingInterviewAIPage />} />
      <Route path="/system-design-interview-ai" element={<SystemDesignInterviewAIPage />} />
      <Route path="/behavioral-interview-ai-helper" element={<BehavioralInterviewAIPage />} />
      {/* Competitor Comparison Pages */}
      <Route path="/vs/final-round-ai" element={<ComparisonPage competitor={competitors['final-round-ai']} />} />
      <Route path="/vs/lockedin-ai" element={<ComparisonPage competitor={competitors['lockedin-ai']} />} />
      <Route path="/vs/hirin-ai" element={<ComparisonPage competitor={competitors['hirin-ai']} />} />
      <Route path="/vs/parakeet-ai" element={<ComparisonPage competitor={competitors['parakeet-ai']} />} />
      <Route path="/vs/uncharted-career" element={<ComparisonPage competitor={competitors['uncharted-career']} />} />
      {/* Blog Pages */}
      <Route path="/blog/how-to-crack-interview" element={<HowToCrackInterviewPage />} />
      <Route path="/blog/real-time-ai-interview-helper" element={<RealTimeAIInterviewHelperPage />} />
      <Route path="/blog/zoom-ai-interview-helper" element={<ZoomAIInterviewHelperPage />} />
      <Route path="/blog/online-interview-helper" element={<OnlineInterviewHelperPage />} />
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
  );
}
