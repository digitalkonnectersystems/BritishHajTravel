import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import {getPublishedVisaProcessingBySlug} from '@/actions/visaProcessingActions';
import SaudiVisaPageClient from '@/app/saudi-visa/SaudiVisaPageClient';
import {buildPageMetadata} from '@/lib/seoMetadata';

type Props={params:Promise<{slug:string}>};
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const {slug}=await params;const url=`/visa-processing/${slug}`;
 const page=await getPublishedVisaProcessingBySlug(url);
 return page?buildPageMetadata(page,url):{title:'Visa processing page not found',robots:{index:false,follow:false}};
}
export default async function VisaProcessingPage({params}:Props){
 const {slug}=await params;const page=await getPublishedVisaProcessingBySlug(`/visa-processing/${slug}`);
 if(!page)notFound();
 return <SaudiVisaPageClient initialPageData={page}/>;
}
