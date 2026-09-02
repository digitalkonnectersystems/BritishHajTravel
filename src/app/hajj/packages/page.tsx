import { getPageBySlug } from "@/actions/pageActions";
import { getAllPackages } from "@/actions/packageActions";
import HajjPackagesPageClient from "./HajjPackagesPageClient";

export default async function HajjPackagesPage() {
  const pageData = await getPageBySlug("/hajj-packages").catch(() => null);
  const packages = await getAllPackages().catch(() => []);
  const hajjPackages = packages.filter((p: any) => p.type === 'hajj' && p.status === 'available');

  return <HajjPackagesPageClient initialPageData={pageData} packages={hajjPackages} />;
}
