"use client";

import SafeRichText from '@/components/SafeRichText';
import styles from './ElegantTextSection.module.css';

/** A standalone, reusable CMS section. It does not alter the existing Rich Text block. */
type ElegantTextData = {
  eyebrow?: string;
  title?: string;
  content?: string;
  appearance?: 'card' | 'clean';
  alignment?: 'left' | 'center';
};

export default function ElegantTextSection({ data }: { data?: ElegantTextData }) {
  const content = typeof data?.content === 'string' ? data.content.trim() : '';
  const title = typeof data?.title === 'string' ? data.title.trim() : '';
  const eyebrow = typeof data?.eyebrow === 'string' ? data.eyebrow.trim() : '';
  // Do not show a decorative empty section for unsaved content.
  if (!title && !eyebrow && (!content || /^(<p>\s*(<br\s*\/?\s*>)?\s*<\/p>)+$/i.test(content))) return null;

  const appearance = data?.appearance === 'clean' ? 'clean' : 'card';
  const alignment = data?.alignment === 'center' ? 'center' : 'left';

  return (
    <section className={styles.section} data-appearance={appearance} data-alignment={alignment} aria-label={title || eyebrow || 'Page information'}>
      <div className={styles.container}>
        <div className={styles.panel}>
          {(eyebrow || title) && (
            <header className={styles.header}>
              {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
              {title && <h2 className={styles.title}>{title}</h2>}
              <span className={styles.accentRule} aria-hidden="true" />
            </header>
          )}
          {content && <SafeRichText html={content} className={styles.content} />}
        </div>
      </div>
    </section>
  );
}
