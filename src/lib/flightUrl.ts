/**
 * All internal flight navigation points to /flights.
 * The original CMS slug is used only for server-side content lookup and is
 * never the browser's destination. DB navigation settings remain unchanged.
 */
export function normalizeFlightUrl(url: string): string {
  return url.replace(
    /^\/(?:airlines|cheap-flights-air-tickets)\/?(?=[?#]|$)/i,
    '/flights'
  );
}
