import { getPageBySlug } from "@/actions/pageActions";
import { getAllPackages } from "@/actions/packageActions";
import HajjPackagesPageClient from "./HajjPackagesPageClient";
import { buildPageMetadata } from "@/lib/seoMetadata";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getPageBySlug("/hajj-packages").catch(() => null);
  return buildPageMetadata(pageData || { title: "Hajj Packages" }, "/hajj-packages");
}

export default async function HajjPackagesPage() {
  const pageData = await getPageBySlug("/hajj-packages").catch(() => null);
  const packages = await getAllPackages().catch(() => []);
  const hajjPackages = packages.filter((p: any) => p.type === 'hajj' && p.status === 'available');

  return <HajjPackagesPageClient initialPageData={pageData} packages={hajjPackages} />;
}
