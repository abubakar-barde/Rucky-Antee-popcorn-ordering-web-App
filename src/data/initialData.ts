import { ProductSize } from '../types';

export const POPCORN_SIZES: ProductSize[] = [
  { id: 'regular', label: 'Regular Bag', priceMultiplier: 1.0, weight: '65g' },
  { id: 'large', label: 'Large Share Tub', priceMultiplier: 1.6, weight: '140g' },
  { id: 'jumbo', label: 'Jumbo Bucket', priceMultiplier: 2.3, weight: '260g' },
  { id: 'party', label: 'Party Feast Tin', priceMultiplier: 3.8, weight: '550g' },
];

export const POPCORN_CATEGORIES: string[] = [
  'All',
  'Sweet',
  'Savory',
  'Spicy',
  'Cheese',
  'Specialty',
];
