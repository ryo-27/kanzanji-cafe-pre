# Lake Float Cafe in Kanzanji

HTML・CSS・JavaScriptのみで動く、湖上カフェイベントのサイトです。淡いレイクブルーに更新し、AI生成画像4点を挿入しています。ライブラリのインストールやビルドは不要です。

## ファイル

- `index.html`：サイト本文
- `styles.css`：指定色を基調としたデザイン、スマートフォン対応
- `script.js`：日付選択、予約URL・問い合わせ先の設定、シェア、画像差し替え
- `構成案.md`：目的、対象、構成、心理・使いやすさの設計意図、未確定情報
- `画像生成プロンプト.md`：画像枠4点の生成プロンプト
- `assets/favicon.svg`：波をモチーフにしたアイコン
- `assets/hero.jpg`、`assets/coffee.jpg`、`assets/potato.jpg`、`assets/pudding.jpg`：AI生成のイメージ画像

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
  reservationUrlsByDate: { '14': '', '15': '' },
  instagramUrl: 'https://www.instagram.com/実際のアカウント/',
  xUrl: 'https://x.com/実際のアカウント',
  email: '実際のメールアドレス',
  publicUrl: 'https://公開後のサイトURL',
  images: {
    hero: 'assets/hero.jpg',
    coffee: 'assets/coffee.jpg',
    potato: 'assets/potato.jpg',
    pudding: 'assets/pudding.jpg'
  }
};
```

上記URLは記入例です。実際の公開URLに置き換えてください。日付別予約URLがある場合は `reservationUrlsByDate` を設定。空欄なら共通の `reservationUrl` が使われます。共通URLでは日付の自動入力は行わず、予約先で希望日を確認してもらいます。

予約URL未設定の場合は予約ボタンを準備中にします。未設定の問い合わせ先もリンクになりません。ローカル表示中のシェアではローカルURLを送らず、紹介文だけをコピーします。画像未設定時は写真用の空き枠を表示します。

日付選択は参加希望日の確認用です。このサイト自体では空き枠取得、決済、個人情報の収集、予約受付を行いません。実際の予約は設定した外部ページで行います。

公開前の確認事項は `構成案.md` の「公開前に確認・追記する情報」を参照してください。
