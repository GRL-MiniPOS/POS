---
paths:
  [
    'apps/frontend/src/**/*.tsx',
    'apps/frontend/src/**/*.ts',
    'apps/frontend/src/app/hooks/**/*.ts',
  ]
---

# 組件生命週期與規範 / Component Lifecycle & Standards (準則 1-7)

本文檔涵蓋 React 組件、Custom Hook、Next.js App Router 邊界與公開 API 的基本規範。

This document covers React components, custom hooks, Next.js App Router boundaries, and public API standards.

---

## 準則 1: Props 類型定義 / Guideline 1: Props Type Definition

### 說明 / Description

Props 是組件的資料邊界。所有 component props 必須使用明確的 TypeScript interface，不使用 `any` 或隱含形狀。

Props are component data boundaries. All component props must use explicit TypeScript interfaces, with no `any` or implicit shapes.

### 為什麼重要 / Why This Matters

清楚的 props interface 讓工程師與 Claude Code 都能直接判斷組件輸入、預設值與重構影響。

### Linus 哲學 / Linus Philosophy

> "Bad programmers worry about the code. Good programmers worry about data structures."

Design the data structure well first, and special cases will naturally disappear.

### 檢查清單 / Checklist

- [ ] Props 是否使用 `interface ComponentNameProps`？
- [ ] 是否避免 `any`、`@ts-ignore`？
- [ ] 選填 props 是否使用 `?`，並在需要具體值時提供預設值？
- [ ] 複雜或共用型別是否放在 `@/app/types/`？
- [ ] Props 超過 7 個時，是否重新檢查資料結構或責任邊界？

### 範例 / Examples

```tsx
interface ProductCardProps {
  product: Product
  isSelected?: boolean
  onSelect?: (id: string) => void
}

export function ProductCard({
  product,
  isSelected = false,
  onSelect,
}: ProductCardProps) {
  return (
    <button type="button" onClick={() => onSelect?.(product.id)}>
      {product.name}
    </button>
  )
}
```

### 常見陷阱 / Common Pitfalls

- 用 `any` 快速繞過型別問題。
- props 過多時只分組表面欄位，沒有真正整理 domain model。

### 參考現有實作 / Reference Implementation

- `apps/frontend/src/app/components/molecules/common/genericConfirmDialog.tsx`

### 自動化 / Automation

- **TypeScript**: `pnpm --filter frontend run type-check`
- **ESLint**: `@typescript-eslint/no-explicit-any`

---

## 準則 2: Callback Props 規範 / Guideline 2: Callback Props

### 說明 / Description

子組件通知父層時使用 callback props，命名為 `onXxx`。Callback 是組件的輸出事件，不應藏在 event bus 或不透明的全域狀態中。

Use callback props named `onXxx` for child-to-parent communication. Callbacks are component output events and should not be hidden in event buses or opaque global state.

### 為什麼重要 / Why This Matters

事件出口放在 props 上，行為邊界清楚，也比較容易測試與替換。

### Linus 哲學 / Linus Philosophy

> "Good code has no special cases."

Data flows in, events flow out. Do not create hidden paths.

### 檢查清單 / Checklist

- [ ] 對外事件是否命名為 `onXxx`？
- [ ] 選填 callback 是否使用 optional chaining？
- [ ] 必要 callback 是否直接標為必填？
- [ ] 子組件是否避免直接擁有 API mutation，除非它就是 feature boundary？
- [ ] callback 是否只在 Client Component 子樹內作為一般函數傳遞？

### 範例 / Examples

```tsx
interface DeleteButtonProps {
  onDelete: () => void
  isDeleting?: boolean
}

export function DeleteButton({
  onDelete,
  isDeleting = false,
}: DeleteButtonProps) {
  return (
    <button onClick={onDelete} disabled={isDeleting}>
      刪除
    </button>
  )
}
```

### 常見陷阱 / Common Pitfalls

- 把必要 callback 寫成 optional，最後到處補防守邏輯。
- 子組件直接呼叫 API，導致 UI primitive 變成 feature 邏輯。

### 參考現有實作 / Reference Implementation

- `apps/frontend/src/app/layout.tsx` - 保持 layout 輕薄，將互動行為交給明確的 client 子元件。
- `apps/frontend/src/app/product/add-product/page.tsx` - 頁面目前需要表單 state 與 event handler，因此明確標示 `'use client'`。

### 自動化 / Automation

- **TypeScript**: callback 參數與回傳型別檢查。

---

## 準則 3: Custom Hook 與副作用 / Guideline 3: Custom Hooks And Effects

