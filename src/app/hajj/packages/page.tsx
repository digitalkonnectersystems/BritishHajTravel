import { notFound } from 'next/navigation';
import { getPageBySlug } from "@/actions/pageActions";
import { getPackagesByType } from "@/actions/packageActions";
import { isPackageCardVisible } from "@/lib/packageCardVisibility";
import HajjPackagesPageClient from "./HajjPackagesPageClient";
import { buildPageMetadata } from "@/lib/seoMetadata";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getPageBySlug("/hajj-packages").catch(() => null);
  return buildPageMetadata(pageData || { title: "Hajj Packages" }, "/hajj-packages");
}

export default async function HajjPackagesPage() {
  const pageData = await getPageBySlug("/hajj-packages").catch(() => null);
  if (pageData?.status === 'draft') notFound();
  const packages = await getPackagesByType("hajj").catch(() => []);
  const hajjPackages = packages.filter((p: any) => p.type === 'hajj' && p.status === 'available' && isPackageCardVisible(p));

  return <HajjPackagesPageClient initialPageData={pageData} packages={hajjPackages} />;
}
