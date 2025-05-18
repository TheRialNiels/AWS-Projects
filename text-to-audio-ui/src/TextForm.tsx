import { Button, Label, Spinner, Textarea } from 'flowbite-react'
import { ToastContainer, toast } from 'react-toastify'

import { SuccessResponse } from './request.interface'
import api from './axios'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  text: z.string().min(10, 'Text is too short'),
})

type FormData = z.infer<typeof schema>

export default function TextForm() {
  const [loading, setLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setDownloadUrl('')

    try {
      const response: SuccessResponse = await api.post('/staging/convert-text', data)
      toast(response.data.message)
      setDownloadUrl(response.data.downloadUrl)
    } catch (err: any) {
      toast(err?.message || 'Something went wrong.')
    } finally {
      reset()
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto flex w-full max-w-md flex-col gap-5">
      <div>
        <div className="mb-2 block w-full">
          <Label htmlFor="comment">Insert your text</Label>
        </div>

        <Textarea {...register('text')} id="text" placeholder="Please insert your text here..." required rows={5} />

        {errors.text && <p className="text-sm text-red-500">{errors.text.message}</p>}
      </div>

      <div className="flex w-full flex-col gap-5">
        <Button className="cursor-pointer" type="submit" disabled={loading}>
          {loading ? (
            <>
              <Spinner size="sm" className="me-2" /> Converting...
            </>
          ) : (
            'Convert to audio'
          )}
        </Button>

        {downloadUrl && (
          <Button
            as="a"
            href={downloadUrl}
            download="audio.mp3"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:cursor-pointer"
          >
            Hear audio
          </Button>
        )}

        <ToastContainer />
      </div>
    </form>
  )
}
