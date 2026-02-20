import SectionHeader from '@/components/SectionHeader';
import ExternalLink from '@/components/ExternalLink';
import { colors } from '@/styles/theme';

// This would eventually come from a database or markdown files
const blogPosts = [
  {
    id: 'building-emergent-systems',
    title: 'Building Emergent Systems in Games',
    date: '2025-02-15',
    excerpt: 'How to create game mechanics that surprise even the designers...',
  },
  {
    id: 'photography-constraints',
    title: 'Creativity Through Constraints in Photography',
    date: '2025-01-20',
    excerpt: 'Why limitations make better art...',
  },
];

export default function Blog() {
  return (
    <main className="min-h-screen bg-white">
      <div 
        className="max-w-3xl mx-auto px-12 py-16 md:py-24 min-h-screen bg-cloud-dancer"
        style={{ position: 'relative' }}
      >
        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Blog</h1>
          <p className="text-gray-800">
            Thoughts on game design, photography, and creative constraints.
          </p>
        </header>

        <section className="space-y-8">
          {blogPosts.map((post) => (
            <article key={post.id} className="border-b border-gray-300 pb-8">
              <h2 className="text-xl font-bold mb-2">
                <ExternalLink href={`/blog/${post.id}`}>
                  {post.title}
                </ExternalLink>
              </h2>
              <p className="text-sm text-gray-600 mb-4">{post.date}</p>
              <p className="text-gray-800">{post.excerpt}</p>
            </article>
          ))}
        </section>

        <div className="mt-12">
          <ExternalLink href="/">← Back to home</ExternalLink>
        </div>
      </div>
    </main>
  );
}
