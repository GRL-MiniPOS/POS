'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { CircleX } from 'lucide-react'

interface ImagePreviewProps {
  files: File[]
  onClose: (file: File) => void
}

export function ImagePreview({ files, onClose }: ImagePreviewProps) {
  const [imageUrls, setImageUrls] = useState<string[]>([])

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file))
    setImageUrls(urls)

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [files])

  return (
    <>
      {imageUrls.map((url, index) => (
        <div key={`${files[index]?.name}-${index}`} className="relative">
          <Image
            src={url}
            width={100}
            height={100}
            className="w-24 h-24 object-cover rounded-lg"
            alt={files[index]?.name || 'uploaded image'}
          />
          <CircleX
            className="w-5 h-5 absolute top-1 right-1 rounded-full cursor-pointer bg-white"
            onClick={() => onClose(files[index])}
          />
        </div>
      ))}
    </>
  )
}
