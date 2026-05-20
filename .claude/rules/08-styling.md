---
paths:
  [
    'apps/frontend/src/**/*.tsx',
    'apps/frontend/src/**/*.ts',
    'apps/frontend/src/**/*.css',
    'apps/frontend/tailwind.config.ts',
    'apps/frontend/components.json',
  ]
---

# Styling 與 Theme / Styling And Theme (準則 34-37)

本文檔涵蓋 React / Next.js 專案中的 styling、design token、dark mode、className 組合與 CSS 使用邊界。

This document covers styling, design tokens, dark mode, className composition, and CSS boundaries in React / Next.js projects.

---

## 準則 34: 使用語意化 Design Token / Guideline 34: Use Semantic Design Tokens

### 說明 / Description

元件樣式應優先使用語意化 token，例如 `bg-background`、`text-foreground`、`bg-card`、`text-muted-foreground`、`border-border`、`ring-ring`、`bg-primary`、`text-primary-foreground`。不要在元件內散落品牌色、灰階色票或任意色碼。

Component styles should prefer semantic tokens such as `bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `border-border`, `ring-ring`, `bg-primary`, and `text-primary-foreground`. Do not scatter brand colors, gray palettes, or arbitrary color values inside components.

例外只應出現在 token 定義、第三方套件整合、圖表色盤或臨時除錯，而且要能說明為什麼 semantic token 不足以表達該用途。

Exceptions should stay in token definitions, third-party integrations, chart palettes, or temporary debugging, and the reason must be clear when semantic tokens cannot express the use case.

### 為什麼重要 / Why This Matters

- **主題一致**：同一個 token 可以同時服務 light mode、dark mode 與後續主題調整。
- **降低回歸風險**：改 token 定義比逐檔搜尋色碼安全。
- **可審查**：reviewer 能看出顏色語意，而不是猜 `#505050` 在這裡代表什麼。
- **避免特殊情況擴散**：色碼一旦進入元件，下一個元件很容易複製同一個例外。

### Linus 哲學 / Linus Philosophy

> "Bad programmers worry about the code. Good programmers worry about data structures."

顏色與間距也是資料模型。先把 token 邊界整理好，元件就不需要各自發明特殊情況。

### 檢查清單 / Checklist

- [ ] 元件是否使用 semantic token，而不是 `text-gray-*`、`bg-white`、`border-gray-*` 或任意色碼？
- [ ] 文字與背景是否成對使用，例如 `bg-primary text-primary-foreground`？
- [ ] 新增 token 前，是否先確認既有 token 不能表達同一語意？
- [ ] raw color 是否只出現在 theme、global CSS、圖表色盤或清楚隔離的 integration？
- [ ] 若新增 token，是否同時定義 light/dark 對應值？

### 範例 / Examples

**不推薦 - 在元件內寫死色票**:

```tsx
function StatusBadge() {
  return (
    <span className="rounded-md border border-gray-200 bg-white px-2 py-1 text-gray-600">
      Active
    </span>
  )
}
```

**推薦 - 使用語意化 token**:

```tsx
function StatusBadge() {
  return (
    <span className="rounded-md border border-border bg-card px-2 py-1 text-muted-foreground">
      Active
    </span>
  )
}
```

**推薦 - 需要強調狀態時仍使用 token pair**:

```tsx
function PrimaryAction() {
  return (
    <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">
      Save
    </button>
  )
}
```

### 常見陷阱 / Common Pitfalls

**陷阱 1: 把 Tailwind 預設灰階當成設計系統**

```tsx
// 不推薦：灰階語意不清，dark mode 也要逐一補
<p className="text-gray-500 dark:text-gray-400">No data</p>

// 推薦：用 token 表達低強度文字
<p className="text-muted-foreground">No data</p>
```

**陷阱 2: hover 狀態自己挑一個色碼**

```tsx
// 不推薦：hover 色和 theme 沒有關係
<button className="bg-[#505050] hover:bg-[#404040] text-white">Delete</button>

// 推薦：用 destructive token 表達危險操作
<button className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
  Delete
</button>
```

### 參考現有實作 / Reference Implementation

- `apps/frontend/tailwind.config.ts` - 將 CSS variables 映射成 Tailwind semantic utilities。
- `apps/frontend/src/app/globals.css` - 定義 `:root` 與 `.dark` 的 theme variables。
- `apps/frontend/src/app/components/atoms/card.tsx` - 使用 `bg-card`、`text-card-foreground` 與 `border`。

### 自動化 / Automation

- **ESLint**: 目前沒有阻擋 hardcoded color 的專用規則。
- **Git Hook**: pre-commit 會跑 type-check 與 staged lint/format，但不會完整判斷 token 語意。
- **Manual Review**: reviewer 應搜尋 `#[0-9a-fA-F]`、`text-gray`、`bg-white`、`border-gray`、`dark:`。

