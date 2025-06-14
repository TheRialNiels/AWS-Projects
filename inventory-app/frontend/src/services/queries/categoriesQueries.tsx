import { getCategoriesApi } from '@services/api/categoriesApi'
import { useQuery } from '@tanstack/react-query'

export const useGetCategories = () => {
  return useQuery({
    queryKey: ['getCategories'],
    queryFn: () => getCategoriesApi(),
  })
}
