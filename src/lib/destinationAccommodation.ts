/** Destination-only compatibility layer for legacy four-slot accommodation JSON. */
export const DESTINATION_HOTEL_KEYS = ['makkahHotel', 'madinahHotel', 'aziziyaHotel', 'minaHotel'] as const;

export function destinationRecord(value: unknown): Record<string, any> {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value as Record<string, any>;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
    } catch { /* Treat malformed optional JSON as empty. */ }
  }
  return {};
}

/** Fill omitted detail-page hotel fields from the destination card without replacing edited values. */
export function mergeDestinationHotelSlots(detailData: unknown, cardData: unknown): Record<string, any> {
  const detail = destinationRecord(detailData);
  const card = destinationRecord(cardData);
  const result: Record<string, any> = { ...detail };
  for (const key of DESTINATION_HOTEL_KEYS) {
    const cardHotel = destinationRecord(card[key]);
    const detailHotel = destinationRecord(detail[key]);
    if (Object.keys(cardHotel).length || Object.keys(detailHotel).length) {
      result[key] = { ...cardHotel, ...detailHotel };
    }
  }
  return result;
}
