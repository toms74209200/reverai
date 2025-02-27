# TODO List

## 完了した項目
- [x] リバーシゲームのRustバックエンド実装
  - [x] ゲームボードの基本実装
  - [x] 駒の配置ロジック
  - [x] 有効手の判定
  - [x] ターン管理
  - [x] ゲーム終了判定
  - [x] スコア計算
  - [x] テストケースの作成と実装

## 進行中の項目
- [ ] フロントエンド実装
  - [ ] GameBoardコンポーネントの実装
  - [ ] GameStatusコンポーネントの実装
  - [ ] NewGameButtonコンポーネントの実装
- [ ] Tauriとの連携
  - [ ] TauriInterfaceの実装
  - [ ] Rustバックエンドとのバインディング
- [ ] テストの整備
  - [ ] Cypressテストの実装
  - [ ] ユニットテストの追加

## 今後の課題
- [ ] パフォーマンスの最適化
  - [ ] Rustコードのベンチマーク
  - [ ] メモリ使用量の最適化
- [ ] エラーハンドリングの改善
  - [ ] フロントエンドでのエラー表示
  - [ ] バックエンドのエラー処理
- [ ] UIの改善
  - [ ] アニメーション効果の追加
  - [ ] レスポンシブデザインの対応
  - [ ] アクセシビリティ対応
- [ ] 機能追加
  - [ ] 履歴機能
  - [ ] アンドゥ/リドゥ
  - [ ] AIプレイヤー

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