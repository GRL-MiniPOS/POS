# 專案開發規範

## 技術棧

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Radix UI + shadcn/ui 組件系統

## 專案結構

```
apps/frontend/
├── src/
│   └── app/
│       ├── components/          # UI 組件（Atomic Design）
│       │   ├── atoms/          # 原子組件：Button, Input, Label 等
│       │   │   ├── button/
│       │   │   ├── input.tsx
│       │   │   └── index.tsx   # 統一導出
│       │   ├── molecules/      # 分子組件：SearchBar, FormField 等
│       │   │   ├── sidebar/
│       │   │   ├── order/
│       │   │   ├── stock/
│       │   │   ├── inventoryList/
│       │   │   ├── addProduct/
│       │   │   ├── chart/
│       │   │   ├── dragAndDrop/
│       │   │   └── index.tsx
│       │   ├── organisms/      # 有機體組件：Header, Sidebar 等
│       │   │   ├── sidebar/
│       │   │   ├── chart/
│       │   │   ├── dragAndDrop/
│       │   │   └── index.tsx
│       │   ├── templates/      # 模板組件（如需要）
│       │   └── pages/          # 頁面級組件（如需要）
│       │
│       ├── hooks/              # 自定義 React Hooks
│       │   ├── useFetch.ts
│       │   └── useAuth.ts
│       │
│       ├── lib/                # 工具函數和輔助模組
│       │   ├── utils.ts        # 通用工具函數
│       │   ├── strategies/     # 策略模式實現
│       │   └── api.ts          # API 相關函數
│       │
│       ├── types/              # TypeScript 類型定義
│       │   ├── inventoryList.ts
│       │   ├── product.ts
│       │   └── user.ts
│       │
│       ├── fonts/              # 自定義字體文件
│       │
│       ├── product/            # 產品功能模組
│       │   ├── add-product/
│       │   │   └── page.tsx
│       │   ├── inventory-list/
│       │   │   ├── page.tsx
│       │   │   └── mock/       # 模擬數據
│       │   └── category-management/
│       │       └── page.tsx
│       │
│       ├── order/              # 訂單功能模組
│       │   ├── all-orders/
│       │   │   └── page.tsx
│       │   └── create-order/
│       │       └── page.tsx
│       │
│       ├── customer/           # 客戶功能模組
│       │   └── page.tsx
│       │
│       ├── report/             # 報表功能模組
│       │   └── page.tsx
│       │
│       ├── layout.tsx          # 根佈局
│       ├── page.tsx            # 首頁
│       └── globals.css         # 全局樣式
│
├── public/                     # 靜態資源
│   ├── images/
│   └── icons/
│
├── docs/                       # 專案文檔
│   ├── Practical-UI.pdf
│   └── design-index.md
│
├── .env.local                  # 環境變數（不提交到 git）
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── CLAUDE.md                   # AI 開發規範（本文件）
└── AI_CODE_REVIEW.md          # AI Code Review 規範
```

### 目錄組織原則

