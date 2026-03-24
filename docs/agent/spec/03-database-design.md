# データベース設計書

## 概要

データベースは **SQLite** を使用し、**Drizzle ORM** でスキーマ管理・マイグレーションを行う。  
認証関連テーブル（`user`, `session`, `account`, `verification`）は **better-auth** が管理する既存スキーマを使用する。

---

## テーブル一覧

| テーブル名 | 説明 | 管理 |
|-----------|------|------|
| `user` | ユーザー情報 | better-auth |
| `session` | セッション管理 | better-auth |
| `account` | OAuth アカウント連携 | better-auth |
| `verification` | メール認証トークン | better-auth |
| `category` | スポーツカテゴリ | アプリ |
| `sport` | スポーツ情報 | アプリ |
| `sport_tag` | スポーツのタグ | アプリ |
| `favorite` | お気に入り | アプリ |
| `pickup` | 今週のピックアップ設定 | アプリ |
| `pickup_side_card` | ピックアップのサイドカード | アプリ |

---

## テーブル定義

### `category`（カテゴリ）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| `id` | TEXT | PRIMARY KEY | CUID / UUID |
| `name` | TEXT | NOT NULL | カテゴリ名（例: 格闘系） |
| `emoji` | TEXT | NOT NULL | 絵文字アイコン（例: ⚔️） |
| `description` | TEXT | | 説明文 |
| `sort_order` | INTEGER | NOT NULL DEFAULT 0 | 表示順 |
| `created_at` | INTEGER | NOT NULL | ミリ秒 UNIX タイムスタンプ |
| `updated_at` | INTEGER | NOT NULL | ミリ秒 UNIX タイムスタンプ |

**初期データ（seed）**

| name | emoji | description |
|------|-------|-------------|
| 格闘系 | ⚔️ | 武道・格闘技 |
| 水上・水中 | 🌊 | 水泳・ボート・潜水 |
| アウトドア | 🏔️ | 山岳・自然・野外 |
| 的当て・投擲 | 🎯 | アーチェリー・ダーツ |
| 動物・乗馬 | 🐎 | 馬術・動物競技 |
| 頭脳×身体 | 🧠 | チェスボクシング等 |
| パラスポーツ | ♿ | 全ての人のために |
| 民族・伝統 | 🌏 | 各地の伝統競技 |

---

### `sport`（スポーツ情報）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| `id` | TEXT | PRIMARY KEY | CUID / UUID |
| `name` | TEXT | NOT NULL | スポーツ名（日本語） |
| `name_en` | TEXT | | スポーツ名（英語） |
| `description` | TEXT | NOT NULL | 概要・説明 |
| `rules` | TEXT | | ルール説明 |
| `history` | TEXT | | 歴史・背景 |
| `origin_country` | TEXT | | 発祥国 |
| `founded_year` | INTEGER | | 発祥年 |
| `player_count` | TEXT | | 競技人口（目安文字列） |
| `difficulty` | INTEGER | | 難易度 1〜5 |
| `category_id` | TEXT | NOT NULL, FK → category.id | カテゴリ |
| `image_url` | TEXT | | アイキャッチ画像 URL |
| `video_url` | TEXT | | 紹介動画 URL |
| `view_count` | INTEGER | NOT NULL DEFAULT 0 | 閲覧数 |
| `status` | TEXT | NOT NULL DEFAULT 'pending' | `pending` / `published` / `rejected` |
| `submitted_by_id` | TEXT | FK → user.id | 投稿ユーザー ID（NULL = 管理者直接登録） |
| `rejection_reason` | TEXT | | 却下理由（管理者記入） |
| `created_at` | INTEGER | NOT NULL | ミリ秒 UNIX タイムスタンプ |
| `updated_at` | INTEGER | NOT NULL | ミリ秒 UNIX タイムスタンプ |

**インデックス**

