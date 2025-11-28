import { useState } from 'react'
import { Input, Button, Badge, FormField } from '@/app/components/atoms'
import { X } from 'lucide-react'

interface SpecificationInputProps {
  specifications: string[]
  onChange: (specs: string[]) => void
  error?: string
}

export function SpecificationInput({
  specifications,
  onChange,
  error,
}: SpecificationInputProps) {
  const [specInput, setSpecInput] = useState('')

  const handleAddSpecification = () => {
    const trimmed = specInput.trim()
    if (trimmed && !specifications.includes(trimmed)) {
      onChange([...specifications, trimmed])
      setSpecInput('')
    }
  }

  const handleSpecKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddSpecification()
    }
  }

  const handleRemoveSpecification = (index: number) => {
    onChange(specifications.filter((_, i) => i !== index))
  }

  return (
    <FormField label="商品規格" required error={error} htmlFor="spec-input">
      <div className="flex gap-2">
        <Input
          id="spec-input"
          value={specInput}
          onChange={(e) => setSpecInput(e.target.value)}
          onKeyDown={handleSpecKeyDown}
          placeholder="輸入規格後按 Enter（例如：白色、M）"
        />
        <Button
          type="button"
          onClick={handleAddSpecification}
          variant="outline"
          size="sm"
        >
          新增
        </Button>
      </div>

      {specifications.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {specifications.map((spec, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1"
            >
              {spec}
              <X
                size={14}
                className="cursor-pointer hover:opacity-70"
                onClick={() => handleRemoveSpecification(index)}
              />
            </Badge>
          ))}
        </div>
      )}
    </FormField>
  )
}
