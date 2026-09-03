import { getBlogsList } from '@/actions/blogActions';
import PageBanner from '@/components/PageBanner';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getPageBySlug } from '@/actions/pageActions';
import PageSectionsRenderer from '@/components/PageSectionsRenderer';

export const metadata: Metadata = {
  title: 'Blog & Travel Guides | King Travel Canada',
  description: 'Explore pilgrimage tips, Hajj & Umrah guides, Saudi Visa info, and travel inspiration from King Travel Canada\'s expert editorial team.',
  openGraph: {
    title: 'Blog & Travel Guides | King Travel Canada',
    description: 'Explore pilgrimage tips, Hajj & Umrah guides, Saudi Visa info, and travel inspiration.',
    url: '/blogs',
    type: 'website',
  },
};

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

  const featured = allBlogs[0] ?? null;
  const rest = allBlogs.slice(1);

  return (
    <>
      <PageBanner
        title={pageData?.bannerTitle || pageData?.title || 'Our <em>Blog</em> & Travel Guides'}
        description={pageData?.bannerDescription || "Insights, tips, and inspiration for your pilgrimage journey — written by the King Travel Canada team."}
        bgImage={pageData?.bannerBgImage}
        position={pageData?.bannerPosition}
        size={pageData?.bannerSize}
      />

      <section className="section-outer bg-sage">
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
              href={`/blogs/${featured.slug}`}
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
                  <span className="absolute top-4 left-4 text-[11px] font-extrabold bg-gold text-white px-3 py-1 rounded-full uppercase tracking-wide">
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
                    <span className="font-semibold text-slate-600">{featured.authorName || 'King Travel Editorial'}</span>
                    {(featured.publishedAt || featured.createdAt) && (
                      <>
                        <span className="text-slate-300">·</span>
                        <span>{formatDate(featured.publishedAt || featured.createdAt)}</span>
                      </>
                    )}
                  </div> */}
                  <div className=" inline-flex items-center gap-2 text-sm font-bold text-ink group-hover:gap-3 transition-all">
                    Read Full Article <span className="text-gold">→</span>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
                {rest.map((blog) => {
                  const displayDate = formatDate(blog.publishedAt || blog.createdAt);
                  return (
                    <Link
                      key={blog.id}
                      href={`/blogs/${blog.slug}`}
                      className="group flex flex-col rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-lg shadow-gray-200/60 hover:shadow-xl hover:shadow-gray-300/50 hover:-translate-y-1 transition-all duration-400 no-underline blog-card"                    >
                      {/* Thumbnail */}
                      <div className="relative overflow-hidden h-52">
                        <img
                          src={blog.featuredImage || FALLBACK_THUMB}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-600"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                        <span className={`absolute top-3 left-3 text-[10px] font-extrabold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[blog.category ?? ''] ?? 'bg-primary text-white'}`}>
                          {blog.category || 'Article'}
                        </span>
                      </div>

                      {/* Body */}
                      <div className="flex flex-col flex-1 p-5">
                        <h3 className="text-xl font-bold text-primary leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {blog.title}
                        </h3>
                        <div className="flex items-center justify-between pb-3">
                          {/* <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white font-bold text-[9px]">
                              {blog.authorName?.charAt(0) || 'K'}
                            </span>
                            <span className="font-medium text-slate-500 truncate max-w-[90px]">{blog.authorName?.split(' ')[0] || 'King Travel'}</span>
                          </div> */}
                          {displayDate && (
                            <span className="date-display">{displayDate}</span>
                          )}
                        </div>
                        {blog.excerpt && (
                          <p className="text-sm normal-text">
                            {blog.excerpt}
                          </p>
                        )}

                      </div>
                    </Link>
                  );
                })}
              </div>
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