#### 📁 Components（組件目錄）
- **atoms/**：最基礎的 UI 元素，不可再分割
  - 每個組件一個檔案，複雜組件可使用目錄
  - 必須在 `index.tsx` 統一導出

- **molecules/**：2-5 個 atoms 組成的簡單組合
  - 按功能分類放在子目錄（如 `sidebar/`, `order/`）
  - 必須在 `index.tsx` 統一導出

- **organisms/**：複雜的功能區塊
  - 可包含複雜業務邏輯
  - 按功能模組組織

- **templates/** 和 **pages/**：根據需要建立

#### 📁 功能模組目錄（product/, order/ 等）
- 遵循 Next.js App Router 規範
- 每個路由一個 `page.tsx`
- 可包含功能專屬的子目錄（如 `mock/`, `components/`）
- 佈局使用 `layout.tsx`

#### 📁 共用資源目錄
- **hooks/**：可重用的 React Hooks
- **lib/**：工具函數、API 客戶端、策略模式等
- **types/**：共用的 TypeScript 類型定義
- **fonts/**：自定義字體文件

### 檔案命名規範

```typescript
// 組件文件
productCard.tsx              // ✅ 使用 camelCase
ProductCard.tsx              // ❌ 避免 PascalCase
product-card.tsx             // ❌ 避免 kebab-case

// Hook 文件
useProductList.ts            // ✅ 以 use 開頭
productListHook.ts           // ❌

// 類型文件
product.ts                   // ✅ 簡潔命名
productTypes.ts              // ❌ 不需要 Types 後綴

// 測試文件
productCard.test.tsx         // ✅
productCard.spec.tsx         // ✅
```

### Import 路徑規範

```typescript
// ✅ 使用絕對路徑（推薦）
import { Button, Input } from '@/app/components/atoms'
import { ProductCard } from '@/app/components/molecules'
import type { Product } from '@/app/types/product'
import { useAuth } from '@/app/hooks/useAuth'

// ✅ 相對路徑（同目錄或子目錄）
import { ProductFilter } from './productFilter'
import { helper } from '../utils'

// ❌ 避免複雜的相對路徑
import { Button } from '../../../components/atoms/button'
```

## Code Review 規範

**完整規範文件**：@AI_CODE_REVIEW.md

所有提交的代碼都應該遵循 AI Code Review 規範，確保代碼品質、類型安全、性能優化和安全性。

### Code Review 重點檢查項目

#### Critical（必須檢查）

- ❌ **禁止使用 `any` 類型**：所有變數、函數參數、useState 都必須有明確類型
- ❌ **禁止使用 `@ts-ignore`**：不允許忽略 TypeScript 錯誤
- ⚠️ **useEffect 依賴完整**：所有外部變數都必須在依賴數組中
- ⚠️ **副作用清理**：所有 timer、listener、subscription 都必須清理
- 🔒 **無硬編碼密鑰**：使用環境變數管理敏感資訊

#### Important（應該檢查）

- 📦 **組件大小**：單個組件不超過 200 行，遵循單一職責
- 🎯 **Props 設計**：Props 不超過 7 個，提供預設值
- ⚡ **性能基本要求**：列表項有唯一 key、大列表分頁、圖片使用 Next.js Image
- ⚠️ **避免過早優化**：不要預設使用 memo/useCallback/useMemo，除非有實測性能問題
- 🎨 **使用 Tailwind CSS**：禁止內聯樣式和 CSS-in-JS
- ♿ **可訪問性**：按鈕有 aria-label、圖片有 alt、表單有 label

#### Nice to have（建議檢查）

- 💅 **命名規範**：組件 PascalCase、函數 camelCase、布林值 is/has 前綴
- 🧹 **代碼整潔**：移除 console.log、註解代碼、未處理的 TODO
- 📝 **測試覆蓋**：新組件有測試，覆蓋率 > 70%

詳細檢查清單和範例請參考：@AI_CODE_REVIEW.md

## UI 設計規範

**主要設計參考**：@docs/Practical-UI-2nd-edition.pdf *(需額外取得，見 @docs/README.md)*
**設計索引**：@docs/design-index.md *(必讀，包含完整索引)*

> ⚠️ **重要說明**：
> Practical-UI-2nd-edition.pdf（第二版）因版權和檔案大小（166MB）原因未包含在版本控制中。
> 團隊成員請參考 @docs/README.md 了解如何向版權人索取並放置此文件。
>
> **沒有 PDF 也能開發**：`design-index.md` 已包含主要設計原則摘要。

所有 UI 組件的設計、佈局、顏色、間距、字體等視覺規範，都應參考 Practical UI 設計文件。

### 設計原則

- 設計前先查閱 @docs/design-index.md 找到相關章節
- 遵循以下核心原則：
  - **極簡主義**：移除不必要的元素，降低認知負荷
  - **一致性**：保持視覺和互動的一致性
  - **可訪問性**：確保介面對所有使用者可用
  - **清晰層級**：使用色彩、間距、字體建立清晰的視覺層級

### 組件組合 UI 處理原則

當組件需要組合使用時（特別是垂直或水平堆疊），必須注意以下原則：

#### 1. 圓角處理（Border Radius）

- **問題**：組件上下組合時，如果每個組件都設置完整的四邊圓角，會造成視覺斷層
- **解決方案**：
  - 由外層 container 統一處理圓角
  - 堆疊組件中，只有首尾元素需要對應方向的圓角
  - 中間元素不需要圓角
- **範例**：

  ```tsx
  // ❌ 錯誤：每個項目都有圓角
  <div className="rounded-lg">Item 1</div>
  <div className="rounded-lg">Item 2</div>
  <div className="rounded-lg">Item 3</div>

  // ✅ 正確：由容器統一處理，或首尾分別處理
  <div className="rounded-lg overflow-hidden">
    <div>Item 1</div>
    <div>Item 2</div>
    <div>Item 3</div>
  </div>

  // ✅ 或者：首尾元素個別處理
  <div className="rounded-t-lg">Item 1</div>
  <div>Item 2</div>
  <div className="rounded-b-lg">Item 3</div>
  ```

#### 2. 邊框處理（Border）

- **問題**：組合組件時邊框可能重疊，造成加粗效果
- **解決方案**：
  - 統一由外層 container 處理邊框
  - 或使用 `border-t-0` 等工具類移除內部重疊邊框
  - 中間元素只保留必要的分隔線

#### 3. 間距處理（Spacing）

- **問題**：每個組件各自設置 padding/margin 會造成間距不一致
- **解決方案**：
  - 容器使用統一的 gap 或 space-y 控制元素間距
  - 內部組件避免設置外部 margin
  - Padding 由各組件內部自行管理

#### 4. 背景色與層次

- **問題**：組合時背景色重疊可能造成視覺混亂
- **解決方案**：
  - 明確定義容器和內容的背景層次
  - 注意對比度，確保可讀性
  - 使用一致的色彩深度系統

### 關鍵設計規範快速參考

> 以下頁碼參考自 Practical-UI-2nd-edition.pdf（如可用）。詳細內容請參考 @docs/design-index.md

- **基礎原則**：第 1 章 (頁 16-53)（建立設計系統、保持一致性、可訪問性、互動狀態）
- **極簡主義**：第 2 章 (頁 55-76)（移除不必要元素、漸進式揭露、減少選擇）
- **色彩系統**：第 3 章 (頁 78-161)（對比度、品牌色、透明色彩、調色板規則）
- **佈局間距**：第 4 章 (頁 163-227)（12 欄網格、間距系統、視覺層級、留白）
- **字體排版**：第 5 章 (頁 229-264)（字體選擇、字級比例、行高、對齊）
- **文案撰寫**：第 6 章 (頁 266-293)（簡潔、一致用詞、句首大寫、錯誤訊息）
- **按鈕設計**：第 7 章 (頁 295-328)（三級權重、左對齊、點擊目標大小）
- **表單設計**：第 8 章 (頁 330-369)（單欄佈局、欄位標籤、驗證方式）

### 設計工作流程

1. 確認要設計的組件類型（Atom/Molecule/Organism）
2. **必須**查閱 @docs/design-index.md 找到相關設計規範章節
3. 如有 Practical-UI.pdf，可參考對應頁碼獲得更詳細說明
4. 如設計規範不明確，應詢問使用者確認
5. 確保最終設計符合專案的視覺一致性

## UI 組件開發（Atomic Design Pattern）

### 組件架構層級

本專案遵循 Atomic Design Pattern，組件依複雜度分為五個層級：

#### 1. Atoms（原子）

**定義**：最基礎、不可再分割的 UI 元素
**位置**：@src/app/components/atoms/
**範例**：Button, Input, Label, Badge, Avatar, Checkbox, Separator
**規則**：

- 單一職責，只做一件事
- 高度可重用
- 不包含業務邏輯
- 通常對應單一 HTML 元素或基礎 Radix UI 組件
- 必須在 @src/app/components/atoms/index.tsx 中 export

#### 2. Molecules（分子）

**定義**：由多個 Atoms 組成的簡單組件群組
**位置**：@src/app/components/molecules/
**範例**：SearchBar (Input + Button), FormField (Label + Input), stockManageListItem
**規則**：

- 由 2-5 個 Atoms 組合而成
- 開始具有簡單的互動功能
- 可包含基礎的狀態管理（useState）
- 參考現有風格：@src/app/components/molecules/stock/stockManageListItem.tsx
- 按功能分類放在子目錄（如 stock/, inventoryList/）
- 必須在 @src/app/components/molecules/index.tsx 中 export

#### 3. Organisms（有機體）

**定義**：由 Molecules 和 Atoms 組成的較複雜 UI 區塊
**位置**：@src/app/components/organisms/（如需要可建立）
**範例**：Header, Sidebar, ProductTable, InventoryPanel
**規則**：

- 形成明確的介面區域
- 可包含複雜的業務邏輯
- 可能需要接收 API 資料或管理複雜狀態
- 具有完整的功能性

#### 4. Templates（模板）

**定義**：定義頁面結構的佈局組件
**位置**：@src/app/components/templates/（如需要可建立）
**範例**：DashboardLayout, ProductPageLayout
**規則**：

- 定義頁面的整體結構和佈局
- 使用 slot/children pattern 來放置具體內容
- 不包含具體的業務資料

#### 5. Pages（頁面）

**定義**：具體的頁面實例，組合 Templates 和 Organisms
**位置**：@src/app/\*/page.tsx（Next.js App Router 規範）
**範例**：@src/app/product/add-product/page.tsx, @src/app/product/inventory-list/page.tsx
**規則**：

