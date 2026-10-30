import { notFound } from 'next/navigation';
import { getPageBySlug } from "@/actions/pageActions";
import { getPackagesByType } from "@/actions/packageActions";
import { isPackageCardVisible } from "@/lib/packageCardVisibility";
import UmrahPackagesPageClient from "./UmrahPackagesPageClient";
import { buildPageMetadata } from "@/lib/seoMetadata";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getPageBySlug("/umrah-packages").catch(() => null);
  if (pageData?.status === 'draft') notFound();
  return buildPageMetadata(pageData || { title: "Umrah Packages" }, "/umrah-packages");
}

export default async function UmrahPackagesPage() {
  const pageData = await getPageBySlug("/umrah-packages").catch(() => null);
  if (pageData?.status === 'draft') notFound();
  const packages = await getPackagesByType("umrah").catch(() => []);
  const umrahPackages = packages.filter((p: any) => p.type === 'umrah' && p.status === 'available' && isPackageCardVisible(p));

  return <UmrahPackagesPageClient initialPageData={pageData} packages={umrahPackages} />;
}
