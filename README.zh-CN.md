# Chunqiu Detector-Problem solution / 春秋检测器问题解决方案

[English](README.md) | **中文**

> 您可以在下方选择语言查看此文档，或访问我们的在线交互文档平台（支持实时关键词搜索）。

## 🌐 在线文档（GitHub Pages）

👉 **[https://mingzun09.github.io/Chunqiu-Detector-Problem-solution/](https://mingzun09.github.io/Chunqiu-Detector-Problem-solution/)**

站点使用 **VitePress** 构建：侧边栏按分类折叠并列出全部检测项、支持中文分词搜索、深色/浅色主题。
文档内容仍维护在本仓库的 `language/answer_zh.md` 与 `language/answer_en.md`（**无需改站点文件**，提交后自动构建）。

```bash
npm install          # 安装依赖（Node 20+）
npm run docs:dev     # 本地预览 http://localhost:5173/Chunqiu-Detector-Problem-solution/
npm run docs:build   # 构建到 docs/.vitepress/dist
```

> 站点源码在 `docs/`（配置 `docs/.vitepress/config.mts`），构建前由 `scripts/prepare.mjs` 自动：
> 拷贝 `File/` 附件、把两份 markdown 转成页面并注入条目锚点、生成侧边栏数据。

---

## 语言选择

请选择以下语言之一来查看解决方案文件。

[中文解决方案](/language/answer_zh.md) | [English Solutions](/language/answer_en.md)

> 文档中包含大量嵌入式链接（蓝色突出显示），点击即可跳转至对应的项目/文件地址。

---

## 依赖与文件说明

仓库中包含了部分自动化修复脚本与 KPM 模块，位于 `/File/` 目录下：

- `/File/Found property.sh` — 修复 Found property 属性检测
- `/File/Tampered Attestation Key(26)Pass.sh` — 修复证书 Patch 标签异常
- `/File/shamiko_Plus.sh` — 隐藏属性区空洞修改
- `/File/Bin/Nohello-v1.8.2.9-83-b3e7d87-release.kpm` — APatch 隐藏 KPM 模块
- `/File/Doc/ksu_kp_sidechannel_zh.md` — KSU/APatch 侧信道检测原理说明
- `/File/Doc/thanks.md` — 致谢清单 / Credits list

---

## 反馈与参与贡献

欢迎提交 Issues 或 Pull Requests 补充新的检测项及解决方案！

You can fork and modify the repository, then pull requests. I will check and merge them.

---

## 维护者

- [@mingzun09](https://github.com/mingzun09) — 仓库所有者
- [@YiJieqwq](https://github.com/YiJieqwq) — 维护者
