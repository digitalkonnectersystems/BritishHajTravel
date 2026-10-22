/**
 * Display-only fallback for blog featured images.
 * This does not change the value stored in blog_posts.featured_image.
 * The image file must exist at public/images_BHT/uploads/0-1.jpg.
 */
export const DEFAULT_BLOG_FEATURED_IMAGE = '/images_BHT/uploads/0-1.jpg';

export function getBlogFeaturedImage(imagePath: string | null | undefined): string {
  return typeof imagePath === 'string' && imagePath.trim()
    ? imagePath
    : DEFAULT_BLOG_FEATURED_IMAGE;
}
