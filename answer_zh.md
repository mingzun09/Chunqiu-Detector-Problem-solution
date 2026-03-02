## 第三版整理的检测项解答
仅供参考，具体结果因人而异
by mingzun09(SuXiaoMing)

## 异常进程组
与LSP有关
在设置中找到应用多开，随便多开一个应用，原理就是创建999用户，这个检测点就会消失，但可能会出现另一条。
更新系统至最新，Android安全更新日期为2026-2-1
更新LSP it

## Evil Service
与zygisk next关系
如果使用的是ksu（sukisu ksunext等分支）则在zygisk里打开仅还原挂载模式
如果是magisk（alpha和Kitsune）则在zygisk next中开启强制模式

## Found Injection (a)
大多数都和调度有关系，满血核心模块会导致这个问题
可自行排除模块

## Magisk/sukisu?/隐藏/Dirty file 
根据作者所说含有以下字样的文件都会显示这条"magisk","sukisu","alpha","zygisk","riru","lsposed","xposed","root", "刷机","hide","ksu","shamiko","tircky"检测路径在内部，存储目录只需要在这目录下删除就行 另外就是，xiaomi在应用截图中会在图片名称添加应用的名字 所以你在root管理器的截图就有可能被识别 Android系统安全补丁较新，没有零宽漏洞就可能不会被识别（或者使用FuseFixer模块xp）

## Tampered Attestation Key 
被篡改的密钥新的检测点，有人烧录之后可以过掉它，但是有的人没有效果，建议等ts更新

## 审计日志伪造 
使用ZN-AuditPatch模块/susfs的avc伪造
会导致这个问题，可以等此模块更新解决
或者更新系统至Android安全更新2025-09-01（各oem合入修复并发版日期不同）

##futile hode（tmp异常） 
目录/data/local/tmp/被修改过
自行尝试恢复（使用susfs或者格式化）
!不推荐
也可以删除tmp文件夹在/data/local/目录下随便选一个文件夹把名称改为tmp

## 实验性检测2(概率误报测试中) 
此检测项已被删除

## 虚拟机环境
（特别改机型模块或者prop被修改，关掉模块或还原prop）

## 发现隐藏的UID
（/sys/fs/cgroup/找到的UID,sus挂载隐藏，或者自行排查）

## 风险应用
发现了风险应用
卸载风险应用/使用susfs隐藏/使用HMA-OSS隐藏/自行尝试隐藏

## Tampered Attestation(a)/(b)
(a)为密钥发生替换，清除春秋全部数据可消失或变其他词条；
(b)*为不稳定测试，无需处理

## bl状态异常 
刷入Tricky Store并添加包名

## MT2/异常文件
根目录下有“mt2”文件夹，在Mt管理器设置中修改默认路径名称并删除旧的mt2文件夹
异常文件就是字面意思（根目录下有.sh或者.img等文件）

## Abnormal Environment(02) 
检查到HyperCeiler残留
用sh脚本运以下指令
resetprop persist.hyperceiler.log.level ""
resetprop --delete persist.hyperceiler.log.level

## Suspicious Surroundings(a/b/c)（/data/local/tmp路径
(a)：tmp文件夹设为root用户和所有组，改为shell
(b)：tmp的inode值高于10000，可以参考检测项7解决
(c)：tmp权限不为771，设置为771）

## Found lnjection 01,02,03
更新zygisk next模块及LSP模块

## Miscellaneous Check (13)
使用susfs模块

## ro.boot.vbmeta.avb_version=报错的值
（部分模块导致，可自行排查）

## 伪装内核版本和第三方内核
（使用susfs伪装时勾选post-data，用原厂内核构建信息）

## 找到隐藏应用路径
（sus路径隐藏/随机包名/使用HMA）

## Evil loop
（权限异常为000，模块修改或自行修改导致，将文件夹改为555权限）

## Abnormal Environment 
侧信道检测，更新根管理器

## AbnormalEnvironment(04)/(01)、Detected anomalous file(Miscellaneous(a))、Cavert test(a)
（dev和/data/local/tmp目录下的文件检查，重命名/删除相关目录）建议格式化系统或者线刷

## 发现GG修改器运行痕迹
（删除/storage/emulated/0/legacy文件夹）

## Abnormal Environment(01)
自行排查异常文件（你对设备做了什么事情，你应该记得在哪里）
解决方案：删除以下路径的文件/文件夹：
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

## found## scene(1,2,3,4）
不使用scene或者无视

## 风险应用[检测数量]
（随机包名或者使用HMA，路径暴露需sus路径隐藏）

## 不受信任keyAttestation
（更换有效keybox）

