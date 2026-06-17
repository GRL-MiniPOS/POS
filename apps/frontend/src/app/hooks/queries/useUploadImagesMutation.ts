'use client'

import { useMutation } from '@tanstack/react-query'
import { uploadImages } from '@/app/lib/api/upload/upload.api'

export function useUploadImagesMutation() {
  return useMutation({
    mutationFn: uploadImages,
  })
}