- 遵循 Next.js App Router 的檔案結構
- 負責資料獲取和頁面級狀態管理
- 將資料傳遞給下層組件

### 組件開發通用規則

- 所有組件必須使用 TypeScript，定義完整的 Props interface
- 使用 Tailwind CSS utility classes 進行樣式設計
- 遵循現有組件的 className 命名模式
- 優先使用 Radix UI 底層組件（已安裝：dialog, select, checkbox, scroll-area, popover, tooltip 等）
- 組件檔案命名使用 camelCase（如 `button.tsx`, `stockManageListItem.tsx`）
- Props interface 命名格式：`[ComponentName]Props`

#### 組件組合樣式規則

開發會被組合使用的組件時，必須考慮以下樣式處理：

- **圓角設計**：

  - 避免在會被堆疊的組件上設置完整圓角（`rounded-lg` 等）
  - 考慮提供 `position` 或 `variant` prop 來控制圓角位置
  - 範例：`position="first" | "middle" | "last" | "single"`

- **邊框控制**：

  - 堆疊組件應避免設置完整邊框，改由容器統一管理
  - 或提供 `showBorder` 等 prop 讓父組件控制

- **外部間距**：

  - 組件本身避免設置外部 margin
  - 讓父組件使用 gap、space-y/x 等工具類控制間距
  - 內部 padding 由組件自行管理

