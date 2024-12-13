# Git Commit 規範

以 **what, why, how** 為 Git Commit 基準：

- **What**：這個提交版本做了什麼事情
- **Why**：為什麼要做這件事情
- **How**：用什麼方法做到的

## 規範說明

- 使用 `commitizen + husky + commitlint` 來執行符合規範的 Commit Message。
- 使用 `standard-version` 來執行版本發佈。
- 規範依循 [Conventional Commits](https://www.conventionalcommits.org/)。

### 工具組合說明

- **commitizen**：使用 `pnpm cz` 代替 `git commit`，透過互動式流程產出符合規範的 Commit Message。
- **husky + commitlint**：在 `git commit` 時檢查 Commit Message 是否符合規範，不符合則無法提交。
- **standard-version**：自動遞增版本號、自動打 Tag、並自動生成 Changelog。

## 提交類型 (Type) 說明

**(必填) 請選擇一種類型**

| Type     | Description                              | 說明                              |
| -------- | ---------------------------------------- | --------------------------------- |
| feat     | A new feature                            | 新功能                            |
| fix      | A bug fix                                | 錯誤修正                          |
| docs     | Documentation only changes               | 文件更新                          |
| style    | Changes that do not affect code logic    | 程式碼格式調整 (不影響邏輯)       |
| refactor | A code change neither fix nor feature    | 程式碼重構 (不新增功能、不改邏輯) |
| perf     | Performance improvements                 | 效能提升                          |
| test     | Add or fix tests                         | 測試新增或修正                    |
| build    | Changes to the build system/dependencies | 建構系統或依賴調整                |
| ci       | Changes to CI config/scripts             | CI 配置檔案或 scripts 修改        |
| chore    | Other changes that don't modify src/test | 雜項調整，不影響程式運作邏輯      |
| revert   | Reverts a previous commit                | 回覆先前的 commit                 |

## 範圍 (Scope) (選填)

- 請填入本次提交影響的範圍，如 `frontend`, `backend`, `api`, `auth`, `shared-ui` 等。
- 不需加 `$` 符號，使用小寫標註。
- 在 MonoRepo 架構下，建議以子專案或模組名稱為範疇 (例如 `frontend`, `backend`, `package-xxx`)。

## 標題 (Subject) (必填)

- 簡短描述此次變更，不超過 93 字元，結尾不加句號。
- 確保此次 Commit 單一化，一次只著重一個重點變更。

## 補充內容 (Body) (選填)

- 條列式描述「改了什麼」、「為什麼改」。
- 若要換行請加入 `\n`。
- 非必要可跳過。

## 破壞性更新 (Breaking Changes) (選填)

- 若有不相容於上一版的變更，請在互動中選擇 `Yes` 並加以說明。

## 關聯 Issue (選填)

- 若要關閉特定 GitHub issue，請在結尾加上 `(refs #issue編號)`。
- 例如：`(refs #123)`。

---

## 範例

### feat 類型提交範例

```bash
git add .
pnpm cz
```

互動流程示例：

```
? Select the type of change that you're committing: feat: A new feature
? What is the scope of this change (e.g. component or file name): frontend
? Write a short, imperative tense description of the change (max 93 chars):
  add user authentication flow
? Provide a longer description of the change: (press enter to skip)
? Are there any breaking changes? No
? Does this change affect any open issues? No

# Commit 結果
[main caae82e] feat(frontend): add user authentication flow
```

---

## 工具配置與操作

### commitizen + cz-conventional-changelog

**安裝**

```bash
pnpm add -D commitizen cz-conventional-changelog
```

**配置 (`package.json`)：**

```json
{
  "config": {
    "commitizen": {
      "path": "cz-conventional-changelog"
    }
  }
}
```

**執行 Commit：**

```bash
pnpm cz
```

如需在 scripts 中設置：

```json
{
  "scripts": {
    "commit": "cz"
  }
}
```

之後可使用 `pnpm run commit` 執行互動式 commit。

### commitlint + config-conventional + husky

**安裝**

```bash
pnpm add -D @commitlint/config-conventional @commitlint/cli
```

**建立 `commitlint.config.js`：**

```javascript
export default {
  extends: ['@commitlint/config-conventional'],
}
```

### 整合 husky

**安裝與初始化**

```bash
pnpm dlx husky install
```

在 `package.json` 中加入 script，確保 prepare 時安裝 husky：

```json
{
  "scripts": {
    "prepare": "husky install"
  }
}
```

**新增 `commit-msg` Hook**：

```bash
pnpm dlx husky add .husky/commit-msg 'pnpm exec commitlint --edit $1'
```

此設定在 `git commit` 時自動使用 commitlint 檢查訊息格式。

### standard-version

**安裝**

```bash
pnpm add -D standard-version
```

**於 `package.json` 增加 script**：

```json
{
  "scripts": {
    "release": "standard-version"
  }
}
```

**執行版本更新與發佈**：

```bash
pnpm run release
```

`standard-version` 會根據 commit 內容更新版本、建立 Tag、產生 Changelog。

---

## MonoRepo 整合重點

1. **統一配置於根目錄**：

   - 在 MonoRepo 根目錄放置 `commitlint.config.js`、`.husky` 資料夾與設定、`package.json` 中的 scripts，以及 `standard-version` 配置。
   - 所有子專案共用同一套 Commit 規範與版本策略。

2. **範圍明確化**：

   - 在 MonoRepo 中，範圍可明確對應到子專案，如 `frontend`、`backend` 或特定 package 名稱。

3. **指令全以 pnpm 為主**：
   - 將所有安裝與執行指令由 `npm`、`npx` 改為 `pnpm add`, `pnpm dlx`, `pnpm exec`。
   - Commit 時使用 `pnpm cz` 或 `pnpm run commit`。

---

## 版本號規則補充

- **版本號格式**：`主版本號.次版本號.修訂版本號`
- **規則**：
  - **主版本號 (Major)**：有不相容的 API 變動
  - **次版本號 (Minor)**：新增向下相容的功能
  - **修訂版本號 (Patch)**：修正向下相容的問題

`standard-version` 將依據 commit 記錄，自動判斷版本遞增方式。

---
