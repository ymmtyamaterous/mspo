# API 設計書

## 概要

バックエンドは **Hono + oRPC** を使用し、型安全な RPC スタイルの API を提供する。  
認証は **better-auth** で管理し、`publicProcedure` と `protectedProcedure` でアクセス制御を行う。

---

## 基本方針

| 項目 | 内容 |
|------|------|
| プロトコル | HTTP（oRPC over Hono） |
| 型安全性 | oRPC による TypeScript 端対端の型推論 |
| 認証方式 | better-auth セッション（Cookie ベース） |
| エラーレスポンス | oRPC 標準エラー形式 |
| ベース URL | `/api/` |

---

## ルーター一覧

### 1. `sports` ルーター

スポーツ情報のCRUDおよび検索機能。

#### `sports.list`

| 項目 | 内容 |
|------|------|
| 種別 | `publicProcedure` |
| 説明 | スポーツ一覧を取得する |

**入力 (Input)**

```typescript
{
  page?: number;         // デフォルト: 1
  limit?: number;        // デフォルト: 20, 最大: 100
  categoryId?: string;   // カテゴリ絞り込み
  search?: string;       // キーワード検索（名前・説明・国名）
  sortBy?: "createdAt" | "viewCount" | "popularity"; // デフォルト: "createdAt"
  sortOrder?: "asc" | "desc"; // デフォルト: "desc"
}
```

**出力 (Output)**

```typescript
{
  items: Sport[];
  total: number;
  page: number;
  limit: number;
}
```

---

#### `sports.getById`

| 項目 | 内容 |
|------|------|
| 種別 | `publicProcedure` |
| 説明 | スポーツ詳細を取得し、閲覧数をインクリメントする |

**入力**

```typescript
{ id: string }
```

**出力**

```typescript
Sport & {
  category: Category;
  submittedBy?: { id: string; name: string };
}
```

---

#### `sports.getRandom`

| 項目 | 内容 |
|------|------|
| 種別 | `publicProcedure` |
| 説明 | ランダムに1件のスポーツを返す |

**入力**: なし  
**出力**: `Sport`

---

#### `sports.create`

| 項目 | 内容 |
|------|------|
| 種別 | `protectedProcedure` |
| 説明 | 新しいスポーツを投稿する（初期状態は `pending`） |

**入力**

```typescript
{
  name: string;             // 必須: スポーツ名（最大100文字）
  nameEn?: string;          // 英語名
  description: string;      // 必須: 説明（最大2000文字）
  rules?: string;           // ルール説明
  history?: string;         // 歴史・背景
  originCountry?: string;   // 発祥国
  foundedYear?: number;     // 発祥年
  playerCount?: string;     // 競技人口の目安
  difficulty?: 1 | 2 | 3 | 4 | 5; // 難易度
  categoryId: string;       // 必須: カテゴリID
  imageUrl?: string;        // アイキャッチ画像URL
  videoUrl?: string;        // 紹介動画URL
  tags?: string[];          // タグ一覧
}
```

**出力**: `Sport`

---

#### `sports.update`

| 項目 | 内容 |
|------|------|
| 種別 | `protectedProcedure` |
| 説明 | 自分が投稿したスポーツ情報を更新する |

**入力**: `{ id: string } & Partial<sports.create 入力>` 

**出力**: `Sport`

---

#### `sports.delete`

| 項目 | 内容 |
|------|------|
| 種別 | `protectedProcedure` |
| 説明 | 自分が投稿したスポーツを削除する |

**入力**: `{ id: string }`  
**出力**: `{ success: boolean }`

---

### 2. `categories` ルーター

カテゴリの一覧・管理機能。

#### `categories.list`

| 項目 | 内容 |
|------|------|
| 種別 | `publicProcedure` |
| 説明 | カテゴリ一覧をスポーツ件数とともに返す |

**入力**: なし  
**出力**

```typescript
{
  id: string;
  name: string;
  emoji: string;
  description: string;
  sportCount: number;
}[]
```

---

#### `categories.create` / `update` / `delete`

| 項目 | 内容 |
|------|------|
| 種別 | `protectedProcedure`（管理者ロールチェック） |
| 説明 | カテゴリの作成・更新・削除（管理者のみ） |

