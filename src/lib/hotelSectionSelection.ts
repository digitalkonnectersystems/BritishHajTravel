export type DirectoryHotel = {
  id: number;
  categoryId: number;
  name: string;
  city: string;
  imageUrl: string | null;
  rating: string | null;
  description: string | null;
  priceLabel: string | null;
  pricePeriod: string | null;
  websiteUrl: string;
};

export type DirectoryCategory = {
  id: number;
  slug: string;
  name: string;
  hotels: DirectoryHotel[];
};

export const HOTEL_DIRECTORY_SECTION_TYPES = ['Makkah Hotels Directory', 'Madinah Hotels Directory'] as const;

/** Match city-specific section types to their hotel-directory categories. */
export function hotelCategoryMatchesSection(category: Pick<DirectoryCategory, 'name' | 'slug'>, type: string): boolean {
  const description = `${category.slug} ${category.name}`.toLowerCase();
  if (type === 'Makkah Hotels Directory') return /makkah|mecca|makka/.test(description);
  if (type === 'Madinah Hotels Directory') return /madina|medina/.test(description);
  return false;
}

/** Never display hotels outside the selected published category or outside the saved selection. */
export function selectDirectoryHotels(
  categories: DirectoryCategory[],
  categoryId: unknown,
  hotelIds: unknown,
): { category: DirectoryCategory | null; hotels: DirectoryHotel[] } {
  const selectedCategory = Number(categoryId);
  const category = Number.isSafeInteger(selectedCategory) && selectedCategory > 0
    ? categories.find(entry => entry.id === selectedCategory) || null : null;
  if (!category || !Array.isArray(hotelIds)) return { category, hotels: [] };
  const available = new Map(category.hotels.map(hotel => [hotel.id, hotel]));
  const seen = new Set<number>();
  const hotels: DirectoryHotel[] = [];
  for (const rawId of hotelIds) {
    const id = Number(rawId);
    if (!Number.isSafeInteger(id) || seen.has(id)) continue;
    const hotel = available.get(id);
    if (hotel) { hotels.push(hotel); seen.add(id); }
  }
  return { category, hotels };
}
