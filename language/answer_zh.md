# 春秋检测项解决方案（跟进最新版本）中文版
> 整理：mingzun09(SuXiaoMing) | 仅供参考，具体结果因设备/环境而异。
>解决方案尾巴带“?”符号的都为不确定
> 文档链接：[github](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution)

# 自行尝试但仍然无法通过的检测
请开Issues并提供 你的模块列表信息+使用了哪些xp模块等详细修改 我有时间会回复/帮助。

# Miscellaneous Check(12)
> LSPosed泄露Zygisk检测点
> 尝试卸载LSPosed/更换ReZygisk/等待模块更新

# Looper fd图异常
> 正在分析复现，待补充...

# HMA或许存在
> 疑似检测旧版使用Scene_Hide-eBPF模块行为（检测不到scene应用程序存在，但检测到相关服务）
> 
> [分支项目/拉取更新重新构建模块并刷入](https://github.com/Andrea-lyz/Scene-Port-Hider-by-eBPF)

# 存在模块修改春秋
> 使用IsolPolicy模块后出现，关闭作用域或者卸载模块解决

> 并不是只有模块，比如说类似于面具的隐藏也算（比如SELinux修改隐藏）请尝试跟进相关root管理器最新CI来解决此问题

# 检测SELinux Policy时发现可疑问题 / 检测到ROOT权限
> 新加入的SELinux特性检测（应用程序 zygote 拥有访问 /sys/fs/selinux/access 的权限）
> KSU使用者[更新KSU管理器](https://t.me/KernelSU_group/3234/482579)并重新修补镜像并刷入后重启再开启selinux_hide功能解决

> APatch/FolkPatch使用者[加载/嵌入此kpm](https://t.me/APatch_nightly/118)

> Magisk......尝试更换内核级管理器

# fdinfo mnt 采样异常（c）
> 大概率为检测到USB调试痕迹，小概率误报。可使用脚本[调试痕迹消除](https://github.com/YiJieqwq/ADB-Trace-Cleaner/releases)尝试解决

# 内存异常
> 清除检测器数据后若还存在，那么请开lssues并提供你的模块列表信息以及使用了哪些xp模块，我有时间会研究的

# Futile hide 1
> 很少人出现，暂时未知原因，暂时没有可靠的解决方案

# 风险应用
> 暂时未知的手段，自行尝试使用HMA-oss对检测器隐藏某些可能是风险的应用程序。

# mountinfo
> 通过两种手段获取出来的挂载视图不一样。可能存在隐瞒的问题,有时某服务处理不及时就会报（极早 mountinfo 快照 vs 后期对照）
> 小米设备通常在开机后系统高占用时，打开检测器会出现，此检测项

# Drity Device(a)
> 检测到内核接口？外挂sh?
>检测到/storage/emulated/0/目录有文件夹/文件
>名称有sh？
>尝试重启手机或刷机
>删除在/storage/emulated/0/带有sh字样的文件
>夹/文件

## zygote test (1)
> 打开zygisk next的链接器功能与匿名内存功能尝试解决。
> 排除列表策略-仅还原挂载。
> 不稳定检测，偶发性

## Inconsistent mount
> /proc/self/exe/解析出其中部分的挂载，然后再去看文件系统类型是否一致。（挂载的类型不同）
> 存在部分设备暂未修复的误报现象（3.4版本中已修复）

## TEE环境不可信
> 来自Tencent的[SoterService](https://github.com/Tencent/soter)
> 作用: 微信的指纹支付等。
 
解决方法:

> 等待模块更新 (不太可能实现SoterService的修复)
> 使用susfs隐藏相关服务路径，并使用HMA-OSS对检测器隐藏Soter系统服务应用程序尝试解决

## Tampered Attentionkey(X)
> 携带20+类异常标签（多数是OEM特有标签）针对TEE处理异常标签反馈来对照预期值进行判断是否异常。
>
> 针对TEE的检测，若有，“请等待相关模块更新修复”，或者回锁。
>
> 即使是efisp 的假锁或者自定义引导程序也“可能”会报

> 15: HanAttest 链不一致（与下面 TeeSim 常量不同源，但同在 mask 里）

> 18: 厂商占位 KeyMint tag 仍成功出钥（tee2 §1）

> 23: 叶证书 KeyUsage 与扩展内 KeyPurpose 矛盾

> 24: Binder 超长 alias / 大事务探针异常

> 25: 叶证书 SigAlg 与签发钥算法不符

> 26: 证书 patch 标签与系统属性不一致（与安全补丁有关）（[执行此sh](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution/blob/main/File/Tampered%20Attestation%20Key(26)Pass.sh)尝试解决）

> 27: USER_ID 出现在 teeEnforced

> 29: 无 challenge 却有 APPLICATION_ID（上表）

> 30: 敏感设备标识类 attest 未被拒绝（如 SERIAL）

## Found property
执行[此sh](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution/blob/main/File/Found%20property.sh)尝试解决

## Tricky store Hook/2
> 测信道（不稳定）重新打开或许消失
> 更换模块[TEESimulator](https://github.com/JingMatrix/TEESimulator)

## 发现TrickyStore/类似模块
> 尝试1
更换模块比如[TEESimulator](https://github.com/JingMatrix/TEESimulator)

>尝试2
把/data/adb/Tricky store/security_patch.txt文件删除

## TEE伪造
> 使用TEESimulator(RS)模块解决，使用证书链生成模式。

## Property Modified（数字代表几处属性修改）
> 原理是查属性区空洞，如果说有存在空洞的话，说明存在属性修改。

> 隐藏被修改的属性可将shamiko模块中的[shamiko_Plus.sh](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution/blob/main/File/shamiko_Plus.sh)文件添加并移动到/data/adb/service.d/目录下并重启，尝试解决。

## 环境存疑1（实验性检测）
> 在HMA-OSS中对检测器开启黑名单模式隐藏后，若勾选了设置预设中的“输入法”选项后，此检测项就会出现？

## Evil Service
> 关于lsp shuziku 还有一些xp模块的修改检测

## Found ksu/免解设备
> 发现ksu处于越狱模式，当前设备使用ksu越狱模式的ROOT方式或者发现ksu进程等其他因素。

> 不推荐使用越狱模式，所以不提供解决方案

## SU binary detected
> 检测到SU二进制文件（检测到ROOT）

## Miscellaneous Check（a）
> 检测到dex2at（通常是LSP的问题，更换/更新LSP模块）

## Mount loophole
> Magic Mount对系统修改模块挂载生效
> 
> 但挂载需要其他模块来隐藏(可选择susfs/zygisk next)
> 
> 使用zygisk next的排除策略>仅还原挂载
> 
> 并配置排除列表/开启默认卸载模块
> 
> 对其隐藏

## Magic Mount
> 检测到Magic Mount
> 
> 请尝试排除某些针对系统修改的模块
> 
> 使用某些模块隐藏这个问题（比如zygisk next中的排除策略）

## [Hook] Suspicious library injection
(zygisk/riru/xposed)
检测到HOOK，自行排查原因，因素过多
## SU list（已被删除）
> 检测到类似ksu的ROOT权限排除列表
> 
> 此检测项不稳定偶尔出现（通常使用KSU LKM模式的较多）

## Abnormal Environment
> 检测到KSU/APatch/Magisk
> 
> 测信道检测,更新你的根管理器并重新修补

## Abnormal Environment(04)
> 新版更改为函数调用检测（不稳定？）
> 
> 等待ROOT管理器/模块更新？
> 
> APatch的排除修改对检测器开启后会出现此问题？

## KnelsU loop device
> 检测到KSU
> 
> 更新你的管理器并重新修补

## Suspicious Surroundings
> 检测到APatch
> 
> 更新APatch并加载KPM隐藏模块解决（比如Nohello.kpm）

## 设备为模拟器
> 当前是模拟器设备

## avb校验异常 avb=2.0

> avb版本异常
> 
> 某些模块会造成此问题，比如改机型模块，自行排查模块尝试解决。

## Found LSPHook Framework
> 检测到LSPhook Framework
> 
> 某些xp模块修改导致,也可卸载更换LSP模块

## 检测到Scene端口占用
> 请查看此[项目](https://github.com/Andrea-lyz/Scene-Port-Hider-by-eBPF)并尝试解决
> 
> 无视此检测项，或者关闭scene的无障碍权限
>
> 将scene更新到9.3.1以上

## Zygisk detected
> 检测到Zygisk,通常是magisk自带的zygisk导致（关闭解决）或者其他原因
> 
> 更新[zygisk next模块](http://github.com/Dr-TSNG/ZygiskNext)

## Tampered kernel
> 内核信息校验异常(内核字符版本，内核构建时间)
> 
> 尝试使用SUSFS隐藏或者还原未修改的boot.img

## [hook]Resetprop modified
> resetprop被修改
> 未知

## Suspicious Surroundings (a)
> /data/local/tmp 文件夹所有组异常

解决方案: 所有组改为shell

## Suspicious Surroundings（b）
> 路径/data/local/tmp 文件夹的inode值高于10000

解决方案: 将设备恢复出厂设置 / 使用SUSFS对路径伪装inode值小于1000 / 尝试使用[Inode-Hijacker](https://github.com/YiJieqwq/Inode-Hijacker/releases)脚本解决


## Suspicious Surroundings（c）
> /data/local/tmp 的权限被修改（默认771）

解决方案: 重新设置权限

## Futile hide
> 以下方案可能过时
> 
> /data/local/tmp文件夹tmp的时间被修改
> 
> 格式化系统或者把tmp文件夹删除重启后变上方abc再使用sukisu中的Kstat配置（需要内核集成susfs）添加/data/local/tmp目录只修改ino值比如7365（tmp目录权限保持771，所有者为shell。

## Miscellaneous Check(2)
> 检测设备篡改/机型篡改
> 
> 改机型模块导致?自行排查

## Miscellaneous Check(3)
> 改机检测？
> 以下方案可能过时
> 开启过“隐藏应用列表(HMA)”的 Vold app
data 隔离？

## 不一致的挂载/debug_ramdisk
> umount /debug_ramdisk

## Netlink socket anomaly
> 暂时未知

## /data/local/tmp denied
> 目录/data/local/tmp拒绝访问,文件夹权限设置问题?文件夹不存在?

## 伪装内核
> 无效的使用susfs伪装内核
> 
> 伪装内核启动阶段选择post-fs-data

## Futile hide 04
> 原理-挂载命名空间?
> 
> 检测挂载异常
> 
> 尝试更换""元模块"解决

## 挂载间隙
> 检测挂载异常
> 
> 尝试更换"元模块"解决或者更新ROOT管理器

## 2222
> 检测挂载异常

## 第三方内核
> 内核信息符合预设信息名单
> 
> 伪装内核信息解决

## 第三方rom/自编译内核
> 第三方ROM标记
> 
> 内核版本号后缀带有-Dirty
> 
> 伪装内核信息解决

## 第三方ROM（2）
> 暂时未知

## ROM detected
> 检测到第三方ROM
> 
> 部分三方rom特征符合
> 
> 可自行尝试伪装

## 终端环境存疑
> 检测Pty

## 环境伪造
> 旧设备（4系内核）可能或误报？
> 此检测项在刷入ZN-Audit Patch模块或类似行为后会触发。
> 
> 卸载ZN-Audit Patch模块

## ROOT进程
> 检测Zygote环境?
> 
> 通过审计日志漏洞读取(avc)
> 
> 可使用SUSFS的功能或者使用ZN-AuditPatch模块
> 
> Android安全更新25/09/01已修复(不准确但结果是这样的)

## 异常进程
> 检测隐藏的进程组
> 
> 在系统设置中随便开一个软件分身尝试解决

## 异常进程0000(pid）
> 0000代表的是进程的pid
> 
> 你可以尝试使用shell指令以root执行“ps -ef | grep 数字id”来查找对应pid进程,通常是lspd进程
> 
> 也可以在系统设置中随便开一个软件分身尝试解决

> 会有误报现象

## MT管理器(MT2文件夹)/异常文件
> 异常文件：检测到根目录下的“mt2”文件夹与boot.img/“.xml”异常文件。
> 
> “mt2”可在MT管理器设置中对MT2路径自定义修改解决（记得删除旧文件夹）

## Risk apps‘软件包名’
> 检测风险应用>软件包名
> 
> 安装[Unicode零宽修复模块](https://t.me/real5ec1cff/268)对/storage/emulated/0/Android/data/目录修复可被读取问题并搭配HMA-OSS对风险应用隐藏。

## Thanox service detected
> 检测到Thanox服务
> 
> 可以使用这个xp模块来隐藏[hideThanox](https://t.me/Suxiaomingpd/125)

## 检测失败
> 2333333

## TEE 损坏
> 尝试使用Tricky Store或者[TEESimulator-RS](https://github.com/Enginex0/TEESimulator-RS)模块解决
搭配[TS插件使用](https://github.com/KOWX712/Tricky-Addon-Update-Target-List/releases/tag/v5.0-beta.1)
刷入后请重启，开机后打开模块的webUI进行配置。
> TEE损坏的设备请使用生成证书链模式

## 密钥证明未完成或链不一致
> 使用[TEESimulator-RS](https://github.com/Enginex0/TEESimulator-RS)并配置后尝试解决

## AOSP密钥
> 更换/data/adb/Tricky Store/目录下的'keybox.xml'文件
也可选择刷入[TS插件](https://github.com/KOWX712/Tricky-Addon-Update-Target-List/releases/tag/v5.0-beta.1)
重启后打开模块的webui界面进行密钥配置

## Boot Hash不匹配
> boot镜像的Hash不匹配
> 
> 通常BL解锁后hash会变成0000,使用[Native detector](https://t.me/rootdetector/49)获取正确的hash后使用Tricky Store/[TEESimulator-RS](https://github.com/Enginex0/TEESimulator-RS)模块并使用[TS插件](https://github.com/KOWX712/Tricky-Addon-Update-Target-List/releases/tag/v5.0-beta.1)配置hash解决

## Bootloader unlock
> BL已解锁,使用[TEESimulator-RS模块隐藏](https://github.com/Enginex0/TEESimulator-RS)
需要配置/data/adb/tricky_store/目录下的target.txt文件，在其中添加软件包名（实时生效无需重启）
也推荐使用[TS插件](https://github.com/KOWX712/Tricky-Addon-Update-Target-List/releases/tag/v5.0-beta.1)进行软件包名的可视化配置
> 
## 启动状态异常
> BL已解锁,使用[TEESimulator-RS模块隐藏](https://github.com/Enginex0/TEESimulator-RS)
需要配置/data/adb/tricky_store/目录下的target.txt文件，在其中添加软件包名（实时生效无需重启）

## 密钥篡改(128)
> Tricky Store在一加高通设备上默认使用"密钥链生成模式"

> 尝试更换[TEESimulator-RS模块](https://github.com/Enginex0/TEESimulator-RS)

## 密钥篡改（q)
> 未知

## 密钥篡改（b)
> 未知

## 证书已被吊销(CRL)
> 更换/data/adb/tricky_store/目录下的keybox.xml文件

## 密钥篡改
> [使用TEESimulator-RS模块?](https://github.com/Enginex0/TEESimulator-RS)

## TrustedCert 证书篡改
> 未知

## Something wrong
> 未知

## Miscellaneous Check(4/5/6/7/8/9)
> 一些有关模拟器虚拟机/模拟器的检测/改机行为检测/三方&移植ROM
> 
> 在国外设备Poco/三星误报情况（待修复）

## 异常文件
- 检测路径：/dev和/data/local/tmp
  1. 重命名/删除相关目录文件
  2. 排查并删除以下高危路径：
     ```
     /data/local/stryker
     /data/system/AppRetention
     /data/local/tmp/luckys
     /data/local/tmp/input_devices
     /data/local/tmp/HyperCeiler
     /data/local/tmp/simpleHook
     /data/local/tmp/DisabledAllGoogleServices
     /data/local/MIO
     /data/DNA
     /data/local/tmp/cleaner_starter
     /data/local/tmp/byyang
     /data/local/tmp/mount_mask
     /data/local/tmp/mount_mark
     /data/local/tmp/scriptTMP
     /data/local/luckys
     /data/local/tmp/horae_control.log
     /data/gpu_freq_table.conf
     /storage/emulated/0/Download/advanced
     /storage/emulated/0/Documents/advanced
     /data/system/NoActive
     /data/system/Freezer
     /storage/emulated/0/Android/naki
     /data/swap_config.conf
     /data/local/tmp/resetprop
     ```

## Magic Mount
> 使用zygisk next的排除策略>仅还原挂载
> 并配置排除列表/开启默认卸载模块
> 对其隐藏
