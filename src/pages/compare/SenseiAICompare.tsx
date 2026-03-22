import { Link } from 'react-router-dom';
import { Check, X, ArrowRight } from 'lucide-react';

export default function SenseiAICompare() {
  const features: [string, boolean | string, boolean | string][] = [
    ['Real-Time Answers', true, true],
    ['Behavioral Coaching', true, true],
    ['STAR Method', true, true],
    ['Technical Interviews', true, false],
    ['Desktop App', true, false],
    ['Free Tier', true, false],
    ['Starting Price', 'Free', '$89/mo'],
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
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Sensei AI vs HelplyAI — 2026 Comparison</h1>
        <p className="text-xl text-gray-400 mb-12">Compare HelplyAI and Sensei AI for behavioral interview coaching and real-time assistance.</p>
        
        <section className="mb-16">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-4 px-4">Feature</th>
                  <th className="text-center py-4 px-4 bg-blue-600/10">HelplyAI</th>
                  <th className="text-center py-4 px-4">Sensei AI</th>
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
              <strong>HelplyAI wins</strong> on value and versatility. Sensei AI excels at behavioral interviews with their Story Studio feature, but at $89/month it's expensive. HelplyAI offers the same STAR method coaching plus technical interview support with a free tier.
            </p>
            <p className="text-gray-400">
              Choose Sensei AI if you only need behavioral interview prep. Choose HelplyAI for comprehensive coverage at a better price.
            </p>
          </div>
        </section>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/" className="flex-1 text-center px-6 py-4 bg-blue-600 rounded-lg font-semibold hover:bg-blue-700">
            Try HelplyAI Free
          </Link>
          <Link to="/alternatives/sensei-ai-alternative" className="flex-1 text-center px-6 py-4 border border-zinc-700 rounded-lg hover:bg-zinc-900 flex items-center justify-center gap-2">
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
