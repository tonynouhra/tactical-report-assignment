'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteItem } from '@/lib/api/items';
import { trackActivity, ActivityType } from '@/lib/utils/activityTracker';

/**
 * Hook to delete an item
 * @returns {object} Mutation object with mutate function, loading, error states
 */
export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }) => deleteItem(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['items'] });

      // Track activity
      trackActivity(
        ActivityType.DELETE,
        variables.id,
        variables.name,
        { description: 'Item deleted from inventory' }
      );
    },
    onError: (error) => {
      console.error('Error deleting item:', error);
    },
  });
}