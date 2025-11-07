# AI Code Review 規範 (Frontend)

## 使用說明

本規範專為 AI Code Review 設計，聚焦於 Frontend 代碼質量、技術標準和最佳實踐的自動化檢查。

**技術棧:** Next.js + TypeScript + React + Tailwind CSS

---

## 1. Review 範圍與優先級

### 1.1 必須檢查項目 (Critical)

- 類型安全問題
- 安全漏洞
- 性能問題
- React Hooks 錯誤使用
- 內存洩漏風險

### 1.2 應該檢查項目 (Important)

- 代碼結構與架構
- 組件設計
- 命名規範
- 重複代碼
- 測試覆蓋

### 1.3 建議檢查項目 (Nice to have)

- 代碼風格優化
- 註釋完整性
- 性能優化建議
- 可訪問性改進

---

## 2. TypeScript 類型安全檢查 (Critical)

### 2.1 禁止使用 any

#### ❌ 禁止使用

```typescript
// ❌ 使用 any
const data: any = fetchData()
const handleClick = (event: any) => {}
const [state, setState] = useState<any>(null)

// ❌ 類型斷言濫用
const value = data as string
const element = document.getElementById('root') as HTMLElement

// ❌ 忽略 TypeScript 錯誤
// @ts-ignore
const result = someFunction()

// @ts-expect-error
someOtherFunction()

// ❌ 空數組/對象沒有類型註解
const [items, setItems] = useState([])
const [user, setUser] = useState({})
```

#### ✅ 正確做法

```typescript
// ✅ 明確類型定義
type Product = {
  id: number
  name: string
  price: number
}

const data: Product = fetchData()

// ✅ 使用具體的事件類型
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {}

// ✅ useState 提供泛型類型
const [items, setItems] = useState<Product[]>([])
const [user, setUser] = useState<User | null>(null)

// ✅ 類型守衛代替類型斷言
function isProduct(data: unknown): data is Product {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data &&
    'price' in data
  )
}

if (isProduct(data)) {
  console.log(data.name) // 類型安全
}

// ✅ 安全的類型斷言（確定元素存在時）
const element = document.getElementById('root')
if (!element) throw new Error('Root element not found')
// 現在可以安全使用 element
```

**檢查要點:**

- [ ] 代碼中不存在 `any` 類型
- [ ] 所有 `useState` 都有泛型類型註解
- [ ] Props 類型完整定義
- [ ] 避免使用 `as` 斷言，優先使用類型守衛
- [ ] 不使用 `@ts-ignore` 或 `@ts-expect-error`

---

## 3. React Hooks 使用規範 (Critical)

### 3.1 useEffect 依賴問題

#### ❌ 常見錯誤

```typescript
// ❌ 缺少依賴
useEffect(() => {
  fetchData(userId)
}, []) // Missing: userId

// ❌ 依賴過多導致頻繁執行
useEffect(() => {
  fetchData()
}, [data, count, status, filter, sort]) // 太多依賴

// ❌ 在 useEffect 中使用過時的 state
useEffect(() => {
  const timer = setTimeout(() => {
    console.log(count) // count 可能是舊值
  }, 1000)
}, [])
```

#### ✅ 正確做法

```typescript
// ✅ 完整依賴
useEffect(() => {
  fetchData(userId)
}, [userId])

// ✅ 拆分 useEffect
useEffect(() => {
  fetchUserData()
}, [userId])

useEffect(() => {
  fetchProductData()
}, [productId])

// ✅ 使用最新的 state
useEffect(() => {
  const timer = setTimeout(() => {
    console.log(count)
  }, 1000)
  return () => clearTimeout(timer)
}, [count]) // 包含 count 依賴
```

**檢查要點:**

- [ ] useEffect 依賴數組包含所有使用的外部變數
- [ ] 依賴過多時考慮拆分為多個 useEffect
- [ ] 不使用空依賴數組 `[]` 除非確實只需執行一次

### 3.2 副作用清理

#### ❌ 未清理副作用

```typescript
// ❌ 定時器未清理
useEffect(() => {
  const interval = setInterval(() => {
    updateData()
  }, 1000)
}, [])

// ❌ 事件監聽器未清理
useEffect(() => {
  window.addEventListener('resize', handleResize)
}, [])

// ❌ 訂閱未取消
useEffect(() => {
  const subscription = dataSource.subscribe(handleData)
}, [])

// ❌ 異步操作未取消
useEffect(() => {
  fetchData().then((data) => {
    setState(data) // 組件可能已卸載
  })
}, [])
```

#### ✅ 正確做法

