import { getPageBySlug } from "@/actions/pageActions";
import { getAllPackages } from "@/actions/packageActions";
import UmrahPackagesPageClient from "./UmrahPackagesPageClient";

export default async function UmrahPackagesPage() {
  const pageData = await getPageBySlug("/umrah-packages").catch(() => null);
  const packages = await getAllPackages().catch(() => []);
  const umrahPackages = packages.filter((p: any) => p.type === 'umrah' && p.status === 'available');

  return <UmrahPackagesPageClient initialPageData={pageData} packages={umrahPackages} />;
}
