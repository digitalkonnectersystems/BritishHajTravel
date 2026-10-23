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
        badgeDuration: cd.duration || `${pkg.durationDays || 14} Days`,
        title: pkg.title,
        heroImage:
          cd.bannerImage ||
          pkg.featuredImage ||
          "/uploads/sections/hajj_1.jpg",
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

  const cards = liveCards;

  return (
    <main>
      <style dangerouslySetInnerHTML={{ __html: 'body { background-color: #fffff !important; }' }} />
      <PageBanner
        title={pageData?.bannerTitle || "Luxury <span>Hajj Packages 2027</span>"}
        description={pageData?.bannerDescription || "Luxury Hajj 2027 Packages with 5-Star Hotels, VIP Services & Complete Spiritual Guidance."}
        bgImage={pageData?.bannerBgImage}
        position={pageData?.bannerPosition}
        size={pageData?.bannerSize}
        heroSettings={pageData?.seoSettings}
        fallbackBgImage="/images_BHT/packages/hajj-2026-4-1789469937874.webp"
        localOnly
      />

      {pageSections.length > 0 ? (
        <PageSectionsRenderer sections={pageSections} pageData={pageData} initialPackageData={{ hajj: liveCards.length > 0 ? hajjPackages : undefined }} />
      ) : (
        <><HajjPackagesSection data={{}} initialPackages={cards} /><PackageCustomizationCTA journey="hajj" /></>
      )}
    </main>
  );
}
