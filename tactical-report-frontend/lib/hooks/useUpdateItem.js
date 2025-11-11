'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateItem } from '@/lib/api/items';

/**
 * Hook to update an existing item
 * @returns {object} Mutation object with mutate function, loading, error states
 */
export function useUpdateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateItem(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['item', variables.id] });
    },
    onError: (error) => {
      console.error('Error updating item:', error);
    },
  });
}