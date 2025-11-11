'use client';

import { useQuery } from '@tanstack/react-query';
import { getItemById } from '@/lib/api/items';

/**
 * Hook to fetch a single item by ID
 * @param {string} id - Item ID
 * @returns {object} Query result with item data, loading, error states
 */
export function useItem(id) {
  return useQuery({
    queryKey: ['item', id],
    queryFn: () => getItemById(id),
    enabled: !!id, // Only run query if ID exists
  });
}