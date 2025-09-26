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
   - Metro/Expoの接続が切れたり、マージ後に変更が反映されない場合はキャッシュをクリアした上で起動してください。
   ```bash
   npm run start:fresh
   ```
4. 表示されるQRコードをExpo Goアプリ（iOS/Android）で読み取るか、シミュレータを起動して動作を確認してください。

### Expoの警告について

`npx expo start --clear --localhost` 実行時に以下のようなExpo SDKとのバージョン不一致に関する警告が表示された場合は、次の手順で解消できます。

```bash
# Expo SDKに合わせて“期待値”を自動で入れてくれる
npx expo install react-native react-native-safe-area-context react-native-screens

# 仕上げ
npx expo doctor
npx expo start --clear --localhost
```

Expo SDKに合わせた依存関係へ更新した上でキャッシュをクリアし再起動することで、警告が解消され、最新の依存関係を用いた開発を継続できます。

## Pythonファイルの実行について
- 本プロジェクトはExpoとTypeScript（React Native）で構成されており、動作確認にPythonスクリプトは使用していません。
- そのため、Pythonで実行すべきファイルは存在しません。開発・検証は上記セットアップ手順に従い、`npx expo start` を利用してください。

## iOSアプリの登録・ビルド・検証
1. Expoアカウントを作成し、[EAS CLI](https://docs.expo.dev/eas/) をインストールします。
   ```bash
   npm install -g eas-cli
   ```
2. プロジェクトルートで `eas login` を実行し、Expoアカウントにログインします。
3. iOS用のビルドプロファイル（例：`eas.json`）を追加し、`eas build:configure` で自動生成される設定をコミットします。
4. 下記コマンドでiOSビルドを作成します。
   ```bash
   eas build --platform ios
   ```
   - 初回ビルド時はApple Developer Programのアカウント情報や証明書を登録する必要があります。
5. ビルド完了後、`eas submit --platform ios` を実行し、App Store Connectへアーカイブをアップロードします。
   - App Store Connect上でアプリのメタデータ（アプリアイコン、スクリーンショット、説明文など）を登録し、審査リクエストを送信します。
6. 開発中はXcodeシミュレータ、または `expo start --ios` で起動できるExpo Go経由で動作確認が可能です。

## Androidアプリの登録・ビルド・検証
1. `eas login` 済みであることを確認し、必要に応じてGoogle Play Consoleのデベロッパーアカウントを準備します。
2. 下記コマンドでAndroidビルドを作成します。
   ```bash
   eas build --platform android
   ```
   - 初回ビルドではキーストアをEAS側で自動生成するか、既存のキーストアをアップロードします。
3. ビルド完了後、`eas submit --platform android` を実行し、Google Play Consoleへアップロードします。
   - コンソール上でアプリ情報、コンテンツレーティング、リリースノートなどを登録し、審査を申請します。
4. 開発中の動作確認はAndroidエミュレータ、実機、または `expo start --android` で起動するExpo Goアプリを利用してください。

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
