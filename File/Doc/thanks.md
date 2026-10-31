# 致谢清单 · Chunqiu Detector Solutions / Credits

> 整理时间：2026-11-01（上一版 2026-09-13）
> 数据来源：GitHub API（历史提交与 PR 记录）及贡献者补充。下方提交数量为 2026-11-01 的历史快照，不代表当前总数。

---

## 一、文档贡献者

- **铭鐏 (mingzun09)** —— 项目发起与长期维护；中文文档主体整理；所有 PR 的合并；上传 `File/rkp-release-v10.apk`。
  *佐证：120 次提交（2026-04-07 起，截至 2026-11-01）；PR #30–#35、#53–#56 的合并人。*

- **YiJieqwq** —— 文档结构重构；各条目「检测方式」补充与指标附录；检测项更新；术语规范化；中英文同步。
  负责文档网站的持续建设与维护：规划并落地概述／前言／正文三章结构，中英文目录、锚点与搜索对齐；推进原生条目折叠、侧边栏独立控制、路径导航、桌面／移动界面切换及深浅色适配，持续复核页面结构与修复交互问题。
  *佐证：122 次提交（2026-06-11 起，截至 2026-11-01）；PR #18 / #19 / #20 / #24 / #39 / #40 / #41。*

- **741afb7** —— 更正多条错误解释；文档拆分；引入 `File/Doc/ksu_kp_sidechannel_zh.md` 与 NoHello KPM（`File/Bin/`）；修订 SELinux_Hook 使用说明；PR #45 补充 SELinux/Magisk 方案、模块适用范围、内核要求与前置条件。
  *佐证：8 次提交（2026-07-06 – 07-23）；PR #22 / #23 / #26。*

- **huoyan1231** —— 补充「Vold 隔离已开启」解决方案（中英）。
  *佐证：2 次提交（2026-09-03）；PR #37。*

- **juanma0511 (Juan Martin)** —— 英文版早期翻译。
  *佐证：1 次提交（2026-04-19）；PR #2，`answer_en.md` +80 / −72。*

- **Young-Six-6（小乌龟的6）** —— 补充「检测到 Scene 端口占用」条目。
  *佐证：1 次提交（2026-06-07）；PR #15。*

- **HongSir6（畜中牲）** —— 中文条目修正。
  *佐证：1 次提交（2026-05-01）；PR #6。*

- **Lljjcc625** —— 按 4.6.2 实测结论补充与修正中文条目：在既有条目内追加「4.6.2 实测补充」（异常进程 0000、Found ksu / 免解设备、KernelSU loop device、SELinux 策略判据、风险应用等），并按 4.6.2 判据复核五条检测说明。
  *佐证：2 次提交（2026-10-25、2026-10-31）；PR #56。*

- **Met-AUG（LBZdavid）** —— 完善 AVB 校验相关内容：中英文补充 AVB 版本异常的判定细节与排查步骤。
  *佐证：2 次提交（2026-10-20）；PR #54。*

## 二、特别致谢

