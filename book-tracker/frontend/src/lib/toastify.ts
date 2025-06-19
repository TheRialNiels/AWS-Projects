import { toast } from 'react-toastify'

export const useSuccessToast = (message: string) => {
  toast.success(message)
}

export const useErrorToast = (message: string) => {
  toast.error(message)
}

export const useWarningToast = (message: string) => {
  toast.warn(message)
}
