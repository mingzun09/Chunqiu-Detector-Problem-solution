---
layout: home
hero:
  name: 春秋检测器解决方案
  text: Chunqiu Detector Problem Solutions
  tagline: 社区实测整理的检测项说明与处置方案 · 中英双语 · 跟进最新版本（4.5.5 / 68）
  actions:
    - theme: brand
      text: 🚀 直接看解决方案
      link: /zh/items
    - theme: alt
      text: 中文文档
      link: /zh/
    - theme: alt
      text: English Docs
      link: /en/
    - theme: alt
      text: 致谢名单
      link: /thanks
features:
  - icon: 🧭
    title: 概述与前言 · 术语及模块规范
    details: 真解锁 / 假回锁 / 免解 / 自签设备的定义，最小完美隐藏环境所需模块集合（密钥模块 + Zygisk 实现模块 + 应用隐藏模块）与正确配置。
  - icon: 🔍
    title: 检测项汇总 · 检测方式与解决办法
    details: 每条都说明「检测方式」（社区实测 + 行为观察）、分组与常见原因族、解决办法，以及与相邻条目的关系。
  - icon: 🧩
    title: 按分类折叠导航
    details: Root 与 SELinux / TEE 与密钥证明 / 挂载与命名空间 / 环境、进程与文件 / 内核、属性与系统特征 / 附录 A·B·C。
  - icon: 📎
    title: 配套脚本与附件
    details: Found property.sh、Tampered Attestation Key(26)Pass.sh、shamiko_Plus.sh、NoHello.kpm、rkp-release-v10.apk 等，站点内可直接打开。
  - icon: ⚠️
    title: 声明
    details: 仅供 Root 爱好者的环境检测技术学习与研究；严禁用于绕过反作弊、规避风控等违规场景，操作风险自负。
  - icon: 🤝
    title: 致谢
    details: 铭鐏(mingzun09)、741afb7、huoyan1231、juanma0511、Young-Six-6、HongSir6、YiJieqwq，以及特别致谢 JeTeeZnTmax。
---

## 快速开始

<div class="cq-lang">
  <a href="/zh/">
    <div class="t">📘 中文文档</div>
    <div class="d">从「说明与反馈 → 序章」开始：先看设备类型定义与最小模块集合，再按分类查具体检测项。</div>
  </a>
  <a href="/en/">
    <div class="t">📗 English Docs</div>
    <div class="d">Start from “Help &amp; Feedback → Prologue”, then look up individual detection items by category.</div>
  </a>
  <a href="/thanks">
    <div class="t">🤝 致谢名单 / Credits</div>
    <div class="d">文档贡献者、特别致谢、工具与自动化、统计口径（中英双语）。</div>
  </a>
</div>

## 阅读提示

- 侧边栏按分类折叠，展开分类即可看到该分类下的**全部检测项**，点击直接跳转到对应卡片；
- 右上角可切换**深色 / 浅色**主题（默认深色）；顶部搜索支持**中文分词**；
- 文档内的附件链接（如 `/File/Found property.sh`）在站点里同样可以直接打开；
- 文档仍在 GitHub 维护：[仓库地址](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution)。

<div class="cq-copyright">
<strong>版权与许可 · Copyright &amp; License</strong><br>
Copyright Ownership: Chunqiu Detector Solutions contributors<br>
本文档内容整理自社区实测，仅供技术学习与研究参考，操作风险自负；第三方模块与脚本的安全性请自行甄别。<br>
Licensed under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">Attribution 4.0 International (CC BY-4.0)</a>
</div>
