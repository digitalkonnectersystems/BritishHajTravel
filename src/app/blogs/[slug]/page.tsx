import { getBlogBySlug, getRelatedBlogs, getBlogSeoAction } from '@/actions/blogActions';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import BlogSidebarBookingForm from '@/components/BlogSidebarBookingForm';
import { getPackagesByType } from '@/actions/packageActions';
import { RICH_TEXT_PROSE_CLASS } from '@/lib/richTextProseClass';

const FALLBACK_THUMB = 'https://antiquewhite-stinkbug-399384.hostingersite.com/wp-content/uploads/2026/05/Umrah_packages_202605092201.jpeg';

const CATEGORY_COLORS: Record<string, string> = {
  'Pilgrimage Guide': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Hajj Tips': 'bg-amber-100 text-amber-700 border-amber-200',
  'Umrah Guide': 'bg-teal-100 text-teal-700 border-teal-200',
  'Saudi Visa': 'bg-blue-100 text-blue-700 border-blue-200',
  'Travel Tips': 'bg-purple-100 text-purple-700 border-purple-200',
  'News & Updates': 'bg-rose-100 text-rose-700 border-rose-200',
  'Spiritual Journey': 'bg-indigo-100 text-indigo-700 border-indigo-200',
};

function formatDate(d: any) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
}

function formatDateShort(d: any) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
}

function toSafeISOString(value: any): string | undefined {
  if (!value) return undefined;

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString();
}

