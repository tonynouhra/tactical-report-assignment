'use client';

import { useQuery } from '@tanstack/react-query';
import { getAllItems } from '@/lib/api/items';

/**
 * Hook to fetch paginated items
 * @param {number} page - Page number (0-indexed)
 * @param {number} size - Items per page
 * @returns {object} Query result with items data, loading, error states
 */
export function useItems(page = 0, size = 12) {
  return useQuery({
    queryKey: ['items', page, size],
    queryFn: () => getAllItems(page, size),
    keepPreviousData: true,
  });
}