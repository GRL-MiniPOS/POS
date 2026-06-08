'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { toast } from '@/app/components/atoms'
import { useProductCategoriesQuery } from '@/app/hooks/queries/useProductCategoriesQuery'
import { useUploadImagesMutation } from '@/app/hooks/queries/useUploadImagesMutation'
import { useCreateProductMutation } from '@/app/hooks/queries/useCreateProductMutation'
import { useUpdateProductMutation } from '@/app/hooks/queries/useUpdateProductMutation'
import { getApiErrorMessage } from '@/app/lib/api/getApiErrorMessage'
import {
  emptySeed,
  getUsableGroups,
  isValidQuantity,
  reconcileVariants,
  seedFromProduct,
  type ProductFormSeed,
} from '@/app/lib/productForm/variants'
import type { CreateBody, Product } from '@/app/lib/schemas/products.schema'
import type { IOptionGroupDraft, IVariantDraft } from '@/app/types/addProduct'

const MAX_OPTION_GROUPS = 2

export type UseProductFormParams =
  | { mode: 'create' }
  | { mode: 'edit'; productId: string; initialProduct: Product }

export function useProductForm(params: UseProductFormParams) {
  const router = useRouter()

  // 種子只計算一次（避免每次 render 重產 uuid）。
  const [seed] = useState<ProductFormSeed>(() =>
    params.mode === 'edit' ? seedFromProduct(params.initialProduct) : emptySeed
  )

  const [name, setName] = useState(seed.name)
  const [categoryId, setCategoryId] = useState(seed.categoryId)
  const [price, setPrice] = useState(seed.price)
  const [quantity, setQuantity] = useState(seed.quantity) // 簡單商品（無規格）用
  const [optionGroups, setOptionGroups] = useState<IOptionGroupDraft[]>(
    seed.optionGroups
  )
  const [variants, setVariants] = useState<IVariantDraft[]>(seed.variants)
  const [files, setFiles] = useState<File[]>([])

  const categoriesQuery = useProductCategoriesQuery()
  const uploadImagesMutation = useUploadImagesMutation()
  const createProductMutation = useCreateProductMutation()
  const updateProductMutation = useUpdateProductMutation()

  const hasVariants = optionGroups.length > 0

  // 規格類型變更一律走這裡：同步更新 groups 與重算後的變體。
  const applyGroups = (nextGroups: IOptionGroupDraft[]) => {
    setOptionGroups(nextGroups)
    setVariants((previous) => reconcileVariants(nextGroups, previous))
  }

  const addOptionGroup = () => {
    if (optionGroups.length >= MAX_OPTION_GROUPS) return
    applyGroups([
      ...optionGroups,
      { id: uuidv4(), name: '', values: [{ id: uuidv4(), value: '' }] },
    ])
  }

  const removeOptionGroup = (id: string) => {
    applyGroups(optionGroups.filter((group) => group.id !== id))
  }

  const renameOptionGroup = (id: string, nextName: string) => {
    applyGroups(
      optionGroups.map((group) =>
        group.id === id ? { ...group, name: nextName } : group
      )
    )
  }

  const addOptionValue = (id: string) => {
    applyGroups(
      optionGroups.map((group) =>
        group.id === id
          ? { ...group, values: [...group.values, { id: uuidv4(), value: '' }] }
          : group
      )
    )
  }

  const updateOptionValue = (
    id: string,
    valueId: string,
    nextValue: string
  ) => {
    applyGroups(
      optionGroups.map((group) =>
        group.id === id
          ? {
              ...group,
              values: group.values.map((item) =>
                item.id === valueId ? { ...item, value: nextValue } : item
              ),
            }
          : group
      )
    )
  }

  const removeOptionValue = (id: string, valueId: string) => {
    applyGroups(
      optionGroups.map((group) =>
        group.id === id
          ? {
              ...group,
              values: group.values.filter((item) => item.id !== valueId),
            }
          : group
      )
    )
  }

  const updateVariantQuantity = (key: string, nextQuantity: string) => {
    setVariants((previous) =>
      previous.map((variant) =>
        variant.key === key ? { ...variant, quantity: nextQuantity } : variant
      )
    )
  }

  const toggleVariantSaleStatus = (key: string) => {
    setVariants((previous) =>
      previous.map((variant) =>
        variant.key === key
          ? {
              ...variant,
              saleStatus:
                variant.saleStatus === 'active' ? 'inactive' : 'active',
            }
          : variant
      )
    )
  }

  const reset = () => {
    setName(seed.name)
    setCategoryId(seed.categoryId)
    setPrice(seed.price)
    setQuantity(seed.quantity)
    setOptionGroups(seed.optionGroups)
    setVariants(seed.variants)
    setFiles([])
  }

  // 送出前的 UX 驗證（送出時 createProduct/updateProduct 會再用 zod 驗一次）。
  const validate = (): boolean => {
    if (name.trim() === '') {
      toast.error('請輸入商品名稱')
      return false
    }
    if (categoryId === '') {
      toast.error('請選擇商品類別')
      return false
    }
    const priceNumber = Number(price)
    if (price.trim() === '' || Number.isNaN(priceNumber) || priceNumber <= 0) {
      toast.error('請輸入有效價格')
      return false
    }

    if (!hasVariants) {
      if (!isValidQuantity(quantity)) {
        toast.error('請輸入有效的庫存數量')
        return false
      }
      return true
    }

    const names = optionGroups.map((group) => group.name.trim())
    if (names.some((groupName) => groupName === '')) {
      toast.error('規格類型名稱不得為空')
      return false
    }
    if (new Set(names).size !== names.length) {
      toast.error('規格類型名稱不得重複')
      return false
    }
    for (const group of optionGroups) {
      const values = group.values.map((item) => item.value.trim())
      if (values.length === 0 || values.some((value) => value === '')) {
        toast.error(`規格「${group.name}」的選項值不得為空`)
        return false
      }
      if (new Set(values).size !== values.length) {
        toast.error(`規格「${group.name}」的選項值不得重複`)
        return false
      }
    }
    if (variants.length === 0) {
      toast.error('請至少設定一個規格選項')
      return false
    }
    if (variants.some((variant) => !isValidQuantity(variant.quantity))) {
      toast.error('每個規格的庫存數量必須為有效的非負整數')
      return false
    }
    return true
  }

  const buildCreateBody = (imageIds?: string[]): CreateBody => {
    const base = {
      name: name.trim(),
      category_id: categoryId,
      price: price.trim(),
      ...(imageIds ? { image_ids: imageIds } : {}),
    }

    if (!hasVariants) {
      return { ...base, quantity: Number(quantity) }
    }

    return {
      ...base,
      option_groups: getUsableGroups(optionGroups),
      variants: variants.map((variant) => ({
        option_values: variant.optionValues,
        quantity: Number(variant.quantity),
        sale_status: variant.saleStatus,
      })),
    }
  }

  const submit = async () => {
    try {
      let imageIds: string[] | undefined
      if (files.length > 0) {
        const uploaded = await uploadImagesMutation.mutateAsync(files)
        imageIds = uploaded.data.map((asset) => asset.id)
      }

      const body = buildCreateBody(imageIds)

      if (params.mode === 'edit') {
        await updateProductMutation.mutateAsync({ id: params.productId, body })
        toast.success('商品更新成功')
      } else {
        await createProductMutation.mutateAsync(body)
        toast.success('商品新增成功')
      }

      reset()
      router.push('/product/inventory-list')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  return {
    mode: params.mode,
    fields: {
      name,
      categoryId,
      price,
      quantity,
      files,
      onNameChange: setName,
      onCategoryChange: setCategoryId,
      onPriceChange: setPrice,
      onQuantityChange: setQuantity,
      onFilesChange: setFiles,
    },
    specs: {
      hasVariants,
      optionGroups,
      variants,
      canAddGroup: optionGroups.length < MAX_OPTION_GROUPS,
      onAddGroup: addOptionGroup,
      onRemoveGroup: removeOptionGroup,
      onRenameGroup: renameOptionGroup,
      onAddValue: addOptionValue,
      onUpdateValue: updateOptionValue,
      onRemoveValue: removeOptionValue,
      onVariantQuantityChange: updateVariantQuantity,
      onVariantSaleStatusToggle: toggleVariantSaleStatus,
    },
    categories: {
      items: categoriesQuery.data ?? [],
      isPending: categoriesQuery.isPending,
      isError: categoriesQuery.isError,
    },
    actions: { validate, submit },
    status: {
      isSubmitting:
        uploadImagesMutation.isPending ||
        createProductMutation.isPending ||
        updateProductMutation.isPending,
    },
  }
}
