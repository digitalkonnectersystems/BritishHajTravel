import type { Metadata } from "next";
import PageSectionsRenderer from "@/components/PageSectionsRenderer";
import { getFooterData, getPageBySlug } from "@/actions/pageActions";
import { getPublishedVisaProcessingCards } from "@/actions/visaProcessingActions";
import { loadCmsSectionContext } from "@/lib/cmsSectionContext";
import { buildPageMetadata } from "@/lib/seoMetadata";
import { getOrganizationJsonLd } from "@/lib/jsonLd";

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getPageBySlug('/').catch(() => null);
  return buildPageMetadata(pageData || { title: 'Home', slug: '/' }, '/');
}

export default async function Home() {
  const [pageData, publishedVisaCards, saudiVisaPage, footerData] = await Promise.all([
    getPageBySlug("/"),
    getPublishedVisaProcessingCards(),
    getPageBySlug("/saudi-visa"),
    getFooterData(),
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

  const sectionContext = await loadCmsSectionContext(dynamicSections);
  const organizationJsonLd = JSON.stringify(getOrganizationJsonLd()).replace(/</g, '\\u003c');

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: organizationJsonLd }}
      />
      {/* ================= DYNAMIC SECTIONS ================= */}
      <PageSectionsRenderer
        sections={dynamicSections}
        pageData={pageData}
        {...sectionContext}
        publishedVisaCards={publishedVisaCards}
        socialLinks={Array.isArray(footerData?.socialLinks) ? footerData.socialLinks : []}
        publishedSitePaths={saudiVisaPage?.status === "published" ? ["/saudi-visa"] : []}

      />
    </main>
  );
}
