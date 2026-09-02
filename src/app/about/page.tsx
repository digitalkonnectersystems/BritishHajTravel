import { getPageBySlug } from "@/actions/pageActions";
import AboutPageClient from "./AboutPageClient";

export default async function AboutPage() {
  const pageData = await getPageBySlug("/about");
  return <AboutPageClient initialPageData={pageData} />;
}
