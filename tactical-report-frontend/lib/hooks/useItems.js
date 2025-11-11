'use client';

import { useQuery } from '@tanstack/react-query';
import { getAllItems } from '@/lib/api/items';

/**
 * Hook to fetch paginated items with optional filters
 * @param {number} page - Page number (0-indexed)
 * @param {number} size - Items per page
 * @param {object} filters - Filter parameters (search, category, status, minPrice, maxPrice, minQuantity, maxQuantity)
 * @returns {object} Query result with items data, loading, error states
 */
export function useItems(page = 0, size = 12, filters = {}) {
  console.log('useItems called with:', { page, size, filters });

  // Serialize filters to ensure proper cache key comparison
  const filterKey = JSON.stringify(filters);

  return useQuery({
    queryKey: ['items', page, size, filterKey],
    queryFn: () => getAllItems(page, size, filters),
  });
}