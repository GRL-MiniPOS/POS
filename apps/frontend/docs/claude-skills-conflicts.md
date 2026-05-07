# Claude Code Skills 衝突分析與建議組合

> 對應文件：[`claude-skills.md`](./claude-skills.md)
> 適用專案：React 19 + Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
> 對照規範：`apps/frontend/CLAUDE.md`、`apps/frontend/docs/AI_CODE_REVIEW.md`

本文件針對 `claude-skills.md` 中推薦的 12 個 Claude Code Skills 進行衝突分析，協助評估安裝組合、避免規則互相打架。

---

## 目錄

- [一、與專案 CLAUDE.md 規範直接衝突](#一與專案-claudemd-規範直接衝突)
- [二、Skill 之間的功能重疊與規則衝突](#二skill-之間的功能重疊與規則衝突)
- [三、與專案組件架構的潛在不一致](#三與專案組件架構的潛在不一致)
- [四、安裝方式不一致的潛在問題](#四安裝方式不一致的潛在問題)
- [五、建議的最小衝突組合](#五建議的最小衝突組合)
- [六、覆蓋規則範本](#六覆蓋規則範本)

---

## 一、與專案 CLAUDE.md 規範直接衝突

### 1. React Best Practices (vercel-labs) ↔ 專案「避免過早優化」原則 🔴

| 項目 | React Best Practices | 專案 CLAUDE.md |
|------|----------------------|----------------|
| 性能優化哲學 | 57 條 React/Next.js 性能規則，傾向主動優化 | 明確規定「**不要過早優化**」 |
| `useCallback` | 容易被建議大量包裝 | **僅在子組件用 `memo` 時才使用** |
| `React.memo` | 容易被建議全面套用 | 僅當渲染成本高且有實測問題時 |
| `useMemo` | 容易被建議用於穩定引用 | 僅在計算昂貴或配合 memo 時 |

**衝突等級**：🔴 **高（最高風險）**

安裝後 Claude 可能會主動建議到處加 `useCallback` / `useMemo` / `memo`，與專案規範完全相反。

**建議處理方式**：
- ❌ 不建議直接安裝
- ✅ 若一定要用，挑選「data fetching、bundle size、RSC、request waterfall」相關規則，跳過 memoization 章節
- ✅ 在專案 rule 中明確覆寫優化策略（見[第六章覆蓋範本](#六覆蓋規則範本)）

---

## 二、Skill 之間的功能重疊與規則衝突

### 2. Next.js 系列重疊（同作者規則重複觸發）🟡

| Skill | 內容 |
|-------|------|
| Next.js Best Practices (laguagu) | App Router、RSC、caching、routing、**SEO** |
| Next.js SEO (laguagu) | metadata API、動態 sitemap、JSON-LD |

**衝突等級**：🟡 中（規則重複，prompt 膨脹）

兩者來自**同一個 repo** (`laguagu/claude-code-nextjs-skills`)，SEO 規則會被觸發兩次。

**建議處理方式**：
- ✅ **擇一即可**
- 若需要詳細 SEO → 只裝 `Next.js SEO`，再從 Best Practices 補裝其他子項
- 若以全方位為主 → 只裝 `Next.js Best Practices`

---

### 3. shadcn/ui 三方規則衝突 🔴

| Skill | 來源 | 重疊範圍 |
|-------|------|----------|
| shadcn/ui Skill（官方） | shadcn 官方 | components.json、CSS 變數、**OKLCH 色彩**、**dark mode** |
| Tailwind v4 + shadcn/ui | secondsky（第三方） | Tailwind v4 整合、`@theme inline`、**CSS 變數架構**、**dark mode** |
| ShadcnBlocks | masonjames | 2,500+ 預製 blocks（多為較舊寫法） |

**衝突等級**：🔴 高

潛在衝突點：

| 項目 | 官方 shadcn/ui | 第三方 secondsky |
|------|---------------|------------------|
| 色彩格式 | OKLCH（v4 新標準） | 可能仍用 HSL 寫法 |
| Dark mode 實作 | `class` strategy | 可能用 `data-theme` 或 `prefers-color-scheme` |
| CSS 變數定義 | `@theme` 內 | 直接寫在 `:root` |

**建議處理方式**：
- ✅ 以**官方 shadcn/ui Skill 為單一規則來源**
- ⚠️ `Tailwind v4 + shadcn/ui` 視為**補充參考**，避免與官方規則並用
- ✅ `ShadcnBlocks` 只作為「組件範本資料庫」查詢使用，避免影響全域樣式規則

---

### 4. Playwright 兩個 Skill 用途相近 🟡

| Skill | 定位 |
|-------|------|
| Playwright Skill (lackeyjb) | 自動**撰寫**並執行 E2E 測試檔（`*.spec.ts`） |
| Webapp Testing (anthropics) | 使用 Playwright **browser automation** 互動測試 |

**衝突等級**：🟡 中

兩者並用時，Claude 可能在「現在要寫 `*.spec.ts` 還是直接跑 automation」之間搖擺。

**建議處理方式**：
- ✅ **二擇一**
- 開發階段、互動測試 → `Webapp Testing`
- CI / 迴歸測試、寫測試檔 → `Playwright Skill`

---

### 5. UI 設計兩個方向的競合 🟢

| Skill | 取向 |
|-------|------|
| Web Design Guidelines (vercel-labs) | WCAG、ARIA、語意 HTML（**功能性可訪問性**） |
| Frontend Design (anthropics) | 提升視覺品質、避免「AI 味」（**美感優先**） |

**衝突等級**：🟢 低（少量摩擦）

不算正面衝突，但「為了視覺極簡移除某些 label」vs「為了 a11y 必須保留 label」會出現拉扯。

**建議處理方式**：
- ✅ 兩者可並用
- ✅ 在專案 rule 中明確：**a11y 規則優先於視覺簡化**

---

## 三、與專案組件架構的潛在不一致

### 6. React Composition Patterns ↔ Atomic Design + camelCase 🟡

| 項目 | React Composition Patterns | 專案規範 |
|------|---------------------------|----------|
| 組件設計 | Compound Component（如 `<Tabs><Tabs.List/></Tabs>`） | Atomic Design 五層 |
| 命名 | 子組件用 PascalCase、放同一檔案 | 檔案 **camelCase**（`stockManageListItem.tsx`） |
| 結構 | 通常單檔案集中 | 分層 `atoms / molecules / organisms` |

**衝突等級**：🟡 中

**建議處理方式**：
- ✅ 可保留 Composition Patterns
- ✅ 在 rule 中說明：「Compound 寫法只用在 atoms/molecules **內部**，目錄結構仍依 Atomic Design」

---

### 7. Mastering TypeScript 的 Zod 推薦 🟡

| 項目 | Mastering TypeScript | 專案規範 |
|------|---------------------|----------|
| 驗證 | 推薦 Zod 做 runtime 驗證 | 未強制 Zod，僅要求「禁 `any`、禁 `@ts-ignore`」 |

**衝突等級**：🟡 中

安裝後 Claude 可能會在每個 API 邊界主動引入 Zod，膨脹依賴與 boilerplate。

**建議處理方式**：
- ✅ **若要用**：先決定 Zod 是否成為專案標準並寫進 `CLAUDE.md`
- ✅ **若不用**：在 rule 中明確「除非明確要求，否則不主動引入 Zod」

---

## 四、安裝方式不一致的潛在問題

`claude-skills.md` 列出 **4 種安裝管道**：

```bash
npx skills add ...                  # 方式一
/plugin install ...@...             # 方式二
pnpm dlx skills add shadcn/ui       # 方式三
skilz install -g ...                # 方式四
```

**潛在問題**：

| 問題 | 說明 |
|------|------|
| 註冊路徑不同 | user-level vs project-level、`.claude/skills/` vs marketplace cache |
| 重複安裝 | 同一 skill 可能透過不同工具裝兩份 |
| 啟用/停用混亂 | 找不到對應檔案 |
| 升級不同步 | 各工具自己管自己的版本 |

**建議處理方式**：
- ✅ 統一使用 `npx skills add` 或 Claude Code / Cursor 內建 `/plugin install`
- ✅ 所有 skill 集中放在 `.claude/skills/`，由 git 管理
- ✅ 文件中只保留 1-2 種建議安裝方式

---

## 五、建議的最小衝突組合

依照前述分析，整理出與本專案最匹配的 skill 組合：

| 類別 | ✅ 推薦採用 | ❌ 跳過或慎用 | 理由 |
|------|------------|---------------|------|
| **React/Next.js** | Next.js Best Practices (laguagu) | React Best Practices (vercel) | 與「避免過早優化」衝突 |
| **TypeScript** | Mastering TypeScript（不啟用 Zod 章節） | — | 補充企業級型別模式 |
| **UI 元件** | **官方** shadcn/ui Skill | Tailwind v4 + shadcn/ui (secondsky) | 避免 OKLCH/HSL、dark mode 策略衝突 |
| **設計準則** | Web Design Guidelines（a11y 優先） | Frontend Design（視需要再加） | a11y 是硬需求 |
| **測試** | Webapp Testing **或** Playwright Skill（**二擇一**） | 不要兩個都裝 | 避免測試策略搖擺 |
| **範本庫** | ShadcnBlocks（僅作為查詢工具） | — | 僅查詢，不影響全域規則 |
| **SEO** | Next.js SEO（若 Next.js Best Practices 已涵蓋則可省） | — | 同 repo，避免重複 |

### 推薦最終安裝清單（精簡版）

```text
1. Next.js Best Practices (laguagu)
2. shadcn/ui Skill (官方)
3. Mastering TypeScript（不主動使用 Zod）
4. Web Design Guidelines (vercel-labs)
5. Webapp Testing (anthropics) ← 開發為主；若以 CI 為主改裝 Playwright Skill
6. ShadcnBlocks（僅當查詢用）
```

---

## 六、覆蓋規則範本

若採用上述組合，建議在 `apps/frontend/CLAUDE.md` 末尾或 `.cursor/rules/` 中加入以下覆寫規則，明確讓專案規範**優先於 skill 預設**：

```markdown
## Skill 規則覆寫（優先級高於所有外部 skill）

### 性能優化
- **嚴禁過早優化**：除非有實測（React DevTools Profiler）證明性能問題，否則不主動使用
  `React.memo` / `useCallback` / `useMemo`
- 若 skill 建議加上記憶化，必須先確認子組件是否已 `memo`，否則拒絕該建議

### 型別驗證
- **不主動引入 Zod**：除非任務明確要求 runtime 驗證
- 預設使用 TypeScript interface + 類型守衛

### UI / shadcn
- shadcn 規則以**官方 skill** 為唯一來源
- 色彩使用 OKLCH 格式
- Dark mode 使用 `class` strategy

### 可訪問性
- a11y（WCAG / ARIA）規則優先於視覺極簡
- 不可為了視覺乾淨移除必要的 label / aria-label

### 組件設計
- Compound Component 寫法僅限 atoms / molecules **內部**使用
- 目錄結構必須遵循 Atomic Design
- 檔案命名使用 camelCase（如 `productCard.tsx`）

### 測試
- 統一使用 [Webapp Testing | Playwright Skill]（依實際安裝擇一）
```

---

## 衝突等級圖例

- 🔴 **高**：直接違反專案規範或產生明顯規則矛盾，需立即處理
- 🟡 **中**：規則重疊或方向不一致，建議擇一或加覆寫
- 🟢 **低**：少量摩擦，可並用但需注意優先級

---

## 變更紀錄

| 日期 | 內容 |
|------|------|
| 2026-04-30 | 初版：基於 `claude-skills.md` 12 個 skills 完成衝突分析 |
