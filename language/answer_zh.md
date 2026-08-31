# 春秋检测项解决方案（跟进最新版本）中文版
> 整理：铭鐏(mingzun09) | 仅供参考，具体结果因设备/环境而异。
> 解决方案尾巴带“?”符号的都为不确定
> 文档链接：[github](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution)

## 目录
- [说明与反馈](#说明与反馈)
- [Root 权限与 SELinux 检测](#root-权限与-selinux-检测)
- [TEE 与密钥证明检测](#tee-与密钥证明检测)
- [挂载与命名空间检测](#挂载与命名空间检测)
- [环境、进程与文件检测](#环境进程与文件检测)
- [内核、属性与系统特征检测](#内核属性与系统特征检测)

---

## 说明与反馈

<details>
<summary>自行尝试但仍然无法通过的检测</summary>

请开 Issues 并提供你的模块列表信息 + 使用了哪些 Xposed 模块等详细修改，我有时间会回复/帮助。
</details>

---

## Root 权限与 SELinux 检测

<details>
<summary>存在模块修改春秋</summary>

> 使用 IsolPolicy 模块后出现，关闭作用域或者卸载模块解决。
> 
> 并不是只有模块，比如旧版ksu启用了隐藏SELinux修改也算，请尝试跟进相关 root 管理器最新 CI 来解决此问题。
</details>

<details>
<summary>检测SELinux Policy时发现可疑问题 / 检测到ROOT权限</summary>

> 检测方式参考：https://github.com/LSPosed/DirtySepolicy
>
> 新加入的 SELinux 特性检测（应用程序 zygote 拥有访问 `/sys/fs/selinux/access` 的权限）
>
> **KSU 使用者**：[更新KSU管理器](https://t.me/KernelSU_group/3234/482579)并重新修补镜像并刷入后重启，再开启 selinux_hide 功能解决。
>
> **APatch/FolkPatch 使用者**：[使用此kpm](https://github.com/Admirepowered/selinux_hook)
>
> **selinux_hook 模块使用说明**：
> 1. 内核版本 4.19-6.12 的设备，必须嵌入此模块才能生效，如果使用加载模式，则不会启用任何伪装方法。
>    *注意*：由于编译优化导致的机器指令与预期不符，6.12 内核设备请慎重嵌入此模块，会有很大概率导致 kernelpanic，此问题后续将会被解决。
> 2. 内核版本 4.14 的设备，建议嵌入模块，但由于模拟 context_struct_compute_av 存在风险，在嵌入模块前请备份原 boot.img，以便在出现 kernelpanic 后可救砖；加载模式同样可生效，但会使用基于关键词过滤的备选方法，效果相对较差，如果设备的 policy 中包含了模块没有收录的且能被证明异常的关键词，则会发生泄露。
> 3. 内核版本 4.9 的设备，建议嵌入模块，且无模拟 context_struct_compute_av 的风险，加载模式效果同 4.14。
>
> **Magisk**：尝试更换内核级管理器。在将来 Magisk 可能会合并保存 Clean policy blob 功能，如果合并此功能，Magisk 将有机会通过此检测。
</details>

<details>
<summary>Found ksu/免解设备</summary>

> 发现 ksu 处于越狱模式，当前设备使用 ksu 越狱模式的 ROOT 方式或者发现 ksu 进程等其他因素。
> 
> 不推荐使用越狱模式，所以不提供解决方案。
</details>

<details>
<summary>SU binary detected</summary>

> 检测到 SU 二进制文件（检测到 ROOT）
</details>

<details>
<summary>Abnormal Environment</summary>

> 检测到 KSU/APatch（侧信道检测）
>
> 检测原理请参考[此文档](/File/Doc/ksu_kp_sidechannel_zh.md)
>
> **解决办法（KernelSU 系）**：更新你的 KernelSU 管理器并重新修补（LKM 工作模式）或重新集成（GKI 和 Non-GKI 工作模式）。
>
> **解决办法（APatch 系）**：
> 1. 嵌入/加载[nohello kpm](/File/Bin/Nohello-v1.8.2.9-83-b3e7d87-release.kpm)，并将检测器加入到排除列表，nohello 可以在 kernelpatch 判断 cmd 值之前判断发起鉴权请求的应用是否在排除列表内，如果是，则禁止鉴权。
> 2. 未来版本的 APatch 会引入基于签名的鉴权方法，对于不符合签名却发起了鉴权的应用直接拒绝鉴权请求。目前没有完全实现，需要再等一段时间。
>
> **解决办法（KPatch-Next）**：更新 KPatch-Next 驱动到 0.13.5-2。
>
> 原理：旧版 KPatch-Next 完全继承了 KernelPatch 的鉴权方式，所以在 APatch 上可行的侧信道检测方法在旧版 KPatch-Next 上也同样可行；但最新版 KPatch-Next 以判断用户态 kpatch-android 组件的 uid 实现鉴权，不再会被侧信道检测。
</details>

<details>
<summary>KernelSU loop device</summary>

> 检测到 KSU
> 
> 更新你的管理器并重新修补
</details>

<details>
<summary>Suspicious Surroundings</summary>

> 检测到 APatch
>
> 更新 APatch 并加载 KPM 隐藏模块解决（比如 Nohello.kpm）
</details>

<details>
<summary>ROOT进程</summary>

> 检测 Zygote 环境?
>
> 通过审计日志漏洞读取 (avc)
>
> 可使用 SusFS 的功能或者使用 ZN-AuditPatch 模块
>
> Android 安全更新 2025/09/01 已修复（不准确但结果是这样的）
</details>

<details>
<summary>异常进程0000（pid）</summary>

> 0000 代表的是进程的 pid
>
> 你可以尝试使用 shell 指令以 root 执行 `ps -ef | grep 数字id` 来查找对应 pid 进程，通常是拥有 root 权限的守护进程（如 lspd 进程、Tricky-Store 进程）
>
> **解决办法**：此检测依赖安全漏洞，更新安全补丁到 2026/01/01 可显著降低检出率，但目前无法完全解决，此安全漏洞将在 Google 正式发布 Android 17 后完全修复。
>
> 安全补丁更新往往伴随系统更新，如果因为不想更新系统而无法更新安全补丁，可以忽略此条目。
>
> 双开应用有时可以使此检测方案失效，但不会实质上解决此安全漏洞，所以双开应用不应被视为可行的方法。
>
> 会有误报现象
</details>

---

## TEE 与密钥证明检测

<details>
<summary>TEE环境不可信</summary>

> 来自 Tencent 的 [SoterService](https://github.com/Tencent/soter)
> 作用: 微信的指纹支付等。
>
> 通过检查文件来判断是否存在 Soter 服务程序以及判断其服务点属性状态来交叉验证是否存在 Soter key 被屏蔽的情况。
> 1. 服务点属性状态异常 + Soter 服务程序存在 -> Soter 被屏蔽（异常）
> 2. 服务点属性状态异常 + Soter 服务程序不存在 -> 此设备原生不支持 Soter 服务（正常）
> 3. 服务点属性状态正常 + Soter 服务程序存在 -> 此设备支持 Soter（正常）
> 4. 服务点属性状态正常 + Soter 服务程序不存在 -> 不可能
>
> **解决方法**：
> - 等待模块更新（不太可能实现 SoterService 的修复）
> - 使用 SusFS 或 PathMask 隐藏相关服务路径，并使用 HMA-OSS 对检测器隐藏 Soter 系统服务应用程序尝试解决
>
> *注意*：PathMask 并不专注于环境隐藏，请慎用。
>
> *原理*：目前在技术上我们无法模拟 Soter 服务，但可以隐藏 Soter 相关文件来伪造第 2 种情况。
</details>

<details>
<summary>Tampered Attentionkey(X)</summary>

> 携带 20+ 类异常标签（多数是 OEM 特有标签）针对 TEE 处理异常标签反馈来对照预期值进行判断是否异常。
>
> 针对 TEE 的检测，若有，“请等待相关模块更新修复”，或者回锁。
>
> 即使是 efisp 的假锁或者自定义引导程序也“可能”会报。
>
> - 15: HanAttest 链不一致（与下面 TeeSim 常量不同源，但同在 mask 里）
> - 18: 厂商占位 KeyMint tag 仍成功输出密钥（tee2 §1）
> - 23: 叶证书 KeyUsage 与扩展内 KeyPurpose 矛盾
> - 24: Binder 超长 alias / 大事务探针异常
> - 25: 叶证书 SigAlg 与签发钥算法不符
> - 26: 证书 patch 标签与系统属性不一致（与安全补丁有关）（[执行此sh](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution/blob/main/File/Tampered%20Attestation%20Key(26)Pass.sh)尝试解决）
> - 27: USER_ID 出现在 teeEnforced
> - 29: 无 challenge 却有 APPLICATION_ID（上表）
> - 30: 敏感设备标识类 attest 未被拒绝（如 SERIAL）
</details>

<details>
<summary>TrickyStore Hook/2</summary>

> 侧信道（不稳定）重新打开或许消失
>
> 更换模块[TEESimulator](https://github.com/JingMatrix/TEESimulator)
</details>

<details>
<summary>发现TrickyStore/类似模块</summary>

> **尝试1**：更换模块比如 [TEESimulator](https://github.com/JingMatrix/TEESimulator)
>
> **尝试2**：把 `/data/adb/tricky_store/security_patch.txt` 文件删除
</details>

<details>
<summary>TEE伪造</summary>

> 使用 TEESimulator(RS) 模块解决，使用证书链生成模式。
</details>

<details>
<summary>TEE 损坏</summary>

> 尝试使用 Tricky Store 或者 [TEESimulator-RS](https://github.com/Enginex0/TEESimulator-RS) 模块解决，搭配 [TS插件使用](https://github.com/KOWX712/Tricky-Addon-Update-Target-List/releases/tag/v5.0-beta.1)。
>
> 刷入后请重启，开机后打开模块的 webUI 进行配置。
>
> TEE 损坏的设备请使用生成证书链模式。
</details>

<details>
<summary>密钥证明未完成或链不一致</summary>

> 使用 [TEESimulator-RS](https://github.com/Enginex0/TEESimulator-RS) 并配置后尝试解决
</details>

<details>
<summary>AOSP密钥</summary>

> 更换 `/data/adb/tricky_store/` 目录下的 `keybox.xml` 文件。
>
> 也可选择刷入 [TS插件](https://github.com/KOWX712/Tricky-Addon-Update-Target-List/releases/tag/v5.0-beta.1)，重启后打开模块的 webUI 界面进行密钥配置。
</details>

<details>
<summary>Boot Hash不匹配</summary>

> boot 镜像的 Hash 不匹配。
>
> 通常 BL 解锁后 hash 会变成 0000，使用 [Native detector](https://t.me/rootdetector/49) 获取正确的 hash 后使用 Tricky Store/[TEESimulator-RS](https://github.com/Enginex0/TEESimulator-RS) 模块并使用 [TS插件](https://github.com/KOWX712/Tricky-Addon-Update-Target-List/releases/tag/v5.0-beta.1) 配置 hash 解决。
</details>

<details>
<summary>Bootloader unlock</summary>

> BL 已解锁，使用 [TEESimulator-RS模块隐藏](https://github.com/Enginex0/TEESimulator-RS)。
>
> 需要配置 `/data/adb/tricky_store/` 目录下的 `target.txt` 文件，在其中添加软件包名（实时生效无需重启）。
>
> 也推荐使用 [TS插件](https://github.com/KOWX712/Tricky-Addon-Update-Target-List/releases/tag/v5.0-beta.1) 进行软件包名的可视化配置。
</details>

<details>
<summary>启动状态异常</summary>

> BL 已解锁，使用 [TEESimulator-RS模块隐藏](https://github.com/Enginex0/TEESimulator-RS)。
>
> 需要配置 `/data/adb/tricky_store/` 目录下的 `target.txt` 文件，在其中添加软件包名（实时生效无需重启）。
</details>

<details>
<summary>密钥篡改(128)</summary>

> Tricky Store 在一加高通设备上默认使用"密钥链生成模式"
>
> 尝试更换 [TEESimulator-RS模块](https://github.com/Enginex0/TEESimulator-RS)
</details>

<details>
<summary>密钥篡改（q）</summary>

> 未知
</details>

<details>
<summary>密钥篡改（b）</summary>

> 未知
</details>

<details>
<summary>证书已被吊销(CRL)</summary>

> 更换 `/data/adb/tricky_store/` 目录下的 `keybox.xml` 文件
</details>

<details>
<summary>密钥篡改</summary>

> [使用TEESimulator-RS模块?](https://github.com/Enginex0/TEESimulator-RS)
</details>

<details>
<summary>TrustedCert 证书篡改</summary>

> 未知
</details>

---

## 挂载与命名空间检测

<details>
<summary>mountinfo</summary>

> 通过两种手段获取出来的挂载视图不一样。可能存在隐瞒的问题,有时某服务处理不及时就会报（极早 mountinfo 快照 vs 后期对照）
> 
> 小米设备通常在开机后系统高占用时，打开检测器会出现此检测项。
</details>

<details>
<summary>zygote test (1)</summary>

> 打开 ZygiskNext 的链接器功能与匿名内存功能尝试解决。
> 
> 排除列表策略-仅还原挂载。
> 
> 不稳定检测，侧信道。
</details>

<details>
<summary>Inconsistent mount</summary>

> `/proc/self/exe/` 解析出其中部分的挂载，然后再去看文件系统类型是否一致。（挂载的类型不同）
> 
> 存在部分设备暂未修复的误报现象（3.4版本中已修复）。
</details>

<details>
<summary>Mount loophole</summary>

> Magic Mount 对系统修改模块挂载生效
> 
> 但挂载需要其他模块来隐藏（可选择 SusFS/ZygiskNext）
> 
> 使用 ZygiskNext 的排除策略 > 仅还原挂载，并配置排除列表 / 开启默认卸载模块对其实施隐藏。
</details>

<details>
<summary>Magic Mount</summary>

> 检测到 Magic Mount
> 
> 请尝试排除某些针对系统修改的模块，使用某些模块隐藏这个问题（比如 ZygiskNext 中的排除策略）。
</details>

<details>
<summary>不一致的挂载/debug_ramdisk</summary>

> `umount /debug_ramdisk`
</details>

<details>
<summary>Futile hide 04</summary>

> 原理-挂载命名空间?
> 
> 检测挂载异常
>
> 尝试更换"元模块"解决
</details>

<details>
<summary>挂载间隙</summary>

> 通过检查挂载组 ID 来判断是否存在隐藏 root 行为。
>
> 在此判断方法中，当挂载组 ID 增长不连续时（例如 1,2,3,6,7,8...）判定为存在隐藏 root 行为；反之，当挂载组 ID 增长连续（例如 1,2,3,4,5,6,7...）则正常。
> 
> 当 Magisk 系切换 namespace 时将出现此现象，而对于 KernelSU 系/APatch 系，如果使用了某些具有绑定挂载功能的模块也可能出现此现象。
> 
> **解决办法**：
> - **Magisk 系**：使用 Magisk Alpha 可解决，原理未知。
> - **Kernel 系/APatch 系**：尝试更换"元模块"解决或者更新 ROOT 管理器。
> 
> 如果问题仍存在，请检查具有绑定挂载功能的系统模块，以及系统是否原生存在此现象。
>
> *注意*：在少数 ROM 中原生存在此现象，如果属于这种情况请忽略此条目。
</details>

<details>
<summary>2222</summary>

> 检测挂载异常
</details>

---

## 环境、进程与文件检测

<details>
<summary>Miscellaneous Check(12)</summary>

> 通过扫描 smaps 启发式探测 Zygisk 实现（特别是 Zygisk-Next），但目前的实现方式存在问题，导致检测失效。
> 
> 在检测方法被修复或移除前请忽略此条目。
</details>

<details>
<summary>Looper fd图异常</summary>

> 暂时未知
</details>

<details>
<summary>HMA或许存在</summary>

> 疑似检测旧版使用 Scene_Hide-eBPF 模块行为（检测不到 scene 应用程序存在，但检测到相关服务）
> 
> [分支项目/拉取更新重新构建模块并刷入/从Releases中下载](https://github.com/Andrea-lyz/Scene-Port-Hider-by-eBPF)
</details>

<details>
<summary>fdinfo mnt 采样异常（c）</summary>

> 大概率为检测到 USB 调试痕迹，小概率误报。可使用脚本[调试痕迹消除](https://github.com/YiJieqwq/ADB-Trace-Cleaner/releases)尝试解决。
</details>

<details>
<summary>内存异常</summary>

> 清除检测器数据后若还存在，那么请开 Issues 并提供你的模块列表信息以及使用了哪些 xp 模块，我有时间会研究的。
</details>

<details>
<summary>Futile hide 1</summary>

> 很少人出现，暂时未知原因，暂时没有可靠的解决方案。
</details>

<details>
<summary>风险应用</summary>

> 暂时未知的手段，自行尝试使用 HMA-OSS 对检测器隐藏某些可能是风险的应用程序。
</details>

<details>
<summary>Drity Device(a)</summary>

> 检测到内核接口？外挂 sh?
> 
> 检测到 `/storage/emulated/0/` 目录有文件夹/文件名称有 sh？
> 
> 尝试重启手机或刷机，删除在 `/storage/emulated/0/` 带有 sh 字样的文件夹/文件。
</details>

<details>
<summary>环境存疑1（实验性检测）</summary>

> 在 HMA-OSS 中对检测器开启黑名单模式隐藏后，若勾选了设置预设中的“输入法”选项后，此检测项就会出现？
</details>

<details>
<summary>Evil Service</summary>

> 关于 lsp, shizuku 还有一些 xp 模块的修改检测。
</details>

<details>
<summary>Miscellaneous Check（a）</summary>

> 检测到 dex2oat（通常是 LSP 的问题，更换/更新 LSP 模块）。
</details>

<details>
<summary>[Hook] Suspicious library injection</summary>

> (zygisk/riru/xposed)
> 
> 检测到 HOOK，自行排查原因，因素过多。
</details>

<details>
<summary>设备为模拟器</summary>

> 当前是模拟器设备。
</details>

<details>
<summary>Found LSPHook Framework</summary>

> 检测到 LSPHook Framework
> 
> 某些 xp 模块修改导致，也可卸载更换 LSP 模块。
</details>

<details>
<summary>检测到Scene端口占用</summary>

> 请查看此[项目](https://github.com/Andrea-lyz/Scene-Port-Hider-by-eBPF)并尝试解决。
> 
> 无视此检测项，或者关闭 scene 的无障碍权限，或将 scene 更新到 9.3.1 以上。
</details>

<details>
<summary>Zygisk detected</summary>

> 检测到 Zygisk，通常是 magisk 自带的 zygisk 导致（关闭解决）或者其他原因。
> 
> 更新[ZygiskNext模块](http://github.com/Dr-TSNG/ZygiskNext)。
</details>

<details>
<summary>Suspicious Surroundings (a)</summary>

> `/data/local/tmp` 文件夹所有组异常。
>
> **解决方案**：所有组改为 shell。
</details>

<details>
<summary>Suspicious Surroundings（b）</summary>

> 路径 `/data/local/tmp` 文件夹的 inode 值高于 10000。
> 
> **解决方案**：将设备恢复出厂设置 / 使用 SusFS 对路径伪装 inode 值小于 1000 / 尝试使用 [Inode-Hijacker](https://github.com/YiJieqwq/Inode-Hijacker/releases) 脚本解决。
> 
> 如遇到有线投屏（如 Scrcpy）不可用，使用 `su -c restorecon -RF /data/local/tmp` 解决问题。
</details>

<details>
<summary>Suspicious Surroundings（c）</summary>

> `/data/local/tmp` 的权限被修改（默认 771）。
> 
> **解决方案**：重新设置权限。
</details>

<details>
<summary>Futile hide</summary>

> 以下方案可能过时：
> 
> `/data/local/tmp` 文件夹 tmp 的时间被修改。
> 
> 格式化系统或者把 tmp 文件夹删除重启后变上方 abc，再使用 sukisu 中的 Kstat 配置（需要内核集成 SusFS）添加 `/data/local/tmp` 目录只修改 ino 值比如 7365（tmp 目录权限保持 771，所有者为 shell）。
</details>

<details>
<summary>/data/local/tmp denied</summary>

> 目录 `/data/local/tmp` 拒绝访问，文件夹权限设置问题? 文件夹不存在?
</details>

<details>
<summary>终端环境存疑</summary>

> 检测 Pty。
</details>

<details>
<summary>MT管理器（MT2文件夹）/异常文件</summary>

> 异常文件：检测到根目录下的“mt2”文件夹与 boot.img / “.xml”异常文件。
> 
> “mt2”可在 MT 管理器设置中对 MT2 路径自定义修改解决（记得删除旧文件夹）。
</details>

<details>
<summary>Risk apps‘软件包名’</summary>

> 通过 Unicode 零宽字符漏洞检查 `/storage/emulated/0/Android/data/` 中的风险应用包名。
> 
> 安装 [Unicode零宽修复模块](https://github.com/5ec1cff/FuseFixer) 对 `/storage/emulated/0/Android/data/` 目录修复可被读取问题，并搭配 HMA-OSS 对风险应用隐藏。
</details>

<details>
<summary>Thanox service detected</summary>

> 检测到 Thanox 服务。
> 
> 可以使用这个 xp 模块来隐藏：[hideThanox](https://t.me/Suxiaomingpd/125)。
</details>

<details>
<summary>异常文件</summary>

> **检测路径**：`/dev` 和 `/data/local/tmp`
> 1. 重命名/删除相关目录文件。
> 2. 排查并删除以下高危路径：
>    ```text
>    /data/local/stryker
>    /data/system/appretention
>    /data/local/tmp/luckys
>    /data/local/tmp/input_devices
>    /data/local/tmp/hyperceiler
>    /data/local/tmp/simplehook
>    /data/local/tmp/disabledallgoogleservices
>    /data/local/mio
>    /data/dna
>    /data/local/tmp/cleaner_starter
>    /data/local/tmp/byyang
>    /data/local/tmp/mount_mask
>    /data/local/tmp/mount_mark
>    /data/local/tmp/scripttmp
>    /data/local/luckys
>    /data/local/tmp/horae_control.log
>    /data/gpu_freq_table.conf
>    /storage/emulated/0/download/advanced
>    /storage/emulated/0/documents/advanced
>    /data/system/noactive
>    /data/system/freezer
>    /storage/emulated/0/android/naki
>    /data/swap_config.conf
>    /data/local/tmp/resetprop
>    ```
</details>

---

## 内核、属性与系统特征检测

<details>
<summary>无效的伪造信息(1)</summary>

> 解锁后L1证书变成L3证书，但是无法返回正确L1证书信息导致的，即使使用模块替换keybox文件来伪装状态也会检测与L1不符
> 解决方案推荐使用[远程RKP密钥](File/rkp-release-v10.apk)安装RKPConfig后向Google请求RKP下发
</details>

<details>
<summary>Found property</summary>

> 执行[此sh](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution/blob/main/File/Found%20property.sh)尝试解决。
</details>

<details>
<summary>Property Modified（数字代表几处属性修改）</summary>

> 原理是查属性区空洞，如果说有存在空洞的话，说明存在属性修改。
> 
> 隐藏被修改的属性可将 shamiko 模块中的 [shamiko_Plus.sh](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution/blob/main/File/shamiko_Plus.sh) 文件添加并移动到 `/data/adb/service.d/` 目录下，确认该脚本有执行权限后重启，尝试解决。
</details>

<details>
<summary>avb校验异常 avb=2.0</summary>

> avb 版本异常。
> 
> 某些模块会造成此问题，比如改机型模块，自行排查模块尝试解决。
</details>

<details>
<summary>Tampered kernel</summary>

> 内核信息校验异常（内核字符版本，内核构建时间）。
> 
> 尝试使用 SusFS 隐藏或者还原未修改的 boot.img。
</details>

<details>
<summary>[hook]Resetprop modified</summary>

> resetprop 被修改。
> 
> 未知。
</details>

<details>
<summary>Miscellaneous Check(2)</summary>

> 检测设备篡改/机型篡改。
> 
> 改机型模块导致? 自行排查。
</details>

<details>
<summary>Miscellaneous Check(3)</summary>

> 改机检测？
>
> 以下方案可能过时：开启过“隐藏应用列表(HMA)”的 Vold appdata 隔离？
</details>

<details>
<summary>Netlink socket anomaly</summary>

> 暂时未知
</details>

<details>
<summary>伪装内核</summary>

> 无效的使用 SusFS 伪装内核。
> 
> 伪装内核启动阶段选择 post-fs-data。
</details>

<details>
<summary>第三方内核</summary>

> 内核信息符合预设信息名单。
> 
> 伪装内核信息解决。
</details>

<details>
<summary>第三方rom/自编译内核</summary>

> 第三方 ROM 标记。
>
> 内核版本号后缀带有 `-Dirty`。
>
> 伪装内核信息解决。
</details>

<details>
<summary>第三方ROM（2）</summary>

> 暂时未知
</details>

<details>
<summary>ROM detected</summary>

> 检测到第三方 ROM。
>
> 部分三方 rom 特征符合。
>
> 可自行尝试伪装。
</details>

<details>
<summary>环境伪造</summary>

> 旧设备（4系内核）可能或误报？
> 
> 此检测项在刷入 ZN-Audit Patch 模块或类似行为后会触发。
>
> 卸载 ZN-Audit Patch 模块。
</details>

<details>
<summary>检测失败</summary>

> 2333333
</details>

<details>
<summary>Something wrong</summary>

> 未知
</details>

<details>
<summary>Miscellaneous Check(4/5/6/7/8/9)</summary>

> 一些有关模拟器虚拟机/模拟器的检测/改机行为检测/三方&移植 ROM。
>
> 在国外设备 Poco/三星误报情况（待修复）。
</details>
