'use client';

import { useState } from 'react';
import Link from 'next/link';

function formatDate(d: any) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  });
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

export default function BlogsLoadMore({ blogs, initialCount = 11 }: { blogs: any[]; initialCount?: number }) {
  const [visibleCount, setVisibleCount] = useState(initialCount);
  const visibleBlogs = blogs.slice(0, visibleCount);
  const hasMore = visibleCount < blogs.length;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
        {visibleBlogs.map((blog) => {
          const displayDate = formatDate(blog.publishedAt || blog.createdAt);
          return (
            <Link
              key={blog.id}
              href={`/${blog.slug}`}
              className="group flex flex-col rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-lg shadow-gray-200/60 hover:shadow-xl hover:shadow-gray-300/50 hover:-translate-y-1 transition-all duration-400 no-underline blog-card"
            >
              <div className="relative overflow-hidden h-52">
                <img
                  src={blog.featuredImage || FALLBACK_THUMB}
                  alt={blog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-600"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                <span className={`absolute top-3 left-3 text-[10px] font-extrabold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[blog.category ?? ''] ?? 'bg-primary text-white'}`}>
                  {blog.category || 'Article Name'}
                </span>
              </div>

              <div className="flex flex-col flex-1 p-5">
                <h3 className="text-xl font-bold text-primary leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {blog.title}
                </h3>
                <div className="flex items-center justify-between pb-3">
                  {displayDate && <span className="date-display">{displayDate}</span>}
                </div>
                {blog.excerpt && <p className="text-sm normal-text">{blog.excerpt}</p>}
              </div>
            </Link>
          );
        })}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-10">
          <button
            type="button"
            onClick={() => setVisibleCount((current) => Math.min(current + 12, blogs.length))}
            className="inline-flex items-center justify-center bg-red text-white hover:bg-red-lt hover:text-white px-6 py-3 rounded-full text-md font-bold transition-colors"
          >
            See More Blogs
          </button>
        </div>
      )}
    </>
  );
}
