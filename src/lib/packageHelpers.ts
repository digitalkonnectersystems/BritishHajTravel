/**
 * Travel Month & Duration helper utilities
 */

export interface StructuredDuration {
  value: number;
  unit: 'days' | 'nights';
}

export interface StructuredIconReference {
  provider: 'lucide' | 'dynamic';
  name: string;
  id?: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Format YYYY-MM (e.g. "2026-11") to "November 2026".
 * If value is already in human format or legacy format, it formats safely.
 */
export function formatTravelMonth(value?: string | null): string {
  if (!value || typeof value !== 'string') return '';
  const trimmed = value.trim();

  // Match YYYY-MM
  const yyyymmMatch = trimmed.match(/^(\d{4})-(\d{1,2})$/);
  if (yyyymmMatch) {
    const year = parseInt(yyyymmMatch[1], 10);
    const monthIdx = parseInt(yyyymmMatch[2], 10) - 1;
    if (monthIdx >= 0 && monthIdx < 12) {
      return `${MONTH_NAMES[monthIdx]} ${year}`;
    }
  }

  // Handle legacy format with parens, e.g. "November 2026 (14 Nights)" -> "November 2026"
  const legacyMonthMatch = trimmed.match(/^([A-Za-z]+)\s+(\d{4})/);
  if (legacyMonthMatch) {
    const monthName = legacyMonthMatch[1];
    const year = legacyMonthMatch[2];
    const foundIdx = MONTH_NAMES.findIndex(m => m.toLowerCase() === monthName.toLowerCase());
    if (foundIdx !== -1) {
      return `${MONTH_NAMES[foundIdx]} ${year}`;
    }
  }

  return trimmed;
}

/**
 * Parses legacy strings like "November 2026 (14 Nights)" or "2026-11" deterministically.
 */
export function parseLegacyTravelMonth(value?: string | null): {
  travelMonth: string;
  extractedDuration?: StructuredDuration;
} {
  if (!value || typeof value !== 'string') return { travelMonth: '' };
  const trimmed = value.trim();

  // Already YYYY-MM
  if (/^\d{4}-\d{2}$/.test(trimmed)) {
    return { travelMonth: trimmed };
  }

  // Check if string contains month + year and optional duration in parens
  const match = trimmed.match(/^([A-Za-z]+)\s+(\d{4})(?:\s*\((?:(\d+)\s*(days?|nights?))\))?/i);
  if (match) {
    const monthName = match[1];
    const year = match[2];
    const foundIdx = MONTH_NAMES.findIndex(m => m.toLowerCase() === monthName.toLowerCase());
    if (foundIdx !== -1) {
      const monthNumber = String(foundIdx + 1).padStart(2, '0');
      const travelMonth = `${year}-${monthNumber}`;
      let extractedDuration: StructuredDuration | undefined;
      if (match[3] && match[4]) {
        const val = parseInt(match[3], 10);
        const unit = match[4].toLowerCase().startsWith('day') ? 'days' : 'nights';
        if (!isNaN(val) && val > 0) {
          extractedDuration = { value: val, unit };
        }
      }
      return { travelMonth, extractedDuration };
    }
  }

  return { travelMonth: trimmed };
}

/**
 * Format duration object or number/string into singular/plural representation.
 * Examples:
 *   { value: 14, unit: 'nights' } -> "14 Nights"
 *   { value: 1, unit: 'nights' } -> "1 Night"
 *   { value: 10, unit: 'days' } -> "10 Days"
 *   { value: 1, unit: 'days' } -> "1 Day"
 */
export function formatDuration(
  duration?: StructuredDuration | number | string | null,
  fallbackUnit: 'days' | 'nights' = 'nights'
): string {
  if (!duration) return '';

  if (typeof duration === 'object' && 'value' in duration) {
    const val = Number(duration.value);
    if (isNaN(val) || val <= 0) return '';
    const unit = duration.unit === 'days' ? (val === 1 ? 'Day' : 'Days') : (val === 1 ? 'Night' : 'Nights');
    return `${val} ${unit}`;
  }

  if (typeof duration === 'number') {
    const unit = fallbackUnit === 'days' ? (duration === 1 ? 'Day' : 'Days') : (duration === 1 ? 'Night' : 'Nights');
    return `${duration} ${unit}`;
  }

  if (typeof duration === 'string') {
    const trimmed = duration.trim();
    const match = trimmed.match(/^(\d+)\s*(days?|nights?)?$/i);
    if (match) {
      const val = parseInt(match[1], 10);
      const rawUnit = match[2] ? match[2].toLowerCase() : fallbackUnit;
      const isDays = rawUnit.startsWith('day');
      const unit = isDays ? (val === 1 ? 'Day' : 'Days') : (val === 1 ? 'Night' : 'Nights');
      return `${val} ${unit}`;
    }
    return trimmed;
  }

  return '';
}

/**
 * Parse string into StructuredDuration
 */
export function parseDuration(val: any, fallbackUnit: 'days' | 'nights' = 'nights'): StructuredDuration {
  if (val && typeof val === 'object' && 'value' in val) {
    const num = parseInt(String(val.value), 10);
    return {
      value: isNaN(num) || num <= 0 ? 14 : num,
      unit: val.unit === 'days' ? 'days' : 'nights',
    };
  }

  if (typeof val === 'number') {
    return {
      value: val > 0 ? val : 14,
      unit: fallbackUnit,
    };
  }

  if (typeof val === 'string') {
    const match = val.trim().match(/^(\d+)\s*(days?|nights?)?/i);
    if (match) {
      const parsedNum = parseInt(match[1], 10);
      const isDays = match[2] ? match[2].toLowerCase().startsWith('day') : fallbackUnit === 'days';
      return {
        value: !isNaN(parsedNum) && parsedNum > 0 ? parsedNum : 14,
        unit: isDays ? 'days' : 'nights',
      };
    }
  }

  return { value: 14, unit: fallbackUnit };
}

/**
 * Detects whether duration is 'days' or 'nights'
 */
export function getDurationUnit(
  duration?: StructuredDuration | number | string | null,
  fallbackUnit: 'days' | 'nights' = 'nights'
): 'days' | 'nights' {
  if (!duration) return fallbackUnit;
  if (typeof duration === 'object' && 'unit' in duration) {
    return duration.unit === 'days' ? 'days' : 'nights';
  }
  if (typeof duration === 'string') {
    const trimmed = duration.trim().toLowerCase();
    if (trimmed.includes('day')) return 'days';
    if (trimmed.includes('night')) return 'nights';
  }
  return fallbackUnit;
}
