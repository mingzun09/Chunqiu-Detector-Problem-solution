# Chunqiu Detector Solutions (Latest Version) - English Version
> Organized by: mingzun09(SuXiaoMing) | For reference only, results vary by device/environment.
> Solutions with "?" at the end are uncertain.
> Document Link: [github](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution)

## Table of Contents
- [Help & Feedback](#help--feedback)
- [Root Permissions & SELinux Detection](#root-permissions--selinux-detection)
- [TEE & Key Attestation Detection](#tee--key-attestation-detection)
- [Mounts & Namespaces Detection](#mounts--namespaces-detection)
- [Environment, Processes & Files Detection](#environment-processes--files-detection)
- [Kernel, Properties & System Characteristics Detection](#kernel-properties--system-characteristics-detection)

---

## Help & Feedback

<details>
<summary>Detections you tried but can't pass</summary>

Open an issue with your module list and which Xposed modules you're using, etc. I'll reply/help when I have time.
</details>

---

## Root Permissions & SELinux Detection

<details>
<summary>Module Modifying Chunqiu Detected</summary>

> Occurs after using the IsolPolicy module; resolve by disabling scope or uninstalling the module.
>
> It's not just modules — Magisk's hide features (e.g., SELinux modification hiding) can also trigger this. Try updating to the latest CI version of your root manager to resolve.
</details>

<details>
<summary>Suspicious SELinux Policy Detected / ROOT Detected</summary>

> Detection method reference: https://github.com/LSPosed/DirtySepolicy
> 
> New SELinux feature detection (app zygote has access to `/sys/fs/selinux/access`).
> 
> **KSU users**: [Update KSU Manager](https://t.me/KernelSU_group/3234/482579), re-patch image, flash, reboot, then enable selinux_hide feature.
>
> **APatch/FolkPatch users**: [Load/embed this kpm](https://github.com/Admirepowered/selinux_hook)
>
> **selinux_hook module instructions**:
> 1. Kernel version 4.19-6.12 devices MUST embed this module to take effect; loading mode will not enable any spoofing methods.
>    *Note*: Due to machine instructions mismatch caused by compiler optimizations, 6.12 kernel devices should be careful when embedding this module as it has a high probability of causing a kernel panic. This will be fixed later.
> 2. Kernel version 4.14 devices are recommended to embed the module. However, due to risks in simulating context_struct_compute_av, please backup original boot.img before embedding. Loading mode also works but uses keyword filtering fallback with worse results.
> 3. Kernel version 4.9 devices are recommended to embed the module without context_struct_compute_av risks. Loading mode effect is identical to 4.14.
>
> **Magisk**: Try switching to a kernel-level manager. Magisk may merge saving clean policy blob feature in the future, which would allow Magisk to pass this detection.
</details>

<details>
<summary>Found ksu/No-unlock Device</summary>

> KSU detected in jailbreak mode, current device using KSU jailbreak mode ROOT method, or KSU processes detected, etc.
>
> Jailbreak mode is not recommended, so no solution is provided here.
</details>

<details>
<summary>SU binary detected</summary>

> SU binary detected (ROOT detected).
</details>

<details>
<summary>SU list (Deleted)</summary>

> Detected a ROOT permission exclusion list similar to KSU's.
>
> Unstable, appears occasionally (more common with KSU LKM mode).
</details>

<details>
<summary>Abnormal Environment</summary>

> Detects KSU/APatch (side-channel detection).
>
> Detection principle reference: [this document](/File/Doc/ksu_kp_sidechannel_zh.md)
>
> **Solution (KernelSU)**: Update your KernelSU Manager and re-patch (LKM work mode) or re-integrate (GKI and Non-GKI work mode).
>
> **Solution (APatch)**:
> 1. Install [nohello kpm](/File/Bin/Nohello-v1.8.2.9-83-b3e7d87-release.kpm), and add the detector to the exclusion list. Nohello can check whether the app initiating the authentication request is in the exclusion list before kernelpatch evaluates the cmd value, and if so, deny the authentication.
> 2. Future versions of APatch will introduce signature-based authentication, directly rejecting authentication requests from apps whose signatures do not match. This is not fully implemented yet and requires some waiting.
>
> **Solution (KPatch-Next)**: Update KPatch-Next driver to 0.13.5-2.
>
> Principle: Older KPatch-Next inherited KernelPatch authentication, making side-channel detection effective. The latest KPatch-Next authenticates via userland kpatch-android uid, bypassing side-channel detection.
</details>

<details>
<summary>KernelSU loop device</summary>

> KSU detected.
>
> Update your manager and re-patch.
</details>

<details>
<summary>Suspicious Surroundings</summary>

> APatch detected.
>
> Update APatch and load a KPM hiding module (e.g., Nohello.kpm).
</details>

<details>
<summary>ROOT Process</summary>

> Zygote environment detected?
>
> Read via audit log vulnerability (avc).
>
> Use SusFS features or the ZN-AuditPatch module.
>
> Fixed in Android security update 2025/09/01 (not entirely accurate, but that's the observation).
</details>

<details>
<summary>Abnormal Process 0000 (pid)</summary>

> 0000 represents the process PID.
>
> You can run `ps -ef | grep <pid>` as root to identify the process (often a root-privileged daemon, e.g., lspd, Tricky-Store process).
>
> **Solution**: This detection relies on a security vulnerability. Updating the security patch to 2026/01/01 can significantly reduce the detection rate, but it cannot be fully resolved at present. This security vulnerability will be completely fixed after Google officially releases Android 17.
>
> Security patch updates usually require system updates. If you do not wish to update your system, you can ignore this item.
>
> App cloning may temporarily bypass this check but does not resolve the underlying vulnerability.
>
> False positives may occur.
</details>

---

## TEE & Key Attestation Detection

<details>
<summary>TEE Environment Untrusted</summary>

> [SoterService from Tencent](https://github.com/Tencent/soter)
> Purpose: WeChat fingerprint payments, etc.
>
> Detection method: Checks files to determine if Soter service programs exist and cross-validates with service point attribute status to determine if Soter key is blocked.
> 1. Abnormal service point attributes + Soter program exists -> Soter is blocked (Abnormal)
> 2. Abnormal service point attributes + Soter program absent -> This device natively does not support Soter (Normal)
> 3. Normal service point attributes + Soter program exists -> Device supports Soter (Normal)
> 4. Normal service point attributes + Soter program absent -> Impossible
>
> **Solutions**:
> - Wait for module updates (fixing SoterService is unlikely).
> - Use SusFS or PathMask to hide related service paths, and use HMA-OSS to hide the Soter system service app from the detector to try resolving.
>
> *Note*: PathMask is not focused on environment hiding, use with caution.
>
> *Principle*: Currently we cannot technically simulate the Soter service, but we can hide Soter-related files to fake case #2.
</details>

<details>
<summary>Tampered Attentionkey(X)</summary>

> Carries 20+ types of anomaly tags (mostly OEM-specific). Targets TEE's handling of anomaly tag feedback against expected values.
>
> For TEE detection — if present, wait for module updates or re-lock the bootloader.
>
> Even efisp's fake lock or custom bootloader "may" trigger this.
>
> - 15: HanAttest chain inconsistency (different source from TeeSim constant below, but in the same mask)
> - 18: Vendor placeholder KeyMint tag still successfully issued a key (tee2 §1)
> - 23: Leaf certificate KeyUsage contradicts KeyPurpose in extensions
> - 24: Binder over-long alias / large transaction probe anomaly
> - 25: Leaf certificate SigAlg does not match issuing key algorithm
> - 26: Certificate patch tag inconsistent with system properties (related to security patches) ([execute this sh script](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution/blob/main/File/Tampered%20Attestation%20Key(26)Pass.sh) to try resolving)
> - 27: USER_ID appears in teeEnforced
> - 29: APPLICATION_ID present without a challenge
> - 30: Sensitive device identifier attestations not rejected (e.g., SERIAL)
</details>

<details>
<summary>TrickyStore Hook/2</summary>

> Timing side-channel (unstable). May disappear on re-open.
>
> Replace with [TEESimulator](https://github.com/JingMatrix/TEESimulator) module.
</details>

<details>
<summary>Found TrickyStore/Similar Module</summary>

> **Attempt 1**: Replace with [TEESimulator](https://github.com/JingMatrix/TEESimulator).
>
> **Attempt 2**: Delete `/data/adb/tricky_store/security_patch.txt`.
</details>

<details>
<summary>TEE Spoofing</summary>

> Use the TEESimulator(RS) module with certificate chain generation mode to resolve.
</details>

<details>
<summary>TEE Damaged</summary>

> Try using Tricky Store or the [TEESimulator-RS](https://github.com/Enginex0/TEESimulator-RS) module.
>
> Use with [TS-Plugin](https://github.com/KOWX712/Tricky-Addon-Update-Target-List/releases/tag/v5.0-beta.1).
>
> Reboot after flashing, then open the module's webUI to configure.
>
> For TEE-damaged devices, use certificate chain generation mode.
</details>

<details>
<summary>Key Attestation Incomplete or Chain Inconsistent</summary>

> Use [TEESimulator-RS](https://github.com/Enginex0/TEESimulator-RS) and configure it to try resolving.
</details>

<details>
<summary>AOSP Key</summary>

> Replace `keybox.xml` in `/data/adb/tricky_store/`.
>
> You can also flash [TS-Plugin](https://github.com/KOWX712/Tricky-Addon-Update-Target-List/releases/tag/v5.0-beta.1). Reboot and open the module's webUI to configure keys.
</details>

<details>
<summary>Boot Hash Mismatch</summary>

> Boot image hash mismatch.
>
> Usually becomes `0000` after BL unlock. Use [Native detector](https://t.me/rootdetector/49) to get the correct hash, then use Tricky Store / [TEESimulator-RS](https://github.com/Enginex0/TEESimulator-RS) with [TS-Plugin](https://github.com/KOWX712/Tricky-Addon-Update-Target-List/releases/tag/v5.0-beta.1) to configure the hash.
</details>

<details>
<summary>Bootloader unlock</summary>

> BL unlocked. Use [TEESimulator-RS](https://github.com/Enginex0/TEESimulator-RS) to hide.
>
> Configure `target.txt` in `/data/adb/tricky_store/` by adding the app package name (takes effect in real-time, no reboot needed).
>
> Also recommended: [TS-Plugin](https://github.com/KOWX712/Tricky-Addon-Update-Target-List/releases/tag/v5.0-beta.1) for visual package name configuration.
</details>

<details>
<summary>Abnormal Boot Status</summary>

> BL unlocked. Use [TEESimulator-RS](https://github.com/Enginex0/TEESimulator-RS) to hide.
>
> Configure `target.txt` in `/data/adb/tricky_store/` by adding the app package name (takes effect in real-time, no reboot needed).
</details>

<details>
<summary>Key Tampering (128)</summary>

> Tricky Store uses "Key Chain Generation Mode" by default on OnePlus Qualcomm devices.
>
> Try replacing with [TEESimulator-RS](https://github.com/Enginex0/TEESimulator-RS).
</details>

<details>
<summary>Key Tampering (q)</summary>

> Unknown.
</details>

<details>
<summary>Key Tampering (b)</summary>

> Unknown.
</details>

<details>
<summary>Certificate Revoked (CRL)</summary>

> Replace `keybox.xml` in `/data/adb/tricky_store/`.
</details>

<details>
<summary>Key Tampering</summary>

> [Use TEESimulator-RS?](https://github.com/Enginex0/TEESimulator-RS)
</details>

<details>
<summary>TrustedCert Certificate Tampering</summary>

> Unknown.
</details>

---

## Mounts & Namespaces Detection

<details>
<summary>mountinfo</summary>

> Mount views obtained via two different methods are inconsistent, suggesting potential concealment. Sometimes a service doesn't process in time and triggers this (early mountinfo snapshot vs. late comparison).
> 
> Xiaomi devices often show this when opening the detector under high system load after boot.
</details>

<details>
<summary>zygote test (1)</summary>

> Enable ZygiskNext's linker function and anonymous memory function to try resolving.
> 
> Exclusion list strategy — Restore mount only.
> 
> Unstable detection, occasional occurrence.
</details>

<details>
<summary>Inconsistent mount</summary>

> Parses part of the mount from `/proc/self/exe/`, then checks if file system types are consistent.
> 
> Some devices have unfixed false positives (fixed in version 3.4).
</details>

<details>
<summary>Mount loophole</summary>

> Magic Mount takes effect for system modification module mounts.
> 
> Mounting needs to be hidden by other modules (SusFS/ZygiskNext).
> 
> Use ZygiskNext's exclusion strategy > Restore mount only. Configure the exclusion list / enable default module unmounting to hide it.
</details>

<details>
<summary>Magic Mount</summary>

> Magic Mount detected.
> 
> Try excluding certain system-modifying modules. Use certain modules to hide this issue (e.g., ZygiskNext's exclusion strategy).
</details>

<details>
<summary>Inconsistent mount / debug_ramdisk</summary>

> `umount /debug_ramdisk`
</details>

<details>
<summary>Futile hide 04</summary>

> Principle: Mount namespace?
> 
> Mount abnormality detected.
> 
> Try replacing the "meta-module" to resolve.
</details>

<details>
<summary>Mount Gap</summary>

> Determines whether root hiding behavior exists by checking mount group IDs.
>
> In this method, when mount group IDs grow discontinuously (e.g., 1,2,3,6,7,8...), it is determined that root hiding behavior exists. Conversely, when mount group IDs grow continuously (e.g., 1,2,3,4,5,6,7...), it is normal.
> 
> This phenomenon occurs when Magisk switches namespace. For KernelSU/APatch, it may also occur if certain modules with bind mount functionality are used.
>
> **Solutions**:
> - **Magisk**: Use Magisk Alpha to resolve, principle unknown.
> - **KernelSU/APatch**: Try replacing the "meta-module" or updating the root manager.
>
> If the problem persists, check system modules with bind mount functionality, and whether the system natively exhibits this phenomenon.
> 
> *Note*: A small number of ROMs natively exhibit this phenomenon. If this is the case, please ignore this item.
</details>

<details>
<summary>2222</summary>

> Mount abnormality detected.
</details>

---

## Environment, Processes & Files Detection

<details>
<summary>Miscellaneous Check(12)</summary>

> Heuristic detection of Zygisk implementations (especially Zygisk-Next) via smaps scanning. However, the current implementation has issues that render the detection ineffective.
> 
> Please ignore this item until the detection method is fixed or removed.
</details>

<details>
<summary>Looper fd Graph Anomaly</summary>

> Under analysis for reproduction, to be supplemented...
</details>

<details>
<summary>HMA Possibly Present</summary>

> Suspected detection of old Scene_Hide-eBPF module behavior (cannot detect Scene app, but detects related services).
> 
> [Branch project / Pull update to rebuild module and flash / Download from Releases](https://github.com/Andrea-lyz/Scene-Port-Hider-by-eBPF)
</details>

<details>
<summary>fdinfo mnt Sampling Anomaly (c)</summary>

> Likely detects USB debugging traces, low probability false positive. Try using the [ADB Trace Cleaner](https://github.com/YiJieqwq/ADB-Trace-Cleaner/releases) script to resolve.
</details>

<details>
<summary>Memory Anomaly</summary>

> Clear the detector app data first. If it persists, open an issue with your module list and which Xposed modules you're using, I'll look into it when I have time.
</details>

<details>
<summary>Futile hide 1</summary>

> Rarely appears, cause unknown, no reliable solution yet.
</details>

<details>
<summary>Risky Applications</summary>

> Means of detection unknown. Try using HMA-OSS to hide potentially risky apps from the detector.
</details>

<details>
<summary>Dirty Device(a)</summary>

> Kernel interface detected? External sh detected?
> 
> Detects folders/files under `/storage/emulated/0/` with "sh" in their names.
>
> Try restarting or reinstalling the system. Delete any folders/files with "sh" in their names under `/storage/emulated/0/`.
</details>

<details>
<summary>Environment Doubt 1 (Experimental Detection)</summary>

> In HMA-OSS, if the "Input Method" option in preset settings is checked while hiding the detector in blacklist mode, this detection may appear?
</details>

<details>
<summary>Evil Service</summary>

> Detection related to LSPosed, Shizuku, and some Xposed module modifications.
</details>

<details>
<summary>Miscellaneous Check (a)</summary>

> dex2oat detected (Usually an LSP issue; replace/update the LSP module).
</details>

<details>
<summary>[Hook] Suspicious library injection</summary>

> (zygisk/riru/xposed)
>
> HOOK detected. Troubleshoot the cause yourself — too many possible factors.
</details>

<details>
<summary>Device is an Emulator</summary>

> Current device is an emulator device.
</details>

<details>
<summary>Found LSPHook Framework</summary>

> LSPHook Framework detected.
> 
> Caused by certain Xposed module modifications. You can also uninstall and replace the LSP module.
</details>

<details>
<summary>Scene Port Occupied Detected</summary>

> Check this [project](https://github.com/Andrea-lyz/Scene-Port-Hider-by-eBPF) to resolve.
> 
> Ignore this detection, or disable Scene's accessibility access, or update Scene to v9.3.1+.
</details>

<details>
<summary>Zygisk detected</summary>

> Zygisk detected — usually Magisk's built-in Zygisk (disable it) or other causes.
> 
> Update the [ZygiskNext module](http://github.com/Dr-TSNG/ZygiskNext).
</details>

<details>
<summary>Suspicious Surroundings (a)</summary>

> Path: `/data/local/tmp` folder's group is abnormal.
>
> **Solution**: Change group to shell.
</details>

<details>
<summary>Suspicious Surroundings (b)</summary>

> Path: `/data/local/tmp` folder's inode value > 10000.
>
> **Solutions**: Factory reset the device / Use SusFS to spoof inode value < 1000 / Try using the [Inode-Hijacker](https://github.com/YiJieqwq/Inode-Hijacker/releases) script to resolve.
>
> If wired display projection (e.g. Scrcpy) becomes unavailable, use `su -c restorecon -RF /data/local/tmp` to resolve.
</details>

<details>
<summary>Suspicious Surroundings (c)</summary>

> `/data/local/tmp` — permissions modified (default is 771).
>
> **Solution**: Reset permissions.
</details>

<details>
<summary>Futile hide</summary>

> The following solutions may be outdated:
> 
> The timestamp of `/data/local/tmp` has been modified.
> 
> Format the system, or delete the `tmp` folder and reboot (this reverts to states a/b/c above), then use sukisu's Kstat config (requires kernel-integrated SusFS) to add `/data/local/tmp` with a modified inode value (e.g., 7365). Keep `tmp` permissions at 771 and owner as shell.
</details>

<details>
<summary>/data/local/tmp denied</summary>

> Access to `/data/local/tmp` denied. Permission issue? Folder doesn't exist?
</details>

<details>
<summary>Suspicious Terminal Environment</summary>

> Pty detected.
</details>

<details>
<summary>MT Manager (MT2 folder) / Abnormal Files</summary>

> Abnormal files: Detects the `mt2` folder in root directory, `boot.img` files, and `.xml` abnormal files.
> 
> Change the MT2 path in MT Manager settings (custom path) and delete the old folder.
</details>

<details>
<summary>Risk apps 'package name'</summary>

> Risk apps detected > package name.
> 
> Install the [Unicode Zero-Width Repair Module](https://github.com/5ec1cff/FuseFixer) to fix readability of `/storage/emulated/0/Android/data/`, then use HMA-OSS to hide risky apps.
</details>

<details>
<summary>Thanox service detected</summary>

> Thanox service detected.
> 
> Use the [hideThanox](https://t.me/Suxiaomingpd/125) Xposed module to hide it.
</details>

<details>
<summary>Abnormal Files</summary>

> **Detection paths**: `/dev` and `/data/local/tmp`
> 1. Rename or delete relevant directory files.
> 2. Investigate and delete the following high-risk paths:
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

## Kernel, Properties & System Characteristics Detection

<details>
<summary>Found property</summary>

> Execute [this sh script](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution/blob/main/File/Found%20property.sh) to try resolving.
</details>

<details>
<summary>Property Modified (Number represents how many properties were modified)</summary>

> Principle: Checks for holes in the property area — if holes exist, properties have been modified.
> 
> To hide modified properties, add the [shamiko_Plus.sh](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution/blob/main/File/shamiko_Plus.sh) file to `/data/adb/service.d/` and reboot to try resolving.
</details>

<details>
<summary>avb verification abnormal avb=2.0</summary>

> Abnormal avb version.
> 
> Certain modules can cause this, such as device model changers. Troubleshoot yourself.
</details>

<details>
<summary>Tampered kernel</summary>

> Kernel information checksum abnormal (kernel version string, kernel build time).
> 
> Try using SusFS to hide it or restore the unmodified boot.img.
</details>

<details>
<summary>[hook] Resetprop modified</summary>

> resetprop has been modified.
> 
> Unknown cause.
</details>

<details>
<summary>Miscellaneous Check (2)</summary>

> Device tampering / model modification detected.
> 
> Caused by model-changing modules? Troubleshoot yourself.
</details>

<details>
<summary>Miscellaneous Check (3)</summary>

> Device modification detection?
> 
> The following solution may be outdated: Did you enable HMA's "Vold app data isolation"?
</details>

<details>
<summary>Netlink socket anomaly</summary>

> Currently unknown.
</details>

<details>
<summary>Spoofed Kernel</summary>

> Ineffective use of SusFS to spoof the kernel.
>
> Select `post-fs-data` during the kernel spoofing startup phase.
</details>

<details>
<summary>Third-party Kernel</summary>

> Kernel information matches a preset list.
> 
> Resolve by spoofing kernel information.
</details>

<details>
<summary>Third-party ROM / Self-compiled Kernel</summary>

> Third-party ROM flagged.
> 
> Kernel version suffix contains `-Dirty`.
>
> Resolve by spoofing kernel information.
</details>

<details>
<summary>Third-party ROM (2)</summary>

> Currently unknown.
</details>

<details>
<summary>ROM detected</summary>

> Third-party ROM detected.
>
> Some characteristics match known custom ROMs.
>
> Try spoofing.
</details>

<details>
<summary>Environment Fake</summary>

> Old devices (Kernel 4.x) may have false positives?
>
> This detection is triggered after flashing ZN-Audit Patch or similar modules.
>
> Uninstall the ZN-Audit Patch module.
</details>

<details>
<summary>Detection Failed</summary>

> 2333333
</details>

<details>
<summary>Something wrong</summary>

> Unknown.
</details>

<details>
<summary>Miscellaneous Check (4/5/6/7/8/9)</summary>

> Some detections related to emulator/virtual machine characteristics, device modification behavior, or third-party/ported ROMs.
> 
> False positives on international devices like Poco/Samsung (to be fixed).
</details>

<details>
<summary>Vold isolation enabled</summary>

> Disable "Vold app data isolation" in HMA/HMAOSS settings.
> 
> If `persist.sys.vold_app_data_isolation_enabled=0` still exists after rebooting:
>
> Execute `resetprop -p --delete persist.sys.vold_app_data_isolation_enabled` in su shell, then reboot.
</details>
