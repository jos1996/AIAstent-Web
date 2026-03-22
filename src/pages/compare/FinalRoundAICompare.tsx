import { Link } from 'react-router-dom';
import { Check, X, ArrowRight } from 'lucide-react';

export default function FinalRoundAICompare() {
  const features: [string, boolean | string, boolean | string][] = [
    ['Real-Time Answers', true, true],
    ['Stealth Mode', true, true],
    ['Response Speed', '<1 second', '2-3 seconds'],
    ['Resume Personalization', true, false],
    ['Desktop App', true, false],
    ['Free Trial', true, 'Limited'],
    ['No Auto-Billing', true, false],
    ['Technical Interviews', true, true],
    ['Behavioral Coaching', true, true],
    ['Starting Price', 'Free', '$148/mo'],
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">HelplyAI</Link>
          <Link to="/" className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700">Try Free</Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Final Round AI vs HelplyAI — 2026 Comparison</h1>
        <p className="text-xl text-gray-400 mb-12">See how HelplyAI compares to Final Round AI across features, pricing, and performance.</p>
        
        <section className="mb-16">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-4 px-4">Feature</th>
                  <th className="text-center py-4 px-4 bg-blue-600/10">HelplyAI</th>
                  <th className="text-center py-4 px-4">Final Round AI</th>
                </tr>
              </thead>
              <tbody>
                {features.map(([feature, helply, competitor], i) => (
                  <tr key={i} className="border-b border-zinc-800/50">
                    <td className="py-4 px-4 font-medium">{feature}</td>
                    <td className="text-center py-4 px-4 bg-blue-600/5">
                      {helply === true ? <Check className="w-5 h-5 text-green-500 mx-auto" /> :
                       helply === false ? <X className="w-5 h-5 text-red-500 mx-auto" /> :
                       <span className="text-green-400 font-semibold">{helply}</span>}
                    </td>
                    <td className="text-center py-4 px-4">
                      {competitor === true ? <Check className="w-5 h-5 text-green-500 mx-auto" /> :
                       competitor === false ? <X className="w-5 h-5 text-red-500 mx-auto" /> :
                       <span className="text-gray-400">{competitor}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">The Verdict</h2>
          <div className="p-6 bg-zinc-900 rounded-xl">
            <p className="text-gray-300 mb-4">
              <strong>HelplyAI wins</strong> for most job seekers. While Final Round AI is a solid product, its $148/month pricing and auto-billing practices make it inaccessible for many. HelplyAI offers faster response times, resume personalization, and a native desktop app — all with a free tier to get started.
            </p>
            <p className="text-gray-400">
              Choose Final Round AI if you specifically need their ZipRecruiter integration. Otherwise, HelplyAI provides better value.
            </p>
          </div>
        </section>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/" className="flex-1 text-center px-6 py-4 bg-blue-600 rounded-lg font-semibold hover:bg-blue-700">
            Try HelplyAI Free
          </Link>
          <Link to="/alternatives/final-round-ai-alternative" className="flex-1 text-center px-6 py-4 border border-zinc-700 rounded-lg hover:bg-zinc-900 flex items-center justify-center gap-2">
            Read Full Alternative Guide <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
      <footer className="border-t border-zinc-800 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-gray-500">© 2026 HelplyAI</div>
      </footer>
    </div>
  );
}
