import { notFound } from 'next/navigation';
import Link from "next/link";
import Image from "next/image";
import { getPackagesByType } from "@/actions/packageActions";
import { getPageBySlug } from "@/actions/pageActions";
import PageSectionsRenderer from "@/components/PageSectionsRenderer";
import HajjPackagesSection from "@/components/HajjPackagesSection";
import PackageCustomizationCTA from "@/components/PackageCustomizationCTA";
import PageBanner from "@/components/PageBanner";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seoMetadata";

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getPageBySlug("/hajj-packages").catch(() => null);
  return buildPageMetadata(pageData || { title: "Hajj Packages" }, "/hajj-packages");
}

// Public package cards must come from the database. Do not render fabricated offers
// when the database is empty or unavailable.
export default async function HajjPackagesPage() {
  let liveCards: any[] = [];
  let pageData: any = null;
  let pageSections: any[] = [];
  let hajjPackages: any[] = [];

  try {
    hajjPackages = await getPackagesByType("hajj");

    liveCards = hajjPackages.map((pkg: any) => {
      const cd = pkg.cardData || {};
      return {
        badgeDuration: cd.duration || (pkg.durationDays ? `${pkg.durationDays} Days` : ""),
        title: pkg.title,
        heroImage:
          cd.bannerImage ||
          pkg.featuredImage ||
          "",
        makkahHotel: cd.makkahHotel || null,
        madinahHotel: cd.madinahHotel || null,
        price: pkg.startingPrice
          ? Number(pkg.startingPrice).toLocaleString("en-CA", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })
          : "",
        btnLink: cd.btnLink || `/package/${pkg.slug}`,
      };
    });
  } catch (err) {
    console.error("Failed to load Hajj packages:", err);
  }

  try {
    pageData = await getPageBySlug("/hajj-packages");
    if (pageData && pageData.sections) {
      pageSections = typeof pageData.sections === "string" ? JSON.parse(pageData.sections) : pageData.sections;
    }
  } catch (err) {
    console.error("Failed to load CMS page data:", err);
  }

  if (pageData?.status === 'draft') notFound();
  const cards = liveCards;

  return (
    <main>
      <style dangerouslySetInnerHTML={{ __html: 'body { background-color: #fffff !important; }' }} />
      <PageBanner
        title={pageData?.bannerTitle || pageData?.title || ""}
        description={pageData?.bannerDescription || ""}
        bgImage={pageData?.bannerBgImage}
        position={pageData?.bannerPosition}
        size={pageData?.bannerSize}
        heroSettings={pageData?.seoSettings}
      />

      {pageSections.length > 0 ? (
        <PageSectionsRenderer sections={pageSections} pageData={pageData} initialPackageData={{ hajj: liveCards.length > 0 ? hajjPackages : undefined }} />
      ) : (
        <><HajjPackagesSection data={{}} initialPackages={cards} /><PackageCustomizationCTA journey="hajj" /></>
      )}
    </main>
  );
}