// ─── generateMetadata ──────────────────────────────────────────────────────
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  if (!blog) return { title: 'Blog Not Found | King Travel Canada' };

  const seoData: any = await getBlogSeoAction(blog.id);
  const metaTitle = seoData?.metaTitle || `${blog.title} | King Travel Canada`;
  const metaDesc = seoData?.metaDescription || blog.excerpt || `Read ${blog.title} on King Travel Canada blog.`;
  const ogImage = seoData?.ogImageUrl || blog.featuredImage || FALLBACK_THUMB;

  return {
    title: metaTitle,
    description: metaDesc,
    openGraph: {
      title: metaTitle,
      description: metaDesc,
      url: `/blogs/${slug}`,
      type: 'article',
      images: [{ url: ogImage, width: 1200, height: 630, alt: blog.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDesc,
      images: [ogImage],
    },
  };
}

// ─── Page ──────────────────────────────────────────────────────────────────
export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog || !blog.isPublished) notFound();

  const relatedBlogs = await getRelatedBlogs(slug, 6);

  const [umrahPackageRows, hajjPackageRows] = await Promise.all([
    getPackagesByType('umrah'),
    getPackagesByType('hajj'),
  ]);

  const umrahPackages = (umrahPackageRows || []).filter(
    (pkg: any) => pkg.status === 'available'
  );

  const hajjPackages = (hajjPackageRows || []).filter(
    (pkg: any) => pkg.status === 'available'
  );
  const displayDate = formatDate(blog.publishedAt || blog.createdAt);
  const catClass = CATEGORY_COLORS[blog.category ?? ''] ?? 'bg-emerald-100 text-emerald-700 border-emerald-200';

  // JSON-LD Article structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blog.title,
    description: blog.excerpt || '',
    image: blog.featuredImage || FALLBACK_THUMB,
    author: { '@type': 'Person', name: blog.authorName || 'King Travel Editorial' },
    publisher: {
      '@type': 'Organization',
      name: 'King Travel Canada',
      logo: { '@type': 'ImageObject', url: '/img/logo.png' },
    },
    datePublished:
      toSafeISOString(blog.publishedAt) ||
      toSafeISOString(blog.createdAt),

    dateModified: toSafeISOString(blog.updatedAt),
    mainEntityOfPage: { '@type': 'WebPage', '@id': `/blogs/${slug}` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── Hero Banner ── */}
      <div className="relative w-full h-[360px] overflow-hidden">
        <img
          src={blog.featuredImage || FALLBACK_THUMB}
          alt={blog.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a422d]/45 to-[#0a422d]/100" />
        <div className="absolute inset-0 flex flex-col justify-center px-6 xl:px-0 pb-10 max-w-[1280px] mx-auto left-0 right-0">
          <span className={`self-start text-[11px] font-extrabold px-3 py-1 rounded-full border mb-4 ${catClass}`}>
            {blog.category || 'Article'}
          </span>
          <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight mb-4 drop-shadow-lg">
            {blog.title}
          </h1>
          {/* <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs border-2 border-white/30">
                {blog.authorName?.charAt(0) || 'K'}
              </span>
              <span className="font-semibold text-white">{blog.authorName || 'King Travel Editorial'}</span>
            </div>
            {displayDate && (
              <>
                <span className="text-white/40">·</span>
                <span>{displayDate}</span>
              </>
            )}
          </div> */}
          <span className="self-start date-display !text-gold p-2 border border-gold rounded-full bg-gold/10">{displayDate}</span>
        </div>
      </div>

      {/* ── Content Layout ── */}
      <section className="bg-sage section-outer">
        <div className="section-inner">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10 items-start">

            {/* ── Main Article Content ── */}
            <article>
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm text-primary mb-6">
                <Link href="/" className="text-[var(--ink-light)] hover:text-primary no-underline transition-colors">Home</Link>
                <span>›</span>
                <Link href="/blogs" className="text-[var(--ink-light)] hover:text-primary no-underline transition-colors">Blog</Link>
                <span>›</span>
                <span className="text-slate-600 font-medium max-sm:truncate max-sm:max-w-[200px]">{blog.title}</span>
              </nav>

              {/* Excerpt callout */}
              {blog.excerpt && (
                <div className="bg-[var(--gold-soft)] border-l-4 border-primary rounded-r-2xl px-6 py-5 mb-8 shadow-sm">
                  <p className="text-base text-slate-700 italic leading-relaxed font-medium m-0">{blog.excerpt}</p>
                </div>
              )}

              {/* Article body */}
              <div
                className={`${RICH_TEXT_PROSE_CLASS} bg-white rounded-3xl shadow-sm p-8 md:p-10 overflow-hidden [&_table]:w-full [&_table]:border-collapse [&_table]:my-6 [&_td]:border [&_td]:border-slate-200 [&_td]:px-3 [&_td]:py-2 [&_td]:text-sm [&_th]:border [&_th]:border-slate-200 [&_th]:px-3 [&_th]:py-2 [&_th]:text-sm [&_th]:bg-slate-50 [&_th]:font-bold`}
                dangerouslySetInnerHTML={{ __html: blog.content || '<p>Content coming soon.</p>' }}
              />

              {/* Tags footer */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <span className="text-sm font-bold text-ink">Tags:</span>
                {[blog.category, 'King Travel Canada', 'Pilgrimage'].filter(Boolean).map((tag) => (
                  <span key={tag} className="text-sm px-3 py-1 rounded-full border-1 border-[var(--ink-light)]  text-[var(--ink-light)] font-medium">{tag}</span>
                ))}
              </div>

              {/* Back to blog */}
              <div className="max-sm:hidden max-lg:landscape:hidden mt-10 pt-6 border-t border-slate-100">
                <Link
                  href="/blogs"
                  className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all no-underline"
                >
                  ← Back to All Articles
                </Link>
              </div>
            </article>

            {/* ── Sidebar ── */}
            <aside className="lg:top-6">
              {/* Booking Form Widget */}
              <div className="mb-8">
                <BlogSidebarBookingForm blogTitle={blog.title} />
              </div>

              {/* ── Related Posts ── */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center">
                  {/* <span className="w-1 h-5 bg-primary rounded-full inline-block" /> */}
                  <span className="text-xl font-extrabold m-0">Other Articles</span>
                </div>

                {relatedBlogs.length === 0 ? (
                  <div className="px-5 py-8 text-center text-xs text-slate-400">No other articles yet.</div>
                ) : (
                  <div
                    className="divide-y divide-slate-50 overflow-y-auto"
                    style={{ maxHeight: '520px' }}
                  >
                    {/* First 4 always visible */}
                    {relatedBlogs.slice(0, 4).map((post) => (
                      <RelatedCard key={post.id} post={post} />
                    ))}
                    {/* Remaining scroll naturally within container */}
                    {relatedBlogs.slice(4).map((post) => (
                      <RelatedCard key={post.id} post={post} />
                    ))}
                  </div>
                )}

                {/* View all CTA */}
                <div className="px-5 py-4 border-t border-slate-100">
                  <Link
                    href="/blogs"
                    className="block w-full text-center text-xs font-bold text-primary py-2.5 rounded-md border border-primary/20 text-[11px] font-extrabold text-primary hover:bg-primary hover:text-white hover:border-primary transition-all no-underline"
                  >
                    View All Articles →
                  </Link>
                </div>
              </div>

              {/* Umrah Packages */}
              <div className="mt-8">
                <SidebarPackageSection
                  title="Umrah Packages"
                  packages={umrahPackages}
                  emptyText="No Umrah packages available."
                />
              </div>

              {/* Hajj Packages */}
              <div className="mt-8">
                <SidebarPackageSection
                  title="Hajj Packages"
                  packages={hajjPackages}
                  emptyText="No Hajj packages available."
                />
              </div>

            </aside>
          </div>
        </div>
      </section>
    </>
  );
}


function SidebarPackageSection({
  title,
  packages,
  emptyText,
}: {
  title: string;
  packages: any[];
  emptyText: string;
}) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <span className="text-lg font-extrabold text-ink">{title}</span>
        <span className="text-[10px] border border-gold px-2 rounded-full py-1 px-2 bg-gold-lt/10 font-bold uppercase tracking-wider text-gold">
          {packages.length} Available
        </span>
      </div>

      {packages.length === 0 ? (
        <div className="px-5 py-6 text-center text-xs text-slate-400">
          {emptyText}
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {packages.map((pkg: any) => {
            let cardData: any = pkg.cardData || {};

            if (typeof cardData === 'string') {
              try {
                cardData = JSON.parse(cardData);
              } catch {
                cardData = {};
              }
            }

            const image =
              cardData?.bannerImage ||
              pkg.featuredImage ||
              '/img/saudi-visa-1.webp';

            const price = pkg.startingPrice
              ? Number(pkg.startingPrice).toLocaleString('en-CA', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })
              : null;

            return (
              <div key={pkg.id} className="p-4">
                <div className="flex gap-3">
                  <Link
                    href={`/${pkg.slug}`}
                    className="relative w-24 h-20 shrink-0 rounded-xl overflow-hidden bg-slate-100 no-underline"
                  >
                    <img
                      src={image}
                      alt={pkg.title || title}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/${pkg.slug}`}
                      className="block text-sm font-extrabold text-slate-800 leading-snug hover:text-primary transition-colors no-underline line-clamp-2"
                    >
                      {pkg.title}
                    </Link>

                    <div className="mt-1.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                        From
                      </span>
                      <div className="text-sm font-black text-primary">
                        {price ? `CAD ${price}` : 'Contact for price'}
                      </div>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/${pkg.slug}`}
                  className="mt-3 flex w-full items-center justify-center rounded-md border border-primary/20 py-2.5 text-[11px] font-extrabold text-primary hover:bg-primary hover:text-white hover:border-primary transition-all no-underline"
                >
                  View Details →
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Related Post Card ─────────────────────────────────────────────────────
function RelatedCard({ post }: { post: any }) {
  const displayDate = formatDateShort(post.publishedAt || post.createdAt);
  return (
    <Link
      href={`/blogs/${post.slug}`}
      className="group flex gap-3 p-4 hover:bg-slate-50 transition-colors no-underline"
    >
      {/* Thumbnail */}
      <div className="relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
        <img
          src={post.featuredImage || FALLBACK_THUMB}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      {/* Text */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-slate-800 leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-1">
          {post.title}
        </h3>
        {displayDate && (
          <span className="text-[12px] text-[var(--ink-light)]">{displayDate}</span>
        )}
      </div>
    </Link>
  );
}