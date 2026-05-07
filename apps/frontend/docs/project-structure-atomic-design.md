# Frontend 專案結構與 Atomic Design 規範

> Atomic Design 分層、檔名、Import 路徑、組合樣式、組件選擇與響應式基線：見 `atomic-design-convention` Skill。

## 技術棧

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Radix UI + shadcn/ui

## 專案結構

```text
apps/frontend/
├── src/
│   └── app/
│       ├── components/                # Atomic Design 組件
│       │   ├── atoms/                 # 原子組件
│       │   │   └── index.tsx          # 統一導出
│       │   ├── molecules/             # 分子組件
│       │   │   └── index.tsx          # 統一導出
│       │   ├── organisms/             # 有機體組件
│       │   │   └── index.tsx          # 統一導出
│       │   ├── templates/             # 模板組件（按需）
│       │   └── pages/                 # 頁面級組件（按需）
│       ├── hooks/                     # 可重用 React Hooks
│       ├── lib/                       # 工具函數 / API 客戶端 / 策略實作
│       ├── types/                     # TypeScript 類型定義
│       ├── fonts/                     # 字體資源
│       ├── product/                   # 功能路由模組
│       ├── order/                     # 功能路由模組
│       ├── customer/                  # 功能路由模組
│       ├── report/                    # 功能路由模組
│       ├── layout.tsx                 # 根佈局
│       ├── page.tsx                   # 首頁
│       └── globals.css                # 全域樣式
├── public/                            # 靜態資源
├── docs/                              # 專案文件
├── .env.local                         # 環境變數（不提交）
└── package.json
```

## 專案特定規則（Skill 未涵蓋）

- 新增組件分層判斷以**可重用性 + 複雜度**為準，不以畫面位置判斷。

## 功能路由目錄補充

- 遵循 App Router，每路由一個 `page.tsx`
- 可在路由下建立專屬 `mock/`、`components/` 子目錄
- 共用邏輯回收至 `components/`、`hooks/`、`lib/`、`types/`
