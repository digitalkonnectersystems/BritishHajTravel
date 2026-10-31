/**
 * All internal flight navigation points to /flights.
 * Stale saved menu links are normalized before display. This does not
 * create a public redirect or restore retired routes.
 */
export function normalizeFlightUrl(url: string): string {
  return url.replace(
    /^\/(?:airlines|cheap-flights-air-tickets)\/?(?=[?#]|$)/i,
    '/flights'
  );
}
