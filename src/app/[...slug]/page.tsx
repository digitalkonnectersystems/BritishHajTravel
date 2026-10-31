import { notFound, redirect, permanentRedirect } from "next/navigation";
import { lookupRedirect, recordNotFound } from "@/actions/redirectActions";
import type { Metadata } from "next";
import { getPageBySlug } from "@/actions/pageActions";
import PageBanner from "@/components/PageBanner";
import PageSectionsRenderer from "@/components/PageSectionsRenderer";
import AboutPageClient from '@/app/about/AboutPageClient';
import { loadCmsSectionContext } from '@/lib/cmsSectionContext';
import RelatedUmrahPackages from "@/components/seasonal/RelatedUmrahPackages";
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
  if (slugPath === '/about') return {};

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
  if (slugPath === "/about") notFound();
  const showRelatedUmrahPackages = [
    "/ramadan-umrah-packages",
    "/october-umrah-packages",
    "/december-umrah-packages",
    "/umrah-guide",
  ].includes(slugPath);
  const page = await getPageBySlug(slugPath);

  if (page?.status === 'draft') notFound();

  if (!page) {
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
    try {
      const rule = await lookupRedirect(slugPath);
      if (rule) {
        if (rule.httpCode === 308) permanentRedirect(rule.destinationPath);
        redirect(rule.destinationPath);
      }
    } catch (error: any) {
      // NEXT_REDIRECT is a framework control-flow exception, not a database failure.
      if (String(error?.digest || '').startsWith('NEXT_REDIRECT')) throw error;
      console.error('Redirect lookup failed', error);
    }
    // Do not count an unpublished/draft page as an ordinary missing URL.
    if (!page) await recordNotFound(slugPath);
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

  const sectionContext = await loadCmsSectionContext(sections);
  const isGalleryPage = sections.some((sec: any) => sec?.type === 'Gallery');
  if (slugPath === '/about-umrah') {
    return <AboutPageClient initialPageData={page} sectionContext={sectionContext} />;
  }

  const isFlightBooking = slug.join("/") === "airline-tickets-booking";

  const pageSeo = parseSeoSettings(page.seoData || page.seoSettings);
  let pageJsonLd = '';
  if (pageSeo.jsonLdPayload) {
    try {
      const raw = typeof pageSeo.jsonLdPayload === 'string'
        ? pageSeo.jsonLdPayload
        : JSON.stringify(pageSeo.jsonLdPayload);
      const withoutScriptWrapper = raw.trim().replace(/^<script\b[^>]*>/i, '').replace(/<\/script>\s*$/i, '').trim();
      const parsed = JSON.parse(withoutScriptWrapper);
      if (parsed && typeof parsed === 'object') {
        pageJsonLd = JSON.stringify(parsed).replace(/</g, '\\u003c');
      }
    } catch {
      // Invalid JSON-LD must not render as a script or break the page.
    }
  }

  return (
    <main className={`${isFlightBooking ? "bg-blue-lt" : "bg-white"} min-h-screen`}>
      {pageJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: pageJsonLd }} />
      )}
      <PageBanner
        title={isGalleryPage ? page.title : (page.bannerTitle || page.title)}
        description={page.bannerDescription || ""}
        bgImage={page.bannerBgImage || undefined}
        position={page.bannerPosition || undefined}
        size={page.bannerSize || undefined}
        heroSettings={page.seoSettings}
      />

      {sections.length > 0 ? (
        <div className="w-full mx-auto">
          <PageSectionsRenderer
            sections={sections}
            pageData={page}
            {...sectionContext}
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
      {showRelatedUmrahPackages && <RelatedUmrahPackages currentPath={slugPath} />}
    </main>
  );
}
