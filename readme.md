# AIロールプロンプト作成アプリ

このリポジトリは、質問内容に合わせてAIロールプロンプトを作成し、ChatGPTでの活用を支援するモバイルアプリ（iOS/Android）です。Expo（SDK 51）と React Native（TypeScript）で構築しており、単一のコードベースでマルチプラットフォーム展開が可能です。

## アプリの特長
- **ヒアリングベースのロール生成**：用途・業界・重点トピック・タスクなどを入力すると、ドメインテンプレートに沿ったロール指示、要約、フォローアップ質問を生成します。
- **履歴の自動保存**：最新5件分の生成結果を保持し、同一ロール指示は重複登録されないように整理します。履歴はお気に入り登録に利用できます。
- **お気に入り管理**：履歴から任意のロールを名前付きで保存し、テンプレートの閲覧・編集・削除・ChatGPT起動（コピー付き）が行えます。
- **質問文ドラフト機能**：メイン画面でChatGPTに送信したい質問文を下書きでき、ロールプロンプト内の依頼事項にもリアルタイム反映されます。
- **コピー＆ChatGPT連携**：生成されたロール指示と質問文をクリップボードへコピーした上で、ブラウザのChatGPTを起動します（Expo環境でのブラウザ連携）。
- **ヘルプドキュメント**：アプリ内のヘルプ画面で、使い方の流れや良い質問を作るためのコツを確認できます。

## 主な画面
- **メイン画面**：最新のロールプロンプト概要、ヒアリングシート・ヘルプ・お気に入りへの導線、質問文のドラフト欄を表示。
- **ヒアリングシート**：質問テーマや業界、特に知りたい内容、AIへの追加情報などを入力し、ロールプロンプトを生成。
- **お気に入り**：履歴からロールを選択して保存し、後からコピー・編集・削除できる管理画面。
- **ヘルプ**：基本的な操作方法や質問設計のTipsを掲載したチュートリアル。

## 技術スタック
- **TypeScript** / **React Native** / **Expo SDK 51**
  - 型安全な開発を維持しつつ、Expo Dev Client を利用した iOS / Android 双方への検証が可能です。
- **React Navigation (Native Stack)**
  - 画面遷移やスタック管理を担います。
- **expo-clipboard / expo-linking / expo-web-browser**
  - クリップボード連携やChatGPTサイトの起動に利用しています。

## Expo設定のポイント
- `app.json` で iOS/Android のアプリ識別子をそれぞれ `com.github.ikeidoyuki.airoleprompt` に統一しています。初回ビルドやストア申請時はこの値を変更しないでください。
- iOS の `buildNumber` と Android の `versionCode` は 1 から始まり、バージョンアップ時は後述のスクリプトで管理します。
- 輸出コンプライアンス申請を簡略化するため、`ITSAppUsesNonExemptEncryption` を `false` に設定しています。
- Web ビルドは現状不要なため、Expo Web の設定は最小構成 (`bundler: "metro"`) のままです。

## セットアップ
1. Node.jsとnpm、またはyarnをインストールしてください。
2. 依存関係をインストールします。初回セットアップ時にプレースホルダーアセットが自動生成されます。
   ```bash
   npm install
   # or
   yarn install
   ```
   - アセット生成のみを手動で実行したい場合は `npm run prepare-assets` を利用してください。
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

`npx expo start --clear --localhost` 実行時にExpo SDKとのバージョン不一致に関する警告が表示された場合は、次の手順で解消できます。

```bash
# Expo SDKに合わせて“期待値”を自動で整えてくれます
npx expo install react-native react-native-safe-area-context react-native-screens

# 仕上げ
npx expo doctor
npx expo start --clear --localhost
```

依存関係をExpo SDKに合わせて更新した上でキャッシュをクリアし再起動することで、警告が解消されます。

## ネイティブ依存を追加した際の開発ビルド再作成

Expo や React Native のネイティブモジュール（例：`expo-web-browser`、`expo-linking`、`react-native-screens` など）を新たに追加・更新した場合は、既存の開発ビルドでは反映されません。以下のフローで必ず Dev Client を作り直してください。