```typescript
// ✅ 清理定時器
useEffect(() => {
  const interval = setInterval(() => {
    updateData()
  }, 1000)
  return () => clearInterval(interval)
}, [])

// ✅ 清理事件監聽器
useEffect(() => {
  const handleResize = () => {
    // handle resize
  }
  window.addEventListener('resize', handleResize)
  return () => window.removeEventListener('resize', handleResize)
}, [])

// ✅ 取消訂閱
useEffect(() => {
  const subscription = dataSource.subscribe(handleData)
  return () => subscription.unsubscribe()
}, [])

// ✅ 處理異步操作的組件卸載
useEffect(() => {
  let isMounted = true

  fetchData().then((data) => {
    if (isMounted) {
      setState(data)
    }
  })

  return () => {
    isMounted = false
  }
}, [])
```

**檢查要點:**

- [ ] 所有定時器（setTimeout, setInterval）都有清理
- [ ] 所有事件監聽器都有移除
- [ ] 所有訂閱都有取消
- [ ] 異步操作檢查組件是否已卸載

### 3.3 避免不必要的 State

#### ❌ 不必要的 State

```typescript
// ❌ 可以從其他 state 計算得出
const [data, setData] = useState<Item[]>([])
const [count, setCount] = useState(0)
const [isEmpty, setIsEmpty] = useState(true)

useEffect(() => {
  setCount(data.length)
  setIsEmpty(data.length === 0)
}, [data])

// ❌ Props 複製到 State
type Props = {
  initialValue: string
}

function Component({ initialValue }: Props) {
  const [value, setValue] = useState(initialValue)
  // initialValue 變化時 value 不會更新
}
```

#### ✅ 使用派生狀態

```typescript
// ✅ 派生狀態，無需額外 State
const [data, setData] = useState<Item[]>([])
const count = data.length
const isEmpty = data.length === 0

// ✅ 直接使用 Props 或使用 key 重置
type Props = {
  value: string
}

function Component({ value }: Props) {
  // 直接使用 value
  return <div>{value}</div>
}

// 或者需要本地狀態時使用 key 重置
<Component key={itemId} value={initialValue} />
```

**檢查要點:**

- [ ] 避免可以通過計算得出的 State
- [ ] 避免直接將 Props 複製到 State
- [ ] 優先使用派生狀態

### 3.4 性能優化 Hooks

#### ❌ 性能問題

```typescript
// ❌ 在 render 中創建函數
function Parent() {
  return (
    <Child onClick={() => console.log('clicked')} />
  )
}

// ❌ 在 render 中創建對象/數組
function Component() {
  return (
    <Child
      config={{ theme: 'dark', size: 'large' }}
      items={[1, 2, 3]}
    />
  )
}

// ❌ 昂貴計算沒有緩存
function ProductList({ products }: { products: Product[] }) {
  const sortedProducts = products.sort((a, b) => a.price - b.price)
  const filteredProducts = sortedProducts.filter(p => p.inStock)
  const total = filteredProducts.reduce((sum, p) => sum + p.price, 0)

  return <div>{/* render */}</div>
}
```

#### ✅ 性能優化

```typescript
// ✅ 使用 useCallback
function Parent() {
  const handleClick = useCallback(() => {
    console.log('clicked')
  }, [])

  return <Child onClick={handleClick} />
}

// ✅ 使用 useMemo 緩存對象/數組
function Component() {
  const config = useMemo(() => ({
    theme: 'dark',
    size: 'large'
  }), [])

  const items = useMemo(() => [1, 2, 3], [])

  return <Child config={config} items={items} />
}

// ✅ 使用 useMemo 緩存計算結果
function ProductList({ products }: { products: Product[] }) {
  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => a.price - b.price),
    [products]
  )

  const filteredProducts = useMemo(
    () => sortedProducts.filter(p => p.inStock),
    [sortedProducts]
  )

  const total = useMemo(
    () => filteredProducts.reduce((sum, p) => sum + p.price, 0),
    [filteredProducts]
  )

  return <div>{/* render */}</div>
}
```

**檢查要點:**

- [ ] 傳給子組件的回調函數使用 useCallback
- [ ] 傳給子組件的對象/數組使用 useMemo
- [ ] 昂貴的計算使用 useMemo 緩存
- [ ] 子組件使用 React.memo（當適用時）

---

## 4. 組件設計規範 (Important)

### 4.1 組件大小與職責

#### ❌ 組件過大

```typescript
// ❌ 單個組件超過 300 行
export default function ProductPage() {
  // 100 行 state 定義
  // 100 行事件處理函數
  // 100 行 useEffect
  // 200 行 JSX
  return (
    <div>
      {/* 複雜的 JSX */}
    </div>
  )
}

// ❌ 多重職責
function ProductListWithFilterAndCart() {
  // 處理產品列表
  // 處理過濾邏輯
  // 處理購物車
  // 處理分頁
}
```

#### ✅ 組件拆分

