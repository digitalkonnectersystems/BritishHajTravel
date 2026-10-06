import { getPageBySlug } from "@/actions/pageActions";
import { getAllPackages } from "@/actions/packageActions";
import UmrahPackagesPageClient from "./UmrahPackagesPageClient";
import { buildPageMetadata } from "@/lib/seoMetadata";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getPageBySlug("/umrah-packages").catch(() => null);
  return buildPageMetadata(pageData || { title: "Umrah Packages" }, "/umrah-packages");
}

export default async function UmrahPackagesPage() {
  const pageData = await getPageBySlug("/umrah-packages").catch(() => null);
  const packages = await getAllPackages().catch(() => []);
  const umrahPackages = packages.filter((p: any) => p.type === 'umrah' && p.status === 'available');

  return <UmrahPackagesPageClient initialPageData={pageData} packages={umrahPackages} />;
}
