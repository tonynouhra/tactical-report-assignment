'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createItem } from '@/lib/api/items';

/**
 * Hook to create a new item
 * @returns {object} Mutation object with mutate function, loading, error states
 */
export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemData) => createItem(itemData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
    onError: (error) => {
      console.error('Error creating item:', error);
    },
  });
}