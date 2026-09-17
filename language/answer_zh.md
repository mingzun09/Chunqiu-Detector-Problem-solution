# 春秋检测项解决方案（跟进最新版本）中文版

> 核对版本：4.5.5(68) ｜ 最后更新：2026-09-13
> 致谢名单 / Credits：[致谢清单](/File/Doc/thanks.md) ｜ 仅供参考，具体结果因设备/环境而异。
> 部分条目补充了「**检测方式**」（由社区实测与行为观察整理，可能与实现有偏差，仅供定位问题参考）
> 文档链接：[github](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution)

---

## 声明

**1. 合规与用途约束**
春秋检测器及本文档提供的环境检测和处置方案，**仅面向 Android 技术爱好者**，专用于**技术学习、环境研究与探讨**。**严禁**将本文档中的任何方案用于绕过应用反作弊、规避风控机制、游戏作弊等一切违法违规场景。因违规使用而产生的任何后果与责任，均由使用者自行承担。

**2. 风险提示**
文档中记录的所有操作流程、自动化脚本、模块配置均仅供技术参考。涉及修改系统镜像、替换硬件密钥、嵌入内核模块（KPM）、执行底层 Root 指令等操作，均存在**极高的不可逆风险**，可能导致设备变砖、无限重启或用户数据丢失。所有操作风险均由使用者本人承担，文档作者对可能引发的设备损坏及数据丢失概不负责。

3. 本方案基于社区实测整理，受ROM版本、内核、Root管理器、模块组合影响，检测项存在误报、概率偶发命中现象；文档给出的解决办法不保证完全生效，检测结果仅作调试参考，不作为绝对判定依据。

4. 文档引用的第三方模块、脚本、外部项目链接均为社区公开资源，作者不对第三方工具的安全性、可靠性负责，请使用者自行甄别来源。

5. 附录A、附录B中所列「风险/黑名单包名」「可疑/外挂类文件与目录」来源于春秋检测APP内置数据集，分类依据取自社区公开信息与项目发布页；仅用于环境检测、反作弊场景参考，不代表绝对判定结论。

6. 本文档新增的设备类型定义（真解锁设备、假回锁设备、免解设备、自签设备）为社区圈内首次规范化整理定义，旨在推动设备分类术语的统一使用；不具备法律层面权威性，仅作技术参考。

7. 模块推荐列表内的模块均为编者主观技术推荐，不存在任何商业利益关联，仅供参考。

## 说明与反馈

### 自行尝试但仍然无法通过的检测

请开 Issues 并提供你的模块列表信息 + 使用了哪些 Xposed 模块等详细修改，我有时间会回复/帮助。

### 通用排查方法（遇到“未知 / 未解决”条目时）

1. **记录现状**：`ls /data/adb/modules`、Xposed 模块列表、Zygisk 排除策略、伪装类属性（`getprop | grep -iE "spoof|pihooks|pixelprops|resetprop"`）。
2. **最小集复测**：只保留 root 管理器 + 必需的 Zygisk 提供者（如 Zygisk 实现模块），重启后扫描，确认命中是否仍在。
3. **二分定位**：之后每次只启用一个模块 → 重启 → 复扫，逐步收敛到具体触发项（每次只改一个变量）。
4. **挂载类条目**优先动：元模块、Zygisk 排除策略（“仅还原挂载”）、SusFS / PathMask 类隐藏。
5. **密钥 / TEE 类条目**：修改 `keybox.xml`、`target.txt`、安全补丁同步等之后**必须重启**再复测。
6. 少数条目属**侧信道 / 不稳定检测**：同一环境多次扫描结果可能不一致，先排除偶发再定位。

### 连锁项先归因：确认「Zygisk 是否真的注入」

**同时冒出多条**异常时（典型组合：`风险应用` + `Tampered Attestation Key` + `USB 调试已开启`），先别逐条修 ——
这一组几乎总是同一个根因：**Zygisk 没有注入成功**。

密钥模块（TEESimulator-RS 等）、应用隐藏模块（HMA-OSS）、LSPosed 都跑在 Zygisk 之上，Zygisk 一挂，连锁反应是：

| 界面上看到的 | 真实原因 |
|---|---|
| `风险应用 <一长串包名>` | 应用隐藏模块根本没运行，隐藏名单自然不生效 |
| `Tampered Attestation Key(24)` | 密钥模块注入不完整（`24` 可当信号用） |
| `USB 调试已开启` | 应用隐藏模块的 `dev_options` 预设没生效 |

**判定（Zygisk Next 自带控制器，别猜）：**

```sh
su -c '/data/adb/modules/zygisksu/bin/zygiskd status'
```

- `zygote_states:N` —— **N≥1 才算注入成功**；`failed to connect to server` = 守护进程没起来 → 应用层注入必然全灭；
- `modules_with_issue:0` —— 才说明模块文件本身没问题；
- 没起来先 `su -c '/data/adb/modules/zygisksu/bin/zygiskd start'`，之后仍需**完整重启**才能在启动阶段注入。

**三条硬证据（缺一不可，只看 `status` 不够）：**

```sh
su -c '/data/adb/modules/zygisksu/bin/zygiskd status'            # 1) 看 zygote_states:1
su -c 'grep -c hma /proc/$(pidof system_server)/maps'            # 2) 结果 > 0
su -c 'tail -n 5 /data/misc/hide_my_applist_*/log/runtime.log'   # 3) 有新的 @shouldFilterApplication: query from <包名>
```

第 3 条是「应用隐藏模块真的在过滤」最可靠的信号；只看日志里的 `Config loaded` 不够（那只代表启动时读过一次配置）。

**别误判**：`/system/bin/zygote_next`（`--name zygote_next --species android-native-app`）是
**Android 17 自带的第二个 zygote**（`/system/etc/init/zygote_next.rc`），**不是** Zygisk 实现模块的产物。
想知道谁在真正 fork 应用，看 PPID：`ps -A -o PID,PPID,NAME | grep -E 'zygote|system_server'`。

#### 坑：`module.prop` 的版本串必须与该版本二进制自报格式**严格一致**

手动编辑过、或被清理脚本弄坏过 `module.prop` 时，把 `version=` 写成 `1.5.0` 这种简写，
守护进程会报 **`❌ Module files corrupted`** 并**直接拒绝注入**（表现就是上面那组连锁项全回来）。

正确格式是 `version=<X.Y.Z> (<versionCode>-<hash>-release)`。以 Zygisk Next 1.5.0 为例：

```ini
id=zygisksu
name=Zygisk Next
version=1.5.0 (843-5217106-release)
versionCode=843
author=5ec1cff, Nullptr, aviraxp
description=Standalone implementation of Zygisk.
updateJson=https://lsposed.zip/zygisk-next/update.json
```

- 正确的版本串从 `zygiskd status` 的 `version_local` 字段取（`zygiskd` 加过壳，`strings` 提不出有效串）；
- `module.prop.orig` **必须同时存在**，否则守护进程报 `[E] fopen ./module.prop.orig failed with 2`；
- 改完删掉 `/data/adb/zygisksu/.abort_msg`、`.injecting`，再完整重启；
- 想看守护进程原始报错：`su -c 'echo 1 > /data/adb/zygisksu/klog'` → 重启 → `dmesg | grep zn-daemon`（诊断完把 `klog` 删掉）。

⚠️ **安全提示**：任何“更换 keybox / 更换 RKP 密钥 / 改回锁状态 / 改安全补丁同步”的操作都会改变设备的密钥与认证（attestation）状态，**不一定可逆**；操作前请评估风险，必要时先备份相关目录。

---

## 目录