- **參考範例**：

  ```tsx
  // 可組合的組件設計
  interface ListItemProps {
    position?: 'first' | 'middle' | 'last' | 'single'
    // ... other props
  }

  const getRoundedClass = (position?: string) => {
    switch (position) {
      case 'first':
        return 'rounded-t-lg'
      case 'last':
        return 'rounded-b-lg'
      case 'single':
        return 'rounded-lg'
      default:
        return '' // middle 不需要圓角
    }
  }
  ```

### React Hooks 使用規範 ⚠️

#### useEffect 依賴管理
```typescript
// ❌ 缺少依賴
useEffect(() => {
  fetchData(userId)
}, []) // Missing: userId

// ✅ 完整依賴
useEffect(() => {
  fetchData(userId)
}, [userId])

// ✅ 依賴過多時拆分為多個 useEffect
useEffect(() => {
  fetchUserData()
}, [userId])

useEffect(() => {
  fetchProductData()
}, [productId])
```

#### 副作用清理（重要！）
```typescript
// ❌ 未清理副作用
useEffect(() => {
  const interval = setInterval(() => updateData(), 1000)
  window.addEventListener('resize', handleResize)
}, [])

// ✅ 正確清理
useEffect(() => {
  const interval = setInterval(() => updateData(), 1000)
  const handleResize = () => { /* ... */ }
  window.addEventListener('resize', handleResize)

  return () => {
    clearInterval(interval)
    window.removeEventListener('resize', handleResize)
  }
}, [])

// ✅ 處理異步操作的組件卸載
useEffect(() => {
  let isMounted = true

  fetchData().then((data) => {
    if (isMounted) setState(data)
  })

  return () => { isMounted = false }
}, [])
```

#### 避免不必要的 State
```typescript
// ❌ 可以從其他 state 計算得出
const [data, setData] = useState<Item[]>([])
const [count, setCount] = useState(0)
const [isEmpty, setIsEmpty] = useState(true)

useEffect(() => {
  setCount(data.length)
  setIsEmpty(data.length === 0)
}, [data])

// ✅ 使用派生狀態
const [data, setData] = useState<Item[]>([])
const count = data.length
const isEmpty = data.length === 0
```

#### 檢查清單
- [ ] useEffect 依賴數組包含所有外部變數
- [ ] 所有 timer、listener、subscription 都有清理
- [ ] 避免可以通過計算得出的 State
- [ ] 異步操作檢查組件是否已卸載

### 性能優化規範 ⚡

#### ⚠️ 核心原則：不要過早優化

