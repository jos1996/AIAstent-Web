import { Link } from 'react-router-dom';
import { Check, X, ArrowRight, Star, Zap, Shield, DollarSign } from 'lucide-react';

export default function FinalRoundAIAlternativePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">HelplyAI</Link>
          <Link to="/" className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700">Try Free</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          The Best Final Round AI Alternative That Actually Works
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          Tired of $148/month pricing and auto-billing? HelplyAI offers faster responses, true stealth mode, and a free trial — no credit card required.
        </p>

        <div className="flex gap-4 mb-16">
          <Link to="/" className="px-6 py-3 bg-blue-600 rounded-lg font-semibold hover:bg-blue-700">
            Try HelplyAI Free
          </Link>
          <a href="#comparison" className="px-6 py-3 border border-zinc-700 rounded-lg hover:bg-zinc-900">
            See Comparison
          </a>
        </div>

        <section id="comparison" className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Final Round AI vs HelplyAI — 2026</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-4 px-4">Feature</th>
                  <th className="text-center py-4 px-4">HelplyAI</th>
                  <th className="text-center py-4 px-4">Final Round AI</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Real-Time Answers', true, true],
                  ['Stealth Mode', true, true],
                  ['Response Speed', '<1 second', '2-3 seconds'],
                  ['Resume Personalization', true, false],
                  ['Desktop App', true, false],
                  ['Free Trial', true, 'Limited'],
                  ['No Auto-Billing', true, false],
                  ['Starting Price', 'Free', '$148/mo'],
                ].map(([feature, helply, competitor], i) => (
                  <tr key={i} className="border-b border-zinc-800/50">
                    <td className="py-4 px-4">{feature}</td>
                    <td className="text-center py-4 px-4">
                      {helply === true ? <Check className="w-5 h-5 text-green-500 mx-auto" /> :
                       helply === false ? <X className="w-5 h-5 text-red-500 mx-auto" /> :
                       <span className="text-green-400">{helply}</span>}
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
          <h2 className="text-3xl font-bold mb-8">Why Users Are Leaving Final Round AI</h2>
          <div className="space-y-4">
            {[
              '$148/month pricing is inaccessible for most job seekers',
              'Auto-billing after trial catches users off guard',
              '2-3 second response time is too slow for live interviews',
              'Generic answers not personalized to your resume',
              'No native desktop app — browser-only limits stealth capability',
            ].map((point, i) => (
              <div key={i} className="flex gap-3 p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                <X className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">What You Get With HelplyAI</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: Zap, title: 'Sub-1-Second Responses', desc: 'Fast enough for real-time conversations' },
              { icon: Shield, title: 'True Stealth Mode', desc: 'Native desktop app invisible to screen share' },
              { icon: Star, title: 'Resume-Aware AI', desc: 'Answers personalized to your experience' },
              { icon: DollarSign, title: 'Free Trial', desc: 'No credit card, no auto-billing tricks' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="p-6 bg-zinc-900 rounded-xl">
                <Icon className="w-8 h-8 text-blue-500 mb-4" />
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">FAQ</h2>
          <div className="space-y-4">
            {[
              { q: 'Is HelplyAI a good alternative to Final Round AI?', a: 'Yes, HelplyAI offers all the real-time interview assistance features plus faster responses, resume personalization, and a native desktop app — at a fraction of the cost.' },
              { q: 'How much cheaper is HelplyAI?', a: 'Final Round AI charges $148/month. HelplyAI has a free tier and premium plans at significantly lower prices with no auto-billing.' },
              { q: 'Does HelplyAI work during live interviews?', a: 'Yes, HelplyAI provides real-time AI answers during Zoom, Google Meet, and Teams calls with sub-1-second response times.' },
              { q: 'Is HelplyAI detectable?', a: 'No, HelplyAI runs as a native desktop app with true stealth mode. It is invisible to screen sharing and recording.' },
            ].map(({ q, a }, i) => (
              <details key={i} className="p-4 bg-zinc-900 rounded-xl group">
                <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
                  {q}
                  <ArrowRight className="w-5 h-5 group-open:rotate-90 transition" />
                </summary>
                <p className="mt-4 text-gray-400">{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">More Alternatives</h2>
          <div className="flex flex-wrap gap-3">
            {['lockedin-ai', 'sensei-ai', 'parakeet-ai', 'beyz-ai'].map((slug) => (
              <Link key={slug} to={`/alternatives/${slug}-alternative`}
                className="px-4 py-2 bg-zinc-900 rounded-lg hover:bg-zinc-800">
                {slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Alternative
              </Link>
            ))}
          </div>
        </section>

        <div className="text-center p-8 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">Ready to switch from Final Round AI?</h2>
          <p className="text-gray-400 mb-6">Try HelplyAI free — no credit card required</p>
          <Link to="/" className="inline-block px-8 py-4 bg-blue-600 rounded-lg font-semibold hover:bg-blue-700">
            Get Started Free
          </Link>
        </div>
      </main>

      <footer className="border-t border-zinc-800 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-gray-500">
          © 2026 HelplyAI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
