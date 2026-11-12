# Lake Float Cafe in Kanzanji

HTML・CSS・JavaScriptのみで動く、湖上カフェイベントのサイトです。淡いレイクブルーに更新し、イメージ画像と提供素材を掲載しています。ライブラリのインストールやビルドは不要です。

## ファイル

- `index.html`：サイト本文
- `styles.css`：指定色を基調としたデザイン、スマートフォン対応
- `script.js`：予約URL・問い合わせ先の設定、シェア、画像差し替え
- `構成案.md`：目的、対象、構成、心理・使いやすさの設計意図、未確定情報
- `画像生成プロンプト.md`：画像枠4点の生成プロンプト
- `assets/cafe-logo.png`、`assets/favicon.png`：ロゴ・favicon
- `assets/lake-ripples.svg`：波の装飾
- `assets/six-float.jpg`：Sixフロートの写真
- `assets/main.jpg`：メインのイメージ画像
- `assets/coffee-provider.png`、`assets/yuagari-pudding.jpg`、`assets/waguri-pie-product.jpg`、`assets/norimono-sable.jpg`、`assets/chilled-sweet-potato.jpg`：確定メニューの提供素材（HTMLから直接読込）

## 表示

`index.html` をブラウザで開いて表示できます。ローカルサーバーを利用する場合は、このフォルダで以下を実行して `http://localhost:8000` を開きます。

```sh
python3 -m http.server 8000
```

## 予約・問い合わせ・画像の設定

`script.js` 冒頭の `SITE_CONFIG` を変更します。

```js
const SITE_CONFIG = {
  reservationUrl: 'https://実際の予約ページのURL',
  instagramUrl: 'https://www.instagram.com/実際のアカウント/',
  xUrl: 'https://x.com/実際のアカウント',
  email: '実際のメールアドレス',
  publicUrl: 'https://公開後のサイトURL',
  images: { hero: 'assets/main.jpg' }
};
```

上記URLは記入例です。実際の公開URLに置き換えてください。予約先URLは `reservationUrl` に設定します。日付・時間・人数は予約先で選択します。

予約URL未設定の場合は予約ボタンを準備中にします。未設定の問い合わせ先もリンクになりません。ローカル表示中のシェアではローカルURLを送らず、紹介文だけをコピーします。画像未設定時は写真用の空き枠を表示します。

このサイト自体では空き枠取得、決済、個人情報の収集、予約受付を行いません。実際の予約は設定した外部ページで行います。

公開前の確認事項は `構成案.md` の「公開前に確認・追記する情報」を参照してください。

## 開催判断後の公開用ZIP

共通ソースを編集後、次のコマンドで再生成できます。外部ライブラリは不要です。

```sh
python3 scripts/build_release.py
```

- `releases/lake-float-cafe-normal.zip`：11月14日（土）・15日（日）の通常開催を告知する版。
- `releases/lake-float-cafe-sunday-postponed.zip`：14日（土）は通常開催、15日（日）を22日（日）の同じ時間帯へ延期する版。
- 各ZIPと同名の展開済みディレクトリで、公開前にプレビューできます。

現在の共通ソースのトップは11月13日（金）正午の開催判断待ちです。ZIP内の2版は判断後に使う告知のため、決定前に公開しないでください。ZIPの作成やローカルプレビューだけでは公開されません。展開した `index.html`・`styles.css`・`script.js`・`assets/` を公開元へ上書きし、GitHub Pagesのデプロイ成功を確認します。詳しくはZIP内の `公開手順.txt` を参照してください。

日時はトップのお知らせ・メイン日程・開催情報・予約欄・モバイル下部・メタ情報・シェア文に反映済みです。CSS/JSには版ごとの更新識別子を付け、アーカイブ内ファイルのSHA-256を `release-manifest.json` に記録します。

TicketDiveの情報やチケットの振替・購入者への連絡は別途更新が必要です。生成スクリプトはZIP内のHTML構造・必要素材・ファイル整合性を検証します。
