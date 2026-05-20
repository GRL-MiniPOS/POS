---
paths:
  [
    'apps/frontend/src/**/*.tsx',
    'apps/frontend/src/**/*.ts',
    'apps/frontend/src/app/hooks/**/*.ts',
    'apps/frontend/src/app/lib/**/*.ts',
    'apps/frontend/src/app/types/**/*.ts',
    'apps/backend/**/*.go',
    'apps/backend/internal/storage/sql/migration/scripts/**/*.sql',
  ]
---

# 程式碼品質 / Code Quality (準則 8-13)

本文檔涵蓋 POS 專案的程式碼品質準則，目標是讓程式碼容易審查、容易修改，並且符合目前 Next.js 15、React 19、TypeScript、Tailwind CSS 與 Go/Gin backend 的實際架構。

This document covers code quality guidelines for the POS project, keeping code reviewable, maintainable, and aligned with the current Next.js 15, React 19, TypeScript, Tailwind CSS, and Go/Gin backend stack.

---

## 準則 8: 資料邊界與封裝 / Guideline 8: Data Boundaries And Encapsulation

### 說明 / Description

資料邊界要清楚。Hook、component、helper 函式、handler、repository 與 DTO 只暴露呼叫端真正需要的資料與操作，不把內部狀態、setter、暫存資料格式或資料庫原始欄位外洩到不需要知道的地方。

Data boundaries must be explicit. Hooks, components, utilities, handlers, repositories, and DTOs should expose only the data and operations their callers need, without leaking internal state, setters, temporary shapes, or raw database fields.

### 為什麼重要 / Why This Matters

- **易於審查**：介面小，審查者才能快速判斷影響範圍。
- **降低耦合**：內部實作可以替換，不會牽動整個功能。
- **資料流更安全**：敏感欄位、暫存狀態與僅供 UI 使用的格式不會意外流到錯的層。

### Linus 哲學 / Linus Philosophy

> "Bad programmers worry about the code. Good programmers worry about data structures."

Define data boundaries first, then write the flow. Good data structures reduce special cases; bad boundaries pull every caller into internal details.

### 檢查清單 / Checklist

- [ ] Hook 回傳值是否只包含呼叫端需要的狀態與行為？
- [ ] 是否避免把 `setState`、`dispatch` 或原始 mutable object 直接暴露出去？
- [ ] API 回應或模擬資料是否轉成頁面實際使用的 DTO 或 View Model？
- [ ] Backend handler 是否只處理 HTTP 輸入輸出，避免把 SQL 或資料庫細節推到 handler？
- [ ] Repository 是否只回傳 model 或明確結果，不直接組裝前端顯示字串？
- [ ] 顯示用字串與可計算資料是否分清楚，例如價格數值與顯示文字？
- [ ] 錯誤訊息是否避免暴露 token、路徑、SQL、stack trace 或內部欄位？

### 範例 / Examples

**不推薦 ❌ - 把內部狀態整包丟出去**:

```tsx
export function useInventory() {
  const [items, setItems] = useState<IInventoryItem[]>([])
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())

  return { items, setItems, selectedRows, setSelectedRows }
}
```

**推薦 ✅ - 暴露業務操作與穩定介面**:

```tsx
interface InventoryListResult {
  tableData: {
    products: IProduct[]
    selectedRows: Set<string>
  }
  actions: {
    onSelectRow: (id: string, checked: boolean) => void
    onDelete: (id: string) => void
  }
}

export function useInventoryList(): InventoryListResult {
  // Internal state stays here.
  return { tableData, actions }
}
```

**推薦 ✅ - 在邊界轉換成 View Model**:

```ts
export function toProductViewModel(item: IInventoryItem): IProduct {
  const totalStock = calculateTotalStock(item)

  return {
    id: item.id,
    name: item.name,
    category: item.category,
    specification: item.specifications.map((spec) => spec.name).join(', '),
    specifications: item.specifications,
    price: `NT$ ${item.price.toLocaleString()}`,
    inventory: totalStock === 0 ? '缺貨' : `${totalStock} 件`,
    totalStock,
    image: item.image,
  }
}
```

**推薦 ✅ - Backend 在 DTO 邊界轉換回應格式**:

```go
func ToProductDetailResponse(p *model.ProductWithDetails) ProductDetailResponse {
	resp := ToProductResponse(p)
	return ProductDetailResponse(resp)
}
```

