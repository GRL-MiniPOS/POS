'use client'

import { useState } from 'react'
import { Input, Button, Badge, FormField } from '@/app/components/atoms'
import { X, Plus, Minus } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import type { IProductSpec } from '@/app/types/addProduct'

interface SpecificationInputProps {
  specifications: IProductSpec[]
  onChange: (specs: IProductSpec[]) => void
  error?: string
}

export function SpecificationInput({
  specifications,
  onChange,
  error,
}: SpecificationInputProps) {
  const [specName, setSpecName] = useState('')
  const [specQuantity, setSpecQuantity] = useState<number>(0)

  const handleAddSpecification = () => {
    const trimmedName = specName.trim()
    if (!trimmedName) return

    // 檢查是否已存在相同名稱的規格
    const existingIndex = specifications.findIndex(
      (spec) => spec.name === trimmedName
    )

    if (existingIndex >= 0) {
      // 如果已存在，更新數量
      const updatedSpecs = [...specifications]
      updatedSpecs[existingIndex] = {
        ...updatedSpecs[existingIndex],
        quantity: specQuantity,
      }
      onChange(updatedSpecs)
    } else {
      // 新增規格
      const newSpec: IProductSpec = {
        id: uuidv4(),
        name: trimmedName,
        quantity: specQuantity,
      }
      onChange([...specifications, newSpec])
    }

    setSpecName('')
    setSpecQuantity(0)
  }

  const handleSpecKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddSpecification()
    }
  }

  const handleRemoveSpecification = (id: string) => {
    onChange(specifications.filter((spec) => spec.id !== id))
  }

  const handleQuantityChange = (id: string, delta: number) => {
    onChange(
      specifications.map((spec) =>
        spec.id === id
          ? { ...spec, quantity: Math.max(0, spec.quantity + delta) }
          : spec
      )
    )
  }

  const handleQuantityInputChange = (id: string, value: string) => {
    const numValue = parseInt(value, 10)
    if (!isNaN(numValue) && numValue >= 0) {
      onChange(
        specifications.map((spec) =>
          spec.id === id ? { ...spec, quantity: numValue } : spec
        )
      )
    }
  }

  // 計算總庫存
  const totalStock = specifications.reduce(
    (total, spec) => total + spec.quantity,
    0
  )

  return (
    <FormField label="商品規格" required error={error} htmlFor="spec-input">
      <div className="space-y-3">
        {/* 新增規格輸入區 */}
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1 block">
              規格名稱
            </label>
            <Input
              id="spec-input"
              value={specName}
              onChange={(e) => setSpecName(e.target.value)}
              onKeyDown={handleSpecKeyDown}
              placeholder="例如：白色 M"
            />
          </div>
          <div className="w-24">
            <label className="text-xs text-muted-foreground mb-1 block">
              數量
            </label>
            <Input
              type="number"
              min="0"
              value={specQuantity}
              onChange={(e) =>
                setSpecQuantity(Math.max(0, parseInt(e.target.value, 10) || 0))
              }
              onKeyDown={handleSpecKeyDown}
            />
          </div>
          <Button
            type="button"
            onClick={handleAddSpecification}
            variant="outline"
            size="sm"
          >
            新增
          </Button>
        </div>

        {/* 規格列表 */}
        {specifications.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">
              已新增規格（總庫存：{totalStock} 件）
            </div>
            <div className="flex flex-wrap gap-2">
              {specifications.map((spec) => (
                <Badge
                  key={spec.id}
                  variant="secondary"
                  className="flex items-center gap-2 px-2 py-1.5"
                >
                  <span className="font-medium">{spec.name}</span>
                  <div className="flex items-center gap-1 border-l pl-2 ml-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => handleQuantityChange(spec.id, -1)}
                      aria-label="減少數量"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      min="0"
                      value={spec.quantity}
                      onChange={(e) =>
                        handleQuantityInputChange(spec.id, e.target.value)
                      }
                      className="w-10 h-6 text-center text-xs px-1 border-0 shadow-none focus-visible:ring-primary/50 focus-visible:ring-offset-0 tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => handleQuantityChange(spec.id, 1)}
                      aria-label="增加數量"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <X
                    size={14}
                    className="cursor-pointer hover:opacity-70 ml-1"
                    onClick={() => handleRemoveSpecification(spec.id)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </FormField>
  )
}
