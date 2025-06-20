import { useErrorToast, useSuccessToast } from '@/lib/toastify'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface UseOptimisticMutationOptions<TData, TVariables> {
  queryKey: unknown[]
  getId: (item: TData | TVariables) => string
  mutationFn: (variables: TVariables) => Promise<{ responseData: TData }>
  getItems: (data: any) => TData[]
  setItems: (items: TData[], data: any) => any
  successMsg: string
  errorMsg: string
  onDone?: () => void
  updateItems?: (prevItems: TData[], newItem: TVariables) => TData[]
}

export function useOptimisticMutation<TData, TVariables>({
  queryKey,
  getId,
  mutationFn,
  getItems,
  setItems,
  successMsg,
  errorMsg,
  onDone,
  updateItems,
}: UseOptimisticMutationOptions<TData, TVariables>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,

    onMutate: async (newItem: TVariables) => {
      await queryClient.cancelQueries({ queryKey })

      const previousData = queryClient.getQueryData<any>(queryKey)

      queryClient.setQueryData<any>(queryKey, (old: any) => {
        if (!old) return old
        const items = getItems(old)
        const updatedId = getId(newItem)

        const newItems = updateItems
          ? updateItems(items, newItem)
          : items.map((item) =>
              getId(item) === updatedId ? { ...item, ...newItem } : item,
            )
        return setItems(newItems, old)
      })

      return { previousData }
    },

    onError: (error: any, _variables, context) => {
      const message = error?.response?.data?.message || errorMsg
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
      useErrorToast(message)
    },

    onSuccess: (response) => {
      const updatedItem = response?.responseData
      if (updatedItem && getId(updatedItem)) {
        onDone?.()
        useSuccessToast(successMsg)
        return
      }
      queryClient.invalidateQueries({ queryKey })
      useErrorToast('Update not confirmed by server.')
    },
  })
}