### 說明 / Description

只有當狀態邏輯可重用，或組件已難以閱讀時，才抽出 custom hook。副作用必須有完整依賴與必要 cleanup。

Extract custom hooks only when stateful logic is reusable or the component has become hard to read. Effects must have complete dependencies and required cleanup.

### 為什麼重要 / Why This Matters

Hook 應降低複雜度，不是把複雜度搬到另一個檔案。副作用沒有 cleanup 會留下 leak 與不穩定行為。

### Linus 哲學 / Linus Philosophy

> "Functions must be short and sharp, doing just one thing well."

Good boundaries reduce problems, not just file length.

### 檢查清單 / Checklist

- [ ] Hook 是否以 `use` 開頭？
- [ ] 抽 hook 是否真的降低認知負擔？
- [ ] `useEffect` dependency 是否完整？
- [ ] 是否清理 timer、listener、subscription、object URL 或 abortable async work？
- [ ] 是否避免在 render 或 initial state 讀取 `window`、`document`？

### 範例 / Examples

```tsx
type WindowSize = {
  width: number
  height: number
}

export function useWindowSize(): WindowSize {
  const [size, setSize] = useState<WindowSize>({ width: 0, height: 0 })

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight })
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return size
}
```

### 常見陷阱 / Common Pitfalls

- 為了低於 200 行而抽 hook，但呼叫端仍需要理解所有內部細節。
- 建立 `URL.createObjectURL()` 後沒有 `URL.revokeObjectURL()`。

### 參考現有實作 / Reference Implementation

- `apps/frontend/src/app/components/molecules/addProduct/imagePreview.tsx`

### 自動化 / Automation

- **ESLint**: `react-hooks/rules-of-hooks`
- **ESLint**: `react-hooks/exhaustive-deps`

---

## 準則 4: Next.js Client Boundary / Guideline 4: Next.js Client Boundary

### 說明 / Description

目前專案多數頁面以 Client Component / CSR 操作體驗為主，不以 SSR 作為主要策略。新增或重構 App Router 頁面時，應清楚標示需要 client runtime 的邊界，不要把 SSR、Server Action 或 Route Handler 當成預設解法。

Most current pages are Client Components and the project is not SSR-first. New or refactored App Router pages should make client runtime boundaries explicit and avoid treating SSR, Server Actions, or Route Handlers as defaults.

### 為什麼重要 / Why This Matters

Client boundary 越清楚，bundle、資料暴露與 hydration 風險越低。這條規則是防止 runtime 邊界混亂，不是要求頁面改成 SSR。

### Linus 哲學 / Linus Philosophy

> "Good code has no special cases."

Do not use SSR or page-wide client boundaries to hide data and interaction boundaries.

### 檢查清單 / Checklist

- [ ] `page.tsx` / `layout.tsx` 是否維持簡單，沒有把 SSR/RSC 當成預設資料策略？
- [ ] `'use client'` 是否只加在需要 state、event、effect、browser API 的最小元件？
- [ ] Client Component 是否避免 `async function`？
- [ ] 跨 runtime 邊界的 props 是否可序列化？
- [ ] 是否避免跨邊界傳一般函數、`Date`、`Map`、`Set`、class instance？

### 範例 / Examples

```tsx
export default function ProductPage() {
  return <ProductTableClient />
}
```

### 常見陷阱 / Common Pitfalls

- 跨 runtime 邊界傳一般 callback。
- 直接把 `Date` 傳給 Client Component，應先轉成 ISO string。

### 參考現有實作 / Reference Implementation

- `apps/frontend/src/app/components/molecules/addProduct/imagePreview.tsx`

### 自動化 / Automation

- **Next.js**: lint/build 可揭露部分 Client Component 與 hydration 邊界問題。

---

## 準則 5: Import 與公開 API / Guideline 5: Imports And Public API

### 說明 / Description

使用穩定、清楚的 import 路徑。Barrel export 可以作為 layer 的公開 API，但不應暴露 helper 或不穩定實作。

Use stable and clear import paths. Barrel exports may define a layer public API, but should not expose helpers or unstable internals.

### 為什麼重要 / Why This Matters

公開 API 一旦被使用就會變成承諾；不要讓內部結構變成外部依賴。

### Linus 哲學 / Linus Philosophy

> "Never break userspace."

Do not accidentally commit to internal implementation details.

### 檢查清單 / Checklist

