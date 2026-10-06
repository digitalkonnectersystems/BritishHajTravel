import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getGuidesList, getPageBySlug } from "@/actions/pageActions";
import { getPackagesByType } from "@/actions/packageActions";
import PageBanner from "@/components/PageBanner";
import PageSectionsRenderer from "@/components/PageSectionsRenderer";
import { getPackageBySlug } from "@/actions/packageActions";
import PackageDetailPageClient from "@/app/package/[slug]/PackageDetailPageClient";
import { getBlogBySlug } from "@/actions/blogActions";
import BlogDetailPage from "@/components/BlogDetailPage";
import { buildBlogMetadata, buildPackageMetadata, buildPageMetadata, parseSeoSettings } from "@/lib/seoMetadata";


export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const { slug = [] } = await params;
  const slugPath = `/${slug.join('/')}`;

  const page = await getPageBySlug(slugPath).catch(() => null);
  if (page && page.status !== 'draft') {
    return buildPageMetadata(page, slugPath);
  }

  if (slug.length === 1) {
    const blog = await getBlogBySlug(slug[0]).catch(() => null);
    if (blog?.isPublished) return buildBlogMetadata(blog, slug[0]);

    const packageData = await getPackageBySlug(slug[0]).catch(() => null);
    if (packageData && packageData.status !== 'draft') return buildPackageMetadata(packageData, slug[0]);
  }

  return {};
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
        return (
          <PackageDetailPageClient
            initialSlug={slug[0]}
            initialPackage={packageData}
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

  const pageSeo = parseSeoSettings(page.seoData || page.seoSettings);
  let pageJsonLd = '';
  if (pageSeo.jsonLdPayload) {
    pageJsonLd = typeof pageSeo.jsonLdPayload === 'string'
      ? pageSeo.jsonLdPayload
      : JSON.stringify(pageSeo.jsonLdPayload);
  }

  return (
    <main className={`${isFlightBooking ? "bg-blue-lt" : "bg-white"} min-h-screen`}>
      {pageJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: pageJsonLd.replace(/</g, '\\u003c') }} />
      )}
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
