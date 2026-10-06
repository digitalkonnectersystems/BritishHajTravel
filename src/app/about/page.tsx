import { getPageBySlug } from "@/actions/pageActions";
import AboutPageClient from "./AboutPageClient";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seoMetadata";

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getPageBySlug("/about").catch(() => null);
  return buildPageMetadata(pageData || { title: "About British Hajj Travel UK" }, "/about");
}

export default async function AboutPage() {
  const pageData = await getPageBySlug("/about");
  return <AboutPageClient initialPageData={pageData} />;
}
