# 春秋检测项解决方案（跟进最新版本）
> 整理：mingzun09(SuXiaoMing) | 仅供参考，具体结果因设备/环境而异

## 目录
- [进程/服务类异常](#进程服务类异常)
- [文件/目录权限/路径异常](#文件目录权限路径异常)
- [系统属性/内核/密钥异常](#系统属性内核密钥异常)
- [模块/工具残留异常](#模块工具残留异常)
- [环境/挂载/隐藏类异常](#环境挂载隐藏类异常)
- [其他杂项检测](#其他杂项检测)

---

## 进程/服务类异常
### 01. 异常进程组
- 关联项：LSP
- 解决方案：
  1. 设置中开启「应用多开」（任意应用），原理是创建999用户可消除该检测点
  2. 系统更新至最新（Android安全更新日期≥2026-2-1）
  3. 更新 LSP 模块至最新版

### 02. Evil Service
- 关联项：Zygisk Next
- 解决方案：
  - KSU 分支（sukisu/ksunext 等）：Zygisk 中开启「仅还原挂载模式」
  - Magisk 分支（Alpha/Kitsune）：Zygisk Next 中开启「强制模式/仅还原挂载模式」（部分设备可能无效）

### 03. 异常进程 xxxx（PID）
- 特征：通常为 LSP 进程
- 解决方案：无视 / 卸载 LSP 模块 / 自行排查对应 PID 进程（可通过进程工具定位）

### 04. Evil loop
- 特征：文件夹权限异常为 000（模块/手动修改导致）
- 解决方案：将对应文件夹权限改为 555

---

## 文件/目录权限/路径异常
### 05. futile hode（tmp 异常）
- 特征：/data/local/tmp/ 目录被修改
- 解决方案（二选一）：
  1. 恢复目录（Susfs / 格式化，不推荐）
  2. 删除原 tmp 文件夹，在 /data/local/ 下任选一个文件夹重命名为 tmp

### 06. Suspicious Surroundings(a/b/c)
- 检测路径：/data/local/tmp
- 细分解决方案：
  - (a)：tmp 文件夹所属用户/组改为 shell（默认 root 导致检测）
  - (b)：tmp 的 inode 值高于 10000 → 参考「05. futile hode」解决
  - (c)：tmp 权限改为 771（当前非 771 触发检测）

### 07. MT2/异常文件
- 特征：根目录存在「mt2」文件夹 / .sh/.img 等异常文件
- 解决方案：
  1. MT 管理器设置中修改默认路径名称，删除旧 mt2 文件夹
  2. 根目录下删除 .sh/.img 等异常文件

### 08. 发现GG修改器运行痕迹
- 解决方案：删除路径 `/storage/emulated/0/legacy`

### 09. Covert test (10)
- 特征：外部存储存在 sh 脚本
- 解决方案：删除脚本 / 移至检测工具无法读取的目录

### 10. 异常文件/Suspicious Files（通用）
- 检测路径：dev / /data/local/tmp
- 解决方案：
  1. 重命名/删除相关目录文件（建议格式化系统/线刷）
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

### 11. /system/bin/xxx 异常
- 常见触发项：/system/bin/adb / fastboot / imgbox
- 原因：刷入刷机工具类模块
- 解决方案：卸载对应刷机工具模块

---

## 系统属性/内核/密钥异常
### 12. Magisk/sukisu/隐藏/Dirty file
- 检测特征：文件含关键词（magisk/sukisu/alpha/zygisk/riru/lsposed/xposed/root/刷机/hide/ksu/shamiko/tircky）
- 解决方案：
  1. 删除存储目录下含上述关键词的文件
  2. 避免在 root 管理器截图（小米截图会包含应用名）
  3. 升级 Android 安全补丁（无零宽漏洞可规避检测）/ 安装 FuseFixer 模块

### 13. Tampered Attestation Key
- 特征：密钥被篡改（新检测点）
- 解决方案：尝试烧录密钥（效果因人而异）/ 等待 TS 模块更新

### 14. ro.boot.vbmeta.avb_version=报错的值
- 特征：AVB 版本异常（模块修改导致）
- 解决方案：排查修改该属性的模块 / 隐藏此系统属性

### 15. 伪装内核版本和第三方内核
- 解决方案：Susfs 伪装时勾选 post-data，使用原厂内核构建信息

### 16. Tampered Attestation(a)/(b)
- 细分解决方案：
  - (a)：密钥替换 → 清除春秋全部数据
  - (b)：不稳定测试项 → 无需处理

### 17. 不合法的哈希值
- 解决方案：
  1. Native Detector 获取 Boot 哈希值
  2. 创建 sh 脚本，root 执行：
     ```sh
     resetprop ro.boot.vbmeta.digest 自身哈希值
     ```
  3. 或使用 Tricky Store + TS 插件配置哈希值

### 18. 不受信任keyAttestation
- 解决方案：更换有效 keybox

### 19. 密钥篡改！！！ / 秘钥篡改（128）
- 原因：Tricky Store 包名文件中添加「!」强制模式导致
- 解决方案：删除「!」符号 / 改为「?」符号

### 20. 密钥吊销
- 特征：keybox 被吊销
- 解决方案：更换 keybox

---

## 模块/工具残留异常
### 21. 审计日志伪造
- 关联项：ZN-AuditPatch/Susfs AVC 伪造
- 解决方案：等待模块更新 / 更新系统至 Android 安全更新 2025-09-01+（各 OEM 合入时间不同）

### 22. Abnormal Environment(02)
- 特征：检测到 HyperCeiler 残留
- 解决方案：执行以下 sh 指令：
  ```sh
  resetprop persist.hyperceiler.log.level ""
  resetprop --delete persist.hyperceiler.log.level
  ```

### 23. Found Injection (a)/Found Injection 01,02,03
- 常见原因：调度模块（如满血核心）/ LSP/Zygisk 版本过旧
- 解决方案：
  1. 排查并卸载调度类模块
  2. 更新 Zygisk Next 及 LSP 模块至最新版

### 24. 发现外挂文件
- 解决方案：按检测提示路径删除对应文件

### 25. found evil version
- 解决方案：关闭 Scene 无障碍列表权限 → 重启手机

### 26. play lntegrity fix
- 解决方案：更换/卸载 play integrity fix 模块

### 27. Found Rekernel Module
- 解决方案：更新 Rekernel / 卸载 Rekernel（如有条件）

### 28. Found XP
- 特征：检测到 HyperCeiler 等 XP 模块 / 相关文件
- 解决方案：清除 /data/local/tmp/ 下所有文件 / 卸载对应模块

---

## 环境/挂载/隐藏类异常
### 29. 虚拟机环境
- 原因：改机型模块 / prop 被修改
- 解决方案：关闭改机型模块 / 还原 prop

### 30. 环境异常a / Abnormal Environment / AbnormalEnvironment(04)/(01)
- 特征：侧信道检测 / APatch 环境异常
- 解决方案：
  1. 更新根管理器
  2. APatch 用户：安装 Nohello.kpm 模块隐藏
  3. 重命名/删除 dev / /data/local/tmp 下异常文件

### 31. 发现隐藏的UID
- 检测路径：/sys/fs/cgroup/
- 解决方案：Sus 挂载隐藏 / 自行排查

### 32. 风险应用 / 风险应用[检测数量]
- 解决方案：卸载风险应用 / Susfs 隐藏 / HMA-OSS 隐藏 / 随机包名

### 33. bl状态异常 / tee损坏 / BL已解锁或密钥异常
- 解决方案：
  1. 刷入 Tricky Store 模块
  2. 在 `/data/adb/tricky_store/target.txt` 中添加检测器包名（BL异常需加英文!）

### 34. 找到隐藏应用路径
- 解决方案：Sus 路径隐藏 / 随机包名 / 使用 HMA

### 35. 发现可疑挂载
- 原因：未用模块隐藏挂载
- 解决方案：使用 Susfs / Zygisk Next 开启仅还原挂载

### 36. Bootloader unlock/启动状态异常
- 解决方案：使用 Tricky Store 隐藏

### 37. ADB[running]
- 特征：USB调试已开启
- 解决方案：开发者选项中关闭 USB 调试

### 38. Found Su
- 触发条件：Susfs 漏洞 / Magisk 未隐藏 / 对检测软件授权 Su
- 解决方案：修复 Susfs / 重新隐藏 Magisk / 取消检测软件 Su 授权

### 39. hide hook
- 特征：检测到 Hook 行为
- 解决方案：LSP 中取消对春秋检测的模块作用域勾选

### 40. Mount loophole / Magic Mount
- 特征：通常同时出现
- 解决方案：对检测器开启排除列表 / 卸载 Zygisk Next 等挂载类模块

### 41. SU list
- 特征：对检测器开启排除后出现（不稳定）
- 解决方案：无视（时有时无，无强影响）

### 42. 检测到scene端口占用
- 特征：检测到 Scene daemon 进程
- 解决方案：卸载 Scene / 关闭 Scene 无障碍权限 / Susfs 隐藏 / 无视

---

## 其他杂项检测
### 43. Miscellaneous Check (13)
- 特征：通常与其他问题同时出现
- 解决方案：使用 Susfs 模块

### 44. 当前设备机型已被篡改
- 特征：2.6.4 扫盘测试项（后续更名 Property Modified）
- 解决方案：参考「Property Modified」

### 45. Property Modified
- 特征：系统属性被修改
- 解决方案：
  1. 排查修改属性的模块 / 隐藏系统属性
  2. 将 Shamiko 模块的 service.sh 移至 `/data/adb/service.d/` → 重启

### 46. 春秋已被隐藏应用列表隐藏/试图隐藏应用
- 特征：字面意思（检测到隐藏行为）
- 解决方案：调整隐藏策略（如改用 Susfs 而非应用列表隐藏）

### 47. 系统异常修改>>com.android.camera
- 原因：移植相机 / 非原版相机（非系统签名）
- 解决方案：使用 HMA 让春秋无法读取相机信息（后期可能被检测）

### 48. Miscellaneous Check(a)/Cavert test(a)/Detected anomalous file
- 解决方案：格式化系统 / 线刷 / 排查并删除异常文件

### 49. Abnormal Environment(09)
- 特征：未知触发条件
- 解决方案：暂无明确方案，建议排查近期修改的系统配置

### 50. Conventiona Tests(a/b)
- 特征：未知触发条件
- 解决方案：暂无明确方案，建议等待检测规则更新

### 51. 发现异常修改
- 特征：未知（疑似软件包被篡改）
- 解决方案：排查系统文件完整性 / 重新安装检测软件

### 52. 试图隐藏路径
- 原因：Sus 隐藏路径使用方法错误
- 解决方案：重新配置 Sus 路径隐藏规则

### 53. Found bl hide
- 特征：发现隐藏BL列表
- 解决方案：自行排查系统中隐藏BL的配置/模块

### 54. Tampered Kernel
- 特征：系统内核信息被篡改
- 解决方案：还原未修改的boot.img / 使用susfs隐藏内核相关属性