---

## 準則 35: Dark Mode 由 Token 承擔 / Guideline 35: Let Tokens Carry Dark Mode

### 說明 / Description

專案採 class-based dark mode。元件不應為每個顏色手動補一組 `dark:*`。優先讓 `.dark` 下的 CSS variables 覆寫同一批 token，元件只使用穩定的 semantic class。

The project uses class-based dark mode. Components should not manually add `dark:*` for every color. Prefer overriding the same tokens under `.dark` so components can keep stable semantic classes.

`dark:*` 可以用在少數非 token 屬性，例如圖片反相、特定陰影或暫時無法 token 化的第三方內容。新增前要能說明為什麼 token 不適合。

Use `dark:*` only for non-token properties such as image inversion, specific shadows, or third-party content that cannot be tokenized yet. Explain why a token is not suitable before adding it.

### 為什麼重要 / Why This Matters

- **少改少錯**：切換 theme 時不需要逐一修改元件。
- **避免組合爆炸**：每個顏色都加 `dark:*` 會讓 className 很快失控。
- **可測試**：切換 `.dark` 後能用同一套元件檢查對比與可讀性。
- **使用者體驗**：dark mode 不是反相貼皮，互動狀態也要保持清楚。

### Linus 哲學 / Linus Philosophy

> "Good code has no special cases."

同一個 component 在不同 theme 下應該走同一條 styling 路徑。特殊分支越少，越容易維護。

### 檢查清單 / Checklist

- [ ] 元件顏色是否主要來自 semantic token？
- [ ] 新增 token 時是否同步定義 `.dark` 值？
- [ ] 是否避免 `bg-white dark:bg-black` 這類成對硬寫？
- [ ] focus ring、border、hover、disabled 狀態在 dark mode 是否仍清楚？
- [ ] 使用 `dark:*` 時是否有明確理由，且範圍足夠小？

### 範例 / Examples

**不推薦 - 元件自行管理 light/dark 色票**:

```tsx
function EmptyState() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 text-gray-600 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300">
      No records
    </div>
  )
}
```

**推薦 - 由 token 切換 theme**:

```tsx
function EmptyState() {
  return (
    <div className="rounded-lg border border-border bg-card p-6 text-muted-foreground">
      No records
    </div>
  )
}
```

**推薦 - 非顏色 token 的小範圍 dark variant**:

```tsx
import Image from 'next/image'

function Logo() {
  return (
    <Image
      src="/logo.svg"
      alt="Product logo"
      width={120}
      height={32}
      className="dark:invert"
    />
  )
}
```

### 常見陷阱 / Common Pitfalls

**陷阱 1: 只測背景，沒有測互動狀態**

```tsx
// 不推薦：hover 和 focus 在 dark mode 下可能沒有足夠對比
<button className="bg-white text-gray-900 hover:bg-gray-100 focus:ring-gray-300">
  Confirm
</button>

// 推薦：狀態也使用 token
<button className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring">
  Confirm
</button>
```

**陷阱 2: 新增 token 只補 light mode**

```css
/* 不推薦：dark mode 會沿用 light value */
:root {
  --warning: 42 96% 50%;
}

/* 推薦：每個 theme 都有明確值 */
:root {
  --warning: 42 96% 50%;
}

.dark {
  --warning: 42 90% 62%;
}
```

### 參考現有實作 / Reference Implementation

- `apps/frontend/tailwind.config.ts` - `darkMode: ['class']`。
- `apps/frontend/src/app/globals.css` - `.dark` selector 覆寫 theme variables。
- `apps/frontend/components.json` - `tailwind.cssVariables` 設為 `true`。

### 自動化 / Automation

- **Manual Review**: 切換 `.dark` 後檢查文字、border、hover、focus、disabled。
- **Browser Check**: 使用瀏覽器開發者工具切換 `html.dark` 或 theme provider。
- **ESLint**: 目前沒有完整檢查 dark mode 對比的規則。
- **Git Hook**: 目前不阻擋 dark mode 視覺回歸。

---

## 準則 36: ClassName 組合與 Variant 邊界 / Guideline 36: ClassName Composition And Variant Boundaries

### 說明 / Description

React 元件使用 `className` 作為樣式入口。需要合併 base class、variant class、條件 class 與呼叫端傳入的 `className` 時，使用 `cn()`。不要用 template literal 或字串相加來組合 Tailwind class，因為衝突 class 不會被正確合併。

React components use `className` as the styling entry point. Use `cn()` when merging base classes, variant classes, conditional classes, and caller-provided `className`. Do not compose Tailwind classes with template literals or string concatenation because conflicting classes will not be merged correctly.