**重要**：只在有**實測性能問題**時才進行優化。過早優化會降低代碼可讀性和維護性。

**React 官方建議**：
> "You don't need to wrap every function in useCallback. If your component doesn't have performance problems, you don't need to memoize anything."

---

#### React.memo 使用時機

**只在以下情況使用**：
1. 組件渲染成本高（大量 DOM、複雜計算）
2. props 不常變化
3. 有實測的性能問題

```typescript
// ✅ 應該使用：列表項組件
export const ProductCard = memo(function ProductCard({ product }: { product: Product }) {
  // 組件會被渲染很多次，且 product 不常變
  return <div>{product.name}</div>
})

// ❌ 不需要使用：簡單組件
export function SimpleButton({ onClick, label }: ButtonProps) {
  // 組件很簡單，不需要 memo
  return <button onClick={onClick}>{label}</button>
}
```

---

#### useCallback 使用時機

**只在以下情況使用**：
1. ✅ 傳給使用了 `React.memo` 的子組件
2. ✅ 函數在 `useEffect` / `useMemo` / `useCallback` 的依賴數組中
3. ✅ 函數創建成本很高（包含複雜計算）

```typescript
// ✅ 正確使用：子組件有 memo
const MemoChild = memo(function Child({ onClick }) {
  return <button onClick={onClick}>Click</button>
})

function Parent() {
  const handleClick = useCallback(() => {
    console.log('clicked')
  }, [])

  return <MemoChild onClick={handleClick} />  // ← 子組件有 memo
}

// ❌ 錯誤使用：子組件沒有 memo
function RegularChild({ onClick }) {  // ← 沒有 memo
  return <button onClick={onClick}>Click</button>
}

function Parent() {
  const handleClick = useCallback(() => {  // ← 沒有意義！
    console.log('clicked')
  }, [])

  return <RegularChild onClick={handleClick} />
}

// ✅ 正確做法：不使用 useCallback
function Parent() {
  const handleClick = () => {  // ← 簡單清晰
    console.log('clicked')
  }

  return <RegularChild onClick={handleClick} />
}
```

---

#### useMemo 使用時機

**只在以下情況使用**：
1. ✅ 計算成本很高（排序、過濾大量數據、複雜運算）
2. ✅ 傳給使用了 `React.memo` 的子組件（穩定引用）
3. ✅ 在依賴數組中使用

```typescript
// ✅ 正確使用：昂貴的計算
const sortedProducts = useMemo(
  () => products.sort((a, b) => b.price - a.price),  // 排序成本高
  [products]
)

// ❌ 錯誤使用：簡單的計算
const total = useMemo(() => a + b, [a, b])  // ← 沒必要
const total = a + b  // ← 直接計算更好

// ✅ 正確使用：穩定對象引用（配合 memo）
const MemoChild = memo(function Child({ config }) { ... })

function Parent() {
  const config = useMemo(() => ({ theme: 'dark', size: 'large' }), [])
  return <MemoChild config={config} />  // ← 子組件有 memo
}

// ❌ 錯誤使用：子組件沒有 memo
function RegularChild({ config }) { ... }  // ← 沒有 memo

function Parent() {
  const config = useMemo(() => ({ theme: 'dark' }), [])  // ← 沒有意義！
  return <RegularChild config={config} />
}
```

---

#### 列表渲染優化

```typescript
// ✅ 使用唯一 ID 作為 key
products.map(product => (
  <ProductCard key={product.id} product={product} />  // ← 使用 id，不是 index
))

// ✅ 大列表使用分頁（超過 50 項）
const [page, setPage] = useState(1)
const pageSize = 20
const paginatedProducts = useMemo(
  () => products.slice((page - 1) * pageSize, page * pageSize),
  [products, page]
)

// ✅ 列表項使用 memo（如果渲染成本高）
const ProductCard = memo(function ProductCard({ product }) {
  return <div>{product.name}</div>
})
```

---

#### 圖片優化

