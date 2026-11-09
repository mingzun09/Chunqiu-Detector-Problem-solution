# 春秋検出器の課題と解決策 / Chunqiu Detector Problem Solution

[English](README.md) | [中文](README.zh-CN.md) | [Русский](README.ru.md) | [Español](README.es.md) | **日本語**

> 以下から言語を選んでドキュメントを読むか、キーワード検索に対応したオンライン版ドキュメントをご利用ください。

## 🌐 オンラインドキュメント（GitHub Pages）

👉 **[https://mingzun09.github.io/Chunqiu-Detector-Problem-solution/](https://mingzun09.github.io/Chunqiu-Detector-Problem-solution/)**

サイトは **Docsify** で構築しています（フロントエンドのみの単一ページ、ビルド工程なし）。入口はリポジトリ直下の `index.html`、ナビゲーションとサイドバーは `_navbar.md` / `_sidebar.md`、本文は `language/` 配下のファイルを直接読み込みます（**サイト側のファイルを編集する必要はありません**。コミットすれば自動で反映されます）。

- ライト／ダークテーマはブラウザ／OS の設定（`prefers-color-scheme`）に追従し、手動切り替えは不要
- 上部の検索ボックスは**項目タイトルのみ**を索引し、ヒットした項目を展開します
- ドキュメント本文は引き続き `language/` 配下の各言語ファイルで管理します

ローカルでのプレビュー（Docsify は XHR で Markdown を読むため HTTP 配信が必要で、`index.html` を直接ダブルクリックしても動作しません）:

```bash
python -m http.server 8000    # あるいは任意の静的サーバー（例: npx serve）
# http://localhost:8000/ を開く
```

> 公開フロー: `.github/workflows/pages.yml` が `main` への push 時にリポジトリ直下を GitHub Pages へデプロイします。

---

## 言語の選択

解決策ファイルを見る言語を以下から選んでください。

- [中文解决方案 / 中国語](/language/answer_zh.md)
- [English Solutions / 英語](/language/answer_en.md)
- [Русское решение / ロシア語](/language/answer_ru.md)
- [Solución en español / スペイン語](/language/answer_es.md)
- [日本語の解決策](/language/answer_ja.md)

> ドキュメントには多数の埋め込みリンク（青色で強調）があります。クリックすると該当のプロジェクト／ファイルへ移動します。

> 中国語版がオリジナルで、他の言語はそこから翻訳したものです。表現に曖昧さがある場合は中国語版を優先します。

---

## 依存ファイルの説明

リポジトリには自動修正スクリプトと KPM モジュールが `/File/` 配下に含まれています:

- `/File/Found property.sh` — Found property プロパティ検出の修正
- `/File/Tampered Attestation Key(26)Pass.sh` — 証明書の Patch タグ異常の修正
- `/File/shamiko_Plus.sh` — プロパティ領域の「穴」改変の隠蔽
- `/File/Bin/Nohello-v1.8.2.9-83-b3e7d87-release.kpm` — APatch 向け隠蔽 KPM モジュール
- `/File/Doc/ksu_kp_sidechannel_zh.md` — KSU/APatch のサイドチャネル検出原理の解説
- [`/File/Doc/thanks.md`](File/Doc/thanks.md) — 謝辞一覧（完全なクレジット）

---

## フィードバックと貢献

新しい検出項目や解決策を追加する Issues / Pull Requests を歓迎します！

リポジトリを fork して修正し、Pull Request を送ってください。確認してマージします。

---

## 謝辞

完全な謝辞は **[`File/Doc/thanks.md`](File/Doc/thanks.md)** にあります。ドキュメント貢献者、特別謝辞、ツールと自動化を、それぞれコミット／PR の根拠付きで記載しています。

- **ドキュメント貢献者:** 铭鐏 ([@mingzun09](https://github.com/mingzun09)) · [@YiJieqwq](https://github.com/YiJieqwq) · 741afb7 · huoyan1231 · juanma0511 · Young-Six-6 · HongSir6 · Lljjcc625 · [Met-AUG](https://github.com/Met-AUG)
- **特別謝辞:** [Matsuzaka Yuki](https://github.com/matsuzaka-yuki) · [JeTeeZnTmax](https://github.com/jeteezntmax)
- **ツールと自動化:** google-labs-jules[bot]

> [@JeTeeZnTmax](https://github.com/jeteezntmax) は **16 項目**の検出項目の整理と手がかりを提供しましたが、本リポジトリへのコミットはないため GitHub のコントリビューター一覧には表示されません。謝辞ファイルに記録しています。

---

## ライセンス

本リポジトリのドキュメント、Docsify サイト、およびスクリプトは **[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.ja)**（表示—継承 4.0 国際）で提供されます。ライセンス全文は [`LICENSE`](LICENSE) を参照してください。

以下の条件を満たす限り、複製・翻訳・改変・再掲載は自由です。

- **表示** — 「铭鐏 ([@mingzun09](https://github.com/mingzun09)) および貢献者」とクレジットし、本リポジトリへのリンクと変更点を示すこと;
- **継承** — 改変版は同じライセンスで公開すること。

> `File/Bin/` の KPM モジュールや `File/rkp-release-v10.apk` などの第三者ファイルは各作者に帰属し、それぞれのライセンス（EULA など）に従います。本ライセンスの対象外です。
> 以前に MIT ライセンスで提供された内容については、その部分の表示と元のライセンス表示が引き続き適用されます（[謝辞](File/Doc/thanks.md)参照）。

---

## メンテナー

- [@mingzun09](https://github.com/mingzun09) — リポジトリ所有者
- [@YiJieqwq](https://github.com/YiJieqwq) — メンテナー
