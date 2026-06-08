# 前端開發入口

固定載入的前端索引；詳細規則在 `.claude/rules`、`.claude/hooks` 與 `.claude/skills`。

## 架構概覽

| 面向 | 決策 |
| --- | --- |
| 前端框架 | Next.js 15 App Router / React 19 |
| 語言 | TypeScript |
| UI | Radix/shadcn-style atoms、Tailwind CSS、`lucide-react` |
| 資料邊界 | `lib/api/` 集中 API client（`apiRequest` wrapper + Zod 驗證）；資料轉換放在 `lib/`、`hooks/` 或路由邊界 |
| 狀態 | React local state + custom hooks；TanStack Query 管 server state；Zustand 管 client-only UI state |
| 路由 | Next.js App Router |
| Locales | 目前未導入 i18n |

## 必讀來源

- `AGENTS.md`：POS 專案工程原則。
- `.claude/rules/README.md`：前端規則總覽。
- `.claude/rules/typescript.md`：TypeScript 補充規則。
- `.claude/skills/atomic-design-convention/SKILL.md`：建立、放置、修改或審查 React 元件時使用。
- `.claude/hooks/README.md`：hook 觸發與驗證說明。
- `apps/frontend/docs/design-index.md`：UI 設計參考入口。
- `apps/frontend/docs/AI_CODE_REVIEW.md`：程式碼審查參考。
- `apps/frontend/docs/README.md`：Practical UI PDF 的可選設定；不要假設 PDF 一定存在。

## 前端專案地圖

```text
apps/frontend/
├── src/app/
│   ├── components/        # atoms, molecules, organisms, templates, pages
│   ├── hooks/             # reusable React hooks（UI hooks 平鋪；queries/ 子目錄放跨路由 React Query hooks）
│   ├── lib/
│   │   ├── api/           # apiRequest wrapper、Zod schema、API functions、query keys（按資源分子目錄）
│   │   ├── strategies/    # domain strategies
│   │   └── utils.ts
│   ├── stores/            # Zustand stores（client-only UI state，跨元件共用時才建立）
│   ├── types/             # shared TypeScript types
│   ├── product/           # product routes
│   ├── order/             # order routes
│   ├── customer/          # customer routes
│   ├── report/            # report routes
│   ├── providers.tsx      # client-only providers（QueryClient 等）
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── docs/
├── public/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

若 repo 實際結構不同，先遵循現有模式，再更新這份文件。

## 命名與放置

| 項目 | 慣例 | 範例 |
| --- | --- | --- |
| 元件 symbol | `PascalCase` | `ProductCard` |
| 元件檔案 | `camelCase` | `productCard.tsx` |
| Custom hook | `useXxx` | `useInventoryList.ts` |
| 事件 handler | `handleXxx` | `handleSubmit` |
| Callback prop | `onXxx` | `onConfirm` |
| 共用型別 | 放在 `types/`，用領域命名 | `inventoryList.ts` |

- 先找是否已有可重用元件、hook、輔助函式或型別。
- 跨功能可重用的 UI 才放到共用 `components/`。
- 單一路由流程專用的 UI 可以留在該路由目錄。
- 新增或移動元件時，依 Atomic Design 技能文件與既有分層慣例。

## 常用指令

在 repo 根目錄執行：

```bash
pnpm --filter frontend run dev
pnpm --filter frontend run type-check
pnpm --filter frontend run lint
pnpm --filter frontend run build
pnpm --filter frontend run format
```

`format` 會寫入檔案。只改文件時，使用符合風險的檢查即可。

## 邊界決策

| 邊界 | 專案決策 |
| --- | --- |
| API/data boundary | UI 不散落原始 API shape；轉換集中在資料邊界。 |
| 錯誤流程 | 同一個資料邊界不要混用回傳值錯誤與丟出例外。 |
| 可預期錯誤 | 表單錯誤、查無資料、API 失敗等應回到 UI state、form state 或 toast。 |
| 未預期錯誤 | 明確丟出或交給合適的 error boundary；不要用空 catch 吃掉。 |
| Shared state | 狀態更新集中在 hook、狀態擁有者或明確 handler，不從任意元件直接 patch。 |
| 使用者回饋 | Toast 是使用者回饋；`console.error()` 只能輔助診斷，不能替代 UI feedback。 |
| i18n | 沒有 i18n 基礎建設前，不把 locale 更新列為強制規則。 |

## 審查提醒，不是硬性失敗

| 提醒 | 審查動作 |
| --- | --- |
| `.tsx` component 超過 200 行 | 檢查是否混合資料、狀態與 UI 責任。 |
| Props 超過 7 個 | 檢查資料結構、責任邊界或是否需要拆分 API。 |
| 函式過長 | 檢查能否用 guard clause、命名清楚的 helper 或更直接的資料流簡化。 |
| 巢狀太深 | 優先整理控制流，不把難懂邏輯壓成更難懂的一行。 |

拆分必須讓責任邊界更清楚，不能只是把複雜度藏到另一個檔案。

## 交付前

- 只改文件：檢查連結、過期引用、行數與 hook 提醒內容。
- 前端 TS/TSX/設定檔：至少執行 `pnpm --filter frontend run type-check`，視風險加 lint 或 build。
- 已暫存的前端 JS/TS/TSX：可用 `pnpm --filter frontend run lint-staged` 驗證即將提交的檔案。
- 包含後端或 migration：依 `.claude/hooks/README.md` 使用對應檢查。
- 檢查 diff 是否只解決本次問題，且沒有過期路徑、指令或不存在的檔案。