```typescript
// ✅ 使用 Next.js Image 組件
import Image from 'next/image'

<Image
  src="/product.jpg"
  width={800}
  height={600}
  alt="Product"
  priority  // 首屏圖片使用 priority
/>

// ✅ 響應式圖片
<Image
  src="/image.jpg"
  width={800}
  height={600}
  alt="Product"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

---

#### 性能優化檢查清單

**在添加優化之前，先問自己**：
- [ ] 是否有實測的性能問題？（使用 React DevTools Profiler）
- [ ] 子組件是否使用了 `React.memo`？（useCallback/useMemo 的前提）
- [ ] 計算是否真的昂貴？（> 10ms？）
- [ ] 優化後是否真的有改善？（再次測量）

**基本要求**（無需優化）：
- [ ] 列表項有唯一 key（使用 ID 而非 index）
- [ ] 大列表使用分頁（超過 50 項）
- [ ] 所有圖片使用 Next.js `Image` 組件

**性能優化**（只在有問題時）：
- [ ] 列表項組件使用 `React.memo`（如果渲染成本高）
- [ ] 父組件的回調使用 `useCallback`（**前提**：子組件有 memo）
- [ ] 父組件的物件/陣列使用 `useMemo`（**前提**：子組件有 memo）

**記住**：
- ✅ 清晰的代碼 > 過度優化的代碼
- ✅ 可讀性優先，性能其次（除非有問題）
- ✅ 先測量，再優化，後驗證
- ❌ 不要為了「最佳實踐」而優化

詳細範例請參考：@AI_CODE_REVIEW.md 第 3、5 章

### 組件選擇指南

建立新組件時，判斷應該放在哪一層：

- 只有一個元素？ → Atoms
- 2-5 個元素的簡單組合？ → Molecules
- 複雜的功能區塊？ → Organisms
- 整個頁面的佈局框架？ → Templates
- 完整的頁面？ → Pages

### 響應式設計

- 使用 Tailwind 的響應式前綴：sm: md: lg: xl: 2xl:
- 移動優先（mobile-first）設計原則
- 參考現有頁面的響應式處理方式

## 頁面開發

### 產品相關頁面

- 新增產品頁面：@src/app/product/add-product/page.tsx
- 庫存列表頁面：@src/app/product/inventory-list/page.tsx
- 遵循 Next.js App Router 的檔案結構規範

## TypeScript 類型定義

### 類型管理

- 所有類型定義放在 @src/app/types/ 目錄
- 參考現有類型結構：@src/app/types/inventoryList.ts
- 使用 interface 而非 type（除非有特殊需求）

### 類型安全規範 ⚠️

#### 嚴格禁止項目
```typescript
// ❌ 禁止使用 any
const data: any = fetchData()
const handleClick = (event: any) => {}

// ❌ 禁止使用 @ts-ignore 或 @ts-expect-error
// @ts-ignore
const result = someFunction()

// ❌ 空陣列/物件沒有類型註解
const [items, setItems] = useState([])
const [user, setUser] = useState({})
```

#### 正確做法
```typescript
// ✅ 明確定義類型
interface Product {
  id: number
  name: string
  price: number
}

// ✅ useState 提供泛型類型
const [items, setItems] = useState<Product[]>([])
const [user, setUser] = useState<User | null>(null)

// ✅ 使用具體的事件類型
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {}
const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {}

// ✅ 使用類型守衛代替類型斷言
function isProduct(data: unknown): data is Product {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data
  )
}

if (isProduct(data)) {
  console.log(data.name) // 類型安全
}
```

#### 類型檢查清單
- [ ] 代碼中不存在 `any` 類型
- [ ] 所有 `useState` 都有泛型類型註解
- [ ] Props interface 完整定義
- [ ] 避免使用 `as` 斷言，優先使用類型守衛
- [ ] 不使用 `@ts-ignore` 或 `@ts-expect-error`
- [ ] 所有函數參數和返回值都有類型註解

詳細範例請參考：@AI_CODE_REVIEW.md 第 2 章

## 程式碼品質

### 開發指令

- 開發環境：`npm run dev`
- 型別檢查：`npm run type-check`
- Lint 檢查：`npm run lint`
- 格式化：`npm run format`
- 建置專案：`npm run build`

### 程式碼風格

- 使用 ESLint + Prettier 自動格式化
- commit 前會自動執行 lint-staged
- 遵循專案既有的程式碼風格

### 命名規範 📝

```typescript
// ✅ 組件使用 PascalCase
function ProductCard() {}
function ProductList() {}

// ✅ 函數和變數使用 camelCase
const handleSubmit = () => {}
const productList: Product[] = []

// ✅ 布林值使用 is/has/should 前綴
const isLoggedIn = true
const hasPermission = false
const shouldShowModal = false

// ✅ 常量使用 UPPER_SNAKE_CASE
const MAX_ITEMS = 100
const API_BASE_URL = 'https://api.example.com'

