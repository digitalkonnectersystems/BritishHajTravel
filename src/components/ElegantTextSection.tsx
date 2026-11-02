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
  image?: string;
  imageAlt?: string;
  imagePosition?: 'left' | 'right';
};

export default function ElegantTextSection({ data }: { data?: ElegantTextData }) {
  const content = typeof data?.content === 'string' ? data.content.trim() : '';
  const title = typeof data?.title === 'string' ? data.title.trim() : '';
  const eyebrow = typeof data?.eyebrow === 'string' ? data.eyebrow.trim() : '';
  const image = typeof data?.image === 'string' ? data.image.trim() : '';
  const imageAlt = typeof data?.imageAlt === 'string' ? data.imageAlt.trim() : '';
  const imagePosition = data?.imagePosition === 'left' ? 'left' : 'right';

  // Do not show a decorative empty section for unsaved content.
  if (!title && !eyebrow && !image && (!content || /^(<p>\s*(<br\s*\/?\s*>)?\s*<\/p>)+$/i.test(content))) return null;

  const appearance = data?.appearance === 'clean' ? 'clean' : 'card';
  const alignment = data?.alignment === 'center' ? 'center' : 'left';

  return (
    <section
      className={styles.section}
      data-appearance={appearance}
      data-alignment={alignment}
      data-has-heading={title || eyebrow ? 'true' : 'false'}
      data-has-image={image ? 'true' : 'false'}
      data-image-position={imagePosition}
      aria-label={title || eyebrow || 'Page information'}
    >
      <div className={styles.container}>
        <div className={styles.panel}>
          {!image && <span className={styles.cornerMark} aria-hidden="true" />}
          <div className={styles.readingArea}>
            {(eyebrow || title) && (
              <div className={styles.header}>
                {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
                {title && <h2 className={styles.title}>{title}</h2>}
                <span className={styles.accentRule} aria-hidden="true" />
              </div>
            )}
            {image && (
              <div className={`${styles.imageFrame} ${imagePosition === 'left' ? styles.imageLeft : styles.imageRight}`}>
                <div className={styles.imageInner}>
                  <img
                    src={image}
                    alt={imageAlt || title || eyebrow || 'Section featured image'}
                    className={styles.image}
                    loading="lazy"
                  />
                  <span className={styles.imageAccentBar} aria-hidden="true" />
                </div>
              </div>
            )}
            {content && <SafeRichText html={content} className={styles.content} unstyled />}
          </div>
        </div>
      </div>
    </section>
  );
}
