'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateItem } from '@/lib/api/items';
import { trackActivity, ActivityType } from '@/lib/utils/activityTracker';

/**
 * Hook to update an existing item
 * @returns {object} Mutation object with mutate function, loading, error states
 */
export function useUpdateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateItem(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['item', variables.id] });

      // Track activity
      trackActivity(
        ActivityType.UPDATE,
        data.id,
        data.name,
        { description: 'Item details updated' }
      );
    },
    onError: (error) => {
      console.error('Error updating item:', error);
    },
  });
}