```typescript
// ✅ 拆分為小組件（每個 < 150 行）
function ProductPage() {
  return (
    <div>
      <ProductFilter onFilter={handleFilter} />
      <ProductList products={products} />
      <ProductPagination currentPage={page} onPageChange={handlePageChange} />
    </div>
  )
}

// ✅ 單一職責
function ProductList({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

function ProductFilter({ onFilter }: { onFilter: (query: string) => void }) {
  const [query, setQuery] = useState('')

  return (
    <input
      value={query}
      onChange={(e) => {
        setQuery(e.target.value)
        onFilter(e.target.value)
      }}
    />
  )
}
```

**檢查要點:**

- [ ] 單個組件不超過 200 行
- [ ] 每個組件只負責一個功能
- [ ] 複雜組件拆分為子組件
- [ ] 組件命名清晰表達其職責

### 4.2 Atomic Design 架構

#### ✅ 正確的組件分層

```typescript
// Atoms (基礎組件) - components/atoms/
// 單一、不可再分的 UI 元素
export const Button = ({ children, onClick }: ButtonProps) => (
  <button onClick={onClick}>{children}</button>
)

export const Input = ({ value, onChange }: InputProps) => (
  <input value={value} onChange={onChange} />
)

// Molecules (組合組件) - components/molecules/
// 2-5 個 atoms 的組合
export const SearchBar = ({ onSearch }: SearchBarProps) => (
  <div className="flex gap-2">
    <Input value={query} onChange={setQuery} />
    <Button onClick={onSearch}>Search</Button>
  </div>
)

// Organisms (複雜組件) - components/organisms/
// 多個 molecules 組成的完整功能區塊
export const ProductCard = ({ product }: ProductCardProps) => (
  <Card>
    <CardImage src={product.image} />
    <CardTitle>{product.name}</CardTitle>
    <CardPrice>{product.price}</CardPrice>
    <AddToCartButton productId={product.id} />
  </Card>
)
```

**檢查要點:**

- [ ] 組件放在正確的層級目錄
- [ ] Atoms: 基礎 UI 元素
- [ ] Molecules: 2-5 個 atoms 的簡單組合
- [ ] Organisms: 完整功能區塊
- [ ] 依賴方向正確（organisms → molecules → atoms）

### 4.3 Props 設計

#### ❌ Props 設計問題

```typescript
// ❌ Props drilling（超過 3 層）
<GrandParent user={user}>
  <Parent user={user}>
    <Child user={user}>
      <GrandChild user={user} />
    </Child>
  </Parent>
</GrandParent>

// ❌ Props 過多
type ButtonProps = {
  text: string
  color: string
  size: string
  onClick: () => void
  onHover: () => void
  onFocus: () => void
  isDisabled: boolean
  isLoading: boolean
  icon: string
  tooltip: string
  // ... 20 個 props
}

// ❌ 布林值 Props 沒有預設值
type Props = {
  isOpen: boolean  // 沒有預設值，容易忘記傳遞
}
```

#### ✅ 良好的 Props 設計

```typescript
// ✅ 使用 Context 避免 Props drilling
const UserContext = createContext<User | null>(null)

function GrandParent() {
  const [user, setUser] = useState<User | null>(null)

  return (
    <UserContext.Provider value={user}>
      <Parent>
        <Child>
          <GrandChild />
        </Child>
      </Parent>
    </UserContext.Provider>
  )
}

function GrandChild() {
  const user = useContext(UserContext)
  return <div>{user?.name}</div>
}

// ✅ 將相關 Props 組合為對象
type ButtonConfig = {
  color: string
  size: string
  icon?: string
}

type ButtonProps = {
  text: string
  config: ButtonConfig
  onClick: () => void
  isDisabled?: boolean
  isLoading?: boolean
}

// ✅ 提供預設值
type Props = {
  isOpen?: boolean
}

function Component({ isOpen = false }: Props) {
  // isOpen 有預設值
}
```

**檢查要點:**

- [ ] Props 數量不超過 7 個
- [ ] Props drilling 不超過 3 層
- [ ] 布林值 Props 提供預設值
- [ ] 相關 Props 組合為對象
- [ ] 可選 Props 使用 `?` 標記

---

## 5. 性能優化檢查 (Important)

### 5.1 列表渲染優化

#### ❌ 性能問題

```typescript
// ❌ 大列表不分頁
function ProductList({ products }: { products: Product[] }) {
  return (
    <div>
      {products.map(p => <ProductCard product={p} />)}
      {/* 如果有 10000+ 個產品會卡頓 */}
    </div>
  )
}

// ❌ 沒有 key 或使用 index 作為 key
products.map((product, index) => (
  <ProductCard key={index} product={product} />
))

// ❌ 列表項組件沒有優化
function ProductCard({ product }: { product: Product }) {
  // 父組件 re-render 時，所有子組件都會 re-render
}
```

#### ✅ 性能優化

