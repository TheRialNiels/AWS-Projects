import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { getBooksApi } from '@/services/api/books.api'
import { useState } from 'react'

export const useGetBooks = () => {
  return useQuery({
    queryKey: ['getBooks'],
    queryFn: () => getBooksApi(),
  })
}

export const usePaginatedBooks = () => {
  const [pageSize, setPageSize] = useState(10)
  const [cursor, setCursor] = useState<any | null>(null)
  const [cursorStack, setCursorStack] = useState<any[]>([])

  const query = useQuery({
    queryKey: ['getBooks', pageSize, cursor],
    queryFn: () => getBooksApi({ limit: pageSize, lastEvaluatedKey: cursor }),
    placeholderData: keepPreviousData,
  })

  const goToNextPage = () => {
    if (query.data?.responseData.lastEvaluatedKey) {
      setCursorStack((prev) => [...prev, cursor])
      setCursor(query.data.responseData.lastEvaluatedKey)
    }
  }

  const goToPreviousPage = () => {
    setCursorStack((prev) => {
      const updated = [...prev]
      const last = updated.pop()
      setCursor(last ?? null)
      return updated
    })
  }

  return {
    ...query,
    pageSize,
    cursor,
    cursorStack,
    hasNextPage: !!query.data?.responseData.lastEvaluatedKey,
    setCursor,
    setPageSize,
    goToNextPage,
    goToPreviousPage,
  }
}
