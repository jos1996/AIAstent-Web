import { Link } from 'react-router-dom';
import { Check, X, ArrowRight } from 'lucide-react';

export default function ParakeetAICompare() {
  const features: [string, boolean, boolean][] = [
    ['Coding Interviews', true, true],
    ['Behavioral Interviews', true, false],
    ['HR Interviews', true, false],
    ['All Interview Types', true, false],
    ['Desktop App', true, true],
    ['Free Tier', true, false],
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
        <h1 className="text-4xl md:text-5xl font-bold mb-6">ParakeetAI vs HelplyAI — 2026 Comparison</h1>
        <p className="text-xl text-gray-400 mb-12">Compare HelplyAI and ParakeetAI to find the right AI interview copilot for your job search.</p>
        
        <section className="mb-16">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-4 px-4">Feature</th>
                  <th className="text-center py-4 px-4 bg-blue-600/10">HelplyAI</th>
                  <th className="text-center py-4 px-4">ParakeetAI</th>
                </tr>
              </thead>
              <tbody>
                {features.map(([feature, helply, competitor], i) => (
                  <tr key={i} className="border-b border-zinc-800/50">
                    <td className="py-4 px-4 font-medium">{feature}</td>
                    <td className="text-center py-4 px-4 bg-blue-600/5">
                      {helply ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-red-500 mx-auto" />}
                    </td>
                    <td className="text-center py-4 px-4">
                      {competitor ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-red-500 mx-auto" />}
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
              <strong>HelplyAI wins</strong> for comprehensive interview support. ParakeetAI is great for coding interviews but limited to that single use case. HelplyAI covers coding, behavioral, HR, and all other interview types.
            </p>
            <p className="text-gray-400">
              Choose ParakeetAI only if you exclusively do coding interviews. Choose HelplyAI for full coverage.
            </p>
          </div>
        </section>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/" className="flex-1 text-center px-6 py-4 bg-blue-600 rounded-lg font-semibold hover:bg-blue-700">
            Try HelplyAI Free
          </Link>
          <Link to="/alternatives/parakeet-ai-alternative" className="flex-1 text-center px-6 py-4 border border-zinc-700 rounded-lg hover:bg-zinc-900 flex items-center justify-center gap-2">
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
