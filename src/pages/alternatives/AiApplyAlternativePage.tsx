import { Link } from 'react-router-dom';
import { Check, X, Star, Zap, Shield, DollarSign } from 'lucide-react';

export default function AiApplyAlternativePage() {
  const features: [string, boolean | string, boolean | string][] = [
    ['Real-Time Answers', true, true],
    ['Response Speed', '<1 second', '3-5 seconds'],
    ['Resume Personalization', true, true],
    ['Desktop App', true, false],
    ['Stealth Mode', true, false],
    ['Free Tier', true, false],
  ];

  const painPoints = [
    'Slow answer generation — 3-5 seconds per response',
    'Too slow for natural conversation flow',
    'Web-only with no desktop app',
    'No true stealth mode for video calls',
  ];

  const benefits = [
    { icon: Zap, title: 'Sub-1-Second Responses', desc: 'Fast enough for real-time conversation' },
    { icon: Star, title: 'Resume-Aware AI', desc: 'Personalized answers from your experience' },
    { icon: Shield, title: 'True Stealth Mode', desc: 'Invisible to screen sharing' },
    { icon: DollarSign, title: 'Free Tier', desc: 'Start without any payment' },
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
        <h1 className="text-4xl md:text-5xl font-bold mb-6">The Best AiApply Interview Buddy Alternative 2026</h1>
        <p className="text-xl text-gray-400 mb-8">AiApply's slow answer generation ruins the interview flow. HelplyAI delivers sub-1-second responses for natural, real-time conversations.</p>
        <div className="flex gap-4 mb-16">
          <Link to="/" className="px-6 py-3 bg-blue-600 rounded-lg font-semibold hover:bg-blue-700">Try HelplyAI Free</Link>
          <a href="#comparison" className="px-6 py-3 border border-zinc-700 rounded-lg hover:bg-zinc-900">See Comparison</a>
        </div>
        <section id="comparison" className="mb-16">
          <h2 className="text-3xl font-bold mb-8">AiApply vs HelplyAI — 2026</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-4 px-4">Feature</th>
                <th className="text-center py-4 px-4">HelplyAI</th>
                <th className="text-center py-4 px-4">AiApply</th>
              </tr>
            </thead>
            <tbody>
              {features.map(([f, h, c], i) => (
                <tr key={i} className="border-b border-zinc-800/50">
                  <td className="py-4 px-4">{f}</td>
                  <td className="text-center py-4 px-4">
                    {h === true ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : 
                     h === false ? <X className="w-5 h-5 text-red-500 mx-auto" /> : 
                     <span className="text-green-400">{h}</span>}
                  </td>
                  <td className="text-center py-4 px-4">
                    {c === true ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : 
                     c === false ? <X className="w-5 h-5 text-red-500 mx-auto" /> : 
                     <span className="text-gray-400">{c}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Why Users Are Leaving AiApply</h2>
          <div className="space-y-4">
            {painPoints.map((p, i) => (
              <div key={i} className="flex gap-3 p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                <X className="w-5 h-5 text-red-500 shrink-0" />
                <span>{p}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">What You Get With HelplyAI</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="p-6 bg-zinc-900 rounded-xl">
                <Icon className="w-8 h-8 text-blue-500 mb-4" />
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">More Alternatives</h2>
          <div className="flex flex-wrap gap-3">
            {['final-round-ai', 'lockedin-ai', 'sensei-ai', 'live-interview-ai'].map((slug) => (
              <Link key={slug} to={`/alternatives/${slug}-alternative`} className="px-4 py-2 bg-zinc-900 rounded-lg hover:bg-zinc-800">
                {slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Alternative
              </Link>
            ))}
          </div>
        </section>
        <div className="text-center p-8 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">Ready to switch from AiApply?</h2>
          <Link to="/" className="inline-block px-8 py-4 bg-blue-600 rounded-lg font-semibold hover:bg-blue-700">Get Started Free</Link>
        </div>
      </main>
      <footer className="border-t border-zinc-800 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-gray-500">© 2026 HelplyAI</div>
      </footer>
    </div>
  );
}
