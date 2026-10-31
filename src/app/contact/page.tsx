import { notFound } from 'next/navigation';
import ContactPageClient from "./ContactPageClient";
import { loadCmsSectionContext } from "@/lib/cmsSectionContext";
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
  if (pageData?.status === 'draft') notFound();
  const formsConfig = await getFormsSettings();
  const contactFormConfig = formsConfig?.contact || null;

  let sections: any[] = [];
  try { const parsed = typeof pageData?.sections === 'string' ? JSON.parse(pageData.sections) : pageData?.sections; sections = Array.isArray(parsed) ? parsed : []; } catch {}
  const sectionContext = await loadCmsSectionContext(sections);
  return <ContactPageClient initialPageData={pageData} initialFormConfig={contactFormConfig} sectionContext={sectionContext} />;
}
// Force recompile to clear RSC cache
