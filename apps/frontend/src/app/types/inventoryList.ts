import type { IProductSpec } from './addProduct'

/**
 * 列表顯示用的商品 View Model（由 API Product 轉換而來）
 */
export interface IProduct {
  id: string
  name: string
  category: string
  specification: string // 用於顯示的規格字串
  specifications: IProductSpec[] // 用於 Popover 顯示的結構化數據
  price: string
  inventory: string // 顯示用的庫存文字
  totalStock: number // 總庫存數量
  image: string
}

/**
 * 列表篩選條件（對映後端 GET /products 的 query 參數；server-side 篩選）
 */
export interface IFilterState {
  categories: string[] // 分類 UUID，對映 categories[]
  specifications: string[] // 規格值字串，對映 options[]
  priceMin: number | null
  priceMax: number | null
  stockStatus: 'all' | 'in-stock' | 'out-of-stock'
  saleStatus: 'all' | 'active' | 'inactive'
}

export interface InventoryTableHeaderProps {
  onAddProduct: () => void
  onSearch: (query: string) => void
  filters: IFilterState
  onFiltersChange: (filters: IFilterState) => void
  className?: string
}

export interface InventoryFilterModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: IFilterState
  onFiltersChange: (filters: IFilterState) => void
}

export interface InventoryTableContentProps {
  products: IProduct[]
  selectedRows: Set<string>
  selectAll?: boolean | 'indeterminate'
  onSelectRow: (id: string, checked: boolean) => void
  onSelectAll?: (checked: boolean | 'indeterminate') => void
  onBulkDelete?: () => void
  onEdit?: (id: string) => void
  onDelete: (id: string) => void
}

export interface InventoryPaginationProps {
  currentPage: number
  totalPages: number
  rowsPerPage: number
  totalItems: number
  startIndex: number
  endIndex: number
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rows: number) => void
}

export interface MorphingSearchProps {
  placeholder?: string
  suggestions?: string[]
  onSearch?: (query: string) => void
  className?: string
}

// Filter Modal Section Props
export interface CategoryFilterSectionProps {
  selected: string[]
  onToggle: (id: string) => void
}

export interface SpecificationFilterSectionProps {
  selected: string[]
  onToggle: (value: string) => void
}

export interface PriceRangeSectionProps {
  priceMin: number | null
  priceMax: number | null
  onPriceMinChange: (value: number | null) => void
  onPriceMaxChange: (value: number | null) => void
}

export interface StockStatusSectionProps {
  value: IFilterState['stockStatus']
  onChange: (value: IFilterState['stockStatus']) => void
}

export interface SaleStatusSectionProps {
  value: IFilterState['saleStatus']
  onChange: (value: IFilterState['saleStatus']) => void
}

export interface IDeleteDialogState {
  open: boolean
  type: 'single' | 'bulk' | null
  productId?: string
  selectedCount?: number
}
