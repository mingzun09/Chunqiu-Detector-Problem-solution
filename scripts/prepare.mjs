// 站点构建前处理：拷贝附件、把单一文档拆成三章页面、生成侧边栏
import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'

const ROOT = process.cwd()
const DOCS = join(ROOT, 'docs')
const ensure = (p) => mkdirSync(dirname(p), { recursive: true })
const plainTitle = (s) => s.replace(/<[^>]+>/g, '').trim()

/* 分类图标（按出现顺序套用） */
const GROUP_ICON = ['🔐', '🔑', '🗂️', '🧪', '⚙️', '📎', '📖', '📚']

/* 与 VitePress 一致的 slugify（用于侧边栏锚点） */
function vpSlug(str) {
  return String(str)
    .normalize('NFKD')
    .replace(/[\u0300-\u036F]/g, '')
    .replace(/[\u0000-\u001f]/g, '')
    .replace(/[\s~`!@#$%^&*()\-_+=[\]{}|\\;:"'“”‘’<>,.?/]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

/* 1) 附件：File/ → docs/public/File/ */
rmSync(join(DOCS, 'public', 'File'), { recursive: true, force: true })
if (existsSync(join(ROOT, 'File'))) cpSync(join(ROOT, 'File'), join(DOCS, 'public', 'File'), { recursive: true })

/* 2) 把文档按 H2 切成三章 */
const CHAPTERS = {
  zh: { prologue: '## 序章', items: '## 检测项正文', drop: ['## 目录'] },
  en: { prologue: '## Prologue', items: '## Detection Items', drop: ['## Table of Contents'] }
}

function splitByH2(md, drop) {
  // 以 H2 为界切块，返回 [{title, text}]
  const parts = md.split(/(?=^## )/m)
  const head = parts.shift() || ''
  const blocks = parts
    .map((p) => {
      const title = (p.match(/^## (.+?)\s*$/m) || [, ''])[1].trim()
      return { title, text: p }
    })
    .filter((b) => !drop.some((d) => b.text.startsWith(d + '\n') || b.text.startsWith(d + ' ')))
  return { head, blocks }
}

function convert(md, lang) {
  const mode = CHAPTERS[lang]
  const { head, blocks } = splitByH2(md, mode.drop)

  const prologueIdx = blocks.findIndex((b) => mode.prologue.startsWith('## ' + b.title))
  const itemsIdx = blocks.findIndex((b) => mode.items.startsWith('## ' + b.title))

  const intro = head + blocks.slice(0, prologueIdx).map((b) => b.text).join('')
  const prologue = prologueIdx >= 0 ? blocks[prologueIdx].text : ''
  const items = itemsIdx >= 0 ? blocks.slice(itemsIdx).map((b) => b.text).join('') : ''

  /* 侧边栏：章节内条目（H3）与分类（H2） */
  const h2sOf = (text) => [...text.matchAll(/^##\s+(.+?)\s*$/gm)].map((m) => plainTitle(m[1]))
  const sectionsOf = (text) => {
    // 返回 [{ category, items: [{title, slug}] }]
    const out = []
    let cur = null
    const used = new Map()
    for (const line of text.split('\n')) {
      const h2 = line.match(/^##\s+(.+?)\s*$/)
      if (h2) {
        cur = { category: plainTitle(h2[1]), items: [] }
        out.push(cur)
        continue
      }
      const h3 = line.match(/^###\s+(.+?)\s*$/)
      if (h3 && cur) {
        const title = plainTitle(h3[1])
        let slug = vpSlug(title)
        const n = used.get(slug) || 0
        used.set(slug, n + 1)
        if (n) slug = `${slug}-${n}`
        cur.items.push({ title, slug })
      }
    }
    return out.filter((s) => s.items.length)
  }

  const prologueSections = sectionsOf(prologue)
  const itemSections = sectionsOf(items)
  const detectionCount = itemSections.filter(s => !/^(附录|Appendices)$/.test(s.category)).reduce((n,s) => n+s.items.length,0)

  const copy = lang === 'zh'
    ? `<div class="cq-copyright">
<strong>版权与许可 · Copyright &amp; License</strong><br>
Copyright Ownership: Chunqiu Detector Solutions contributors<br>
本文档内容整理自社区实测，仅供技术学习与研究参考，操作风险自负；第三方模块与脚本的安全性请自行甄别。<br>
Licensed under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">Attribution 4.0 International (CC BY-4.0)</a>
</div>`
    : `<div class="cq-copyright">
<strong>Copyright &amp; License</strong><br>
Copyright Ownership: Chunqiu Detector Solutions contributors<br>
Compiled from community reports, for reference only; all operations are at your own risk.<br>
Licensed under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">Attribution 4.0 International (CC BY-4.0)</a>
</div>`

  const chapters = lang === 'zh'
    ? `<div class="cq-chapters">
<a href="./"><span class="n">第一章</span><span class="t">概述</span><span class="d">项目信息 · 免责声明 · 用语说明 · 说明与反馈 · 版权</span></a>
<a href="prologue"><span class="n">第二章</span><span class="t">前言</span><span class="d">最小模块集合 · 模块推荐 · 正确配置</span></a>
<a href="items"><span class="n">第三章</span><span class="t">正文</span><span class="d">${detectionCount} 个检测项：检测方式 · 分组说明 · 解决办法</span></a>
</div>`
    : `<div class="cq-chapters">
<a href="./"><span class="n">Chapter 1</span><span class="t">Overview</span><span class="d">Project info · Disclaimer · Help &amp; Feedback · License</span></a>
<a href="prologue"><span class="n">Chapter 2</span><span class="t">Prologue</span><span class="d">Minimal module set · Recommendations · Configuration</span></a>
<a href="items"><span class="n">Chapter 3</span><span class="t">Detection Items</span><span class="d">${detectionCount} items: detection method · notes · solutions</span></a>
</div>`

  const finish = (text) =>
    text
      .replace(/\(\/File\/Doc\/thanks\.md\)/g, '(/thanks)')
      .replace(/<(?=\s|\d|=|\.|,|%|\))/g, '&lt;')
      .replace(/\n{3,}/g, '\n\n')
      .trimEnd() + '\n\n' + copy + '\n'

  const promote = (t, title) => {
    const out = t.replace(/^##\s+/, '# ')   // 页面首个 H2 提升为 H1
    return title ? out.replace(/^#\s+.*$/m, '# ' + title) : out
  }
  const pages = {
    intro: finish(intro).replace(/(\n)(##\s+)/, `$1${chapters}\n$1$2`),
    prologue: finish(promote(prologue, lang === 'zh' ? '前言' : 'Prologue')),
    items: finish(promote(items).replace(/^(# .+\n)/, '$1\n' + (lang === 'zh'
      ? '<div class="cq-reading-note">有关用语详见<a href="./#用语介绍与规范">第一章</a>，有关模块推荐/配置详见<a href="prologue">第二章</a>。</div>\n'
      : '<div class="cq-reading-note">See <a href="./#terminology-conventions">Chapter 1</a> for terminology and <a href="prologue">Chapter 2</a> for module recommendations and configuration.</div>\n')))
  }

  const sidebar = [
    { text: lang === 'zh' ? '第一章 · 概述' : 'Chapter 1 · Overview', link: `/${lang}/`, collapsed: false, items: sectionsOf(intro).flatMap(s => s.items.map(it => ({text:it.title,link:`/${lang}/#${it.slug}`}))) },
    {
      text: lang === 'zh' ? '第二章 · 前言' : 'Chapter 2 · Prologue',
      link: `/${lang}/prologue`,
      collapsed: false,
      items: prologueSections.flatMap((s) =>
        s.items.map((it) => ({ text: it.title, link: `/${lang}/prologue#${it.slug}` }))
      )
    },
    {
      text: lang === 'zh' ? '第三章 · 正文' : 'Chapter 3 · Detection Items',
      link: `/${lang}/items`,
      collapsed: false,
      items: itemSections.map((s, i) => ({
        text: `${GROUP_ICON[i] || '•'} ${s.category}`,
        collapsed: false,
        items: s.items.map((it) => ({ text: it.title, link: `/${lang}/items#${it.slug}` }))
      }))
    }
  ]

  return { pages, sidebar, stats: { prologue: prologueSections.reduce((n, s) => n + s.items.length, 0), items: itemSections.reduce((n, s) => n + s.items.length, 0) } }
}

const zh = convert(readFileSync(join(ROOT, 'language/answer_zh.md'), 'utf8'), 'zh')
const en = convert(readFileSync(join(ROOT, 'language/answer_en.md'), 'utf8'), 'en')
for (const [lang, data] of [['zh', zh], ['en', en]]) {
  ensure(join(DOCS, lang, 'index.md'))
  writeFileSync(join(DOCS, lang, 'index.md'), data.pages.intro, 'utf8')
  writeFileSync(join(DOCS, lang, 'prologue.md'), data.pages.prologue, 'utf8')
  writeFileSync(join(DOCS, lang, 'items.md'), data.pages.items, 'utf8')
}

/* 3) 致谢清单渲染页 */
if (existsSync(join(ROOT, 'File/Doc/thanks.md'))) {
  ensure(join(DOCS, 'thanks.md'))
  writeFileSync(join(DOCS, 'thanks.md'), readFileSync(join(ROOT, 'File/Doc/thanks.md'), 'utf8'), 'utf8')
}

/* 4) 侧边栏数据 */
const ts = '// AUTO-GENERATED by scripts/prepare.mjs — do not edit\nexport default '
  + JSON.stringify({ zh: zh.sidebar, en: en.sidebar }, null, 2) + ' as const\n'
ensure(join(DOCS, '.vitepress/data/sidebar.ts'))
writeFileSync(join(DOCS, '.vitepress/data/sidebar.ts'), ts, 'utf8')

console.log(`[prepare] zh 前言 ${zh.stats.prologue} 条 / 正文 ${zh.stats.items} 条 | en ${en.stats.prologue} / ${en.stats.items}`)
