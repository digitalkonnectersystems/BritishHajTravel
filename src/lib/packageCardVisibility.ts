/** Display-only visibility flags stored in packages.card_data JSON.
 * Missing flags mean visible so existing packages keep their current appearance. */
export function readPackageCardData(value: unknown): Record<string, any> {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value as Record<string, any>;
  if (typeof value === 'string') {
    try {
      const parsed: unknown = JSON.parse(value);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, any> : {};
    } catch { return {}; }
  }
  return {};
}

export function isPackageCardVisible(pkg: { cardData?: unknown } | null | undefined): boolean {
  return readPackageCardData(pkg?.cardData).isVisible !== false;
}

export function isAccommodationVisible(hotel: unknown): boolean {
  if (!hotel || typeof hotel !== 'object') return true;
  return (hotel as { isVisible?: boolean }).isVisible !== false;
}