```typescript
// ✅ 大列表使用分頁
function ProductList({ products }: { products: Product[] }) {
  const [page, setPage] = useState(1)
  const pageSize = 20

  const paginatedProducts = useMemo(
    () => products.slice((page - 1) * pageSize, page * pageSize),
    [products, page]
  )

  return (
    <div>
      {paginatedProducts.map(p => (
        <ProductCard key={p.id} product={p} />
      ))}
      <Pagination page={page} onPageChange={setPage} />
    </div>
  )
}

// ✅ 使用唯一 ID 作為 key
products.map(product => (
  <ProductCard key={product.id} product={product} />
))

// ✅ 使用 memo 優化列表項
const ProductCard = memo(({ product }: { product: Product }) => {
  return <div>{product.name}</div>
})
```

**檢查要點:**

- [ ] 列表超過 50 項使用分頁或虛擬滾動
- [ ] 所有列表項有唯一的 key（使用 ID 而非 index）
- [ ] 列表項組件使用 `React.memo`
- [ ] 避免在 map 中創建新函數

### 5.2 圖片優化

#### ❌ 未優化圖片

```typescript
// ❌ 使用原生 img 標籤
<img src="/large-image.jpg" />

// ❌ 沒有設置尺寸
<img src="/image.jpg" alt="Product" />

// ❌ 沒有延遲加載
<img src="/image1.jpg" />
<img src="/image2.jpg" />
// ... 100 張圖片
```

#### ✅ 圖片優化

```typescript
// ✅ 使用 Next.js Image 組件
import Image from 'next/image'

<Image
  src="/large-image.jpg"
  width={800}
  height={600}
  alt="Product"
  priority // 首屏圖片使用 priority
/>

// ✅ 非首屏圖片自動延遲加載
<Image
  src="/image.jpg"
  width={400}
  height={300}
  alt="Product"
  // 默認延遲加載
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

**檢查要點:**

- [ ] 所有圖片使用 Next.js `Image` 組件
- [ ] 圖片設置正確的 width 和 height
- [ ] 首屏圖片使用 `priority` 屬性
- [ ] 提供有意義的 `alt` 文字

### 5.3 避免重複渲染

#### ❌ 導致重複渲染

```typescript
// ❌ 在 render 中創建對象
function Parent() {
  return <Child style={{ padding: 10 }} />
  // 每次 render 都創建新對象，Child 會重新渲染
}

// ❌ 狀態更新導致整個樹重新渲染
function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      <ExpensiveComponent /> {/* count 變化時也會重新渲染 */}
    </div>
  )
}
```

#### ✅ 避免重複渲染

```typescript
// ✅ 使用 useMemo 緩存對象
function Parent() {
  const style = useMemo(() => ({ padding: 10 }), [])
  return <Child style={style} />
}

// ✅ 使用 memo 防止不必要的重新渲染
const ExpensiveComponent = memo(() => {
  // 昂貴的計算或渲染
  return <div>Expensive</div>
})

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      <ExpensiveComponent /> {/* count 變化時不會重新渲染 */}
    </div>
  )
}

// ✅ 或者拆分組件
function App() {
  return (
    <div>
      <Counter />
      <ExpensiveComponent />
    </div>
  )
}

function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>
}
```

**檢查要點:**

- [ ] 避免在 JSX 中創建對象、數組、函數
- [ ] 昂貴的組件使用 `React.memo`
- [ ] 考慮拆分組件隔離狀態變化

---

## 6. 樣式與 UI 規範 (Important)

### 6.1 Tailwind CSS 使用

#### ❌ 樣式問題

```typescript
// ❌ 使用內聯樣式
<div style={{ color: 'red', fontSize: '16px', padding: '10px' }}>
  Text
</div>

// ❌ 硬編碼顏色值
<div className="text-[#3B82F6] bg-[#EFF6FF]">Text</div>

// ❌ CSS-in-JS
const StyledDiv = styled.div`
  color: red;
  font-size: 16px;
`

// ❌ 過長的 className
<div className="flex items-center justify-center w-full h-full bg-white border border-gray-200 rounded-lg shadow-md p-4 m-2 hover:shadow-lg transition-all duration-300">
```

#### ✅ 正確使用 Tailwind

```typescript
// ✅ 使用 Tailwind CSS
<div className="text-red-500 text-base p-2.5">
  Text
</div>

// ✅ 使用語義化顏色（在 tailwind.config.ts 中定義）
<div className="text-primary bg-primary-light">Text</div>

// ✅ 長 className 提取為組件或使用 cn 函數
import { cn } from '@/lib/utils'

const cardStyles = cn(
  "flex items-center justify-center",
  "w-full h-full",
  "bg-white border border-gray-200 rounded-lg shadow-md",
  "p-4 m-2",
  "hover:shadow-lg transition-all duration-300"
)

<div className={cardStyles}>Content</div>

