'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteItem } from '@/lib/api/items';

/**
 * Hook to delete an item
 * @returns {object} Mutation object with mutate function, loading, error states
 */
export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId) => deleteItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });// refresh data
    },
      onError: (error) => {
        console.error('Error deleting item:', error);
    },
  });
}