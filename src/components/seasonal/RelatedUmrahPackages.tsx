import Link from 'next/link';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { relatedUmrahPages } from '@/lib/seasonalUmrah';
import styles from './seasonalUmrah.module.css';

/** Crawlable links to existing Umrah landing pages; no duplicate page content. */
export default function RelatedUmrahPackages({
  currentPath,
  extraPages = [],
}: {
  currentPath: string;
  extraPages?: { label: string; href: string; detail?: string }[];
}) {
  const normalize = (path: string) => `/${path.replace(/^\/+|\/+$/g, '')}`;
  const current = normalize(currentPath);
  const seen = new Set<string>();
  const related = [...relatedUmrahPages, ...extraPages].filter((item) => {
    const path = normalize(item.href);
    if (path === current || path === '/umrah-packages' || seen.has(path)) return false;
    seen.add(path);
    return true;
  });

  return (
    <section className={styles.relatedSection} aria-labelledby="other-umrah-packages-heading">
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.kicker}>EXPLORE MORE</p>
          <h2 id="other-umrah-packages-heading">Explore Other Umrah Packages</h2>
        </div>
        <Link href="/umrah-packages/">
          VIEW ALL UMRAH PACKAGES <ArrowRight size={16} />
        </Link>
      </div>
      <div className={styles.relatedGrid}>
        {related.map((item) => (
          <Link key={item.href} href={item.href} className={styles.relatedCard}>
            <CalendarDays size={24} aria-hidden="true" />
            <h3>{item.label}</h3>
            <p>{item.detail || 'Explore Umrah travel information and packages'}</p>
            <span>VIEW PAGE <ArrowRight size={14} aria-hidden="true" /></span>
          </Link>
        ))}
      </div>
    </section>
  );
}