## tee损坏
使用Tricky Store模块解决

## Found bl hide
（发现隐藏BL列表，自行排查）

## ADB[running] 
USB调试已开启（开发者选项关闭，一加无需处理）

## Found Su
发现了Su，除非susfs出现bug或者Magsik没做隐藏就不会出现（也可能某人傻到对检测软件授权su）

## Found XP
（检测到文件或类似HyperCeiler模块，清除/data/local/tmp/下所有文件或卸载该模块）

## 不合法的哈希值
用密钥验证/Native Detector获取Boot哈希值，创建sh脚本，root执行resetprop ro## boot## vbmeta## digest 自身哈希值
或者使用Tricky Store搭配TS插件并配置哈希值

## Covert test (10)
（外部存储存在sh脚本，删除或者整理后放无法读取目录下）

## 春秋已被隐藏应用列表隐藏/试图隐藏应用
字面意思

## 发现外挂文件
（按提示删除）

## hide hook
（检测到被hook，打开lsp取消对春秋检测的模块作用域勾选）

## found evil version
（无障碍列表关闭scene启用并重启手机）

## Abnormal Environment（n）
（按提示目录删除）

## 第三方rom(01)
（无视或者换回官方rom也可自行尝试解决）

## play lntegrity fix
更换play lntegrity fix模块或者卸载

## 发现异常修改
未知，或许软件包被篡改？

## Found Rekernel Module
发现ReKernel，更新Rekernel

## Conventiona Tests(a/b)
（未知）

## 密钥篡改！！！
检测到烧录tee等行为

## 发现可疑挂载
（未用模块隐藏挂载导致）
使用susfs或者zygisk next开启仅还原挂载

## Found Scene＞＞/dev/cpuset/scene-daemon
发现scene daemon
卸载scene或者无视

## BL已解锁
设备已解锁，用Tricky Store隐藏

## 异常文件
（按路径删除）

## Found LSPHook Framework
（某些xposed模块导致，可以通过排除法提供）

## Abnormal Environment
（存在## sh或隐藏应用列表配置等风险文件）

## 密钥吊销
（keybox被吊销）
更换keybox

## 密钥基础校验未通过
使用Tricky Store勾选包名

## 试图隐藏路径
使用sus隐藏某路径导致，但使用方法不对导致被检测

## Abnormal Environment(09)
未知

## 获取失败的KeyAttestation 
用Tricky Store强制模式（对包名前面加“!”符号）

## Tampered Kernel
系统内核信息被篡改，还原未修改的boot## img或者尝试使用susfs隐藏

## 发现外挂驱动
发现刷入了外挂驱动

## BL已解锁或密钥异常
在/data/adb/Tricky_Store/target## txt添加春秋包名+英文感叹号!

## 异常的system挂载 路径
（未知模块或其他因素产生的挂载）

## 当前设备机型已被篡改
（2.6.4扫盘测试项，后续改名为Property Modified）

## 系统异常修改>>com.android.camera
（移植系统的相机问题/不是原版相机,导致相机的前面不对,非系统签名,可以尝试使用HMA让春秋不可见相机试试（但后期可能会被检测））

## Miscellaneous Check(a)
（开启过隐藏应用列表（HMA）的Vold app data隔离,取消HMA的超级用户权限,再打开路径/data/property/persistent_properties后删除内部所有的文字并且保存再重启设备即可） 

## Property Modified
系统属性被修改
自行排查模块或者隐藏系统属性
也可以把shamiko模块的service.sh文件
移动至/data/adb/service.d/目录下
重启后可能解决

## 秘钥篡改（128）
Tricky Store是包名文件中对包名前面添加了“!”
强制模式导致的

## Mount loophole
通常与Magic Mount同时出现
对检测器开启排除列表后解决
（需要卸载挂载的模块如zygisk next）

## Magic Mount
通常与Mount loophole同时出现
对检测器开启排除列表后解决
（需要卸载挂载的模块如zygisk next）

## SU list
对检测器开启排除后会出现
但不稳定，时有时无

## 检测到scene端口占用
检测到scene的daemon进程
卸载scene或者关闭scene的无障碍权限
使用susfs隐藏也行，也可无视

## 异常进程 xxxx（pid）
根据给出的pid可使用工具查看对应的pid进程
一般是LSP进程
无视或者卸载LSP模块，也可自行琢磨解决

## /system/bin/xxx
一般会有/system/bin/adb
/system/bin/fastboot
/system/bin/imgbox
这是在设备上刷入了刷机工具模块或类似的
用于给其他设备刷写使用的，尝试卸载模块解决