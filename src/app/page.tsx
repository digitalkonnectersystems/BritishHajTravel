import type { Metadata } from "next";
import PageSectionsRenderer from "@/components/PageSectionsRenderer";
import { getPageBySlug } from "@/actions/pageActions";
import { getLatestBlogs } from "@/actions/blogActions";
import { getPublishedVisaProcessingCards } from "@/actions/visaProcessingActions";
import { getSoldOutPackages } from "@/actions/packageActions";
import { buildPageMetadata } from "@/lib/seoMetadata";

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getPageBySlug('/').catch(() => null);
  return buildPageMetadata(pageData || { title: 'Home', slug: '/' }, '/');
}

export default async function Home() {
  const [pageData, blogs, publishedVisaCards, saudiVisaPage] = await Promise.all([
    getPageBySlug("/"),
    getLatestBlogs(3),
    getPublishedVisaProcessingCards(),
    getPageBySlug("/saudi-visa"),
  ]);

  let dynamicSections: any[] = [];
  if (pageData?.sections) {
    try {
      const parsed =
        typeof pageData.sections === "string"
          ? JSON.parse(pageData.sections)
          : pageData.sections;
      if (Array.isArray(parsed) && parsed.length > 0) {
        dynamicSections = parsed;
      }
    } catch {}
  }

  const hasSoldOut = dynamicSections.some((sec: any) => sec?.type === "Sold Out Packages");
  const soldOutPackages = hasSoldOut ? await getSoldOutPackages() : [];

  return (
    <main>
      {/* ================= DYNAMIC SECTIONS ================= */}
      <PageSectionsRenderer
        sections={dynamicSections}
        pageData={pageData}
        initialBlogData={blogs}
        publishedVisaCards={publishedVisaCards}
        publishedSitePaths={saudiVisaPage?.status === "published" ? ["/saudi-visa"] : []}
        initialPackageData={{ soldOut: hasSoldOut ? soldOutPackages : undefined }}
      />
    </main>
  );
}