### 常見陷阱 / Common Pitfalls

**陷阱 1: 把 UI 暫存格式當成領域模型**

```ts
// ❌ quantity 在輸入框中是 string，卻直接存成庫存資料
const productSpec = { name, quantity: quantityInput }

// ✅ 儲存前明確轉換與驗證
const quantity = Number.parseInt(quantityInput, 10)
if (Number.isNaN(quantity) || quantity < 0) return
const productSpec = { name, quantity }
```

**陷阱 2: 為了方便直接暴露 setter**

```tsx
// ❌ 呼叫端可以繞過驗證與副作用
return { filters, setFilters }

// ✅ 對外提供有語意的操作
return { filters, updateFilters, resetFilters }
```

### 參考現有實作 / Reference Implementation

專案中的參考範例：

- `apps/frontend/src/app/hooks/inventory-list/useInventoryList.ts` - 將 table、pagination、filters、dialogs、actions 分組回傳。
- `apps/frontend/src/app/lib/inventoryUtils.ts` - 將 inventory item 轉成 UI 需要的 Product View Model。
- `apps/backend/internal/dto/product.go` - 將 backend model 轉成 API response。
- `apps/backend/internal/repository/product.go` - 將 SQL 與 transaction 細節限制在 repository。

### 自動化 / Automation

- **TypeScript**: `pnpm --filter frontend run type-check`
- **Go**: backend 變更後執行 `cd apps/backend && go test ./...`
- **Git Hook**: Husky pre-commit 會執行 type-check 與 staged lint/format。

---

## 準則 9: 命名與語意 / Guideline 9: Naming And Semantics

### 說明 / Description

命名要說明資料的角色，而不是留下開發當下的暫時想法。共用、匯出或跨檔案使用的名稱必須清楚；區域暫存名稱可以短，但不能讓讀者猜。

Names should describe the role of the data, not the developer's temporary thought process. Shared, exported, or cross-file names must be explicit; local names can be short only when their meaning is obvious.

### 為什麼重要 / Why This Matters

- **可讀性**：好的名稱讓程式碼自己說明意圖。
- **審查更快**：審查者不需要在多個檔案間推理 `tmp`、`data`、`flag` 是什麼。
- **重構更安全**：名稱與型別一致時，重構比較不容易改錯。

### Linus 哲學 / Linus Philosophy

If a name requires a comment to be understood, the name should usually be changed first. Comments should explain constraints and trade-offs, not clean up after poor naming choices.

### 檢查清單 / Checklist

- [ ] 布林值是否使用 `is`、`has`、`should`、`can` 前綴？
- [ ] 陣列、集合與單一資料是否從名稱能分辨，例如 `products` vs `product`？
- [ ] 是否避免 pinyin、無意義縮寫與 `tmp`、`data`、`obj` 這類跨多行仍不清楚的名稱？
- [ ] 事件 handler 是否遵守 component 內部 `handleXxx`、props 對外 `onXxx`？
- [ ] 常數是否用具名常數說明魔法數字或領域規則？

### 範例 / Examples

**不推薦 ❌ - 名稱需要讀者猜**:

```ts
const d = new Date()
const flg = selectedRows.size > 0
const tmp = products.filter((p) => p.inventory !== '缺貨')

function proc(data: unknown) {
  return data
}
```

**推薦 ✅ - 名稱表達語意**:

```ts
const currentDate = new Date()
const hasSelectedRows = selectedRows.size > 0
const inStockProducts = products.filter((product) => product.totalStock > 0)

function normalizeInventoryItem(item: IInventoryItem): IProduct {
  return toProductViewModel(item)
}
```

**推薦 ✅ - 事件命名分清楚輸入與輸出**:

```tsx
interface InventoryTableProps {
  onDelete: (id: string) => void
}

function InventoryTable({ onDelete }: InventoryTableProps) {
  const handleDeleteClick = (id: string) => {
    onDelete(id)
  }
}
```

### 常見陷阱 / Common Pitfalls

**陷阱 1: 型別與名稱不一致**

```ts
// ❌ 名稱看起來是單筆，實際是陣列
const product = products.filter((item) => item.totalStock > 0)

// ✅ 名稱反映資料結構
const availableProducts = products.filter((item) => item.totalStock > 0)
```

