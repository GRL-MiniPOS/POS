import { apiRequest } from '@/app/lib/api/client'
import { UploadResponseSchema } from '@/app/lib/schemas/upload.schema'

// multipart：FormData 直接放進 body，boundary 由瀏覽器補上（apiRequest 不會手動設 Content-Type）。
export function uploadImages(files: File[]) {
  const formData = new FormData()
  files.forEach((file) => formData.append('files', file))

  return apiRequest('/upload', UploadResponseSchema, {
    method: 'POST',
    body: formData,
  })
}
