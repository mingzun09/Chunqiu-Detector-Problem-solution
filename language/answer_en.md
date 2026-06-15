# Chunqiu Detector Solutions (Latest Version) - English Version
> Organized by: mingzun09(SuXiaoMing) | For reference only, results vary by device/environment.
> Solutions with "?" at the end are uncertain.
> Document Link: [github](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution)

# Detections you tried but can't pass
Consider opening an issue with your module list and which Xposed modules you're using, etc. I'll reply/help when I have time.

# Miscellaneous Check(12)
> LSPosed leaking Zygisk detection point.
> Try uninstalling LSPosed / switching to ReZygisk / waiting for module updates.

# Looper fd Graph Abnomaly
> Under analysis for reproduction, to be supplemented...

# HMA Possibly Present
> Suspected detection of old Scene_Hide-eBPF module behavior (cannot detect Scene app, but detects related services).
> 
> [Branch project / Pull update to rebuild module and flash](https://github.com/Andrea-lyz/Scene-Port-Hider-by-eBPF)

# Module Modifying Chunqiu Detected
> Occurs after using the IsolPolicy module; resolve by disabling scope or uninstalling the module.

> It's not just modules — Magisk's hide features (e.g., SELinux modification hiding) can also trigger this. Try updating to the latest CI version of your root manager to resolve.

# Suspicious SELinux Policy Detected / ROOT Detected
> New SELinux feature (app zygote has access to `/sys/fs/selinux/access`).
> 
> **KSU users:** [Update KSU Manager](https://t.me/KernelSU_group/3234/482579), re-patch image, flash, reboot, then enable selinux_hide feature.
>
> **APatch/FolkPatch users:** [Load/embed this kpm](https://t.me/APatch_nightly/118)
>
> **Magisk:** ...try switching to a kernel-level manager.

# fdinfo mnt Sampling Abnomaly (c)
> Likely detects USB debugging traces, low probability false positive. Try using the [ADB Trace Cleaner](https://github.com/YiJieqwq/ADB-Trace-Cleaner/releases) script to resolve.

# Memory Abnomaly
> Clear the detector app data first. If it persists, open an issue with your module list and Xposed modules.

# Futile hide 1
> Rarely appears, cause unknown, no reliable solution yet.

# Risky Applications
> Means of detection unknown. Try using HMA-OSS to hide potentially risky apps from the detector.

# mountinfo
> Mount views obtained via two different methods are inconsistent, suggesting potential concealment. Sometimes a service doesn't process in time and triggers this (early mountinfo snapshot vs. late comparison).
> 
> Xiaomi devices often show this when opening the detector under high system load after boot.

# Dirty Device(a)
> Kernel interface detected? External sh detected?
> Detects folders/files under `/storage/emulated/0/` with "sh" in their names.
> Try restarting or reinstalling the system.
> Delete any folders/files with "sh" in their names under `/storage/emulated/0/`.

# zygote test (1)
> Enable Zygisk Next's linker function and anonymous memory function to try resolving.
> Exclusion list strategy — Restore mount only.
> Unstable detection, occasional occurrence.

# Inconsistent mount
> Parses part of the mount from `/proc/self/exe/`, then checks if file system types are consistent.
> Some devices have unfixed false positives (fixed in version 3.4).

# TEE Environment Untrusted
> [From Tencent](https://github.com/Tencent/soter)
> Similar to WeChat's fingerprint.
> Module updates to fix SoterService are unlikely. Use SUSFS to hide related service paths, and use HMA-OSS to hide the Soter system service app from the detector.
> Switch to TEESimulator/RS version to try resolving.

# Tampered Attentionkey(X)
> Carries 20+ types of abnomaly tags (mostly OEM-specific). Targets TEE's handling of abnomaly tag feedback against expected values.
> For TEE detection — if present, wait for module updates or re-lock the bootloader.
> Even efisp's fake lock or custom bootloader "may" trigger this.

> **Detail breakdown:**
> - 15: HanAttest chain inconsistency
> - 18: Vendor placeholder KeyMint tag still successfully issued a key (tee2 §1)
> - 23: Leaf certificate KeyUsage contradicts KeyPurpose in extensions
> - 24: Binder over-long alias / large transaction probe abnomaly
> - 25: Leaf certificate SigAlg does not match issuing key algorithm
> - 26: Certificate patch tag inconsistent with system properties (related to security patches; [execute this sh script](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution/blob/main/File/Tampered%20Attestation%20Key(26)Pass.sh) to try resolving)
> - 27: USER_ID appears in teeEnforced
> - 29: APPLICATION_ID present without a challenge
> - 30: Sensitive device identifier attestations not rejected (e.g., SERIAL)

# Found property
> Execute [this sh script](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution/blob/main/File/Found%20property.sh) to try resolving.

# Tricky store Hook/2
> Timing side-channel (unstable). May disappear on re-open.
> Replace with [TEESimulator](https://github.com/JingMatrix/TEESimulator) module.

# Found TrickyStore/Similar Module
> **Attempt 1:** Replace with [TEESimulator](https://github.com/JingMatrix/TEESimulator).
> 
> **Attempt 2:** Delete `/data/adb/Tricky store/security_patch.txt`.

# TEE Spoofing
> Use the TEESimulator-RS module with certificate chain generation mode to resolve.

# Property Modified (Number represents how many properties were modified)
> Principle: Checks for holes in the property area — if holes exist, properties have been modified.
> 
> To hide modified properties, add the [shamiko_Plus.sh](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution/blob/main/File/shamiko_Plus.sh) file to `/data/adb/service.d/` and reboot to try resolving.

# Environment Doubt 1 (Experimental Detection)
> In HMA-OSS, if the "Input Method" option in preset settings is checked while hiding the detector in blacklist mode, this detection may appear?

# Evil Service
> Detection related to LSPosed, Shizuku, and some Xposed module modifications.

# Found ksu/No-unlock Device
> KSU detected in jailbreak mode, or KSU processes detected.
>
> Jailbreak mode is not recommended, so no official solution is provided here.
>
> **Solution (use at your own risk):** Simply reboot once.
> For no-unlock users: flash an all-in-one hide script.
> 
> ```
> check_reset_prop() {
>   local NAME=$1
>   local EXPECTED=$2
>   local VALUE=$(resetprop $NAME)
>   [ -z $VALUE ] || [ $VALUE = $EXPECTED ] || resetprop -n $NAME $EXPECTED
> }
> 
> contains_reset_prop() {
>   local NAME=$1
>   local CONTAINS=$2
>   local NEWVAL=$3
>   [[ "$(resetprop $NAME)" = *"$CONTAINS"* ]] && resetprop -n $NAME $NEWVAL
> }
> 
> check_reset_prop "ro.boot.selinux" "enforcing"
> PID_MAX=$(cat /proc/sys/kernel/pid_max)
> last_pid=$(sh -c 'echo $PPID')
> 
> wrapped=0
> while true; do
>     : &
>     current_pid=$!
>     if [ "$current_pid" -lt "$last_pid" ]; then
>         wrapped=1
>     fi
>     if [ "$wrapped" -eq 1 ] && [ "$current_pid" -ge 1700 ]; then
>         break
>     fi
>     last_pid=$current_pid
> done
> 
> echo "Done. Restarting zygote..."
> setprop ctl.restart zygote
> ```

# SU binary detected
> SU binary detected (ROOT detected).

# Miscellaneous Check (a)
> dex2oat detected (Usually an LSP issue; replace/update the LSP module).

# Mount loophole
> Magic Mount takes effect for system modification module mounts. Use other modules (susfs/zygisk next) to hide.
> 
> Use Zygisk Next's exclusion strategy → Restore mount only. Configure the exclusion list / enable default module unmounting.

# Magic Mount
> Magic Mount detected. Try excluding certain system-modifying modules. Use Zygisk Next's exclusion strategy to hide.

# [Hook] Suspicious library injection
(zygisk/riru/xposed)
> HOOK detected. Troubleshoot the cause yourself — too many possible factors.

# SU list (Deleted)
> Detected a ROOT permission exclusion list similar to KSU's.
> Unstable, appears occasionally (more common with KSU LKM mode).

# Anormal Environment
> KSU/APatch/Magisk detected. Side-channel detection. Update your root manager and re-patch.

# Anormal Environment (04)
> New version changed to function call detection (unstable?).
> Waiting for root manager/module updates? May appear after enabling APatch's exclusion modification.

# kernelSU loop device
> KSU detected. Update your manager and re-patch / disable meta-modules.

# Suspicious Surroundings
> APatch detected. Update APatch and load a KPM hiding module (e.g., Nohello.kpm).

# Device is an Emulator
> Current device is an emulator device.

# avb verification anormal avb=2.0
> Anormal avb version. Certain modules (e.g., device model changers) can cause this.
> Uninstall model-changing modules or use Device Faker for specific apps instead of globally.

# Found LSPHook Framework
> LSPHook Framework detected. Caused by certain Xposed module modifications. Try updating LSPosed or replacing the LSP module.

# Scene Port Occupied Detected
> Check this [project](https://github.com/Andrea-lyz/Scene-Port-Hider-by-eBPF) to resolve.
> Or ignore this detection / disable Scene's accessibility access.
> Update Scene to v9.3.1+.

# Zygisk detected
> Zygisk detected — usually Magisk's built-in Zygisk (disable it) or other causes.
> Update the [Zygisk Next module](https://github.com/Dr-TSNG/ZygiskNext).

# Tampered kernel
> Kernel information checksum anormal (kernel version string, kernel build time).
> Try using SUSFS to hide it or restore the unmodified `boot.img`.

# [hook] Resetprop modified
> resetprop has been modified. Unknown cause.

# Suspicious Surroundings (a)
> Path: `/data/local/tmp`
> The `tmp` folder is set to root user and group. Change group to shell.

# Suspicious Surroundings (b)
> Path: `/data/local/tmp`
> The `tmp` folder's inode value > 10000 (has been deleted before).
> Format the system or use SUSFS to spoof inode value < 1000.
> Or try using the [Low-Inode-Swapper script](https://github.com/YiJieqwq/Low-Inode-Swapper/releases) to resolve.

# Suspicious Surroundings (c)
> `/data/local/tmp` — permissions modified (default is 771).

# Futile hide
> The following solutions may be outdated.
> The timestamp of `/data/local/tmp` has been modified.
> Format the system, or delete the `tmp` folder and reboot (this reverts to states a/b/c above), then use sukisu's Kstat config (requires kernel-integrated SUSFS) to add `/data/local/tmp` with a modified inode value (e.g., 7365). Keep `tmp` permissions at 771 and owner as shell.

# Miscellaneous Check (2)
> Device tampering / model modification detected.
> Caused by model-changing modules? Troubleshoot yourself.

# Miscellaneous Check (3)
> Device modification detection? The following solution may be outdated.
> Did you enable HMA's "Vold app data isolation"?

# Inconsistent mount / debug_ramdisk
> `umount /debug_ramdisk`

# Netlink socket anomaly
> Currently unknown.

# /data/local/tmp denied
> Access to `/data/local/tmp` denied. Possible permission issue or folder doesn't exist?
> Delete the `tmp` folder and reboot, then follow solutions for a/b/c above.

# Spoofed Kernel
> Ineffective use of SUSFS to spoof the kernel.
> Select `post-fs-data` during the kernel spoofing startup phase.

# Futile hide 04
> Principle: Mount namespace? Mount anormality detected.
> Try replacing the "meta-module" to resolve.

# Mount Gap
> Mount anormality detected. Try replacing the meta-module or updating the root manager.

# 2222
> Mount anormality detected.

# Third-party Kernel
> Kernel information matches a preset list.
> Resolve by spoofing kernel information using SUSFS.

# Third-party ROM / Self-compiled Kernel
> Third-party ROM signature detected. Kernel version suffix contains `-Dirty`.
> Resolve by spoofing kernel information using SUSFS.

# Third-party ROM (2)
> Currently unknown.

# ROM detected
> Third-party ROM detected. Some characteristics match known custom ROMs. Try spoofing.

# Suspicious Terminal Environment
> Pty detected.

# Environment Fake
> Old devices (Kernel 4.x) may have false positives? Triggered after flashing ZN-Audit Patch or similar modules.
> Uninstall the ZN-Audit Patch module.

# ROOT Process
> Zygote environment detected? Read via audit log vulnerability (avc).
> Use SUSFS features or the ZN-AuditPatch module.
> Fixed in Android security update 2025/09/01 (not entirely accurate, but that's the observation).

# Anormal Process
> Hidden process groups detected.
> Try enabling an app clone (app twin) in system settings to resolve.

# Anormal Process 0000 (pid)
> 0000 represents the process PID. Run `ps -ef | grep <pid>` as root to identify the process (often an LSPosed process).
> Alternatively, enable an app clone in system settings to resolve.
> False positives may occur.

# MT Manager (MT2 folder) / Anormal Files
> Detects the `mt2` folder in root directory, `boot.img` files, and `.xml` anormal files.
> Change the MT2 path in MT Manager settings (custom path) and delete the old folder.
> Check `/sdcard` for `.img` / `.xml` / `.sh` files.

# Risk apps 'package name'
> Risk apps detected > package name.
> Install the [Unicode Zero-Width Repair Module](https://t.me/real5ec1cff/268) to fix readability of `/storage/emulated/0/Android/data/`, then use HMA-OSS to hide risky apps.

# Thanox service detected
> Thanox service detected.
> Use [hideThanox](https://t.me/Suxiaomingpd/125) Xposed module to hide it.

# Detection Failed
> 2333333

# TEE Damaged
> Try using Tricky Store or the [TEESimulator-RS](https://github.com/Enginex0/TEESimulator-RS) module.
> Use with [TS-Plugin](https://github.com/KOWX712/Tricky-Addon-Update-Target-List/releases/tag/v5.0-beta.1).
> Reboot after flashing, then open the module's webUI to configure.
> For TEE-damaged devices, use certificate chain generation mode.

# Key Attestation Incomplete or Chain Inconsistent
> Use [TEESimulator-RS](https://github.com/Enginex0/TEESimulator-RS) and configure it to try resolving.

# AOSP Key
> Replace `keybox.xml` in `/data/adb/Tricky Store/`.
> Or flash [TS-Plugin](https://github.com/KOWX712/Tricky-Addon-Update-Target-List/releases/tag/v5.0-beta.1) and configure via webUI.

# Boot Hash Mismatch
> Boot image hash mismatch. Usually becomes `0000` after BL unlock.
> Use [Native detector](https://t.me/rootdetector/49) to get the correct hash, then use Tricky Store / [TEESimulator-RS](https://github.com/Enginex0/TEESimulator-RS) with [TS-Plugin](https://github.com/KOWX712/Tricky-Addon-Update-Target-List/releases/tag/v5.0-beta.1) to configure hash.

# Bootloader unlock
> BL unlocked. Use [TEESimulator-RS](https://github.com/Enginex0/TEESimulator-RS) to hide.
> Configure `target.txt` in `/data/adb/tricky_store/` by adding the app package name (takes effect in real-time, no reboot needed).
> Also recommended: [TS-Plugin](https://github.com/KOWX712/Tricky-Addon-Update-Target-List/releases/tag/v5.0-beta.1) for visual package name configuration.

# Anormal Boot Status
> BL unlocked. Use [TEESimulator-RS](https://github.com/Enginex0/TEESimulator-RS) to hide.
> Configure `target.txt` in `/data/adb/tricky_store/` by adding the app package name.

# Key Tampering (128)
> Tricky Store uses "Key Chain Generation Mode" by default on OnePlus Qualcomm devices.
> Try replacing with [TEESimulator-RS](https://github.com/Enginex0/TEESimulator-RS).

# Key Tampering (q)
> Unknown.

# Key Tampering (b)
> Unknown.

# Certificate Revoked (CRL)
> Replace `keybox.xml` in `/data/adb/tricky_store/`.

# Key Tampering
> [Use TEESimulator-RS?](https://github.com/Enginex0/TEESimulator-RS)

# TrustedCert Certificate Tampering
> Unknown.

# Something wrong
> Unknown.

# Miscellaneous Check (4/5/6/7/8/9)
> Detections related to emulator/virtual machine characteristics, device modification behavior, or third-party/ported ROMs.
> False positives on international devices like Poco/Samsung (to be fixed).

# Anormal Files
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

# Magic Mount
> Use Zygisk Next's exclusion strategy → Restore mount only.
> Configure the exclusion list / enable default module unmounting to hide it.
