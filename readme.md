# AIロールプロンプト作成アプリ

このリポジトリは、質問内容に合わせてAIロールプロンプトを作成し、ChatGPTへスムーズに質問できるモバイルアプリ（iOS/Android）です。Expo + React Native（TypeScript）で実装しており、単一のコードベースでマルチプラットフォーム展開が可能です。

## 採用技術と言語
- **TypeScript** / **React Native (Expo)**
  - TypeScriptは型安全性が高く、React Nativeと組み合わせることでiOSとAndroidの両OSに対応したアプリを効率的に開発できます。
  - Expoを利用することで、ネイティブ設定を最小限に保ちつつ、プレビューやビルドを容易に行えます。

## 機能概要
- **メインページ**：最新のロールプロンプト、ChatGPTに送信する質問文の整理、各ページへの導線を表示。
- **ヒアリングページ**：質問の背景、ゴール、制約などを入力し、AIロールプロンプトを生成。
- **ChatGPTアカウントページ**：アカウントに関するメモやAPIキーを記録。
- **ヘルプページ**：アプリの使い方や良い質問を作るコツを解説。

## セットアップ
1. Node.jsとnpm、またはyarnをインストールしてください。
2. 依存関係をインストールします（同時にプレースホルダーアセットが自動生成されます）。
   ```bash
   npm install
   # or
   yarn install
   ```
   - もし生成スクリプトを手動で実行したい場合は `npm run prepare-assets` を利用してください。
3. 開発サーバーを起動します。
   ```bash
   npx expo start
   ```
4. 表示されるQRコードをExpo Goアプリ（iOS/Android）で読み取るか、シミュレータを起動して動作を確認してください。

## ディレクトリ構成
```
.
├── App.tsx                 # ルートコンポーネント（画面遷移の設定）
├── app.json                # Expo設定
├── assets/                 # 自動生成されるアイコン・スプラッシュ画像
├── babel.config.js         # Babel設定
├── package.json            # 依存関係とスクリプト
├── src/
│   ├── context/
│   │   └── AppStateContext.tsx
│   ├── navigation/
│   │   └── types.ts
│   ├── screens/
│   │   ├── AccountScreen.tsx
│   │   ├── HelpScreen.tsx
│   │   ├── MainScreen.tsx
│   │   └── PromptBuilderScreen.tsx
│   └── utils/
│       └── prompt.ts
└── tsconfig.json           # TypeScript設定
```

## ライセンス
プロジェクト内のコードやアセットは必要に応じて自由にカスタマイズしてください。