**陷阱 2: 否定命名製造雙重否定**

```ts
// ❌ 難讀
const isNotDisabled = false
if (!isNotDisabled) return

// ✅ 用肯定語意
const isEnabled = true
if (!isEnabled) return
```

### 參考現有實作 / Reference Implementation

專案中的參考範例：

- `apps/frontend/src/app/types/inventoryList.ts` - props interface 與 inventory 領域型別集中定義。
- `apps/frontend/src/app/hooks/inventory-list/useInventoryPagination.ts` - pagination 狀態名稱直接對應 UI 使用方式。

### 自動化 / Automation

- **TypeScript**: 型別與 interface 可輔助發現名稱和資料結構不一致。
- **Git Hook**: Husky pre-commit 不阻擋命名問題。

---

## 準則 10: 函數拆分與控制流 / Guideline 10: Function Splitting And Control Flow

### 說明 / Description

函數應短而直接。優先用資料結構、提前 return 與小 helper 函式降低巢狀，而不是把一段難懂邏輯壓縮成更難懂的一行。

Functions should be short and direct. Prefer data structure choices, early returns, and small helpers to reduce nesting, instead of compressing hard logic into harder one-liners.

### 為什麼重要 / Why This Matters

- **降低認知負荷**：讀者能一次理解一個責任。
- **更容易測試**：小函數比較容易用聚焦測試保護。
- **行為更清楚**：淺層控制流讓錯誤路徑更明顯。

### Linus 哲學 / Linus Philosophy

> "If you need more than three levels of indentation, you're screwed and should fix your program."

Deep nesting is usually not an indentation problem but a data flow or responsibility boundary problem. Flatten the main flow first, then decide whether to split functions.

### 檢查清單 / Checklist

- [ ] 函數是否能用一句話說明責任？
- [ ] 巢狀是否維持在 3 層以內？
- [ ] 是否能用提前 return 處理 invalid、loading、permission 等阻擋條件？
- [ ] 是否避免把驗證、轉換、API 變更操作、UI state 全塞進同一個函數？
- [ ] 拆出的 helper 函式是否有清楚名稱，而不是只為了降低行數？

### 範例 / Examples

**不推薦 ❌ - 主流程被阻擋條件包住**:

```tsx
async function handleSave() {
  if (isValid) {
    if (hasPermission) {
      if (selectedProduct) {
        await saveProduct(selectedProduct)
        toast('已儲存')
      }
    }
  }
}
```

**推薦 ✅ - 提前 return 讓主流程在最外層**:

```tsx
async function handleSave() {
  if (!isValid) return
  if (!hasPermission) return
  if (!selectedProduct) return

  await saveProduct(selectedProduct)
  toast('已儲存')
}
```

**推薦 ✅ - 按責任拆分資料處理**:

```ts
export function buildProductRows(items: IInventoryItem[]): IProduct[] {
  return items
    .map(toProductViewModel)
    .filter((product) => product.totalStock > 0)
}
```

### 常見陷阱 / Common Pitfalls

**陷阱 1: 為每兩行建立 helper 函式**

```ts
// ❌ 抽象沒有降低理解成本
function addOne(value: number) {
  return value + 1
}

// ✅ 簡單運算保持直接
const nextPage = currentPage + 1
```

**陷阱 2: 用巢狀 callback 隱藏流程**

```ts
// ❌ 每層都改變上下文
products.forEach((product) => {
  product.specifications.forEach((spec) => {
    if (spec.quantity > 0) {
      rows.push({ product, spec })
    }
  })
})

// ✅ 用命名 helper 函式表達資料轉換
const rows = products.flatMap(buildSpecificationRows)
```

### 參考現有實作 / Reference Implementation

專案中的參考範例：

- `apps/frontend/src/app/hooks/inventory-list/useInventoryPagination.ts` - 分頁計算集中在一個 hook，對外介面清楚。
- `apps/frontend/src/app/hooks/inventory-list/useInventorySearch.ts` - 搜尋字串整理與 filter 流程放在同一個局部區塊。

### 自動化 / Automation

- **TypeScript**: `pnpm --filter frontend run type-check`
- **Git Hook**: Husky pre-commit 不阻擋函數長度問題。

---

## 準則 11: 重構取捨與替代方案 / Guideline 11: Refactoring Trade-offs And Alternatives

### 說明 / Description

