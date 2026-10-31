/** Package-specific accommodation cards; stored in packages.detail_page_data JSON. */
export type PackageHotelCard = {
  id: string;
  label: string;
  name: string;
  location: string;
  image: string;
  badge: string;
  badgeIcon?: string;
  nights: string;
  nightsIcon?: string;
  description?: string;
  isVisible?: boolean;
  badgeEnabled?: boolean;
  durationEnabled?: boolean;
};

const LEGACY_HOTELS = [
  ['makkahHotel', 'Makkah Hotel'],
  ['madinahHotel', 'Madinah Hotel'],
  ['aziziyaHotel', 'Aziziya Hotel'],
  ['minaHotel', 'Mina Accommodation'],
] as const;

/** An explicitly stored array (including []) wins over the old four fixed hotel slots. */
export function getPackageHotelEntries(detail: any, card: any = {}, pkg: any = {}): PackageHotelCard[] {
  if (Array.isArray(detail?.hotelCards)) {
    return detail.hotelCards.filter((item: any) => item && typeof item === 'object').map((item: any, index: number) => ({
      id: String(item.id || `hotel-${index}`),
      label: String(item.label || 'Hotel'),
      name: String(item.name || ''), location: String(item.location || ''),
      image: String(item.image || ''), badge: String(item.badge || ''),
      badgeIcon: String(item.badgeIcon || ''), nights: String(item.nights || ''),
      nightsIcon: String(item.nightsIcon || ''), description: String(item.description || ''),
      isVisible: item.isVisible !== false, badgeEnabled: item.badgeEnabled !== false,
      durationEnabled: item.durationEnabled !== false && item.enabled !== false,
    }));
  }
  return LEGACY_HOTELS.flatMap(([key, label]) => {
    const raw = detail?.[key] || card?.[key] || pkg?.[key];
    if (!raw || typeof raw !== 'object') return [];
    if (!['name', 'location', 'image', 'badge', 'nights'].some(field => String(raw[field] || '').trim())) return [];
    return [{
      id: key, label: String(raw.label || label), name: String(raw.name || ''),
      location: String(raw.location || ''), image: String(raw.image || raw.image_url || ''),
      badge: String(raw.badge || ''), badgeIcon: String(raw.badgeIcon || ''),
      nights: String(raw.nights || ''), nightsIcon: String(raw.nightsIcon || ''),
      description: String(raw.description || ''), isVisible: raw.isVisible !== false,
      badgeEnabled: raw.badgeEnabled !== false,
      durationEnabled: raw.durationEnabled !== false && raw.enabled !== false,
    }];
  });
}

export function visiblePackageHotels(detail: any, card: any = {}, pkg: any = {}) {
  return getPackageHotelEntries(detail, card, pkg).filter(h =>
    h.isVisible !== false && [h.name, h.location, h.image, h.badge, h.nights, h.description].some(Boolean)
  );
}
