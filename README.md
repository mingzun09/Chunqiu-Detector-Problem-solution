# Chunqiu Detector Problem Solution

**English** | [中文](README.zh-CN.md) | [Русский](README.ru.md) | [Español](README.es.md) | [日本語](README.ja.md)

> Pick your language below to read the document, or visit our interactive online documentation site (with live keyword search).

## 🌐 Online Docs (GitHub Pages)

👉 **[https://mingzun09.github.io/Chunqiu-Detector-Problem-solution/](https://mingzun09.github.io/Chunqiu-Detector-Problem-solution/)**

The site is built with **Docsify** (a pure front-end single page, no build step): the entry point is `index.html` in the repository root, navigation and sidebar come from `_navbar.md` / `_sidebar.md`, and the body is read directly from the files under `language/` (**no site files need editing** — content updates as soon as it is committed).

- Light/dark theme follows the browser / OS setting (`prefers-color-scheme`), no manual toggle
- The top search box indexes **entry titles only** and expands the matching entry
- The document content stays maintained in the files under `language/`

Local preview (Docsify loads Markdown over XHR, so it must be served over HTTP — double-clicking `index.html` will not work):

```bash
python -m http.server 8000    # or any static server, e.g. npx serve
# open http://localhost:8000/
```

> Publishing: `.github/workflows/pages.yml` deploys the repository root to GitHub Pages on every push to `main`.

---

## Language

Select one of the following languages to view the solution file.

- [中文解决方案 / Chinese](/language/answer_zh.md)
- [English Solutions](/language/answer_en.md)
- [Русское решение / Russian](/language/answer_ru.md)
- [Solución en español / Spanish](/language/answer_es.md)
- [日本語の解決策 / Japanese](/language/answer_ja.md)

> The document contains many embedded links (highlighted in blue). Click them to jump to the relevant project or file.

> English is translated from the Chinese original; if anything reads ambiguously, the Chinese version prevails.

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

- **Documentation contributors:** 铭鐏 ([@mingzun09](https://github.com/mingzun09)) · [@YiJieqwq](https://github.com/YiJieqwq) · 741afb7 · huoyan1231 · juanma0511 · Young-Six-6 · HongSir6 · Lljjcc625 · [Met-AUG](https://github.com/Met-AUG)
- **Special thanks:** [Matsuzaka Yuki](https://github.com/matsuzaka-yuki) · [JeTeeZnTmax](https://github.com/jeteezntmax)
- **Tools & automation:** google-labs-jules[bot]

> [@JeTeeZnTmax](https://github.com/jeteezntmax) contributed the organisation and leads for **16 detection items** but never committed to this repository, so they do not appear in GitHub's contributor list — recorded in the credits file instead.

---

## Maintainers

- [@mingzun09](https://github.com/mingzun09) — repository owner
- [@YiJieqwq](https://github.com/YiJieqwq) — maintainer