// 或者提取為組件
<Card className="p-4 m-2">Content</Card>
```

**檢查要點:**

- [ ] 禁止使用內聯樣式 `style={{}}`
- [ ] 禁止使用 CSS-in-JS (styled-components, emotion)
- [ ] 使用 Tailwind 語義化顏色而非硬編碼值
- [ ] 長 className 提取為變數或組件
- [ ] 使用 `cn()` 函數組合條件樣式

### 6.2 響應式設計

#### ❌ 缺少響應式

```typescript
// ❌ 固定寬度
<div className="w-[1200px]">Content</div>

// ❌ 沒有考慮移動端
<div className="grid grid-cols-4 gap-4">
  {products.map(p => <ProductCard product={p} />)}
</div>
```

#### ✅ 響應式設計

```typescript
// ✅ 使用相對單位
<div className="w-full max-w-7xl mx-auto">Content</div>

// ✅ 使用 Tailwind 斷點
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {products.map(p => <ProductCard key={p.id} product={p} />)}
</div>

// ✅ 移動端優先
<div className="text-sm md:text-base lg:text-lg">
  Text
</div>
```

**檢查要點:**

- [ ] 避免固定寬度，使用相對單位
- [ ] 使用 Tailwind 斷點 (sm, md, lg, xl, 2xl)
- [ ] 採用移動端優先的方式
- [ ] 測試不同螢幕尺寸的顯示效果

### 6.3 可訪問性 (Accessibility)

#### ❌ 可訪問性問題

```typescript
// ❌ 按鈕只有圖標沒有文字說明
<button onClick={handleDelete}>
  <TrashIcon />
</button>

// ❌ 自定義可點擊元素沒有語義
<div onClick={handleClick}>Click me</div>

// ❌ 圖片沒有 alt
<Image src="/product.jpg" width={200} height={200} />

// ❌ 表單輸入沒有 label
<input type="text" />
```

#### ✅ 良好的可訪問性

```typescript
// ✅ 提供 aria-label
<button onClick={handleDelete} aria-label="Delete product">
  <TrashIcon />
</button>

// ✅ 使用語義化標籤
<button onClick={handleClick}>Click me</button>

// ✅ 圖片提供有意義的 alt
<Image
  src="/product.jpg"
  width={200}
  height={200}
  alt="Nike Air Max 90 - White and Blue Running Shoes"
/>

// ✅ 表單輸入關聯 label
<div>
  <label htmlFor="username">Username</label>
  <input type="text" id="username" name="username" />
</div>
```

**檢查要點:**

- [ ] 所有圖標按鈕有 aria-label
- [ ] 所有圖片有描述性的 alt 文字
- [ ] 表單輸入有關聯的 label
- [ ] 使用語義化 HTML 標籤
- [ ] 可點擊元素使用 `<button>` 或 `<a>`
- [ ] 支持鍵盤導航

---

## 7. 安全性檢查 (Critical)

### 7.1 敏感資訊洩露

#### ❌ 安全問題

```typescript
// ❌ 硬編碼 API Key
const API_KEY = 'sk-1234567890abcdef'
const STRIPE_KEY = 'pk_live_xxxxx'

// ❌ 硬編碼 URL 和憑證
const DB_URL = 'postgres://user:password@localhost/db'

// ❌ 在代碼中洩露敏感信息
console.log('User password:', password)
```

#### ✅ 安全做法

```typescript
// ✅ 使用環境變數
const API_KEY = process.env.NEXT_PUBLIC_API_KEY
const STRIPE_KEY = process.env.NEXT_PUBLIC_STRIPE_KEY

// ✅ 敏感變數不帶 NEXT_PUBLIC_ 前綴（只在服務端可用）
const SECRET_KEY = process.env.SECRET_KEY

// ✅ 不記錄敏感信息
console.log('User logged in:', username) // 只記錄非敏感信息
```

**檢查要點:**

- [ ] 無硬編碼 API Key、Token、密碼
- [ ] 使用環境變數管理配置
- [ ] .env 文件在 .gitignore 中
- [ ] 敏感日誌已移除或脫敏

### 7.2 輸入驗證

#### ❌ 缺少驗證

```typescript
// ❌ 未驗證用戶輸入
const handleSubmit = (input: string) => {
  sendToAPI(input) // 直接使用
}

// ❌ 未限制輸入長度
<input type="text" value={name} onChange={e => setName(e.target.value)} />
```

#### ✅ 完整驗證

```typescript
// ✅ 驗證輸入
const handleSubmit = (input: string) => {
  if (!input || input.trim().length === 0) {
    toast('Input cannot be empty')
    return
  }

  if (input.length > 100) {
    toast('Input too long (max 100 characters)')
    return
  }

  // 可以加入更多驗證（如正則表達式）
  sendToAPI(input)
}

