import { apiRequest } from '@/app/lib/api/client'
import { IdSchema } from '@/app/lib/schemas/common.schema'
import { normalizeFilters } from './products.filters'
import type {
  CreateBody,
  Filters,
  NormalizedFilters,
  UpdateBody,
} from '@/app/lib/schemas/products.schema'
import {
  BatchDeleteBodySchema,
  BatchDeleteResponseSchema,
  CreateBodySchema,
  CreateResponseSchema,
  DeleteResponseSchema,
  DetailResponseSchema,
  ListResponseSchema,
  UpdateBodySchema,
  UpdateResponseSchema,
} from '@/app/lib/schemas/products.schema'

function buildListPath(filters: NormalizedFilters) {
  const params = new URLSearchParams()

  params.set('page', String(filters.page))
  params.set('limit', String(filters.limit))
  params.set('stockStatus', filters.stockStatus)
  params.set('saleStatus', filters.saleStatus)

  if (filters.search !== undefined) {
    params.set('search', filters.search)
  }
  if (filters.priceMin !== undefined) {
    params.set('priceMin', String(filters.priceMin))
  }
  if (filters.priceMax !== undefined) {
    params.set('priceMax', String(filters.priceMax))
  }
  filters.categories?.forEach((id) => params.append('categories[]', id))
  filters.options?.forEach((value) => params.append('options[]', value))

  return `/products?${params.toString()}`
}

export function getProducts(filters: Filters = {}, signal?: AbortSignal) {
  const normalizedFilters = normalizeFilters(filters)

  return apiRequest(buildListPath(normalizedFilters), ListResponseSchema, {
    signal,
  })
}

export function getProduct(id: string, signal?: AbortSignal) {
  const parsedId = IdSchema.parse(id)

  return apiRequest(`/products/${parsedId}`, DetailResponseSchema, { signal })
}

export function createProduct(body: CreateBody) {
  const parsedBody = CreateBodySchema.parse(body)

  return apiRequest('/products', CreateResponseSchema, {
    method: 'POST',
    body: JSON.stringify(parsedBody),
  })
}

export function updateProduct(id: string, body: UpdateBody) {
  const parsedId = IdSchema.parse(id)
  const parsedBody = UpdateBodySchema.parse(body)

  return apiRequest(`/products/${parsedId}`, UpdateResponseSchema, {
    method: 'PATCH',
    body: JSON.stringify(parsedBody),
  })
}

export function deleteProduct(id: string) {
  const parsedId = IdSchema.parse(id)

  return apiRequest(`/products/${parsedId}`, DeleteResponseSchema, {
    method: 'DELETE',
  })
}

export function batchDeleteProducts(ids: string[]) {
  const parsedBody = BatchDeleteBodySchema.parse({ ids })

  return apiRequest('/products/batch-delete', BatchDeleteResponseSchema, {
    method: 'POST',
    body: JSON.stringify(parsedBody),
  })
}
