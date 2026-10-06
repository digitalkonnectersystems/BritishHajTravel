import { getBlogsList } from '@/actions/blogActions';
import PageBanner from '@/components/PageBanner';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getPageBySlug } from '@/actions/pageActions';
import PageSectionsRenderer from '@/components/PageSectionsRenderer';
import BlogsLoadMore from '@/components/BlogsLoadMore';
import { buildPageMetadata } from '@/lib/seoMetadata';

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getPageBySlug('/blogs').catch(() => null);
  return buildPageMetadata(pageData || {
    title: 'Blog & Travel Guides',
    metaDescription: 'Explore Hajj and Umrah guides, Saudi visa information and pilgrimage travel advice from British Hajj Travel UK.',
  }, '/blogs');
}

function formatDate(d: any) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
}

const FALLBACK_THUMB = 'https://antiquewhite-stinkbug-399384.hostingersite.com/wp-content/uploads/2026/05/Umrah_packages_202605092201.jpeg';

const CATEGORY_COLORS: Record<string, string> = {
  'Pilgrimage Guide': 'bg-emerald-100 text-emerald-700',
  'Hajj Tips': 'bg-amber-100 text-amber-700',
  'Umrah Guide': 'bg-teal-100 text-teal-700',
  'Saudi Visa': 'bg-blue-100 text-blue-700',
  'Travel Tips': 'bg-purple-100 text-purple-700',
  'News & Updates': 'bg-rose-100 text-rose-700',
  'Spiritual Journey': 'bg-indigo-100 text-indigo-700',
};

export default async function BlogsListingPage() {
  const allBlogs = await getBlogsList(true); // published only
  const pageData = await getPageBySlug('/blogs');
  let sections: any[] = [];
  if (pageData?.sections) {
    try {
      sections = typeof pageData.sections === 'string' ? JSON.parse(pageData.sections) : pageData.sections;
    } catch (e) {
      console.error("Error parsing blogs page sections:", e);
    }
  }

  const routableBlogs = allBlogs.filter(
    (blog) => typeof blog.slug === 'string' && blog.slug.trim() !== ''
  );

  const featured = routableBlogs[0] ?? null;
  const rest = routableBlogs.slice(1);

  return (
    <>
      <PageBanner
        title={pageData?.bannerTitle || pageData?.title || 'Our <em>Blog</em> & Travel Guides'}
        description={pageData?.bannerDescription || "Insights, tips, and inspiration for your pilgrimage journey — written by the British Hajj Travel UK team."}
        bgImage={pageData?.bannerBgImage}
        position={pageData?.bannerPosition}
        size={pageData?.bannerSize}
        heroSettings={pageData?.seoSettings}
      />

      <section className="section-outer bg-blue-lt">
        <div className="section-inner">

          {allBlogs.length === 0 && (
            <div className="text-center py-24 text-slate-400">
              <p className="text-5xl mb-4">📝</p>
              <h2 className="text-xl font-bold text-slate-600 mb-2">No articles yet</h2>
              <p className="text-sm">Check back soon — we&apos;re writing something great.</p>
            </div>
          )}

          {/* ── Featured Hero Post ── */}
          {featured && (
            <Link
              href={`/${featured.slug}`}
              className="group block mb-12 rounded-3xl overflow-hidden shadow-lg shadow-gray-200/60 hover:shadow-xl hover:shadow-gray-300/50 transition-all duration-500 no-underline bg-white"            >
              <div className="grid grid-cols-1 md:grid-cols-2 min-h-[380px]">
                {/* Image */}
                <div className="relative overflow-hidden min-h-[260px]">
                  <img
                    src={featured.featuredImage || FALLBACK_THUMB}
                    alt={featured.title}
                    className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
                  <span className="absolute top-4 left-4 text-[11px] font-extrabold bg-red text-white px-3 py-1 rounded-full uppercase tracking-wide">
                    Featured
                  </span>
                </div>
                {/* Content */}
                <div className="flex flex-col justify-center p-8 md:p-10">
                  <span className={`self-start text-[11px] font-extrabold px-3 py-1 rounded-full mb-4 ${CATEGORY_COLORS[featured.category ?? ''] ?? 'bg-primary text-white'}`}>
                    {featured.category || 'Article'}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold text-primary mb-2 leading-tight transition-colors">
                    {featured.title}
                  </h2>
                  <span className="date-display mb-3">{formatDate(featured.publishedAt || featured.createdAt)}</span>
                  {featured.excerpt && (
                    <p className="normal-text">{featured.excerpt}</p>
                  )}
                  {/* <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white font-bold text-[10px]">
                      {featured.authorName?.charAt(0) || 'K'}
                    </span>
                    <span className="font-semibold text-slate-600">{featured.authorName || 'British Hajj Travel Editorial'}</span>
                    {(featured.publishedAt || featured.createdAt) && (
                      <>
                        <span className="text-slate-300">·</span>
                        <span>{formatDate(featured.publishedAt || featured.createdAt)}</span>
                      </>
                    )}
                  </div> */}
                  <div className=" inline-flex items-center gap-2 text-sm font-bold text-ink group-hover:gap-3 transition-all">
                    Read Full Article <span className="text-red">→</span>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* ── Grid of Remaining Posts ── */}
          {rest.length > 0 && (
            <>
              <h2 className="text-2xl md:text-3xl font-extrabold text-ink mb-6 flex items-center">
                More Articles
              </h2>
              <BlogsLoadMore blogs={rest} initialCount={11} />
            </>
          )}

        </div>
      </section>

      {sections && sections.length > 0 && (
        <PageSectionsRenderer sections={sections} pageData={pageData} />
      )}
    </>
  );
}