- [说明与反馈](#说明与反馈)
- [序章](#序章)
- [Root 权限与 SELinux 检测](#root-权限与-selinux-检测)
- [TEE 与密钥证明检测](#tee-与密钥证明检测)
- [挂载与命名空间检测](#挂载与命名空间检测)
- [环境、进程与文件检测](#环境进程与文件检测)
- [内核、属性与系统特征检测](#内核属性与系统特征检测)
- [附录](#附录)

---

## 序章

### 用语介绍与规范

#### 真解锁设备

Bootloader（ABL）解锁标志已被真实置位，系统放行未经签名校验的底层镜像并允许刷写。该设备的解锁状态会如实反映在系统底层属性与 KeyMint 硬件级凭据（Attestation）中。

#### 假回锁设备

在 ABL 真实解锁的设备上，于启动链早期（早于系统与 TEE 读取并固化启动状态）植入并执行自定义 payload，改写内存中的解锁状态并上报，使设备对外呈现“已锁定（locked & green）”，并能返回硬件级“已锁定的 attestation 证书”，而实际仍加载被篡改的 boot / init_boot 镜像的设备（如使用 gbl_root_canoe 项目的高通骁龙 8e5 设备）。

#### 免解设备

在 ABL 保持真实锁定（未解锁）的状态下，通过 Android / 用户空间提权漏洞（常伴随 SELinux 被置为 permissive）取得 Root 的设备。此类 Root 通常不持久、需每次启动重新利用。

#### 自签设备

设备启动链所信任的 boot / init_boot 签名密钥可被第三方获得或复现，用户可用该密钥自行签名被篡改的 boot / init_boot / vbmeta 等镜像，并在 ABL 保持真实锁定的状态下通过校验运行的设备；系统启动状态与 OEM 解锁状态仍显示“未解锁”（典型：联想拯救者 Y700 二 / 三 / 四代，用公开 testkey 重签镜像即可免解锁刷入 root 补丁）。

#### Root 管理器

由一套完整的权限管理组件集合组成，包含面向用户的 Android 交互 App、用户态守护服务，以及部署在内核或 ramdisk 中的持久化钩子或内存补丁等，用于实现 Root 权限的管控。

#### 元模块

模块管理器类型的顶层模块，本身不直接提供设备伪装、系统补丁等功能，核心职责是管控子模块和提供挂载功能；一台设备同时只能安装一个元模块（详见 [KernelSU 官方文档](https://kernelsu.org/zh_CN/guide/metamodule.html)）。

#### 密钥模块

在系统 keystore 守护进程（keystore2）内拦截 / 替换 KeyMint 的 attestation 路径，并用 keybox 生成设备已锁定的虚假证明的模块，多数同时自带系统属性伪装功能。

#### Zygisk 实现模块

提供 Zygisk runtime 的模块，负责把代码注入 Zygote / app 进程，并对外暴露一套 Zygisk 行为的 API，为真正干活的其他 Zygisk 模块提供加载运行环境。

#### 应用隐藏模块

以“包可见性”为操作对象，在目标进程（或系统进程）里拦截包查询链路，进而按照用户的配置，对目标应用隐藏选中应用可见性的模块。

### 最小完美隐藏环境构建指南

- 真解锁设备：**密钥模块 + Zygisk 实现模块 + 应用隐藏模块**
- 假回锁 / 免解 / 自签设备：**Zygisk 实现模块 + 应用隐藏模块**

对于 **APatch / FolkPatch** 用户，需要额外加载 **[NoHello.kpm](https://t.me/welikeandroid)** 以防侧信道检测；新版管理器可能内置 SELinux hook 功能（需要手动开启），旧版本用户可再额外加载 **[SELinux_Hook.kpm](https://t.me/APatch_nightly)**（链接见下方「相关模块推荐」）。

### 相关模块推荐（排名不分先后）

#### 密钥模块

- [TEESimulator-RS](https://github.com/Enginex0/TEESimulator-RS)：继 TrickyStore 后最知名的密钥模块，更新较勤，不自带 WebUI。
- [OhMyKeymint](https://github.com/qwq233/OhMyKeymint/)：行为更接近 AOSP，IO 开销可能比 TEES-RS 更低。
- **带 WebUI 的版本**在 [ITxiao6666/OhMyKeymint](https://github.com/ITxiao6666/OhMyKeymint) 的 `Xiaomi_LeiJun` 分支。
- [Tricky-addon-Enhanced](https://github.com/Enginex0/tricky-addon-enhanced)：TS / TEES-RS 可用的 WebUI 拓展模块。
- 不推荐原版 TrickyStore：其最后更新为 2025-11-30，部分功能已严重落后于其他密钥模块。

#### Zygisk 实现模块

- **Zygisk Next**：最为广泛使用的 Zygisk 独立实现模块。~~`github.com/Dr-TSNG/ZygiskNext`~~ 已随该组织一并 **404**（2026-09 实测），项目发布改走更新通道 `https://lsposed.zip/zygisk-next/update.json`（更新日志见 [`changelog.md`](https://lsposed.zip/zygisk-next/changelog.md)）；经过镜像传播的第三方 zip 请自行校验来源。

#### 应用隐藏模块

- [HMA-OSS](https://github.com/frknkrc44/HMA-OSS)：Zygisk 模块版 / Xposed 模块版双版本可选。

#### KernelPatch 隐藏模块

- [NoHello.kpm](https://t.me/welikeandroid)：AP / FP 防侧信道检测模块。
- [SELinux_Hook.kpm](https://t.me/APatch_nightly)：AP / FP 的 SELinux hook 模块（新版本管理器可能已内置）。
- 春秋检测最新的 **Superkey 检测暂无应对模块**，若出现将第一时间更新。

#### 元模块

- 若设备 root 管理器自带元模块 API，可以考虑启用；
- [Hybrid-Mount](https://github.com/Hybrid-Mount/meta-hybrid_mount)：比较广泛使用的第三方元模块。

### 模块正确配置

#### 密钥模块

a. 将目标应用添加到包名列表内（如 TS / TEES 的 `/data/adb/tricky_store/target.txt`，或使用 WebUI 配置）；
b. 正确配置安全补丁日期，或直接删除其配置文件（如 `/data/adb/tricky_store/security_patch.txt`，直接删最省事）；
c. 正确配置 boot hash（正常情况下会自动设置）。

#### Zygisk 实现模块

开启“使用 Zygisk 连接器”和“使用匿名内存”；“仅还原挂载”可能会和设备 root 管理器的“内核卸载模块”冲突，自行二选一即可。

#### 应用隐藏模块

使用方法不唯一，此处仅作名词解释（以 HMA-OSS 为例）：
- **黑名单工作模式**：被开启此模式的应用，将不可见其被应用黑名单模板内的应用；
- **黑名单模板**：对于被应用此模板的应用，模板内的应用不可见；
- **白名单工作模式**：被开启此模式的应用，将只可见其被应用白名单模板内的应用；
- **白名单模板**：对于被应用此模板的应用，只可见模板内的应用。

---

## 检测项正文

## Root 权限与 SELinux 检测

### 存在模块修改春秋

#### 检测方式

对比本进程被修改的痕迹（策略 / 注入 / 挂载）与预期。

使用 IsolPolicy 模块后出现，关闭作用域或者卸载模块解决。

并不是只有模块，比如旧版ksu启用了隐藏SELinux修改也算，请尝试跟进相关 root 管理器最新 CI 来解决此问题。

### 检测SELinux Policy时发现可疑问题 / 检测到ROOT权限

#### 检测方式

1. 以本进程（预期位于 `app_zygote` 域）的 context 作为“载体”，用**哨兵 context**（`…context_oracle_sentinel:s0` / `…_sentinel_file:s0`）建立正控制 / 负控制 / 文件控制三组对照；

2. 查询走 **raw selinuxfs 写**（直接操作 `/sys/fs/selinux/access`，不走 libselinux），并校验内核回填的 `avdSeqNo`；

3. 用 `selinux_check_access` / `getfilecon` 与 raw 结果交叉比对，**加扰动后再比对一次**，并检查重复性（`Repeatability`）；

4. 直接探测根相关规则是否仍被 live policy 接受（`shell -> su` 转换、`magisk` / `ksu` / `apatch` 域、`ksu_file` / `lsposed_file` / `magisk_file` 读取等），并检查 KSU context 的“位对 / 拆分”一致性。

#### 常见原因族

（命中时详情会给出）：`enforcing is not 1`、`deny_unknown is not 1`、`unexpected version`、`sequence/policyload unexpected`、`direct syscall and libc views disagree (PLT-hook residue)`。

#### 解决办法

- 检测方式参考：[DirtySepolicy](https://github.com/LSPosed/DirtySepolicy)；
- 本条的判定点是「应用 zygote 拥有访问 `/sys/fs/selinux/access` 的权限」，需要让 root 管理器或内核侧隐藏 SELinux 修改：
  - **root 实现的自带能力（可用于 KernelSU 系 / APatch 系）**：升级到最新版本，开启「隐藏 SELinux 修改」（KSU 系需重新修补镜像或重新进行**免解（越狱）**后重启）。
    - 内核版本支持范围：
      - APatch 系：4.19 及以上；
      - KernelSU 系：不同分支的支持范围不完全相同，需要具体情况具体判断。以原版 KernelSU 为例，它仅支持 GKI2 内核。
  - **内核模块方案（可用于 KernelSU 系 / APatch 系 / Magisk 系）**：SELinux_Hook.kpm 一类 SELinux hook（内核模块；selinux_magisk_access_filter链接见序章「相关模块推荐」）。
    - 说明：目前有两种模块可用：原版 selinux_hook（即 selinux_magisk_access_filter）和 selinux_MAF_fork。[selinux_MAF_fork仓库地址见此](https://github.com/741afb7/selinux_maf_fork)
    - 适用范围：原版 selinux_hook（即 selinux_magisk_access_filter）仅适用于 KernelSU 系 / APatch 系；selinux_MAF_fork 专注于适配 Magisk 系，但 KernelSU 系 / APatch 系仍然可用。Magisk系必须包含[此代码](https://github.com/topjohnwu/Magisk/commit/5a28d2fcfcd3245f726933d7fd0a6173ea484e32)，否则该方法无法生效。
    - 运行模式：KernelSU 系和 Magisk 系必须嵌入才能生效，APatch 系在安装模式下也可生效。
    - 内核版本支持范围及要求：
      - selinux_MAF_fork：4.19 及以上和部分 4.14 内核，更详细的介绍见仓库的 README 文档。
      - selinux_magisk_access_filter：理论支持范围在 4.9 及以上，但在 4.9 和 4.14 版本内核上运行可能存在风险。
    - 特别说明：
      1. Magisk 系原生不支持 KPM 内核模块，需要额外安装 KPM 支持：
         - [KPatch-Next-EXP](https://github.com/741afb7/KPatch-Next-Module-EXP)：不包含 OTA 更新功能，且不计划长期更新，但支持 KPM 安装模式；
         - [KPM-Manager](https://github.com/Yervant7/KPM-Manager)；
         - [KPatch-Next](https://github.com/KernelSU-Next/KPatch-Next-Module)：已停更较长时间，和 KernelPatch 最新版相差较大。
      2. Build-in KernelPatch 不可使用此类模块：内核源码集成的 KernelPatch 的 KPM 嵌入模式实现与原版 KernelPatch 不同，此类模块无法在 Build-in KernelPatch 中生效。
  - 若当前管理器不属于 KernelSU 系 / APatch 系 / Magisk 系，可考虑更换为以上 3 种的任意一种。

*以上方案补充整理自 [741afb7 的上游 PR #45](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution/pull/45)；兼容性说明沿用该贡献，并非本站独立真机验证。*

关系：`SELinux 状态指纹可疑`、`SELinux 状态通道不一致`、`设备获取 Root 权限 / 异常模块` 属于同一套判据族（不同版本的不同切面），**本文档已合并到本条**。

### Found ksu/免解设备

#### 检测方式

KSU 免解（越狱）模式特征，或发现 ksu 相关进程 / 设备。

发现 KSU 处于**免解（越狱）模式**，或发现 ksu 相关进程等因素。

不推荐使用**免解（越狱）模式**，因此不提供解决方案。

### SU binary detected

#### 检测方式

在常见路径下检测 su / 类似二进制文件。

检测到 SU 二进制文件（检测到 ROOT）
iQoo/Vivo 用户注意：`/apex/com.android.virt/bin/su` 会被命中 → 移走该文件或去掉其执行位。
通用原则：**不要给春秋检测 root 权限**。

### Abnormal Environment

#### 检测方式

（与仓库内 [KSU/APatch 侧信道说明](/File/Doc/ksu_kp_sidechannel_zh.md) 一致）：
- **APatch / KernelPatch**：①**“懒分配页”探测**——把一个“懒分配”（只占虚拟地址、尚未映射物理页）的页地址当作 superkey 所在地址发起鉴权请求，KernelPatch 解引用该地址时会把该页**实际映射/读入**，检测器随后检查该页是否被映射即可判定 KernelPatch 是否存在；②**鉴权时延探测**——提前拟定一个“范围内 cmd”和一个“范围外 cmd”，分别发起鉴权，多次测量取总和使比值稳定，两者耗时比值大于约 2 即判定存在。
  界面上该条目的输出是**页级 kB 对照**（如 `No-read control: 0→0 kB, expected` / `Read control: 0→4 kB, expected` / `Target call: 0→4 kB, unexpected read`）与多轮一致性（`Consistency: n/n`），本质就是判断“该页是否被实际映射/读取”。
- **KernelSU**：框架用 Kprobe hook `newfstatat` / `faccessat`，使两者耗时显著变长，而 `statx` 不受影响；多次调用取总耗时做比值，`newfstatat : statx > 1.2` 即判定存在 KernelSU。
- 这也解释了为什么这类内核级隐藏 KPM 要“在 cmd 判断之前就拒绝鉴权”——不进入读取/校验 superkey 的路径，两种探测同时失效。
- 注意：另有一条 `发现APatch 的鉴权密钥` 测的是“内核在该 syscall 路径上是否多读了用户参数页”，**加排除列表对它无效**（读取发生在拦截点之前/之外），详见该条目。

检测到 KSU/APatch（侧信道检测）

检测原理请参考[此文档](/File/Doc/ksu_kp_sidechannel_zh.md)

**解决办法（KernelSU 系）**：更新你的 KernelSU 管理器并重新修补（LKM 工作模式）或重新集成（GKI 和 Non-GKI 工作模式）。

**解决办法（APatch 系）**：
1. 嵌入 / 加载 **NoHello.kpm**（模块链接见序章「相关模块推荐」），并把检测器加入排除列表 —— 该 KPM 可以在 KernelPatch 判断 `cmd` 值之前先判断发起鉴权请求的应用是否在排除列表内，若是则禁止鉴权。

2. 未来版本的 APatch 会引入基于签名的鉴权方法，对于不符合签名却发起了鉴权的应用直接拒绝鉴权请求。目前没有完全实现，需要再等一段时间。

**解决办法（KPatch-Next）**：更新 KPatch-Next 驱动到 0.13.5-2。

原理：旧版 KPatch-Next 完全继承了 KernelPatch 的鉴权方式，所以在 APatch 上可行的侧信道检测方法在旧版 KPatch-Next 上也同样可行；但最新版 KPatch-Next 以判断用户态 kpatch-android 组件的 uid 实现鉴权，不再会被侧信道检测。
社区实测：这一条**不稳定、概率出现**，同版本管理器在不同设备可能一报一不报（可尝试**降级管理器**）；APatch 开启排除列表后也容易出现。

### 发现APatch 的鉴权密钥

#### 检测方式

以“**系统调用参数页被额外读取**”为判据的侧信道。检测器把目标调用的参数/缓冲区放在一块受监控的用户页上，测量调用前后该页被内核读取的页数（kB）：
- `No-read control`：一个“内核按语义不应读取该页”的调用 → 期望 `0→0 kB`；
- `Read control`：一个“内核应当读取该页”的调用 → 期望 `0→4 kB`；
- `Target call`：目标调用 → 若出现 `0→4 kB, unexpected read`，说明内核在该 syscall 路径上**多读了一次用户内存**，即该路径被内核补丁（KernelPatch / APatch 的鉴权路径）额外处理。

该条目同时会输出 `Argument layouts`（内核读取系统调用参数的寄存器布局探测）、多轮一致性 `Consistency: n/n`、`Page size` 与 `Probe duration`（秒级，采样较重）。

**与 `Abnormal Environment` 的关系**：两者针对同一类“鉴权路径”侧信道——仓库内 [KSU/APatch 侧信道说明](/File/Doc/ksu_kp_sidechannel_zh.md) 描述的是“懒分配页是否被映射”与“鉴权时延比值”两种口径；本条是按**页读取量**做对照的实现，属同一思路的不同变体，可互相印证。

#### 解决办法

**目前暂无可用模块**。这类内核级隐藏 KPM 拦截的是“鉴权请求是否被处理”，而本条测量的是“内核在该 syscall 路径上是否**额外读取了用户参数页**”——该读取发生在拦截点**之前/之外**，因此把检测器加入该 KPM 的 排除列表（或改用按 uid 鉴权的 KPatch-Next）**并不能**让本条消失。需要等待 KernelPatch / APatch 侧修复（让被补丁的 syscall 路径不再额外读取用户参数页），或上游调整该检测项。

#### 备注

该条目在英文界面下目前**没有对应的英文标题**（仅中文显示）。

### KernelSU loop device

#### 检测方式

检查是否存在 KernelSU 特征的 loop 设备挂载。

检测到 KSU

更新你的管理器并重新修补
更新管理器并重新修补；或关闭/更换元模块（如 Hybrid-Mount，见序章「相关模块推荐」）。

### Suspicious Surroundings

#### 检测方式

环境类异常检查（`/data/local/tmp` 元数据、可疑进程 / 服务等）。

检测到 APatch

更新 APatch，并加载 KernelPatch 隐藏模块（如 NoHello.kpm，见序章「相关模块推荐」）。

### ROOT进程

#### 检测方式

通过 AVC 审计日志（`logcat -b events` 中的 `auditd` 记录）与 `/proc/*/attr/current` 交叉，找出以 root 相关 context 运行的进程。

检测 Zygote 环境?

通过审计日志漏洞读取 (avc)

可使用内核级隐藏功能（SusFS 等）或审计日志补丁类内核方案

Android 安全更新 2025/09/01 已修复（不准确但结果是这样的）

### 异常进程0000（pid）

#### 检测方式

同上（审计日志泄露）；0000 为该进程 pid，可用 `ps -ef | grep <pid>` 反查。

0000 代表的是进程的 pid

你可以尝试使用 shell 指令以 root 执行 `ps -ef | grep 数字id` 来查找对应 pid 进程，通常是拥有 root 权限的守护进程（如 lspd 进程、Tricky-Store 进程）

#### 解决办法

此检测依赖安全漏洞，更新安全补丁到 2026/01/01 可显著降低检出率，但目前无法完全解决，此安全漏洞将在 Google 正式发布 Android 17 后完全修复。

安全补丁更新往往伴随系统更新，如果因为不想更新系统而无法更新安全补丁，可以忽略此条目。

双开应用有时可以使此检测方案失效，但不会实质上解决此安全漏洞，所以双开应用不应被视为可行的方法。

会有误报现象

### Zygote 存在异常

#### 检测方式

读取本进程（应用 zygote 子进程）的 GID 列表，检查 **GID 3009（AID_READPROC）**是否存在（探针输出 `readproc_gid_3009=present/missing`）→ 缺失即命中（**该 GID 缺失的致因尚不能确认**）。

（社区说法）应用自身 zygote 的补充 GID 被限制。
在HMA-OSS模块中对春秋检测关闭「限制 zygote 权限」里的 `INET_GID`。

补充：该开关按**黑名单**移除用户勾选的补充 GID（HMA-OSS 的可选项为 1015 / 1023 / 1032 / 1077 / 1078 / 1079 / 3003 / 9997 共 8 项，**不含 3009**）。本条的**判据**确定为「GID 3009 缺失」，但**致因是否来自该开关尚不能确认**。

### Current-app-root-domain-trace

#### 检测方式

以 `untrusted_app` 身份遍历 `/proc` 的 PID，逐个读 `attr/current`、`cmdline`、`comm`（正常应全被 SELinux 拒绝），随后去 `auditd` / `logcat` 里翻 AVC denied 记录，出现 `tcontext=u:r:ksu:s0` 一类即命中（探针 `proc_pid_avc_context_leak`）。

以 `untrusted_app` 身份遍历 `/proc` 的 PID，逐个尝试读取 `attr/current`、`cmdline`、`comm`（正常情况下应全部被 SELinux 拒绝），随后翻 `auditd`/`logcat` 的 AVC denied 记录，若出现 `tcontext=u:r:ksu:s0` 一类即可命中。
**KSU · LKM**：刷入对应版本的 PathMask 并开启「隔离防护（procguard）」，或刷入 审计日志补丁类内核方案（可能导致其它检测项泄露）；
**KSU · GKI**：在管理器设置中打开「AVC 日志欺骗」；
临时办法：禁用传统 su 支持，过一遍检测后再打开。

### 发现 ROOT 管理器

#### 检测方式

native 方法 `runRootManagerIntentChecks` —— 用 Intent / 包可见性（`<queries>`）探测 root 管理器是否安装或能否响应（对应新版 manifest 新增的 `me.bmax.apatch.magica.LAUNCH`、KSU `magica.LAUNCH`、`ksu://` 等条目）。

#### 解决办法

使用**应用隐藏模块**把 root 管理器对检测器隐藏即可（见「相关模块推荐」与「模块正确配置」）。

关系：与 `Found ksu/免解设备`、`Suspicious Surroundings`、`SU binary detected`、`检测SELinux Policy时发现可疑问题 / 检测到ROOT权限` 同属“ROOT 痕迹”类，可能同时命中。

---

## TEE 与密钥证明检测

### TEE 伪造(2)

#### 检测方式

通过 Keystore2 反射创建同时具备 `SIGN + ATTEST_KEY` 用途的密钥：正常设备应拒绝这种混合用途（如 `-3`）；若密钥能正常签名，但“带 challenge / 不带 challenge”两组子证书签发都失败（如 `-49`），判为 TEE 伪造(2)。

先确认普通签名、纯 ATTEST_KEY 密钥签发子证书都正常。
通过 Keystore2 创建同时具有 SIGN + ATTEST_KEY 用途的密钥。
如果它能正常签名，但有、无挑战两组测试中，签发子证书都返回 -49，就报 “TEE 伪造(2)”。
创建时正常拒绝混合用途（如正常机的 -3），或两种能力都正常，都不会报。

#### 解决办法

更换 / 更新密钥模块（见序章「相关模块推荐」与「模块正确配置」），配置后重启复测。

### TEE环境不可信

#### 检测方式

检查 Tencent Soter 服务程序是否存在 + 其服务属性状态，两者交叉验证 Soter key 是否被屏蔽（四象限判定，见下）。

来自 Tencent 的 [SoterService](https://github.com/Tencent/soter)
作用: 微信的指纹支付等。

通过检查文件来判断是否存在 Soter 服务程序以及判断其服务点属性状态来交叉验证是否存在 Soter key 被屏蔽的情况。
1. 服务点属性状态异常 + Soter 服务程序存在 -> Soter 被屏蔽（异常）

2. 服务点属性状态异常 + Soter 服务程序不存在 -> 此设备原生不支持 Soter 服务（正常）

3. 服务点属性状态正常 + Soter 服务程序存在 -> 此设备支持 Soter（正常）

4. 服务点属性状态正常 + Soter 服务程序不存在 -> 不可能

#### 解决方法

- 等待模块更新（不太可能实现 SoterService 的修复）
- 使用 SusFS 或 PathMask 隐藏相关服务路径，并使用应用隐藏模块对检测器隐藏 Soter 系统服务应用程序尝试解决

*注意*：PathMask 并不专注于环境隐藏，请慎用。

*原理*：目前在技术上我们无法模拟 Soter 服务，但可以隐藏 Soter 相关文件来伪造第 2 种情况。

### Tampered Attestation Key(X)（含 16 / 31）

#### 检测方式

对密钥证明证书链做 20+ 类标签一致性校验，例如：叶证书 `KeyUsage` 与扩展 `KeyPurpose` 是否矛盾、叶证书签名算法与签发钥算法是否一致、证书内的安全补丁标签与系统属性是否一致、无 challenge 却带 `APPLICATION_ID`、`USER_ID` 出现在 `teeEnforced`、厂商占位 tag 仍成功签发等；命中时会给出具体标签编号。

#### 常见标签编号

- 15：HanAttest 链不一致（与 TeeSim 常量不同源，但同在 mask 里）
- 16：HanAttest 链不一致一族（多为误报）
- 18：厂商占位 KeyMint tag 仍成功输出密钥
- 23：叶证书 KeyUsage 与扩展内 KeyPurpose 矛盾
- 24：Binder 超长 alias / 大事务探针异常；**也可能是密钥模块注入不完整的连带表现**（Zygisk 未注入时 TEESimulator-RS 一类模块工作不正常）→ 先按「连锁项先归因」确认 Zygisk 注入，再重测
- 25：叶证书 SigAlg 与签发钥算法不符
- 26：证书 patch 标签与系统属性不一致（见下方脚本）
- 27：USER_ID 出现在 teeEnforced
- 29：无 challenge 却有 APPLICATION_ID
- 30：敏感设备标识类 attest 未被拒绝（如 SERIAL）
- 31：安全补丁日期异常（国内厂商统一为 YYYY-MM-01；Lenovo / 努比亚会更新到 05 日期；pixel / Samsung 已排除）

#### 解决办法

- **26**：[执行此脚本](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution/blob/main/File/Tampered%20Attestation%20Key(26)Pass.sh) 写入 `/data/adb/tricky_store/security_patch.txt`；
- **小米 / 红米注意**：2026-03 前后更新的系统，其构建时间与安全补丁时间本身就不一致，**不管是否 root 都会报（26）→ 无视即可**；魔改版密钥模块、一键隐藏模块、部分改机模块也会导致，换回原版或卸载；
- **16 / 31**：纯误报居多（假回锁、未 root 也可能概率命中）→ 重测或直接无视。

### TrickyStore Hook/2

#### 检测方式

对比 Keystore 返回的证书链 / 密钥属性与真机 TEE 特征差异（含侧信道方式，不稳定）。

侧信道（不稳定）重新打开或许消失

更换密钥模块（如 TEESimulator-RS / OhMyKeymint）

### 发现TrickyStore/类似模块

#### 检测方式

证书链为模块生成（合成链），与真实 TEE 链特征不符。

**尝试1**：更换密钥模块（如 TEESimulator-RS / OhMyKeymint）

**尝试2**：把 `/data/adb/tricky_store/security_patch.txt` 文件删除

### TEE 伪造

#### 检测方式

证书链 / 密钥属性显示 TEE 行为被模拟。

使用密钥模块解决（证书链生成模式）。

### TEE 损坏

#### 检测方式

TEE 侧密钥 / 证书链不完整或不可用。

使用密钥模块解决，搭配 TS 插件。

刷入后请重启，开机后打开模块的 webUI 进行配置。

TEE 损坏的设备请使用生成证书链模式。
在 `/data/adb/tricky_store/target.txt` 中给本检测器包名加 `!`（表示强制处理），并可用脚本批量写入：
```
su
TRICKY_DATA="/data/adb/tricky_store"
{ echo "com.google.android.gms!"; echo "com.android.vending!"; pm list packages -3 | sed 's/^package://;s/$/!/'; } > "$TRICKY_DATA/target.txt"
```

### 密钥证明未完成或链不一致

#### 检测方式

密钥证明证书链不完整或与预期链不一致。

使用密钥模块并配置后尝试解决

### AOSP密钥

#### 检测方式

keybox 使用 AOSP 测试根（而非厂商 / Google 正式根）签发。

更换 `/data/adb/tricky_store/` 目录下的 `keybox.xml` 文件。

也可选择刷入 TS 插件，重启后打开模块的 webUI 界面进行密钥配置。

### Boot Hash不匹配

#### 检测方式

比对 boot / vbmeta 的 hash（如 `ro.boot.vbmeta.digest`）与基线值。

boot 镜像的 Hash 不匹配。

通常**真解锁设备**的 hash 会变成 0000，使用 [Native detector](https://t.me/rootdetector/49) 获取正确的 hash 后使用密钥模块并使用 TS 插件 配置 hash 解决。
打开密钥认证，取 `VerifiedBootHash` 的值，用 TS 插件写入。

### Bootloader unlock / 解锁属性

#### 检测方式

读取 bootloader 锁定状态相关属性 / 认证结果 —— `ro.boot.flash.locked`、`ro.boot.verifiedbootstate`、`ro.boot.vbmeta.device_state` 等（`0` / `orange` / `unlocked` 表示已解锁）。

#### 解决办法

- **真解锁设备**：使用密钥模块把解锁状态对检测器隐藏，并按「模块正确配置」把检测器加入包名列表（target 列表实时生效，无需重启）；
- **假回锁 / 免解 / 自签设备**：设备对外本就是“已锁定（locked & green）”，通常不会命中此项（该状态由启动链早期方案，如 efisp 一类提供）。

组合方案见 `启动状态异常`；另有反馈 iQoo/Vivo 橘子 5 不报、橘子 6 报（未确认是否误报）。

### 启动状态异常

#### 检测方式

读取 verified boot 状态（如 `ro.boot.verifiedbootstate`）与预期比对。

#### 真解锁设备

Bootloader（ABL）解锁标志已被真实置位，系统放行未经签名校验的底层镜像并允许刷写。该设备的解锁状态会如实反映在系统底层属性与 KeyMint 硬件级凭据（Attestation）中。
社区在测试中的组合尝试：更新 密钥模块(-v307) + TS 插件 v5.0-beta1 → 管理器设置里关闭「卸载模块（内核级）」→ Zygisk 实现模块 设为「仅还原挂载」→ 冻结手机管家（小米可用按应用隐藏 / 冻结方案并打开「禁用环境检查」）→ 把属性隐藏脚本放入 `/data/adb/service.d/`。

### 证书已被吊销(CRL)

#### 检测方式

证书序列号命中吊销列表（本地静态库或在线查询）。

更换 `/data/adb/tricky_store/` 目录下的 `keybox.xml` 文件

### 密钥篡改 / 证书链篡改(x)

#### 检测方式

- 密钥篡改：密钥 / 证书链属性一致性判定未通过，命中时会给出分组；
- 证书链篡改(x)：Java 层读取系统属性 `ro.secureboot.lockstate`（该属性与 `ro.lenovo.series`、`ro.lewa.version`、`ro.meizu.product.model`、`ro.miui.ui.version.name`、`ro.vivo.os.build.display.id` 等厂商 ROM 属性在同一张表里），取到 `unlocked` 即命中。

#### 分组说明

- **128**：最常见。密钥模块在一加 / 高通设备上默认使用“证书链生成模式”时容易出现；
- 其它分组（如 q、b）原因暂未公开。

#### 解决办法

- 密钥篡改：更换 / 更新密钥模块，并按「模块正确配置」完成配置（target 列表、安全补丁日期、boot hash）；
- 证书链篡改(x)：`su -c '/data/adb/ksud' resetprop ro.secureboot.lockstate locked`（Magisk 用 `resetprop`）。

关系：与 `密钥证明未完成或链不一致` 同属证书链 / 密钥一致性族。

---

## 挂载与命名空间检测

### mountinfo

#### 检测方式

在进程早期先拍一次 mountinfo 快照，之后与运行期视图对照，两者不一致即命中（`Mountinfo view drift`）。

通过两种手段获取出来的挂载视图不一样。可能存在隐瞒的问题,有时某服务处理不及时就会报（极早 mountinfo 快照 vs 后期对照）

小米设备通常在开机后系统高占用时，打开检测器会出现此检测项。
刚开机时命中多半是快照期误差：**开机后等 20 秒~5 分钟再测**。

### zygote test (1) / App Zygote 分叉顺序异常

#### 检测方式

app_zygote（应用 zygote）内的 fork 顺序探针 —— 用 `/dev/socket/logdw` 打开日志 socket 取 identity / cookie，按 `prepare/parent/child`、父子存活与 fd 关闭顺序判断是否存在 **Zygisk 早于 app-zygote 注入** 的残留；属侧信道类，不稳定。

#### 解决办法

打开 Zygisk 实现模块的「链接器功能」与「匿名内存功能」；排除列表策略设为「仅还原挂载」；不稳定时可直接重测。

### Inconsistent mount / 不一致的挂载（debug_ramdisk）

#### 检测方式

把 `/proc/self/exe` 解析出的挂载与 `statfs` 得到的文件系统类型做比对，类型不一致即命中；另有 `/debug_ramdisk` 挂载视图不一致的变体。

#### 解决办法

`su -c umount /debug_ramdisk`。

备注：部分设备存在暂未修复的误报现象（3.4 版本已修复其中一部分）。

### Mount loophole

#### 检测方式

检查系统修改类模块的 magic mount 是否对系统分区生效。

Magic Mount 对系统修改模块挂载生效

但挂载需要其他模块来隐藏（可选择 SusFS/Zygisk 实现模块）

使用 Zygisk 实现模块 的排除策略 > 仅还原挂载，并配置排除列表 / 开启默认卸载模块对其实施隐藏。
使用 Zygisk 实现模块 排除策略「仅还原挂载」；或更换元模块（社区推荐 **元模块**）。

### Magic Mount

#### 检测方式

检查 magic mount（模块对系统的挂载改写）痕迹。

检测到 Magic Mount

请尝试排除某些针对系统修改的模块，使用某些模块隐藏这个问题（比如 Zygisk 实现模块 中的排除策略）。
同上：Zygisk 实现模块「仅还原挂载」/ 更换元模块（如 Hybrid-Mount，见序章「相关模块推荐」）。

### 挂载间隙

#### 检测方式

检查挂载组 ID / peer-group 表的连续性：组 ID 出现跳跃（如 1,2,3,6,7…）或 peer-group 表不一致（存在被隐藏的挂载点）即命中。

在此判断方法中，当挂载组 ID 增长不连续时（例如 1,2,3,6,7,8...）判定为存在隐藏 root 行为；反之，当挂载组 ID 增长连续（例如 1,2,3,4,5,6,7...）则正常。

当 Magisk 系切换 namespace 时将出现此现象，而对于 KernelSU 系/APatch 系，如果使用了某些具有绑定挂载功能的模块也可能出现此现象。

#### 解决办法

- **Magisk 系**：使用 Magisk Alpha 可解决，原理未知。
- **Kernel 系/APatch 系**：尝试更换"元模块"解决或者更新 ROOT 管理器。

如果问题仍存在，请检查具有绑定挂载功能的系统模块，以及系统是否原生存在此现象。

*注意*：在少数 ROM 中原生存在此现象，如果属于这种情况请忽略此条目。
更换元模块（如 Hybrid-Mount，见序章「相关模块推荐」）/ 更新 root 管理器并重新修补；使用 Scene 的话请更新 Scene。

### UID Namespace mismatch（同 UID 命名空间不一致）

#### 检测方式

同一 UID 下的 user namespace 视图不一致（`UID namespace mismatch for same UID`）。

处理：检查隐藏框架是否改动了 namespace；更换 / 更新元模块后重测。

### Mount Namespace（挂载命名空间）/ Mount namespace anomaly

#### 检测方式

挂载命名空间视图异常（`Mount namespace anomaly`）；与 `不一致的挂载/debug_ramdisk`、`挂载间隙` 相关但判据不同（这里比的是 namespace 视图，不是挂载表 / statfs）。

处理：同挂载类（Zygisk 实现模块「仅还原挂载」/ 更换元模块（如 Hybrid-Mount）/ PathMask、SUSFS 隐藏）。

### PID Namespace（进程命名空间）/ PID namespace anomaly

#### 检测方式

进程命名空间视图异常（`PID namespace anomaly`）。

处理：检查隐藏框架 / 元模块对 namespace 的改动，更新后重测。

### 挂载异常(X)

#### 检测方式

挂载表扫描（`verdict=hit: peer-group table inconsistency (hidden mount points)`、`suspicious mount entry`、overlay 检测等），命中后会把具体 `/dev/block/...` 或模块名放进展开详情。

检测到某些模块 / 应用的挂载。
**KSU · LKM**：按条目展开给出的 `/dev/block/xxx` 路径用 PathMask 隐藏后热重载；**GKI + SUSFS**：在 SUSFS 中写入对应隐藏路径；**GKI 无 SUSFS**：参考 LKM 方案；其它管理器暂无方案。
若展开内容里出现 **overlay** 字样 → 更换元模块（如 Hybrid-Mount，见序章「相关模块推荐」）；若确定是某模块导致的挂载 → 卸载该模块。
关系：与 `/data/local/tmp 元数据异常族`（含 `2222`、`Futile hide 04`）、`Mount loophole`、`Magic Mount`、`挂载间隙` 同属挂载类；处理手段相同（Zygisk 实现模块「仅还原挂载」、换元模块（如 Hybrid-Mount）、PathMask/SUSFS 隐藏）。

#### 补充：模块自身 bind 挂载的**源路径泄露**（最容易被忽略的一类）

上面给的是「把已经泄露的路径藏起来」。但还有一类挂载异常**不是隐藏没做好，而是模块自己的挂载做法就有问题**：
判定读的是挂载源的**根路径**（mountinfo 第 4 列）。模块若直接从自己的目录 bind，路径当场暴露：

```
suspicious_mount[0]=pid=22931(canProbeService)
/dev/block/dm-61 /adb/modules/xm15_baa_change_all/configs/BAA_config_xuanyuan.json
/odm/etc/charger/BAA_config_xuanyuan.json f2fs rw,nosuid,nodev,noatime ...
verdict=hit: suspicious mount entry
```

这种情况**不需要 PathMask / SUSFS**，改模块脚本即可。
**修法：先把文件复制到 `/dev` 下已存在的 tmpfs，再从暂存区 bind。**

```sh
STAGE=/dev/baa_stage
mkdir -p "$STAGE"
STAGED="$STAGE/BAA_config_${CONF}.json"
cp -f "$SRC" "$STAGED"
chmod 644 "$STAGED"

# 关键：上下文必须与挂载目标一致，否则 SELinux 会挡
CTX=$(ls -Z "$TARGET" 2>/dev/null | awk '{print $1}')
[ -n "$CTX" ] && chcon "$CTX" "$STAGED"

mount --bind "$STAGED" "$TARGET"
```

挂载源变成 `tmpfs`、根路径只剩文件名，`/adb/modules` 消失：

```
0:18 /baa_stage/BAA_config_xuanyuan.json /odm/etc/charger/BAA_config_xuanyuan.json rw,relatime - tmpfs tmpfs ...
```

要点：

- 暂存目录**必须复用已有 tmpfs（如 `/dev`）**。自己 `mount -t tmpfs` 新建暂存区会**多出一条 mountinfo 记录**，可能被别的判据命中，等于拆东墙补西墙；
- **toybox 的 `chcon` 不支持 `--reference=`**（这行会静默失败，文件带着错误上下文），必须像上面那样显式取；
- 改**已安装**模块的脚本，直接改 `/data/adb/modules/<id>/` 即可，不需要走 `modules_update`（只有「安装 / 更新模块」才必须落到 `modules_update`）。

### /data/local/tmp 元数据异常族（Futile hide / 1 / 2 / 04 / 2222）

#### 检测方式

都属于对 `/data/local/tmp` 目录**元数据**（时间戳 / inode / 属主 / 权限）的异常判定，app 内是 5 条独立文案：
- `Futile hide`：目录时间戳被修改；
- `Futile hide 1` / `Futile hide 2` / `Futile hide 04`：同类元数据异常的不同变体；
- `2222`：与挂载 / 元数据相关的变体。

#### 解决办法

`su -c rm -rf /data/local/tmp` → 重启 → 再按 `Suspicious Surroundings (a)/(b)/(c)`（属主 / inode / 权限）逐项修复；`Futile hide 1` 也可以先重启再测。

关系：与 `Suspicious Surroundings`、`/data/local/tmp denied` 同一族，处理手段相同。

---

## 环境、进程与文件检测

### Miscellaneous Check(12)

#### 检测方式

用 `smaps` 的页面驻留（`Referenced`）配合 `MADV_COLD` / `clear_refs` 做启发式扫描，探测隐藏映射或 Zygisk 类实现；当前实现存在问题，可能失效或误报。

通过扫描 smaps 启发式探测 Zygisk 实现（特别是 Zygisk 实现模块），但目前的实现方式存在问题，导致检测失效。

在检测方法被修复或移除前请忽略此条目。

### Looper fd图异常

#### 检测方式

读取本进程 fd 目标（`/proc/self/fd` + `readlink`），把 fd 图（打开的文件 / socket / 匿名 inode）与预期做对比。

暂时未知
部分老内核可能出现此检测项，修复方法暂时未知。

### HMA或许存在

#### 检测方式

检查是否存在 HMA（隐藏应用列表）相关服务 / 包特征，而检测器自身看不到对应应用。

疑似检测旧版使用 Scene_Hide-eBPF 模块行为（检测不到 scene 应用程序存在，但检测到相关服务）

[分支项目/拉取更新重新构建模块并刷入/从Releases中下载](https://github.com/Andrea-lyz/Scene-Port-Hider-by-eBPF)
若为老版本/破解版/非官方 Scene：参考 [Scene-Port-Hider-by-eBPF](https://github.com/Andrea-lyz/Scene-Port-Hider-by-eBPF)；官方版 Scene 更新到最新即可。
（注：HMA（隐藏应用列表）与 Scene 是两个不同用途的模块，本条与「检测到 Scene 端口占用」可能同时出现，分别处理。）

### fdinfo mnt 采样异常（c）

#### 检测方式

读取 `/proc/*/fdinfo` 中的 `mnt_id` 做抽样统计，与挂载视图交叉验证；USB 调试残留或临时挂载容易触发。

大概率为检测到 USB 调试痕迹，小概率误报。可使用脚本[调试痕迹消除](https://github.com/YiJieqwq/ADB-Trace-Cleaner/releases)尝试解决。

### 内存异常

#### 检测方式

页驻留 / 软脏位类探针（`clear_refs`、`smaps`、`MADV_COLD`），用于发现隐藏或异常映射。

清除检测器数据后若还存在，那么请开 Issues 并提供你的模块列表信息以及使用了哪些 xp 模块，我有时间会研究的。

### 风险应用 / Risk apps‘软件包名’

#### 检测方式

读取 `/storage/emulated/0/Android/data/` 下的目录名以获取已安装包名（普通应用通常没有该权限），在可绕过时借助 **Unicode 零宽字符**绕过读取限制（并非固定手段），再与风险名单比对（名单见附录 A）。

#### 解决办法

- 有效组合：**应用隐藏模块黑名单模式 + 零宽读取修复方案**（[FuseFixer](https://github.com/5ec1cff/FuseFixer)）；部分机型开启作用域后可能卡开机，安全模式关掉即可；
- 只想让春秋这一项通过：在应用隐藏模块里对检测春秋检测打开「限制 zygote 权限」，除 `INET_GID` 外全开；
- 这类判定手段未知的条目，也可用应用隐藏模块把可疑应用对检测器隐藏。

若这串包名**确实已经在应用隐藏模块的隐藏名单里**，那多半不是名单问题，而是**应用隐藏模块压根没运行**（Zygisk 未注入）→ 见「连锁项先归因」。

### Dirty Device(a)

#### 检测方式

检测 `/storage/emulated/0/`（`/sdcard`）下**名字含 `sh`** 的文件夹 / 文件，以及外挂相关的文件 / 驱动（部分版本还会结合“替换密钥行为”一起判定）。

#### 解决办法

这条的含义就是「检测到设备上存在**游戏外挂**相关文件」→ **自己删掉即可**；删除后重启再测。

### 环境存疑1（实验性检测）

#### 检测方式

实验性环境一致性判定（社区反馈：应用隐藏模块 黑名单模式 + 勾选“输入法”预设时出现）。

在 应用隐藏模块 中对检测器开启黑名单模式隐藏后，若勾选了设置预设中的“输入法”选项后，此检测项就会出现？

### Evil Service

#### 检测方式

检查是否存在 LSPosed / Shizuku / 各类 Xposed 模块相关的服务或绑定。

关于 lsp, shizuku 还有一些 xp 模块的修改检测。
先排查 `/sdcard` 与 `/data/local/tmp` 下模块释放的异常文件。

### Miscellaneous Check（a）

#### 检测方式

检查 dex2oat 相关标志（如 `dalvik.vm.dex2oat-flags`）；LSP / Xposed 类模块往往会修改它们。

检测到 dex2oat（通常是 LSP 的问题，更换/更新 LSP 模块）。

### [Hook] Suspicious library injection

#### 检测方式

检查库注入痕迹（zygisk / riru / xposed 常见特征）。

(zygisk/riru/xposed)

检测到 HOOK，自行排查原因，因素过多。

### 设备为模拟器

#### 检测方式

检查模拟器 / 虚拟化特征，如 `/dev/goldfish_pipe`、`/dev/qemu_pipe`、`/dev/socket/genyd`、`/sys/qemu_trace` 等，以及 `goldfish` / `ranchu` / `qemu` / `genymotion` / `bluestacks` / `ldplayer` / `nox` / `memu` / `ttvm` / `vbox` / `vmware` 等机型关键字；同时引用 `android/os/BatteryManager` 与 `android/telephony/TelephonyManager`，即也会参考**电量 / 充电状态与 SIM 状态**。

#### 解决办法

先卸载重装检测器；避免在**未插 SIM 卡 + 满电 + 充电**的状态下测试。

### Found LSPHook Framework

#### 检测方式

检查 LSPosed / LSPatch 一类框架的运行痕迹。

检测到 LSPHook Framework

某些 xp 模块修改导致，也可卸载更换 LSP 模块。

### 检测到Scene端口占用

#### 检测方式

检查 Scene 使用的本地端口 / 服务是否在监听。

请查看此[项目](https://github.com/Andrea-lyz/Scene-Port-Hider-by-eBPF)并尝试解决。

无视此检测项，或者关闭 scene 的无障碍权限，或将 scene 更新到 9.3.1 以上。

### Zygisk detected

#### 检测方式

检查 Zygisk 注入痕迹（匿名可执行映射、进程环境、模块入口等）。

检测到 Zygisk，通常是 magisk 自带的 zygisk 导致（关闭解决）或者其他原因。

升级 Zygisk 实现模块（如 Zygisk Next）。**注意：`github.com/Dr-TSNG/ZygiskNext` 及其所属组织整站已 404**（2026-09 实测），请改从官方更新通道获取：`https://lsposed.zip/zygisk-next/update.json`。
同时确认 `zygiskd status` 的 `zygote_states` 是否 ≥ 1 —— 详见 [连锁项先归因](#连锁项先归因确认zygisk-是否真的注入)。

### Suspicious Surroundings (a)

#### 检测方式

对 `/data/local/tmp` 做元数据检查：目录属组是否为 `shell`。

`/data/local/tmp` 文件夹所有组异常。

#### 解决方案

所有组改为 shell。
社区实测：该条判的是 `/data/local/tmp` 的**属主 / 属组异常**（原文档写的“所有组异常”与之对应）；统一改回 shell 即可：`su -c chown shell:shell /data/local/tmp`。

### Suspicious Surroundings（b）

#### 检测方式

检查 `/data/local/tmp` 的 inode 值是否偏高（社区实测阈值为 **> 10000**；该目录曾被删除 / 重建时 inode 会异常增大）。

#### 解决方案

（任选其一）：
1. 恢复出厂设置；

2. 使用内核级隐藏把该路径的 inode 伪装成小于 1000；

3. 使用 [Inode-Hijacker](https://github.com/YiJieqwq/Inode-Hijacker/releases) 脚本（下载执行即可；执行不了的换老 release）。

注意：**使用 Inode-Hijacker 之后，如果出现有线投屏（如 Scrcpy）不可用**，执行 `su -c restorecon -RF /data/local/tmp` 恢复即可。

### Suspicious Surroundings（c）

#### 检测方式

检查 `/data/local/tmp` 的权限是否为默认值（771）。

`/data/local/tmp` 的权限被修改（默认 771）。

#### 解决方案

重新设置权限。
权限改回默认：`su -c chmod 771 /data/local/tmp`。

### /data/local/tmp denied

#### 检测方式

检查 `/data/local/tmp` 是否可访问（权限 / 是否存在）。

目录 `/data/local/tmp` 拒绝访问，文件夹权限设置问题? 文件夹不存在?
同上：删除该目录后重启，再按新出现的条目处理。

### 终端环境存疑

#### 检测方式

检查是否存在 pty（终端模拟）痕迹。

检测 Pty。

### MT管理器（MT2文件夹）/异常文件

#### 检测方式

检查 `/storage/emulated/0/MT2/`、boot.img、`.xml` 等文件。

异常文件：检测到根目录下的“mt2”文件夹与 boot.img / “.xml”异常文件。

“mt2”可在 MT 管理器设置中对 MT2 路径自定义修改解决（记得删除旧文件夹）。

### Thanox service detected

#### 检测方式

检查 Thanox 相关服务。

检测到 Thanox 服务。

可以使用这个 xp 模块来隐藏：[hideThanox](https://t.me/Suxiaomingpd/125)。

### 异常文件

#### 检测方式

在 `/dev`、`/data`、`/data/local/tmp`、`/storage/emulated/0` 等位置匹配高危文件名与外挂特征（清单见附录 B）。

#### 检测路径

`/dev` 和 `/data/local/tmp`
1. 重命名/删除相关目录文件。

2. 排查并删除以下高危路径：
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
命中后，条目会把**实际命中的路径**直接给出（社区称“一条路径”），按提示删除即可。

### 检测运行环境可疑 / 容器 / 多开

#### 检测方式

校验 `/proc/self/cgroup` 的路径格式是否匹配 `^0::/uid_\d+/pid_\d+$` 或 `^0::/apps/uid_\d+/pid_\d+$`（两个正则直接内置在代码里），并结合 parallel / clone 相关探针（`parallel_ok=`、`signal_parallel_access_mismatch=`）；格式异常或探针不一致即命中。

检测到应用处于多开 / 沙盒 / 容器环境。
卸载重装春秋检测；**不要对春秋检测使用应用双开**。

### 发现异常模块

#### 检测方式

命中温控 / 调度 / 优化类模块的特征签名，其中最常见的是 **Encore Tweaks** 家族：管理端应用、`/system/bin/encore_profiler`、`/data/encore/default_cpu_gov`、`/data/encore/custom_default_cpu_gov`、`/data/local/tmp/encore_logo.png`；命中时会分别报 `Encore 管理端已安装 / Encore Tweaks 模块 / Encore Tweaks 可能` 等文案。

#### 解决办法

排查并卸载相关模块（此类条目多为概率命中，可多重启几次再测）。

### GMS 被屏蔽

#### 检测方式

检查 ROM 侧“屏蔽 GMS”的特征文件与可执行文件 —— `/my_product/etc/permissions/oplus_google_cn_gms_features.xml`（OPPO / 一加国内机型，检测器会直接 `access` 该路径）、`/system/bin/gmsc`；另有 PIF 类属性 `persist.sys.pihooks.disable.gms`、`persist.sys.pixelprops.gms`、`persist.sys.spoof.gms`。

#### 解决办法

检查是否用应用隐藏模块隐藏了系统组件（Google 服务套件），或排查 ROM 侧 GMS 问题。

### /dev/cpuset/AppOpt

#### 检测方式

该路径属“线程 / 调度模块挂载”的特征签名（与 `/data/swap_config.conf`、`/data/encore/*_cpu_gov`、`/data/local/tmp/yshell` 等在同一张特征表里），目录存在即报。

检测到线程 / 调度类模块的挂载。
卸载对应线程模块。

### /system/bin/fastboot 和 /system/bin/adb

#### 检测方式

对系统可执行文件做异常存在性检查（`/system/bin/adb` 已确认在特征表内，`fastboot` 待确认），常见于小米官改包。

检测到异常可执行文件（常见于小米官改包）。
刷回官方包；或用 PathMask 隐藏这两个文件。

### OBB 目录存在异常

#### 检测方式

用多种只读方式读取应用**自身的 OBB 路径**并比对结果：`statx` / `newfstatat` / `openat_chain`（探针 `self_obb_path_visible`、`inconsistent_read_only_views`）→ 各视图不一致（说明有模块在拦截 / 隐藏该路径）即命中。

安装了试图阻止检测器扫盘的模块。
暂按**误报**理解；可在 应用隐藏模块 中对春秋检测开启「限制 zygote 权限」（除 `INET_GID` 外全开）。

### USB 调试已开启

#### 检测方式

native 方法 `runFormalUsbDebuggingCheck`；静态产物中未见 `adb_enabled` 一类设置项串，推测与 `adbd` / `adbroot` / `adb_data_file` 相关的 SELinux 规则族有关（与 SELinux 规则探测同源），具体判据待确认。

#### 解决办法

关闭 USB 调试（`su -c settings put global adb_enabled 0`）；可写入 `/data/adb/service.d/` 实现开机自动关闭。

关系：与 `fdinfo mnt 采样异常（c）` 都涉及 USB 调试，但判据不同——那条看的是 `/proc/*/fdinfo` 的 `mnt_id` 残留。

---

## 内核、属性与系统特征检测

### 无效的伪造信息(1)

#### 检测方式

Widevine（`MediaDrm`）报告 `securityLevel = L1`、`openSession()` 抛 `NotProvisionedException`、且 `getProvisionRequest().getData()` 返回长度 **0** 的数据时命中。

说明：**当设备报告为 L3 时，此检测点会被直接略过**（只有在 `securityLevel = L1` 时才会继续后续判定）。

#### 现象

设备显示 Widevine L1（DRM Info 与检测器“设备信息”都会显示 L1），但本条目仍判定“与 L1 不符”。该条目在界面上**没有展开详情**（属摘要型条目）。

**第一步：先判断是不是误报**
1. 播放**必须 L1 才能解码**的内容（Netflix / Disney+ / Prime 等的 HD / 1080p+）：
   - 能 HD / 1080p+ 正常播放 ⇒ L1 本体正常，本条**大概率是误报**（已知小米设备、含**未解锁的原厂设备**也会稳定命中），可先忽略并等待版本更新；
   - 只能播放 SD ⇒ 继续第 2 步。

2. 排查“伪装 L1 状态”的模块：密钥模块的 target 列表、`keybox.xml`、安全补丁同步，以及各类 PIF / 属性伪装模块；逐项关闭后**重启**复测。

3. 只在最后才考虑“远程 RKP 密钥（RKPConfig）”：本机若已是 RKP（远程密钥下发）通常无效，目前小米机型普遍无效。

⚠️ **安全提示**：RKPConfig 类应用会让设备向 Google 请求 RKP 密钥下发，会**改变设备的密钥供应 / 认证状态**；安装前请确认来源可信与可撤销性。
社区实测补充：**假回锁 / 免解 / 完全没有 root 的机器也会概率命中**，可直接忽略；若要尝试，仍建议先按上面的「第一步」判断 L1 是否真的可用。

### Found property

#### 检测方式

检查 `persist.logd.size` / `persist.logd.size.crash` / `persist.logd.size.system` / `persist.logd.size.main` 是否被设置为**非空**（非空即命中；这几个属性是日志缓冲区设置，部分模块/脚本会写入）。

执行[此sh](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution/blob/main/File/Found%20property.sh)尝试解决。

### Property Modified（数字代表几处属性修改）

#### 检测方式

扫描属性区空洞：`/dev/__properties__/` 下属性文件的权限 / 属主 / 大小与对应 SELinux context，以及属性区是否存在未被使用的空洞（`prop_area` 重叠 / 空洞）——出现空洞说明属性被动态修改过。

隐藏被修改的属性可使用仓库提供的 [shamiko_Plus.sh](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution/blob/main/File/shamiko_Plus.sh) 文件添加并移动到 `/data/adb/service.d/` 目录下，确认该脚本有执行权限后重启，尝试解决。
注意：`shamiko_Plus.sh` 是用 `resetprop -n` 在早期写属性，需放在 `/data/adb/service.d/` 执行且**不要持久化**，否则反而可能产生新的属性区空洞。

### avb校验异常 avb=2.0

#### 检测方式

读取 `ro.boot.vbmeta.avb_version` 等 vbmeta 属性并与预期比对。

avb 版本异常。

某些模块会造成此问题，比如改机型模块，自行排查模块尝试解决。
若已卸载改机模块仍报，可尝试：`su -c resetprop -n ro.boot.avb_version 1.3`。

### Tampered kernel / 伪装内核

#### 检测方式

读取内核 uname（版本字符串、构建时间）与预设名单 / 基线比对；内核信息被伪装（SUSFS 等）后的一致性判定也在本条。

#### 解决办法

- 使用 SUSFS 等内核级方案隐藏内核名称；伪装内核时把启动阶段选为 `post-fs-data`；
- 也可还原未修改的 boot.img。

开发者原话：原厂系统 + LKM 模式下出现即为误报。

### [hook]Resetprop modified

#### 检测方式

属性被 resetprop 类工具动态改写。

resetprop 被修改。

未知。

### Miscellaneous Check(2)

#### 检测方式

设备 / 机型篡改检测（改机型模块常见触发）。

检测设备篡改/机型篡改。

改机型模块导致? 自行排查。

### Miscellaneous Check(3)

#### 检测方式

改机 / 隔离相关检测（如 Vold appdata 隔离的影响）。

改机检测？

以下方案可能过时：开启过“隐藏应用列表(HMA)”的 Vold appdata 隔离？
注意（待作者确认）：本项与 `Vold隔离已开启` 互相牵制——开启 HMA/应用隐藏模块 的 Vold appdata 隔离可能解本项，但会触发 `Vold隔离已开启`（该属性被写入）；请按更优先的一条取舍。

### Netlink socket anomaly

#### 检测方式

以普通应用身份向 netlink `sock_diag` 发一次查询：正常策略下应被拒绝；若拿到响应，说明 netlink 策略被改写（常见于 root 隐藏方案对该接口的放行）。

暂时未知

### 第三方内核

#### 检测方式

内核版本信息命中预设特征名单。

内核信息符合预设信息名单。

伪装内核信息解决。
用 SUSFS 伪装内核名称。

### 第三方rom/自编译内核

#### 检测方式

内核版本号后缀带 `-Dirty` 等自编译特征。

第三方 ROM 标记。

内核版本号后缀带有 `-Dirty`。

伪装内核信息解决。
用 SUSFS 伪装内核名称。

### 第三方ROM（2）

#### 检测方式

第三方 ROM 特征（第二组）。

暂时未知

### ROM detected

#### 检测方式

系统 / 机型特征命中第三方 ROM 名单。

检测到第三方 ROM。

部分三方 rom 特征符合。

可自行尝试伪装。
用 SUSFS 伪装内核名称。

### 环境伪造

#### 检测方式

不同复现条件下触发面不同——① 刷入审计日志补丁类内核方案后触发（见下）；② 也有反馈指向**属性伪装类模块**（`persist.sys.pihooks_*`、`persist.sys.pixelprops.*`、`persist.sys.spoof.gms` 等，待验证）；自查线索：本进程 maps 中是否出现 PIF / IntegrityFix / PixelProps 相关模块。

旧设备（4系内核）可能误报？

**已知触发面：**
- 刷入审计日志补丁类内核方案后触发 → 卸载该模块；
- **属性伪装类模块**（PIF / pihooks / pixelprops / spoof 类）也可能触发（待验证）→ 用 `getprop | grep -iE "pihooks|pixelprops|spoof"` 检查是否存在属性伪装残留，定位到对应模块后处理，或对检测器隐藏相关属性；
- 部分自定义 / 移植 ROM 自带的机型或属性伪装也可能触发。

### 检测失败

#### 检测方式

该条检测本身未成功完成（环境限制 / 超时等），**不是“命中”**；可重试或忽略。

### Something wrong

#### 检测方式

内部异常 / 未分类命中。

未知

### Miscellaneous Check(4/5/6/7/8/9)

#### 检测方式

模拟器 / 虚拟机、改机行为、三方与移植 ROM 等一组检测；部分机型（如国外设备的 Poco / 三星）存在误报。

一些有关模拟器虚拟机/模拟器的检测/改机行为检测/三方&移植 ROM。

在国外设备 Poco/三星误报情况（待修复）。
社区反馈：海外机型 Poco / 三星有误报；部分设备使用 Scene 也会报。
卸载改机模块后仍报，多是模块残留/行为不可逆导致。

### Vold隔离已开启

#### 检测方式

读取 `persist.sys.vold_app_data_isolation_enabled`（HMA / 应用隐藏模块 的 Vold appdata 隔离会写这个属性）。

关闭HMA/HMAOSS设置终端Vold app data隔离

如果关闭重启后还存在 `persist.sys.vold_app_data_isolation_enabled=0`

su shell执行 `resetprop -p --delete persist.sys.vold_app_data_isolation_enabled` 然后重启即可
注意（待作者确认）：与 `Miscellaneous Check(3)` 互相牵制，见该条说明。

---

## 附录

### 附录 A：风险 / 黑名单包名（85 个）

由社区实测命中汇总整理，随版本变化。

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

### 附录 B：可疑 / 外挂类文件与目录（68 条）

只列出**可疑或外挂相关**的文件与目录（可按需清理）。
`/proc`、`/sys`、`/dev`、`/system` 等系统路径是检测器**读取**的对象，**不要删除**。

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

### 附录 C：被检查的系统属性（34 个）

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
