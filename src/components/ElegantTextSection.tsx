"use client";

import SafeRichText from '@/components/SafeRichText';
import styles from './ElegantTextSection.module.css';

/** CMS-driven copy on the left and a standalone image on the right. */
type ElegantTextData = {
  eyebrow?: string;
  title?: string;
  content?: string;
  image?: string;
  imageAlt?: string;
  buttonText?: string;
  buttonUrl?: string;
  // Retain compatibility with sections saved using the previous layout editor.
  appearance?: 'card' | 'clean';
  alignment?: 'left' | 'center';
  imagePosition?: 'left' | 'right';
};

export default function ElegantTextSection({ data }: { data?: ElegantTextData }) {
  const content = typeof data?.content === 'string' ? data.content.trim() : '';
  const title = typeof data?.title === 'string' ? data.title.trim() : '';
  const eyebrow = typeof data?.eyebrow === 'string' ? data.eyebrow.trim() : '';
  const image = typeof data?.image === 'string' ? data.image.trim() : '';
  const imageAlt = typeof data?.imageAlt === 'string' ? data.imageAlt.trim() : '';
  const buttonText = typeof data?.buttonText === 'string' ? data.buttonText.trim() : '';
  const buttonUrl = typeof data?.buttonUrl === 'string' ? data.buttonUrl.trim() : '';
  const hasContent = Boolean(content && !/^(<p>\s*(<br\s*\/?\s*>)?\s*<\/p>)+$/i.test(content));
  // A CMS link must be a local path, anchor, https URL, email link or phone link.
  const safeButtonUrl = /^(\/(?!\/)|#|https:\/\/|mailto:|tel:)/i.test(buttonUrl) ? buttonUrl : '';
  const hasText = Boolean(title || eyebrow || hasContent || (buttonText && safeButtonUrl));

  if (!hasText && !image) return null;

  return (
    <section className={styles.section} aria-label={title || eyebrow || 'Page information'}>
      <div className={styles.container}>
        <div className={`${styles.layout} ${!image ? styles.textOnly : ''} ${!hasText ? styles.imageOnly : ''}`}>
          {hasText && (
            <div className={styles.textColumn}>
              {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
              {title && <h2 className={styles.title}>{title}</h2>}
              {hasContent && <SafeRichText html={content} className={styles.content} unstyled />}
              {buttonText && safeButtonUrl && (
                <a className={styles.cta} href={safeButtonUrl}>
                  {buttonText}
                </a>
              )}
            </div>
          )}
          {image && (
            <div className={styles.imageColumn}>
              <img
                className={styles.image}
                src={image}
                alt={imageAlt || title || eyebrow || 'Section image'}
                loading="lazy"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
