'use server';

import { db } from '@/db';
import { blogPosts, siteSettings } from '@/db/schema';
import { eq, desc, ne } from 'drizzle-orm';
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';
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
  try {
    // Ensure all 6 standard blogs exist in the database dynamically
    const existingBlogs = await db.select({ slug: blogPosts.slug }).from(blogPosts);
    const existingSlugs = new Set(existingBlogs.map((b) => b.slug));

    const DEFAULT_BLOGS = [
      {
        title: 'Complete Step-by-Step Umrah Guide for Canadian Pilgrims (2026)',
        slug: 'complete-step-by-step-umrah-guide-canadian-pilgrims',
        excerpt: 'Planning your sacred journey from Toronto, Montreal, or Vancouver? Here is your complete spiritual and practical guide to performing Umrah in 2026.',
        content: `<h2>Embarking on the Sacred Journey of Umrah</h2><p>For Muslims across Canada, embarking on Umrah is a transformative spiritual milestone. Whether it is your first time or a return to the holy cities of Makkah and Madinah, thorough preparation ensures peace of mind and spiritual focus.</p><h3>1. Essential Preparation Before Leaving Canada</h3><p>Before boarding your flight from Toronto Pearson (YYZ) or Montreal (YUL), ensure the following prerequisites are complete:</p><ul><li><strong>Saudi Tourist / Umrah eVisa:</strong> Canadian passport holders can easily obtain a one-year multiple-entry Tourist eVisa or dedicated Umrah Visa.</li><li><strong>Nusuk App Registration:</strong> Book your Rawdah appointment in Madinah and Umrah permit slots through the official Nusuk application.</li><li><strong>Ihram & Essentials:</strong> Pack two sets of unstitched white cloth for men and modest, breathable abayas for women.</li></ul><h3>2. The Four Pillars of Umrah</h3><p>Umrah consists of four core rituals: <strong>Ihram</strong>, <strong>Tawaf</strong>, <strong>Sa'i</strong>, and <strong>Halq/Taqsir</strong>.</p><h3>3. Tips for a Smooth Pilgrimage Experience</h3><p>Staying at walking-distance 5-star hotels like the Makkah Clock Royal Tower saves valuable prayer time. Always stay hydrated and keep digital copies of your travel documents.</p>`,
        featuredImage: 'https://antiquewhite-stinkbug-399384.hostingersite.com/wp-content/uploads/2026/05/Umrah_packages_202605092201.jpeg',
        category: 'Umrah Guide',
        authorName: 'King Travel Editorial',
        isPublished: true,
      },
      {
        title: 'How to Apply for a Saudi Tourist & Umrah eVisa from Canada',
        slug: 'how-to-apply-saudi-tourist-umrah-evisa-canada',
        excerpt: 'Everything Canadian citizens and PR holders need to know about Saudi eVisa requirements, processing times, and eligibility rules in 2026.',
        content: `<h2>Understanding Saudi Visa Options for Canadian Travelers</h2><p>With Saudi Arabia's Vision 2030 modernization, visiting the Kingdom for Umrah, business, or tourism has never been faster or more accessible for Canadian travelers.</p><h3>Eligibility & Visa Types</h3><ul><li><strong>Tourist eVisa (Multiple Entry - 1 Year):</strong> Valid for 365 days, allowing up to 90 days per stay. Canadian passport holders are eligible for instant online approval.</li><li><strong>Umrah Specific Visa:</strong> Provides additional pilgrim protections, transport access, and zamzam water export permissions.</li><li><strong>Transit / Stopover Visa:</strong> Free 96-hour visa when flying Saudia or Flynas with a stopover in Jeddah or Riyadh.</li></ul><h3>Required Documents for Canadians</h3><ol><li>Valid Canadian passport with at least 6 months validity from entry date.</li><li>Recent digital passport-style photograph with white background.</li><li>Confirmed return flight itinerary and hotel accommodation booking.</li><li>Mandatory medical insurance covering hospital treatment in Saudi Arabia.</li></ol><p>Need expert assistance? Contact King Travel Canada's authorized visa desk at Mississauga for seamless verification and express submissions.</p>`,
        featuredImage: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1200&q=80',
        category: 'Saudi Visa',
        authorName: 'Visa Specialist Team',
        isPublished: true,
      },
      {
        title: 'Top 7 Best 5-Star Luxury Hotels Near Haram in Makkah & Madinah',
        slug: 'top-7-luxury-hotels-near-haram-makkah-madinah',
        excerpt: 'Discover the premier 5-star accommodations offering direct courtyard access, Kaaba views, and world-class hospitality during your pilgrimage.',
        content: `<h2>Choosing the Right Accommodation for Your Spiritual Journey</h2><p>Minimizing transit fatigue and staying steps away from the Grand Mosque allows pilgrims to spend maximum time in Ibadah. Here are the top rated 5-star hotels trusted by King Travel pilgrims.</p><h3>Best Hotels in Makkah (Clock Tower & Abraj Al Bait)</h3><ul><li><strong>Makkah Clock Royal Tower (Fairmont):</strong> Unrivaled panoramic views of the Holy Kaaba with direct elevator access to the Haram courtyard.</li><li><strong>Swissôtel Makkah:</strong> Elegant rooms with dedicated prayer halls connected directly to the King Abdulaziz Gate entrance.</li><li><strong>Pullman Zamzam Makkah:</strong> Highly popular among Canadian families offering spacious multi-bedroom suites and fine international dining.</li><li><strong>Jabal Omar Hyatt Regency:</strong> Located just steps from the western courtyard with ultra-modern amenities and seamless accessibility.</li></ul><h3>Best Hotels in Madinah (Near Prophet's Mosque)</h3><ul><li><strong>The Oberoi Madinah:</strong> Legendary hospitality situated right at the women's and men's main entrances to the Prophet's Mosque.</li><li><strong>Dar Al Taqwa Hotel:</strong> Steps away from the King Fahad gate, ideal for older pilgrims seeking easy access.</li><li><strong>Anwar Al Madinah Mövenpick:</strong> The largest hotel in Madinah directly linked to the shopping mall and northern courtyard.</li></ul>`,
        featuredImage: 'https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&w=1200&q=80',
        category: 'Travel Tips',
        authorName: 'King Travel Editorial',
        isPublished: true,
      },
      {
        title: 'Essential Packing Checklist for Hajj & Umrah: What to Bring from Canada',
        slug: 'essential-packing-checklist-hajj-umrah-canada',
        excerpt: 'A comprehensive checklist covering Ihram garments, footwear, medical supplies, electronics, and prayer essentials tailored for Canadian pilgrims.',
        content: `<h2>Packing Smart for Your Spiritual Pilgrimage</h2><p>Preparing luggage for high-temperature climates while keeping baggage light and portable is crucial for smooth transit between Jeddah, Makkah, and Madinah.</p><h3>1. Spiritual & Worship Essentials</h3><ul><li>Two sets of seamless white Ihram towels (Men) and safety pins / Ihram belt.</li><li>Pocket prayer mat and digital Tasbeeh counter.</li><li>Pocket-sized Dua book and Quran with English translation.</li><li>Small drawstring bag for footwear during prayer visits.</li></ul><h3>2. Clothing & Footwear</h3><ul><li>Lightweight, moisture-wicking breathable cotton clothes.</li><li>Supportive, broken-in walking sandals (unstitched over ankles for men during Ihram).</li><li>Thick cushioned socks for walking on hot marble courtyards outside prayer times.</li></ul><h3>3. Health, Toiletries & Hygiene (Fragrance-Free)</h3><ul><li>Unscented soap, shampoo, and sunscreen (essential during Ihram).</li><li>Hydration electrolyte powders (Gatorade/Liquid I.V.) to combat desert heat.</li><li>Personal first-aid kit: pain relievers, blister plasters, throat lozenges, and personal prescription medications.</li></ul><h3>4. Electronics & Travel Adapters</h3><ul><li>Universal UK/Saudi Type G power plug adapter.</li><li>High-capacity portable power bank (10,000 to 20,000 mAh).</li><li>Unlocked smartphone for local Saudi SIM card (STC, Mobily, or Zain).</li></ul>`,
        featuredImage: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1200&q=80',
        category: 'Pilgrimage Guide',
        authorName: 'King Travel Editorial',
        isPublished: true,
      },
      {
        title: 'Understanding the Nusuk App: How to Book Umrah Permits & Rawdah Slots',
        slug: 'understanding-nusuk-app-book-umrah-permits-rawdah-slots',
        excerpt: 'A complete walkthrough on downloading, registering, and reserving official prayer and Ziyarah permits on the Saudi government Nusuk platform.',
        content: `<h2>The Official Gate to the Two Holy Mosques</h2><p>The <strong>Nusuk platform</strong> is the official digital portal managed by the Saudi Ministry of Hajj and Umrah. Every international visitor must utilize Nusuk to schedule their Rawdah Shareef prayers and Umrah permits.</p><h3>Step 1: Download & Registration</h3><p>Download the official Nusuk application from Apple App Store or Google Play Store. Select <em>'Visitor'</em> and enter your Visa Number, Passport Number, Nationality, and Date of Birth.</p><h3>Step 2: Reserving Rawdah Shareef (Noble Garden)</h3><p>Due to high spiritual demand, permits for praying in the Rawdah in Al-Masjid an-Nabawi are regulated:</p><ol><li>Open Nusuk &gt; Select <em>'Praying in the Noble Rawdah'</em>.</li><li>Choose gender (Men or Women separate time slots).</li><li>Select your preferred date and available 30-minute time slot.</li><li>Confirm booking and save the generated QR code permit on your mobile device.</li></ol><p><em>Pro Tip:</em> New slots are frequently released on Fridays around 12:00 PM Saudi time. Book your slot as soon as your visa is issued!</p>`,
        featuredImage: 'https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?auto=format&fit=crop&w=1200&q=80',
        category: 'Hajj Tips',
        authorName: 'King Travel Tech Team',
        isPublished: true,
      },
      {
        title: 'Historical Ziyarah Sites in Makkah and Madinah Every Pilgrim Should Visit',
        slug: 'historical-ziyarah-sites-makkah-madinah-every-pilgrim-should-visit',
        excerpt: 'Explore the momentous sacred landmarks of Islamic history, from Cave Hira and Mount Arafat to Masjid Quba and Mount Uhud.',
        content: `<h2>Walking in the Footsteps of the Prophet (PBUH)</h2><p>Beyond the primary rituals of Umrah, taking time to visit historical Islamic landmarks (Ziyarah) enriches your pilgrimage with deep spiritual reflection and historical connection.</p><h3>Key Sacred Sites in Makkah Mukarramah</h3><ul><li><strong>Jabal al-Nour (Cave Hira):</strong> The mountain where the first revelation of the Holy Quran was received through Angel Jibreel (AS).</li><li><strong>Mount Arafat & Jabal al-Rahmah:</strong> The mount of mercy, the central station of the Hajj pilgrimage where the Prophet (PBUH) delivered his Farewell Sermon.</li><li><strong>Cave Thawr:</strong> The mountain refuge where the Prophet (PBUH) and Abu Bakr (RA) took sanctuary during the historic Hijrah to Madinah.</li><li><strong>Masjid al-Jinn:</strong> The historic mosque marking where a group of Jinn gathered to listen to the recitation of the Holy Quran and embraced Islam.</li></ul><h3>Key Sacred Sites in Madinah Munawwarah</h3><ul><li><strong>Masjid Quba:</strong> The very first mosque built in Islamic history. Performing two Rakat in Masjid Quba carries the reward of an Umrah.</li><li><strong>Masjid al-Qiblatayn:</strong> The historic mosque with two Qiblas, commemorating the divine command to change the prayer direction towards Makkah.</li><li><strong>Mount Uhud & Martyrs' Cemetery:</strong> The site of the historic Battle of Uhud and resting place of Sayyidna Hamza (RA) and the beloved companions.</li><li><strong>The Seven Mosques (Khandaq):</strong> The location of the Battle of the Trench (Ghazwa al-Ahzab).</li></ul><p>All King Travel Canada luxury packages include guided private air-conditioned VIP Ziyarah tours with knowledgeable English- and Urdu-speaking guides.</p>`,
        featuredImage: 'https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&w=1200&q=80',
        category: 'Spiritual Journey',
        authorName: 'King Travel Editorial',
        isPublished: true,
      }
    ];

    for (const blog of DEFAULT_BLOGS) {
      if (!existingSlugs.has(blog.slug)) {
        await db.insert(blogPosts).values({
          ...blog,
          publishedAt: new Date(),
          seoSettings: {
            metaTitle: `${blog.title} | King Travel Canada`,
            metaDescription: blog.excerpt,
            ogTitle: blog.title,
            ogDescription: blog.excerpt,
            ogImageUrl: blog.featuredImage,
            canonicalUrl: `/blogs/${blog.slug}`,
            keywords: `${blog.category}, Hajj, Umrah, King Travel Canada, Canadian Pilgrims`,
          }
        });
      }
    }

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
            .select()
            .from(blogPosts)
            .where(eq(blogPosts.isPublished, true))
            .orderBy(desc(blogPosts.createdAt));
          return await sortWithOrderedIds(rows);
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

// ─── UPDATE BLOG ORDER ─────────────────────────────────────────────────────
export async function updateBlogOrderAction(orderedIds: number[]) {
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
    revalidateTag('blogs', 'max');
    return { success: true };
  } catch (err: any) {
    console.warn('updateBlogOrderAction error:', err);
    revalidatePath('/blogs');
    revalidatePath('/admin/blogs');
    revalidateTag('blogs', 'max');
    return { success: true };
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
          .where(eq(blogPosts.slug, slug))
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
  const {
    id,
    title,
    slug,
    excerpt,
    content,
    featuredImage,
    category = 'Pilgrimage Guide',
    authorName = 'King Travel Editorial',
    isPublished = true,
    publishedAt,
  } = data;

  let parsedPublishedAt: Date | null = null;
  if (publishedAt && publishedAt.trim() !== '') {
    const d = new Date(publishedAt);
    if (!isNaN(d.getTime())) {
      parsedPublishedAt = d;
    }
  }

  try {
    if (id) {
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
      if (parsedPublishedAt) updateData.publishedAt = parsedPublishedAt;

      await db.update(blogPosts).set(updateData).where(eq(blogPosts.id, id));

      // Log Activity
      await logAdminActivityAction({
        type: 'pages',
        action: 'Updated Blog Post',
        details: `Article: "${title}" (${category})`,
      });

      revalidatePath('/blogs');
      revalidatePath(`/blogs/${slug}`);
      revalidatePath('/admin/blogs');
      revalidateTag('blogs', 'max');
      revalidateTag(`blog-${slug}`, 'max');
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
      };
      if (parsedPublishedAt) insertData.publishedAt = parsedPublishedAt;

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
      revalidateTag('blogs', 'max');
      revalidateTag(`blog-${slug}`, 'max');
      return { success: true, blogId: savedId };
    }
  } catch (err: any) {
    console.error('saveBlogAction error:', err);
    return { success: false, error: err.message || 'Failed to save blog post' };
  }
}

// ─── DELETE BLOG ───────────────────────────────────────────────────────────
export async function deleteBlogAction(id: number) {
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
    revalidateTag('blogs', 'max');
    return { success: true };
  } catch (err: any) {
    console.error('deleteBlogAction DB error:', err);
    return { success: false, error: err.message || 'Failed to delete blog' };
  }
}

// ─── BLOG SEO — SAVE ───────────────────────────────────────────────────────
export async function saveBlogSeoAction(blogId: number, seoData: any) {
  try {
    await db.update(blogPosts).set({
      seoSettings: seoData,
      updatedAt: new Date(),
    }).where(eq(blogPosts.id, blogId));
    
    revalidatePath('/admin/blogs');
    revalidateTag('blogs', 'max');
    revalidateTag(`blog-seo-${blogId}`, 'max');
    return { success: true };
  } catch (err: any) {
    console.error('saveBlogSeoAction error:', err);
    return { success: false, error: err.message || 'Failed to save SEO settings' };
  }
}

// ─── BLOG SEO — GET ────────────────────────────────────────────────────────
export async function getBlogSeoAction(blogId: number) {
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
        return rows.filter((b) => b.slug !== excludeSlug).slice(0, limit);
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
