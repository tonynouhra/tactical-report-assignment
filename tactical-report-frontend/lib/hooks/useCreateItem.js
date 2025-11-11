'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createItem } from '@/lib/api/items';
import { trackActivity, ActivityType } from '@/lib/utils/activityTracker';

/**
 * Hook to create a new item
 * @returns {object} Mutation object with mutate function, loading, error states
 */
export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemData) => createItem(itemData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['items'] });

      // Track activity
      trackActivity(
        ActivityType.CREATE,
        data.id,
        data.name,
        { description: 'New item created' }
      );
    },
    onError: (error) => {
      console.error('Error creating item:', error);
    },
  });
}