// ✅ 私有屬性使用底線前綴
const _privateMethod = () => {}

// ❌ 避免拼音和無意義縮寫
const yonghu = '用戶' // ❌
const btn = <button /> // ❌
const user = '用戶' // ✅
const button = <button /> // ✅
```

### 代碼整潔度 🧹

#### 必須移除
- ❌ 所有 `console.log` / `console.error`（除非是刻意的錯誤日誌）
- ❌ 註解的代碼（使用 git 管理版本，不要保留註解代碼）
- ❌ 未處理的 `TODO` / `FIXME`（應轉為 Issue 或立即處理）
- ❌ 未使用的 import
- ❌ 未使用的變數和函數

#### 代碼格式
```typescript
// ✅ 適當的空行增加可讀性
function Component() {
  const [state, setState] = useState(0)

  const handleClick = () => {
    setState(state + 1)
  }

  return (
    <button onClick={handleClick}>
      {state}
    </button>
  )
}

// ❌ 過於緊湊
function Component(){const[state,setState]=useState(0);return<button>{state}</button>}
```

### 安全性檢查 🔒

#### 環境變數管理
```typescript
// ✅ 使用環境變數
const API_KEY = process.env.NEXT_PUBLIC_API_KEY
const STRIPE_KEY = process.env.NEXT_PUBLIC_STRIPE_KEY

// ✅ 伺服器端敏感變數不帶 NEXT_PUBLIC_ 前綴
const SECRET_KEY = process.env.SECRET_KEY

// ❌ 硬編碼密鑰
const API_KEY = 'sk-1234567890abcdef' // ❌ 危險！
```

#### 輸入驗證
```typescript
// ✅ 驗證用戶輸入
const handleSubmit = (input: string) => {
  if (!input || input.trim().length === 0) {
    toast('輸入不能為空')
    return
  }

  if (input.length > 100) {
    toast('輸入過長（最多 100 字元）')
    return
  }

  sendToAPI(input)
}

// ✅ 限制輸入長度
<input
  type="text"
  value={name}
  maxLength={100}
  onChange={e => setName(e.target.value)}
/>
```

#### 安全檢查清單
- [ ] 無硬編碼 API Key、Token、密碼
- [ ] `.env` 文件在 `.gitignore` 中
- [ ] 所有用戶輸入都經過驗證
- [ ] 敏感日誌已移除或脫敏

### 測試要求 🧪

#### 測試覆蓋目標
- 新組件必須有對應測試
- 測試覆蓋率目標：> 70%
- 測試應包含：正常情況、邊界情況、錯誤處理

#### 組件測試範例
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { ProductCard } from './productCard'

describe('ProductCard', () => {
  it('should render product information', () => {
    const product = { id: 1, name: 'Test', price: 100 }
    render(<ProductCard product={product} />)

    expect(screen.getByText('Test')).toBeInTheDocument()
    expect(screen.getByText('$100')).toBeInTheDocument()
  })

  it('should handle click event', () => {
    const handleClick = jest.fn()
    render(<ProductCard onAddToCart={handleClick} />)

    fireEvent.click(screen.getByText('Add to Cart'))
    expect(handleClick).toHaveBeenCalled()
  })
})
```

### 提交前檢查清單 ✅

在提交代碼前，請確認：

```bash
# 1. 類型檢查通過
npm run type-check

# 2. Lint 檢查通過
npm run lint

# 3. 格式化檢查通過
npm run format:check

# 4. 測試通過
npm test
```

#### 代碼品質清單
- [ ] 所有 TypeScript 類型正確
- [ ] 無 ESLint 錯誤或警告
- [ ] 代碼已格式化（Prettier）
- [ ] 移除所有 console.log
- [ ] 移除所有註解代碼
- [ ] 無未處理的 TODO
- [ ] 測試通過且覆蓋率足夠
- [ ] 無硬編碼敏感資訊
- [ ] 所有 import 都有使用

詳細規範請參考：@AI_CODE_REVIEW.md 第 6、7、8 章

## 狀態管理

- 使用 React hooks（useState, useEffect 等）
- 複雜狀態考慮使用 useReducer

## 圖示系統

- 使用 lucide-react 作為圖示庫
- 保持圖示風格一致

## 注意事項

- 修改現有組件時，確保不破壞其他頁面的使用
- 新增功能前先檢查是否有可重用的組件
- 遵循 Git commit message 規範（參考現有 commit history）
