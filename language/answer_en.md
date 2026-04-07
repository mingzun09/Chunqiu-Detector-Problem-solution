# Chunqiu Detector Solutions (Latest Version) English Version
> Organized by: mingzun09(SuXiaoMing) | For reference only, results vary by device/environment.
> Solutions with "?" are uncertain.
> Document Link: [github](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution)

## Detections you tried but can't pass
Don't just report false positives with a screenshot, or I'll consider blocking you directly.
If you need human help, please have a "good" attitude first.

## mountinfo
> The mount views obtained through two different methods are inconsistent, suggesting potential concealment.
> Try hiding or replacing/configuring meta-modules to resolve.

## Dirty Device(a)
> Kernel interface detected? Features of a specific cheat/plugin.

## zygote test (1)
> Enable the linker function and anonymous memory function of Zygisk Next to try and resolve.
> Exclusion list strategy - Restore mount only.

## Inconsistent mount
> Part of the mount is parsed from `/proc/self/exe/`, and then the file system type is checked for consistency.
> Currently no solution.

## TEE environment untrusted
> [From Tencent](https://github.com/Tencent/soter)
> Similar to WeChat's fingerprint.
> Waiting for module updates.

> Replace with TEESimulator/RS version to try and resolve.

## Tampered Attentionkey(X)
> Detection for TEE. If present, "please wait for relevant module updates to fix", or re-lock the bootloader.
Even efisp's fake lock or custom bootloader "might" report this.

> 15 HanAttest chain inconsistency (Different source from TEESimulator constants below, but in the same mask)

> 18 : Vendor placeholder KeyMint tag still successfully issued a key (tee2 §1)

> 23 : Leaf certificate KeyUsage contradicts KeyPurpose in extensions

> 24 : Binder over-long alias / large transaction probe anomaly

> 25 : Leaf certificate SigAlg does not match the issuing key algorithm

> 26 : Certificate patch tag inconsistent with system properties (related to security patches)

> 27 : USER_ID appears in teeEnforced

> 29 : APPLICATION_ID present without a challenge (see table above)

> 30 : Sensitive device identifier attestations not rejected (e.g., SERIAL)

## Found property
Execute [this sh](https://t.me/chunqiudetector/14681) to try and resolve.

## TrickyStore/Similar Module Found
> Attempt 1
Replace with a module like [TEESimulator](https://github.com/JingMatrix/TEESimulator)

> Attempt 2
Delete the `/data/adb/tricky_store/security_patch.txt` file.

> Attempt 3
With the [TEESimulator](https://github.com/JingMatrix/TEESimulator) module present, first flash [version 0.8.2.1](https://t.me/chunqiudetector/10461) of the TS-Enhancer-Extreme module. After rebooting and entering the system, flash [v1.0](https://t.me/chunqiudetector/10460).
Overwriting can resolve the issue. Remember to back up your keybox, as the above actions will overwrite the original keybox file.

## TEE Spoofing
> Use the TEESimulator-RS module to resolve.

## Property Modified (Number represents how many properties were modified)
> The principle is to check for holes in the property area. If holes exist, it indicates property modification.

> To hide modified properties, add the [service.sh](https://t.me/chunqiudetector/10259) file from the Shamiko module to the `/data/adb/service.d/` directory and restart to try and resolve.

## Environment Doubt 1 (Experimental Detection)
> This detection item appears if the "Input Method" option in the preset settings is checked after hiding the detector in blacklist mode in HMA-OSS?

## Evil Service
> Detection related to LSP, shuziku, and some Xposed modules.

## Found ksu/No-unlock Device
> KSU is found to be in jailbreak mode; the current device uses KSU jailbreak mode for ROOT.

## SU binary detected
> SU binary detected (ROOT detected).

## Miscellaneous Check (a)
> dex2at detected (Usually an LSP issue; replace/update the LSP module).

## Mount loophole
> Magic Mount takes effect for system modification module mounts.

> However, mounting requires other modules for hiding (options include susfs/zygisk next).

> Use zygisk next's exclusion strategy > Unmount only.

> Configure the exclusion list / enable default module unmounting to hide it.

## Magic Mount
> Magic Mount detected.

> Please try to exclude certain modules that modify the system.

> Use certain modules to hide this issue (e.g., the exclusion strategy in zygisk next).

## [Hook] Suspicious library injection
(zygisk/riru/xposed)
HOOK detected. Troubleshoot the cause yourself; there are too many factors.

## SU list (Deleted)
> Detected a ROOT permission exclusion list similar to KSU's.

> This detection item is unstable and appears occasionally (usually more common with KSU LKM mode).

## Abnormal Environment
> KSU/APatch/Magisk detected.

> Side-channel detection; update your root manager and re-patch.

## AbnormalEnvironment(04)
> New version changed to function call detection (unstable?).

> Waiting for root manager/module updates?

> Does this issue appear after enabling APatch's exclusion modification for the detector?

## KnelsU loop device
> KSU detected.

> Update your manager and re-patch.

## Suspicious Surroundings
> APatch detected.

> Update APatch and load a KPM hiding module (e.g., Nohello.kpm) to resolve.

## Device is an Emulator
> The current device is an emulator.

## avb verification abnormal avb=2.0
> Abnormal avb version.

> Certain modules can cause this, such as device model modification modules.

## Found LSPHook Framework
> LSPHook Framework detected.

> Caused by certain Xposed modules; you can also uninstall or replace the LSP module.

## Scene Port Occupied Detected
> Scene software; you can try to hide it.

> Ignore this detection or disable Scene's accessibility permissions.

## Zygisk detected
> Zygisk detected. Usually caused by Magisk's built-in Zygisk (disable it to resolve) or other reasons.

> Update the [Zygisk Next module](http://github.com/Dr-TSNG/ZygiskNext).

## Tempered kernel
> Kernel information verification abnormal (kernel version string, kernel build time).

> Try using SUSFS to hide it or restore the unmodified `boot.img`.

## [hook]Resetprop modified
> resetprop has been modified.
> Unknown.

## Suspicious Surroundings (a)
> Path: `/data/local/tmp`

> The `tmp` folder is set to root user and owner group; changing it to shell will resolve it.

## Suspicious Surroundings (b)
> Path: `/data/local/tmp`

> The `tmp` folder's inode value is higher than 10000 (indicates it has been deleted).

> Format the system or use SUSFS to spoof the path's inode value to < 1000.

## Suspicious Surroundings (c)
> `/data/local/tmp`

> Permissions of the `tmp` folder have been modified (default is 771).

## Futile hide
> The following solutions may be outdated.

> The timestamp of the `/data/local/tmp` folder has been modified.

> Format the system or delete the `tmp` folder and restart (this will revert it to the 'abc' states above), then use the Kstat configuration in sukisu (requires kernel-integrated SUSFS) to add the `/data/local/tmp` directory and only modify the inode value (e.g., to 7365). Keep `tmp` permissions at 771 and owner as shell.

## Miscellaneous Check(2)
> Device tampering detected.

> Caused by device model modification modules?

> Lenovo/Meizu/International devices might trigger false positives?

## Miscellaneous Check(3)
> Device modification detection?
> The following solution may be outdated.
> Vold app data isolation for those who have enabled "Hide My Applist (HMA)"?

## Inconsistent mount/debug_ramdisk
> `umount /debug_ramdisk`

## Netlink socket anomaly
> Currently unknown.

## /data/local/tmp denied
> Access to `/data/local/tmp` is denied. Possible folder permission issue? Or the folder does not exist?

## Spoofed Kernel
> Ineffective use of SUSFS to spoof the kernel.

> Choose `post-fs-data` during the kernel spoofing startup phase.

## Futile hide 04
> Principle: Mount namespace?

> Mount abnormality detected.

> Try replacing the "meta-module" to resolve.

## Mount Gap
> Mount abnormality detected.

> Try replacing the "meta-module" to resolve.

## 2222
> Mount abnormality detected.

## Third-party Kernel
> Kernel information matches the preset list.

> Resolve by spoofing kernel information.

## Third-party ROM/Self-compiled Kernel
> Third-party ROM signature.

> Kernel version suffix contains `-Dirty`.

> Resolve by spoofing kernel information.

## Third-party ROM (2)
> Currently unknown.

## ROM detected
> Third-party ROM detected.

> Some third-party ROM characteristics match.

> You can try spoofing it yourself.

## Suspicious Terminal Environment
> Pty detected.

## Environment Fake
> Old devices (Kernel 4.x) might have false positives?
> This detection is triggered after flashing the ZN-Audit Patch module or similar behavior.

> Uninstall the ZN-Audit Patch module.

## ROOT Process
> Zygote environment detected?

> Read via audit log vulnerability (avc).

> You can use SUSFS features or the ZN-AuditPatch module.

> Fixed in the Android security update 2025/09/01 (Inaccurate, but this is the current observation).

## Abnormal Process
> Hidden process groups detected.

> Try enabling a random app clone in system settings to resolve.

## Abnormal Process 0000 (pid)
> 0000 represents the process PID.

> You can try using shell commands as root to execute `ps -ef | grep number_id` to find the corresponding PID process (usually an LSP process).

> Alternatively, try enabling an app clone in system settings to resolve.

> False positives may occur.

## MT Manager (MT2 folder)/Abnormal Files
> Abnormal files: Detection of the `mt2` folder in the root directory and abnormal files such as `boot.img`.

> This can be resolved by customizing the MT2 path in MT Manager settings.

## Risk apps 'package name'
> Risk apps detected > package name.

> Install the [Unicode Zero-Width Repair Module](https://t.me/real5ec1cff/268) to fix readability issues in the `/storage/emulated/0/Android/data/` directory and use with HMA-OSS to hide risky applications.

## Thanox service detected
> Thanox service detected.

> You can use this Xposed module to hide it: [hideThanox](https://t.me/Suxiaomingpd/125).

## Detection Failed
> 2333333

## TEE Damaged
> Try using Tricky Store or the [TEESimulator-RS](https://github.com/Enginex0/TEESimulator-RS) module to resolve.

## Key Attestation Incomplete or Chain Inconsistent
> Use [TEESimulator-RS](https://github.com/Enginex0/TEESimulator-RS) and configure it to try and resolve.

## AOSP Key
> Replace the `keybox.xml` file in the `/data/adb/tricky_store/` directory.

## Boot Hash Mismatch
> Boot image hash mismatch.

> Usually, the hash becomes 0000 after unlocking the BL. Use [Native detector](https://t.me/rootdetector/49) to get the correct hash, then use the Tricky Store/[TEESimulator-RS](https://github.com/Enginex0/TEESimulator-RS) module and configure the hash to resolve.

## Bootloader unlock
> BL is unlocked. Hide it using the [TEESimulator-RS module](https://github.com/Enginex0/TEESimulator-RS).
Need to configure the `target.txt` file in the `/data/adb/tricky_store/` directory, adding the package names (takes effect in real-time without rebooting).

## Abnormal Boot Status
> BL is unlocked. Hide it using the [TEESimulator-RS module](https://github.com/Enginex0/TEESimulator-RS).
Need to configure the `target.txt` file in the `/data/adb/tricky_store/` directory, adding the package names (takes effect in real-time without rebooting).

## Key Tampering (128)
> Tricky Store uses "Key Chain Generation Mode" by default on OnePlus Qualcomm devices.

> Try replacing it with the [TEESimulator-RS module](https://github.com/Enginex0/TEESimulator-RS).

## Key Tampering (q)
> Unknown.

## Key Tampering (b)
> Unknown.

## Certificate Revoked (CRL)
> Replace the `keybox.xml` file in the `/data/adb/tricky_store/` directory.

## Key Tampering
> [Use the TEESimulator-RS module?](https://github.com/Enginex0/TEESimulator-RS)

## TrustedCert Certificate Tampering
> Unknown.

## Something wrong
> Unknown.

## Miscellaneous Check (4/5/6/7/8/9)
> Detections related to emulator/virtual machine characteristics or device modification behavior.

> False positives may occur.

## Miscellaneous Check (Inconsistent Mount)
> Experimental detection, please ignore.

## Abnormal Files
- Detection paths: `/dev` and `/data/local/tmp`
  1. Rename or delete relevant directory files.
  2. Investigate and delete the following high-risk paths:
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
> Use zygisk next's exclusion strategy > Unmount only.
> Configure the exclusion list / enable default module unmounting to hide it.
