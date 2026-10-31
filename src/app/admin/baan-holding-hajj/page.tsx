import { redirect } from 'next/navigation';

// BAAN is now managed through Admin > Pages, like the other CMS pages.
export default function FormerBaanAdminPage() {
  redirect('/admin/pages');
}
