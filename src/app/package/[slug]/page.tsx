import { getPackageDetailsAction, getPageSeoAction } from "@/actions/pageActions";
import { getPackageBySlug } from "@/actions/packageActions";
import PackageDetailPageClient from "./PackageDetailPageClient";

export default async function StandalonePackageDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let initialPackage = await getPackageBySlug(slug).catch(() => null);
  if (!initialPackage) {
    initialPackage = await getPackageDetailsAction(slug).catch(() => null);
  }
  const initialSeo = initialPackage?.id 
    ? await getPageSeoAction(`pkg_${initialPackage.id}`).catch(() => null)
    : null;

  return (
    <PackageDetailPageClient 
      initialSlug={slug} 
      initialPackage={initialPackage} 
      initialSeo={initialSeo} 
    />
  );
}
