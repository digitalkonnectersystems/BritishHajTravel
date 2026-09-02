import PageSectionsRenderer from "@/components/PageSectionsRenderer";
import { getPageBySlug } from "@/actions/pageActions";
import PageSeoHead from "@/components/PageSeoHead";

export default async function Home() {
  const pageData = await getPageBySlug("/");

  const homeSeo = pageData?.seoData || null;

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

  return (
    <main>
      <PageSeoHead pageTitle="Home" seoData={homeSeo} />
      {/* ================= DYNAMIC SECTIONS ================= */}
      <PageSectionsRenderer sections={dynamicSections} pageData={pageData} />
    </main>
  );
}
