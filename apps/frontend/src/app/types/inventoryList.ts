export interface IInventoryItem {
  id: string
  name: string
  category: string
  specifications: string[]
  price: number
  stock: number
  selected: boolean
  createdAt: Date
  updatedAt: Date
  image: string
}

export interface IProduct {
  id: string
  name: string
  category: string
  specification: string
  price: string
  inventory: string
  image: string
}

export interface IBasicFilterState {
  categories: string[]
  specifications: string[]
  priceMin: number | null
  priceMax: number | null
  stockStatus: 'all' | 'in-stock' | 'out-of-stock'
}

export interface IFilterState extends IBasicFilterState {
  dateFrom: Date | null
  dateTo: Date | null
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
  onEdit: (id: string) => void
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
  onToggle: (category: string) => void
}

export interface SpecificationFilterSectionProps {
  selected: string[]
  onToggle: (spec: string) => void
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

export interface IDeleteDialogState {
  open: boolean
  type: 'single' | 'bulk' | null
  productId?: string
  selectedCount?: number
}

export interface IEditDialogState {
  open: boolean
  product: IInventoryItem | null
}
