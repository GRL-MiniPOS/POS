# 專案已安裝 AI Skills 紀錄

基於 `claude-skills-conflicts.md` 的衝突分析，我們選用了「最小衝突組合」來確保 Claude Code / Cursor 等 AI 助手能在遵守專案架構（React 19 + Next.js 15 App Router + TypeScript + Tailwind v4 + shadcn/ui）的前提下發揮最大效用。

> **最後更新**：2026-05-05

**延伸閱讀**：[如何用已裝 Skills 簡化 CLAUDE 文件／可否再加裝 Skills](./claude-backup-simplification-with-skills.md)（對照本清單與 [claude-skills-conflicts.md](./claude-skills-conflicts.md) 的結論整理）。

---

## ✅ 已安裝的 Skills (Minimal Conflict Combination)

以下 Skills 已全數透過 `npx skills add` / `pnpm dlx skills add` 等方式安裝並註冊於本地專案/全域中。

| 類別 | Skill 名稱 | 來源 | 為什麼安裝？（無衝突理由） |
|------|-----------|------|---------------------------|
| **設計準則** | **Web Design Guidelines** | `vercel-labs/agent-skills` | 強制 AI 遵守 WCAG、ARIA、語意化 HTML 標準。優先級高於單純的美感極簡化。 |
| **Next.js** | **Next.js Best Practices** | `laguagu/claude-code-nextjs-skills` | 涵蓋 App Router、RSC、Caching 與基礎 SEO。捨棄了會過度優化（`useCallback` 濫用）的 React Best Practices，完美契合本專案「嚴禁過早優化」的規範。 |
| **UI 元件** | **shadcn/ui Skill (官方)** | `shadcn/ui` 官方 | 確保 AI 正確使用 OKLCH 色彩與 v4 Class 模式的 Dark Mode，避免與第三方 Tailwind v4 規則產生打架。 |
| **TypeScript** | **Mastering TypeScript** | `SpillwaveSolutions/mastering-typescript-skill` | 帶來企業級型別定義模式。⚠️ **注意**：雖然安裝了此 Skill，但在專案中「**不主動引入 Zod**」，除非明確要求 runtime 驗證。 |
| **測試** | **Webapp Testing** | `anthropics/skills` | 使用 Playwright 進行網頁互動測試。由於與 `Playwright Skill` 功能重疊，因此只安裝此項作為開發測試主力。 |
| **範本庫** | **ShadcnBlocks** | `masonjames/Shadcnblocks-Skill` | 2,500+ 預製區塊知識庫。⚠️ **注意**：僅作為查詢與組合的參考，最終程式碼需轉為專案規範的 Atomic Design 結構。 |

---

## ❌ 刻意排除的 Skills (避免衝突)

| 被排除的 Skill | 排除原因 |
|--------------|---------|
| **React Best Practices** (`vercel-labs`) | 🔴 **高衝突**。會主動加入大量 `React.memo` / `useCallback`，違反專案「不要過早優化」原則。 |
| **Tailwind v4 + shadcn/ui** (`secondsky`) | 🔴 **高衝突**。其色彩（可能仍用 HSL）與 Dark mode 策略會與官方 shadcn/ui skill 打架。 |
| **Next.js SEO** (`laguagu`) | 🟡 **中衝突**。與 Next.js Best Practices 內容重複，導致 AI 認知混亂。 |
| **Playwright Skill** (`lackeyjb`) | 🟡 **中衝突**。與 Webapp Testing 用途相近，為了避免 AI 在兩者間搖擺而排除。 |

---

## 🔧 AI 運作最高指導原則

已於 `apps/frontend/CLAUDE.md` (或 `.cursor/rules`) 生效下列覆寫規則（優先級高於所有已安裝的 Skills）：

1. **嚴禁過早優化**：不主動使用 `React.memo` / `useCallback` / `useMemo`。
2. **型別驗證**：不主動引入 Zod，預設使用 TS interface + 類型守衛。
3. **UI / shadcn**：統一遵循官方 OKLCH 色彩與 class strategy。
4. **可訪問性**：a11y 規則不可為了畫面極簡而妥協（例如移除 label）。
5. **組件設計**：即便使用 Compound Component 模式，也必須遵守 Atomic Design 分層與 `camelCase` 檔案命名。
