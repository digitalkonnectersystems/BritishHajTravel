import 'server-only';
import { getPackagesByType, getSoldOutPackages } from '@/actions/packageActions';
import { getSoldOutDestinationPackages, getDestinations } from '@/actions/destinationActions';
import { getLatestBlogs } from '@/actions/blogActions';
import { getGuidesList } from '@/actions/pageActions';
import { getHotelDirectory } from '@/actions/hotelActions';

/** Resolve data from published records for each visible CMS section, before rendering. */
export async function loadCmsSectionContext(sections: any[]) {
  const active = (Array.isArray(sections) ? sections : []).filter(s => s?.type && s.hidden !== true && s.visible !== false);
  const has = (...types: string[]) => active.some(s => types.includes(s.type));
  const categories = Array.from(new Set(active.filter(s => s.type === 'Guide').map(s => s.data?.guideCategory).filter((c): c is 'hajj' | 'umrah' => c === 'hajj' || c === 'umrah')));
  const [umrah, hajj, soldOut, destinationData, blogData, guideData, hotelData] = await Promise.all([
    has('Upcoming Umrah Packages', 'Umrah Packages', 'Umrah Packages Grid') ? getPackagesByType('umrah') : Promise.resolve([]),
    has('Hajj Packages', 'Packages Grid') ? getPackagesByType('hajj') : Promise.resolve([]),
    has('Sold Out Packages') ? Promise.all([getSoldOutPackages(),getSoldOutDestinationPackages()]).then(([p,d]) => [...p,...d]) : has('Sold Out Hajj Packages', 'Sold Out Umrah Packages') ? getSoldOutPackages() : Promise.resolve([]),
    has('Destinations Grid') ? getDestinations() : Promise.resolve([]),
    has('Latest Blogs Grid','Blog Posts Carousel') ? getLatestBlogs(12) : Promise.resolve([]),
    categories.length ? Promise.all(categories.map(c => getGuidesList(c,false))).then(v => v.flat()) : Promise.resolve([]),
    has('Makkah Hotels Directory','Madinah Hotels Directory') ? getHotelDirectory() : Promise.resolve([]),
  ]);
  return {
    initialPackageData: { umrah, hajj, soldOut },
    initialDestinationData: destinationData,
    initialBlogData: blogData,
    initialGuideData: guideData,
    initialHotelDirectory: hotelData,
  };
}