1. 依存パッケージを追加する。
   ```bash
   npx expo install <package>
   ```
2. Development ビルドを再作成し、端末に再インストールする。
   ```bash
   eas build --profile development --platform ios --clear-cache
   # Android も同様に --platform android を指定
   ```
   - 端末に古い Dev Client が残っている場合はアンインストールしてから入れ直すと確実です。
3. キャッシュをクリアして開発サーバーを起動する。
   ```bash
   npx expo start -c
   ```

この手順を徹底することで「Cannot find native module 'XXX'」といったクラッシュや古い開発ビルドを誤って利用する事故を防げます。

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

## 開発で利用する主なスクリプト
- `npm start` / `npx expo start`：開発用のMetroバンドラーを起動します。
- `npm run start:fresh`：キャッシュを削除してからExpoを起動します（`.expo`, `metro-cache`, `node_modules/.cache` をクリーンアップ）。
- `npm run start:lan` / `npm run start:tunnel`：LAN経由またはトンネル経由でDev Serverを公開します（いずれもキャッシュクリア付き）。
- `npm run prepare-assets`：Expo設定で参照するPNGアセット（アイコン/スプラッシュ）を生成します。`postinstall`で自動実行されます。
- `npm run bump:ios` / `npm run bump:android` / `npm run bump:both`：`app.json` の iOS `buildNumber` と Android `versionCode` を自動インクリメントします。`-- --to <number>` を付けると任意値に更新できます。
- `npm run bump:version:patch|minor|major`：Expo のマーケティングバージョン（`expo.version`）をセマンティックバージョニングで更新し、iOS の `buildNumber` を `1` にリセットします。

## バージョンとビルド番号の運用手順
1. 機能追加や修正でストアリリースする際は、まずマーケティングバージョンが必要か確認し、必要なら `npm run bump:version:patch`（または `minor` / `major`）を実行します。
2. 追加のビルドを提出する場合は `npm run bump:ios` や `npm run bump:android` で該当するビルド番号のみを更新してください。
3. コマンド実行後は `git diff` で `app.json` の変更を確認し、問題がなければコミットします。
4. Expo / EAS Build 実行時は `app.json` の識別子がストア設定と一致していることを再度確認してください。

## ディレクトリ構成
```
.
├── App.tsx                 # ルートコンポーネント（スタックナビゲーション設定）
├── app.json                # Expo設定
├── assets/                 # プレースホルダーアセット（scripts/prepare-assets.js で生成）
├── babel.config.js         # Babel設定
├── package.json            # 依存関係とスクリプト
├── scripts/
│   ├── prepare-assets.js   # プレースホルダーアセット生成スクリプト
│   ├── bump-build.js       # iOS/Android のビルド番号を更新
│   ├── bump-version.js     # Expoのマーケティングバージョンを更新
│   └── reset-dev-server.js # Metro/Expoキャッシュ削除スクリプト
├── src/
│   ├── context/
│   │   └── AppStateContext.tsx # アプリ状態（履歴・お気に入り等）の管理
│   ├── navigation/
│   │   └── types.ts             # 画面遷移の型定義
│   ├── screens/
│   │   ├── FavoritesScreen.tsx        # お気に入り管理画面
│   │   ├── HelpScreen.tsx             # ヘルプ画面
│   │   ├── MainScreen.tsx             # ダッシュボード画面
│   │   └── PromptBuilderScreen.tsx    # ヒアリングシート
│   ├── types/
│   │   ├── expo-clipboard.d.ts        # Expoモジュールの型補完
│   │   └── react-native-gesture-handler.d.ts
│   └── utils/
│       └── prompt.ts          # ロールプロンプト生成ロジック
└── tsconfig.json           # TypeScript設定
```

## 補足事項
- 履歴やお気に入りはアプリ実行中の状態として保持されます。永続化は行っていないため、アプリ再起動時にはリセットされます。
- Expoの設定で利用するアプリアイコンやスプラッシュ画像はプレースホルダーです。`assets/` ディレクトリに任意のPNGを配置することで差し替えられます。

## ライセンス
プロジェクト内のコードやアセットは必要に応じて自由にカスタマイズしてください。