重構要服務當前問題。看到重複、特殊情況或難以審查的流程時，先找能刪掉分支或縮小邊界的替代做法；不要為了「看起來進階」新增模式、類別或依賴。

Refactoring must serve the current problem. When duplication, special cases, or hard-to-review flow appears, compare alternatives that remove branches or shrink boundaries. Do not add patterns, classes, or dependencies just to look advanced.

### 為什麼重要 / Why This Matters

- **真正的可維護性**：重構應降低未來修改成本，不是換一種複雜。
- **變更更小**：替代方案清楚時，PR 更容易審。
- **更少邊界情況**：把特殊情況變成一般流程，出錯範圍自然變小。

### Linus 哲學 / Linus Philosophy

> "Sometimes you can look at a problem from a different angle, rewrite it so the special case disappears and becomes the normal case."

Good taste is not about adding more abstraction — it is about making exceptions disappear. The best refactors usually delete code.

### 檢查清單 / Checklist

- [ ] 這次重構是否解決具體 bug、重複或維護成本？
- [ ] 是否先比較 2 種以上可行做法，再選最小的一種？
- [ ] 是否能用資料表、Map、查表或標準 API 消除分支？
- [ ] 抽象是否已出現穩定重複，而不是第一次使用就抽？
- [ ] PR 是否避免混入格式化、搬檔、功能與重構多種不相關改動？

### 範例 / Examples

**不推薦 ❌ - 用分支堆疊狀態規則**:

```ts
function getStockLabel(totalStock: number) {
  if (totalStock === 0) return '缺貨'
  if (totalStock > 0) return `${totalStock} 件`
  return '未知'
}
```

**推薦 ✅ - 先修資料不變式，讓特殊情況消失**:

```ts
function getStockLabel(totalStock: number) {
  return totalStock === 0 ? '缺貨' : `${totalStock} 件`
}
```

**推薦 ✅ - 穩定重複後才抽資料表**:

```ts
const STOCK_STATUS_LABEL: Record<IFilterState['stockStatus'], string> = {
  all: '全部',
  'in-stock': '有庫存',
  'out-of-stock': '缺貨',
}
```

### 常見陷阱 / Common Pitfalls

**陷阱 1: 為單一使用情境建立策略模式**

```ts
// ❌ 目前只有 inventory 一種資料，卻先做多層 strategy
interface ExportStrategy {
  export(items: unknown[]): string
}

// ✅ 先寫目前需要的函數
function exportInventoryItems(items: IInventoryItem[]): string {
  return JSON.stringify(items)
}
```

**陷阱 2: 重構 PR 偷渡行為變更**

```ts
// ❌ 名義上重構，實際也改了篩選語意
const filtered = products.filter((product) => product.totalStock >= 0)

// ✅ 重構只改結構，不改結果
const filtered = products.filter(isProductVisible)
```

### 參考現有實作 / Reference Implementation

專案中的參考範例：

- `apps/frontend/src/app/lib/strategies/` - 當 category 行為已形成穩定差異時再集中策略。
- `apps/frontend/src/app/hooks/inventory-list/` - 將 inventory list 的搜尋、分頁、選取、編輯與刪除拆成可審查的小單元。

### 自動化 / Automation

- **TypeScript**: 可保護重構後的型別契約。
- **Git Hook**: Husky pre-commit 可攔截型別與 staged lint/format 問題。

---

## 準則 12: 框架正確性 / Guideline 12: Framework Correctness

### 說明 / Description

前端 Hooks 先求正確，再談優化；後端 handler、repository 與 migration 先守住資料不變式，再談抽象。`useEffect` 應用來同步外部系統，不應拿來搬運可由 props 或 state 直接推導的資料。Go handler 應處理 HTTP 驗證與回應，repository 應處理資料存取與 transaction，不互相偷責任。

Frontend hooks should be correct before optimized; backend handlers, repositories, and migrations should protect data invariants before adding abstraction. `useEffect` should synchronize with external systems, not move data that can be derived from props or state. Go handlers should handle HTTP validation and responses; repositories should handle persistence and transactions.

### 為什麼重要 / Why This Matters

- **狀態可預期**：可由既有資料推導的值不另存 state，資料來源才單一。
- **避免過期閉包**：完整 dependency 可避免讀到舊資料與難追的 bug。
- **有效的效能調整**：memo 只用在測量後需要的地方，不製造額外心智負擔。
- **後端邊界清楚**：HTTP、DTO、SQL 與 transaction 各守各的位置，問題才容易定位。

