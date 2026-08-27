# client-designs 運用ルール

このリポジトリはClaude Designで作成したワイヤーフレームを
GitHub Pagesで公開するための専用リポジトリです。

## 新しいクライアント案件を追加する時の手順

1. ユーザーからZIPファイルのパスとクライアント名（英語表記）を受け取る
2. リポジトリ直下に /クライアント名/ フォルダを作成
3. ZIPを解凍し、中身をそのフォルダ直下に配置する
   - dist/ のような余計な階層がある場合は、中身だけを
     /クライアント名/ 直下に展開し、空フォルダは削除する
4. git add → commit（コミットメッセージ: "Add [クライアント名] design wireframe"）
5. mainブランチへpush
6. push完了後、公開URLを教える
   （形式: https://yumaootaki.github.io/client-designs/クライアント名/）

## 注意点

- git commitのuser.name/emailは初回のみ確認、以降は同じ設定を使う
- pushは必ず実行前に一度確認を取る
- フォルダ名はクライアント名をローマ字・英語表記にする（例: ist, zenko）
