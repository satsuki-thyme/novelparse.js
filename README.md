# novelparse.js
ウェブ小説の文書を HTML に変換する JavaScript のライブラリです。

## 目次
- novelparse.js  
  ライブラリ本体。
- novelparse.min.js  
  ライブラリ本体。圧縮版。
- sample.html  
  使い方のサンプル。
- novelparse.html  
  使い方のサンプル。応用編。

## 説明
- ウェブ小説の書き方、ウェブ小説の HTML 化を再現します
- ルビ記法は各ウェブ小説サイトの記法を解釈します

## 動作
- ファイル内の各行を p タグでくくります
- 第 2 引数に "few" を与えると改行を 1 個減らします。つまり隣り合う文は連結されて 1 行になります。 1 行間隔を空けた文は間隔がなくなって隣り合います。 2 行間隔を空けたものは 1 行の間隔になります

## CDN
https://cdn.jsdelivr.net/gh/satsuki-thyme/novelparse.js@main/novelparse.min.js
