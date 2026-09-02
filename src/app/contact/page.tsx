import ContactPageClient from "./ContactPageClient";
import { getPageBySlug, getFormsSettings } from "@/actions/pageActions";

export const metadata = {
  title: 'Contact Us | King Travel Can',
  description: 'Get in touch with King Travel Can for your Hajj & Umrah bookings.',
};

export default async function ContactPage() {
  const pageData = await getPageBySlug('/contact');
  const formsConfig = await getFormsSettings();
  const contactFormConfig = formsConfig?.contact || null;

  return <ContactPageClient initialPageData={pageData} initialFormConfig={contactFormConfig} />;
}
// Force recompile to clear RSC cache
