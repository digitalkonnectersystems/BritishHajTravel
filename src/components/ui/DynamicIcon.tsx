import React from 'react';
import { icons, HelpCircle, LucideProps } from 'lucide-react';
import { StructuredIconReference } from '@/lib/packageHelpers';

interface DynamicIconProps extends Omit<LucideProps, 'name'> {
  name: string | StructuredIconReference;
}

/**
 * Validates and resolves an icon safely from Lucide registry.
 * Never executes code or eval. Neutral fallback on missing/invalid name.
 */
export const DynamicIcon = ({ name, ...props }: DynamicIconProps) => {
  if (!name) return <HelpCircle {...props} />;

  let rawName = '';
  if (typeof name === 'object' && name !== null) {
    if (name.provider === 'dynamic') {
      // Dynamic external icons: fallback gracefully if unsupported
      return <HelpCircle {...props} />;
    }
    rawName = name.name || '';
  } else if (typeof name === 'string') {
    rawName = name;
  }

  const cleanName = rawName.trim();
  if (!cleanName) return <HelpCircle {...props} />;

  // 1. Try exact match in Lucide icons
  let Icon = (icons as any)[cleanName];

  // 2. Try PascalCase transformation (e.g. "map-pin" -> "MapPin", "utensils" -> "Utensils", "plane" -> "Plane")
  if (!Icon) {
    const pascalName = cleanName
      .split(/[-_ ]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
    Icon = (icons as any)[pascalName];
  }

  // 3. Fallback: case-insensitive key match
  if (!Icon) {
    const lowerName = cleanName.toLowerCase().replace(/[-_ ]/g, '');
    const foundKey = Object.keys(icons || {}).find(
      key => key.toLowerCase() === lowerName
    );
    if (foundKey) {
      Icon = (icons as any)[foundKey];
    }
  }

  Icon = Icon || HelpCircle;
  return <Icon {...props} />;
};

export default DynamicIcon;
