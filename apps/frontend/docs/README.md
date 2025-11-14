# 文檔說明

## 📚 設計規範文件

### ✅ 已包含在版本控制中
- **AI_CODE_REVIEW.md** - 完整的代碼審查規範
- **design-index.md** - UI 設計規範索引（包含 Practical UI 主要章節摘要）

---

## 📖 必要文件（需額外取得）

### Practical-UI.pdf

#### 📋 基本資訊
- **用途**：詳細的 UI 設計參考書籍
- **檔案大小**：約 146MB
- **放置位置**：`apps/frontend/docs/Practical-UI.pdf`

#### ⚠️ 為何未包含在版本控制中
1. **檔案過大**：146MB 會讓 git 倉庫變得肥大
2. **版權限制**：此為商業書籍，需向版權人取得授權
3. **替代方案**：`design-index.md` 已包含主要章節摘要

---

## 🔐 如何取得 Practical-UI.pdf

### 方式一：向版權人索取（團隊成員）

1. **聯繫方式**：
   - 請私下向專案負責人或版權持有人索取
   - 確認已取得合法使用授權

2. **放置步驟**：
   ```bash
   # 將取得的 PDF 放置到 docs 目錄
   cp ~/Downloads/Practical-UI.pdf apps/frontend/docs/

   # 驗證檔案存在
   ls -lh apps/frontend/docs/Practical-UI.pdf
   ```

3. **驗證結果**：
   - 檔案大小約 146MB
   - 確認 Claude 可以讀取：在 CLAUDE.md 中使用 `@docs/Practical-UI.pdf`

### 方式二：購買正版（推薦）

如果需要個人使用：
- **官方網站**：[Practical UI](https://www.practical-ui.com/)
- 購買後下載並放置於上述位置

---

## 💡 沒有 PDF 也可以開發嗎？

**✅ 可以！** `design-index.md` 已經包含了：
- 所有章節的頁碼參考
- 主要設計原則摘要
- 關鍵規範的文字說明

**PDF 的用途**：
- 📖 深入了解設計細節和範例
- 🎨 查看設計的視覺呈現
- 📐 參考完整的設計系統建立流程

**日常開發**：
- 大部分情況下參考 `design-index.md` 即可
- 遇到不確定的設計問題時再查閱 PDF

---

## 🔒 注意事項

> ⚠️ **版權聲明**
> Practical-UI.pdf 受版權保護，僅供團隊內部學習使用。
> 請勿：
> - ❌ 分享給團隊外部人員
> - ❌ 上傳到公開網路空間
> - ❌ 提交到 git 版本控制（已在 .gitignore 中排除）

---

## 🧪 驗證設置

```bash
# 檢查 PDF 是否正確放置
test -f apps/frontend/docs/Practical-UI.pdf && echo "✅ PDF 已就位" || echo "❌ PDF 不存在"

# 檢查檔案大小（應該約 146MB）
du -h apps/frontend/docs/Practical-UI.pdf

# 確認不會被 git 追蹤
git status apps/frontend/docs/Practical-UI.pdf
# 應該顯示：沒有要提交的文件
```

---

## 📞 需要協助？

如果在取得或設置 PDF 時遇到問題，請聯繫：
- 專案負責人
- 技術團隊 Lead