// ✅ 限制輸入長度
<input
  type="text"
  value={name}
  maxLength={100}
  onChange={e => {
    const value = e.target.value
    if (value.length <= 100) {
      setName(value)
    }
  }}
/>
```

**檢查要點:**

- [ ] 所有用戶輸入都經過驗證
- [ ] 輸入限制長度
- [ ] 數值輸入檢查範圍
- [ ] 使用白名單而非黑名單驗證

---

## 8. 代碼品質檢查 (Important)

### 8.1 命名規範

#### ❌ 命名問題

```typescript
// ❌ 不清晰的命名
const d = new Date()
const arr = []
const fn = () => {}

// ❌ 使用拼音或縮寫
const yonghu = '用戶'
const btn = <button />

// ❌ 布林值命名不當
const login = true
const show = false

// ❌ 組件命名不符合規範
function productCard() {}
function product_list() {}
```

#### ✅ 良好命名

```typescript
// ✅ 描述性命名
const currentDate = new Date()
const productList: Product[] = []
const handleSubmit = () => {}

// ✅ 使用英文
const user = 'User'
const button = <button />

// ✅ 布林值使用 is/has/should 前綴
const isLoggedIn = true
const hasPermission = false
const shouldShowModal = false

// ✅ 組件使用 PascalCase
function ProductCard() {}
function ProductList() {}
```

**檢查要點:**

- [ ] 變數名清晰描述其用途
- [ ] 布林值使用 is/has/should 前綴
- [ ] 組件使用 PascalCase
- [ ] 函數使用 camelCase
- [ ] 常量使用 UPPER_SNAKE_CASE
- [ ] 避免拼音和無意義縮寫

### 8.2 代碼重複

#### ❌ 重複代碼

```typescript
// ❌ 重複的邏輯
function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .finally(() => setLoading(false))
  }, [])

  // ...
}

function UserList() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .finally(() => setLoading(false))
  }, [])

  // ...
}
```

#### ✅ 提取公共邏輯

```typescript
// ✅ 自定義 Hook
function useFetch<T>(url: string) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch(url)
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false))
  }, [url])

  return { data, loading, error }
}

// 使用
function ProductList() {
  const { data: products, loading } = useFetch<Product>('/api/products')
  // ...
}

function UserList() {
  const { data: users, loading } = useFetch<User>('/api/users')
  // ...
}
```

**檢查要點:**

- [ ] 重複代碼提取為函數或 Hook
- [ ] 相似邏輯抽象為通用組件
- [ ] 遵循 DRY (Don't Repeat Yourself) 原則

### 8.3 代碼整潔度

#### ❌ 不整潔的代碼

```typescript
// ❌ 殘留的 console.log
console.log('data:', data)
console.log('user:', user)

// ❌ 註解的代碼
// const oldFunction = () => {
//   // 舊的實現
// }

// ❌ 未處理的 TODO
// TODO: 實現這個功能
function doSomething() {
  // 空函數
}

// ❌ 過多的空行或沒有空行
function Component(){const[state,setState]=useState(0);const handleClick=()=>{setState(state+1)};return<button onClick={handleClick}>{state}</button>}
```

#### ✅ 整潔的代碼

```typescript
// ✅ 移除 debug 代碼

// ✅ 刪除註解的舊代碼

// ✅ TODO 應該轉為 Issue 或立即處理
function doSomething() {
  // 完整的實現
  implement()
}

// ✅ 適當的空行和格式
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
```

**檢查要點:**

- [ ] 移除所有 console.log/console.error
- [ ] 刪除註解的代碼
- [ ] TODO/FIXME 需要有對應的 Issue 或立即處理
- [ ] 代碼格式化（使用 Prettier）
- [ ] 適當的空行增加可讀性

---

## 9. 檔案組織規範 (Important)

### 9.1 目錄結構

```
src/app/
├── components/
│   ├── atoms/              # 基礎組件
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── index.tsx       # 統一導出
│   ├── molecules/          # 組合組件
│   │   ├── searchBar.tsx
│   │   └── index.tsx
│   └── organisms/          # 複雜組件
│       ├── header.tsx
│       └── index.tsx
├── hooks/                  # 自定義 Hooks
│   ├── useFetch.ts
│   └── useAuth.ts
├── lib/                    # 工具函數
│   ├── utils.ts
│   └── api.ts
├── types/                  # TypeScript 類型
│   ├── product.ts
│   └── user.ts
├── [feature]/              # 功能頁面
│   ├── page.tsx
│   ├── layout.tsx
│   └── components/         # 功能專屬組件
│       └── featureComponent.tsx
└── globals.css             # 全局樣式
```

**檢查要點:**

- [ ] 組件按 Atomic Design 分層
- [ ] 共用類型統一在 `types/` 目錄
- [ ] 自定義 Hooks 在 `hooks/` 目錄
- [ ] 工具函數在 `lib/` 目錄
- [ ] 功能專屬組件放在功能目錄下

### 9.2 檔案命名

#### ❌ 命名問題

```
ProductList.tsx          # ❌ 組件文件使用 PascalCase
product-list.tsx         # ❌ 使用 kebab-case
Product_List.tsx         # ❌ 使用 snake_case
productlist.tsx          # ❌ 沒有分隔符
```

#### ✅ 正確命名

```
productList.tsx          # ✅ 組件文件使用 camelCase
useProductList.ts        # ✅ Hook 文件以 use 開頭
productList.test.tsx     # ✅ 測試文件
types/product.ts         # ✅ 類型文件
```

**檢查要點:**

- [ ] 組件文件使用 camelCase
- [ ] Hook 文件以 `use` 開頭
- [ ] 類型文件使用 camelCase
- [ ] 測試文件以 `.test.tsx` 或 `.spec.tsx` 結尾

### 9.3 Import 順序

#### ❌ 混亂的 Import

```typescript
import { Button } from '@/app/components/atoms'
import { useState } from 'react'
import './styles.css'
import { useAuth } from '../hooks/useAuth'
import type { Product } from '@/app/types/product'
```

#### ✅ 有序的 Import

```typescript
// 1. React 相關
import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'

