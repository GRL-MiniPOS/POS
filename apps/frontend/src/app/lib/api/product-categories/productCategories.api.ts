import { apiRequest } from '@/app/lib/api/client'
import { normalizeFilters } from './productCategories.filters'
import type {
  CreateBody,
  Filters,
  NormalizedFilters,
  ReorderBody,
  UpdateBody,
} from '@/app/lib/schemas/productCategories.schema'
import {
  CreateBodySchema,
  CreateResponseSchema,
  DeleteResponseSchema,
  IdSchema,
  ListResponseSchema,
  ReorderBodySchema,
  ReorderResponseSchema,
  UpdateBodySchema,
  UpdateResponseSchema,
} from '@/app/lib/schemas/productCategories.schema'

function buildListPath(filters: NormalizedFilters) {
  const params = new URLSearchParams()

  params.set('active', String(filters.active))

  if (filters.parentId !== undefined) {
    params.set('parent_id', filters.parentId ?? '')
  }

  const query = params.toString()
  return `/product-categories${query ? `?${query}` : ''}`
}

export function getProductCategories(
  filters: Filters = {},
  signal?: AbortSignal
) {
  const normalizedFilters = normalizeFilters(filters)
  return apiRequest(buildListPath(normalizedFilters), ListResponseSchema, {
    signal,
  })
}

export function createProductCategory(body: CreateBody) {
  const parsedBody = CreateBodySchema.parse(body)

  return apiRequest('/product-categories', CreateResponseSchema, {
    method: 'POST',
    body: JSON.stringify(parsedBody),
  })
}

export function deleteProductCategory(id: string) {
  const parsedId = IdSchema.parse(id)

  return apiRequest(`/product-categories/${parsedId}`, DeleteResponseSchema, {
    method: 'DELETE',
  })
}

export function updateProductCategory(id: string, body: UpdateBody) {
  const parsedId = IdSchema.parse(id)
  const parsedBody = UpdateBodySchema.parse(body)

  return apiRequest(`/product-categories/${parsedId}`, UpdateResponseSchema, {
    method: 'PATCH',
    body: JSON.stringify(parsedBody),
  })
}

export function reorderProductCategories(body: ReorderBody) {
  const parsedBody = ReorderBodySchema.parse(body)

  return apiRequest('/product-categories/reorder', ReorderResponseSchema, {
    method: 'PATCH',
    body: JSON.stringify(parsedBody),
  })
}
