'use server';

import { requireAdmin } from '@/lib/requireAdmin';

import { db } from '@/db';
import { blogPosts, siteSettings } from '@/db/schema';
import { eq, desc, ne, and } from 'drizzle-orm';
import { revalidatePath, updateTag, unstable_cache } from 'next/cache';
import { logAdminActivityAction } from '@/actions/activityActions';

// ─── Auto-slugify title ────────────────────────────────────────────────────
export async function slugifyBlogTitle(title: string): Promise<string> {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// ─── GET ALL BLOGS ─────────────────────────────────────────────────────────
export async function getBlogsList(publishedOnly = false) {
  if (!publishedOnly) await requireAdmin();

  try {
    const sortWithOrderedIds = async (list: any[]) => {
      try {
        const orderSetting = await db.select().from(siteSettings).where(eq(siteSettings.key, 'ordered_blogs')).limit(1);
        let orderIds: number[] = [];
        if (orderSetting && orderSetting.length > 0) {
          try {
            orderIds = JSON.parse(orderSetting[0].value);
          } catch (e) {}
        }
        if (Array.isArray(orderIds) && orderIds.length > 0) {
          const orderMap = new Map(orderIds.map((id, index) => [id, index]));
          list.sort((a, b) => {
            const orderA = orderMap.has(a.id) ? (orderMap.get(a.id) as number) : 9999;
            const orderB = orderMap.has(b.id) ? (orderMap.get(b.id) as number) : 9999;
            return orderA - orderB;
          });
        }
      } catch (e) {
        console.warn('Blog order sorting failed:', e);
      }
      return list;
    };

    if (publishedOnly) {
      const getCachedPublishedBlogs = unstable_cache(
        async () => {
          const rows = await db
            .select({
              id: blogPosts.id,
              title: blogPosts.title,
              slug: blogPosts.slug,
              excerpt: blogPosts.excerpt,
              featuredImage: blogPosts.featuredImage,
              category: blogPosts.category,
              authorName: blogPosts.authorName,
              isPublished: blogPosts.isPublished,
              publishedAt: blogPosts.publishedAt,
              createdAt: blogPosts.createdAt,
              updatedAt: blogPosts.updatedAt,
            })
            .from(blogPosts)
            .where(eq(blogPosts.isPublished, true))
            .orderBy(
              desc(blogPosts.publishedAt),
              desc(blogPosts.createdAt)
            );

          return rows;
        },
        ['published-blogs'],
        { tags: ['blogs'], revalidate: 300 }
      );

      return await getCachedPublishedBlogs();
    }

    const rows = await db
      .select()
      .from(blogPosts)
      .orderBy(desc(blogPosts.createdAt));
    return await sortWithOrderedIds(rows);
  } catch (err) {
    console.error('getBlogsList DB error:', err);
    throw new Error('Failed to fetch blogs from database');
  }
}

// ─── GET LATEST BLOGS FOR HOMEPAGE ─────────────────────────────────────────
export async function getLatestBlogs(limit = 3) {
  try {
    const safeLimit = Math.max(1, Math.min(Number(limit) || 3, 12));

    const getCachedLatestBlogs = unstable_cache(
      async () => {
        const rows = await db
          .select({
            id: blogPosts.id,
            title: blogPosts.title,
            slug: blogPosts.slug,
            excerpt: blogPosts.excerpt,
            featuredImage: blogPosts.featuredImage,
            category: blogPosts.category,
            authorName: blogPosts.authorName,
            isPublished: blogPosts.isPublished,
            publishedAt: blogPosts.publishedAt,
            createdAt: blogPosts.createdAt,
            updatedAt: blogPosts.updatedAt,
          })
          .from(blogPosts)
          .where(eq(blogPosts.isPublished, true))
          .orderBy(
            desc(blogPosts.publishedAt),
            desc(blogPosts.createdAt)
          )
          .limit(safeLimit);

        return rows;
      },
      ['latest-published-blogs', String(safeLimit)],
      {
        tags: ['blogs'],
        revalidate: 300,
      }
    );

    return await getCachedLatestBlogs();
  } catch (err) {
    console.error('getLatestBlogs DB error:', err);
    return [];
  }
}

// ─── UPDATE BLOG ORDER ─────────────────────────────────────────────────────
export async function updateBlogOrderAction(orderedIds: number[]) {
  await requireAdmin(['admin', 'content_editor', 'seo_manager']);

  try {
    const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, 'ordered_blogs')).limit(1);
    if (existing && existing.length > 0) {
      await db.update(siteSettings).set({ value: JSON.stringify(orderedIds), updatedAt: new Date() }).where(eq(siteSettings.key, 'ordered_blogs'));
    } else {
      await db.insert(siteSettings).values({ key: 'ordered_blogs', value: JSON.stringify(orderedIds) });
    }

    // Log Activity
    await logAdminActivityAction({
      type: 'pages',
      action: 'Reordered Blog Posts',
      details: `Updated sequence for ${orderedIds.length} blog articles`,
    });

    revalidatePath('/blogs');
    revalidatePath('/admin/blogs');
    updateTag('blogs');
    return { success: true };
  } catch (err: any) {
    console.warn('updateBlogOrderAction error:', err);
    revalidatePath('/blogs');
    revalidatePath('/admin/blogs');
    updateTag('blogs');
    return { success: false, error: err.message || 'Failed to update blog order' };
  }
}

