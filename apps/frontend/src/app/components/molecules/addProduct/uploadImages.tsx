import dynamic from 'next/dynamic'
import { Upload } from '@/app/components/atoms'
import { useRef } from 'react'

// 因為URL.createObjectURL 只能在瀏覽器端使用，所以需要動態引入ImagePreview元件避免hydration error
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

interface IUploadImagesProps {
  className?: string
  files: File[]
  onFilesChange: (files: File[]) => void
}

export function UploadImages({
  className,
  files,
  onFilesChange,
}: IUploadImagesProps) {
  const imageInputRef = useRef<HTMLInputElement>(null)

  const handleUploadImage = () => {
    imageInputRef.current?.click()
  }

  // 透過Set儲存唯一值並透過filter過濾重複的檔案，避免同張圖片重複上傳
  const handleUploadFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || [])
    if (newFiles && newFiles.length > 0) {
      const existingFilesSet = new Set(
        files.map((file) => `${file.name}-${file.size}`)
      )

      const filteredNewFiles = newFiles.filter(
        (file) => !existingFilesSet.has(`${file.name}-${file.size}`)
      )
      onFilesChange([...files, ...filteredNewFiles])
    }
  }

  const handleRemoveUploadFile = (file: File) => {
    onFilesChange(files.filter((f) => f.name !== file.name))
  }

  return (
    <div className={className}>
      <ImagePreview files={files} onClose={handleRemoveUploadFile} />
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
