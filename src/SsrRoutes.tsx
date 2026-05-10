import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import RefundPolicyPage from './pages/RefundPolicyPage';
import AIInterviewHelperPage from './pages/AIInterviewHelperPage';
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
 * SSR-only routes table.
 *
 * Mirrors the public, indexable surface of the app — every page that wants
 * Googlebot to see its body HTML on first byte. Auth-coupled routes
 * (`/settings/*`, `/auth/callback`) are deliberately excluded because:
 *
 *   1. They're behind a login wall and don't need first-byte SEO.
 *   2. Importing them pulls in `@supabase/supabase-js`, whose `GoTrueClient`
 *      does a runtime `require('./lib/web3/ethereum')` that crashes in pure
 *      Node ESM. Excluding them lets the SSR bundle stay slim and clean.
 *
 * The browser bundle still mounts every route via `AppRoutes` in `App.tsx`,
 * so client-side navigation and authenticated UX are unchanged.
 */
export default function SsrRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/refund" element={<RefundPolicyPage />} />
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
      {/* Company-specific SEO Pages */}
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
    </Routes>
  );
}
