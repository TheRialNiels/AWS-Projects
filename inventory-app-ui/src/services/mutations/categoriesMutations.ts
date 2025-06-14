import {
  deleteCategoryApi,
  patchCategoryApi,
  postCategoryApi,
} from '@/services/api/categoriesApi'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { Category } from '@interfaces/categories'

export const useCreateCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Category) => postCategoryApi(data),

    onSettled: async (_, error) => {
      if (error) return
      await queryClient.invalidateQueries({ queryKey: ['getCategories'] })
    },
  })
}

export const useUpdateCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Category) => patchCategoryApi(data),

    onSettled: async (_, error) => {
      if (error) return
      await queryClient.invalidateQueries({ queryKey: ['getCategories'] })
    },
  })
}

export const useDeleteCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteCategoryApi(id),

    onSettled: async (_, error) => {
      if (error) return
      await queryClient.invalidateQueries({ queryKey: ['getCategories'] })
    },
  })
}
