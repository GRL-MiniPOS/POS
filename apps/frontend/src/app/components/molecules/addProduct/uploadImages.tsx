import dynamic from 'next/dynamic'
import { Upload } from '@/app/components/atoms'
import { useRef, useState } from 'react'

/**
 * dynamic為Next.js 的動態 import功能
 * 動態 import ImagePreview 元件
 * 避免在伺服器端渲染時，ImagePreview 元件被渲染
 */
const ImagePreview = dynamic(
  () =>
    import('@/app/components/molecules/addProduct/imagePreview').then(
      (mod) => ({
        default: mod.ImagePreview,
      })
    ),
  {
    ssr: false,
  }
)

export function UploadImages({ className }: { className?: string }) {
  const [uploadFiles, setUploadFiles] = useState<File[]>([])
  const imageInputRef = useRef<HTMLInputElement>(null)

  const handleUploadImage = () => {
    imageInputRef.current?.click()
  }

  // 透過Set儲存唯一值並透過filter過濾重複的檔案，避免同張圖片重複上傳
  const handleUploadFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files && files.length > 0) {
      setUploadFiles((prev) => {
        const existingFilesSet = new Set(
          prev.map((file) => `${file.name}-${file.size}`)
        )
        const newFiles = files.filter(
          (file) => !existingFilesSet.has(`${file.name}-${file.size}`)
        )

        return [...prev, ...newFiles]
      })
    }
  }

  const handleRemoveUploadFile = (file: File) => {
    setUploadFiles((prev) => prev.filter((f) => f.name !== file.name))
  }

  return (
    <div className={className}>
      <ImagePreview files={uploadFiles} onClose={handleRemoveUploadFile} />
      <Upload
        className="w-24 h-24"
        text="新增圖片"
        onClick={handleUploadImage}
      />
      <input
        ref={imageInputRef}
        onChange={handleUploadFilesChange}
        type="file"
        multiple
        accept="image/jpeg, image/png"
        className="hidden"
      />
    </div>
  )
}