// 2. 第三方套件
import { toast } from 'sonner'
import clsx from 'clsx'

// 3. 內部絕對路徑導入
import { Button, Input } from '@/app/components/atoms'
import type { Product } from '@/app/types/product'
import { useAuth } from '@/app/hooks/useAuth'

// 4. 相對路徑導入
import { ProductCard } from './productCard'

// 5. 樣式
import './styles.css'
```

**檢查要點:**

- [ ] Import 分組並按順序排列
- [ ] 類型導入使用 `import type`
- [ ] 移除未使用的 Import

---

## 10. 測試要求 (Important)

### 10.1 組件測試

```typescript
// ✅ 完整的組件測試
import { render, screen, fireEvent } from '@testing-library/react'
import { ProductCard } from './productCard'

describe('ProductCard', () => {
  const mockProduct = {
    id: 1,
    name: 'Test Product',
    price: 100,
    image: '/test.jpg'
  }

  it('should render product information', () => {
    render(<ProductCard product={mockProduct} />)

    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('$100')).toBeInTheDocument()
  })

  it('should handle add to cart click', () => {
    const handleAddToCart = jest.fn()
    render(
      <ProductCard product={mockProduct} onAddToCart={handleAddToCart} />
    )

    fireEvent.click(screen.getByText('Add to Cart'))
    expect(handleAddToCart).toHaveBeenCalledWith(mockProduct.id)
  })

  it('should show empty state when product is null', () => {
    render(<ProductCard product={null} />)
    expect(screen.getByText('No product available')).toBeInTheDocument()
  })
})
```

**檢查要點:**

- [ ] 新組件有對應測試
- [ ] 測試覆蓋正常情況
- [ ] 測試覆蓋邊界情況（空值、錯誤）
- [ ] 測試用戶交互（點擊、輸入）
- [ ] 測試條件渲染

### 10.2 Hook 測試

```typescript
// ✅ 自定義 Hook 測試
import { renderHook, act } from '@testing-library/react'
import { useFetch } from './useFetch'

