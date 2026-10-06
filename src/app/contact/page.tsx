import ContactPageClient from "./ContactPageClient";
import { getPageBySlug, getFormsSettings } from "@/actions/pageActions";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seoMetadata";

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getPageBySlug("/contact").catch(() => null);
  return buildPageMetadata(pageData || {
    title: "Contact British Hajj Travel UK",
    metaDescription: "Contact British Hajj Travel UK for Hajj, Umrah, Saudi visa and flight enquiries.",
  }, "/contact");
}

export default async function ContactPage() {
  const pageData = await getPageBySlug('/contact');
  const formsConfig = await getFormsSettings();
  const contactFormConfig = formsConfig?.contact || null;

  return <ContactPageClient initialPageData={pageData} initialFormConfig={contactFormConfig} />;
}
// Force recompile to clear RSC cache
