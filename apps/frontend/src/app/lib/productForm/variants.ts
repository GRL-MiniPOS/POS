import { v4 as uuidv4 } from 'uuid'
import type { Product } from '@/app/lib/schemas/products.schema'
import type { IOptionGroupDraft, IVariantDraft } from '@/app/types/addProduct'

// 商品表單的純運算 helper（無 React 依賴，可單測）：option_groups → variants 矩陣。

// 規格類型完整（有名稱、且至少一個非空選項值）才納入變體矩陣計算。
export function getUsableGroups(groups: IOptionGroupDraft[]) {
  return groups
    .map((group) => ({
      name: group.name.trim(),
      values: Array.from(
        new Set(group.values.map((item) => item.value.trim()).filter(Boolean))
      ),
    }))
    .filter((group) => group.name !== '' && group.values.length > 0)
}

export function makeVariantKey(optionValues: Record<string, string>): string {
  return Object.entries(optionValues)
    .map(([name, value]) => `${name}=${value}`)
    .join('|')
}

// 對所有完整規格類型的選項值取笛卡兒積。
function cartesian(valueLists: string[][]): string[][] {
  return valueLists.reduce<string[][]>(
    (acc, values) => acc.flatMap((prefix) => values.map((v) => [...prefix, v])),
    [[]]
  )
}

// 依最新規格類型重算變體；以 key 比對保留既有變體已填的數量/上下架。
export function reconcileVariants(
  groups: IOptionGroupDraft[],
  previous: IVariantDraft[]
): IVariantDraft[] {
  const usableGroups = getUsableGroups(groups)
  if (usableGroups.length === 0) return []

  const previousByKey = new Map(
    previous.map((variant) => [variant.key, variant])
  )
  const combos = cartesian(usableGroups.map((group) => group.values))

  return combos.map((combo) => {
    const optionValues: Record<string, string> = {}
    usableGroups.forEach((group, index) => {
      optionValues[group.name] = combo[index]
    })
    const key = makeVariantKey(optionValues)
    const existing = previousByKey.get(key)

    return {
      key,
      optionValues,
      quantity: existing?.quantity ?? '',
      saleStatus: existing?.saleStatus ?? 'active',
    }
  })
}

export function isValidQuantity(value: string): boolean {
  if (value.trim() === '') return false
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed >= 0
}

export interface ProductFormSeed {
  name: string
  categoryId: string
  price: string
  quantity: string
  optionGroups: IOptionGroupDraft[]
  variants: IVariantDraft[]
}

export const emptySeed: ProductFormSeed = {
  name: '',
  categoryId: '',
  price: '',
  quantity: '',
  optionGroups: [],
  variants: [],
}

// 由商品詳情種出表單初始值；變體 optionValues 依 group 順序正規化，確保 key 與 reconcile 一致。
export function seedFromProduct(product: Product): ProductFormSeed {
  const sortedGroups = [...product.option_groups].sort(
    (a, b) => a.position - b.position
  )
  const optionGroups: IOptionGroupDraft[] = sortedGroups.map((group) => ({
    id: uuidv4(),
    name: group.name,
    values: group.values.map((value) => ({ id: uuidv4(), value })),
  }))
  const groupNames = sortedGroups.map((group) => group.name)

  const variants: IVariantDraft[] = product.variants.map((variant) => {
    const optionValues: Record<string, string> = {}
    groupNames.forEach((groupName) => {
      optionValues[groupName] = variant.option_values[groupName]
    })
    return {
      key: makeVariantKey(optionValues),
      optionValues,
      quantity: String(variant.quantity),
      saleStatus: variant.sale_status,
    }
  })

  return {
    name: product.name,
    categoryId: product.category?.id ?? '',
    price: String(product.price),
    quantity: product.has_variants ? '' : String(product.quantity),
    optionGroups,
    variants,
  }
}
