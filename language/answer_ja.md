# 春秋検出項目ソリューション（最新バージョン対応） — 日本語

> 確認バージョン：4.6.2（75） 更新：2026-10-21
> 謝辞リスト / Credits：[謝辞一覧](/File/Doc/thanks.md) ｜ あくまで参考であり、具体的な結果は端末／環境によって異なります。
> 一部の項目には「**検出方法**」を補足しています（コミュニティの実測と挙動観察に基づくもので、実装とは異なる可能性があり、問題の切り分けの参考程度です）
> ドキュメントリンク：[github](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution)

---

<details><summary><b>免責事項</b></summary>
**1. コンプライアンスと用途の制約**
春秋検出器および本文書が提供する環境検出と対処の方法は、**Android 技術愛好者**のみを対象とし、**技術学習、環境研究と議論**に専用するものです。本文書中のいかなる方法も、アプリのアンチチート回避、リスク管理機構の回避、ゲームチートなど、あらゆる違法・違規の場面に用いることを**厳禁**します。違規使用によって生じたいかなる結果と責任も、使用者が自ら負うものとします。

**2. リスクの警告**
文書に記録されたすべての操作手順、自動化スクリプト、モジュール設定は技術参考のみを目的としています。システムイメージの改変、ハードウェアキーの差し替え、カーネルモジュール（KPM）の組み込み、低レベル Root 命令の実行などを伴う操作は、いずれも**極めて高い不可逆リスク**を伴い、端末の文鎮化、無限再起動、ユーザーデータの消失を引き起こす可能性があります。すべての操作リスクは使用者本人が負担し、文書の作者は引き起こされうる端末の破損およびデータの消失について一切の責任を負いません。

3. 本手法はコミュニティの実測をもとに整理したものであり、ROM バージョン、カーネル、Root マネージャー、モジュールの組み合わせに影響され、検出項目には誤検出や確率的な偶発ヒットが存在します。文書が示す対策は完全に有効であることを保証せず、検出結果はデバッグの参考にとどまり、絶対的な判定根拠として用いるものではありません。

4. 文書が引用する第三者のモジュール、スクリプト、外部プロジェクトのリンクはいずれもコミュニティで公開されているリソースであり、作者は第三者ツールの安全性・信頼性について責任を負いません。使用者はご自身で出所を確認してください。

5. 付録 A、付録 B に記載された「リスク／ブラックリスト パッケージ名」「不審／チート関連ファイルとディレクトリ」は春秋検出 APP 内蔵のデータセットに由来し、分類の根拠はコミュニティの公開情報とプロジェクト公開ページから取得したものです。環境検出、アンチチート場面の参考にのみ用いるものであり、絶対的な判定結論を表すものではありません。

6. 本文書で新たに定義した端末種別（真アンロック端末、偽リロック端末、未アンロック端末、自己署名端末）は、コミュニティ内で初めて規範化して整理した定義であり、端末分類の用語の統一的な使用を促すことを目的としています。法的な権威性は持たず、技術参考にとどまります。

7. モジュール推薦リスト内のモジュールはいずれも編者の主観的な技術推薦であり、いかなる商業的利益の関係も存在せず、参考のみを目的としています。

</details>

## 説明とフィードバック

<details><summary><b>自分で試してもなお通過できない検出</b></summary>

Issues を作成し、あなたのモジュールリストの情報 + 使用している Xposed モジュールなどの詳細な改変内容を提供してください。時間のあるときに返信／サポートします。

</details>

<details><summary><b>汎用的な切り分け方法（「不明／未解決」の項目に遭遇したとき）</b></summary>

1. **現状を記録する**：`ls /data/adb/modules`、Xposed モジュールリスト、Zygisk 除外ポリシー、偽装系プロパティ（`getprop | grep -iE "spoof|pihooks|pixelprops|resetprop"`）。
2. **最小構成で再テスト**：root マネージャー + 必須の Zygisk プロバイダ（例：Zygisk 実装モジュール）だけを残して再起動しスキャンし、ヒットがなお残るか確認します。
3. **二分法で特定**：以後は毎回ひとつのモジュールだけを有効化 → 再起動 → 再スキャン、を繰り返して具体的なトリガ項目まで絞り込みます（毎回ひとつの変数だけを変える）。
4. **マウント系の項目**は優先的に動かす：メタモジュール、Zygisk 除外ポリシー（「マウントのみ復元」）、SusFS / PathMask 系の隠蔽。
5. **キー／TEE 系の項目**：`keybox.xml`、`target.txt`、セキュリティパッチの同期などを変更した後は**必ず再起動**してから再テストします。
6. 一部の項目は**サイドチャネル／不安定な検出**に属します：同じ環境でもスキャン結果が一致しないことがあるため、まず偶発性を排除してから特定します。

⚠️ **安全上の注意**：いかなる「keybox の交換／RKP キーの交換／リロック状態への変更／セキュリティパッチ同期の変更」も端末のキーと認証（attestation）状態を変化させ、**必ずしも可逆ではありません**。操作前にリスクを評価し、必要に応じて関連ディレクトリを先にバックアップしてください。

---

</details>

## 目次

