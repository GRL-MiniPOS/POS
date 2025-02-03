# POS System

一個使用 Go 開發的銷售點管理系統，支持 PostgreSQL（開發環境）和 SQLite（生產環境）。

## 系統架構

- Backend: Go 1.22
- 開發環境數據庫: PostgreSQL 14
- 生產環境數據庫: SQLite
- 容器化: Docker & Docker Compose

## 開發環境設置

### 前置需求

- Docker & Docker Compose
- Go 1.22+
- PostgreSQL 客戶端（可選，用於直接操作數據庫）

### 快速開始

1. Clone：

```bash
git clone https://github.com/GRL-MiniPOS/POS.git
cd pos/apps/backend
```

2. 啟動開發環境：
```bash
docker-compose up -d
```

服務將在以下地址啟動：
- API 服務器: http://localhost:8002
- PostgreSQL: localhost:5432

## 數據庫操作

### 測試數據同步

1. 導出數據：
```bash
# 導出完整數據庫（結構+數據）
docker exec postgres pg_dump -U postgres pos_dev > internal/storage/sql/testdata/seed.sql

# 只導出數據
docker exec postgres pg_dump -U postgres --data-only pos_dev > internal/storage/sql/testdata/data.sql
```

2. 導入數據：
```bash
# 導入完整數據庫
docker exec -i postgres psql -U postgres pos_dev < internal/storage/sql/testdata/seed.sql

# 重置數據庫
docker-compose down -v
docker-compose up -d
```

## 生產環境部署

生產環境使用 SQLite 作為數據庫：

1. 構建 Docker 鏡像：
```bash
docker build -t pos-app .
```

2. 運行容器：
```bash
docker run -p 8002:8002 -v pos_data:/app/data pos-app
```

## 開發指南

### 項目結構
```
apps/backend/
├── internal/
│   ├── config/          # 配置管理
│   ├── storage/         # 數據存儲層
│   │   └── sql/        # SQL 相關
│   │       ├── driver/ # 數據庫驅動
│   │       └── migration/ # 遷移文件
│   └── api/            # API 處理
├── docker-compose.yml   # 開發環境配置
├── Dockerfile          # 生產環境 Docker 配置
└── Dockerfile.dev      # 開發環境 Docker 配置
```