// ─── GET SINGLE BLOG BY SLUG ───────────────────────────────────────────────
export async function getBlogBySlug(slug: string) {
  try {
    const getCachedBlog = unstable_cache(
      async () => {
        const rows = await db
          .select()
          .from(blogPosts)
          .where(and(eq(blogPosts.slug, slug), eq(blogPosts.isPublished, true)))
          .limit(1);
        return rows.length > 0 ? rows[0] : null;
      },
      ['blog-by-slug', slug],
      { tags: ['blogs', `blog-${slug}`], revalidate: 300 }
    );
    return await getCachedBlog();
  } catch (err) {
    console.error('getBlogBySlug DB error:', err);
    throw new Error('Failed to fetch blog by slug');
  }
}

// ─── GET SINGLE BLOG BY ID ─────────────────────────────────────────────────
export async function getBlogById(id: number) {
  await requireAdmin();

  try {
    const rows = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
    return rows.length > 0 ? rows[0] : null;
  } catch (err) {
    console.error('getBlogById DB error:', err);
    throw new Error('Failed to fetch blog by ID');
  }
}

// ─── SAVE BLOG (CREATE / UPDATE) ───────────────────────────────────────────
export interface BlogSavePayload {
  id?: number | null;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  featuredImage?: string | null;
  category?: string;
  authorName?: string;
  isPublished?: boolean;
  publishedAt?: string | null; // ISO date string or null
}

export async function saveBlogAction(data: BlogSavePayload) {
  await requireAdmin(['admin', 'content_editor', 'seo_manager']);

  const {
    id,
    title,
    slug,
    excerpt,
    content,
    featuredImage,
    category = 'Pilgrimage Guide',
    authorName = 'British Hajj Travel Editorial',
    isPublished = true,
    publishedAt,
  } = data;

  let parsedPublishedAt: Date | null = null;
  if (typeof publishedAt === 'string' && publishedAt.trim() !== '') {
    const d = new Date(publishedAt);
    if (!isNaN(d.getTime())) {
      parsedPublishedAt = d;
    }
  }

  try {
    if (id) {
      const beforeRows = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
      const previousEntry = beforeRows[0] || null;
      const updateData: any = {
        title,
        slug,
        excerpt: excerpt ?? null,
        content,
        featuredImage: featuredImage ?? null,
        category,
        authorName,
        isPublished,
        updatedAt: new Date(),
      };
      // Editing an existing blog without selecting a new date must not
      // silently replace its original publish date with today's date.
      updateData.publishedAt = parsedPublishedAt ?? previousEntry?.publishedAt ?? new Date();

      await db.update(blogPosts).set(updateData).where(eq(blogPosts.id, id));
      const afterRows = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);

      await logAdminActivityAction({
        type: 'blogs',
        action: 'Updated Blog Post',
        details: `Article: "${title}" (${category})`,
        previousEntry,
        newEntry: afterRows[0] || null,
      });

      revalidatePath('/blogs');
      revalidatePath(`/blogs/${slug}`);
      revalidatePath('/admin/blogs');
      updateTag('blogs');
      updateTag(`blog-${slug}`);
      return { success: true, blogId: id };
    } else {
      const insertData: any = {
        title,
        slug,
        excerpt: excerpt ?? '',
        content: content ?? '',
        featuredImage: featuredImage ?? null,
        category,
        authorName,
        isPublished,
        // New blog: if the date picker is empty, save the current date.
        // Drizzle serializes Date into the existing published_at TIMESTAMP.
        publishedAt: parsedPublishedAt ?? new Date(),
      };

      let savedId: number | undefined;
      const inserted = await db.insert(blogPosts).values(insertData).$returningId();
      if (inserted && inserted.length > 0) {
        savedId = inserted[0].id;
      }

      // Log Activity
      await logAdminActivityAction({
        type: 'pages',
        action: 'Created Blog Post',
        details: `Created article: "${title}" (${category})`,
      });

      revalidatePath('/blogs');
      revalidatePath('/admin/blogs');
      updateTag('blogs');
      updateTag(`blog-${slug}`);
      return { success: true, blogId: savedId };
    }
  } catch (err: any) {
    console.error('saveBlogAction error:', err);
    return { success: false, error: err.message || 'Failed to save blog post' };
  }
}