| インデックス名 | カラム | 目的 |
|--------------|--------|------|
| `sport_category_id_idx` | `category_id` | カテゴリ絞り込み |
| `sport_status_idx` | `status` | ステータス絞り込み |
| `sport_submitted_by_idx` | `submitted_by_id` | ユーザー投稿一覧 |
| `sport_view_count_idx` | `view_count DESC` | ランキング表示 |

**ステータス遷移**

```
投稿 → pending → published（公開）
                → rejected（却下）
```

---

### `sport_tag`（スポーツタグ）

タグは `sport` テーブルには持たず、別テーブルで管理する。

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| `id` | TEXT | PRIMARY KEY | CUID / UUID |
| `sport_id` | TEXT | NOT NULL, FK → sport.id CASCADE | スポーツ ID |
| `tag` | TEXT | NOT NULL | タグ文字列 |

**インデックス**

| インデックス名 | カラム |
|--------------|--------|
| `sport_tag_sport_id_idx` | `sport_id` |
| `sport_tag_tag_idx` | `tag` |

---

### `favorite`（お気に入り）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| `id` | TEXT | PRIMARY KEY | CUID / UUID |
| `user_id` | TEXT | NOT NULL, FK → user.id CASCADE | ユーザー ID |
| `sport_id` | TEXT | NOT NULL, FK → sport.id CASCADE | スポーツ ID |
| `created_at` | INTEGER | NOT NULL | 追加日時 |

**ユニーク制約**: `(user_id, sport_id)` の複合ユニーク

**インデックス**

| インデックス名 | カラム |
|--------------|--------|
| `favorite_user_id_idx` | `user_id` |
| `favorite_sport_id_idx` | `sport_id` |

---

### `pickup`（ピックアップ設定）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| `id` | TEXT | PRIMARY KEY | CUID / UUID |
| `main_sport_id` | TEXT | NOT NULL, FK → sport.id | メイン特集スポーツ |
| `is_active` | INTEGER | NOT NULL DEFAULT 1 | 有効フラグ（1件のみ active） |
| `created_by_id` | TEXT | NOT NULL, FK → user.id | 設定した管理者 ID |
| `created_at` | INTEGER | NOT NULL | 設定日時 |

---

### `pickup_side_card`（ピックアップサイドカード）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| `id` | TEXT | PRIMARY KEY | CUID / UUID |
| `pickup_id` | TEXT | NOT NULL, FK → pickup.id CASCADE | ピックアップ ID |
| `sport_id` | TEXT | NOT NULL, FK → sport.id | スポーツ ID |
| `label` | TEXT | NOT NULL | `注目` / `急上昇` / `新着` |
| `sort_order` | INTEGER | NOT NULL DEFAULT 0 | 表示順 |

---

## ER 図（テキスト表現）

```
user
  ├─< session
  ├─< account
  ├─< sport (submitted_by_id)
  ├─< favorite
  └─< pickup (created_by_id)

category
  └─< sport

sport
  ├─< sport_tag
  ├─< favorite
  ├─< pickup (main_sport_id)
  └─< pickup_side_card

pickup
  └─< pickup_side_card
```

---

## better-auth 管理テーブル（参考）

既存の `packages/db/src/schema/auth.ts` で定義済み。変更不要。

| テーブル | 主な用途 |
|---------|---------|
| `user` | ユーザー基本情報 |
| `session` | セッション管理 |
| `account` | OAuth プロバイダー連携 |
| `verification` | メールアドレス確認トークン |

---

## マイグレーション方針

- `packages/db/` 配下で Drizzle Kit を使用
- コマンド: `bun run db:generate` / `bun run db:migrate`
- マイグレーションファイルは `packages/db/migrations/` に保存
- 本番環境への適用は CI/CD パイプラインで自動実行

---

## 管理者ロールについて

better-auth の `user` テーブルにカスタムフィールド `role` を追加して管理する。

| フィールド名 | 型 | デフォルト | 説明 |
|------------|-----|----------|------|
| `role` | TEXT | `"user"` | `"user"` / `"admin"` |
