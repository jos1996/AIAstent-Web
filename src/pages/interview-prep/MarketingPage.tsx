import { Link } from 'react-router-dom';
import { Megaphone, TrendingUp, Users, Target, CheckCircle } from 'lucide-react';

export default function MarketingPage() {
  const topics = [
    { icon: Megaphone, title: 'Campaign Strategy', desc: 'Channel selection, messaging, creative development' },
    { icon: TrendingUp, title: 'Analytics & ROI', desc: 'Attribution, metrics, performance optimization' },
    { icon: Users, title: 'Brand & Content', desc: 'Brand positioning, content strategy, storytelling' },
    { icon: Target, title: 'Growth & Acquisition', desc: 'User acquisition, funnel optimization, retention' },
  ];

  const tips = [
    'Prepare case studies of campaigns you\'ve run with specific metrics',
    'Know your marketing funnel metrics and how to improve them',
    'Be ready to critique a real marketing campaign',
    'Understand the company\'s target audience and positioning',
    'Have examples of data-driven marketing decisions',
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
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Marketing Interview Prep</h1>
        <p className="text-xl text-gray-400 mb-12">Master campaign strategy, analytics, and growth marketing questions.</p>
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">What to Expect</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {topics.map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="p-6 bg-zinc-900 rounded-xl">
                <Icon className="w-8 h-8 text-blue-500 mb-4" />
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Top Interview Tips</h2>
          <div className="space-y-3">
            {tips.map((tip, i) => (
              <div key={i} className="flex gap-3 p-4 bg-zinc-900 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </section>
        <div className="text-center p-8 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">Ready to ace your marketing interview?</h2>
          <Link to="/" className="inline-block px-8 py-4 bg-blue-600 rounded-lg font-semibold hover:bg-blue-700">Try HelplyAI Free</Link>
        </div>
      </main>
      <footer className="border-t border-zinc-800 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-gray-500">© 2026 HelplyAI</div>
      </footer>
    </div>
  );
}
