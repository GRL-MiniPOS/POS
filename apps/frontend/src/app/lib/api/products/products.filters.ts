import {
  FiltersSchema,
  type Filters,
  type NormalizedFilters,
} from '@/app/lib/schemas/products.schema'

export function normalizeFilters(filters: Filters = {}): NormalizedFilters {
  return FiltersSchema.parse(filters)
}