describe('useFetch', () => {
  it('should fetch data successfully', async () => {
    const { result } = renderHook(() => useFetch('/api/products'))

    expect(result.current.loading).toBe(true)

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100))
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.data).toHaveLength(3)
  })

  it('should handle fetch error', async () => {
    const { result } = renderHook(() => useFetch('/api/error'))

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100))
    })

    expect(result.current.error).toBeDefined()
  })
})
```

**檢查要點:**

- [ ] 自定義 Hook 有測試
- [ ] 測試不同的狀態變化
- [ ] 測試錯誤處理

---

## 11. Review 輸出格式

AI 應按以下格式輸出 Review 結果：

````markdown
## Code Review 結果

### 🔴 Critical Issues (必須修改)

1. **[src/app/components/productList.tsx:15] TypeScript - 使用 any 類型**
   - 問題: `const data: any = fetchData()` 使用了 any 類型
   - 影響: 失去類型安全，可能導致運行時錯誤
   - 建議: 定義明確的類型
   - 範例:
   ```typescript
   type Product = {
     id: number
     name: string
     price: number
   }
   const data: Product[] = fetchData()
   ```
````

2. **[src/app/components/productDetail.tsx:42] React Hooks - 缺少 useEffect 依賴**
   - 問題: `useEffect(() => { fetchProduct(productId) }, [])` 缺少 productId 依賴
   - 影響: productId 變化時不會重新獲取數據
   - 建議: 添加完整依賴
   - 範例:
   ```typescript
   useEffect(() => {
     fetchProduct(productId)
   }, [productId])
   ```

### 🟡 Important Issues (應該修改)

1. **[src/app/components/productCard.tsx:25] 性能 - 未使用 React.memo**
   - 問題: 列表項組件沒有優化，父組件更新時會重複渲染
   - 影響: 大列表可能造成性能問題
   - 建議: 使用 memo 優化
   - 範例:
   ```typescript
   export const ProductCard = memo(({ product }: Props) => {
     return <div>{product.name}</div>
   })
   ```

### 🟢 Suggestions (建議優化)

1. **[src/app/components/button.tsx:10] 代碼風格 - 可以提取常量**
   - 建議: 將魔術數字提取為常量
   - 範例:
   ```typescript
   const ANIMATION_DURATION = 300
   setTimeout(() => {}, ANIMATION_DURATION)
   ```

### ✅ Good Practices (值得肯定)

1. **[src/app/hooks/useFetch.ts]** - 良好的自定義 Hook 設計，包含錯誤處理和 loading 狀態
2. **[src/app/components/atoms/button.tsx]** - 完整的 TypeScript 類型定義和 Props 預設值
3. **[src/app/product/page.tsx]** - 良好的組件拆分，每個組件職責清晰

### 📊 統計

- 檢查文件數: 15
- Critical Issues: 2
- Important Issues: 3
- Suggestions: 5
- 測試覆蓋率: 75%

### 🎯 建議優先處理

1. 修復所有 TypeScript any 類型問題（Critical）
2. 修復 useEffect 依賴問題（Critical）
3. 添加列表項 memo 優化（Important）

````

---

## 12. 快速檢查清單

使用此清單快速掃描代碼：

### TypeScript
- [ ] 無 `any` 類型
- [ ] 無 `@ts-ignore` 或 `@ts-expect-error`
- [ ] useState 有泛型類型
- [ ] Props 有完整類型定義
- [ ] 避免使用 `as` 斷言

### React Hooks
- [ ] useEffect 依賴完整
- [ ] 副作用有清理函數
- [ ] 避免不必要的 State
- [ ] 使用 useCallback/useMemo 優化性能

### 組件設計
- [ ] 組件 < 200 行
- [ ] 單一職責
- [ ] Props < 7 個
- [ ] 遵循 Atomic Design
- [ ] 列表有唯一 key

### 性能
- [ ] 大列表有分頁
- [ ] 圖片使用 Next.js Image
- [ ] 列表項使用 memo
- [ ] 避免在 render 中創建對象/函數

### 樣式
- [ ] 使用 Tailwind CSS
- [ ] 無內聯樣式
- [ ] 響應式設計
- [ ] 語義化顏色

### 可訪問性
- [ ] 圖標按鈕有 aria-label
- [ ] 圖片有 alt 文字
- [ ] 表單有 label
- [ ] 使用語義化標籤

### 安全
- [ ] 無硬編碼密鑰
- [ ] 使用環境變數
- [ ] 輸入驗證完整
- [ ] 無敏感信息日誌

### 代碼品質
- [ ] 命名清晰
- [ ] 無重複代碼
- [ ] 無 console.log
- [ ] 無註解的代碼
- [ ] 無未處理的 TODO

### 測試
- [ ] 新組件有測試
- [ ] 測試覆蓋率 > 70%
- [ ] 測試邊界情況

---

## 13. 常見問題速查表

| 問題類型 | 關鍵字 | 嚴重程度 | 快速解決方案 |
|---------|--------|----------|------------|
| TypeScript any | `any`, `@ts-ignore` | Critical | 定義明確類型 |
| useEffect 依賴 | `useEffect`, `[]` | Critical | 添加完整依賴 |
| 未清理副作用 | `setInterval`, `addEventListener` | Critical | 添加 cleanup 函數 |
| 內聯樣式 | `style={{}}` | Important | 改用 Tailwind |
| 缺少 key | `map` without `key` | Important | 添加唯一 key |
| 硬編碼密鑰 | `API_KEY =`, `TOKEN =` | Critical | 使用環境變數 |
| console.log | `console.log`, `console.error` | Suggestion | 移除或使用 logger |
| 大列表 | `map` 大數組 | Important | 添加分頁 |
| 原生 img | `<img` | Important | 改用 `<Image>` |
| 魔術數字 | 數字字面量 | Suggestion | 提取為常量 |

---

## 14. 自動化工具配置

### package.json scripts
```json
{
  "scripts": {
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
````

### 執行 Code Review 前

```bash
# 1. 類型檢查
npm run type-check

# 2. Lint 檢查
npm run lint

# 3. 格式檢查
npm run format:check

# 4. 測試
npm run test:coverage
```

---

**版本:** 1.0  
**更新日期:** 2024-12  
**適用範圍:** Frontend (Next.js + TypeScript + React + Tailwind CSS)