### Linus 哲學 / Linus Philosophy

Reliability comes from simple data flow. Every redundant state, missing dependency, unnecessary memo, or handler/repository shortcut that bleeds responsibilities is a special case that will need maintaining in the future.

### 檢查清單 / Checklist

- [ ] Hook 是否只在 React component 或 custom hook 的頂層呼叫？
- [ ] `useEffect` dependency 是否完整？
- [ ] timer、event listener、subscription、object URL、abortable async work 是否清理？
- [ ] 可由現有資料計算的值是否避免放入 `useState`？
- [ ] `useMemo` 或 `useCallback` 是否有實際目的，例如昂貴計算或 memoized child？
- [ ] Handler 是否完成 request validation，並回傳統一的 DTO response？
- [ ] Repository 是否使用 `context.Context`、parameterized query 與 transaction helper，而不是手組 SQL 字串？
- [ ] Migration 是否有成對 up/down，且欄位預設值與現有資料相容？

### 範例 / Examples

**不推薦 ❌ - 用 Effect 同步可推導的 state**:

```tsx
const [items, setItems] = useState<IProduct[]>([])
const [count, setCount] = useState(0)

useEffect(() => {
  setCount(items.length)
}, [items])
```

**推薦 ✅ - 直接推導**:

```tsx
const [items, setItems] = useState<IProduct[]>([])
const count = items.length
const isEmpty = count === 0
```

**推薦 ✅ - Effect 連接外部系統並提供 cleanup**:

```tsx
useEffect(() => {
  const controller = new AbortController()

  void fetchProducts({ signal: controller.signal })

  return () => controller.abort()
}, [])
```

### 常見陷阱 / Common Pitfalls

**陷阱 1: 缺 dependency 讓資料過期**

```tsx
// ❌ userId 變了也不會重新同步
useEffect(() => {
  void fetchOrders(userId)
}, [])

// ✅ dependency 反映 effect 使用的外部值
useEffect(() => {
  void fetchOrders(userId)
}, [userId])
```

**陷阱 2: 為普通 callback 預設加 `useCallback`**

```tsx
// ❌ child 沒有 memo 時，穩定 callback 沒有實際收益
const handleClick = useCallback(() => setOpen(true), [])
return <RegularButton onClick={handleClick} />

// ✅ 先保持直接
return <RegularButton onClick={() => setOpen(true)} />
```

**推薦 ✅ - Backend handler 與 repository 各守邊界**:

```go
func (h *Handler) GetProduct(c *gin.Context) {
	id := c.Param("id")
	if !validateUUIDField(c, "id", id) {
		return
	}

	product, err := h.productRepo.GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Success: false,
			Error: dto.ErrorDetail{
				Code:    dto.ErrCodeInternalServerError,
				Message: "無法獲取商品",
			},
		})
		return
	}
	if product == nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{
			Success: false,
			Error: dto.ErrorDetail{
				Code:    dto.ErrCodeProductNotFound,
				Message: "商品不存在",
			},
		})
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{
		Success: true,
		Data:    dto.ToProductDetailResponse(product),
	})
}
```

### 參考現有實作 / Reference Implementation

專案中的參考範例：

- `apps/frontend/src/app/hooks/inventory-list/useInventoryPagination.ts` - 使用 memo 計算分頁顯示資料，並用 Effect 修正頁碼邊界。
- `apps/frontend/src/app/hooks/inventory-list/useInventorySearch.ts` - 將搜尋字串整理放在 memo 計算內。
- `apps/backend/internal/handler/product.go` - handler 先驗證 request，再呼叫 repository，最後回傳 DTO。
- `apps/backend/internal/storage/sql/migration/scripts/` - migration 以 up/down 成對保存資料結構變更。

### 自動化 / Automation

- **ESLint**: `next/core-web-vitals` 與 `next/typescript` 會涵蓋 React Hooks 相關規則。
- **TypeScript**: `pnpm --filter frontend run type-check`
- **Go**: backend 變更後執行 `cd apps/backend && go test ./...`
- **Git Hook**: Husky pre-commit 會執行 type-check 與 staged lint/format。

---

## 準則 13: 最小可行實作 / Guideline 13: Smallest Working Implementation

