'use client';

import Image from 'next/image';
import Link from 'next/link';

const FALLBACK_THUMB = 'https://antiquewhite-stinkbug-399384.hostingersite.com/wp-content/uploads/2026/05/Umrah_packages_202605092201.jpeg';

function formatDate(value: unknown) {
  if (!value) return '';
  const date = new Date(value as string | number | Date);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default function LatestBlogsSection({ data, blogs, isHomepage = false }: { data?: any; blogs?: any[]; isHomepage?: boolean }) {
  const limit = Number(data?.limit) > 0 ? Number(data.limit) : 6;
  const visibleBlogs = (blogs || []).slice(0, isHomepage ? 3 : limit);

  return (
    <section className="bg-primary py-12 md:py-16">
      <div className="max-w-[1150px] mx-auto px-4">
        <div className="text-center mb-8">
          {data?.eyebrow && <span className="eyebrow block w-fit mx-auto text-center">{data.eyebrow}</span>}
          <h2 className="section-heading text-white">{data?.title || 'Articles, Tips & Spiritual Insights'}</h2>
          {data?.description && <p className="normal-text max-w-2xl mx-auto mt-3">{data.description}</p>}
        </div>

        {visibleBlogs.length === 0 ? (
          <p className="text-center text-white py-10">Articles coming soon.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {visibleBlogs.map((blog) => (
              <Link
                key={blog.id}
                href={`/blogs/${blog.slug}`}
                className="group flex flex-col overflow-hidden bg-white border border-slate-100 rounded-3xl shadow-sm no-underline"
              >
                <div className="relative aspect-[1.75] overflow-hidden bg-slate-100">
                  <Image
                    src={blog.featuredImage || data?.image || FALLBACK_THUMB}
                    alt={blog.title || 'Blog article'}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col flex-1 p-5">
                  {data?.showDate !== false && formatDate(blog.publishedAt || blog.createdAt) && (
                    <span className="date-display mb-2">
                      {formatDate(blog.publishedAt || blog.createdAt)}
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-primary leading-snug line-clamp-2 group-hover:text-red transition-colors">
                    {blog.title}
                  </h3>
                  {data?.showExcerpt !== false && blog.excerpt && (
                    <p className="normal-text mt-2 line-clamp-3">{blog.excerpt}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {isHomepage && (
          <div className="flex justify-center mt-10">
            <Link
              href="/blogs"
              className="inline-flex items-center justify-center bg-red text-white hover:bg-red-lt hover:text-white px-6 py-3 rounded-full text-md font-bold no-underline transition-colors"
            >
              Read More
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
