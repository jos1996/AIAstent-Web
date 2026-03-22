import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const alts = [
  { slug: 'final-round-ai', name: 'Final Round AI', pain: '$148/mo pricing' },
  { slug: 'lockedin-ai', name: 'LockedIn AI', pain: 'Complex setup' },
  { slug: 'sensei-ai', name: 'Sensei AI', pain: '$89/mo pricing' },
  { slug: 'parakeet-ai', name: 'ParakeetAI', pain: 'Coding-only' },
  { slug: 'beyz-ai', name: 'Beyz AI', pain: 'Limited features' },
  { slug: 'interviews-chat', name: 'Interviews.chat', pain: 'Complex setup' },
  { slug: 'aiapply', name: 'AiApply', pain: 'Slow answers' },
  { slug: 'live-interview-ai', name: 'Live Interview AI', pain: 'Basic UI' },
];

export default function AlternativesHubPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-4">AI Interview Tool Alternatives</h1>
        <p className="text-gray-400 mb-12">Compare HelplyAI with other AI interview copilots</p>
        <div className="grid md:grid-cols-2 gap-6">
          {alts.map((a) => (
            <Link key={a.slug} to={`/alternatives/${a.slug}-alternative`}
              className="p-6 bg-zinc-900 rounded-xl hover:bg-zinc-800 transition group">
              <h2 className="text-xl font-semibold mb-2">{a.name} Alternative</h2>
              <p className="text-gray-400 mb-4">Pain point: {a.pain}</p>
              <span className="text-blue-400 flex items-center gap-2">
                Compare <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
