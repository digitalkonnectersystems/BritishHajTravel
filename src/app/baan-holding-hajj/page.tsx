import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBaanContent } from '@/actions/baanActions';
import BaanLanding from '@/components/baan/BaanLanding';
export const metadata: Metadata = { title: 'BAAN Holding Hajj Packages 2027 | British Haj Travel', description: 'Enquire about selected BAAN Holding Hajj 2027 packages through British Haj Travel, a UK reseller.' };
export default async function BaanPage() {
  const content = await getBaanContent();
  if (!content.isVisible) notFound();
  return <BaanLanding content={content} />;
}
