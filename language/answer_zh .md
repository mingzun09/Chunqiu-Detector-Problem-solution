# 春秋检测项解决方案（跟进最新版本）中文版
> 整理：mingzun09(SuXiaoMing) | 仅供参考，具体结果因设备/环境而异
> 文档链接：[github](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution)

## SU binary detected
> 检测到SU二进制文件（检测到ROOT）

## Miscellaneous Check（a）
> 检测到dex2at（通常是LSP的问题，更换LSP模块）

## Mount loophole
> 检测到挂载循环
> 旧版本的KSU管理器会有这个问题，某些模块也会导致
> 可以使用SUSFS隐藏或者卸载导致环境问题的模块

## Magic Mount
> 检测到Magic Mount
> 请尝试排除某些针对系统修改的模块
> 使用某些模块隐藏这个问题（比如zygisk next中的排除策略）

## SU list
> 检测到类似ksu的ROOT权限排除列表
> 次检测项不稳定偶尔出现（通常使用KSU LKM模式的较多）

## Abormal Environment
> 检测到KSU/APatch/Magisk
> 侧信道检测,更新你的管理器并重新修补

## KnelsU loop device
> 检测到KSU
> 更新你的管理器并重新修补

## Suspicious Surroundings
> 检测到APatch
> 更新APatch并加载KPM隐藏模块解决（比如Nohello.kpm）

## 设备为模拟器
> 当前是模拟器设备

## avb校验异常 avb=2.0
> avb版本异常
> 某些模块会造成此问题，比如改机型模块

## Found LSPHook Framework
> 检测到LSPhook Framework
> 某些xp模块导致,也可卸载更换LSP模块

## 检测到Scene端口占用
> scene软件，你可以尝试隐藏
> 无视此检测项，或者卸载scene

## Zygisk detected
> 检测到Zygisk,通常是magisk自带的zygisk导致（关闭解决）或者其他原因
> 更新zygisk next模块

## Tmpered kernel
> 内核信息校验异常(内核字符版本，内核构建时间)
> 尝试使用SUSFS隐藏或者还原未修改的boot.img

## [hook]Resetprop modified
> resetprop被修改
> 尝试排查针对系统修改的模块

## Suspicious Surroundings (a)
> 路径/data/local/tmp
> tmp文件夹被设置为root用户和所有组,改为shell即可

## Suspicious Surroundings（b）
> 路径/data/local/tmp
> tmp的inode值高于10000(被删除过)
> 格式化系统或者使用SUSFS对路径伪装inode值大小<1000

## Suspicious Surroundings（c）
> /data/local/tmp
> 文件夹tmp的权限被修改（默认771）

## Futile hide
> /data/local/tmp文件夹tmp的时间被修改
> 格式化系统或者把tmp文件夹删除重启后变上方abc再使用sukisu中的Kstat配置（需要内核集成susfs）添加/data/local/tmp目录只修改ino值比如7365（tmp目录权限保持771，所有者为shell。

## Miscellaneous Check(2)
> 检测设备篡改
> 改机型模块导致?

## Miscellaneous Check(3)
> 改机检测

## 不一致的挂载/debug_ramdisk
> umout /debug_ramdisk

## Netlink socket anomaly
> 暂时未知

## /data/local/tmp denied
> 目录/data/local/tmp拒绝访问,文件夹权限设置问题?文件夹不存在?

## 伪装内核
> 无效的使用susfs伪装内核
> 伪装内核启动阶段选择post-fs-data

## Futile hide 04
> 原理-挂载命名空间?
> 检测挂载异常
> 尝试更换""元模块"解决

## 挂载间隙
> 检测挂载异常
> 尝试更换""元模块"解决

## 2222
> 检测挂载异常

## 第三方内核
> 内核信息符合预设信息名单
> 伪装内核信息解决

## 第三方rom/自编译内核
> 内核版本号后缀带有-Dirty
> 伪装内核信息解决

## ROM detected
> 检测到第三方ROM
> 部分三方rom特征符合
> 可自行尝试伪装

## 终端环境存疑
> 检测Pty

## 环境伪造
> 检测到假环境
> 特征了某些拙劣的隐藏手段

## ROOT进程
> 检测Zygote环境?
> 通过审计日志漏洞读取(avc)
> 可使用SUSFS的功能或者使用ZN-AuditPatch模块
> Android安全更新25/09/01已修复(不准确但结果是这样的)

## 异常进程
> 检测隐藏的进程组

## MT管理器(MT2文件夹)/异常文件
> 通过MT管理器默认会对根目录下创建"mt2"文件夹特征
> 可在MT管理器设置中对MT2路径自定义修改解决

## Risk apps
> 检测风险应用
> 可尝试使用HMA-OSS对风险应用隐藏

## Thanox service detected
> 检测Thanon服务

## 检测失败
> 2333333

## TEE 损坏
> 尝试使用Tricky Store模块解决

## 密钥证明未完成或链不一致
> 更新Tricky Store模块?

## AosP密钥
> 更换keybox.xml

## Boot Hash不匹配
> boot镜像的Hash不匹配
> 通常BL解锁后hash会变成0000,使用Tricky Store模块解决

## Bootloader unlock
> BL已解锁,使用Tricky Store模块隐藏

## 启动状态异常
> BL已解锁,使用Tricky Store模块隐藏

## 密钥篡改(128)
> Tricky Store在一加高通设备上默认使用"密钥链生成模式"(强制模式)
> 手动改模块的target.txt文件对包名添加?符号

## 密钥篡改（q)
> 未知

## 密钥篡改（b)
> 未知

## TrustedCert 证书篡改
> 未知

## 发现Trickystore/类似模块
> 等待模块更新

## Something wrong
> 未知

## Miscellaneous Check(4/5/6/7)
> 一些有关模拟器虚拟机的检测。
> 还没有更新添加此检测项

## Miscellaneous Check(不一致挂载)
> 通常是使用Magic mount元模块的触发?
## Magic-Bind结构
> 通常是使用Magic mount元模块的触发?
魔法坐骑大幅增加坐骑数量,使得侦测成为可能   xD

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
## Mount loophole
> Magic Mount对系统修改模块挂载生效
> 但挂载需要其他模块来隐藏(可选择susfs/zygisk next)
> 使用zygisk next的排除策略>仅还原挂载
> 并配置排除列表/开启默认卸载模块
> 对其隐藏
## Magic Mount
> 使用zygisk next的排除策略>仅还原挂载
> 并配置排除列表/开启默认卸载模块
> 对其隐藏
