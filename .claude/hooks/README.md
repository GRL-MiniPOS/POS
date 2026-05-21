# Claude Hooks

這個目錄放 Claude Code 與提交流程使用的小型 hook script。目標是把 POS 專案規則放在工作流旁邊提醒，但不把 hook 做成另一套複雜框架。

## `check-context.sh`

Claude `UserPromptSubmit` hook 會呼叫這支 script。它會讀取目前 Git 變更，依檔案路徑輸出對應提醒，例如：

- Next.js / React / TypeScript 檔案：提醒 props、client boundary、hooks、type-check。
- frontend components：提醒 Atomic Design、`cn()`、Tailwind semantic tokens。
- backend Go / migration 檔案：提醒 handler/repository/DTO 邊界、migration pairing、Go tests。
- `.claude`、docs、rules：提醒維持規則可審查、不要留下模板殘留。

這支 script 只提供 context，不阻擋 Claude 或開發流程。它在 [.claude/settings.json](../settings.json) 中透過 `UserPromptSubmit` 掛載。

## `pre-commit-validation.sh`

這支 script 是提交前的風險對應驗證 helper。它只看 staged files，依變更類型跑必要檢查：

- frontend JS/TS/TSX/config：`pnpm --filter frontend run type-check`
- staged frontend JS/TS/TSX：`pnpm --filter frontend run lint-staged`
- backend Go / SQL / module files：`cd apps/backend && go test ./...`
- migration SQL：檢查 `.up.sql` / `.down.sql` 是否成對
- shell script：`bash -n`
- JSON：用 Node.js parse 檢查語法

檢查失敗時會回傳非 0 exit code，可用於阻擋 commit。若目前沒有 staged files，會直接略過。

## 手動執行

```bash
bash .claude/hooks/check-context.sh
bash .claude/hooks/pre-commit-validation.sh
```

`check-context.sh` 是提醒工具；`pre-commit-validation.sh` 是驗證工具。兩者都應保持小而直接，新增檢查前先確認它解決真實問題。
