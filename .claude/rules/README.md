---
paths: [__disabled__]
---

# 前端開發準則總覽 / Frontend Development Guidelines Overview

本目錄包含前端專案的開發準則。準則的目的不是替工程師背誦規章，而是讓每次變更都能回答四件事：解決什麼問題、為什麼是這個形狀、如何驗證、還剩什麼風險。

This directory contains frontend development guidelines. The goal is not rule memorization, but making every change explain the problem, the chosen shape, the verification, and the remaining risk.

---

## 分類索引 / Category Index

| 分類               | Category                        | 準則編號 | Guidelines   | 檔案                                                     |
| ------------------ | ------------------------------- | -------- | ------------ | -------------------------------------------------------- |
| 組件生命週期與規範 | Component Lifecycle & Standards | 1-7      | 7 guidelines | [01-component-standards.md](01-component-standards.md)   |
| 程式碼品質         | Code Quality                    | 8-13     | 6 guidelines | [02-code-quality.md](02-code-quality.md)                 |
| 前端效能           | Frontend Performance            | 14-20    | 7 guidelines | [03-frontend-performance.md](03-frontend-performance.md) |
| 前端安全           | Frontend Security               | 21-25    | 5 guidelines | [04-frontend-security.md](04-frontend-security.md)       |
| 狀態與錯誤處理     | State & Error Handling          | 26-28    | 3 guidelines | [05-state-error-handling.md](05-state-error-handling.md) |
| 協作與溝通         | Collaboration & Communication   | 29-31    | 3 guidelines | [06-collaboration.md](06-collaboration.md)               |
| UI 可靠性          | UI Reliability                  | 32-33    | 2 guidelines | [07-ui-reliability.md](07-ui-reliability.md)             |
| Styling 與 Theme   | Styling And Theme               | 34-37    | 4 guidelines | [08-styling.md](08-styling.md)                           |

補充文件：

- [typescript.md](typescript.md) - 純 TypeScript 補充準則（TS-1–TS-3, TS-5）：型別邊界標注、runtime narrowing、discriminated union、泛型與 utility type 使用原則。
- [template.md](template.md) - 新增或重寫準則時使用的格式模板。

---

## 快速參考 / Quick Reference

### 組件生命週期與規範 / Component Lifecycle & Standards (1-7)

1. **Props 類型定義 / Props Type Definition** - Props 是組件資料邊界，必須有明確 TypeScript interface。
2. **Callback Props 規範 / Callback Props** - 子組件對外事件使用 `onXxx` callback props。
3. **Custom Hook 與副作用 / Custom Hooks And Effects** - Hook 只在降低複雜度時抽出，副作用要有完整依賴與 cleanup。
4. **Next.js Client Boundary / Next.js Client Boundary** - 專案不以 SSR 為主，`'use client'` 與 client runtime 邊界要清楚。
5. **Import 與公開 API / Imports And Public API** - 使用穩定 import 路徑，避免公開內部實作。
6. **組件大小與拆分 / Component Size And Splitting** - 單一 component file 建議不超過 200 行，拆分要按責任而非行數。
7. **檢查與格式化 / Checks And Formatting** - 完成前執行相關 type-check、lint、format 流程。

### 程式碼品質 / Code Quality (8-13)

8. **資料邊界與封裝 / Data Boundaries And Encapsulation** - 只暴露呼叫端需要的資料與操作。
9. **命名與語意 / Naming And Semantics** - 命名要表達 domain 語意，避免 pinyin、無意義縮寫與模糊暫存名。
10. **函數拆分與控制流 / Function Splitting And Control Flow** - 函數短而直接，巢狀維持在 3 層以內。
11. **重構候選方案 / Refactoring Candidate Moves** - 重構要刪掉特殊情況或縮小邊界，不新增無證據的抽象。
12. **React Hooks 正確性 / React Hooks Correctness** - Hooks 先求正確，memo 和 effect 只在有明確理由時使用。
13. **最小可行實作 / Smallest Working Implementation** - 用最小實作解決真實問題，新增複雜度前先說明取捨。

### 前端效能 / Frontend Performance (14-20)