---

### 3. `favorites` ルーター

お気に入り管理。

#### `favorites.list`

| 項目 | 内容 |
|------|------|
| 種別 | `protectedProcedure` |
| 説明 | ログインユーザーのお気に入りスポーツ一覧を返す |

**出力**: `Sport[]`

---

#### `favorites.add`

| 項目 | 内容 |
|------|------|
| 種別 | `protectedProcedure` |
| 説明 | スポーツをお気に入りに追加する |

**入力**: `{ sportId: string }`  
**出力**: `{ success: boolean }`

---

#### `favorites.remove`

| 項目 | 内容 |
|------|------|
| 種別 | `protectedProcedure` |
| 説明 | お気に入りからスポーツを削除する |

**入力**: `{ sportId: string }`  
**出力**: `{ success: boolean }`

---

### 4. `rankings` ルーター

ランキング情報の取得。

#### `rankings.get`

| 項目 | 内容 |
|------|------|
| 種別 | `publicProcedure` |
| 説明 | 人気度・閲覧数でランキングを取得する |

**入力**

```typescript
{
  type: "viewCount" | "favorites";
  limit?: number; // デフォルト: 20
  categoryId?: string;
}
```

**出力**: `(Sport & { rank: number })[]`

---

### 5. `pickup` ルーター

今週のピックアップ特集。

#### `pickup.getCurrent`

| 項目 | 内容 |
|------|------|
| 種別 | `publicProcedure` |
| 説明 | 現在設定されているピックアップスポーツを返す |

**出力**

```typescript
{
  main: Sport;
  sideCards: (Sport & { label: "注目" | "急上昇" | "新着" })[];
}
```

---

#### `pickup.set`

| 項目 | 内容 |
|------|------|
| 種別 | `protectedProcedure`（管理者のみ） |
| 説明 | 今週のピックアップを設定する |

**入力**

```typescript
{
  mainSportId: string;
  sideCards: { sportId: string; label: "注目" | "急上昇" | "新着" }[];
}
```

---

### 6. `admin` ルーター

管理者専用の承認フロー。

#### `admin.submissions.list`

| 項目 | 内容 |
|------|------|
| 種別 | `protectedProcedure`（管理者のみ） |
| 説明 | 承認待ち（`pending`）のスポーツ一覧を返す |

---

#### `admin.submissions.approve`

| 項目 | 内容 |
|------|------|
| 種別 | `protectedProcedure`（管理者のみ） |
| 説明 | スポーツ投稿を承認し、ステータスを `published` に変更する |

**入力**: `{ sportId: string }`

---

#### `admin.submissions.reject`

| 項目 | 内容 |
|------|------|
| 種別 | `protectedProcedure`（管理者のみ） |
| 説明 | スポーツ投稿を却下し、ステータスを `rejected` に変更する |

**入力**: `{ sportId: string; reason?: string }`

---

### 7. `healthCheck`（既存）

| 項目 | 内容 |
|------|------|
| 種別 | `publicProcedure` |
| 説明 | サーバーの死活確認 |

---

## 型定義（共通）

### `Sport`

```typescript
type Sport = {
  id: string;
  name: string;
  nameEn: string | null;
  description: string;
  rules: string | null;
  history: string | null;
  originCountry: string | null;
  foundedYear: number | null;
  playerCount: string | null;
  difficulty: number | null;           // 1〜5
  categoryId: string;
  imageUrl: string | null;
  videoUrl: string | null;
  tags: string[];
  viewCount: number;
  status: "pending" | "published" | "rejected";
  submittedById: string | null;
  createdAt: Date;
  updatedAt: Date;
};
```

### `Category`

```typescript
type Category = {
  id: string;
  name: string;
  emoji: string;
  description: string | null;
  createdAt: Date;
};
```

---

## エラーコード

| コード | 説明 |
|--------|------|
| `UNAUTHORIZED` | 認証が必要な操作でセッションがない |
| `FORBIDDEN` | 権限が不足している（管理者専用操作等） |
| `NOT_FOUND` | 対象リソースが存在しない |
| `BAD_REQUEST` | 入力バリデーションエラー |
| `INTERNAL_SERVER_ERROR` | サーバー内部エラー |
