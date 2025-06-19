import { getBooksApi } from '@/services/api/books.api'
import { useQuery } from '@tanstack/react-query'

export const useGetBooks = () => {
  return useQuery({
    queryKey: ['getBooks'],
    queryFn: () => getBooksApi(),
  })
}