可重用元件的固定變體使用 CVA。一次性頁面布局不需要為了看起來工整而抽 variant，先保持 className 直接可讀。

Use CVA for stable variants in reusable components. One-off page layouts do not need variants just to look tidy; keep className direct and readable first.

### 為什麼重要 / Why This Matters

- **衝突可預期**：`cn()` 搭配 `tailwind-merge` 可以處理 `px-2` 與 `px-4` 這類衝突。
- **公開 API 清楚**：variant 是元件 API，不是散落在呼叫端的字串約定。
- **避免過度抽象**：沒有重用需求時，CVA 只會把簡單樣式拆遠。
- **review 容易**：className 的來源與覆寫順序清楚，問題比較好追。

### Linus 哲學 / Linus Philosophy

> "Talk is cheap. Show me the code."

variant 不是裝飾名詞。只有當它讓呼叫端更清楚、讓狀態更少時，才值得成為 API。

### 檢查清單 / Checklist

- [ ] 是否使用 `cn()` 合併 `className`？
- [ ] 呼叫端傳入的 `className` 是否保留最後覆寫能力？
- [ ] 可重用元件的 variant 是否用 CVA 或同等清楚的 mapping 管理？
- [ ] 一次性布局是否避免過早抽成 variant？
- [ ] variant 名稱是否描述語意，而不是描述單一色碼或 CSS 細節？

### 範例 / Examples

**不推薦 - 字串相加造成 class 衝突不明**:

```tsx
interface PanelProps {
  className?: string
  isCompact?: boolean
}

function Panel({ className = '', isCompact = false }: PanelProps) {
  return (
    <section
      className={`rounded-md border border-border p-6 ${
        isCompact ? 'p-3' : ''
      } ${className}`}
    />
  )
}
```

**推薦 - 使用 `cn()` 合併條件 class**:

```tsx
import { cn } from '@/app/lib/utils'

interface PanelProps {
  className?: string
  isCompact?: boolean
}

function Panel({ className, isCompact = false }: PanelProps) {
  return (
    <section
      className={cn(
        'rounded-md border border-border p-6',
        isCompact && 'p-3',
        className
      )}
    />
  )
}
```

**推薦 - 可重用元件使用 CVA**:

```tsx
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/app/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-secondary text-secondary-foreground',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground',
        outline: 'border-border text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}
```

### 常見陷阱 / Common Pitfalls

**陷阱 1: 把 `className` 放在前面，導致呼叫端覆寫失效**

```tsx
// 不推薦：base class 可能蓋掉呼叫端傳入的 className
className={cn(className, 'p-6')}

// 推薦：呼叫端 className 最後合併
className={cn('p-6', className)}
```

**陷阱 2: 用 variant 表達顏色細節，而不是語意**

```tsx
// 不推薦：API 綁死色票
type ButtonVariant = 'black' | 'gray' | 'white'

// 推薦：API 表達用途
type ButtonVariant = 'default' | 'secondary' | 'destructive' | 'ghost'
```

### 參考現有實作 / Reference Implementation

- `apps/frontend/src/app/lib/utils.ts` - `cn()` 使用 `clsx` 與 `tailwind-merge`。
- `apps/frontend/src/app/components/atoms/button.tsx` - 使用 CVA 管理 `variant` 與 `size`。
- `apps/frontend/src/app/components/atoms/badge.tsx` - 使用 CVA 管理 badge variants。

### 自動化 / Automation

