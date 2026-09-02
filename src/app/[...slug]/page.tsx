import { notFound } from "next/navigation";
import { getPageBySlug } from "@/actions/pageActions";
import { getPackagesByType } from "@/actions/packageActions";
import PageBanner from "@/components/PageBanner";
import PageSeoHead from "@/components/PageSeoHead";
import PageSectionsRenderer from "@/components/PageSectionsRenderer";
import { getPackageDetailsAction, getPageSeoAction } from "@/actions/pageActions";
import { getPackageBySlug } from "@/actions/packageActions";
import PackageDetailPageClient from "@/app/package/[slug]/PackageDetailPageClient";

export default async function DynamicPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug = [] } = await params;
  const slugPath = `/${slug.join("/")}`;
  const page = await getPageBySlug(slugPath);

  if (!page || page.status === "draft") {
    // Fallback: check if the slug matches a package
    if (slug.length === 1) {
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

  const [umrahPackages, hajjPackages] = await Promise.all([
    needsUmrah ? getPackagesByType("umrah") : Promise.resolve([]),
    needsHajj ? getPackagesByType("hajj") : Promise.resolve([]),
  ]);

  const isFlightBooking = slug.join("/") === "airline-tickets-booking";

  return (
    <main className={`${isFlightBooking ? "bg-sage" : "bg-white"} min-h-screen`}>
      <PageSeoHead pageTitle={page.title} seoData={page.seoData} />

      <PageBanner
        title={page.bannerTitle || page.title}
        description={page.bannerDescription || ""}
        bgImage={page.bannerBgImage || undefined}
        position={page.bannerPosition || undefined}
        size={page.bannerSize || undefined}
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
