import { Link } from 'react-router-dom';
import { Star, Check, ArrowRight } from 'lucide-react';

export default function BestAIInterviewToolsPage() {
  const tools = [
    {
      rank: 1,
      name: 'HelplyAI',
      rating: 4.9,
      price: 'Free tier available',
      pros: ['Sub-1-second responses', 'Resume personalization', 'Native desktop app', 'All interview types', 'True stealth mode'],
      cons: ['Newer to market'],
      verdict: 'Best overall value for most job seekers.',
      link: '/',
    },
    {
      rank: 2,
      name: 'Final Round AI',
      rating: 4.5,
      price: '$148/month',
      pros: ['Established brand', 'ZipRecruiter integration', 'Good for behavioral'],
      cons: ['Expensive pricing', 'Auto-billing issues', 'Slower responses'],
      verdict: 'Good but overpriced for what you get.',
      link: '/alternatives/final-round-ai-alternative',
    },
    {
      rank: 3,
      name: 'LockedIn AI',
      rating: 4.4,
      price: '$49/month',
      pros: ['Fastest responses (116ms)', 'VSCode plugin', 'Great for developers'],
      cons: ['Complex setup', 'Developer-focused only'],
      verdict: 'Best for software engineers specifically.',
      link: '/alternatives/lockedin-ai-alternative',
    },
    {
      rank: 4,
      name: 'Sensei AI',
      rating: 4.3,
      price: '$89/month',
      pros: ['Excellent STAR method coaching', 'Story Studio feature'],
      cons: ['Expensive', 'Behavioral only', 'No technical support'],
      verdict: 'Best for behavioral interviews only.',
      link: '/alternatives/sensei-ai-alternative',
    },
    {
      rank: 5,
      name: 'ParakeetAI',
      rating: 4.0,
      price: '$39/month',
      pros: ['Good for coding interviews', 'Desktop app'],
      cons: ['Coding only', 'No behavioral support'],
      verdict: 'Limited to LeetCode-style interviews.',
      link: '/alternatives/parakeet-ai-alternative',
    },
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
        <div className="mb-8">
          <span className="text-blue-400 text-sm">Updated March 2026</span>
          <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-6">Best AI Interview Helper Tools in 2026</h1>
          <p className="text-xl text-gray-400">We tested 8 AI interview copilots over 3 weeks of real interviews. Here's our honest ranking.</p>
        </div>

        <div className="p-6 bg-zinc-900 rounded-xl mb-12">
          <h2 className="font-semibold mb-4">TL;DR — Our Top Pick</h2>
          <p className="text-gray-300">
            <strong className="text-white">HelplyAI</strong> offers the best value for most job seekers with sub-1-second responses, resume personalization, and a free tier. If you're a software engineer who wants IDE integration, consider <strong className="text-white">LockedIn AI</strong>.
          </p>
        </div>

        <div className="space-y-8 mb-16">
          {tools.map((tool) => (
            <div key={tool.rank} className={`p-6 rounded-xl border ${tool.rank === 1 ? 'bg-blue-600/10 border-blue-600/30' : 'bg-zinc-900 border-zinc-800'}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className={`text-sm ${tool.rank === 1 ? 'text-blue-400' : 'text-gray-500'}`}>#{tool.rank}</span>
                  <h3 className="text-2xl font-bold">{tool.name}</h3>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold">{tool.rating}</span>
                  </div>
                  <span className="text-sm text-gray-400">{tool.price}</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm text-gray-500 mb-2">Pros</h4>
                  <ul className="space-y-1">
                    {tool.pros.map((pro, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm text-gray-500 mb-2">Cons</h4>
                  <ul className="space-y-1">
                    {tool.cons.map((con, i) => (
                      <li key={i} className="text-sm text-gray-400">• {con}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <p className="text-gray-300 mb-4">{tool.verdict}</p>

              <Link to={tool.link} className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300">
                {tool.rank === 1 ? 'Try Free' : 'Read Full Review'} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">How We Tested</h2>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 mb-4">
              We used each tool during real mock interviews and actual job interviews over a 3-week period. We evaluated:
            </p>
            <ul className="space-y-2 text-gray-300">
              <li>• <strong>Response speed</strong> — How fast answers appear during live conversation</li>
              <li>• <strong>Answer quality</strong> — Relevance and personalization of suggestions</li>
              <li>• <strong>Stealth capability</strong> — Whether the tool is detectable during screen sharing</li>
              <li>• <strong>Ease of use</strong> — Setup time and learning curve</li>
              <li>• <strong>Value for money</strong> — Features relative to pricing</li>
            </ul>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">FAQ</h2>
          <div className="space-y-4">
            {[
              { q: 'Are AI interview tools detectable?', a: 'The best tools like HelplyAI use native desktop apps with stealth mode that are invisible to screen sharing. Web-based tools are more likely to be noticed.' },
              { q: 'Is using AI during interviews cheating?', a: 'These tools are best used for practice and building confidence. Using them to misrepresent your abilities can backfire if you get the job and cannot perform.' },
              { q: 'Which tool is best for coding interviews?', a: 'LockedIn AI has the fastest responses and VSCode integration. HelplyAI is a close second with broader interview type support.' },
              { q: 'Which tool is best for behavioral interviews?', a: 'Sensei AI specializes in STAR method coaching, but HelplyAI offers similar features at a lower price with a free tier.' },
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

        <div className="text-center p-8 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">Ready to ace your next interview?</h2>
          <p className="text-gray-400 mb-6">Try HelplyAI free — no credit card required</p>
          <Link to="/" className="inline-block px-8 py-4 bg-blue-600 rounded-lg font-semibold hover:bg-blue-700">
            Get Started Free
          </Link>
        </div>
      </main>

      <footer className="border-t border-zinc-800 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-gray-500">© 2026 HelplyAI</div>
      </footer>
    </div>
  );
}