14. **控制 Client Boundary 與 Lazy Loading / Control Client Boundaries and Lazy Loading** - 不以 SSR 作為主要效能策略，重元件與瀏覽器 API 才 lazy load。
15. **避免不必要的 Client State 與 Effect / Avoid Unnecessary Client State and Effects** - 不重複保存可推導資料，副作用必須清理。
16. **先測量，再優化 / Measure Before Optimizing** - 效能變更需要 baseline、before/after 與取捨說明。
17. **避免 N+1 請求與 Waterfall / Avoid N+1 Requests and Data Waterfalls** - 批次資料用單次 API 或並行請求取得。
18. **Memoization 服務資料流，不服務焦慮 / Memoization Serves Data Flow, Not Anxiety** - `useMemo`、`useCallback`、`React.memo` 必須有實際理由。
19. **大列表先分頁，再考慮虛擬捲動 / Paginate Large Lists Before Virtualizing** - 先用 UI 分頁與 API 分頁控制 render 範圍。
20. **Bundle 與資產大小要可見 / Keep Bundle and Assets Visible** - 用 Next build、Network、Lighthouse 或 bundle analyzer 檢查 bundle、圖片、字體與依賴。

### 前端安全 / Frontend Security (21-25)

21. **跨站腳本攻擊（XSS）防護 / XSS Protection** - 使用 JSX 預設轉義，避免直接使用 `dangerouslySetInnerHTML`。
22. **輸入驗證 / Input Validation** - 前端驗證只改善 UX，安全驗證仍需在 API 或可信任邊界執行。
23. **敏感資料處理 / Sensitive Data Handling** - 不把 token、secret 或不可公開資料放進瀏覽器可讀取位置。
24. **CORS（跨來源資源共享）與同源政策 / CORS And Same-Origin Policy** - 正式環境必須有明確來源與允許清單。
25. **套件安全稽核 / Dependency Security Audit** - 新套件與安全更新需納入 review。

### 狀態與錯誤處理 / State & Error Handling (26-28)

26. **狀態來源與錯誤邊界 / State Sources And Error Boundaries** - 資料來源、client state、remote/API state 與 Error Boundary 要有清楚邊界。
27. **可預期錯誤與使用者訊息 / Expected Errors And User Messages** - 表單驗證、API 失敗與查無資料應回到 UI state，不顯示技術細節。
28. **Loading、Empty 和 Error State / Loading, Empty And Error State** - 非同步操作與 TanStack Query 查詢應有清楚 loading、success、empty、error 狀態。

### 協作與溝通 / Collaboration & Communication (29-31)

29. **API 契約與類型同步 / API Contract & Type Sync** - 前端與 API provider 的契約必須文件化並同步 TypeScript types。
30. **Code Review 規範 / Code Review Standards** - PR 說明應包含 What、Why、How、Verification。
31. **Commit Message 規範 / Commit Message Standards** - 遵循 Conventional Commits。

### UI 可靠性 / UI Reliability (32-33)

32. **響應式布局 / Responsive Layout** - 支援已定義的窄 viewport、筆電與桌機版面，避免內容溢出與 hydration mismatch。
33. **向後相容性 / Backward Compatibility** - 不破壞現有使用者流程、URL、保存資料與公開介面。

### Styling 與 Theme / Styling And Theme (34-37)

34. **使用語意化 Design Token / Use Semantic Design Tokens** - 元件使用 semantic token，不散落 raw color。
35. **Dark Mode 由 Token 承擔 / Let Tokens Carry Dark Mode** - 以 `.dark` 覆寫 token，避免每個元件各自管理色票。
36. **ClassName 組合與 Variant 邊界 / ClassName Composition And Variant Boundaries** - 使用 `cn()` 合併 className，必要時用 CVA 管理可重用 variant。
37. **CSS 只處理全域與難以局部化的樣式 / CSS Is For Global And Hard-To-Localize Styles** - 元件樣式優先留在 TSX，CSS 保留給 token、base layer 與全域覆寫。

---

## 使用方式 / Usage

### 開發時 / During Development

1. 先確認這次變更的實際問題與最小範圍。
2. 找到對應準則文件，優先閱讀和本次修改相關的條目。
3. 修改後執行和變更風險相符的驗證命令。
4. 在 PR 或交付說明中寫清楚問題、解法、驗證與剩餘風險。

### 維護準則文件時 / Maintaining Rule Documents

準則文件要服務工程師維護，不要服務一次性的情境描述。尤其是 [03-frontend-performance.md](03-frontend-performance.md)、[04-frontend-security.md](04-frontend-security.md)、[05-state-error-handling.md](05-state-error-handling.md)、[06-collaboration.md](06-collaboration.md)、[07-ui-reliability.md](07-ui-reliability.md) 與 [08-styling.md](08-styling.md)，請維持通用 Next.js / React / TypeScript 原則，不把示範資料、短期 workaround、單一頁面或特定檔案路徑寫成標準。若已決定導入工具（例如 TanStack Query 或 API type generator），要標清楚是導入後標準；若尚未決定，則不要寫成既有檢查。

以 Linus 風格審查準則文件時，至少確認：

