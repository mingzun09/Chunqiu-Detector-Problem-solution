# Chunqiu Detector-Problem solution

**English** | [中文](README.zh-CN.md)

> Pick your language below to read the document, or visit our interactive online documentation site.

## 🌐 Online Docs (GitHub Pages)

👉 **[https://mingzun09.github.io/Chunqiu-Detector-Problem-solution/](https://mingzun09.github.io/Chunqiu-Detector-Problem-solution/)**

The site is built with **VitePress**: a sidebar that collapses by category and lists every detection item, Chinese word-segmentation search, and dark/light themes.
The document content is still maintained in this repository under `language/answer_zh.md` and `language/answer_en.md` (**no site files need editing** — the site rebuilds automatically after a commit).

```bash
npm install          # Install dependencies (Node 20+)
npm run docs:dev     # Local preview at http://localhost:5173/Chunqiu-Detector-Problem-solution/
npm run docs:build   # Build into docs/.vitepress/dist
```

> The site source lives in `docs/` (config at `docs/.vitepress/config.mts`). Before building, `scripts/prepare.mjs` automatically copies the `File/` attachments, converts both markdown files into pages with entry anchors injected, and generates the sidebar data.

---

## Language

Select one of the following languages to view the solution file.

[中文解决方案](/language/answer_zh.md) | [English Solutions](/language/answer_en.md)

> The document contains many embedded links (highlighted in blue). Click them to jump to the relevant project or file.

---

## Files & Attachments

The repository bundles a number of automated fix scripts and KPM modules under the `/File/` directory:

- `/File/Found property.sh` — fixes the "Found property" property detection
- `/File/Tampered Attestation Key(26)Pass.sh` — fixes the anomalous certificate Patch tag
- `/File/shamiko_Plus.sh` — hides the property-area hole modification
- `/File/Bin/Nohello-v1.8.2.9-83-b3e7d87-release.kpm` — APatch hiding KPM module
- `/File/Doc/ksu_kp_sidechannel_zh.md` — explains the KSU/APatch side-channel detection principle
- [`/File/Doc/thanks.md`](File/Doc/thanks.md) — credits list (full attribution)

---

## Feedback & Contribute

Issues and pull requests that add new detection items and solutions are very welcome!

You can fork and modify the repository, then open pull requests. I will check and merge them.

---

## Credits

Full attribution lives in **[`File/Doc/thanks.md`](File/Doc/thanks.md)** — documentation contributors, special thanks, and tooling, each with commit/PR evidence.

- **Documentation contributors:** 铭鐏 ([@mingzun09](https://github.com/mingzun09)) · [@YiJieqwq](https://github.com/YiJieqwq) · 741afb7 · huoyan1231 · juanma0511 · Young-Six-6 · HongSir6
- **Special thanks:** [Matsuzaka Yuki](https://github.com/matsuzaka-yuki) · [JeTeeZnTmax](https://github.com/jeteezntmax)
- **Tools & automation:** google-labs-jules[bot]

> [@JeTeeZnTmax](https://github.com/jeteezntmax) contributed the organisation and leads for **16 detection items** but never committed to this repository, so they do not appear in GitHub's contributor list — recorded in the credits file instead.

---

## Maintainers

- [@mingzun09](https://github.com/mingzun09) — repository owner
- [@YiJieqwq](https://github.com/YiJieqwq) — maintainer
