import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getGuidesList, getPageBySlug } from "@/actions/pageActions";
import { getPackagesByType } from "@/actions/packageActions";
import PageBanner from "@/components/PageBanner";
import PageSeoHead from "@/components/PageSeoHead";
import PageSectionsRenderer from "@/components/PageSectionsRenderer";
import { getPackageDetailsAction, getPageSeoAction } from "@/actions/pageActions";
import { getPackageBySlug } from "@/actions/packageActions";
import PackageDetailPageClient from "@/app/package/[slug]/PackageDetailPageClient";
import { getBlogBySlug, getBlogSeoAction } from "@/actions/blogActions";
import BlogDetailPage from "@/components/BlogDetailPage";


const BLOG_FALLBACK_THUMB = 'https://antiquewhite-stinkbug-399384.hostingersite.com/wp-content/uploads/2026/05/Umrah_packages_202605092201.jpeg';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const { slug = [] } = await params;
  if (slug.length !== 1) return {};

  const blog = await getBlogBySlug(slug[0]).catch(() => null);
  if (!blog || !blog.isPublished) return {};

  const seoData: any = blog.id ? await getBlogSeoAction(blog.id).catch(() => null) : null;
  const metaTitle = seoData?.metaTitle || `${blog.title} | British Hajj Travel UK`;
  const metaDesc = seoData?.metaDescription || blog.excerpt || `Read ${blog.title} on British Hajj Travel UK blog.`;
  const ogImage = seoData?.ogImageUrl || blog.featuredImage || BLOG_FALLBACK_THUMB;

  return {
    title: metaTitle,
    description: metaDesc,
    alternates: { canonical: `/${slug[0]}` },
    openGraph: {
      title: metaTitle,
      description: metaDesc,
      url: `/${slug[0]}`,
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

export default async function DynamicPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug = [] } = await params;
  const slugPath = `/${slug.join("/")}`;
  const page = await getPageBySlug(slugPath);

  if (!page || page.status === "draft") {
    if (slug.length === 1) {
      // Root-level blog URL, e.g. /nusuk-hajj-2027
      const blog = await getBlogBySlug(slug[0]).catch(() => null);
      if (blog?.isPublished) {
        return <BlogDetailPage blog={blog} slug={slug[0]} />;
      }

      // Fallback: check if the slug matches a package
      const packageData = await getPackageBySlug(slug[0]).catch(() => null);
      if (packageData) {
        const seoData = packageData.id
          ? await getPageSeoAction(`pkg_${packageData.id}`).catch(() => null)
          : null;
        return (
          <PackageDetailPageClient
            initialSlug={slug[0]}
            initialPackage={packageData}
            initialSeo={seoData}
          />
        );
      }
    }
    notFound();
  }

  let sections: any[] = [];
  if (page.sections) {
    try {
      sections =
        typeof page.sections === "string"
          ? JSON.parse(page.sections)
          : page.sections;
    } catch {
      sections = [];
    }
  }

  // Only preload package data when this page actually renders package sections.
  // This avoids extra DB work on ordinary CMS pages while removing the
  // post-hydration package fetch/skeleton on package-heavy pages.
  const hasSoldOut = sections.some((sec: any) => sec?.type === "Sold Out Packages");
  const needsUmrah = hasSoldOut || sections.some((sec: any) =>
    ["Upcoming Umrah Packages", "Umrah Packages", "Umrah Packages Grid"].includes(sec?.type)
  );
  const needsHajj = hasSoldOut || sections.some((sec: any) =>
    ["Hajj Packages", "Packages Grid"].includes(sec?.type)
  );
  const isGalleryPage = sections.some((sec: any) => sec?.type === "Gallery");
  const guideCategories = Array.from(new Set(sections.map((sec: any) => sec?.type === "Guide" ? sec.data?.guideCategory : null).filter(Boolean)));
  const initialGuideData = guideCategories.length > 0
    ? (await Promise.all(guideCategories.map((category) => getGuidesList(category, false)))).flat()
    : [];

  const [umrahPackages, hajjPackages] = await Promise.all([
    needsUmrah ? getPackagesByType("umrah") : Promise.resolve([]),
    needsHajj ? getPackagesByType("hajj") : Promise.resolve([]),
  ]);

  const isFlightBooking = slug.join("/") === "airline-tickets-booking";

  return (
    <main className={`${isFlightBooking ? "bg-blue-lt" : "bg-white"} min-h-screen`}>
      <PageSeoHead pageTitle={page.title} seoData={page.seoData} />

      <PageBanner
        title={isGalleryPage ? page.title : (page.bannerTitle || page.title)}
        description={page.bannerDescription || ""}
        bgImage={page.bannerBgImage || undefined}
        position={page.bannerPosition || undefined}
        size={page.bannerSize || undefined}
        heroSettings={page.seoSettings}
        fallbackBgImage={slugPath === "/hajj-packages" ? "/images_BHT/packages/hajj-2026-4-1789469937874.webp" : undefined}
        localOnly={slugPath === "/hajj-packages"}
      />

      {sections.length > 0 ? (
        <div className="w-full mx-auto">
          <PageSectionsRenderer
            sections={sections}
            pageData={page}
            initialPackageData={{
              umrah: needsUmrah ? umrahPackages : undefined,
              hajj: needsHajj ? hajjPackages : undefined,
              all: hasSoldOut ? [...umrahPackages, ...hajjPackages] : undefined,
            }}
            initialGuideData={initialGuideData}
          />
        </div>
      ) : page.richText ? (
        <div className="w-full max-w-4xl mx-auto px-4 py-12 prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: page.richText }} />
        </div>
      ) : (
        <div className="w-full max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-xl font-bold text-slate-700">{page.title}</h2>
          <p className="text-green mt-2">Content coming soon.</p>
        </div>
      )}
    </main>
  );
}