- **真問題**：每條準則都能說清楚避免什麼實際成本或錯誤。
- **最小做法**：建議優先是小而直接的做法，不先引入複雜工具。
- **可驗證**：效能規則要能指向 build、Profiler、Network、Lighthouse 或可重現操作。
- **可維護**：範例用穩定、通用命名；避免依賴當前暫定頁面。

### 目前可用的自動化 / Current Automation

目前專案有以下實際存在的自動化：

- **Husky pre-commit**: `.husky/pre-commit` 會執行 `pnpm --filter frontend run type-check` 與 `pnpm --filter frontend run lint-staged`。
- **lint-staged**: `apps/frontend/package.json` 會對 staged `js/jsx/ts/tsx` 執行 `eslint --fix` 與 `prettier --write`。
- **commit-msg**: `.husky/commit-msg` 會執行 commitlint。
- **Guideline reminder script**: `.claude/hooks/check-guidelines.sh` 目前是提醒腳本，不是 blocking check。

目前沒有確認存在的 `/guideline-review` 指令，也沒有針對所有 37 條準則的完整自動化掃描。若要做完整審查，請以本 README 的分類索引搭配各準則文件人工 review。

### 常用驗證命令 / Common Verification Commands

```bash
pnpm --filter frontend run type-check
pnpm --filter frontend run lint
pnpm --filter frontend run build
pnpm --filter frontend run format
```

注意：`format` 會寫入檔案。若只想檢查格式，需先新增對應 script，或在執行後檢查 diff。

注意：`lint` 目前執行 `next lint`。Next.js 15 仍可執行，但會提示此命令將在 Next.js 16 移除；升級前應遷到 ESLint CLI。

---

## 哲學基礎 / Philosophical Foundation

這些準則延續 [AGENTS.md](../../AGENTS.md) 的工程取向：簡單核心、可審查 patch、快速回饋、長期可維護。

### Good Taste

- **準則 8**：先整理資料邊界，避免每個呼叫端處理內部細節。
- **準則 11**：重構要消除特殊情況，而不是新增更花俏的特殊情況。

### Never Break Userspace

- **準則 4**：Client runtime 邊界變更不能破壞 hydration 行為。
- **準則 33**：公開介面與使用者流程不能被內部重構順手破壞。

### Pragmatism

- **準則 13**：只為真實問題付出複雜度。
- **準則 16**：效能優化要有測量或清楚觀察。

### Simplicity

- **準則 9**：命名清楚，減少需要註解補救的程式碼。
- **準則 10**：控制流平坦，函數責任單一。

---

## 自動化層級 / Automation Levels

| 自動化程度 | Level               | 準則                           | 說明                                                                                           |
| ---------- | ------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------- |
| 可阻擋     | Blocking            | 7, 31                          | Husky 可阻擋 type-check、staged lint/format、commitlint 問題。                                 |
| 半自動     | Partially Automated | 1, 3, 4, 12, 36                | TypeScript、ESLint、Next.js、CVA types 可檢查部分型別、Hooks、App Router 與 variant API 問題。 |
| 人工審查   | Manual Review       | 2, 5-6, 8-11, 13-30, 32-35, 37 | 命名、封裝、架構、效能取捨、安全語意、token 使用、CSS 邊界與相容性仍需工程師 review。          |

---

## 準則優先級 / Guideline Priority

### P0 - 會直接導致錯誤或阻擋交付

- **準則 1-4**: Props、Callback、Hooks、Client runtime 邊界。
- **準則 7**: TypeScript、ESLint、Prettier 基礎檢查。
- **準則 21-25**: 前端安全。
- **準則 33**: 向後相容性。

### P1 - 會明顯提高維護成本

- **準則 8-13**: 程式碼品質。
- **準則 26-28**: 狀態與錯誤處理。
- **準則 29-31**: API 契約、Code Review、Commit。

### P2 - 依風險和資料量逐步加強

- **準則 14-20**: 前端效能。
- **準則 32**: 響應式布局。
- **準則 34-37**: Styling 與 theme。
- **補充文件 09**: TypeScript 細節。

---

## 相關文檔 / Related Documents

- [AGENTS.md](../../AGENTS.md) - 專案工程原則與 Linus 風格開發哲學。
- [apps/frontend/CLAUDE.md](../../apps/frontend/CLAUDE.md) - 前端專案架構與開發規範。
- [apps/frontend/README.md](../../apps/frontend/README.md) - Next.js app 基礎說明。
- [template.md](template.md) - 準則文件格式模板。

---

**最後更新 / Last Updated**: 2026-05-16
**維護者 / Maintainer**: Frontend Team
**版本 / Version**: 1.3.8
**參考 / Reference**: AGENTS.md 工程原則，適配 Next.js 15 / React 19 / TypeScript / Tailwind CSS
