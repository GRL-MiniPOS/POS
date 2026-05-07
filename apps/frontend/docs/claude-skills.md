# Claude Code Skills 推薦清單

> 適用專案：React 19 + Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui

---

## ⭐⭐⭐ 高優先推薦

### React Best Practices
- **功能**：57 條 React/Next.js 性能優化規則，涵蓋 request waterfall、bundle size、RSC、data fetching 等
- **來源**：[vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills)
- **安裝**：`npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-react-best-practices`

### Next.js Best Practices
- **功能**：App Router、React Server Components、caching、routing、SEO 完整指南
- **來源**：[laguagu/claude-code-nextjs-skills](https://github.com/laguagu/claude-code-nextjs-skills)
- **安裝**：複製 `.claude/skills/` 內的 skill 檔案至專案

### shadcn/ui Skill（官方）
- **功能**：讀取 `components.json`，自動理解已安裝組件、CSS 變數、OKLCH 色彩、dark mode 設定
- **來源**：[ui.shadcn.com/docs/skills](https://ui.shadcn.com/docs/skills)
- **安裝**：`pnpm dlx skills add shadcn/ui`

### Mastering TypeScript
- **功能**：企業級 TypeScript 模式，包含 generics、mapped types、Zod 驗證、React 組件型別安全
- **來源**：[SpillwaveSolutions/mastering-typescript-skill](https://github.com/SpillwaveSolutions/mastering-typescript-skill)
- **安裝**：`skilz install -g https://github.com/SpillwaveSolutions/mastering-typescript-skill`

---

## ⭐⭐ 中優先推薦

### Tailwind v4 + shadcn/ui
- **功能**：Tailwind v4 與 shadcn/ui 整合、`@theme inline` 模式、CSS 變數架構、dark mode 設定
- **來源**：[secondsky/claude-skills](https://github.com/secondsky/claude-skills)
- **安裝**：`npx skills add https://github.com/secondsky/claude-skills --skill tailwind-v4-shadcn`

### React Composition Patterns
- **功能**：Compound component 模式、clean component API 設計、避免 boolean prop 增生
- **來源**：[vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills)
- **安裝**：`npx skills add https://github.com/vercel-labs/agent-skills --skill composition-patterns`

### Web Design Guidelines
- **功能**：100+ 條規則審查 ARIA、focus states、語意 HTML、鍵盤導航，確保 WCAG 合規
- **來源**：[vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills)
- **安裝**：`npx skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines`

### Playwright Skill
- **功能**：自動撰寫並執行 Playwright E2E 測試，捕捉 JS 錯誤與互動 bug
- **來源**：[lackeyjb/playwright-skill](https://github.com/lackeyjb/playwright-skill)
- **安裝**：via marketplace 或直接從 GitHub 安裝

### ShadcnBlocks
- **功能**：2,500+ 預製 shadcn/ui blocks 知識庫，快速組合 dashboard、landing page、e-commerce 等 UI
- **來源**：[masonjames/Shadcnblocks-Skill](https://github.com/masonjames/Shadcnblocks-Skill)
- **安裝**：`/plugin install shadcnblocks`

---

## ⭐ 選擇性推薦

### Next.js SEO
- **功能**：metadata API、動態 sitemap、JSON-LD structured data
- **來源**：[laguagu/claude-code-nextjs-skills](https://github.com/laguagu/claude-code-nextjs-skills)

### Frontend Design
- **功能**：提升 UI 視覺品質，避免過於「AI 味」的設計，適用 React + Tailwind 專案
- **來源**：[anthropics/skills](https://github.com/anthropics/skills)
- **安裝**：`/plugin install frontend-design@anthropic-agent-skills`

### Webapp Testing
- **功能**：使用 Playwright browser automation 測試本地 web app 的互動流程
- **來源**：[anthropics/skills](https://github.com/anthropics/skills)
- **安裝**：`/plugin install webapp-testing@anthropic-agent-skills`

---

## 瀏覽更多 Skills

| 資源 | 說明 |
|------|------|
| [claudemarketplaces.com](https://claudemarketplaces.com/) | 社群 marketplace，Frontend 分類有 26+ skills |
| [majiayu000/claude-skill-registry](https://github.com/majiayu000/claude-skill-registry) | 最完整的 skill 目錄，每日更新 |
| [claudeskills.info](https://claudeskills.info/skills/) | 140+ 免費開源 skills |
| [anthropics/skills](https://github.com/anthropics/skills) | Anthropic 官方 skills 集合 |
| [travisvn/awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills) | 社群精選清單 |

---

## 安裝方式說明

```bash
# 方式一：npx skills CLI
npx skills add <github-repo-url> --skill <skill-name>

# 方式二：Claude Code 內建指令
/plugin install <skill-name>@<collection-name>

# 方式三：shadcn/ui 官方
pnpm dlx skills add shadcn/ui

# 方式四：skilz 通用安裝工具
skilz install -g <github-repo-url>
```

> 安裝後需重啟 Claude Code 才會生效。
