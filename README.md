# BetterAuth Learning Project

Better Auth ライブラリを使った認証システムの学習・検証プロジェクト。

## 技術スタック

### Backend
- **NestJS** - Node.js フレームワーク
- **Better Auth** - 認証ライブラリ
- **Drizzle ORM** - TypeScript ORM
- **PostgreSQL** - データベース

### Frontend
- **React 19** - UI フレームワーク
- **TypeScript** - 型安全性
- **Zustand** - 状態管理
- **TailwindCSS** - スタイリング
- **Vite** - ビルドツール

## プロジェクト構成

```
BetterAuthLearn/
├── backend/           # NestJS バックエンド
│   ├── src/
│   │   ├── lib/
│   │   │   └── auth.ts      # Better Auth 設定
│   │   ├── db/
│   │   │   ├── index.ts     # Drizzle DB接続
│   │   │   └── schema.ts    # データベーススキーマ
│   │   └── main.ts          # NestJS エントリーポイント
│   └── drizzle.config.ts    # Drizzle設定
├── frontend/          # React フロントエンド
│   ├── src/
│   │   ├── lib/
│   │   │   ├── auth.ts      # Better Auth クライアント
│   │   │   └── store.ts     # Zustand 状態管理
│   │   ├── components/
│   │   │   └── Snackbar.tsx # 通知コンポーネント
│   │   └── App.tsx          # メインコンポーネント
│   └── vite.config.ts       # Vite設定
└── README.md
```

## セットアップ

### 1. 依存関係のインストール

```bash
# Backend
cd backend
npm install

# Frontend  
cd ../frontend
npm install
```

### 2. 環境変数の設定

backend/.env.example, frontend/.env.example を参照

### 3. データベースのセットアップ

```bash
cd backend
npx @better-auth/cli@latest generate
npx drizzle-kit generate
npx drizzle-kit migrate
```

### 4. 開発サーバーの起動

```bash
# Backend (ターミナル1)
cd backend
npm run start:dev

# Frontend (ターミナル2)
cd frontend  
npm run dev
```

## 使用方法

1. ブラウザでフロントエンドにアクセス
2. トグルスイッチで「サインアップ」に切り替え
3. 名前・メール・パスワードを入力してアカウント作成
4. 「サインイン」に切り替えてログイン
5. 認証成功後、ユーザー情報とサインアウトボタンが表示

## 参考資料

- [Better Auth 公式ドキュメント](https://www.better-auth.com/)
- [NestJS 公式ドキュメント](https://nestjs.com/)
- [Drizzle ORM ドキュメント](https://orm.drizzle.team/)

---

**Note**: これは学習・検証用です。本番環境では追加のセキュリティ対策が必要です。