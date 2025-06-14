import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { Category } from '@interfaces/categories'
import { postCategoryApi } from '@/services/api/categoriesApi'

export const useCreateCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Category) => postCategoryApi(data),

    onSettled: async (_, error) => {
      if (error) {
        console.log('🚀 ~ onSettled: ~ error:', error)
        return
      }

      await queryClient.invalidateQueries({ queryKey: ['getCategories'] })
    },
  })
}