- **TypeScript**: CVA `VariantProps` 可檢查 variant API。
- **ESLint**: 可檢查未使用 import 與部分 React 問題，但不會理解 Tailwind 衝突。
- **Prettier**: 只負責格式，不代表 className 合併正確。
- **Manual Review**: 搜尋 ``className={` ``、`+ className`、`props.className`。

---

## 準則 37: CSS 只處理全域與難以局部化的樣式 / Guideline 37: CSS Is For Global And Hard-To-Localize Styles

### 說明 / Description

元件樣式優先放在 TSX 的 `className`。CSS 檔案保留給 Tailwind directives、theme variables、`@layer base`、第三方套件覆寫、真正需要 selector 的複雜情境。不要把 component stylesheet 當成預設做法，除非有明確收益。

Prefer TSX `className` for component styles. CSS files should be reserved for Tailwind directives, theme variables, `@layer base`, third-party overrides, and complex cases that genuinely need selectors. Do not make component stylesheets the default unless there is a clear benefit.

`@apply` 不是預設寫法。全域 base style 可以使用 `@apply` 連接 Tailwind token；元件樣式不要用 `@apply` 包成另一層自訂 class，否則 reviewer 需要同時追 TSX 與 CSS 才能理解一個元件。

`@apply` is not the default style authoring pattern. Global base styles can use `@apply` to connect Tailwind tokens; component styles should not hide Tailwind classes behind custom classes because reviewers then need to chase both TSX and CSS to understand one component.

### 為什麼重要 / Why This Matters

- **樣式就近可讀**：元件行為與樣式在同一個地方 review。
- **減少隱藏依賴**：自訂 CSS class 容易變成全域副作用。
- **避免框架殘留**：React / Next.js 的元件樣式入口是 `className`，不是每個元件一份 stylesheet。
- **降低維護成本**：只在需要全域能力時才進 CSS。

### Linus 哲學 / Linus Philosophy

> "Simplicity is the ultimate sophistication."

能用一個 `className` 說清楚的事，不要拆成三個檔案與一個命名慣例。

### 檢查清單 / Checklist

- [ ] 元件專屬樣式是否留在 `className`？
- [ ] CSS 是否只包含 Tailwind directives、theme variables、base layer 或第三方覆寫？
- [ ] 新增 `@apply` 前，是否確認直接寫 className 會更糟？
- [ ] 自訂 selector 是否不會影響非預期元件？
- [ ] 全域 CSS 修改是否已檢查 light/dark mode 與常見頁面？

### 範例 / Examples

**不推薦 - 為單一元件新增全域 CSS class**:

```css
.toolbarButton {
  @apply rounded-md border border-border bg-background px-3 py-2 text-sm;
}
```

```tsx
function ToolbarButton() {
  return <button className="toolbarButton">Filter</button>
}
```

**推薦 - 元件樣式留在 `className`**:

```tsx
function ToolbarButton() {
  return (
    <button className="rounded-md border border-border bg-background px-3 py-2 text-sm">
      Filter
    </button>
  )
}
```

**推薦 - CSS 處理全域 token 與 base layer**:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
  }

  .dark {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
  }

  body {
    @apply bg-background text-foreground;
  }
}
```

### 常見陷阱 / Common Pitfalls

**陷阱 1: 用 CSS class 藏元件狀態**

```css
/* 不推薦：狀態和 component props 分離 */
.buttonDanger {
  @apply bg-destructive text-destructive-foreground;
}
```

```tsx
// 推薦：狀態留在 component API
<Button variant="destructive">Delete</Button>
```

**陷阱 2: 任意 selector 造成全域副作用**

```css
/* 不推薦：所有 button 都被影響 */
button {
  @apply rounded-md;
}

/* 推薦：只保留真正全域的基礎樣式 */
body {
  @apply bg-background text-foreground;
}
```

### 參考現有實作 / Reference Implementation

- `apps/frontend/src/app/globals.css` - 放置 Tailwind directives、theme variables 與 base layer。
- `apps/frontend/src/app/components/atoms/button.tsx` - 元件樣式集中在 `className` 與 CVA。
- `apps/frontend/src/app/components/atoms/card.tsx` - 以 `className` 暴露可覆寫樣式入口。

### 自動化 / Automation

- **Prettier**: 格式化 CSS / TSX。
- **ESLint**: 不會阻擋過度使用 `@apply` 或全域 selector。
- **Manual Review**: 新增 CSS 時檢查是否真的需要 selector 或全域層級。
- **Git Hook**: pre-commit 會執行既有 type-check 與 staged lint/format。

---

## 總結 / Summary

Styling 與 Theme 的 4 條準則核心思想：

1. **準則 34**: 元件使用 semantic design token，不散落 raw color。
2. **準則 35**: dark mode 由 token 承擔，避免每個元件各自補色票。
3. **準則 36**: 用 `cn()` 與必要的 CVA 管理 className 組合與 variant API。
4. **準則 37**: CSS 只處理全域與難以局部化的樣式，元件樣式優先留在 TSX。

**Linus 哲學在 Styling 與 Theme 中的體現**:

- **Good Taste** → 準則 34、35（把 theme 當成資料模型，消除每個元件的特殊色彩分支）。
- **Pragmatism** → 準則 36（variant 只在能降低實際重複與錯誤時才抽象）。
- **Simplicity** → 準則 37（能就近讀懂的樣式，不拆到全域 CSS）。
- **Never break userspace** → 準則 35（theme 切換不能破壞既有可讀性與互動狀態）。

---

## 相關文檔 / Related Documents

- [AGENTS.md](../../AGENTS.md) - Linus Torvalds 開發哲學。
- [README.md](README.md) - 準則總覽。
- [template.md](template.md) - 準則文件格式模板。
- [Tailwind CSS Theme Variables](https://tailwindcss.com/docs/theme) - design token 與 utility class 的關係。
- [shadcn/ui Theming](https://ui.shadcn.com/docs/theming) - CSS variables、theme tokens 與 dark mode。

---

**最後更新 / Last Updated**: 2026-05-15  
**維護者 / Maintainer**: Frontend Team
