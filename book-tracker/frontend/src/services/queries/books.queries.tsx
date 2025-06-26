import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { getBooksApi } from '@/services/api/books.api'
import { useAuth } from '@/lib/auth-context'
import { useState } from 'react'

export const useGetBooks = () => {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['getBooks'],
    queryFn: () => getBooksApi({ userId: user?.username ?? '' }),
  })
}

export const usePaginatedBooks = () => {
  const [pageSize, setPageSize] = useState(10)
  const [cursor, setCursor] = useState<any | null>(null)
  const [cursorStack, setCursorStack] = useState<any[]>([])
  const { user } = useAuth()

  const query = useQuery({
    queryKey: ['getBooks', pageSize, cursor],
    queryFn: () =>
      getBooksApi({
        userId: user?.username ?? '',
        limit: pageSize,
        lastEvaluatedKey: cursor,
      }),
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