- [説明とフィードバック](#説明とフィードバック)
- [序章](#序章)
- [一、プロパティ、ビルド情報とテキスト設定](#一、プロパティ、ビルド情報とテキスト設定)
- [二、マウントビューとファイルシステムの整合性](#二、マウントビューとファイルシステムの整合性)
- [三、プロセス、名前空間と権限状態](#三、プロセス、名前空間と権限状態)
- [四、カーネルインターフェース直接呼び出しとアンチデバッグ / アンチインジェクト動作](#四、カーネルインターフェース直接呼び出しとアンチデバッグ--アンチインジェクト動作)
- [五、バイナリとメモリマップの整合性](#五、バイナリとメモリマップの整合性)
- [六、SELinux ポリシー、AVC と監査チャネル](#六、selinux-ポリシー、avc-と監査チャネル)
- [七、Keystore / KeyMint / TEE](#七、keystore--keymint--tee)
- [八、パッケージ管理、アプリ可視性とインストール痕跡](#八、パッケージ管理、アプリ可視性とインストール痕跡)
- [九、タイミング、ページ常駐と差分サイドチャネル](#九、タイミング、ページ常駐と差分サイドチャネル)
- [十、ローカルサービスとターミナル形態](#十、ローカルサービスとターミナル形態)
- [附：上記の判定基準に含まれない項目](#附：上記の判定基準に含まれない項目)
- [付録](#付録)

---

## 用語説明

<details><summary><b>用語の紹介と規範</b></summary>

#### 真アンロック端末

Bootloader（ABL）のアンロックフラグが実際にセットされており、システムは署名検証を受けていない低レベルイメージを通過させ、書き込みも許可します。この端末のアンロック状態は、システムの低レベルプロパティと KeyMint のハードウェアレベル証明（Attestation）にありのまま反映されます。

#### 偽リロック端末

ABL が実際にアンロックされている端末において、ブートチェーンの早い段階（システムと TEE が起動状態を読み取って固定するより前）にカスタム payload を組み込んで実行し、メモリ上のアンロック状態を書き換えて上位へ報告させることで、端末を対外的に「ロック済み（locked & green）」に見せかけ、かつハードウェアレベルの「ロック済み attestation 証明書」を返せるようにしつつ、実際には改ざんされた boot / init_boot イメージを読み込んでいる端末（例：gbl_root_canoe プロジェクトを使う Qualcomm Snapdragon 8e5 端末）。

#### 未アンロック端末

ABL が真のロック状態（未アンロック）を保ったまま、Android / ユーザー空間の権限昇格脆弱性（しばしば SELinux が permissive に設定されることを伴う）によって Root を取得した端末。この種の Root は通常永続せず、起動のたびに再度利用する必要があります。

#### 自己署名端末

端末のブートチェーンが信頼する boot / init_boot の署名キーを第三者が入手または再現でき、ユーザーがそのキーで改ざんした boot / init_boot / vbmeta などのイメージに自ら署名し、ABL が真のロック状態を保ったまま検証を通過して動作させられる端末。システムの起動状態と OEM アンロック状態は依然として「未アンロック」と表示されます（典型例：Lenovo Legion Y700 第 2／3／4 世代。公開 testkey でイメージに再署名すればアンロックなしで root パッチを書き込めます）。

#### Root マネージャー

完全な権限管理コンポーネントの集合体で構成され、ユーザー向けの Android 対話型 App、ユーザー空間のデーモンサービス、およびカーネルや ramdisk に配置される永続化フックやメモリパッチなどを含み、Root 権限の統制を実現します。

#### メタモジュール

モジュールマネージャー型のトップレベルモジュールで、それ自体は端末の偽装やシステムパッチなどの機能を直接提供せず、中心的な役割はサブモジュールの統制とマウント機能の提供です。1 台の端末に同時にインストールできるメタモジュールは 1 つだけです（詳細は [KernelSU 公式ドキュメント](https://kernelsu.org/zh_CN/guide/metamodule.html)）。

#### キーモジュール

システムの keystore デーモン（keystore2）内で KeyMint の attestation 経路をインターセプト／置換し、keybox を用いて端末がロック済みであるという虚偽の証明を生成するモジュール。多くはシステムプロパティの偽装機能も併せ持っています。

#### Zygisk 実装モジュール

Zygisk runtime を提供するモジュールで、コードを Zygote / app プロセスに注入し、Zygisk の挙動を扱う API 一式を外部に公開して、実際に処理を行う他の Zygisk モジュールに読み込み・実行環境を提供します。

#### アプリ隠蔽モジュール

「パッケージ可視性」を操作対象とし、対象プロセス（またはシステムプロセス）内でパッケージ照会の経路をインターセプトすることで、ユーザーの設定に従って対象アプリに対し選択したアプリの可視性を隠すモジュール。

</details>

## 序章

<details><summary><b>最小限の完全隠蔽環境の構築ガイド</b></summary>

- 真アンロック端末：**キーモジュール + Zygisk 実装モジュール + アプリ隠蔽モジュール**
- 偽リロック / 未アンロック / 自己署名端末：**Zygisk 実装モジュール + アプリ隠蔽モジュール**

**APatch / FolkPatch** のユーザーは、サイドチャネル検出を防ぐために **[NoHello.kpm](https://t.me/welikeandroid)** を追加で読み込む必要があります。新しいバージョンのマネージャーには SELinux hook 機能が内蔵されている場合があります（手動で有効化が必要）。旧バージョンのユーザーはさらに **[SELinux_Hook.kpm](https://t.me/APatch_nightly)** を追加で読み込めます（リンクは下部の「関連モジュール推薦」を参照）。

</details>

<details><summary><b>関連モジュール推薦（順位は前後しません）</b></summary>

#### キーモジュール

- [TEESimulator-RS](https://github.com/Enginex0/TEESimulator-RS)：TrickyStore に続く最も著名なキーモジュールで、更新が比較的頻繁、WebUI は同梱していません。
- [OhMyKeymint](https://github.com/qwq233/OhMyKeymint/)：挙動は AOSP に近く、IO オーバーヘッドは TEES-RS より低い可能性があります。
- **WebUI 付きのバージョン**は [ITxiao6666/OhMyKeymint](https://github.com/ITxiao6666/OhMyKeymint) の `Xiaomi_LeiJun` ブランチにあります。
- [Tricky-addon-Enhanced](https://github.com/Enginex0/tricky-addon-enhanced)：TS / TEES-RS で使える WebUI 拡張モジュール。
- オリジナルの TrickyStore は非推薦：最終更新が 2025-11-30 で、一部機能は他のキーモジュールに大きく後れを取っています。

#### Zygisk 実装モジュール

- [Zygisk-Next](https://github.com/Dr-TSNG/ZygiskNext)：最も広く使われている Zygisk 独立実装モジュール。

#### アプリ隠蔽モジュール

- [HMA-OSS](https://github.com/frknkrc44/HMA-OSS)：Zygisk モジュール版 / Xposed モジュール版の 2 バージョンから選択可能。

#### KernelPatch 隠蔽モジュール

- [NoHello.kpm](https://t.me/welikeandroid)：AP / FP のサイドチャネル検出対策モジュール。
- [SELinux_Hook.kpm](https://t.me/APatch_nightly)：AP / FP の SELinux hook モジュール（新しいバージョンのマネージャーには既に内蔵されている場合があります）。
- 春秋検出の最新の **Superkey 検出には現時点で対応モジュールがありません**。登場次第、直ちに更新します。

#### メタモジュール

- 端末の root マネージャーがメタモジュール API を備えている場合は、有効化を検討できます。
- [Hybrid-Mount](https://github.com/Hybrid-Mount/meta-hybrid_mount)：比較的広く使われている第三者メタモジュール。
または、Android カーネルの VFS（仮想ファイルシステム）パスリダイレクトフレームワークである[NoMount](https://github.com/maxsteeel/nomount)の使用を推奨します。
</details>

<details><summary><b>モジュールの正しい設定</b></summary>

#### キーモジュール

a. 対象アプリをパッケージ名リストに追加する（例：TS / TEES の `/data/adb/tricky_store/target.txt`、または WebUI で設定）；
b. セキュリティパッチの日付を正しく設定する、または設定ファイルをそのまま削除する（例：`/data/adb/tricky_store/security_patch.txt`、削除するのが一番簡単）；
c. boot hash を正しく設定する（通常は自動で設定されます）。

#### Zygisk 実装モジュール

「Zygisk コネクタを使用」と「匿名メモリを使用」を有効にします。「マウントのみ復元」は端末の root マネージャーの「カーネルモジュールのアンロード」と衝突する可能性があるため、ご自身でどちらか一方を選んでください。

#### アプリ隠蔽モジュール

使い方は一通りではないため、ここでは名詞の説明のみ行います（HMA-OSS を例に）：

- **ブラックリスト動作モード**：このモードを有効にしたアプリは、適用されたブラックリストテンプレート内のアプリが見えなくなります；
- **ブラックリストテンプレート**：このテンプレートを適用されたアプリに対して、テンプレート内のアプリは見えません；
- **ホワイトリスト動作モード**：このモードを有効にしたアプリは、適用されたホワイトリストテンプレート内のアプリだけが見えます；
- **ホワイトリストテンプレート**：このテンプレートを適用されたアプリに対して、テンプレート内のアプリだけが見えます。

---

</details>




## 検出項目の本文

## 一、プロパティ、ビルド情報とテキスト設定

判定基準は一律 `__system_property_get` / `getprop` / `uname` / `build.prop` / `sepolicy` などのテキストソースから取得し、実行時のビューと整合性を比較します。

<details><summary><b>Bootloader unlock / アンロック属性</b></summary>

#### 検出方法

bootloader のロック状態に関するプロパティ／認証結果を読み取ります —— `ro.boot.flash.locked`、`ro.boot.verifiedbootstate`、`ro.boot.vbmeta.device_state` など（`0` / `orange` / `unlocked` はアンロック済みを意味します）。

#### 対策

- **真アンロック端末**：キーモジュールを使ってアンロック状態を検出器から隠し、「モジュールの正しい設定」に従って検出器をパッケージ名リストに追加します（target リストはリアルタイムで有効になり、再起動は不要）；
- **偽リロック / 未アンロック / 自己署名端末**：端末は対外的に元々「ロック済み（locked & green）」であるため、通常この項目にはヒットしません（この状態は efisp などのブートチェーン早期の手法によって提供されます）。

組み合わせは `起動状態異常` を参照；ほかに、iQoo/Vivo の OriginOS 5 では報告されず、OriginOS 6 では報告されるというフィードバックもあります（誤検出かどうかは未確認）。

</details>

<details><summary><b>起動状態異常</b></summary>

#### 検出方法

verified boot の状態（例：`ro.boot.verifiedbootstate`）を読み取り、期待値と比較します。

#### 真アンロック端末

Bootloader（ABL）のアンロックフラグが実際にセットされており、システムは署名検証を受けていない低レベルイメージを通過させ、書き込みも許可します。この端末のアンロック状態は、システムの低レベルプロパティと KeyMint のハードウェアレベル証明（Attestation）にありのまま反映されます。
コミュニティがテストで試した組み合わせ：キーモジュールを更新(-v307) + TS プラグイン v5.0-beta1 → マネージャーの設定で「モジュールのアンロード（カーネルレベル）」をオフ → Zygisk 実装モジュールを「マウントのみ復元」に設定 → スマホマネージャーを凍結（Xiaomi ではアプリ隠蔽／凍結の手法を使い「環境チェックを無効化」をオンにできます）→ プロパティ隠蔽スクリプトを `/data/adb/service.d/` に配置。

</details>

<details><summary><b>avb 検証異常 avb=2.0</b></summary>

#### 検出方法
`ro.boot.vbmeta.avb_version` などの vbmeta プロパティを読み取り、期待値と比較します。

#### 原因
一部のモジュールが vbmeta プロパティを強制的に書き換えてこの問題を起こします。以下に限らず：
1. **機種偽装モジュール**
2. **Play Integrity 修復／通過系モジュール**（例：Integrity Box、各種 PIF 派生版／統合パッケージ。こうしたモジュールはリロックを模擬するため、インストール時や起動スクリプトで `avb_version=2.0` をハードコードで書き込むことがよくあります）

#### 切り分けと対策
1. **問題モジュールの特定と切り分け**：
   - MT マネージャーを開き、`/data/adb/modules/` ディレクトリに入ります。
   - ファイル内容を検索：`avb_version`。
   - ヒットしたモジュールのファイル（例：`system.prop`、`post-fs-data.sh`、`customize.sh` など）を調べ、どのモジュールがこのプロパティを注入しているかを見つけ、該当する値を修正するか、関連設定をコメントアウトするか、その問題モジュールをアンインストール／無効化します。
2. **起動時の常駐サービススクリプトの切り分けと修復（Integrity Box などのモジュールでよく見られます）**：
   - `/data/adb/service.d/` ディレクトリに `hash.sh`（または他の自動起動スクリプト）が存在するか確認します。
   - 開いて、以下が含まれていないか探します：
     ```sh
     "$RESETPROP" ro.boot.vbmeta.avb_version "2.0"
     ```
   - これを次のように変更します：
     ```sh
     "$RESETPROP" ro.boot.vbmeta.avb_version "1.3"
     ```
   - 保存後に端末を再起動すると有効になります。その後この行はそのままコメントアウトまたは削除してもかまいません。
3. **コマンドラインでの一時変更（1 回の起動中のみ即時有効）**：
   - 環境が `resetprop` に対応している場合（Magisk 環境、または対応する PATH を設定済みのターミナル）、ターミナルで直接実行してみてください：
     ```sh
     su -c resetprop -n ro.boot.avb_version 1.3
     ```
   - *注意：`resetprop` が直接変更するのはメモリ上のプロパティであり、端末を再起動すると失効します。また KernelSU 環境のターミナルは通常 resetprop をグローバル PATH に入れていないため（`resetprop: command not found` のエラーになります）、恒久的に解決するには必ず方法 1 と 2 で該当する起動スクリプトを修正してください。*

</details>

<details><summary><b>USB デバッグが有効</b></summary>

#### 検出方法

native メソッド `runFormalUsbDebuggingCheck`；静的成果物の中に `adb_enabled` などの設定項目文字列は見当たらず、`adbd` / `adbroot` / `adb_data_file` に関連する SELinux ルール群（SELinux ルールの探査と同源）と推測されますが、具体的な判定基準は未確認です。

#### 対策

USB デバッグをオフにします（`su -c settings put global adb_enabled 0`）。`/data/adb/service.d/` に書き込んで起動時に自動でオフにできます。

関係：`fdinfo mnt サンプリング異常（c）` も USB デバッグに関わりますが、判定基準は異なります——あちらは `/proc/*/fdinfo` の `mnt_id` の残留を見ています。

---

</details>

<details><summary><b>サードパーティ カーネル</b></summary>

#### 検出方法

カーネルバージョン情報が事前定義の特徴リストに一致。

カーネル情報が事前定義の情報リストに一致。

カーネル情報の偽装で解決。
SUSFS でカーネル名を偽装。

</details>

<details><summary><b>サードパーティ rom／自前ビルドカーネル</b></summary>

#### 検出方法

カーネルバージョン番号の接尾辞に `-Dirty` などの自前ビルドの特徴がある。

サードパーティ ROM のマーク。

カーネルバージョン番号の接尾辞に `-Dirty` が付いている。

カーネル情報の偽装で解決。
SUSFS でカーネル名を偽装。

</details>

<details><summary><b>Tampered kernel / 偽装カーネル</b></summary>

#### 検出方法

カーネルの uname（バージョン文字列、ビルド時刻）を読み取り、事前定義のリスト／ベースラインと比較します。カーネル情報が偽装（SUSFS など）された後の整合性判定もこの項目に含まれます。

#### 対策

- SUSFS などカーネルレベルの手法でカーネル名を隠す；カーネルを偽装するときは起動段階を `post-fs-data` に設定する；
- 未改変の boot.img に戻す方法もあります。

開発者の言葉そのまま：純正システム + LKM モードで出る場合は誤検出です。

</details>

<details><summary><b>カーネルバージョンの偽装を検出：%1$s</b></summary>

#### 原因
`uname(2)`、`uname -r` 子プロセス、`/proc/version` の三経路で release 文字列が一致しない

SUSFS でカーネルバージョンを偽装するなどの手段を試す

</details>

<details><summary><b>Property Modified（数字はプロパティ改変の箇所数を表します）</b></summary>

#### 検出方法

プロパティ領域の空洞を走査します：`/dev/__properties__/` 下のプロパティファイルの権限／所有者／サイズと対応する SELinux context、およびプロパティ領域に未使用の空洞（`prop_area` の重なり／空洞）が存在するか——空洞があればプロパティが動的に改変されたことを示します。

改変されたプロパティを隠すには、リポジトリが提供する [shamiko_Plus.sh](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution/blob/main/File/shamiko_Plus.sh) ファイルを追加して `/data/adb/service.d/` ディレクトリに移動し、このスクリプトに実行権限があることを確認してから再起動し、解決を試みてください。
注意：`shamiko_Plus.sh` は `resetprop -n` で早期にプロパティを書き込むため、`/data/adb/service.d/` に置いて実行する必要があり、かつ**永続化しないでください**。そうしないと逆に新たなプロパティ領域の空洞を生む可能性があります。

</details>

<details><summary><b>Found property</b></summary>

#### 検出方法

`persist.logd.size` / `persist.logd.size.crash` / `persist.logd.size.system` / `persist.logd.size.main` が**空でない**値に設定されているかを確認します（空でなければヒット；これらのプロパティはログバッファの設定で、一部のモジュール／スクリプトが書き込みます）。

[この sh](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution/blob/main/File/Found%20property.sh) を実行して解決を試みてください。

</details>

<details><summary><b>ROM detected</b></summary>

#### 検出方法

システム／機種の特徴がサードパーティ ROM リストに一致。

サードパーティ ROM を検出。

一部のサードパーティ rom の特徴に一致。

ご自身で偽装を試せます。
SUSFS でカーネル名を偽装。

</details>

<details><summary><b>ROM detected (a)</b></summary>

#### 原因
`vendor_sepolicy.cil` / `vendor_file_contexts` に `hal_lineage`、`hal_aospa`、`.lineage`、`.aospa` が含まれる。

カスタム／移植システム／ROM でよく見られ、開発者の改善参考用であり、解決策はありません

</details>

<details><summary><b>Vold 隔離が有効</b></summary>

#### 検出方法

`persist.sys.vold_app_data_isolation_enabled` を読み取ります（HMA / アプリ隠蔽モジュール の Vold appdata 隔離がこのプロパティを書き込みます）。

HMA/HMAOSS の設定でターミナル Vold app data 隔離をオフにする

オフにして再起動してもなお `persist.sys.vold_app_data_isolation_enabled=0` が残る場合

su shell で `resetprop -p --delete persist.sys.vold_app_data_isolation_enabled` を実行してから再起動すれば完了です
注意（作者確認待ち）：`Miscellaneous Check(3)` と互いに牽制し合う関係にあり、そちらの説明を参照。

---

</details>

<details><summary><b>Miscellaneous Check（a）</b></summary>

#### 検出方法

dex2oat 関連のフラグ（例：`dalvik.vm.dex2oat-flags`）を確認します。LSP / Xposed 系のモジュールはしばしばこれらを改変します。

dex2oat を検出（通常は LSP の問題で、LSP モジュールを交換／更新する）。

</details>

<details><summary><b>Miscellaneous Check(2)</b></summary>

#### 検出方法

端末／機種の改ざん検出（機種偽装モジュールでよくトリガーされます）。

端末の改ざん／機種の改ざんを検出。

機種偽装モジュールが原因？ ご自身で切り分けを。

</details>

<details><summary><b>Miscellaneous Check(3)</b></summary>

#### 検出方法

機種偽装／隔離関連の検出（例：Vold appdata 隔離の影響）。

機種偽装検出？

以下の手法は古い可能性があります：「アプリリストの隠蔽(HMA)」の Vold appdata 隔離を有効にしていた？ 
注意（作者確認待ち）：本項目と `Vold 隔離が有効` は互いに牽制し合います——HMA／アプリ隠蔽モジュール の Vold appdata 隔離を有効にすると本項目は解ける可能性がありますが、`Vold 隔離が有効`（そのプロパティが書き込まれる）をトリガーします。より優先度の高い一方を取捨してください。

</details>

<details><summary><b>GMS がブロックされている</b></summary>

#### 検出方法

ROM 側の「GMS をブロックする」特徴ファイルと実行ファイルを確認します —— `/my_product/etc/permissions/oplus_google_cn_gms_features.xml`（OPPO / OnePlus の中国国内機種。検出器はこのパスを直接 `access` します）、`/system/bin/gmsc`；ほかに PIF 系プロパティ `persist.sys.pihooks.disable.gms`、`persist.sys.pixelprops.gms`、`persist.sys.spoof.gms`。

#### 対策

アプリ隠蔽モジュールでシステムコンポーネント（Google サービススイート）を隠していないか確認するか、ROM 側の GMS 問題を切り分けてください。

</details>

<details><summary><b>検出失敗</b></summary>

#### 検出方法

この検出自体が正常に完了しなかった（環境の制約／タイムアウトなど）もので、**「ヒット」ではありません**。再試行するか無視してかまいません。

</details>

<details><summary><b>LineageOS detection</b></summary>

**検出方法：**
LineageOS システムが動作中で、関連する多くのプロパティ特徴が検出されます

**対策：**
susfs（あれば）を使って、検出された特徴データの隠蔽偽装を試せます

</details>

<details><summary><b>[hook]Resetprop modified</b></summary>

#### 検出方法

プロパティが resetprop 系ツールによって動的に書き換えられています。

resetprop が改変されている。

不明。

</details>

<details><summary><b>サードパーティROM（2）</b></summary>

#### 検出方法

サードパーティ ROM の特徴（第 2 グループ）。

今のところ不明

</details>

## 二、マウントビューとファイルシステムの整合性

判定基準は `mountinfo` / `statfs` / `statx` / `fdinfo` / `getdents64` の間の相互矛盾であり、あるキーワードが出現することではありません。

<details><summary><b>マウントの隙間</b></summary>

#### 検出方法

マウントグループ ID / peer-group テーブルの連続性を確認します：グループ ID に飛び（例：1,2,3,6,7…）がある、または peer-group テーブルが不一致（隠されたマウントポイントが存在する）ならヒットです。

この判定方法では、マウントグループ ID の増加が不連続な場合（例：1,2,3,6,7,8...）に隠れた root 行為があると判定し、逆にマウントグループ ID の増加が連続している場合（例：1,2,3,4,5,6,7...）は正常とします。

Magisk 系が namespace を切り替えるときにこの現象が現れます。KernelSU 系／APatch 系でも、バインドマウント機能を持つ一部のモジュールを使っている場合に現れることがあります。

#### 対策

- **Magisk 系**：Magisk Alpha を使えば解決します。原理は不明。
- **Kernel 系／APatch 系**：「メタモジュール」の交換で解決するか、ROOT マネージャーを更新してください。

問題がなお残る場合は、バインドマウント機能を持つシステムモジュールと、システムに元々この現象が存在しないかを確認してください。

*注意*：少数の ROM では元々この現象が存在します。これに該当する場合はこの項目を無視してください。
メタモジュールの交換（例：Hybrid-Mount、序章「関連モジュール推薦」を参照）／root マネージャーの更新と再パッチ；Scene を使っている場合は Scene を更新してください。

</details>

<details><summary><b>mountinfo</b></summary>

#### 検出方法

プロセスの早期にまず mountinfo のスナップショットを 1 回撮り、その後で実行時のビューと照合し、両者が一致しなければヒットです（`Mountinfo view drift`）。

2 つの手段で取得したマウントビューが異なります。隠蔽の問題が存在する可能性があり、時にサービス側の処理が間に合わないだけで報告されます（ごく早期の mountinfo スナップショット vs 後期の照合）

Xiaomi 端末では通常、起動後にシステムの負荷が高いときに検出器を開くとこの検出項目が出ます。
起動直後のヒットはほとんどがスナップショット期の誤差です：**起動後 20 秒～5 分待ってからテストしてください**。

</details>

<details><summary><b>異常マウント</b></summary>

#### 原因

`("/proc/self/exe")` が指すパスが mountinfo の期待値と矛盾している

マウント系モジュールを切り分け、メタモジュールの交換で解決を試す

</details>

<details><summary><b>マウントビューの不一致</b></summary>

#### 原因
上の項目と原理はほぼ同じだが、照合する appzygote が一致しない

マウント系モジュールを切り分け、メタモジュールの交換で解決を試す

</details>

<details><summary><b>Mount Detectde(1)</b></summary>

/system にマウント行為が存在する

</details>

<details><summary><b>Mount Detector(2)</b></summary>

追記予定

</details>

<details><summary><b>Mount Detector(3)</b></summary>

追記予定

</details>

<details><summary><b>Mount Detector(4)</b></summary>

追記予定

</details>

<details><summary><b>Mount Detector(5)</b></summary>

追記予定

</details>

<details><summary><b>Mount Detector(6)</b></summary>

追記予定

</details>

<details><summary><b>Mount Detector(7)</b></summary>

**対策：**
マウントを検出した場合、NoMount メタモジュールの使用を推奨します。あるいは検出のヒントに従い、システムを改変しているモジュールをオフにして解決を試みてください

</details>

<details><summary><b>Mount Detector(8)</b></summary>

追記予定

</details>

<details><summary><b>Mount Detector(9)</b></summary>

追記予定

</details>

<details><summary><b>Mount Detector(10)</b></summary>

追記予定

</details>

<details><summary><b>Mount Detector(11)</b></summary>

追記予定

</details>

<details><summary><b>不一致のマウント(1)</b></summary>

追記予定

</details>

<details><summary><b>不一致のマウント(2)</b></summary>

追記予定

</details>

<details><summary><b>不一致のマウント(3)</b></summary>

追記予定

</details>

<details><summary><b>不一致のマウント(4)</b></summary>

追記予定

</details>

<details><summary><b>不一致のマウント(5)</b></summary>

追記予定

</details>

<details><summary><b>不一致のマウント(6)</b></summary>

追記予定

</details>

<details><summary><b>マウント異常(X)</b></summary>

#### 検出方法

マウントテーブルの走査（`verdict=hit: peer-group table inconsistency (hidden mount points)`、`suspicious mount entry`、overlay 検出など）。ヒットすると具体的な `/dev/block/...` やモジュール名を展開詳細に入れます。

一部のモジュール／アプリのマウントを検出。
**KSU · LKM**：項目の展開で示された `/dev/block/xxx` パスを PathMask で隠してからホットリロード；**GKI + SUSFS**：SUSFS に対応する隠蔽パスを書き込む；**GKI で SUSFS なし**：LKM の手法を参考に；その他のマネージャーは現時点で手法なし。
展開内容に **overlay** の文字が出る → メタモジュールを交換（例：Hybrid-Mount、序章「関連モジュール推薦」を参照）；特定のモジュールによるマウントだと確定できる → そのモジュールをアンインストール。
関係：`/data/local/tmp メタデータ異常族`（`2222`、`Futile hide 04` を含む）、`Mount loophole`、`Magic Mount`、`マウントの隙間` と同様にマウント系に属します；対処手段は同じ（Zygisk 実装モジュール「マウントのみ復元」、メタモジュールの交換（例：Hybrid-Mount）、PathMask/SUSFS による隠蔽）。

</details>

<details><summary><b>/data/local/tmp メタデータ異常族（Futile hide / 1 / 2 / 04 / 2222）</b></summary>

#### 検出方法

いずれも `/data/local/tmp` ディレクトリの**メタデータ**（タイムスタンプ／inode／所有者／権限）に対する異常判定で、アプリ内では 5 つの独立した文案です：
- `Futile hide`：ディレクトリのタイムスタンプが改変されている；
- `Futile hide 1` / `Futile hide 2` / `Futile hide 04`：同種のメタデータ異常の異なる変種；
- `2222`：マウント／メタデータに関連する変種。

#### 対策

`su -c rm -rf /data/local/tmp` → 再起動 → さらに `Suspicious Surroundings (a)/(b)/(c)`（所有者／inode／権限）に従って項目ごとに修復します；`Futile hide 1` もまず再起動してからテストしてかまいません。

関係：`Suspicious Surroundings`、`/data/local/tmp denied` と同じ族で、対処手段は同じ。

---

</details>

<details><summary><b>Inconsistent mount / 不一致のマウント（debug_ramdisk）</b></summary>

#### 検出方法

`/proc/self/exe` から解決したマウントと `statfs` で得たファイルシステム種別を比較し、種別が一致しなければヒット；ほかに `/debug_ramdisk` のマウントビューが不一致になる変種があります。

#### 対策

`su -c umount /debug_ramdisk`。

補足：一部の端末では未修復の誤検出が存在します（3.4 バージョンでその一部は修正済み）。

</details>

<details><summary><b>Magic Mount</b></summary>

#### 検出方法

magic mount（モジュールによるシステムへのマウント書き換え）の痕跡を確認します。

Magic Mount を検出

システム改変系のモジュールを除外してみるか、何らかのモジュールでこの問題を隠してください（例：Zygisk 実装モジュール の除外ポリシー）。

同上：Zygisk 実装モジュール「マウントのみ復元」／メタモジュールの交換（例：Hybrid-Mount、序章「関連モジュール推薦」を参照）。

</details>

<details><summary><b>Mount loophole</b></summary>

#### 検出方法

システム改変系モジュールの magic mount がシステムパーティションに対して有効になっているかを確認します。

Magic Mount がシステム改変モジュールのマウントに有効

ただしマウントは他のモジュールで隠す必要がある（SusFS／Zygisk 実装モジュール を選択可）

Zygisk 実装モジュール の除外ポリシー > マウントのみ復元 を使い、除外リストを設定／デフォルトのモジュールアンロードを有効にして隠蔽します。
Zygisk 実装モジュール の除外ポリシー「マウントのみ復元」を使う；またはメタモジュールを交換（コミュニティ推奨は **メタモジュール**）。

</details>

<details><summary><b>/data/local/tmp denied</b></summary>

#### 検出方法

`/data/local/tmp` にアクセスできるか（権限／存在するか）を確認します。

ディレクトリ `/data/local/tmp` へのアクセスが拒否されました。フォルダの権限設定の問題？ フォルダが存在しない？
同上：このディレクトリを削除して再起動し、新たに出現した項目に従って処理してください。

</details>

<details><summary><b>MTマネージャー（MT2 フォルダ）／異常ファイル</b></summary>

#### 検出方法

`/storage/emulated/0/MT2/`、boot.img、`.xml` などのファイルを確認します。

異常ファイル：ルートディレクトリ下の "mt2" フォルダと boot.img / ".xml" の異常ファイルを検出。

"mt2" は MT マネージャーの設定で MT2 パスを独自に変更すれば解決します（古いフォルダの削除を忘れずに）。

</details>

<details><summary><b>異常ファイル</b></summary>

#### 検出方法

`/dev`、`/data`、`/data/local/tmp`、`/storage/emulated/0` などの位置で高危険ファイル名とチートの特徴にマッチングします（一覧は付録 B を参照）。

#### 検出パス

`/dev` と `/data/local/tmp`
1. 関連するディレクトリ・ファイルをリネーム／削除する。

2. 以下の高危険パスを切り分けて削除する：
   ```text
   /data/local/stryker
   /data/system/appretention
   /data/local/tmp/luckys
   /data/local/tmp/input_devices
   /data/local/tmp/hyperceiler
   /data/local/tmp/simplehook
   /data/local/tmp/disabledallgoogleservices
   /data/local/mio
   /data/dna
   /data/local/tmp/cleaner_starter
   /data/local/tmp/byyang
   /data/local/tmp/mount_mask
   /data/local/tmp/mount_mark
   /data/local/tmp/scripttmp
   /data/local/luckys
   /data/local/tmp/horae_control.log
   /data/gpu_freq_table.conf
   /storage/emulated/0/download/advanced
   /storage/emulated/0/documents/advanced
   /data/system/noactive
   /data/system/freezer
   /storage/emulated/0/android/naki
   /data/swap_config.conf
   /data/local/tmp/resetprop
   ```
ヒット後、項目は**実際にヒットしたパス**をそのまま提示します（コミュニティでは「1 本のパス」と呼びます）。ヒントに従って削除すれば完了です。

</details>

<details><summary><b>Suspicious Surroundings (a)</b></summary>

#### 検出方法

`/data/local/tmp` に対してメタデータ検査を行います：ディレクトリの所属グループが `shell` かどうか。

`/data/local/tmp` フォルダの所有グループが異常。

#### 対策

所有グループを shell に変更する。
コミュニティの実測：この項目が判定しているのは `/data/local/tmp` の**所有者／所属グループの異常**です（元文書の「所有グループ異常」がこれに対応）；一律 shell に戻せば解決します：`su -c chown shell:shell /data/local/tmp`。

</details>

<details><summary><b>Suspicious Surroundings（b）</b></summary>

#### 検出方法

`/data/local/tmp` の inode 値が高すぎないかを確認します（コミュニティ実測の閾値は **> 10000**；このディレクトリが削除／再作成されたことがあると inode が異常に大きくなります）。

#### 対策

（いずれか 1 つ）：
1. 工場出荷状態に初期化する；

2. カーネルレベルの隠蔽でこのパスの inode を 1000 未満に偽装する；

3. [Inode-Hijacker](https://github.com/YiJieqwq/Inode-Hijacker/releases) スクリプトを使う（ダウンロードして実行するだけ；実行できない場合は古い release に替える）。

注意：**Inode-Hijacker を使った後、有線画面ミラーリング（例：Scrcpy）が使えなくなる**場合は、`su -c restorecon -RF /data/local/tmp` を実行して復元すれば解決します。

</details>

<details><summary><b>Looper fd 図の異常</b></summary>

#### 検出方法

自プロセスの fd のターゲット（`/proc/self/fd` + `readlink`）を読み取り、fd 図（開いているファイル／socket／匿名 inode）を期待値と比較します。

今のところ不明
一部の古いカーネルでこの検出項目が出る可能性があり、修復方法は今のところ不明です。

</details>

<details><summary><b>fdinfo mnt サンプリング異常（c）</b></summary>

#### 検出方法

`/proc/*/fdinfo` 内の `mnt_id` を読み取ってサンプリング統計を取り、マウントビューとクロスチェックします。USB デバッグの残留や一時的なマウントでトリガーされやすいです。

おそらく USB デバッグの痕跡を検出しており、低確率で誤検出です。スクリプト[デバッグ痕跡の消去](https://github.com/YiJieqwq/ADB-Trace-Cleaner/releases)を使って解決を試せます。

</details>

<details><summary><b>Suspicious Surroundings（c）</b></summary>

#### 検出方法

`/data/local/tmp` の権限がデフォルト値（771）かどうかを確認します。

`/data/local/tmp` の権限が改変されている（デフォルトは 771）。

#### 対策

権限を再設定する。
権限をデフォルトに戻す：`su -c chmod 771 /data/local/tmp`。

</details>

<details><summary><b>/dev/cpuset/AppOpt</b></summary>

#### 検出方法

このパスは「スレッド／スケジューリングモジュールのマウント」の特徴シグネチャに属します（`/data/swap_config.conf`、`/data/encore/*_cpu_gov`、`/data/local/tmp/yshell` などと同じ特徴テーブルに入っています）。ディレクトリが存在すれば報告されます。

スレッド／スケジューリング系モジュールのマウントを検出。
該当するスレッドモジュールをアンインストール。

</details>

<details><summary><b>/system/bin/fastboot と /system/bin/adb</b></summary>

#### 検出方法

システムの実行ファイルに対して異常な存在性検査を行います（`/system/bin/adb` は特徴テーブル内であることを確認済み、`fastboot` は未確認）。Xiaomi の公式改変パッケージでよく見られます。

異常な実行ファイルを検出（Xiaomi の公式改変パッケージでよく見られます）。
公式パッケージに戻す；または PathMask でこの 2 つのファイルを隠す。

</details>

## 三、プロセス、名前空間と権限状態

判定基準は `/proc/<pid>` のトポロジ、namespace リンク、cgroup、`getgroups`、自身の status から得られます。

<details><summary><b>本プロセスの Root 権限異常</b></summary>

追記予定

</details>

<details><summary><b>異常プロセス0000（pid）</b></summary>

#### 検出方法

同上（監査ログの漏洩）；0000 はそのプロセスの pid で、`ps -ef | grep <pid>` で逆引きできます。

0000 が表しているのはプロセスの pid

shell コマンドを root で実行し `ps -ef | grep 数字id` で該当 pid のプロセスを探せます。通常は root 権限を持つデーモンプロセスです（例：lspd プロセス、Tricky-Store プロセス）

#### 対策

この検出はセキュリティ脆弱性に依存しており、セキュリティパッチを 2026/01/01 に更新すると検出率を大幅に下げられますが、現時点では完全には解決できません。このセキュリティ脆弱性は Google が Android 17 を正式リリースした後に完全に修復されます。

セキュリティパッチの更新はシステム更新を伴うことが多く、システムを更新したくないためにセキュリティパッチを更新できない場合は、この項目を無視してかまいません。

アプリのデュアルオープンでこの検出手法が無効になることがありますが、このセキュリティ脆弱性を実質的に解決するものではないため、デュアルオープンは有効な方法と見なすべきではありません。

誤検出の現象もあります


#### 検出方法（4.6.2 実測による補足）

ネイティブ側の判定は **cgroup 内のプロセスグループ走査 + PPID によるクラスタリング** です。まず cgroup 内のプロセス帰属を列挙し、次に `PPid` で親子の組にまとめます。ある組に異常な帰属（親プロセス、uid、cgroup の階層が想定と合わない）が現れると、その組の異常な `tgid` **ごとに 1 件ずつ** `異常なプロセス %1$s` を出します。

そのため 1 回の走査で同じ組の項目が連続して複数出ることがあります。`%1$s` は各 `tgid` のプロセス名または cmdline から取り（どちらも取れない場合は空文字列）、プロセス名だけを変えたり cgroup ディレクトリを 1 つ隠したりしても、組全体は通常消えません。再確認では `Tgid`、`PPid`、cgroup の帰属が互いに整合しているかを併せて見てください。

</details>

<details><summary><b>Zygote に異常が存在</b></summary>

#### 検出方法

本プロセス（アプリの zygote 子プロセス）の GID リストを読み取り、**GID 3009（AID_READPROC）**が存在するか確認します（プローブ出力 `readproc_gid_3009=present/missing`）→ 欠落していればヒット（**この GID が欠落する原因はまだ確認できていません**）。

（コミュニティの説）アプリ自身の zygote の補助 GID が制限されている。
HMA-OSS モジュールで春秋検出に対して「zygote 権限を制限」内の `INET_GID` をオフにする。

補足：このスイッチは**ブラックリスト**方式でユーザーがチェックした補助 GID を外します（HMA-OSS の選択肢は 1015 / 1023 / 1032 / 1077 / 1078 / 1079 / 3003 / 9997 の計 8 項目で、**3009 は含まれません**）。本項目の**判定基準**は「GID 3009 の欠落」で確定ですが、**原因がこのスイッチに由来するかはまだ確認できていません**。

</details>

<details><summary><b>zygote test (1) / App Zygote の fork 順序異常</b></summary>

#### 検出方法

app_zygote（アプリ zygote）内の fork 順序プローブ —— `/dev/socket/logdw` でログ socket を開いて identity / cookie を取得し、`prepare/parent/child`、親子の生存と fd クローズの順序から **Zygisk が app-zygote より早く注入された**残留があるかを判定します；サイドチャネル類に属し、不安定です。

#### 対策

Zygisk 実装モジュールの「リンカ機能」と「匿名メモリ機能」をオンにします；除外リストのポリシーを「マウントのみ復元」に設定します；不安定なときはそのまま再テストしてかまいません。

</details>

<details><summary><b>OBB ディレクトリに異常が存在</b></summary>

#### 検出方法

複数の読み取り専用の手段でアプリ**自身の OBB パス**を読み取り結果を比較します：`statx` / `newfstatat` / `openat_chain`（プローブ `self_obb_path_visible`、`inconsistent_read_only_views`）→ 各ビューが不一致（このパスをインターセプト／隠蔽しているモジュールがあることを示す）ならヒット。

検出器のスキャンを妨げようとするモジュールがインストールされている。
とりあえず**誤検出**として理解してください；アプリ隠蔽モジュール で春秋検出に対して「zygote 権限を制限」をオンにできます（`INET_GID` 以外はすべてオン）。

</details>

<details><summary><b>端末がエミュレータ</b></summary>

#### 検出方法

エミュレータ／仮想化の特徴、例えば `/dev/goldfish_pipe`、`/dev/qemu_pipe`、`/dev/socket/genyd`、`/sys/qemu_trace` など、および `goldfish` / `ranchu` / `qemu` / `genymotion` / `bluestacks` / `ldplayer` / `nox` / `memu` / `ttvm` / `vbox` / `vmware` などの機種キーワードを確認します；同時に `android/os/BatteryManager` と `android/telephony/TelephonyManager` も参照するため、**バッテリー／充電状態と SIM 状態**も参考にします。

#### 対策

まず検出器をアンインストールして再インストールします；**SIM カード未挿入 + 満充電 + 充電中**の状態でのテストは避けてください。

</details>

<details><summary><b>実行環境が不審 / コンテナ / マルチインスタンスを検出</b></summary>

#### 検出方法

`/proc/self/cgroup` のパス形式が `^0::/uid_\d+/pid_\d+$` または `^0::/apps/uid_\d+/pid_\d+$` に一致するかを検証し（2 つの正規表現はコード内に直接組み込まれています）、さらに parallel / clone 関連のプローブ（`parallel_ok=`、`signal_parallel_access_mismatch=`）を組み合わせます；形式が異常、またはプローブが不一致ならヒット。

アプリがマルチインスタンス／サンドボックス／コンテナ環境にあることを検出。
春秋検出をアンインストールして再インストールしてください；**春秋検出にアプリのデュアルオープンを使用しないでください**。

</details>

<details><summary><b>環境の偽造</b></summary>

#### 検出方法

再現条件によってトリガー面が異なります——① 監査ログパッチ系のカーネル手法を書き込んだ後にトリガー（下記参照）；② **プロパティ偽装系モジュール**を指摘するフィードバックもある（`persist.sys.pihooks_*`、`persist.sys.pixelprops.*`、`persist.sys.spoof.gms` など、検証待ち）；自己点検の手がかり：本プロセスの maps に PIF / IntegrityFix / PixelProps 関連モジュールが現れていないか。

旧端末（4 系カーネル）では誤検出かも？

**既知のトリガー面：**
- 監査ログパッチ系のカーネル手法を書き込んだ後にトリガー → そのモジュールをアンインストール；
- **プロパティ偽装系モジュール**（PIF / pihooks / pixelprops / spoof 系）でもトリガーされる可能性（検証待ち）→ `getprop | grep -iE "pihooks|pixelprops|spoof"` でプロパティ偽装の残留がないか確認し、該当モジュールを特定して処理するか、検出器に対して関連プロパティを隠す；
- 一部のカスタム／移植 ROM が持つ機種やプロパティの偽装でもトリガーされる可能性。

</details>

<details><summary><b>UID Namespace mismatch（同一 UID の名前空間不一致）</b></summary>

#### 検出方法

同一 UID 下の user namespace ビューが不一致（`UID namespace mismatch for same UID`）。

#### 対策

対処：隠蔽フレームワークが namespace を改変していないか確認；メタモジュールを交換／更新してから再テスト。

</details>

<details><summary><b>Mount Namespace（マウント名前空間）/ Mount namespace anomaly</b></summary>

#### 検出方法

マウント名前空間のビュー異常（`Mount namespace anomaly`）；`不一致のマウント/debug_ramdisk`、`マウントの隙間` と関連しますが判定基準は異なります（ここで比較するのは namespace ビューであり、マウントテーブル／statfs ではありません）。

対処：マウント系と同じ（Zygisk 実装モジュール「マウントのみ復元」／メタモジュールの交換（例：Hybrid-Mount）／PathMask、SUSFS による隠蔽）。

</details>

<details><summary><b>PID Namespace（プロセス名前空間）/ PID namespace anomaly</b></summary>

#### 検出方法

プロセス名前空間のビュー異常（`PID namespace anomaly`）。

対処：隠蔽フレームワーク／メタモジュールによる namespace の改変を確認し、更新後に再テスト。

</details>

## 四、カーネルインターフェース直接呼び出しとアンチデバッグ / アンチインジェクト動作

判定基準は syscall、ptrace、prctl、mincore、seccomp、netlink、socket の戻り値とタイミングから得られ、libc のラッパーを迂回します。

<details><summary><b>デバッガが接続済み</b></summary>

追記予定

</details>

<details><summary><b>デバッグ環境は未アンロック端末の可能性</b></summary>

`/proc` の三経路が不一致、または dumpable=1/2。

</details>

<details><summary><b>動的インストルメンテーションコンポーネントを発見</b></summary>

Frida 系のランタイムコンポーネントの存在を判定

</details>

<details><summary><b>Found ksu／未アンロック端末</b></summary>

#### 検出方法

KSU の未アンロック（ジェイルブレイク）モードの特徴、または ksu 関連のプロセス／デバイスを発見（ホットリブート後に出現します。1 回再起動して解決を試せます）

#### 対策

KSU が**未アンロック（ジェイルブレイク）モード**にある、または ksu 関連のプロセスなどが発見されました。

**未アンロック（ジェイルブレイク）モード**の使用は推奨しないため、解決策は提供しません。


#### 検出方法（4.6.2 実測による補足）

4.6.2 の判定はプロセス内部の二つの状態異常で、どちらか一方でもヒットです：

- `getppid() > 5000`：正常なアプリプロセスの親は起動初期に生成された system zygote で、pid は通常 5000 よりはるかに小さい値です。親の pid が大きすぎる場合は親が想定の zygote ではないことを意味し、インジェクションや親プロセスの付け替えでよく見られます；
- `/proc/self/status` の `Seccomp: 0`：正常なアプリプロセスは seccomp フィルタ配下で動作するはずです（通常この値は `2`）。`0` はフィルタが無効であることを示します。

この項目は **ローカル判定** です：機内モード + `pm clear` の後でも再現します。KSU マネージャーを `pm hide` する、アプリの mount namespace 内で `/data/adb` を空ディレクトリに bind する、`/proc/fs` を隠す、のいずれもこの項目は変わりません ⇒ 読んでいるのはプロセス自身と親プロセスの状態であり、パッケージマネージャー、`/data/adb` の内容、`/proc/fs` の loop デバイスには依存しません。下の `KernelSU loop device` は別の独立した詳細です。

</details>

<details><summary><b>KernelSU loop device</b></summary>

#### 検出方法

KernelSU の特徴を持つ loop デバイスのマウントが存在するか確認します。

KSU を検出

マネージャーを更新して再パッチ
マネージャーを更新して再パッチ；またはメタモジュールをオフ／交換（例：Hybrid-Mount、序章「関連モジュール推薦」を参照）。


#### 検出方法（4.6.2 実測による補足）

判定は **jbd2 と ext4 の両方で同時に一致すること** です：

1. `/proc/fs/jbd2` を列挙し、`loop*-8` の形の項目（loop デバイス上の ext4 ジャーナル項目）を探します；
2. 一致した各項目から `-8` の接尾辞を除いて `<dev>` を得て、`/proc/fs/ext4/<dev>` も同時に存在することを確認します；
3. 両方が成立したときだけ `KernelSU loop device: %1$s` を出力します（`%1$s` は該当するデバイス名）。

`/proc/fs/ext4` に `loopN` が見えるだけではこの詳細には該当しません。`/proc/fs/jbd2` に `sdc*` など loop 以外の項目しかない場合も成立しません。メインプロセスは通常 `/proc/fs` を見られないため、再確認はこのマウントビューを読める隔離サービスまたは zygote ドメインで行ってください。

</details>

<details><summary><b>kernelsu detected</b></summary>

**対策：**
マネージャーを[最新の CI](https://t.me/KernelSU_group/3234/497395)に更新

</details>

<details><summary><b>FolkPatch/APatch を発見</b></summary>

追記予定

</details>

<details><summary><b>APKey_Hide 系の隠蔽行為を発見</b></summary>

追記予定

</details>

<details><summary><b>Suspicious Surroundings</b></summary>

#### 検出方法

環境系の異常検査（`/data/local/tmp` のメタデータ、不審なプロセス／サービスなど）。

APatch を検出

APatch を更新し、KernelPatch 隠蔽モジュール（例：NoHello.kpm、序章「関連モジュール推薦」を参照）を読み込む。

</details>

<details><summary><b>seccomp フィルタが有効</b></summary>

このプロジェクトを使ってモジュールをビルドし書き込むことで解決https://github.com/longze777/UID-

</details>

<details><summary><b>一般アプリの NETLINK ポリシーが無効</b></summary>

— untrusted_app ドメインが `NETLINK_SOCK_DIAG` の dump 要求を送り、AF_UNIX diag の返答を受け取る（本来はポリシーで拒否されるべき）。

</details>

<details><summary><b>Netlink socket anomaly</b></summary>

`socket(AF_NETLINK)` が失敗する、または `send` が短書きになる。

</details>

<details><summary><b>Found LSPHook Framework</b></summary>

#### 検出方法

LSPosed / LSPatch などのフレームワークの実行痕跡を確認します。

LSPHook Framework を検出

一部の xp モジュールの改変によるもので、LSP モジュールをアンインストールして交換してもかまいません。

</details>

## 五、バイナリとメモリマップの整合性

判定基準は `maps` とディスク上のファイルの照合、ELF ヘッダ／セグメントの解析、JNI 関数テーブルのポインタの帰属です。

<details><summary><b>Malicious Hook</b></summary>

 実行セグメントのメモリ上 CRC がディスク上の同一セグメントの CRC と一致しない。

</details>

<details><summary><b>Critical libc inline hook</b></summary>

メモリマップが不完全（先頭 16 バイトを libc ファイルの同一オフセットのバイトと比較）

</details>

<details><summary><b>Evil Module</b></summary>

ポインタが libart.so のマップ内にない、または空

</details>

<details><summary><b>Evil Service</b></summary>

#### 検出方法

— ディレクトリ名、Binder fd、`/proc/net/unix` に lsposed/sui/sandhook/pumpcin などのマークが現れる（モジュールの残留）

lsp、shizuku および一部の xp モジュールの改変検出について。

#### 検出方法（4.6.2 実測による補足）

ネイティブ側の判定は四層ですが、**判定に効くのは一層目だけ**です：

1. **ディレクトリ名のスキャン**：`/dev/binderfs`、`/dev`、`/sys/fs/selinux`、`/proc/self/fd`、`/apex`、`/system/framework`、`/data/misc`、`/data/system`、`/data/local/tmp`、`/storage/emulated/0/`、`/data/` を走査し、キーワードが一致した時点で該当グループを点灯します：

- **Sui**：`shamiko`、`Shamiko`、`内核`、`调度`、`suius`、`suidaemon`、`ssssss`、`suidaem`（詳細のフィールド `Sui`）
- **SandHook**：`sandhook`、`SandHook`、`sandcore`（詳細のフィールド `SandHook`）
- **Pumpcin**：`pumpcin`、`Pumpcin`、`taiwan`、`Taiwan`（詳細のフィールド `Pumpcin` / `Taiwan`）
- **EDXposed**：`tricky`、`Tricky`（詳細のフィールド `EDXposed`）

2. **Binder の件数**：`/dev/binderfs` のディレクトリ項目が 3 を超えると Sui と判定します（どのサービスかは見ません）；
3. **タイミングのサンプリング**：`lsposed` / `sui` / `sandhook` / `pumpcin` の各名前について 100 回ずつ、`/dev/binderfs/<name>` の有無、`/proc/self/fd` での名前一致、`/proc/net/unix` での行一致に重み（100 / 50 / 30）を掛けて比率を算出します；
4. **集約**：1 のキーワードが一つでも一致（件数 > 0）すればヒットとして返します。3 の比率は判定に使われません。

実測で押さえておきたい三点：

- 3 の比率は計算されるだけで、しきい値と比較されません。したがって `/proc/net/unix` と `fd` の二経路は詳細の表示にしか影響せず、ヒットするかどうかには関与しません；
- 詳細の `LSPosed:` は常に `NO` です（このビットを立てる処理がどこにもありません）。LSPosed のヒットは実際には `tricky` → `EDXposed` の経路で出ます；
- 「`/dev/binderfs` の項目が 3 を超える」という条件が最も誤検出しやすいところです。通常の端末でも `binder-control` 以外に複数のノードがあり、4 個に達することは珍しくありません。切り分けでは、まず `Sui:` だけが `YES` になっていないかを確認し、そうならこの条件だけを疑ってください。

後片付け：`/data/local/tmp/` 配下の `sandhook*`、`pumpcin*`、`shamiko`、`suidaemon`、`suius` といったディレクトリ／ファイルはモジュール削除後の残留物です。削除して再起動後に再スキャンすれば多くの場合消えます（ここで判定しているのは「残留の物証」であり、「サービスが動作中か」ではありません）。

</details>

<details><summary><b>[Hook] Suspicious library injection</b></summary>

#### 検出方法

ライブラリ注入の痕跡（zygisk / riru / xposed でよくある特徴）を確認します。

(zygisk/riru/xposed)

HOOK を検出。要因が多すぎるため、ご自身で原因を切り分けてください。

</details>

<details><summary><b>[Hook] Native Bridge detected (emulator/cross-arch)</b></summary>

— `libnativebridge.so` の `NativeBridgeError()` が true を返す。

</details>

<details><summary><b>Zygisk detected</b></summary>

#### 検出方法

Zygisk の注入痕跡（匿名の実行可能マップ、プロセス環境、モジュールのエントリなど）を確認します。

Zygisk を検出。通常は magisk 標準搭載の zygisk が原因（オフにすれば解決）か、その他の原因です。

Zygisk 実装モジュールをアップグレード(http://github.com/Dr-TSNG/ZygiskNext)。

</details>

<details><summary><b>Zygisk detector(2)</b></summary>

— `[stack]` の末尾 1000 バイトに `MAGISK_INJ_1` マークが含まれる

</details>

<details><summary><b>LSPosed Detected（%1$d）</b></summary>

追記予定

</details>

<details><summary><b>メモリ異常</b></summary>

#### 検出方法

ページ常駐／ソフトダーティビット系のプローブ（`clear_refs`、`smaps`、`MADV_COLD`）で、隠された、または異常なマップを発見するために使います。

検出器のデータを消去してもなお残る場合は、Issues を作成してあなたのモジュールリストの情報と使用している xp モジュールを提供してください。時間のあるときに調べます。

</details>

<details><summary><b>Dirty Device(a)</b></summary>

#### 検出方法

`/storage/emulated/0/`（`/sdcard`）下で**名前に `sh` を含む**フォルダ／ファイル、およびチート関連のファイル／ドライバを検出します（一部のバージョンでは「キー差し替え行為」も組み合わせて判定します）。

#### 対策

この項目の意味は「端末上に**ゲームチート**関連のファイルが存在することを検出した」→ **自分で削除すれば済みます**；削除後に再起動して再テストしてください。

</details>

<details><summary><b>zygote check（%1$d）</b></summary>

あるパス下の ctime がサンプリング時刻より早い、`/mnt` 下の tmpfs ディレクトリが空でない、mountinfo の id に欠落がある（apex/art、`/data_mirror` など）をビット単位で報告
この項目には不安定性があります

</details>

## 六、SELinux ポリシー、AVC と監査チャネル

判定基準は selinuxfs の照会結果、status ページの読み値、avc 統計と logcat/auditd の記録の間の自己矛盾です。

<details><summary><b>Abnormal Environment(k)</b></summary>

最新の CI 版マネージャーに更新すると解決します。

</details>

<details><summary><b>SELinux Policy 検査時に不審な問題を検出 / ROOT 権限を検出</b></summary>

#### 検出方法

1. 本プロセス（本来 `app_zygote` ドメインにあるべき）の context を「キャリア」として、**センチネル context**（`…context_oracle_sentinel:s0` / `…_sentinel_file:s0`）で正制御／負制御／ファイル制御の 3 組の対照を組みます；

2. 照会は **raw selinuxfs 書き込み**（`/sys/fs/selinux/access` を直接操作し、libselinux を通さない）で行い、カーネルが書き戻す `avdSeqNo` を検証します；

3. `selinux_check_access` / `getfilecon` と raw の結果をクロスチェックし、**撹乱を加えてからもう一度比較**し、再現性（`Repeatability`）を確認します；

4. root 関連のルールが依然として live policy に受け入れられるかを直接探査します（`shell -> su` 変換、`magisk` / `ksu` / `apatch` ドメイン、`ksu_file` / `lsposed_file` / `magisk_file` の読み取りなど）。さらに KSU context の「ビット対／分割」の整合性を確認します。

#### よくある原因群

（ヒット時には詳細が提示されます）：`enforcing is not 1`、`deny_unknown is not 1`、`unexpected version`、`sequence/policyload unexpected`、`direct syscall and libc views disagree (PLT-hook residue)`。

#### 対策

- 検出方法の参考：[DirtySepolicy](https://github.com/LSPosed/DirtySepolicy)；
- 本項目の判定点は「アプリ zygote が `/sys/fs/selinux/access` にアクセスする権限を持っていること」で、root マネージャーまたはカーネル側で SELinux の改変を隠す必要があります：
  - **root 実装の標準機能（KernelSU 系 / APatch 系で利用可）**：最新バージョンにアップグレードし、「SELinux の改変を隠す」をオンにします（KSU 系はイメージの再パッチ、または**未アンロック（ジェイルブレイク）**をやり直してから再起動が必要）。
    - 対応カーネルバージョンの範囲：
      - APatch 系：4.19 以上；
      - KernelSU 系：ブランチによって対応範囲が完全には同じではなく、個別に判断が必要です。オリジナルの KernelSU を例にすると、GKI2 カーネルのみ対応しています。
  - **カーネルモジュール方式（KernelSU 系 / APatch 系 / Magisk 系で利用可）**：SELinux_Hook.kpm などの SELinux hook（カーネルモジュール；selinux_magisk_access_filter のリンクは序章「関連モジュール推薦」を参照）。
    - 説明：現在 2 種類のモジュールが利用可能です：オリジナルの selinux_hook（すなわち selinux_magisk_access_filter）と selinux_MAF_fork。[selinux_MAF_fork のリポジトリはこちら](https://github.com/741afb7/selinux_maf_fork)
    - 適用範囲：オリジナルの selinux_hook（すなわち selinux_magisk_access_filter）は KernelSU 系 / APatch 系のみ対応；selinux_MAF_fork は Magisk 系への適合に注力していますが、KernelSU 系 / APatch 系でも引き続き使用できます。Magisk 系は[このコード](https://github.com/topjohnwu/Magisk/commit/5a28d2fcfcd3245f726933d7fd0a6173ea484e32)を含んでいる必要があり、そうでないとこの方法は効きません。
    - 動作モード：KernelSU 系と Magisk 系は組み込み（embed）でないと有効になりません。APatch 系はインストールモードでも有効になります。
    - 対応カーネルバージョンの範囲と要件：
      - selinux_MAF_fork：4.19 以上および一部の 4.14 カーネル。より詳細な説明はリポジトリの README を参照してください。
      - selinux_magisk_access_filter：理論上の対応範囲は 4.9 以上ですが、4.9 と 4.14 のカーネルでの動作にはリスクがある可能性があります。
    - 特記事項：
      1. Magisk 系は KPM カーネルモジュールを標準ではサポートしないため、KPM サポートを追加インストールする必要があります：
         - [KPatch-Next-EXP](https://github.com/741afb7/KPatch-Next-Module-EXP)：OTA 更新機能を含まず、長期的な更新も予定していませんが、KPM インストールモードに対応しています；
         - [KPM-Manager](https://github.com/Yervant7/KPM-Manager)；
         - [KPatch-Next](https://github.com/KernelSU-Next/KPatch-Next-Module)：既に長期間更新が止まっており、KernelPatch の最新版とは大きく隔たっています。
      2. Build-in KernelPatch ではこの種のモジュールは使えません：カーネルソースに統合された KernelPatch の KPM 組み込みモードの実装はオリジナルの KernelPatch と異なるため、この種のモジュールは Build-in KernelPatch では有効になりません。
  - 現在のマネージャーが KernelSU 系 / APatch 系 / Magisk 系のいずれでもない場合は、上記 3 種のいずれかへの交換を検討できます。

*上記の方法は [741afb7 の上流 PR #45](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution/pull/45) から補足整理したものです；互換性の説明はこの貢献によるもので、当サイトが独自に実機検証したものではありません。*

関係：`SELinux 状態フィンガープリントが不審`、`SELinux 状態チャネルの不一致`、`端末が Root 権限を取得 / 異常モジュール` は同じ判定基準族（バージョンごとの異なる断面）に属し、**本文書では本項目に統合済み**です。


#### 検出方法（4.6.2 実測による補足）

核心は **AppZygote 内で raw selinuxfs を直接読み書きし、複数の読み取り結果を相互検証する** ことです。次のいずれかが異常ならこの項目に入ります：

- **対照群／ネガティブコントロール**：現在の `app_zygote` の context を源として、許可されるべき正の対照、拒否されるべき負の対照、ファイル対照を設定します。いずれかの群で結果が想定と逆なら異常です；
- **status ページのフィールド**：`/sys/fs/selinux/status` の `version`、`enforcing`、`sequence`、`policyload` などを読みます。値やその組み合わせが想定に合わない（例：`enforcing` が 1 でない、`sequence`/`policyload` が飛ぶ）場合は異常です；
- **access seqno**：`/sys/fs/selinux/access` に直接クエリを書き込み、カーネルが返す `avdSeqNo`/`seqno` を検証します。seqno が進まない、書き戻しが一致しない、同じクエリで結果が変わる、のいずれかなら異常です；
- **無効な context の整合性**：存在しない source/target/class/perm で負のクエリを行うと、正常なら `EINVAL` が返ります。無効な context が通常の context として扱われ allow/deny の判断が出る場合、または raw selinuxfs と libselinux の結果が食い違う場合は異常です。

判定は `access` / `status` の読み取りの整合性にあり、`/sys/fs/selinux/policy` ファイルの内容を読むことではありません。メインプロセスは通常 selinuxfs を読めないため、再確認は `app_zygote` / zygote ドメインで行ってください。

</details>

<details><summary><b>ROOT プロセス</b></summary>

#### 検出方法

AVC 監査ログ（`logcat -b events` 内の `auditd` 記録）と `/proc/*/attr/current` をクロスさせ、root 関連の context で動作しているプロセスを探し出します。

Zygote 環境を検出？

監査ログの脆弱性を通じて読み取り (avc)

カーネルレベルの隠蔽機能（SusFS など）や監査ログパッチ系のカーネル手法を使用できます

Android セキュリティ更新 2025/09/01 で修正済み（不正確だが結果はそうなっている）

</details>

<details><summary><b>ROOT 権限を持つプロセス</b></summary>

— logcat の `avc: denied` に `su`/`magisk`/`proc_modules` ドメインが出現
KSU のホットリブート後に出現（もう一度再起動して解決を試す
ジェイルブレイク端末でよく見られる
ジェイルブレイクモードの使用は推奨しないため、解決策は提供しません

</details>

<details><summary><b>特権アプリに偽装した root プロセス</b></summary>

`avc: denied` 内で app ドメインのアクセスが異常

</details>

<details><summary><b>Current-app-root-domain-trace</b></summary>

#### 検出方法

`untrusted_app` の身分で `/proc` の PID を走査し、`attr/current`、`cmdline`、`comm` を 1 つずつ読み（正常ならすべて SELinux に拒否されるはず）、その後 `auditd` / `logcat` で AVC denied の記録を探し、`tcontext=u:r:ksu:s0` などが現れればヒット（プローブ `proc_pid_avc_context_leak`）。

`untrusted_app` の身分で `/proc` の PID を走査し、`attr/current`、`cmdline`、`comm` の読み取りを 1 つずつ試み（正常ならすべて SELinux に拒否されるはず）、その後 `auditd`/`logcat` の AVC denied 記録を探し、`tcontext=u:r:ksu:s0` などが現れればヒット。
**KSU · LKM**：対応バージョンの PathMask を書き込み「隔離防護（procguard）」をオンにする、または監査ログパッチ系のカーネル手法を書き込む（他の検出項目が漏れる可能性があります）；
**KSU · GKI**：マネージャーの設定で「AVC ログ偽装」をオンにする；
一時的な方法：従来の su サポートを無効にし、一度検出を通してから再度オンにする。

</details>

<details><summary><b>異常モジュールを発見</b></summary>

#### 検出方法

温度制御／スケジューリング／最適化系モジュールの特徴シグネチャに一致します。最も多いのは **Encore Tweaks** ファミリー：管理端アプリ、`/system/bin/encore_profiler`、`/data/encore/default_cpu_gov`、`/data/encore/custom_default_cpu_gov`、`/data/local/tmp/encore_logo.png`；ヒット時はそれぞれ `Encore 管理端がインストール済み / Encore Tweaks モジュール / Encore Tweaks の可能性` などの文案で報告されます。

#### 対策

関連モジュールを切り分けてアンインストールします（この類の項目は確率的ヒットが多いので、何度か再起動してから再テストしてかまいません）。

</details>

<details><summary><b>春秋を改変するモジュールが存在</b></summary>

#### 検出方法

本プロセスが改変された痕跡（ポリシー／注入／マウント）を期待値と比較します。

IsolPolicy モジュールを使うと出現します。スコープをオフにするかモジュールをアンインストールして解決します。

モジュールだけではなく、例えば旧版 ksu で SELinux 改変の隠蔽を有効にした場合も該当します。関連する root マネージャーの最新 CI に追従してこの問題を解決してください。

</details>

## 七、Keystore / KeyMint / TEE

判定基準は KeyGen／証明書チェーンの解析、KeyMint の戻り値とエラーコード、canary の読み戻し、LRU と SOTER の挙動から得られます。

<details><summary><b>AOSP 鍵</b></summary>

#### 検出方法

keybox が AOSP のテストルート（ベンダー／Google の正式ルートではない）で署名されている。

`/data/adb/tricky_store/` ディレクトリ下の `keybox.xml` ファイルを交換します。

TS プラグインを書き込み、再起動後にモジュールの webUI 画面を開いて鍵を設定する方法もあります。

</details>

<details><summary><b>Boot Hash の不一致</b></summary>

#### 検出方法

boot / vbmeta の hash（例：`ro.boot.vbmeta.digest`）をベースライン値と比較します。

boot イメージの Hash が一致しない。

通常**真アンロック端末**では hash が 0000 になります。[Native detector](https://t.me/rootdetector/49) で正しい hash を取得したうえでキーモジュールを使い、TS プラグインで hash を設定して解決します。
鍵認証をオンにし、`VerifiedBootHash` の値を取得して TS プラグインで書き込みます。

</details>

<details><summary><b>証明書が失効済み(CRL)</b></summary>

#### 検出方法

証明書のシリアル番号が失効リストに一致（ローカルの静的ライブラリまたはオンライン照会）。

`/data/adb/tricky_store/` ディレクトリ下の `keybox.xml` ファイルを交換

</details>

<details><summary><b>鍵の改ざん / 証明書チェーンの改ざん(x)</b></summary>

#### 検出方法

- 鍵の改ざん：鍵／証明書チェーンの属性整合性判定が通らず、ヒット時にはグループが提示されます；
- 証明書チェーンの改ざん(x)：Java 層でシステムプロパティ `ro.secureboot.lockstate` を読み取り（このプロパティは `ro.lenovo.series`、`ro.lewa.version`、`ro.meizu.product.model`、`ro.miui.ui.version.name`、`ro.vivo.os.build.display.id` などのベンダー ROM プロパティと同じテーブルに入っています）、`unlocked` が取れればヒット。

#### グループ説明

- **128**：最も多い。キーモジュールが OnePlus / Qualcomm 端末でデフォルトの「証明書チェーン生成モード」を使うと出やすい；
- その他のグループ（例：q、b）の原因は今のところ非公開。

#### 対策

- 鍵の改ざん：キーモジュールを交換／更新し、「モジュールの正しい設定」に従って設定を完了する（target リスト、セキュリティパッチの日付、boot hash）；
- 証明書チェーンの改ざん(x)：`su -c '/data/adb/ksud' resetprop ro.secureboot.lockstate locked`（Magisk は `resetprop`）。

関係：`鍵証明が未完了またはチェーン不一致` と同様に証明書チェーン／鍵整合性族に属します。

---

</details>

<details><summary><b>TEE 破損</b></summary>

#### 検出方法

TEE 側の鍵／証明書チェーンが不完全、または使用不能。

キーモジュールで解決し、TS プラグインを併用します。

書き込み後は再起動し、起動後にモジュールの webUI を開いて設定してください。

TEE が破損した端末では証明書チェーン生成モードを使用してください。
`/data/adb/tricky_store/target.txt` 内で本検出器のパッケージ名に `!` を付け（強制処理を意味します）、スクリプトで一括書き込みもできます：
```
su
TRICKY_DATA="/data/adb/tricky_store"
{ echo "com.google.android.gms!"; echo "com.android.vending!"; pm list packages -3 | sed 's/^package://;s/$/!/'; } > "$TRICKY_DATA/target.txt"
```

</details>

<details><summary><b>TEE 環境が信頼できない</b></summary>

#### 検出方法

Tencent Soter サービスプログラムの存在 + そのサービス属性の状態を確認し、両者で Soter key がブロックされているかをクロス検証します（四象限判定、下記参照）。

Tencent の [SoterService](https://github.com/Tencent/soter) 由来
役割：WeChat の指紋決済など。

ファイルを確認して Soter サービスプログラムが存在するか、およびそのサービス点の属性状態を判断することで、Soter key がブロックされている状況の有無をクロス検証します。
1. サービス点の属性状態が異常 + Soter サービスプログラムが存在 -> Soter がブロックされている（異常）

2. サービス点の属性状態が異常 + Soter サービスプログラムが存在しない -> この端末は元々 Soter サービスに対応していない（正常）

3. サービス点の属性状態が正常 + Soter サービスプログラムが存在 -> この端末は Soter に対応（正常）

4. サービス点の属性状態が正常 + Soter サービスプログラムが存在しない -> ありえない

#### 対策

- SusFS または [PathMask](https://github.com/Andrea-lyz/LKM-PathMask) で関連するサービスパスを隠し、さらに HMA で検出器に対して "com.tencent.soter.soterserver" システムプログラムを隠して、解決を試みてください

*注意*：PathMask は環境隠蔽に特化したものではないため、慎重に使用してください。

*原理*：現時点では技術的に Soter サービスを模擬することはできませんが、Soter 関連のファイルを隠して第 2 の状況を偽装することはできます。

</details>

<details><summary><b>TEE 偽造</b></summary>

#### 検出方法

証明書チェーン／鍵の属性が TEE 挙動の模擬を示している。

キーモジュールで解決（証明書チェーン生成モード）。

</details>

<details><summary><b>TEE 偽造(2)</b></summary>

#### 検出方法

Keystore2 のリフレクションで `SIGN + ATTEST_KEY` の用途を同時に持つ鍵を作成します：正常な端末はこの混合用途を拒否するはずです（例：`-3`）；鍵が正常に署名できるのに、「challenge あり／challenge なし」の 2 組の子証明書発行がどちらも失敗する場合（例：`-49`）、TEE 偽造(2) と判定されます。

まず通常の署名、純粋な ATTEST_KEY 鍵での子証明書発行がどちらも正常であることを確認します。
Keystore2 で SIGN + ATTEST_KEY の用途を同時に持つ鍵を作成します。
それが正常に署名できても、チャレンジあり・なしの 2 組のテストで子証明書の発行がどちらも -49 を返すなら、「TEE 偽造(2)」が報告されます。
作成時に混合用途を正常に拒否する（正常機の -3 など）、または両方の能力が正常であれば、報告されません。

#### 対策

キーモジュールを交換／更新し（序章「関連モジュール推薦」と「モジュールの正しい設定」を参照）、設定後に再起動して再テストします。

</details>

<details><summary><b>Tee 偽造3</b></summary>

**検出方法：**
TEE が破損した端末で Tricky-Store モジュールを使って TEE 挙動を模擬していることを検知

**対策：**
モジュールの更新による修復を待つか、OhMyKeymint モジュールを併用して解決を試みてください

</details>

<details><summary><b>Tee 偽造(2-c)</b></summary>

**検出方法：**
TEE が破損した端末で TEESimulator/RS モジュールを使って TEE 挙動を模擬していることを検知

**対策：**
モジュールの更新による修復を待つか、OhMyKeymint モジュールを併用して解決を試みてください

</details>

<details><summary><b>TEESimulator を発見</b></summary>

AES 復号のタイミング差
より良い TEE 模擬モジュールに交換するか、モジュールの更新を待つ

</details>

<details><summary><b>TrickyStore Hook/2</b></summary>

#### 検出方法

Keystore が返す証明書チェーン／鍵の属性を実機の TEE 特徴と比較します（サイドチャネル方式を含み、不安定）。

サイドチャネル（不安定）で、開き直すと消えることがある
キーモジュールを交換（例：TEESimulator-RS / OhMyKeymint）

</details>

<details><summary><b>FOUND oh my keymint</b></summary>

混合用途の鍵を 2 回生成して Keystore2 に返す
解決策：モジュールを更新

</details>

<details><summary><b>Tampered Attestation Key(X)（16 / 31 を含む）</b></summary>

#### 検出方法

鍵証明の証明書チェーンに対して 20+ 種類のタグ整合性検証を行います。例えば：リーフ証明書の `KeyUsage` と拡張の `KeyPurpose` が矛盾しないか、リーフ証明書の署名アルゴリズムと発行鍵のアルゴリズムが一致するか、証明書内のセキュリティパッチタグとシステムプロパティが一致するか、challenge がないのに `APPLICATION_ID` が付いているか、`USER_ID` が `teeEnforced` に現れているか、ベンダーのプレースホルダ tag でも発行に成功してしまうか、など；ヒット時には具体的なタグ番号が提示されます。

#### よくあるタグ番号

- 15：HanAttest チェーンの不一致（TeeSim の定数とは同源ではないが、同じく mask 内にある）
- 16：HanAttest チェーン不一致族（多くは誤検出）
- 18：ベンダーのプレースホルダ KeyMint tag でも鍵の出力に成功
- 23：リーフ証明書の KeyUsage と拡張内 KeyPurpose の矛盾
- 24：Binder の超長 alias / 大トランザクションのプローブ異常
- 25：リーフ証明書の SigAlg と発行鍵アルゴリズムが不一致
- 26：証明書の patch タグとシステムプロパティの不一致（下記スクリプト参照）
- 27：USER_ID が teeEnforced に出現
- 29：challenge がないのに APPLICATION_ID がある
- 30：機密デバイス識別子系の attest が拒否されない（例：SERIAL）
- 31：セキュリティパッチの日付異常（国内ベンダーは一律 YYYY-MM-01；Lenovo / Nubia は 05 の日付に更新する；pixel / Samsung は除外済み）

#### 対策

- **26**：[このスクリプトを実行](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution/blob/main/File/Tampered%20Attestation%20Key(26)Pass.sh)して `/data/adb/tricky_store/security_patch.txt` を書き込みます；
- **Xiaomi / Redmi 注意**：2026-03 前後に更新されたシステムは、ビルド時刻とセキュリティパッチ時刻がもともと一致していません。**root の有無にかかわらず（26）が報告されます → 無視してかまいません**；改造版のキーモジュール、ワンクリック隠蔽モジュール、一部の機種偽装モジュールでも発生するため、オリジナルに戻すかアンインストールしてください；
- **16 / 31**：ほとんどが純粋な誤検出（偽リロック、未 root でも確率的にヒットしうる）→ 再テストするか、そのまま無視してください。

</details>

<details><summary><b>TrustedCert 証明書の改ざん</b></summary>

TrustedCertificateEntry の読み戻しバイトが元のバイトと等しくない

</details>

<details><summary><b>TrickyStore／類似モジュールを発見</b></summary>

#### 検出方法

証明書チェーンがモジュール生成（合成チェーン）で、実際の TEE チェーンの特徴と一致しない。

**試行1**：キーモジュールを交換（例：TEESimulator-RS / OhMyKeymint）

**試行2**：`/data/adb/tricky_store/security_patch.txt` ファイルを削除する

</details>

<details><summary><b>鍵証明が未完了またはチェーン不一致</b></summary>

#### 検出方法

鍵証明の証明書チェーンが不完全、または期待されるチェーンと一致しない。

キーモジュールを使って設定したうえで解決を試みてください

</details>

## 八、パッケージ管理、アプリ可視性とインストール痕跡

判定基準は `pm`/PackageManager のリスト、`/sdcard/Android/data` ディレクトリ、ポートの可視性と固定パスから得られます。

<details><summary><b>ROOT マネージャーを発見</b></summary>

#### 検出方法

native メソッド `runRootManagerIntentChecks` —— Intent / パッケージ可視性（`<queries>`）で root マネージャーがインストールされているか、応答できるかを探査します（新しい manifest で追加された `me.bmax.apatch.magica.LAUNCH`、KSU の `magica.LAUNCH`、`ksu://` などの項目に対応）。

#### 対策

**アプリ隠蔽モジュール**を使って root マネージャーを検出器から隠せば解決します（「関連モジュール推薦」と「モジュールの正しい設定」を参照）。

関係：`Found ksu／未アンロック端末`、`Suspicious Surroundings`、`SU binary detected`、`SELinux Policy 検査時に不審な問題を検出 / ROOT 権限を検出` と同様に「ROOT 痕跡」類に属し、同時にヒットすることがあります。

---

</details>

<details><summary><b>リスクアプリ / Risk apps‘パッケージ名’</b></summary>

#### 検出方法

`/storage/emulated/0/Android/data/` 下のディレクトリ名を読み取ってインストール済みパッケージ名を取得し（通常のアプリは通常この権限を持ちません）、回避可能な場合は **Unicode ゼロ幅文字**を利用して読み取り制限を回避し（固定的な手段ではありません）、リスクリストと照合します（リストは付録 A を参照）。

#### 対策

- 有効な組み合わせ：**アプリ隠蔽モジュールのブラックリストモード + ゼロ幅読み取り修復手法**（[FuseFixer](https://github.com/5ec1cff/FuseFixer)）；一部の機種ではスコープを有効にすると起動時に固まることがあり、その場合はセーフモードでオフにすれば済みます；
- 春秋のこの項目だけを通したい場合：アプリ隠蔽モジュールで春秋検出に対して「zygote 権限を制限」をオンにし、`INET_GID` 以外をすべてオンにします；
- この類の判定手段が不明な項目は、アプリ隠蔽モジュールで不審なアプリを検出器から隠す方法でも対応できます。


#### 検出方法（4.6.2 実測による補足）

4.6.2 は内蔵のリスクパッケージ表を二つの経路で同時に照合します：

- `pm list packages`：パッケージマネージャーが返すインストール済みパッケージ名を解析します；
- `/sdcard/Android/data/<パッケージ名>`：外部データディレクトリ名を列挙し、`<パッケージ名>` をリスク表と照合します。ディレクトリ名にゼロ幅文字（U+200B / U+200C / U+200D / U+FEFF など）が挟まれていても正規化されるため、ゼロ幅文字での回避はもう効きません。

`pm hide <パッケージ名>` の後にそのパッケージがリスク一覧から消えるのは、**パッケージマネージャー経路** が効いていることの証明にすぎず、ディレクトリ経路が存在しない根拠にはなりません。逆に `/sdcard/Android/data/<パッケージ名>` を削除しても抑えられるのは **ディレクトリ経路** だけで、`pm list packages` では引き続きヒットします。

</details>

<details><summary><b>アプリリストの隠蔽</b></summary>

 ディレクトリ名がリスク表に一致するが `pm` に対応するパッケージが列挙されない（リスクアプリが存在しない場合にのみ表示）

</details>

<details><summary><b>HMA が存在する可能性</b></summary>

#### 検出方法

HMA（アプリリストの隠蔽）関連のサービス／パッケージの特徴が存在するのに、検出器自身からは対応するアプリが見えないかを確認します。

旧版が Scene_Hide-eBPF モジュールの挙動を使用しているのを検出した疑い（scene アプリの存在は検出できないが、関連サービスは検出される）

[ブランチプロジェクト／プルして更新しモジュールを再ビルドして書き込む／Releases からダウンロード](https://github.com/Andrea-lyz/Scene-Port-Hider-by-eBPF)
旧版／クラック版／非公式の Scene の場合は [Scene-Port-Hider-by-eBPF](https://github.com/Andrea-lyz/Scene-Port-Hider-by-eBPF) を参照；公式版の Scene は最新に更新すれば済みます。
（注：HMA（アプリリストの隠蔽）と Scene は用途の異なる 2 つのモジュールで、本項目は「Scene のポート占有を検出」と同時に出現することがあり、それぞれ対処してください。）

</details>

<details><summary><b>SU binary detected</b></summary>

#### 検出方法

よくあるパスで su / 類似のバイナリファイルを検出します。

SU バイナリファイルを検出（ROOT を検出）
iQoo/Vivo ユーザー注意：`/apex/com.android.virt/bin/su` がヒットします → このファイルを移動するか、実行ビットを外してください。
一般的な原則：**春秋検出に root 権限を与えないでください**。

</details>

<details><summary><b>Mount Detector(14)</b></summary>

追記予定

</details>

<details><summary><b>アプリリストの隠蔽が有効 2</b></summary>

**対策：**
hma/hma_oss を最新版に更新
[HMA 更新チャネル](https://t.me/HideMyApplist/175)
[HMA_OSS 更新チャネル](https://t.me/buggychat/121613)
このモジュールを書き込んで解決[UIDFilter](https://t.me/Suxiaomingpd/402)
もしアプリリストの隠蔽が原因なら、春秋検出に対する「インストール元の偽装」をオフにしてください
</details>

<details><summary><b>HMA のスタック処理を発見</b></summary>

**対策：**
[HMA 更新チャネル](https://t.me/HideMyApplist/175)
[HMA_OSS 更新チャネル](https://t.me/buggychat/121613)
</details>

## 九、タイミング、ページ常駐と差分サイドチャネル

判定基準は同一操作を異なる媒体で行ったときの所要時間の比、ページの referenced／常駐状態の変化であり、単一の戻り値ではありません。

<details><summary><b>Abnormal Environment</b></summary>

#### 検出方法

（リポジトリ内の [KSU/APatch サイドチャネル説明](/File/Doc/ksu_kp_sidechannel_zh.md) と同一）：
- **APatch / KernelPatch**：①**「遅延割り当てページ」探査**——「遅延割り当て」（仮想アドレスだけを占め、物理ページはまだマップされていない）のページアドレスを superkey の所在アドレスとして認証要求を発行すると、KernelPatch がそのアドレスを参照解除する際にそのページを**実際にマップ／読み込み**する。検出器はその後そのページがマップされたかどうかを確認すれば、KernelPatch の存在を判定できます；②**認証時延探査**——あらかじめ「範囲内 cmd」と「範囲外 cmd」を用意し、それぞれ認証を発行、複数回測定して合計を取り比を安定させ、両者の所要時間の比が約 2 を超えれば存在と判定します。
  画面上この項目の出力は**ページ単位の kB 対照**（例：`No-read control: 0→0 kB, expected` / `Read control: 0→4 kB, expected` / `Target call: 0→4 kB, unexpected read`）と複数ラウンドの一致性（`Consistency: n/n`）で、本質は「そのページが実際にマップ／読み取りされたか」の判定です。
- **KernelSU**：フレームワークが Kprobe で `newfstatat` / `faccessat` を hook するため、両者の所要時間が顕著に長くなり、`statx` は影響を受けません；複数回呼び出して合計所要時間の比を取り、`newfstatat : statx > 1.2` なら KernelSU の存在を判定します。
- これが、この種のカーネルレベル隠蔽 KPM が「cmd の判断より前に認証を拒否する」必要がある理由でもあります——superkey の読み取り／検証の経路に入らなければ、2 種の探査が同時に無効になります。
- 注意：別に `APatch の認証キーを発見` という項目があり、こちらは「カーネルがその syscall 経路でユーザー引数ページを余分に読んだか」を測るもので、**除外リストを追加しても効きません**（読み取りがインターセプト点より前／外で起きるため）。詳細はその項目を参照。

KSU/APatch を検出（サイドチャネル検出）

検出原理は[このドキュメント](/File/Doc/ksu_kp_sidechannel_zh.md)を参照

#### 対策

**対策（KernelSU 系）**：KernelSU マネージャーを更新して再パッチ（LKM 動作モード）するか、再統合（GKI および Non-GKI 動作モード）してください。

**対策（APatch 系）**：
1. **NoHello.kpm** を組み込み／読み込み（モジュールのリンクは序章「関連モジュール推薦」を参照）、検出器を除外リストに追加します —— この KPM は KernelPatch が `cmd` の値を判断する前に、認証要求を発行したアプリが除外リスト内かどうかを先に判断でき、そうであれば認証を禁止します。

2. 将来のバージョンの APatch は署名ベースの認証方法を導入し、署名に適合しないのに認証を発行したアプリには認証要求を直接拒否します。現在は完全には実装されておらず、もうしばらく待つ必要があります。

**対策（KPatch-Next）**：KPatch-Next ドライバを 0.13.5-2 に更新してください。

原理：旧版 KPatch-Next は KernelPatch の認証方式を完全に継承していたため、APatch で有効なサイドチャネル検出手法は旧版 KPatch-Next でも同様に有効でした；しかし最新版 KPatch-Next はユーザー空間の kpatch-android コンポーネントの uid を判断して認証を実装するため、サイドチャネル検出では検出されなくなりました。
コミュニティの実測：この項目は**不安定で、確率的に出現**し、同じバージョンのマネージャーでも端末によって出る／出ないが分かれることがあります（**マネージャーのダウングレード**を試せます）；APatch で除外リストを有効にした場合にも出やすいです。

</details>

<details><summary><b>APatch の認証キーを発見</b></summary>

#### 検出方法

「**システムコールの引数ページが余分に読み取られた**」を判定基準とするサイドチャネル。検出器は対象呼び出しの引数／バッファを監視対象のユーザーページ上に置き、呼び出しの前後でそのページがカーネルに読み取られたページ数（kB）を測定します：
- `No-read control`：「カーネルが意味論上そのページを読むべきでない」呼び出し → `0→0 kB` を期待；
- `Read control`：「カーネルがそのページを読むべき」呼び出し → `0→4 kB` を期待；
- `Target call`：対象呼び出し → `0→4 kB, unexpected read` が現れれば、カーネルがその syscall 経路で**ユーザーメモリを余分に 1 回読んだ**ことを示し、その経路がカーネルパッチ（KernelPatch / APatch の認証経路）で追加処理されていることになります。

この項目は同時に `Argument layouts`（カーネルがシステムコール引数を読むレジスタレイアウトの探査）、複数ラウンドの一致性 `Consistency: n/n`、`Page size` と `Probe duration`（秒単位、サンプリングが重い）も出力します。

**`Abnormal Environment` との関係**：両者は同じ「認証経路」サイドチャネルを対象としています——リポジトリ内の [KSU/APatch サイドチャネル説明](/File/Doc/ksu_kp_sidechannel_zh.md) が述べているのは「遅延割り当てページがマップされたか」と「認証時延の比」という 2 つの尺度です；本項目は**ページ読み取り量**で対照を取る実装で、同じ発想の異なる変種であり、互いに裏付けられます。

#### 対策

新版 KernelPatch は既に認証経路を調整しており、旧版の「上流の修復を待つしかない」という説明はすべてのバージョンには当てはまりません：

- **APatch を更新**：この改動を統合済みの新版 [APatch](https://github.com/bmax121/APatch) を使用します。鍵となる条件は**実際に動作している KernelPatch が新しいロジックを含み、かつパッチ済みイメージに SuperKey がプリセットされていない**ことです；新版マネージャーの APK をインストールしただけでは、カーネルパッチが更新されたことにはなりません。該当バージョンの公式アップグレード手順に従ってカーネルパッチを更新し再起動してから、再テストしてください。
- **[Aster](https://github.com/LyraVoid/Aster) も検討できます**：FolkPatch の作者である有希（Matsuzaka Yuki）が開発した、APatch の能力チェーンに基づくマネージャーです。プロジェクトは現代的な Miuix インターフェースを採用しており、プロジェクトの紹介と作者のフィードバックによれば、その方向性は改動を控えめにし安定性を優先するものです。この方向を試したいユーザーはリポジトリから情報を得て適合バージョンを入手できます。これを使う場合も、動作中の KernelPatch と SuperKey 非プリセットの条件を確認する必要があり、APK を差し替えるだけでは修復完了とは見なせません。
- **バージョンの注意**：メンテナーから提供されたバージョンのフィードバックによると、FolkPatch **115032** はこの改動を含む KernelPatch にまだ切り替えていないため、本項目にヒットする可能性が残ります；これは以降の FolkPatch バージョンについての結論ではありません。

新版は `has_preset_superkey()` が成立したときにのみ先頭引数を読み取り `auth_superkey()` を実行します。SuperKey がプリセットされていない場合はこの読み取りをスキップします：信頼されたマネージャー UID は完全な認可を得て、既に認可された一般 UID は信頼された呼び出し元としてのみ標識され、制限付き操作にはさらに認可が必要です。したがって、**新ロジック + SuperKey 非プリセット**であれば、本項目が対象とするこの一路の余分なページ読み取り挙動を解消できます；もし依然として SuperKey がプリセットされていれば、関連する読み取り経路は残ります。これは SuperKey を削除したことにはならず、他の検出項目を通過することも保証しません。

[ソースの根拠](https://github.com/bmax121/KernelPatch/blob/997b687f19d150642d56a5c4a49dc06143d33422/kernel/patch/common/supercall.c#L395-L434)。APatch の「最新バージョン」は正式 Release、CI ビルドおよびその内蔵 KernelPatch を区別する必要があります：バージョン名だけで改動が含まれていると認定することはできません。マネージャーを交換したりカーネルパッチを更新したりする前に、元の起動イメージと使用可能な復旧手段を保持してください；本説明は単一の検出結果のために盲目的に Root 手法を交換することを求めるものではありません。

#### 補足

この項目は英語インターフェースでは現在**対応する英語タイトルがありません**（中国語のみ表示）。

</details>

<details><summary><b>Miscellaneous Check(12)</b></summary>

#### 検出方法

`smaps` のページ常駐（`Referenced`）を `MADV_COLD` / `clear_refs` と組み合わせてヒューリスティックスキャンを行い、隠されたマップや Zygisk 類の実装を探査します；現在の実装には問題があり、失効したり誤検出したりする可能性があります。

smaps のスキャンによるヒューリスティックで Zygisk 実装（特に Zygisk 実装モジュール）を探査しますが、現在の実装方式に問題があり、検出が失効しています。

検出方法が修復または削除されるまでは、この項目を無視してください。

</details>

## 十、ローカルサービスとターミナル形態

判定基準はローカルポートの占有、システムサービスの照会と tty の形態です。

<details><summary><b>Scene のポート占有を検出</b></summary>

#### 検出方法

Scene が使用するローカルポート／サービスがリッスンしているかを確認します。

この[プロジェクト](https://github.com/Andrea-lyz/Scene-Port-Hider-by-eBPF)を参照して解決を試みてください。

この検出項目を無視するか、scene のアクセシビリティ権限をオフにするか、scene を 9.3.1 以上に更新してください。

</details>

<details><summary><b>Thanox service detected</b></summary>

#### 検出方法

Thanox 関連のサービスを確認します。

Thanox サービスを検出。

この xp モジュールで隠せます：[hideThanox](https://t.me/Suxiaomingpd/125)。

</details>

<details><summary><b>ターミナル環境に疑義</b></summary>

#### 検出方法

pty（端末エミュレーション）の痕跡が存在するか確認します。

Pty を検出。

</details>

## 附：上記の判定基準に含まれない項目

<details><summary><b>Something wrong</b></summary>

#### 検出方法

内部異常／未分類のヒット。

不明

</details>

<details><summary><b>環境に疑義1（実験的検出）</b></summary>

#### 検出方法

実験的な環境整合性判定（コミュニティのフィードバック：アプリ隠蔽モジュール のブラックリストモード + 「入力方法」プリセットをチェックした場合に出現）。

アプリ隠蔽モジュール で検出器に対してブラックリストモードの隠蔽を有効にした後、設定プリセットの「入力方法」オプションをチェックすると、この検出項目が出現する？

</details>

<details><summary><b>無効な偽造情報(1)</b></summary>

#### 検出方法

Widevine（`MediaDrm`）が `securityLevel = L1` を報告し、`openSession()` が `NotProvisionedException` を投げ、かつ `getProvisionRequest().getData()` が長さ **0** のデータを返したときにヒットします。

説明：**端末が L3 と報告している場合、この検出点は直接スキップされます**（`securityLevel = L1` のときのみ以降の判定を続行します）。

#### 症状

端末は Widevine L1 を表示している（DRM Info と検出器の「端末情報」のいずれも L1 を表示）のに、本項目はなお「L1 と一致しない」と判定します。この項目は画面上で**詳細を展開しません**（摘要型の項目です）。

**ステップ 1：まず誤検出かどうかを判断する**
1. **L1 でなければ復号できない**コンテンツ（Netflix / Disney+ / Prime などの HD / 1080p+）を再生します：
   - HD / 1080p+ で正常に再生できる ⇒ L1 自体は正常で、本項目は**おそらく誤検出**です（Xiaomi 端末、**未アンロックの純正端末**でも安定してヒットすることが知られています）。まずは無視してバージョン更新を待ってかまいません；
   - SD しか再生できない ⇒ ステップ 2 へ進みます。

2. 「L1 状態を偽装する」モジュールを切り分けます：キーモジュールの target リスト、`keybox.xml`、セキュリティパッチの同期、および各種 PIF／プロパティ偽装モジュール；項目ごとにオフにして**再起動**し再テストします。

3. 「リモート RKP キー（RKPConfig）」は最後にだけ検討します：本機が既に RKP（リモートキー配信）であれば通常は無効で、現在 Xiaomi 機種では一般に無効です。

⚠️ **安全上の注意**：RKPConfig 類のアプリは端末から Google に RKP キーの配信を要求させ、**端末のキー供給／認証状態を変化させます**；インストール前に出所の信頼性と取り消し可能性を確認してください。
コミュニティ実測の補足：**偽リロック／未アンロック／root が全くない機器でも確率的にヒットします**ので、そのまま無視してかまいません；試す場合でも、まず上記の「ステップ 1」で L1 が本当に使えるかを判断することを推奨します。

</details>

<details><summary><b>Miscellaneous Check(4/5/6/7/8/9)</b></summary>

#### 検出方法

エミュレータ／仮想マシン、機種偽装行為、サードパーティおよび移植 ROM などの一群の検出；一部の機種（例：海外向けの Poco / Samsung）では誤検出があります。

エミュレータ・仮想マシンに関する検出／機種偽装行為の検出／サードパーティ & 移植 ROM に関するもの。

海外向け Poco／Samsung での誤検出状況（修復待ち）。
コミュニティのフィードバック：海外機種の Poco / Samsung で誤検出がある；一部の端末で Scene を使っても報告される。
機種偽装モジュールをアンインストールしてもなお報告される場合は、多くはモジュールの残留／行為の不可逆性によるものです。

</details>

---

## 付録

<details><summary><b>付録 A：リスク / ブラックリスト パッケージ名（85 個）</b></summary>

コミュニティの実測ヒットを集計して整理したもので、バージョンによって変化します。

- `cn.android.x`
- `cn.aodlyric.xiaowine`
- `cn.geektang.privacyspace`
- `cn.kwaiching.hook`
- `cn.myflv.monitor.noactive`
- `cn.myflv.noactive`
- `com.apocalua.run`
- `com.byyoung.setting`
- `com.coderstory.toolkit`
- `com.cshlolss.vipkill`
- `com.ddm.qute`
- `com.demo.serendipity`
- `com.didjdk.adbhelper`
- `com.dna.tools`
- `com.example.ourom`
- `com.fankes.enforcehighrefreshrate`
- `com.fankes.tsbattery`
- `com.fkzhang.wechatxposed`
- `com.fuck.android.rimet`
- `com.github.tianma8023.xposed.smscode`
- `com.hchen.appretention`
- `com.hchen.switchfreeform`
- `com.houvven.impad`
- `com.kooritea.fcmfix`
- `com.lerist.fakelocation`
- `com.luckyzyx.luckytool`
- `com.modify.installer`
- `com.nnnen.plusne`
- `com.omarea.vtools`
- `com.padi.hook.hookqq`
- `com.qq.qcxm`
- `com.rifsxd.ksunext`
- `com.rkg.IAMRKG`
- `com.sevtinge.hyperceiler`
- `com.shatyuka.zhiliao`
- `com.silverlab.app.deviceidchanger.free`
- `com.sukisu.ultra`
- `com.suqi8.oshin`
- `com.syyf.quickpay`
- `com.tencent.JYNB`
- `com.tencent.jingshi`
- `com.termux`
- `com.tsng.hidemyapplist`
- `com.tsng.pzyhrx.hma`
- `com.twifucker.hachidori`
- `com.wei.vip`
- `com.wn.app.np`
- `com.xayah.databackup.foss`
- `com.yuanwofei.cardemulator.pro`
- `com.yxer.packageinstalles`
- `com.zhufucdev.motion_emulator`
- `dialog.box`
- `dknb.con`
- `dknb.coo8`
- `github.tornaco.android.thanos`
- `have.fun`
- `io.github.Retmon403.oppotheme`
- `io.github.a13e300.ksuwebui`
- `io.github.qauxv`
- `io.github.vvb2060.magisk`
- `kk.dk.anqu`
- `lin.xposed`
- `me.bingyue.IceCore`
- `me.gm.cleaner`
- `me.plusne`
- `me.simpleHook`
- `me.teble.xposed.autodaily`
- `miko.client`
- `moe.fuqiuluo.portal`
- `name.monwf.customiuizer`
- `nep.timeline.freezer`
- `nep.timeline.re_telegram`
- `one.yufz.hmspush`
- `org.lsposed.lspatch`
- `org.lsposed.lspd`
- `org.lsposed.manager`
- `ru.maximoff.apktool`
- `top.bienvenido.saas.i18n`
- `top.hookvip.pro`
- `top.sacz.timtool`
- `tornaco.apps.shortx.ext`
- `vn.kwaiching.tao`
- `xzr.hkf`
- `xzr.konabess`
- `zako.zako.zako`

</details>

<details><summary><b>付録 B：不審 / チート関連ファイルとディレクトリ（68 条）</b></summary>

**不審またはチート関連**のファイルとディレクトリのみを列挙します（必要に応じて整理できます）。
`/proc`、`/sys`、`/dev`、`/system` などのシステムパスは検出器が**読み取る**対象であり、**削除しないでください**。

- `/data/A内核.ini`
- `/data/BingHPJY/pz.cfg`
- `/data/BingPUBG`
- `/data/Dit驱动`
- `/data/HPX`
- `/data/HPY`
- `/data/encore/custom_default_cpu_gov`
- `/data/encore/default_cpu_gov`
- `/data/gpu_freq_table.conf`
- `/data/js`
- `/data/js.sh`
- `/data/local/MIO`
- `/data/local/luckys`
- `/data/local/stryker/`
- `/data/local/tmp denied`
- `/data/local/tmp/A内核公益-和平精英0215x1`
- `/data/local/tmp/A内核公益-和平精英0215x1(1)`
- `/data/local/tmp/A内核公益-和平精英0215x1(2)`
- `/data/local/tmp/DisabledAllGoogleServices`
- `/data/local/tmp/HyperCeiler`
- `/data/local/tmp/Surfing_update`
- `/data/local/tmp/android_server`
- `/data/local/tmp/android_server64`
- `/data/local/tmp/cleaner_starter`
- `/data/local/tmp/encore_logo.png`
- `/data/local/tmp/gdbserver`
- `/data/local/tmp/horae_control.log`
- `/data/local/tmp/luckys`
- `/data/local/tmp/mount_mask`
- `/data/local/tmp/resetprop`
- `/data/local/tmp/scriptTMP`
- `/data/local/tmp/simpleHook`
- `/data/local/tmp/yshell`
- `/data/local/中野三玖`
- `/data/nh.ko`
- `/data/nh2`
- `/data/nh3`
- `/data/nh4`
- `/data/nh5`
- `/data/swap_config.conf`
- `/data/system/AppRetention`
- `/data/system/Freezer/`
- `/data/system/HPX`
- `/data/system/HPY`
- `/data/system/NoActive/`
- `/data/system/junge/`
- `/data/system/liboxmem.so`
- `/data/system/xydriver.ko`
- `/data/南瓜三角洲公益最新版本.sh`
- `/data/物资.txt`
- `/dev/Bing`
- `/my_product/etc/permissions/oplus_google_cn_gms_features.xml`
- `/sdcard/Download/com.niunaijun.blackdexa64_logcat.txt`
- `/sdcard/Download/dexdump/`
- `/sdcard/fart`
- `/storage/emulated/0/`
- `/storage/emulated/0/Android/Clash/`
- `/storage/emulated/0/Android/HChai/`
- `/storage/emulated/0/Android/Yume-Yunyun/`
- `/storage/emulated/0/Android/naki/`
- `/storage/emulated/0/Documents/advanced/`
- `/storage/emulated/0/Download/advanced/`
- `/storage/emulated/0/MT2/`
- `/storage/emulated/0/TpTestReport/screenOn/OK/0/`
- `/storage/emulated/0/rlgg/`
- `/storage/emulated/0/弱隐.sh`
- `/storage/emulated/0/落叶配置`
- `/storage/emulated/elgg/`

</details>

<details><summary><b>付録 C：検査対象のシステムプロパティ（34 個）</b></summary>

- `dalvik.vm.dex2oat-flags`
- `persist.chunqiu.path_hide`
- `persist.chunqiu.path_hide=1`
- `persist.debug.dalvik.vm.core_platform_api_policy`
- `persist.logd.size`
- `persist.logd.size.crash`
- `persist.logd.size.main`
- `persist.logd.size.system`
- `persist.sys.pihooks.disable.gms`
- `persist.sys.pihooks_BRAND`
- `persist.sys.pihooks_DEVICE`
- `persist.sys.pihooks_DEVICE_INIT`
- `persist.sys.pihooks_MANUFACTURE`
- `persist.sys.pihooks_MODEL`
- `persist.sys.pihooks_PRODUCT`
- `persist.sys.pihooks_RELEASE`
- `persist.sys.pihooks_SDK_INT`
- `persist.sys.pixelprops.gapps`
- `persist.sys.pixelprops.gms`
- `persist.sys.pixelprops.google`
- `persist.sys.pixelprops.gphotos`
- `persist.sys.spoof.gms`
- `persist.sys.vold_app_data_isolation_enabled`
- `ro.boot.flash.locked`
- `ro.boot.selinux`
- `ro.boot.vbmeta.avb_version`
- `ro.boot.vbmeta.device_state`
- `ro.boot.vbmeta.digest`
- `ro.boot.verifiedbootstate`
- `ro.build.date.utc`
- `ro.build.type`
- `ro.build.version.sdk`
- `ro.product.brand`
- `ro.product.brand=`

</details>
