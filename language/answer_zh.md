# 春秋检测项解决方案（跟进最新版本）中文版
> 整理：mingzun09(SuXiaoMing) | 仅供参考，具体结果因设备/环境而异。
>解决方案尾巴带“?”符号的都为不确定
> 文档链接：[github](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution)

## 你尝试但过不掉的检测
不要直接带着一张截图就跟我反馈误报，我会考虑直接将你拉黑。
如果你需要人工帮助，首先请有一个“好”的态度。

# mountinfo
>通过两种手段获取出来的挂载视图不一样。可能存在隐瞒的问题。
>
> 大白话就是挂载侧漏
>
>尝试隐藏或者更换/配置元模块，尝试解决

# Drity Device(a)
> 检测到内核接口？特征某外挂

## zygote test (1)
> 打开zygisk next的链接器功能与匿名内存功能尝试解决。
> 排除列表策略-仅还原挂载。

## Inconsistent mount
> /proc/self/exe/解析出其中部分的挂载，然后再去看文件系统类型是否一致。
> 尝试更换元模块解决

## TEE环境不可信
> [来自Tencent](https://github.com/Tencent/soter)
> 与微信的指纹差不多。
> 等待模块更新或者

> 使用HMA-OSS对检测器隐藏Soter系统服务应用程序，尝试解决（在3.2fix中被修复？尚未确定）

> 更换为TEESimulator/RS版，尝试解决

## Tampered Attentionkey(X)
> 针对TEE的检测，若有，“请等待相关模块更新修复”，或者回锁
即使是efisp 的假锁或者自定义引导程序也“可能”会报
> 
> 15   HanAttest 链不一致（与下面 TeeSim 常量不同源，但同在 mask 里）
> 
> 18   ：厂商占位 KeyMint tag 仍成功出钥（tee2 §1）

> 23   ：叶证书 KeyUsage 与扩展内 KeyPurpose 矛盾

> 24   ：Binder 超长 alias / 大事务探针异常

> 25   ：叶证书 SigAlg 与签发钥算法不符

> 26   ：证书 patch 标签与系统属性不一致（与安全补丁有关）（修改/data/adb/tricky_store/security_patch.txt尝试解决）

> 27   ：USER_ID 出现在 teeEnforced

> 29   ：无 challenge 却有 APPLICATION_ID（上表）

> 30   ：敏感设备标识类 attest 未被拒绝（如 SERIAL）

## Found property
执行[此sh](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution/blob/main/File/Found%20property.sh)尝试解决

## Tricky store Hook/2
> 更换模块[TEESimulator](https://github.com/JingMatrix/TEESimulator)

## 发现Trickystore/类似模块
> 尝试1
更换模块比如[TEESimulator](https://github.com/JingMatrix/TEESimulator)

>尝试2
把/data/adb/Tricky store/security_patch.txt文件删除

> 尝试3
或者在[TEESimulator](https://github.com/JingMatrix/TEESimulator)模块存在的基础上，先刷入TS-Enhancer-Extreme模块的[0.8.2.1版本](https://t.me/chunqiudetector/10461)重启后开机再去刷入[v1.0版本](https://t.me/chunqiudetector/10460)
覆盖刷入后可以解决，记得备份keybox，以上行为会覆盖原有的keybox文件

## TEE伪造
> 使用TEESimulator-RS模块解决

## Property Modified（数字代表几处属性修改）
> 原理是查属性区空洞，如果说有存在空洞的话，说明存在属性修改。

> 隐藏被修改的属性可将shamiko模块中的[shamiko.sh]([https://t.me/chunqiudetector/10259](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution/blob/main/File/shamiko_Plus.sh))文件添加并移动到/data/adb/service.d/目录下并重启，尝试解决。

## 环境存疑1（实验性检测）
> 在HMA-OSS中对检测器开启黑名单模式隐藏后，若勾选了设置预设中的“输入法”选项后，次检测项就会出现？

## Evil Service
> 关于lsp shuziku 还有一些xp模块的检测

## Found ksu/免解设备
> 发现ksu处于越狱模式，当前设备使用ksu越狱模式的ROOT方式
>
> 或者发现ksu进程等其他因素

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
> 次检测项不稳定偶尔出现（通常使用KSU LKM模式的较多）

## Abormal Environment
> 检测到KSU/APatch/Magisk
> 
> 测信道检测,更新你的根管理器并重新修补

## AbnormalEnvironment(04)
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
> 某些模块会造成此问题，比如改机型模块

## Found LSPHook Framework
> 检测到LSPhook Framework
> 
> 某些xp模块导致,也可卸载更换LSP模块

## 检测到Scene端口占用
> scene软件，你可以尝试隐藏
> 
> 无视此检测项，或者关闭scene的无障碍权限

## Zygisk detected
> 检测到Zygisk,通常是magisk自带的zygisk导致（关闭解决）或者其他原因
> 
> 更新[zygisk next模块](http://github.com/Dr-TSNG/ZygiskNext)

## Tmpered kernel
> 内核信息校验异常(内核字符版本，内核构建时间)
> 
> 尝试使用SUSFS隐藏或者还原未修改的boot.img

## [hook]Resetprop modified
> resetprop被修改
> 未知

## Suspicious Surroundings (a)
> 路径/data/local/tmp
> 
> tmp文件夹被设置为root用户和所有组,改为shell即可

## Suspicious Surroundings（b）
> 路径/data/local/tmp
> 
> tmp的inode值高于10000(被删除过)
> 
> 格式化系统或者使用SUSFS对路径伪装inode值大小<1000

## Suspicious Surroundings（c）
> /data/local/tmp
> 
> 文件夹tmp的权限被修改（默认771）

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
> umout /debug_ramdisk

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
> 尝试更换""元模块"解决

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
> 你可以尝试使用shell指令以root执行“ps -ef | grep 数字id”来查找对应pid进程,通常是LSP进程
> 
> 也可以在系统设置中随便开一个软件分身尝试解决

> 会有误报现象

## MT管理器(MT2文件夹)/异常文件
> 异常文件：检测到根目录下的mt2文件架与boot.img等异常文件。
> 
> 可在MT管理器设置中对MT2路径自定义修改解决

## Risk apps‘软件包名’
> 检测风险应用>软件包名
> 
> 安装[Unicode零宽修复模块](https://t.me/real5ec1cff/268)对/storage/emulated/0/Android/data/目录修复可被读取问题并搭配HMA-OSS对风险应用隐藏。

## Thanox service detected
> 检测Thanon服务
> 
> 可以使用这个xp模块来隐藏[hideThanox](https://t.me/Suxiaomingpd/125)

## 检测失败
> 2333333

## TEE 损坏
> 尝试使用Tricky Store或者[TEESimulator-RS](https://github.com/Enginex0/TEESimulator-RS)模块解决
搭配[TS插件使用](https://github.com/KOWX712/Tricky-Addon-Update-Target-List/releases/tag/v5.0-beta.1)
刷入后请重启，开机后打开模块的webuI进行配置。

## 密钥证明未完成或链不一致
> 使用[TEESimulator-RS](https://github.com/Enginex0/TEESimulator-RS)并配置后尝试解决

## AosP密钥
> 更换/data/adb/Tricky Store/目录下的'keybox.xml'文件
也可选择刷入[TS插件](https://github.com/KOWX712/Tricky-Addon-Update-Target-List/releases/tag/v5.0-beta.1)
重启后打开模块的webui界面进行秘钥配置

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
## Magic Mount
> 使用zygisk next的排除策略>仅还原挂载
> 并配置排除列表/开启默认卸载模块
> 对其隐藏
