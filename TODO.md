# TODO List

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
  - [ ] GameBoard.module.css の完成
  - [ ] GameStatus.module.css の完成
  - [ ] NewGameButton.module.css の完成
- [ ] テストの整備
  - [ ] ドメインロジックのスモールテスト改善

## 今後の課題

- [ ] パフォーマンスの最適化
  - [ ] Rust コードのベンチマーク
  - [ ] メモリ使用量の最適化
- [ ] エラーハンドリングの改善
  - [ ] フロントエンドでのエラー表示
  - [ ] バックエンドのエラー処理
- [ ] UI の改善
  - [ ] アニメーション効果の追加
  - [ ] レスポンシブデザインの対応
  - [ ] アクセシビリティ対応
- [ ] 機能追加
  - [ ] 履歴機能
  - [ ] アンドゥ/リドゥ
  - [ ] AI プレイヤー

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