### 說明 / Description

選擇能解決當前問題的最小實作。不要預先加入框架、依賴、泛型層、設定檔或抽象層。新增複雜度前，先說明它解決的真實問題與取捨。

Choose the smallest implementation that solves the current problem. Do not pre-add frameworks, dependencies, generic layers, config, or abstractions. Before adding complexity, state the real problem it solves and the trade-off.

### 為什麼重要 / Why This Matters

- **需要維護的部分更少**：依賴與抽象越少，維護面越小。
- **回饋更快**：簡單實作比較容易 type-check、lint、build 與人工驗證。
- **責任歸屬清楚**：工程師能理解為什麼這段 code 存在，以及何時該刪。

### Linus 哲學 / Linus Philosophy

Code must serve real problems. Future requirements with no evidence today should not become complexity that everyone must maintain today.

### 檢查清單 / Checklist

- [ ] 是否能用現有 helper 函式、component、type 或標準 API 解決？
- [ ] 新依賴是否有明確必要性，且已確認專案尚未提供等價能力？
- [ ] 新抽象是否至少有穩定重複或明確邊界需求？
- [ ] 是否避免為「未來可能」新增 config、flag 或 generic framework？
- [ ] 若是最佳化，是否有測量結果或可重現觀察支持？

### 範例 / Examples

**不推薦 ❌ - 為簡單需求新增抽象層**:

```ts
class DateLabelFormatter {
  constructor(private locale: string) {}

  format(value: Date) {
    return value.toLocaleDateString(this.locale)
  }
}

const dateLabelFormatter = new DateLabelFormatter('zh-TW')
const label = dateLabelFormatter.format(value)
```

**推薦 ✅ - 優先使用標準 API 或既有依賴**:

```ts
export function formatDateLabel(value: Date) {
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(value)
}
```

**推薦 ✅ - 專案已有 `date-fns` 時再使用它**:

```ts
import { format } from 'date-fns'

export function formatDateKey(value: Date) {
  return format(value, 'yyyy-MM-dd')
}
```

### 常見陷阱 / Common Pitfalls

**陷阱 1: 第一次重複就抽象**

```tsx
// ❌ 模式尚未穩定就建立萬用工廠
function createFormFieldRenderer(config: FieldConfig) {
  return function FieldRenderer() {
    return <input {...config} />
  }
}

// ✅ 先寫清楚，等重複穩定再抽
function ProductNameField(props: ProductNameFieldProps) {
  return <Input value={props.value} onChange={props.onChange} />
}
```

**陷阱 2: 泛型把領域語意洗掉**

```ts
// ❌ 呼叫端不知道 T、U、V 在 POS 領域代表什麼
function processData<T, U, V>(data: T[], mapper: (item: T) => U): V[] {
  return data.map(mapper) as V[]
}

// ✅ 讓函數名稱和型別保留領域語意
function buildInventoryRows(items: IInventoryItem[]): IProduct[] {
  return items.map(toProductViewModel)
}
```

### 參考現有實作 / Reference Implementation

專案中的參考範例：

- `apps/frontend/src/app/components/atoms/` - 優先複用既有 shadcn/Radix-based primitive。
- `apps/frontend/src/app/lib/utils.ts` - 通用 helper 函式集中在小範圍內，不為單一頁面擴張全域抽象。

### 自動化 / Automation

- **Package Scripts**: frontend 大改動後至少執行 `pnpm --filter frontend run type-check` 與 `pnpm --filter frontend run lint`。
- **Go**: backend 大改動後至少執行 `cd apps/backend && go test ./...`。
- **Git Hook**: Husky pre-commit 可攔截型別與 staged lint/format 問題。

---

## 相關文檔 / Related Documents

- [AGENTS.md](../../AGENTS.md) - Linus Torvalds 開發哲學
- [README.md](README.md) - 準則總覽
- [01-component-standards.md](01-component-standards.md) - 組件生命週期與規範
- [09-typescript.md](09-typescript.md) - TypeScript 專案規則
- [apps/backend/SWAGGER.md](../../apps/backend/SWAGGER.md) - Backend API 文件更新流程
- [apps/frontend/CLAUDE.md](../../apps/frontend/CLAUDE.md) - 前端專案開發規範

---

**最後更新 / Last Updated**: 2026-05-13
**維護者 / Maintainer**: POS Team