- [ ] 是否避免 `../../../components/...` 這類深層相對 import？
- [ ] 是否優先使用 `@/app/...` alias？
- [ ] `index.ts` / `index.tsx` 是否只 export 公開 API？
- [ ] 是否避免新增無差別 `export *`？
- [ ] Client Component 經 barrel export 時是否確認邊界合理？

### 範例 / Examples

```tsx
import { Button } from '@/app/components/atoms'
```

```ts
export { Button } from './button/button'
export { Input } from './input'
```

### 常見陷阱 / Common Pitfalls

- 為了方便新增 `export *`，讓 public surface 失控。
- 把內部 helper 從 layer barrel 暴露出去。

### 參考現有實作 / Reference Implementation

- `apps/frontend/src/app/components/atoms/index.tsx`

### 自動化 / Automation

- **TypeScript**: path alias 解析。

---

## 準則 6: 組件大小與拆分 / Guideline 6: Component Size And Splitting

### 說明 / Description

單個 `.tsx` component file 應控制在 200 行以內。超過 200 行是 review trigger，不是強迫拆出假抽象的理由。

A single `.tsx` component file should stay under 200 lines. Exceeding 200 lines is a review trigger, not a reason to create fake abstractions.

### 為什麼重要 / Why This Matters

小檔案只有在責任邊界清楚時才有價值。拆分應改善資料流、狀態邊界或可讀性。

### Linus 哲學 / Linus Philosophy

> "Functions must be short and sharp, doing just one thing well."

Conciseness is not a line-count game; what you are really eliminating are error boundaries and special cases.

### 檢查清單 / Checklist

- [ ] `.tsx` component file 是否低於 200 行？
- [ ] 超過時是否先檢查資料、狀態與 UI 責任是否混在一起？
- [ ] 是否優先抽出資料/狀態邏輯，再拆 JSX？
- [ ] 新抽出的 component 或 hook 是否有清楚 interface？
- [ ] 是否避免只為了藏行數而拆檔？

### 範例 / Examples

```tsx
function InventoryPage() {
  const inventory = useInventoryList()

  return (
    <>
      <InventoryTableHeader filters={inventory.filters} />
      <InventoryTableContent data={inventory.data} />
    </>
  )
}
```

### 常見陷阱 / Common Pitfalls

- 只把 JSX 搬到另一個檔案，但資料流仍然纏在一起。
- 抽出只使用一次且語意不清的 component。

### 參考現有實作 / Reference Implementation

- `apps/frontend/src/app/components/molecules/inventoryList/inventoryTableHeader.tsx`

---

## 準則 7: 檢查與格式化 / Guideline 7: Checks And Formatting

### 說明 / Description

完成前需執行與改動相關的 TypeScript、ESLint、Prettier 檢查。無法執行時必須明確回報。

Run relevant TypeScript, ESLint, and Prettier checks before completion. Report clearly when a check cannot be run.

### 為什麼重要 / Why This Matters

工具能穩定檢查的事，不應交給人工記憶或主觀信心。

### Linus 哲學 / Linus Philosophy

> "Talk is cheap. Show me the code."

Use tools for what can be automated; save review for design and behavior.

### 檢查清單 / Checklist

- [ ] 是否執行 `pnpm --filter frontend run type-check`？
- [ ] 是否執行 `pnpm --filter frontend run lint`？
- [ ] 若無法執行，是否在回報中說明原因？
- [ ] 若升級 Next.js 16，是否將 lint 改為 ESLint CLI？

### 範例 / Examples

```bash
pnpm --filter frontend run type-check
pnpm --filter frontend run lint
```

### 常見陷阱 / Common Pitfalls

- 只跑 format，卻宣稱型別與 hooks 規則沒問題。
- 把無法執行的檢查當成通過。

### 參考現有實作 / Reference Implementation

- `apps/frontend/package.json`

### 自動化 / Automation

- **TypeScript**: `pnpm --filter frontend run type-check`
- **ESLint**: `pnpm --filter frontend run lint`
- **Git Hook**: Husky pre-commit 會執行 `type-check` 與 `lint-staged`
- **lint-staged**: staged JS/TS 檔案會執行 `eslint --fix` 與 `prettier --write`

---

## 相關文檔 / Related Documents

- [AGENTS.md](../../AGENTS.md) - Linus Torvalds 開發哲學
- [README.md](README.md) - 準則總覽
- [Next.js ESLint](https://nextjs.org/docs/app/api-reference/config/eslint) - Next.js ESLint 配置
- [React Hooks Rules](https://react.dev/reference/rules/rules-of-hooks) - React 官方 Hooks 規則

---

**最後更新 / Last Updated**: 2026-05-16
**維護者 / Maintainer**: POS Team
