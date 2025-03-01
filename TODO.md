# TODO List

## 緊急の修正項目

- [x] Tauri の設定修正
  - [x] Tauri 2.x 対応の完了
  - [x] 依存関係の問題解決
  - [ ] バックエンドの起動問題の解決
- [ ] フロントエンド・バックエンド連携の改善
  - [ ] ローディング状態からの遷移問題の解決
  - [ ] エラーハンドリングの強化
  - [x] デバッグモードの実装

## 完了した項目

- [x] リバーシゲームの Rust バックエンド実装
  - [x] ゲームボードの基本実装
  - [x] 駒の配置ロジック
  - [x] 有効手の判定
  - [x] ターン管理
  - [x] ゲーム終了判定
  - [x] スコア計算
  - [x] テストケースの作成と実装
- [x] フロントエンド実装
  - [x] GameBoard コンポーネントの実装
  - [x] GameStatus コンポーネントの実装
  - [x] NewGameButton コンポーネントの実装
- [x] Tauri との連携
  - [x] TauriInterface の実装
  - [x] Rust バックエンドとのバインディング

## 進行中の項目

- [ ] スタイリングと UI 改善
  - [x] GameBoard.module.css の完成
  - [x] GameStatus.module.css の完成
  - [x] NewGameButton.module.css の完成
- [ ] テストの整備
  - [ ] ドメインロジックのスモールテスト改善
  - [ ] Tauri インテグレーションテストの追加

## 今後の課題

- [ ] パフォーマンスの最適化
  - [ ] Rust コードのベンチマーク
  - [ ] メモリ使用量の最適化
  - [ ] Tauri 通信の最適化
- [ ] エラーハンドリングの改善
  - [x] フロントエンドでのエラー表示
  - [ ] バックエンドのエラー処理
  - [x] デバッグモードとプロダクションモードの分離
- [ ] UI の改善
  - [ ] アニメーション効果の追加
  - [x] レスポンシブデザインの対応
  - [ ] アクセシビリティ対応
  - [x] ダークモード対応の完成
- [ ] 機能追加
  - [ ] 履歴機能
  - [ ] アンドゥ/リドゥ
  - [ ] AI プレイヤー
  - [x] オフラインモードのサポート

## 開発手順

1. features/ディレクトリにある Gherkin シナリオを理解する
2. シナリオに対応するテストを実装する
3. テストが通るように機能を実装する
4. リファクタリングする
5. 一連の作業に区切りがついたら gitmoji を使用してコミットする:
   - ✅ テスト追加時
   - ✨ 新機能追加時
   - 🐛 バグ修正時
   - ♻️ リファクタリング時
   - 📝 ドキュメント更新時
   - 🚀 デプロイ/リリース時
   - 🎨 UI/スタイル改善時

## How to Start Development

1. Launch the Devcontainer using VS Code:
   ```
   code --remote containers /path/to/reverai
   ```
   Or open VS Code, use the Remote-Containers extension, and "Reopen in Container"
2. Within the container, initialize the Next.js and Tauri project:
   ```bash
   # Initialize Next.js app
   npx create-next-app@latest src --typescript --eslint --tailwind --src-dir --app
   # Initialize Tauri
   cd src
   npm install -D @tauri-apps/cli
   npx @tauri-apps/cli init
   ```
3. Start development by implementing features according to the Gherkin specifications

## デバッグとトラブルシューティング

1. Tauri デバッグログの確認:
   ```bash
   RUST_LOG=debug npm run tauri dev
   ```
2. フロントエンドデバッグモードの使用:
   - 開発時はモックモードを利用可能
   - Chrome デベロッパーツールでネットワークとコンソールを確認

## 既知の問題

1. Tauri 2.x 移行に関する問題
   - shell-open 機能の非互換性
   - 依存関係の更新が必要
2. フロントエンド・バックエンド連携の問題
   - ローディング状態からの遷移
   - エラーハンドリングの改善が必要