// ─── DELETE BLOG ───────────────────────────────────────────────────────────
export async function deleteBlogAction(id: number) {
  await requireAdmin(['admin', 'content_editor', 'seo_manager']);

  try {
    let blogTitle = `ID #${id}`;
    try {
      const found = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
      if (found && found.length > 0) {
        blogTitle = `"${found[0].title}"`;
      }
    } catch (e) {}

    await db.delete(blogPosts).where(eq(blogPosts.id, id));

    // Log Activity
    await logAdminActivityAction({
      type: 'pages',
      action: 'Deleted Blog Post',
      details: `Removed blog article: ${blogTitle}`,
    });

    revalidatePath('/blogs');
    revalidatePath('/admin/blogs');
    updateTag('blogs');
    return { success: true };
  } catch (err: any) {
    console.error('deleteBlogAction DB error:', err);
    return { success: false, error: err.message || 'Failed to delete blog' };
  }
}

// ─── BLOG SEO — SAVE ───────────────────────────────────────────────────────
export async function saveBlogSeoAction(blogId: number, seoData: any) {
  await requireAdmin(['admin', 'content_editor', 'seo_manager']);

  try {
    await db.update(blogPosts).set({
      seoSettings: seoData,
      updatedAt: new Date(),
    }).where(eq(blogPosts.id, blogId));
    
    revalidatePath('/admin/blogs');
    updateTag('blogs');
    updateTag(`blog-seo-${blogId}`);
    return { success: true };
  } catch (err: any) {
    console.error('saveBlogSeoAction error:', err);
    return { success: false, error: err.message || 'Failed to save SEO settings' };
  }
}

// ─── BLOG SEO — GET ────────────────────────────────────────────────────────
export async function getBlogSeoAction(blogId: number) {
  await requireAdmin(['admin', 'content_editor', 'seo_manager']);

  try {
    const getCachedBlogSeo = unstable_cache(
      async () => {
        const rows = await db.select({ seoSettings: blogPosts.seoSettings }).from(blogPosts).where(eq(blogPosts.id, blogId)).limit(1);
        if (rows && rows.length > 0) {
          return rows[0].seoSettings || null;
        }
        return null;
      },
      ['blog-seo', String(blogId)],
      { tags: ['blogs', `blog-seo-${blogId}`], revalidate: 300 }
    );
    return await getCachedBlogSeo();
  } catch (err) {
    console.error('getBlogSeoAction error:', err);
    return null;
  }
}

// ─── GET RELATED BLOGS (exclude current) ──────────────────────────────────
export async function getRelatedBlogs(excludeSlug: string, limit = 6) {
  try {
    const getCachedRelatedBlogs = unstable_cache(
      async () => {
        const rows = await db
          .select()
          .from(blogPosts)
          .where(eq(blogPosts.isPublished, true))
          .orderBy(desc(blogPosts.createdAt))
          .limit(limit + 1);
        return rows
          .filter((b) => typeof b.slug === 'string' && b.slug.trim() !== '' && b.slug !== excludeSlug)
          .slice(0, limit);
      },
      ['related-blogs', excludeSlug, String(limit)],
      { tags: ['blogs'], revalidate: 300 }
    );
    return await getCachedRelatedBlogs();
  } catch (err) {
    console.error('getRelatedBlogs DB error:', err);
    return [];
  }
}

// ─── GET BLOG CATEGORIES ───────────────────────────────────────────────────
export async function getBlogCategories() {
  try {
    const rows = await db
      .select({ value: siteSettings.value })
      .from(siteSettings)
      .where(eq(siteSettings.key, 'blog_categories'))
      .limit(1);

    if (rows && rows.length > 0) {
      return JSON.parse(rows[0].value) as string[];
    }
    // Default categories if none exist in db
    return [
      'Pilgrimage Guide',
      'Hajj Tips',
      'Umrah Guide',
      'Saudi Visa',
      'Travel Tips',
      'News & Updates',
      'Spiritual Journey',
    ];
  } catch (err) {
    console.error('getBlogCategories DB error:', err);
    return [
      'Pilgrimage Guide',
      'Hajj Tips',
      'Umrah Guide',
      'Saudi Visa',
      'Travel Tips',
      'News & Updates',
      'Spiritual Journey',
    ];
  }
}

// ─── SAVE BLOG CATEGORIES ──────────────────────────────────────────────────
export async function saveBlogCategories(categories: string[]) {
  await requireAdmin(['admin', 'content_editor', 'seo_manager']);

  try {
    const jsonStr = JSON.stringify(categories);
    const existing = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, 'blog_categories'))
      .limit(1);

    if (existing.length > 0) {
      await db.update(siteSettings)
        .set({ value: jsonStr, updatedAt: new Date() })
        .where(eq(siteSettings.key, 'blog_categories'));
    } else {
      await db.insert(siteSettings).values({
        key: 'blog_categories',
        value: jsonStr,
      });
    }

    // Log Activity
    await logAdminActivityAction({
      type: 'settings',
      action: 'Updated Blog Categories',
      details: `Saved ${categories.length} blog categories`,
    });

    revalidatePath('/admin/blogs');
    revalidatePath('/admin/blogs/edit');
    return { success: true };
  } catch (err: any) {
    console.error('saveBlogCategories DB error:', err);
    return { success: false, error: err.message || 'Failed to save categories' };
  }
}
