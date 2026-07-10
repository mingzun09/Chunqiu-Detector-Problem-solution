# Chunqiu Detector Solutions (Latest Version) - English Version
> Organized by: mingzun09(SuXiaoMing) | For reference only, results vary by device/environment.
> Solutions with "?" at the end are uncertain.
> Document Link: [github](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution)

# Detections you tried but can't pass
Open an issue with your module list and which Xposed modules you're using, etc. I'll reply/help when I have time.

# Miscellaneous Check(12)
> Heuristic detection of Zygisk implementations (especially Zygisk-Next) via smaps scanning. However, the current implementation has issues that render the detection ineffective.
> Please ignore this item until the detection method is fixed or removed.

# Looper fd Graph Anomaly
> Under analysis for reproduction, to be supplemented...

# HMA Possibly Present
> Suspected detection of old Scene_Hide-eBPF module behavior (cannot detect Scene app, but detects related services).
> 
> [Branch project / Pull update to rebuild module and flash / Download from Releases](https://github.com/Andrea-lyz/Scene-Port-Hider-by-eBPF)

# Module Modifying Chunqiu Detected
> Occurs after using the IsolPolicy module; resolve by disabling scope or uninstalling the module.

> It's not just modules — Magisk's hide features (e.g., SELinux modification hiding) can also trigger this. Try updating to the latest CI version of your root manager to resolve.

# Suspicious SELinux Policy Detected / ROOT Detected
> Detection method reference: https://github.com/LSPosed/DirtySepolicy
> 
> New SELinux feature detection (app zygote has access to `/sys/fs/selinux/access`).
> 
> **KSU users:** [Update KSU Manager](https://t.me/KernelSU_group/3234/482579), re-patch image, flash, reboot, then enable selinux_hide feature.

> **APatch/FolkPatch users:** [Load/embed this kpm](https://github.com/Admirepowered/selinux_hook)

> **Magisk:** ...try switching to a kernel-level manager.

# fdinfo mnt Sampling Anomaly (c)
> Likely detects USB debugging traces, low probability false positive. Try using the [ADB Trace Cleaner](https://github.com/YiJieqwq/ADB-Trace-Cleaner/releases) script to resolve.

# Memory Anomaly
> Clear the detector app data first. If it persists, open an issue with your module list and which Xposed modules you're using, I'll look into it when I have time.

# Futile hide 1
> Rarely appears, cause unknown, no reliable solution yet.

# Risky Applications
> Means of detection unknown. Try using HMA-OSS to hide potentially risky apps from the detector.

# mountinfo
> Mount views obtained via two different methods are inconsistent, suggesting potential concealment. Sometimes a service doesn't process in time and triggers this (early mountinfo snapshot vs. late comparison).
> Xiaomi devices often show this when opening the detector under high system load after boot.

# Dirty Device(a)
> Kernel interface detected? External sh detected?
> Detects folders/files under `/storage/emulated/0/` with "sh" in their names.
> Try restarting or reinstalling the system.
> Delete any folders/files with "sh" in their names under `/storage/emulated/0/`.

## zygote test (1)
> Enable ZygiskNext's linker function and anonymous memory function to try resolving.
> Exclusion list strategy — Restore mount only.
> Unstable detection, occasional occurrence.

## Inconsistent mount
> Parses part of the mount from `/proc/self/exe/`, then checks if file system types are consistent.
> Some devices have unfixed false positives (fixed in version 3.4).

## TEE Environment Untrusted
> [SoterService from Tencent](https://github.com/Tencent/soter)
> Purpose: WeChat fingerprint payments, etc.

> Detection method: Checks files to determine if Soter service programs exist and cross-validates with service point attribute status to determine if Soter key is blocked.
> 1. Abnormal service point attributes + Soter program exists → Soter is blocked (Abnormal)
> 2. Abnormal service point attributes + Soter program absent → This device natively does not support Soter (Normal)
> 3. Normal service point attributes + Soter program exists → Device supports Soter (Normal)
> 4. Normal service point attributes + Soter program absent → Impossible

Solutions:

> Wait for module updates (fixing SoterService is unlikely).
> Use SusFS or PathMask to hide related service paths, and use HMA-OSS to hide the Soter system service app from the detector to try resolving.

Note: PathMask is not focused on environment hiding, use with caution.

Principle: Currently we cannot technically simulate the Soter service, but we can hide Soter-related files to fake case #2.

## Tampered Attentionkey(X)
> Carries 20+ types of anomaly tags (mostly OEM-specific). Targets TEE's handling of anomaly tag feedback against expected values.
>
> For TEE detection — if present, wait for module updates or re-lock the bootloader.
>
> Even efisp's fake lock or custom bootloader "may" trigger this.

> 15: HanAttest chain inconsistency (different source from TeeSim constant below, but in the same mask)

> 18: Vendor placeholder KeyMint tag still successfully issued a key (tee2 §1)

> 23: Leaf certificate KeyUsage contradicts KeyPurpose in extensions

> 24: Binder over-long alias / large transaction probe anomaly

> 25: Leaf certificate SigAlg does not match issuing key algorithm

> 26: Certificate patch tag inconsistent with system properties (related to security patches) ([execute this sh script](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution/blob/main/File/Tampered%20Attestation%20Key(26)Pass.sh) to try resolving)

> 27: USER_ID appears in teeEnforced

> 29: APPLICATION_ID present without a challenge

> 30: Sensitive device identifier attestations not rejected (e.g., SERIAL)

## Found property
Execute [this sh script](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution/blob/main/File/Found%20property.sh) to try resolving.

## TrickyStore Hook/2
> Timing side-channel (unstable). May disappear on re-open.
> Replace with [TEESimulator](https://github.com/JingMatrix/TEESimulator) module.

## Found TrickyStore/Similar Module
> Attempt 1: Replace with [TEESimulator](https://github.com/JingMatrix/TEESimulator).

> Attempt 2: Delete `/data/adb/TrickyStore/security_patch.txt`.

## TEE Spoofing
> Use the TEESimulator(RS) module with certificate chain generation mode to resolve.

## Property Modified (Number represents how many properties were modified)
> Principle: Checks for holes in the property area — if holes exist, properties have been modified.

> To hide modified properties, add the [shamiko_Plus.sh](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution/blob/main/File/shamiko_Plus.sh) file to `/data/adb/service.d/` and reboot to try resolving.

## Environment Doubt 1 (Experimental Detection)
> In HMA-OSS, if the "Input Method" option in preset settings is checked while hiding the detector in blacklist mode, this detection may appear?

## Evil Service
> Detection related to LSPosed, Shizuku, and some Xposed module modifications.

## Found ksu/No-unlock Device
> KSU detected in jailbreak mode, current device using KSU jailbreak mode ROOT method, or KSU processes detected, etc.

> Jailbreak mode is not recommended, so no solution is provided here.

## SU binary detected
> SU binary detected (ROOT detected).

## Miscellaneous Check (a)
> dex2oat detected (Usually an LSP issue; replace/update the LSP module).

## Mount loophole
> Magic Mount takes effect for system modification module mounts.
> 
> Mounting needs to be hidden by other modules (SusFS/ZygiskNext).
> 
> Use ZygiskNext's exclusion strategy > Restore mount only.
> 
> Configure the exclusion list / enable default module unmounting.
> 
> Hide it.

## Magic Mount
> Magic Mount detected.
> 
> Try excluding certain system-modifying modules.
> 
> Use certain modules to hide this issue (e.g., ZygiskNext's exclusion strategy).

## [Hook] Suspicious library injection
(zygisk/riru/xposed)
HOOK detected. Troubleshoot the cause yourself — too many possible factors.

## SU list (Deleted)
> Detected a ROOT permission exclusion list similar to KSU's.
> 
> Unstable, appears occasionally (more common with KSU LKM mode).

## Abnormal Environment
> Detects KSU/APatch (side-channel detection).
> 
> Detection principle reference: [this document](/File/Doc/ksu_kp_sidechannel_zh.md)
>
> Solution (KernelSU): Update your KernelSU Manager and re-patch (LKM work mode) or re-integrate (GKI and Non-GKI work mode).
> 
> Solution (APatch):
> 1. Install [nohello kpm](/File/Bin/Nohello-v1.8.2.9-83-b3e7d87-release.kpm), and add the detector to the exclusion list. Nohello can check whether the app initiating the authentication request is in the exclusion list before kernelpatch evaluates the cmd value, and if so, deny the authentication.
> 2. Future versions of APatch will introduce signature-based authentication, directly rejecting authentication requests from apps whose signatures do not match. This is not fully implemented yet and requires some waiting.

## Abnormal Environment (04)
> New version changed to function call detection (unstable?).
> 
> Waiting for root manager/module updates?
> 
> APatch's exclusion modification enabled for the detector may cause this?

## KernelSU loop device
> KSU detected.
> 
> Update your manager and re-patch.

## Suspicious Surroundings
> APatch detected.
> 
> Update APatch and load a KPM hiding module (e.g., Nohello.kpm).

## Device is an Emulator
> Current device is an emulator device.

## avb verification abnormal avb=2.0
> Abnormal avb version.
> 
> Certain modules can cause this, such as device model changers. Troubleshoot yourself.

## Found LSPHook Framework
> LSPHook Framework detected.
> 
> Caused by certain Xposed module modifications. You can also uninstall and replace the LSP module.

## Scene Port Occupied Detected
> Check this [project](https://github.com/Andrea-lyz/Scene-Port-Hider-by-eBPF) to resolve.
> 
> Ignore this detection, or disable Scene's accessibility access.
>
> Update Scene to v9.3.1+.

## Zygisk detected
> Zygisk detected — usually Magisk's built-in Zygisk (disable it) or other causes.
> 
> Update the [ZygiskNext module](http://github.com/Dr-TSNG/ZygiskNext).

## Tampered kernel
> Kernel information checksum abnormal (kernel version string, kernel build time).
> 
> Try using SusFS to hide it or restore the unmodified boot.img.

## [hook] Resetprop modified
> resetprop has been modified.
> Unknown cause.

## Suspicious Surroundings (a)
> Path: `/data/local/tmp` folder's group is abnormal.

Solution: Change group to shell.

## Suspicious Surroundings (b)
> Path: `/data/local/tmp` folder's inode value > 10000.

Solutions: Factory reset the device / Use SusFS to spoof inode value < 1000 / Try using the [Inode-Hijacker](https://github.com/YiJieqwq/Inode-Hijacker/releases) script to resolve.
If wired display projection (e.g. Scrcpy) becomes unavailable, use `su -c restorecon -RF /data/local/tmp` to resolve.

## Suspicious Surroundings (c)
> `/data/local/tmp` — permissions modified (default is 771).

Solution: Reset permissions.

## Futile hide
> The following solutions may be outdated.
> 
> The timestamp of `/data/local/tmp` has been modified.
> 
> Format the system, or delete the `tmp` folder and reboot (this reverts to states a/b/c above), then use sukisu's Kstat config (requires kernel-integrated SusFS) to add `/data/local/tmp` with a modified inode value (e.g., 7365). Keep `tmp` permissions at 771 and owner as shell.

## Miscellaneous Check (2)
> Device tampering / model modification detected.
> 
> Caused by model-changing modules? Troubleshoot yourself.

## Miscellaneous Check (3)
> Device modification detection?
> The following solution may be outdated.
> Did you enable HMA's "Vold app data isolation"?

## Inconsistent mount / debug_ramdisk
> `umount /debug_ramdisk`

## Netlink socket anomaly
> Currently unknown.

## /data/local/tmp denied
> Access to `/data/local/tmp` denied. Permission issue? Folder doesn't exist?

## Spoofed Kernel
> Ineffective use of SusFS to spoof the kernel.
> 
> Select `post-fs-data` during the kernel spoofing startup phase.

## Futile hide 04
> Principle: Mount namespace?
> 
> Mount abnormality detected.
> 
> Try replacing the "meta-module" to resolve.

## Mount Gap
> Determines whether root hiding behavior exists by checking mount group IDs.
> 
> In this method, when mount group IDs grow discontinuously (e.g., 1,2,3,6,7,8...), it is determined that root hiding behavior exists. Conversely, when mount group IDs grow continuously (e.g., 1,2,3,4,5,6,7...), it is normal.
>
> This phenomenon occurs when Magisk switches namespace. For KernelSU/APatch, it may also occur if certain modules with bind mount functionality are used.
> 
> Solutions:
> Magisk: Use Magisk Alpha to resolve, principle unknown.
> 
> KernelSU/APatch: Try replacing the "meta-module" or updating the root manager.
>
> If the problem persists, check system modules with bind mount functionality, and whether the system natively exhibits this phenomenon.

Note: A small number of ROMs natively exhibit this phenomenon. If this is the case, please ignore this item.

## 2222
> Mount abnormality detected.

## Third-party Kernel
> Kernel information matches a preset list.
> 
> Resolve by spoofing kernel information.

## Third-party ROM / Self-compiled Kernel
> Third-party ROM flagged.
> 
> Kernel version suffix contains `-Dirty`.
> 
> Resolve by spoofing kernel information.

## Third-party ROM (2)
> Currently unknown.

## ROM detected
> Third-party ROM detected.
> 
> Some characteristics match known custom ROMs.
> 
> Try spoofing.

## Suspicious Terminal Environment
> Pty detected.

## Environment Fake
> Old devices (Kernel 4.x) may have false positives?
> This detection is triggered after flashing ZN-Audit Patch or similar modules.
> 
> Uninstall the ZN-Audit Patch module.

## ROOT Process
> Zygote environment detected?
> 
> Read via audit log vulnerability (avc).
> 
> Use SusFS features or the ZN-AuditPatch module.
> 
> Fixed in Android security update 2025/09/01 (not entirely accurate, but that's the observation).

## Abnormal Process
> Hidden process groups detected.
> 
> Try enabling an app clone (app twin) in system settings to resolve.

## Abnormal Process 0000 (pid)
> 0000 represents the process PID.
> 
> You can run `ps -ef | grep <pid>` as root to identify the process (often a root-privileged daemon, e.g., lspd, Tricky-Store process).
> 
> Solution: This detection relies on a security vulnerability. Updating the security patch to 2026-01-01 can significantly reduce the detection rate, but it cannot be fully resolved at present. This security vulnerability will be completely fixed after Google officially releases Android 17.
> 
> False positives may occur.

## MT Manager (MT2 folder) / Abnormal Files
> Abnormal files: Detects the `mt2` folder in root directory, `boot.img` files, and `.xml` abnormal files.
> 
> Change the MT2 path in MT Manager settings (custom path) and delete the old folder.

## Risk apps 'package name'
> Risk apps detected > package name.
> 
> Install the [Unicode Zero-Width Repair Module](https://t.me/real5ec1cff/268) to fix readability of `/storage/emulated/0/Android/data/`, then use HMA-OSS to hide risky apps.

## Thanox service detected
> Thanox service detected.
> 
> Use the [hideThanox](https://t.me/Suxiaomingpd/125) Xposed module to hide it.

## Detection Failed
> 2333333

## TEE Damaged
> Try using Tricky Store or the [TEESimulator-RS](https://github.com/Enginex0/TEESimulator-RS) module.
Use with [TS-Plugin](https://github.com/KOWX712/Tricky-Addon-Update-Target-List/releases/tag/v5.0-beta.1).
Reboot after flashing, then open the module's webUI to configure.
> For TEE-damaged devices, use certificate chain generation mode.

## Key Attestation Incomplete or Chain Inconsistent
> Use [TEESimulator-RS](https://github.com/Enginex0/TEESimulator-RS) and configure it to try resolving.

## AOSP Key
> Replace `keybox.xml` in `/data/adb/Tricky Store/`.
You can also flash [TS-Plugin](https://github.com/KOWX712/Tricky-Addon-Update-Target-List/releases/tag/v5.0-beta.1).
Reboot and open the module's webUI to configure keys.

## Boot Hash Mismatch
> Boot image hash mismatch.
> 
> Usually becomes `0000` after BL unlock. Use [Native detector](https://t.me/rootdetector/49) to get the correct hash, then use Tricky Store / [TEESimulator-RS](https://github.com/Enginex0/TEESimulator-RS) with [TS-Plugin](https://github.com/KOWX712/Tricky-Addon-Update-Target-List/releases/tag/v5.0-beta.1) to configure the hash.

## Bootloader unlock
> BL unlocked. Use [TEESimulator-RS](https://github.com/Enginex0/TEESimulator-RS) to hide.
Configure `target.txt` in `/data/adb/tricky_store/` by adding the app package name (takes effect in real-time, no reboot needed).
Also recommended: [TS-Plugin](https://github.com/KOWX712/Tricky-Addon-Update-Target-List/releases/tag/v5.0-beta.1) for visual package name configuration.
> 

## Abnormal Boot Status
> BL unlocked. Use [TEESimulator-RS](https://github.com/Enginex0/TEESimulator-RS) to hide.
Configure `target.txt` in `/data/adb/tricky_store/` by adding the app package name (takes effect in real-time, no reboot needed).

## Key Tampering (128)
> Tricky Store uses "Key Chain Generation Mode" by default on OnePlus Qualcomm devices.

> Try replacing with [TEESimulator-RS](https://github.com/Enginex0/TEESimulator-RS).

## Key Tampering (q)
> Unknown.

## Key Tampering (b)
> Unknown.

## Certificate Revoked (CRL)
> Replace `keybox.xml` in `/data/adb/tricky_store/`.

## Key Tampering
> [Use TEESimulator-RS?](https://github.com/Enginex0/TEESimulator-RS)

## TrustedCert Certificate Tampering
> Unknown.

## Something wrong
> Unknown.

## Miscellaneous Check (4/5/6/7/8/9)
> Some detections related to emulator/virtual machine characteristics, device modification behavior, or third-party/ported ROMs.
> 
> False positives on international devices like Poco/Samsung (to be fixed).

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
> Use ZygiskNext's exclusion strategy > Restore mount only.
> Configure the exclusion list / enable default module unmounting to hide it.