- **[Matsuzaka Yuki](https://github.com/matsuzaka-yuki)** —— 提供网页建设方面的支持。

- **[JeTeeZnTmax](https://github.com/jeteezntmax)** —— 提供 **16 个检测点**方面的整理与线索。
  因其未在 GitHub 仓库提交，故不会出现在提交记录与贡献者列表中，特此致谢。

## 三、工具与自动化

- **google-labs-jules[bot]**（Google Jules 自动化助手，**非人类贡献者**）—— 将仓库改造为 Docsify 文档站：条目折叠卡片、导航栏搜索与搜索结果自动展开、GitHub Pages 部署（`.github/workflows/pages.yml`）；由仓库主合并。
  *佐证：6 次提交（2026-08-25 – 08-28）；PR #30 / #31 / #32 / #33 / #34 / #35。*

## 四、统计口径与备注

- 多显示名 / 多邮箱已合并：`mingzun09` 曾以 `Su xiaoming`、`铭鐏` 两个显示名提交（同一邮箱 `3472449264@qq.com`，合计 120 次）；`YiJieqwq` 另有 3 次使用 `YiJieqwq@users.noreply.github.com` 提交。
- 提出过但未合并的 PR：#5（RGWS-LiuLai）、#7（HongSir6）。
- 计数为仓库全历史（截至 2026-11-01，共 267 次提交），**含合并提交**。
- 本清单已于 2026-11-01 通过 GitHub API 复核（contributors 含匿名 + 全部 PR 记录），各条均与上游记录一致。
- 本清单只统计文档与配套文件的改动，**不含**社区口头反馈，也不含所提供判据的逐条归属；如需逐条署名，请补充对应条目清单。

## 五、近期更新记录

| 日期 | 内容 |
|---|---|
| 2026-10-18 | 站点深色主题（跟随系统 `prefers-color-scheme`）；搜索改为只检索词条标题；修复 `</details>` 后方标题不渲染；README 更正为 Docsify 实现 |
| 2026-10-20 | 中英文补充 AVB 版本异常的判定细节与排查步骤 |
| 2026-10-21 | 新增俄语 / 西班牙语 / 日语版（`language/answer_ru.md`、`answer_es.md`、`answer_ja.md`）；英文版按中文 4.6.2(75) 十章结构整篇重译；README 增加五语言入口 |
| 2026-10-25 | 中文版在既有条目内追加「4.6.2 实测结论」 |
| 2026-10-31 | 中文版按 4.6.2 判据修正五条检测说明；补充 `Evil Service` 检测原理（四层判据、关键词对照、易误报项）并同步至各语言 |
| 2026-11-01 | 站点可用性改造：统一标题 id 与目录锚点（修复目录 / 搜索点击不跳转）、表格与长路径不再溢出、条目深链、返回顶部与阅读进度、展开/收起全部、侧栏当前章节高亮、`Ctrl/⌘+K` 聚焦搜索 |

---

# Credits · Chunqiu Detector Solutions

> Compiled: 2026-11-01 (previous edition 2026-09-13)
> Sources: historical GitHub commit/PR records and contributor additions. Counts below are a snapshot as of 2026-11-01, not current totals.

## 1. Documentation contributors

- **铭鐏 (mingzun09)** — project founder and long-term maintainer; main editor of the Chinese document; merged all PRs; uploaded `File/rkp-release-v10.apk`.
  *Evidence: 120 commits (since 2026-04-07, as of 2026-11-01); merged PRs #30–#35, #53–#56.*

- **YiJieqwq** — document restructuring; per-item “Detection method” sections and the indicator appendices; detection-item updates; terminology standardisation; ZH/EN synchronisation.
  Led ongoing website development and maintenance: the Overview / Prologue / Detection Items structure; bilingual navigation, anchors and search; native disclosures, independent sidebar controls, breadcrumbs, desktop/mobile view selection and light/dark styling; continued structural checks and interaction fixes.
  *Evidence: 122 commits (since 2026-06-11, as of 2026-11-01); PRs #18 / #19 / #20 / #24 / #39 / #40 / #41.*

- **741afb7** — corrected several wrong explanations; split the document; introduced `File/Doc/ksu_kp_sidechannel_zh.md` and the NoHello KPM (`File/Bin/`); revised the SELinux_Hook usage notes; PR #45 added SELinux/Magisk guidance, module applicability, kernel requirements and prerequisites.
  *Evidence: 8 commits (2026-07-06 – 07-23); PRs #22 / #23 / #26.*

- **huoyan1231** — added the “Vold isolation enabled” solution (ZH + EN).
  *Evidence: 2 commits (2026-09-03); PR #37.*

- **juanma0511 (Juan Martin)** — early English translation.
  *Evidence: 1 commit (2026-04-19); PR #2, `answer_en.md` +80 / −72.*

- **Young-Six-6 (小乌龟的6)** — added the “Scene port occupied” item.
  *Evidence: 1 commit (2026-06-07); PR #15.*

- **HongSir6 (畜中牲)** — Chinese item corrections.
  *Evidence: 1 commit (2026-05-01); PR #6.*

- **Lljjcc625** — added and corrected Chinese entries against 4.6.2 measurements: appended “4.6.2 test notes” inside existing entries (abnormal process 0000, Found ksu / No-Unlock device, KernelSU loop device, SELinux policy criteria, risky apps) and re-checked five detection write-ups against the 4.6.2 criteria.
  *Evidence: 2 commits (2026-10-25, 2026-10-31); PR #56.*

- **Met-AUG (LBZdavid)** — improved the AVB material: detection details and troubleshooting steps for AVB version anomalies, in both Chinese and English.
  *Evidence: 2 commits (2026-10-20); PR #54.*

## 2. Special thanks

- **[Matsuzaka Yuki](https://github.com/matsuzaka-yuki)** — provided support with website development.

- **[JeTeeZnTmax](https://github.com/jeteezntmax)** — provided organisation and leads for **16 detection items**. Because they never committed to this repository, they do not appear in the commit history or the contributor list; recorded here in thanks.

## 3. Tools & automation

- **google-labs-jules[bot]** (Google Jules automation, **not a human contributor**) — converted the repository into a Docsify site: collapsible item cards, navbar search with auto-expanding results, GitHub Pages deployment (`.github/workflows/pages.yml`); merged by the repository owner.
  *Evidence: 6 commits (2026-08-25 – 08-28); PRs #30 / #31 / #32 / #33 / #34 / #35.*

## 4. Notes on the statistics

- Merged identities: `mingzun09` also committed under the display names `Su xiaoming` and `铭鐏` (same e-mail `3472449264@qq.com`, 120 commits in total); `YiJieqwq` made 3 further commits with `YiJieqwq@users.noreply.github.com`.
- PRs opened but not merged: #5 (RGWS-LiuLai), #7 (HongSir6).
- Counts cover the whole repository history (as of 2026-11-01, 267 commits in total) and **include merge commits**.
- This list was verified against the GitHub API on 2026-11-01 (contributors incl. anonymous + all PR records); every entry matches the upstream records.
- This list only covers changes to the document and its supporting files; it does **not** include community verbal feedback, nor does it attribute individual criteria — for per-item attribution please supply the corresponding item list.

## 5. Recent updates

| Date | Change |
|---|---|
| 2026-10-18 | Dark theme for the site (follows the OS via `prefers-color-scheme`); search narrowed to entry titles only; fixed headings not rendering after `</details>`; README corrected to describe the Docsify setup |
| 2026-10-20 | AVB version anomaly: detection details and troubleshooting steps added (ZH + EN) |
| 2026-10-21 | Russian / Spanish / Japanese editions added (`language/answer_ru.md`, `answer_es.md`, `answer_ja.md`); English edition fully re-translated to the Chinese 4.6.2(75) ten-chapter structure; language selector added to the READMEs |
| 2026-10-25 | Chinese edition gained “4.6.2 test notes” inside existing entries |
| 2026-10-31 | Five Chinese detection write-ups corrected against 4.6.2; `Evil Service` detection principle added (four layers, keyword mapping, known false-positive) and mirrored into every language |
| 2026-11-01 | Site usability work: unified heading ids with TOC anchors (fixes TOC / search clicks not scrolling), no more table or long-path overflow, per-entry deep links, back-to-top and reading progress, expand/collapse all, current-section highlight in the sidebar, `Ctrl/⌘+K` to focus search |
