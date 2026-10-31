# Chunqiu Detector Solutions (Tracking the Latest Version) — English

> Checked version: 4.6.2 (75) Updated: 2026-10-21
> Credits: [thanks list](/File/Doc/thanks.md) | For reference only; actual results vary by device/environment.
> Some entries have an added "**Detection method**" (compiled from community testing and behaviour observation, it may deviate from the implementation and is for locating the problem only)
> Document link: [github](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution)

---

<details><summary><b>Disclaimer</b></summary>
**1. Compliance and scope of use**
Chunqiu Detector and the environment-detection and remediation solutions provided in this document are **intended only for Android technology enthusiasts**, and are dedicated solely to **technical study, environment research and discussion**. It is **strictly forbidden** to use any solution in this document to bypass app anti-cheat, evade risk-control mechanisms, cheat in games, or for any other illegal or non-compliant scenario. Any consequences and liability arising from non-compliant use are borne solely by the user.

**2. Risk warning**
All operation flows, automation scripts and module configurations recorded in this document are for technical reference only. Operations involving modifying system images, replacing hardware keys, embedding kernel modules (KPM), executing low-level Root commands and the like all carry **extremely high, irreversible risk**, and may brick the device, cause endless reboots or lose user data. All operational risk is borne by the user personally; the document author accepts no responsibility for any device damage or data loss that may result.

3. These solutions are compiled from community testing and are affected by ROM version, kernel, root manager and module combinations; detection items may produce false positives or hit only intermittently by chance. The solutions given in this document are not guaranteed to work fully, and detection results are for debugging reference only — not an absolute basis for judgement.

4. The third-party modules, scripts and external project links cited in this document are all public community resources; the author is not responsible for the safety or reliability of third-party tools, please verify the sources yourself.

5. The "risky / blacklisted package names" and "suspicious / cheat-related files and directories" listed in Appendix A and Appendix B come from the built-in datasets of the Chunqiu Detector APP, with classification based on public community information and project release pages; they are for environment detection and anti-cheat reference only, and do not represent an absolute conclusion.

6. The device-type definitions newly added in this document (Genuinely Unlocked Device, Fake-Relocked Device, No-Unlock Device, Self-Signed Device) are the first standardised definitions compiled within the community, intended to promote uniform use of device-classification terminology; they carry no legal authority and are for technical reference only.

7. The modules in the recommendation list are the editors' subjective technical recommendations, with no commercial interest involved; for reference only.

</details>

## Help & Feedback

<details><summary><b>Detections you have tried yourself but still cannot pass</b></summary>

Please open an Issue and provide your module list information + which Xposed modules you use and other detailed modifications; I will reply/help when I have time.

</details>

<details><summary><b>General troubleshooting (when you hit "unknown / unsolved" entries)</b></summary>

1. **Record the current state**: `ls /data/adb/modules`, the Xposed module list, the Zygisk exclusion policy, spoofing properties (`getprop | grep -iE "spoof|pihooks|pixelprops|resetprop"`).
2. **Re-test with a minimal set**: keep only the root manager + the required Zygisk provider (e.g. the Zygisk provider), reboot and scan to confirm whether the hit is still there.
3. **Binary-search the cause**: then enable only one module at a time → reboot → re-scan, gradually narrowing down to the specific trigger (change only one variable each time).
4. **Mount-related entries** should be tackled first: metamodule, Zygisk exclusion policy ("restore mounts only"), SusFS / PathMask-style hiding.
5. **Key / TEE entries**: after modifying `keybox.xml`, `target.txt`, security patch sync, etc. you **must reboot** before re-testing.
6. A few entries are **side-channel / unstable detections**: repeated scans in the same environment may give inconsistent results; rule out the intermittent hits first, then locate the cause.

⚠️ **Security note**: any operation that "replaces the keybox / replaces the RKP key / fakes the relock state / changes security patch sync" will change the device's key and attestation state, and is **not necessarily reversible**; assess the risk before operating, and back up the relevant directories first if necessary.

---

</details>

## Table of Contents

- [Help & Feedback](#help--feedback)
- [Prologue](#prologue)
- [1. Properties, Build Info & Text Configuration](#1-properties-build-info--text-configuration)
- [2. Mount View & Filesystem Consistency](#2-mount-view--filesystem-consistency)
- [3. Processes, Namespaces & Permission State](#3-processes-namespaces--permission-state)
- [4. Direct Kernel-Interface Calls & Anti-Debug / Anti-Injection Behaviour](#4-direct-kernel-interface-calls--anti-debug--anti-injection-behaviour)
- [5. Binary & Memory-Mapping Integrity](#5-binary--memory-mapping-integrity)
- [6. SELinux Policy, AVC & Audit Channel](#6-selinux-policy-avc--audit-channel)
- [7. Keystore / KeyMint / TEE](#7-keystore--keymint--tee)
- [8. Package Management, App Visibility & Install Traces](#8-package-management-app-visibility--install-traces)
- [9. Timing, Page Residency & Differential Side Channels](#9-timing-page-residency--differential-side-channels)
- [10. Local Services & Terminal Form Factor](#10-local-services--terminal-form-factor)
- [Appendix: Entries Not Covered by the Criteria Above](#appendix-entries-not-covered-by-the-criteria-above)
- [Appendices](#appendices)

---

## Terminology

<details><summary><b>Terminology introduction and conventions</b></summary>

#### Genuinely Unlocked Device

The Bootloader (ABL) unlock flag has genuinely been set, and the system permits low-level images that have not passed signature verification and allows them to be flashed. This device's unlock state is faithfully reflected in the low-level system properties and in the KeyMint hardware-level credentials (Attestation).

#### Fake-Relocked Device

On a device whose ABL is genuinely unlocked, a custom payload is planted and executed early in the boot chain (earlier than the system and TEE read and finalise the boot state), rewriting the unlock state in memory and reporting it, so that the device presents itself externally as "locked & green" and can return a hardware-level "locked attestation certificate", while in reality it still loads tampered boot / init_boot images (e.g. Qualcomm Snapdragon 8e5 devices using the gbl_root_canoe project).

#### No-Unlock Device

A device that obtains Root while ABL remains genuinely locked (not unlocked), through an Android / userspace privilege-escalation vulnerability (often accompanied by SELinux being set to permissive). Such Root is usually not persistent and must be re-exploited on every boot.

#### Self-Signed Device

A device where the boot / init_boot signing key trusted by the boot chain can be obtained or reproduced by a third party; the user can use that key to sign tampered boot / init_boot / vbmeta and other images themselves and run them after passing verification while ABL remains genuinely locked. The system boot state and OEM unlock state still show "not unlocked" (typical example: Lenovo Legion Y700 gen 2 / 3 / 4, where re-signing images with the public testkey is enough to flash the root patch without unlocking).

#### Root manager

Consists of a complete set of permission-management components, including the user-facing Android interactive App, the userspace daemon service, and persistent hooks or memory patches deployed in the kernel or ramdisk, etc., used to implement control over Root permissions.

#### Metamodule

A top-level module of the module-manager type; it does not itself directly provide device spoofing, system patching and similar functions — its core duty is to manage sub-modules and provide mounting functionality. Only one metamodule can be installed on a device at a time (see the [KernelSU official documentation](https://kernelsu.org/zh_CN/guide/metamodule.html)).

#### Key module

A module that intercepts / replaces KeyMint's attestation path inside the system keystore daemon (keystore2) and uses a keybox to generate a fake proof that the device is locked; most of them also come with system-property spoofing.

#### Zygisk provider

A module that provides the Zygisk runtime, responsible for injecting code into Zygote / app processes and exposing a set of Zygisk behaviour APIs, providing a loading and running environment for the other Zygisk modules that do the actual work.

#### App-hiding module

A module that takes "package visibility" as its object of operation, intercepting the package-query chain inside the target process (or system process) and thereby, according to the user's configuration, hiding the visibility of selected apps from the target app.

</details>

## Prologue

<details><summary><b>Guide to building a minimal perfect hiding environment</b></summary>

- Genuinely Unlocked Device: **Key module + Zygisk provider + App-hiding module**
- Fake-Relocked / No-Unlock / Self-Signed Device: **Zygisk provider + App-hiding module**

For **APatch / FolkPatch** users, **[NoHello.kpm](https://t.me/welikeandroid)** needs to be loaded additionally to prevent side-channel detection; newer manager versions may have a built-in SELinux hook feature (which must be enabled manually), and users of older versions can additionally load **[SELinux_Hook.kpm](https://t.me/APatch_nightly)** (links are in "Related module recommendations" below).

</details>

<details><summary><b>Related module recommendations (in no particular order)</b></summary>

#### Key module

- [TEESimulator-RS](https://github.com/Enginex0/TEESimulator-RS): the best-known key module after TrickyStore, updated fairly frequently, does not come with a WebUI.
- [OhMyKeymint](https://github.com/qwq233/OhMyKeymint/): behaviour closer to AOSP, IO overhead may be lower than TEES-RS.
- The **version with a WebUI** is in the `Xiaomi_LeiJun` branch of [ITxiao6666/OhMyKeymint](https://github.com/ITxiao6666/OhMyKeymint).
- [Tricky-addon-Enhanced](https://github.com/Enginex0/tricky-addon-enhanced): a WebUI extension module usable with TS / TEES-RS.
- The original TrickyStore is not recommended: its last update was 2025-11-30, and some features are now seriously behind other key modules.

#### Zygisk provider

- [Zygisk-Next](https://github.com/Dr-TSNG/ZygiskNext): the most widely used standalone Zygisk provider.

#### App-hiding module

- [HMA-OSS](https://github.com/frknkrc44/HMA-OSS): Zygisk module version / Xposed module version, two versions available.

#### KernelPatch hiding module

- [NoHello.kpm](https://t.me/welikeandroid): anti-side-channel detection module for AP / FP.
- [SELinux_Hook.kpm](https://t.me/APatch_nightly): SELinux hook module for AP / FP (may already be built into newer manager versions).
- Chunqiu Detector's latest **Superkey detection currently has no countermeasure module**; this will be updated as soon as one appears.

#### Metamodule

- If your device's root manager ships a metamodule API, consider enabling it;
- [Hybrid-Mount](https://github.com/Hybrid-Mount/meta-hybrid_mount): a fairly widely used third-party metamodule.
Or you may use [NoMount](https://github.com/maxsteeel/nomount), a VFS (virtual filesystem) path-redirection framework for the Android kernel
</details>

<details><summary><b>Correct module configuration</b></summary>

#### Key module

a. Add the target app to the package-name list (e.g. `/data/adb/tricky_store/target.txt` for TS / TEES, or configure it via the WebUI);
b. Configure the security patch date correctly, or simply delete its config file (e.g. `/data/adb/tricky_store/security_patch.txt` — deleting it outright is the least hassle);
c. Configure the boot hash correctly (under normal circumstances it is set automatically).

#### Zygisk provider

Enable "use Zygisk connector" and "use anonymous memory"; "restore mounts only" may conflict with the device root manager's "kernel module unmount", just pick one of the two yourself.

#### App-hiding module

Usage is not unique; here only an explanation of terms is given (taking HMA-OSS as an example):
- **Blacklist working mode**: apps for which this mode is enabled will not be able to see the apps in the blacklist template applied to them;
- **Blacklist template**: for apps to which this template is applied, the apps in the template are invisible;
- **Whitelist working mode**: apps for which this mode is enabled will only be able to see the apps in the whitelist template applied to them;
- **Whitelist template**: for apps to which this template is applied, only the apps in the template are visible.

---

</details>





## Detection Items — Main Body

## 1. Properties, Build Info & Text Configuration

The criteria all come from text sources such as `__system_property_get` / `getprop` / `uname` / `build.prop` / `sepolicy`, and are compared for consistency against the runtime view.

<details><summary><b>Bootloader unlock / unlock properties</b></summary>

#### Detection method

Read bootloader lock-state related properties / authentication results — `ro.boot.flash.locked`, `ro.boot.verifiedbootstate`, `ro.boot.vbmeta.device_state`, etc. (`0` / `orange` / `unlocked` means unlocked).

#### Solution

- **Genuinely Unlocked Device**: use a key module to hide the unlock state from the detector, and add the detector to the package-name list as described in "Correct module configuration" (the target list takes effect in real time, no reboot needed);
- **Fake-Relocked / No-Unlock / Self-Signed Device**: the device already presents itself externally as "locked & green", so this item normally does not trigger (that state is provided by early boot-chain solutions such as efisp).

For the combined approach see `Boot state abnormal`; there is also feedback that iQoo/Vivo OriginOS 5 does not report it while OriginOS 6 does (not confirmed whether it is a false positive).

</details>

<details><summary><b>Boot state abnormal</b></summary>

#### Detection method

Read the verified boot state (e.g. `ro.boot.verifiedbootstate`) and compare it with the expected value.

#### Genuinely Unlocked Device

The Bootloader (ABL) unlock flag has genuinely been set, and the system permits low-level images that have not passed signature verification and allows them to be flashed. This device's unlock state is faithfully reflected in the low-level system properties and in the KeyMint hardware-level credentials (Attestation).
Combination attempts made in community testing: update Key module(-v307) + TS addon v5.0-beta1 → in the manager settings turn off "unmount modules (kernel level)" → set the Zygisk provider to "restore mounts only" → freeze the phone manager (on Xiaomi you can use the app-hiding / freezing approach and enable "disable environment check") → put the property-hiding script into `/data/adb/service.d/`.

</details>

<details><summary><b>AVB verification abnormal avb=2.0</b></summary>

#### Detection method  
Read vbmeta properties such as `ro.boot.vbmeta.avb_version` and compare them with the expected value.

#### Root cause  
Some modules forcibly modify vbmeta properties and cause this problem, including but not limited to:
1. **Device-model-changing modules**
2. **Play Integrity fix / bypass-type modules** (such as Integrity Box and the various PIF derivatives / all-in-one packs; to simulate a relock these modules often hard-code `avb_version=2.0` in their install or boot scripts)

#### Troubleshooting & solutions  
1. **Locate and troubleshoot the problem module**:
   - Open MT Manager and go to the `/data/adb/modules/` directory.
   - Search the file contents for: `avb_version`.
   - Examine the module files that hit (such as `system.prop`, `post-fs-data.sh`, `customize.sh`, etc.), find out which module is injecting that property, change the corresponding value, comment out the relevant setting, or simply uninstall / disable the problem module.
2. **Troubleshoot and fix the boot-time resident service script (common with modules like Integrity Box)**:
   - Check whether `hash.sh` (or another autostart script) exists in the `/data/adb/service.d/` directory.
   - Open it and look for:
     ```sh
     "$RESETPROP" ro.boot.vbmeta.avb_version "2.0"
     ```
   - Change it to:
     ```sh
     "$RESETPROP" ro.boot.vbmeta.avb_version "1.3"
     ```
   - Save and reboot the device for it to take effect. The line can also be commented out or deleted later.
3. **Temporary change from the command line (effective immediately for the current boot only)**:
   - If the environment supports `resetprop` (Magisk environment, or a terminal with the corresponding PATH configured), you can try running directly in the terminal:
     ```sh
     su -c resetprop -n ro.boot.avb_version 1.3
     ```
   - *Note: `resetprop` modifies the in-memory property directly, and it stops working after the phone reboots; moreover, terminals in a KernelSU environment usually do not have resetprop in the global PATH (it will report `resetprop: command not found`). For a persistent fix you must use methods 1 and 2 to modify the corresponding boot scripts.*

</details>

<details><summary><b>USB debugging enabled</b></summary>

#### Detection method

The native method `runFormalUsbDebuggingCheck`; no settings strings such as `adb_enabled` appear in the static artifacts, so it is presumed to relate to the SELinux rule family around `adbd` / `adbroot` / `adb_data_file` (the same origin as the SELinux rule probing), the exact criterion is yet to be confirmed.

#### Solution

Turn off USB debugging (`su -c settings put global adb_enabled 0`); this can be written into `/data/adb/service.d/` to disable it automatically at boot.

Relationship: this and `fdinfo mnt sampling abnormal (c)` both involve USB debugging, but the criteria differ — that one looks at the `mnt_id` residue in `/proc/*/fdinfo`.

---

</details>

<details><summary><b>Third-party kernel</b></summary>

#### Detection method

The kernel version information hits a preset signature list.

The kernel information matches the preset information list.

Solve it by spoofing the kernel information.
Spoof the kernel name with SUSFS.

</details>

<details><summary><b>Third-party ROM / self-compiled kernel</b></summary>

#### Detection method

The kernel version number suffix carries self-compiled signatures such as `-Dirty`.

Third-party ROM marker.

The kernel version number suffix carries `-Dirty`.

Solve it by spoofing the kernel information.
Spoof the kernel name with SUSFS.

</details>

<details><summary><b>Tampered kernel / spoofed kernel</b></summary>

#### Detection method

Read the kernel uname (version string, build time) and compare it with a preset list / baseline; the consistency judgement after the kernel information has been spoofed (by SUSFS etc.) also falls under this entry.

#### Solution

- Use kernel-level solutions such as SUSFS to hide the kernel name; when spoofing the kernel, set the boot stage to `post-fs-data`;
- You can also restore an unmodified boot.img.

The developer's own words: if this appears on a stock system in LKM mode, it is a false positive.

</details>

<details><summary><b>Kernel version spoofing detected: %1$s</b></summary>

#### Root cause
`uname(2)`, the `uname -r` subprocess, and `/proc/version` give three inconsistent release strings

Try using SUSFS to spoof the kernel version or other means

</details>

<details><summary><b>Property Modified (the number stands for how many properties were modified)</b></summary>

#### Detection method

Scan the property area for holes: the permissions / owner / size of the property files under `/dev/__properties__/` and their corresponding SELinux context, as well as whether unused holes exist in the property area (`prop_area` overlaps / holes) — the presence of holes indicates the properties have been dynamically modified.

To hide the modified properties you can use the [shamiko_Plus.sh](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution/blob/main/File/shamiko_Plus.sh) file provided in the repository, add it, move it into the `/data/adb/service.d/` directory, confirm the script has execute permission, then reboot and see whether it solves the problem.
Note: `shamiko_Plus.sh` writes properties early using `resetprop -n`, so it must be executed from `/data/adb/service.d/` and **must not be made persistent**, otherwise it may instead create new holes in the property area.

</details>

<details><summary><b>Found property</b></summary>

#### Detection method

Check whether `persist.logd.size` / `persist.logd.size.crash` / `persist.logd.size.system` / `persist.logd.size.main` are set to **a non-empty value** (non-empty means a hit; these properties configure the log buffer, and some modules / scripts write to them).

Run [this sh](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution/blob/main/File/Found%20property.sh) and see whether it solves the problem.

</details>

<details><summary><b>ROM detected</b></summary>

#### Detection method

System / device-model characteristics hit the third-party ROM list.

A third-party ROM was detected.

Some third-party ROM characteristics match.

You can try spoofing it yourself.
Spoof the kernel name with SUSFS.

</details>

<details><summary><b>ROM detected (a)</b></summary>

#### Root cause
`vendor_sepolicy.cil` / `vendor_file_contexts` contain `hal_lineage`, `hal_aospa`, `.lineage`, `.aospa`.

Commonly seen on custom / ported systems / ROMs; for developers' reference to improve only, no solution

</details>

<details><summary><b>Vold isolation enabled</b></summary>

#### Detection method

Read `persist.sys.vold_app_data_isolation_enabled` (the Vold appdata isolation of HMA / App-hiding module writes this property).

Turn off the terminal Vold app data isolation in the HMA/HMAOSS settings

If `persist.sys.vold_app_data_isolation_enabled=0` is still present after turning it off and rebooting

run in a su shell `resetprop -p --delete persist.sys.vold_app_data_isolation_enabled` and then reboot
Note (pending author confirmation): this and `Miscellaneous Check(3)` hold each other in check, see the note on that entry.

---

</details>

<details><summary><b>Miscellaneous Check (a)</b></summary>

#### Detection method

Check dex2oat-related flags (such as `dalvik.vm.dex2oat-flags`); LSP / Xposed-type modules often modify them.

dex2oat detected (usually an LSP problem — replace / update the LSP module).

</details>

<details><summary><b>Miscellaneous Check(2)</b></summary>

#### Detection method

Device / model tampering detection (commonly triggered by device-model-changing modules).

Device tampering / model tampering detected.

Caused by a device-model-changing module? Troubleshoot it yourself.

</details>

<details><summary><b>Miscellaneous Check(3)</b></summary>

#### Detection method

Model-change / isolation related detection (e.g. the effect of Vold appdata isolation).

Model-change detection?

The following solution may be outdated: have you ever enabled "Hide My Apps (HMA)" Vold appdata isolation?
Note (pending author confirmation): this item and `Vold isolation enabled` hold each other in check — enabling HMA / App-hiding module Vold appdata isolation may solve this item, but will trigger `Vold isolation enabled` (that property gets written); please choose according to whichever has higher priority.

</details>

<details><summary><b>GMS blocked</b></summary>

#### Detection method

Check the ROM-side "GMS blocked" signature files and executables — `/my_product/etc/permissions/oplus_google_cn_gms_features.xml` (OPPO / OnePlus China models; the detector will directly `access` this path), `/system/bin/gmsc`; there are also PIF-type properties `persist.sys.pihooks.disable.gms`, `persist.sys.pixelprops.gms`, `persist.sys.spoof.gms`.

#### Solution

Check whether you have used an app-hiding module to hide system components (the Google service suite), or troubleshoot the ROM-side GMS problem.

</details>

<details><summary><b>Check failed</b></summary>

#### Detection method

This detection itself did not complete successfully (environment limitation / timeout, etc.); this is **not a "hit"**; you can retry or ignore it.

</details>

<details><summary><b>LineageOS detection</b></summary>

**Detection method:**
You are running a LineageOS system; quite a lot of related property characteristics will be detected

**Solution:**
You can try using susfs (if available) to hide / spoof the detected characteristic data

</details>

<details><summary><b>[hook]Resetprop modified</b></summary>

#### Detection method

Properties have been dynamically rewritten by resetprop-type tools.

resetprop was modified.

Unknown.

</details>

<details><summary><b>Third-party ROM (2)</b></summary>

#### Detection method

Third-party ROM characteristics (second group).

Unknown for now

</details>

## 2. Mount View & Filesystem Consistency

The criterion is the mutual contradiction between `mountinfo` / `statfs` / `statx` / `fdinfo` / `getdents64`, not the appearance of some keyword.

<details><summary><b>Mount gap</b></summary>

#### Detection method

Check the continuity of the mount group ID / peer-group table: a hit if the group IDs jump (e.g. 1,2,3,6,7…) or the peer-group table is inconsistent (hidden mount points exist).

Under this judgement method, when mount group IDs increase non-continuously (e.g. 1,2,3,6,7,8...) it is judged that hidden root behaviour exists; conversely, when mount group IDs increase continuously (e.g. 1,2,3,4,5,6,7...) it is normal.

This phenomenon appears when the Magisk family switches namespaces; for the KernelSU family / APatch family it may also appear if modules with bind-mount functionality are used.

#### Solution

- **Magisk family**: using Magisk Alpha solves it, the reason is unknown.
- **Kernel family / APatch family**: try changing the "metamodule" or update the ROOT manager.

If the problem persists, check system modules with bind-mount functionality, and whether the system natively has this phenomenon.

*Note*: a few ROMs natively have this phenomenon — if that is the case, ignore this entry.
Change the metamodule (e.g. Hybrid-Mount, see "Related module recommendations" in the Prologue) / update the root manager and re-patch; if you use Scene, please update Scene.

</details>

<details><summary><b>mountinfo</b></summary>

#### Detection method

Take a mountinfo snapshot early in the process, then compare it against the runtime view; a hit if the two are inconsistent (`Mountinfo view drift`).

The mount views obtained through the two means differ. There may be a concealment problem; sometimes it is reported when some service does not handle things in time (very early mountinfo snapshot vs later comparison)
Xiaomi devices usually show this detection item when the detector is opened shortly after boot while the system is under heavy load.
A hit right after boot is mostly a snapshot-timing error: **wait 20 seconds to 5 minutes after boot before testing**.

</details>

<details><summary><b>Abnormal mount</b></summary>

#### Root cause

The path that `("/proc/self/exe")` points to contradicts the expected value in mountinfo

Troubleshoot mount-type modules, try changing the metamodule

</details>

<details><summary><b>Inconsistent mount view</b></summary>

#### Root cause
Much the same principle as the previous entry, but the appzygote verification is inconsistent

Troubleshoot mount-type modules, try changing the metamodule

</details>

<details><summary><b>Mount Detectde(1)</b></summary>

There is mount behaviour on /system

</details>

<details><summary><b>Mount Detector(2)</b></summary>

To be added

</details>

<details><summary><b>Mount Detector(3)</b></summary>

To be added

</details>

<details><summary><b>Mount Detector(4)</b></summary>

To be added

</details>

<details><summary><b>Mount Detector(5)</b></summary>

To be added

</details>

<details><summary><b>Mount Detector(6)</b></summary>

To be added

</details>

<details><summary><b>Mount Detector(7)</b></summary>

**Solution:**
A mount was detected; it is recommended to use the NoMount metamodule, or follow the detection hint and try turning off the modules that modify the system

</details>

<details><summary><b>Mount Detector(8)</b></summary>

To be added

</details>

<details><summary><b>Mount Detector(9)</b></summary>

To be added

</details>

<details><summary><b>Mount Detector(10)</b></summary>

To be added

</details>

<details><summary><b>Mount Detector(11)</b></summary>

To be added

</details>

<details><summary><b>Inconsistent mount(1)</b></summary>

To be added

</details>

<details><summary><b>Inconsistent mount(2)</b></summary>

To be added

</details>

<details><summary><b>Inconsistent mount(3)</b></summary>

To be added

</details>

<details><summary><b>Inconsistent mount(4)</b></summary>

To be added

</details>

<details><summary><b>Inconsistent mount(5)</b></summary>

To be added

</details>

<details><summary><b>Inconsistent mount(6)</b></summary>

To be added

</details>

<details><summary><b>Mount abnormal (X)</b></summary>

#### Detection method

Mount table scan (`verdict=hit: peer-group table inconsistency (hidden mount points)`, `suspicious mount entry`, overlay detection, etc.); after a hit, the specific `/dev/block/...` or module name is put into the expanded details.

Mounts of some modules / apps were detected.
**KSU · LKM**: hide the `/dev/block/xxx` path given in the entry's expanded details with PathMask, then hot-reload; **GKI + SUSFS**: write the corresponding hidden path into SUSFS; **GKI without SUSFS**: refer to the LKM approach; other managers have no solution for now.
If the word **overlay** appears in the expanded content → change the metamodule (e.g. Hybrid-Mount, see "Related module recommendations" in the Prologue); if it is confirmed that a certain module causes the mount → uninstall that module.
Relationship: this belongs to the same mount family as `/data/local/tmp metadata anomaly family` (including `2222`, `Futile hide 04`), `Mount loophole`, `Magic Mount` and `Mount gap`; the handling means are the same (Zygisk provider "restore mounts only", change the metamodule (e.g. Hybrid-Mount), PathMask/SUSFS hiding).

</details>

<details><summary><b>/data/local/tmp metadata anomaly family (Futile hide / 1 / 2 / 04 / 2222)</b></summary>

#### Detection method

All of them are anomaly judgements on the **metadata** (timestamp / inode / owner / permission) of the `/data/local/tmp` directory; inside the app they are 5 separate texts:
- `Futile hide`: the directory timestamp has been modified;
- `Futile hide 1` / `Futile hide 2` / `Futile hide 04`: different variants of the same kind of metadata anomaly;
- `2222`: a variant related to mounts / metadata.

#### Solution

`su -c rm -rf /data/local/tmp` → reboot → then fix item by item according to `Suspicious Surroundings (a)/(b)/(c)` (owner / inode / permission); for `Futile hide 1` you can also reboot first and then test.

Relationship: same family as `Suspicious Surroundings` and `/data/local/tmp denied`, the handling means are the same.

---

</details>

<details><summary><b>Inconsistent mount / inconsistent mount (debug_ramdisk)</b></summary>

#### Detection method

Compare the mount resolved from `/proc/self/exe` with the filesystem type obtained by `statfs`; a hit if the types are inconsistent. There is also a variant where the `/debug_ramdisk` mount view is inconsistent.

#### Solution

`su -c umount /debug_ramdisk`.

Note: some devices have false positives that have not yet been fixed (version 3.4 has fixed some of them).

</details>

<details><summary><b>Magic Mount</b></summary>

#### Detection method

Check for magic mount traces (module rewriting of the system's mounts).

Magic Mount detected

Please try excluding some modules that modify the system, and use some modules to hide this problem (for example the exclusion policy in the Zygisk provider).
Same as above: Zygisk provider "restore mounts only" / change the metamodule (e.g. Hybrid-Mount, see "Related module recommendations" in the Prologue).

</details>

<details><summary><b>Mount loophole</b></summary>

#### Detection method

Check whether the magic mount of system-modifying modules takes effect on the system partition.

The Magic Mount of system-modifying modules is in effect

But the mount needs other modules to hide it (you can choose SusFS / Zygisk provider)

Use the Zygisk provider's exclusion policy > restore mounts only, and configure the exclusion list / enable default module unmounting to hide it.
Use the Zygisk provider's exclusion policy "restore mounts only"; or change the metamodule (the community recommends a **metamodule**).

</details>

<details><summary><b>/data/local/tmp denied</b></summary>

#### Detection method

Check whether `/data/local/tmp` is accessible (permission / whether it exists).

Access to the directory `/data/local/tmp` is denied — a folder permission setting problem? Folder does not exist?
Same as above: delete the directory, reboot, then handle the entries that newly appear.

</details>

<details><summary><b>MT Manager (MT2 folder) / abnormal file</b></summary>

#### Detection method

Check for `/storage/emulated/0/MT2/`, boot.img, `.xml` and other files.

Abnormal file: the "mt2" folder and boot.img / ".xml" abnormal files were detected in the root directory.

The "mt2" issue can be solved by customising the MT2 path in the MT Manager settings (remember to delete the old folder).

</details>

<details><summary><b>Abnormal file</b></summary>

#### Detection method

Match high-risk file names and cheat signatures in `/dev`, `/data`, `/data/local/tmp`, `/storage/emulated/0` and other locations (the list is in Appendix B).

#### Detection paths

`/dev` and `/data/local/tmp`
1. Rename / delete the files in the relevant directories.

2. Troubleshoot and delete the following high-risk paths:
   ```text
   /data/local/stryker
   /data/system/appretention
   /data/local/tmp/luckys
   /data/local/tmp/input_devices
   /data/local/tmp/hyperceiler
   /data/local/tmp/simplehook
   /data/local/tmp/disabledallgoogleservices
   /data/local/mio
   /data/dna
   /data/local/tmp/cleaner_starter
   /data/local/tmp/byyang
   /data/local/tmp/mount_mask
   /data/local/tmp/mount_mark
   /data/local/tmp/scripttmp
   /data/local/luckys
   /data/local/tmp/horae_control.log
   /data/gpu_freq_table.conf
   /storage/emulated/0/download/advanced
   /storage/emulated/0/documents/advanced
   /data/system/noactive
   /data/system/freezer
   /storage/emulated/0/android/naki
   /data/swap_config.conf
   /data/local/tmp/resetprop
   ```
After a hit, the entry gives the **actual path that hit** directly (the community calls it "one path"); just delete it as prompted.

</details>

<details><summary><b>Suspicious Surroundings (a)</b></summary>

#### Detection method

Perform a metadata check on `/data/local/tmp`: whether the directory's group is `shell`.

The `/data/local/tmp` folder's group is abnormal.

#### Solution

Change the group to shell.
Community testing: this item judges the **owner / group anomaly** of `/data/local/tmp` (the original document's "all groups abnormal" corresponds to this); just change it back to shell: `su -c chown shell:shell /data/local/tmp`.

</details>

<details><summary><b>Suspicious Surroundings (b)</b></summary>

#### Detection method

Check whether the inode value of `/data/local/tmp` is on the high side (the threshold measured by the community is **> 10000**; the inode grows abnormally when the directory has been deleted / recreated).

#### Solution

(choose either):
1. Factory reset;

2. Use kernel-level hiding to spoof the path's inode to less than 1000;

3. Use the [Inode-Hijacker](https://github.com/YiJieqwq/Inode-Hijacker/releases) script (just download and run it; if it will not run, switch to an older release).

Note: **after using Inode-Hijacker, if wired screen mirroring (e.g. Scrcpy) becomes unavailable**, run `su -c restorecon -RF /data/local/tmp` to restore it.

</details>

<details><summary><b>Looper fd map abnormal</b></summary>

#### Detection method

Read this process's fd targets (`/proc/self/fd` + `readlink`), and compare the fd map (open files / sockets / anonymous inodes) with the expected one.

Unknown for now
This detection item may appear on some old kernels; the fix is unknown for now.

</details>

<details><summary><b>fdinfo mnt sampling abnormal (c)</b></summary>

#### Detection method

Read `mnt_id` from `/proc/*/fdinfo` and do sampling statistics, cross-verifying with the mount view; USB debugging residue or temporary mounts easily trigger it.

Most likely USB debugging traces were detected, with a small chance of a false positive. You can use the [debug trace cleaner](https://github.com/YiJieqwq/ADB-Trace-Cleaner/releases) script and see whether it solves the problem.

</details>

<details><summary><b>Suspicious Surroundings (c)</b></summary>

#### Detection method

Check whether the permission of `/data/local/tmp` is the default value (771).

The permission of `/data/local/tmp` has been modified (default 771).

#### Solution

Set the permission again.
Change the permission back to the default: `su -c chmod 771 /data/local/tmp`.

</details>

<details><summary><b>/dev/cpuset/AppOpt</b></summary>

#### Detection method

This path is the characteristic signature of a "thread / scheduler module mount" (it is in the same signature table as `/data/swap_config.conf`, `/data/encore/*_cpu_gov`, `/data/local/tmp/yshell`, etc.); it reports whenever the directory exists.

A thread / scheduler-type module mount was detected.
Uninstall the corresponding thread module.

</details>

<details><summary><b>/system/bin/fastboot and /system/bin/adb</b></summary>

#### Detection method

Perform an abnormal-existence check on system executables (`/system/bin/adb` is confirmed to be in the signature table, `fastboot` pending confirmation), commonly seen in Xiaomi modified official packages.

An abnormal executable was detected (commonly seen in Xiaomi modified official packages).
Flash back the official package; or hide these two files with PathMask.

</details>

## 3. Processes, Namespaces & Permission State

The criteria come from the `/proc/<pid>` topology, namespace links, cgroup, `getgroups`, and the process's own status.

<details><summary><b>This process's Root permission abnormal</b></summary>

To be added

</details>

<details><summary><b>Abnormal process 0000 (pid)</b></summary>

#### Detection method

Same as above (audit log leak); 0000 is that process's pid, which you can look up with `ps -ef | grep <pid>`.

0000 stands for the process's pid

You can try using a shell command to run `ps -ef | grep numeric-id` as root to find the corresponding pid process; it is usually a daemon with root permission (such as the lspd process, the Tricky-Store process)

#### Solution

This detection relies on a security vulnerability; updating the security patch to 2026/01/01 can significantly reduce the detection rate, but it cannot be fully solved for now — this vulnerability will be fully fixed after Google officially releases Android 17.

Security patch updates usually come with system updates; if you cannot update the security patch because you do not want to update the system, you can ignore this entry.

Dual-app (cloning) can sometimes make this detection method ineffective, but it does not substantively fix this security vulnerability, so dual-app should not be regarded as a viable method.

There will be false positives


#### Detection method (added from 4.6.2 testing)

The native criterion is a **process-group scan inside cgroups plus PPID clustering**: it first enumerates process membership in the cgroup, then groups the processes into parent/child sets by `PPid`; as soon as one group holds an anomalous membership (parent process, uid or cgroup level not as expected), it **emits one** `abnormal process %1$s` **per anomalous `tgid`** of that group.

A single scan can therefore produce several consecutive entries from the same group; `%1$s` comes from each `tgid`'s process name or cmdline (an empty string when neither can be read). Renaming the process alone, or hiding a single cgroup directory alone, usually does not clear the whole group; when re-testing, check that `Tgid`, `PPid` and the cgroup membership are mutually consistent.

</details>

<details><summary><b>Zygote abnormal</b></summary>

#### Detection method

Read this process's (the app's zygote child process) GID list and check whether **GID 3009 (AID_READPROC)** exists (probe output `readproc_gid_3009=present/missing`) → missing means a hit (**the cause of that GID being missing cannot yet be confirmed**).

(Community account) the supplementary GIDs of the app's own zygote are restricted.
In the HMA-OSS module, turn off `INET_GID` under "restrict zygote permissions" for Chunqiu Detector.

Addendum: that switch removes the user-ticked supplementary GIDs **by blacklist** (the options in HMA-OSS are 1015 / 1023 / 1032 / 1077 / 1078 / 1079 / 3003 / 9997, 8 items in total, **not including 3009**). The **criterion** of this entry is confirmed to be "GID 3009 missing", but **whether the cause comes from that switch cannot yet be confirmed**.

</details>

<details><summary><b>zygote test (1) / App Zygote fork order abnormal</b></summary>

#### Detection method

A fork-order probe inside app_zygote (app zygote) — open the log socket with `/dev/socket/logdw` to get identity / cookie, and judge by `prepare/parent/child`, parent-child liveness and fd close order whether residue of **Zygisk injecting earlier than app-zygote** exists; it is side-channel type and unstable.

#### Solution

Turn on the Zygisk provider's "linker feature" and "anonymous memory feature"; set the exclusion list policy to "restore mounts only"; if it is unstable, just re-test.

</details>

<details><summary><b>OBB directory abnormal</b></summary>

#### Detection method

Read the app's **own OBB path** through several read-only means and compare the results: `statx` / `newfstatat` / `openat_chain` (probes `self_obb_path_visible`, `inconsistent_read_only_views`) → a hit if the views are inconsistent (meaning some module is intercepting / hiding that path).

A module that tries to stop the detector from scanning storage is installed.
For now treat it as a **false positive**; in the App-hiding module you can turn on "restrict zygote permissions" for Chunqiu Detector (all on except `INET_GID`).

</details>

<details><summary><b>Device is an emulator</b></summary>

#### Detection method

Check emulator / virtualisation signatures, such as `/dev/goldfish_pipe`, `/dev/qemu_pipe`, `/dev/socket/genyd`, `/sys/qemu_trace`, etc., as well as model keywords such as `goldfish` / `ranchu` / `qemu` / `genymotion` / `bluestacks` / `ldplayer` / `nox` / `memu` / `ttvm` / `vbox` / `vmware`; it also references `android/os/BatteryManager` and `android/telephony/TelephonyManager`, i.e. it also takes **battery / charging state and SIM state** into account.

#### Solution

Uninstall and reinstall the detector first; avoid testing in the state of **no SIM card inserted + full battery + charging**.

</details>

<details><summary><b>Runtime environment suspicious / container / multi-instance</b></summary>

#### Detection method

Verify whether the path format of `/proc/self/cgroup` matches `^0::/uid_\d+/pid_\d+$` or `^0::/apps/uid_\d+/pid_\d+$` (both regexes are hard-coded in the code), combined with parallel / clone related probes (`parallel_ok=`, `signal_parallel_access_mismatch=`); a hit if the format is abnormal or the probes are inconsistent.

The app is detected to be in a multi-instance / sandbox / container environment.
Uninstall and reinstall Chunqiu Detector; **do not use app cloning on Chunqiu Detector**.

</details>

<details><summary><b>Environment spoofing</b></summary>

#### Detection method

The trigger surface differs under different reproduction conditions — ① it triggers after flashing an audit-log-patch-type kernel solution (see below); ② there is also feedback pointing to **property-spoofing modules** (`persist.sys.pihooks_*`, `persist.sys.pixelprops.*`, `persist.sys.spoof.gms`, etc., to be verified); a self-check clue: whether PIF / IntegrityFix / PixelProps related modules appear in this process's maps.

Old devices (4-series kernels) may get false positives?

**Known trigger surface:**
- Triggers after flashing an audit-log-patch-type kernel solution → uninstall that module;
- **Property-spoofing modules** (PIF / pihooks / pixelprops / spoof type) may also trigger it (to be verified) → use `getprop | grep -iE "pihooks|pixelprops|spoof"` to check whether property-spoofing residue exists, locate the corresponding module and deal with it, or hide the relevant properties from the detector;
- The built-in model or property spoofing of some custom / ported ROMs may also trigger it.

</details>

<details><summary><b>UID Namespace mismatch (user namespace inconsistent for the same UID)</b></summary>

#### Detection method

The user namespace view under the same UID is inconsistent (`UID namespace mismatch for same UID`).

#### Solution

Handling: check whether the hiding framework changed the namespace; change / update the metamodule and re-test.

</details>

<details><summary><b>Mount Namespace / Mount namespace anomaly</b></summary>

#### Detection method

Mount namespace view abnormal (`Mount namespace anomaly`); related to `Inconsistent mount/debug_ramdisk` and `Mount gap` but with a different criterion (here it compares the namespace view, not the mount table / statfs).

Handling: same as the mount family (Zygisk provider "restore mounts only" / change the metamodule (e.g. Hybrid-Mount) / PathMask, SUSFS hiding).

</details>

<details><summary><b>PID Namespace / PID namespace anomaly</b></summary>

#### Detection method

Process namespace view abnormal (`PID namespace anomaly`).

Handling: check the hiding framework's / metamodule's changes to the namespace, update and re-test.

</details>

## 4. Direct Kernel-Interface Calls & Anti-Debug / Anti-Injection Behaviour

The criteria come from the return values and timing of syscall, ptrace, prctl, mincore, seccomp, netlink and socket, bypassing the libc wrappers.

<details><summary><b>Debugger attached</b></summary>

To be added

</details>

<details><summary><b>Debug environment may be a No-Unlock Device</b></summary>

The three `/proc` views are inconsistent, or dumpable=1/2.

</details>

<details><summary><b>Dynamic instrumentation component found</b></summary>

Frida-type runtime components are judged to be present

</details>

<details><summary><b>Found ksu / No-Unlock Device</b></summary>

#### Detection method

KSU No-Unlock (jailbreak) mode signatures, or ksu-related processes / devices found (it appears after a hot reboot; you can try rebooting once to solve it)

#### Solution

KSU is found to be in **No-Unlock (jailbreak) mode**, or ksu-related processes were found, etc.

**No-Unlock (jailbreak) mode** is not recommended, therefore no solution is provided.


#### Detection method (added from 4.6.2 testing)

The 4.6.2 criterion is two in-process state anomalies; either one alone is a hit:

- `getppid() > 5000`: a normal app process should have a system zygote created early in boot as its parent, with a pid usually far below 5000; a too-large parent pid means the parent is not the expected zygote, typical for injection or re-parenting;
- `Seccomp: 0` in `/proc/self/status`: a normal app process should run under the seccomp filter (the field is usually `2`); `0` means filtering is off.

The item is a **local verdict**: it still reproduces in airplane mode after `pm clear`. Hiding the KSU manager with `pm hide`, binding `/data/adb` to an empty directory inside the app's mount namespace, or hiding `/proc/fs` — none of them changes this item ⇒ it reads the process's own state and its parent's, and does not depend on the package manager, the contents of `/data/adb` or the loop devices in `/proc/fs`. `KernelSU loop device` below is a separate detail.

</details>

<details><summary><b>KernelSU loop device</b></summary>

#### Detection method

Check whether a loop device mount with KernelSU signatures exists.

KSU detected

Update your manager and re-patch
Update the manager and re-patch; or turn off / change the metamodule (e.g. Hybrid-Mount, see "Related module recommendations" in the Prologue).


#### Detection method (added from 4.6.2 testing)

The criterion is **jbd2 and ext4 hitting at the same time**:

1. enumerate `/proc/fs/jbd2` and match entries shaped like `loop*-8` (ext4 journal entries on a loop device);
2. for each match, strip the `-8` suffix to get `<dev>` and confirm `/proc/fs/ext4/<dev>` also exists;
3. only when both hold is `KernelSU loop device: %1$s` printed, where `%1$s` is the device name.

Seeing `loopN` under `/proc/fs/ext4` alone is not enough for this detail; `/proc/fs/jbd2` holding only non-loop entries such as `sdc*` does not qualify either. The main process usually cannot see `/proc/fs`, so re-testing should be done in an isolated service or the zygote domain that can read that mount view.

</details>

<details><summary><b>kernelsu detected</b></summary>

**Solution:**
Update the manager to the [latest CI](https://t.me/KernelSU_group/3234/497395)

</details>

<details><summary><b>FolkPatch/APatch found</b></summary>

To be added

</details>

<details><summary><b>APKey_Hide-type hiding behaviour found</b></summary>

To be added

</details>

<details><summary><b>Suspicious Surroundings</b></summary>

#### Detection method

Environment-type anomaly check (`/data/local/tmp` metadata, suspicious processes / services, etc.).

APatch detected

Update APatch, and load a KernelPatch hiding module (e.g. NoHello.kpm, see "Related module recommendations" in the Prologue).

</details>

<details><summary><b>seccomp filtering enabled</b></summary>

Use this project and build a module to flash it to solve: https://github.com/longze777/UID-

</details>

<details><summary><b>Ordinary app NETLINK policy ineffective</b></summary>

— the untrusted_app domain sends a `NETLINK_SOCK_DIAG` dump request and receives an AF_UNIX diag reply (which the policy should have denied).

</details>

<details><summary><b>Netlink socket anomaly</b></summary>

`socket(AF_NETLINK)` fails or `send` short-writes.

</details>

<details><summary><b>Found LSPHook Framework</b></summary>

#### Detection method

Check for runtime traces of LSPosed / LSPatch-type frameworks.

LSPHook Framework detected

Caused by modifications of certain xp modules; you can also uninstall and change the LSP module.

</details>

## 5. Binary & Memory-Mapping Integrity

The criteria are the comparison of `maps` against files on disk, ELF header/segment parsing, and the ownership of JNI function-table pointers.

<details><summary><b>Malicious Hook</b></summary>

 The executable segment's in-memory CRC does not match the same segment's CRC on disk.

</details>

<details><summary><b>Critical libc inline hook</b></summary>

Incomplete memory mapping (the first 16 bytes compared against the bytes at the same offset in the libc file)

</details>

<details><summary><b>Evil Module</b></summary>

The pointer is not inside the libart.so mapping or is null

</details>

<details><summary><b>Evil Service</b></summary>

#### Detection method

— markers such as lsposed/sui/sandhook/pumpcin appear in directory names, Binder fd, `/proc/net/unix` (module residue)

Also detection of modifications by lsp, shizuku and some xp modules.

#### Detection method (added from 4.6.2 testing)

The native criteria have four layers, but **only the first one decides the verdict**:

1. **Directory-name scan**: walks `/dev/binderfs`, `/dev`, `/sys/fs/selinux`, `/proc/self/fd`, `/apex`, `/system/framework`, `/data/misc`, `/data/system`, `/data/local/tmp`, `/storage/emulated/0/` and `/data/`, lighting up the matching family as soon as a keyword is hit:

- **Sui**: `shamiko`, `Shamiko`, `内核`, `调度`, `suius`, `suidaemon`, `ssssss`, `suidaem` (detail field `Sui`)
- **SandHook**: `sandhook`, `SandHook`, `sandcore` (detail field `SandHook`)
- **Pumpcin**: `pumpcin`, `Pumpcin`, `taiwan`, `Taiwan` (detail field `Pumpcin` / `Taiwan`)
- **EDXposed**: `tricky`, `Tricky` (detail field `EDXposed`)

2. **Binder count**: `/dev/binderfs` holding more than 3 directory entries is reported as Sui, without looking at which service it is;
3. **Timing sample**: 100 rounds per name over `lsposed` / `sui` / `sandhook` / `pumpcin`, weighted (100 / 50 / 30) by whether `/dev/binderfs/<name>` exists, a name hit in `/proc/self/fd` and a line hit in `/proc/net/unix`, to produce a ratio;
4. **Aggregation**: any keyword hit from step 1 (count > 0) returns a hit; the ratio from step 3 never takes part in the verdict.

Three points worth knowing from testing:

- The ratio from step 3 is only computed, never compared against a threshold, so the `/proc/net/unix` and `fd` channels only feed the details output, not whether the item fires;
- `LSPosed:` in the details is always `NO` (nothing ever sets that bit), so an LSPosed hit actually arrives through `tricky` → `EDXposed`;
- The "more than 3 entries in `/dev/binderfs`" rule is the likeliest to false-positive: besides `binder-control`, ordinary devices carry several nodes and easily reach 4. When investigating, first check whether `Sui:` is the only `YES`, and only then suspect this rule.

Cleanup: directories/files such as `sandhook*`, `pumpcin*`, `shamiko`, `suidaemon` and `suius` under `/data/local/tmp/` are residue from a removed module; deleting them and re-scanning after a reboot usually clears the item (the criterion here is "leftover evidence", not "the service is running").

</details>

<details><summary><b>[Hook] Suspicious library injection</b></summary>

#### Detection method

Check for library-injection traces (common zygisk / riru / xposed signatures).

(zygisk/riru/xposed)

HOOK detected — troubleshoot the cause yourself, there are too many factors.

</details>

<details><summary><b>[Hook] Native Bridge detected (emulator/cross-arch)</b></summary>

— `NativeBridgeError()` of `libnativebridge.so` returns true.

</details>

<details><summary><b>Zygisk detected</b></summary>

#### Detection method

Check for Zygisk injection traces (anonymous executable mappings, process environment, module entry points, etc.).

Zygisk detected — usually caused by magisk's built-in zygisk (turn it off to solve) or other reasons.

Upgrade the Zygisk provider (http://github.com/Dr-TSNG/ZygiskNext).

</details>

<details><summary><b>Zygisk detector(2)</b></summary>

— the last 1000 bytes of `[stack]` contain the `MAGISK_INJ_1` marker

</details>

<details><summary><b>LSPosed Detected (%1$d)</b></summary>

To be added

</details>

<details><summary><b>Memory abnormal</b></summary>

#### Detection method

Page-residency / soft-dirty-type probes (`clear_refs`, `smaps`, `MADV_COLD`), used to find hidden or abnormal mappings.

If it still exists after clearing the detector's data, then please open an Issue and provide your module list information and which xp modules you use; I will look into it when I have time.

</details>

<details><summary><b>Dirty Device(a)</b></summary>

#### Detection method

Detect folders / files **whose name contains `sh`** under `/storage/emulated/0/` (`/sdcard`), as well as cheat-related files / drivers (some versions also judge it together with "key replacement behaviour").

#### Solution

The meaning of this entry is exactly "cheat-related files were detected on the device" → **just delete them yourself**; reboot and re-test after deleting.

</details>

<details><summary><b>zygote check (%1$d)</b></summary>

Under some path the ctime is earlier than the sampling clock, the tmpfs directory under `/mnt` is non-empty, and there are mountinfo id gaps (apex/art, `/data_mirror`, etc.), reported bit by bit
This item is unstable

</details>

## 6. SELinux Policy, AVC & Audit Channel

The criteria are the self-contradictions between selinuxfs query results, status page readings, avc statistics and logcat/auditd records.

<details><summary><b>Abnormal Environment(k)</b></summary>

Update your manager to the latest CI build to solve it.

</details>

<details><summary><b>Suspicious problem found while checking SELinux Policy / ROOT permission detected</b></summary>

#### Detection method

1. Use this process's context (expected to be in the `app_zygote` domain) as the "carrier", and use **sentinel contexts** (`…context_oracle_sentinel:s0` / `…_sentinel_file:s0`) to set up three control groups: positive control / negative control / file control;

2. The query goes through **raw selinuxfs writes** (operating `/sys/fs/selinux/access` directly, not via libselinux), and verifies the `avdSeqNo` filled back in by the kernel;

3. Cross-compare `selinux_check_access` / `getfilecon` with the raw results, **compare once more after adding perturbation**, and check repeatability (`Repeatability`);

4. Directly probe whether root-related rules are still accepted by the live policy (`shell -> su` transition, `magisk` / `ksu` / `apatch` domains, reading `ksu_file` / `lsposed_file` / `magisk_file`, etc.), and check the "bit-pair / split" consistency of the KSU context.

#### Common cause families

(given in the details on a hit): `enforcing is not 1`, `deny_unknown is not 1`, `unexpected version`, `sequence/policyload unexpected`, `direct syscall and libc views disagree (PLT-hook residue)`.

#### Solution

- Detection method reference: [DirtySepolicy](https://github.com/LSPosed/DirtySepolicy);
- The judgement point of this entry is "the app zygote has permission to access `/sys/fs/selinux/access`", so the root manager or the kernel side needs to hide SELinux modifications:
  - **Built-in capability of the root implementation (usable for the KernelSU family / APatch family)**: upgrade to the latest version and enable "hide SELinux modifications" (for the KSU family you need to re-patch the image or go through **No-Unlock (jailbreak)** again and reboot).
    - Supported kernel version range:
      - APatch family: 4.19 and above;
      - KernelSU family: the supported range differs between branches and must be judged case by case. Taking the original KernelSU as an example, it only supports GKI2 kernels.
  - **Kernel module solution (usable for the KernelSU family / APatch family / Magisk family)**: SELinux hook of the SELinux_Hook.kpm type (kernel module; for the selinux_magisk_access_filter link see "Related module recommendations" in the Prologue).
    - Note: two modules are currently available: the original selinux_hook (i.e. selinux_magisk_access_filter) and selinux_MAF_fork. [See here for the selinux_MAF_fork repository address](https://github.com/741afb7/selinux_maf_fork)
    - Applicable scope: the original selinux_hook (i.e. selinux_magisk_access_filter) only applies to the KernelSU family / APatch family; selinux_MAF_fork focuses on adapting to the Magisk family, but the KernelSU family / APatch family can still use it. The Magisk family must include [this code](https://github.com/topjohnwu/Magisk/commit/5a28d2fcfcd3245f726933d7fd0a6173ea484e32), otherwise this method cannot take effect.
    - Running mode: the KernelSU family and the Magisk family must embed it for it to take effect; the APatch family also works in install mode.
    - Supported kernel version range and requirements:
      - selinux_MAF_fork: 4.19 and above plus some 4.14 kernels, see the repository's README document for a more detailed introduction.
      - selinux_magisk_access_filter: theoretically supported from 4.9 and above, but running on 4.9 and 4.14 kernels may be risky.
    - Special notes:
      1. The Magisk family does not natively support KPM kernel modules, so KPM support must be installed additionally:
         - [KPatch-Next-EXP](https://github.com/741afb7/KPatch-Next-Module-EXP): does not include OTA update functionality and is not planned to be maintained long-term, but supports KPM install mode;
         - [KPM-Manager](https://github.com/Yervant7/KPM-Manager);
         - [KPatch-Next](https://github.com/KernelSU-Next/KPatch-Next-Module): has been unmaintained for quite a long time and differs considerably from the latest KernelPatch.
      2. Build-in KernelPatch cannot use this kind of module: the KPM embedding mode of a KernelPatch integrated into the kernel source differs from the original KernelPatch, so this kind of module cannot take effect in Build-in KernelPatch.
  - If your current manager is not in the KernelSU family / APatch family / Magisk family, consider switching to any one of the above three.

*The above solution was additionally compiled from [741afb7's upstream PR #45](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution/pull/45); the compatibility notes follow that contribution and are not independently verified on real devices by this site.*

Relationship: `SELinux state fingerprint suspicious`, `SELinux state channel inconsistent` and `Device obtained Root permission / abnormal module` belong to the same criteria family (different facets in different versions); **this document has merged them into this entry**.


#### Detection method (added from 4.6.2 testing)

The core is **reading and writing raw selinuxfs directly inside AppZygote** and cross-checking several groups of readings. Any of the following anomalies lands in this item:

- **Control groups / negative control**: using the current `app_zygote` context as the source, set up a positive control that must be allowed, a negative control that must be denied and a file control; a group whose result is the opposite of expectation is anomalous;
- **status page fields**: read `version`, `enforcing`, `sequence`, `policyload` etc. from `/sys/fs/selinux/status`; a value or combination that does not fit (e.g. `enforcing` not 1, or `sequence`/`policyload` jumping) is anomalous;
- **access seqno**: write queries straight to `/sys/fs/selinux/access` and validate the `avdSeqNo`/`seqno` the kernel writes back; a seqno that does not advance, an inconsistent write-back, or a repeated query changing its answer is anomalous;
- **invalid-context consistency**: issue negative queries with non-existent source/target/class/perm, which should return `EINVAL`; if an invalid context is treated as a normal one and gets an allow/deny decision, or raw selinuxfs and libselinux disagree, it is anomalous.

The criterion rests on the consistency of the readings from `access` / `status`, not on the contents of `/sys/fs/selinux/policy`; the main process usually cannot read selinuxfs, so re-testing should be done in `app_zygote` / the zygote domain.

</details>

<details><summary><b>ROOT process</b></summary>

#### Detection method

Cross-reference the AVC audit log (`auditd` records in `logcat -b events`) with `/proc/*/attr/current` to find processes running under root-related contexts.

Zygote environment detected?

Read through the audit log vulnerability (avc)

You can use kernel-level hiding features (SusFS etc.) or an audit-log-patch-type kernel solution

Fixed in the Android security update 2025/09/01 (inaccurate, but that is the result)

</details>

<details><summary><b>Process with ROOT permission</b></summary>

— `su`/`magisk`/`proc_modules` domains appear in logcat's `avc: denied`
It appears after a KSU hot reboot (reboot once more and it may be solved
Common on jailbroken devices
Jailbreak mode is not recommended, so no solution is provided

</details>

<details><summary><b>Root process disguised as a privileged app</b></summary>

Access to the app domain in `avc: denied` is abnormal

</details>

<details><summary><b>Current-app-root-domain-trace</b></summary>

#### Detection method

As `untrusted_app`, walk the PIDs in `/proc` and read `attr/current`, `cmdline`, `comm` one by one (normally all of these should be denied by SELinux), then go through the AVC denied records in `auditd` / `logcat`; if something like `tcontext=u:r:ksu:s0` appears, that is a hit (probe `proc_pid_avc_context_leak`).

As `untrusted_app`, walk the PIDs in `/proc` and try to read `attr/current`, `cmdline`, `comm` one by one (normally all of these should be denied by SELinux), then go through the AVC denied records in `auditd`/`logcat`; if something like `tcontext=u:r:ksu:s0` appears, that is a hit.
**KSU · LKM**: flash the corresponding version of PathMask and enable "isolation protection (procguard)", or flash an audit-log-patch-type kernel solution (may cause other detection items to leak);
**KSU · GKI**: turn on "AVC log spoofing" in the manager settings;
Temporary workaround: disable legacy su support, go through the detection once, then turn it back on.

</details>

<details><summary><b>Abnormal module found</b></summary>

#### Detection method

Hits the characteristic signatures of thermal / scheduler / optimisation-type modules, the most common being the **Encore Tweaks** family: the manager-side app, `/system/bin/encore_profiler`, `/data/encore/default_cpu_gov`, `/data/encore/custom_default_cpu_gov`, `/data/local/tmp/encore_logo.png`; on a hit it reports texts such as `Encore manager installed / Encore Tweaks module / Encore Tweaks possible`.

#### Solution

Troubleshoot and uninstall the relevant modules (this kind of entry mostly hits by chance, you can reboot a few more times and re-test).

</details>

<details><summary><b>A module is modifying Chunqiu</b></summary>

#### Detection method

Compare the traces of this process having been modified (policy / injection / mount) with the expected state.

It appears after using the IsolPolicy module; turn off the scope or uninstall the module to solve it.

It is not only modules — for example, an old ksu with "hide SELinux modifications" enabled also counts; please try following the latest CI of the relevant root manager to solve this problem.

</details>

## 7. Keystore / KeyMint / TEE

The criteria come from KeyGen/certificate-chain parsing, KeyMint return values and error codes, canary read-back, and LRU and SOTER behaviour.

<details><summary><b>AOSP key</b></summary>

#### Detection method

The keybox is signed with an AOSP test root (rather than a vendor / Google production root).

Replace the `keybox.xml` file in the `/data/adb/tricky_store/` directory.

You can also choose to flash the TS addon, reboot, and then open the module's webUI to configure the key.

</details>

<details><summary><b>Boot Hash mismatch</b></summary>

#### Detection method

Compare the boot / vbmeta hash (e.g. `ro.boot.vbmeta.digest`) with a baseline value.

The boot image's Hash does not match.

Normally a **Genuinely Unlocked Device**'s hash becomes 0000; use [Native detector](https://t.me/rootdetector/49) to obtain the correct hash, then use a key module and configure the hash with the TS addon to solve it.
Turn on key attestation, take the `VerifiedBootHash` value, and write it in with the TS addon.

</details>

<details><summary><b>Certificate has been revoked (CRL)</b></summary>

#### Detection method

The certificate serial number hits the revocation list (local static library or online query).

Replace the `keybox.xml` file in the `/data/adb/tricky_store/` directory

</details>

<details><summary><b>Key tampering / certificate chain tampering(x)</b></summary>

#### Detection method

- Key tampering: the key / certificate-chain property consistency check does not pass; on a hit a group is given;
- Certificate chain tampering(x): the Java layer reads the system property `ro.secureboot.lockstate` (this property is in the same table as vendor ROM properties such as `ro.lenovo.series`, `ro.lewa.version`, `ro.meizu.product.model`, `ro.miui.ui.version.name`, `ro.vivo.os.build.display.id`); if `unlocked` is read, that is a hit.

#### Groups

- **128**: the most common. Key modules tend to produce it by default on OnePlus / Qualcomm devices when using "certificate-chain generation mode";
- The cause of the other groups (such as q, b) has not been made public.

#### Solution

- Key tampering: change / update the key module, and complete the configuration as described in "Correct module configuration" (target list, security patch date, boot hash);
- Certificate chain tampering(x): `su -c '/data/adb/ksud' resetprop ro.secureboot.lockstate locked` (use `resetprop` on Magisk).

Relationship: same certificate-chain / key-consistency family as `Key attestation incomplete or chain inconsistent`.

---

</details>

<details><summary><b>TEE damaged</b></summary>

#### Detection method

The TEE-side key / certificate chain is incomplete or unavailable.

Solve it with a key module, together with the TS addon.

Please reboot after flashing, and open the module's webUI to configure it after boot.

For devices with a damaged TEE, please use certificate-chain generation mode.
Add `!` to this detector's package name in `/data/adb/tricky_store/target.txt` (meaning force processing), and you can batch-write it with a script:
```
su
TRICKY_DATA="/data/adb/tricky_store"
{ echo "com.google.android.gms!"; echo "com.android.vending!"; pm list packages -3 | sed 's/^package://;s/$/!/'; } > "$TRICKY_DATA/target.txt"
```

</details>

<details><summary><b>TEE environment untrusted</b></summary>

#### Detection method

Check whether the Tencent Soter service program exists + the state of its service properties; the two are cross-validated to determine whether the Soter key is blocked (four-quadrant judgement, see below).

From Tencent's [SoterService](https://github.com/Tencent/soter)
Purpose: WeChat fingerprint payment, etc.

By checking files to determine whether the Soter service program exists, and judging the state of its service-point property, to cross-validate whether the Soter key is blocked.
1. Service-point property state abnormal + Soter service program exists -> Soter is blocked (abnormal)

2. Service-point property state abnormal + Soter service program does not exist -> this device natively does not support the Soter service (normal)

3. Service-point property state normal + Soter service program exists -> this device supports Soter (normal)

4. Service-point property state normal + Soter service program does not exist -> impossible

#### Solution

- Use SusFS or [PathMask](https://github.com/Andrea-lyz/LKM-PathMask) to hide the related service path, and use HMA to hide the "com.tencent.soter.soterserver" system app from the detector, and see whether that solves it

*Note*: PathMask does not focus on environment hiding, please use it with caution.

*Principle*: technically we cannot currently simulate the Soter service, but we can hide the Soter-related files to fake case 2.

</details>

<details><summary><b>TEE spoofing</b></summary>

#### Detection method

The certificate chain / key properties show that TEE behaviour is being simulated.

Solve it with a key module (certificate-chain generation mode).

</details>

<details><summary><b>TEE spoofing(2)</b></summary>

#### Detection method

Create a key via Keystore2 reflection that has both `SIGN + ATTEST_KEY` purposes at once: a normal device should refuse this mixed purpose (e.g. `-3`); if the key can sign normally, but both subgroups of sub-certificate issuance — "with challenge / without challenge" — fail (e.g. `-49`), it is judged as TEE spoofing(2).

First confirm that ordinary signing and pure ATTEST_KEY key sub-certificate issuance are both normal.
Create a key via Keystore2 that has both SIGN + ATTEST_KEY purposes.
If it can sign normally, but in both the with-challenge and without-challenge test groups issuing sub-certificates returns -49, then "TEE spoofing(2)" is reported.
If the mixed purpose is normally refused at creation (like -3 on a normal device), or both capabilities work normally, it will not be reported.

#### Solution

Change / update the key module (see "Related module recommendations" and "Correct module configuration" in the Prologue), and reboot and re-test after configuring.

</details>

<details><summary><b>Tee spoofing 3</b></summary>

**Detection method:**
Using the Tricky-Store module on a device with a damaged TEE to simulate TEE behaviour was detected

**Solution:**
You can wait for a module update to fix it, or use the OhMyKeymint module alongside it, and see whether that solves it

</details>

<details><summary><b>Tee spoofing(2-c)</b></summary>

**Detection method:**
Using the TEESimulator/RS module on a device with a damaged TEE to simulate TEE behaviour was detected

**Solution:**
You can wait for a module update to fix it, or use the OhMyKeymint module alongside it, and see whether that solves it

</details>

<details><summary><b>TEESimulator found</b></summary>

AES decryption timing difference
Change to a better TEE simulation module or wait for a module update

</details>

<details><summary><b>TrickyStore Hook/2</b></summary>

#### Detection method

Compare the certificate chain / key properties returned by Keystore with the characteristics of a real device's TEE (including side-channel means, unstable).

Side channel (unstable) — reopening it may make it disappear

Change the key module (e.g. TEESimulator-RS / OhMyKeymint)

</details>

<details><summary><b>FOUND oh my keymint</b></summary>

Mixed-purpose key generated twice returns Keystore2
Solution: update the module

</details>

<details><summary><b>Tampered Attestation Key(X) (including 16 / 31)</b></summary>

#### Detection method

Perform 20+ kinds of tag-consistency checks on the key attestation certificate chain, for example: whether the leaf certificate's `KeyUsage` contradicts the extension's `KeyPurpose`, whether the leaf certificate's signature algorithm matches the signing key's algorithm, whether the security patch tag inside the certificate matches the system property, `APPLICATION_ID` present without a challenge, `USER_ID` appearing in `teeEnforced`, a vendor placeholder tag still successfully issuing, etc.; on a hit the specific tag number is given.

#### Common tag numbers

- 15: HanAttest chain inconsistent (different source from the TeeSim constants, but in the same mask)
- 16: HanAttest chain inconsistent family (mostly false positives)
- 18: vendor placeholder KeyMint tag still successfully outputs a key
- 23: leaf certificate KeyUsage contradicts the extension's KeyPurpose
- 24: Binder oversized alias / large transaction probe abnormal
- 25: leaf certificate SigAlg does not match the signing key algorithm
- 26: certificate patch tag inconsistent with the system property (see the script below)
- 27: USER_ID appears in teeEnforced
- 29: no challenge but APPLICATION_ID present
- 30: sensitive device-identifier-type attest not rejected (e.g. SERIAL)
- 31: security patch date abnormal (Chinese vendors unify on YYYY-MM-01; Lenovo / Nubia update on the 05 date; pixel / Samsung are excluded)

#### Solution

- **26**: [run this script](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution/blob/main/File/Tampered%20Attestation%20Key(26)Pass.sh) to write `/data/adb/tricky_store/security_patch.txt`;
- **Xiaomi / Redmi note**: systems updated around 2026-03 have a build time and security patch time that are inherently inconsistent — **it will report (26) whether or not you are rooted → just ignore it**; modified key modules, one-click hiding modules and some model-changing modules also cause it, so switch back to the original or uninstall them;
- **16 / 31**: mostly pure false positives (fake-relocked and even unrooted devices may hit them by chance) → re-test or simply ignore.

</details>

<details><summary><b>TrustedCert certificate tampering</b></summary>

The bytes read back from TrustedCertificateEntry do not equal the original bytes

</details>

<details><summary><b>TrickyStore / similar module found</b></summary>

#### Detection method

The certificate chain is module-generated (a synthesised chain) and does not match real TEE chain characteristics.

**Attempt 1**: change the key module (e.g. TEESimulator-RS / OhMyKeymint)

**Attempt 2**: delete the `/data/adb/tricky_store/security_patch.txt` file

</details>

<details><summary><b>Key attestation incomplete or chain inconsistent</b></summary>

#### Detection method

The key attestation certificate chain is incomplete or inconsistent with the expected chain.

Use a key module and configure it, then see whether that solves it

</details>

## 8. Package Management, App Visibility & Install Traces

The criteria come from the `pm`/PackageManager list, the `/sdcard/Android/data` directory, port visibility and fixed paths.

<details><summary><b>ROOT manager found</b></summary>

#### Detection method

The native method `runRootManagerIntentChecks` — uses Intent / package visibility (`<queries>`) to probe whether a root manager is installed or can respond (corresponding to the entries newly added to the manifest of the new version, such as `me.bmax.apatch.magica.LAUNCH`, KSU `magica.LAUNCH`, `ksu://`).

#### Solution

Just use an **App-hiding module** to hide the root manager from the detector (see "Related module recommendations" and "Correct module configuration").

Relationship: this belongs to the "ROOT traces" class together with `Found ksu / No-Unlock Device`, `Suspicious Surroundings`, `SU binary detected` and `Suspicious problem found while checking SELinux Policy / ROOT permission detected`, and they may hit at the same time.

---

</details>

<details><summary><b>Risky app / Risk apps 'package names'</b></summary>

#### Detection method

Read the directory names under `/storage/emulated/0/Android/data/` to obtain installed package names (ordinary apps usually do not have this permission); when it can be bypassed, use **Unicode zero-width characters** to get around the read restriction (not a fixed technique), then compare against the risk list (the list is in Appendix A).

#### Solution

- Effective combination: **App-hiding module blacklist mode + zero-width read fix** ([FuseFixer](https://github.com/5ec1cff/FuseFixer)); on some models, enabling the scope may cause a boot hang — just turn it off in safe mode;
- If you only want this one Chunqiu item to pass: in the App-hiding module, turn on "restrict zygote permissions" for Chunqiu Detector, with everything on except `INET_GID`;
- For entries like this where the judgement means are unknown, you can also use an App-hiding module to hide the suspicious app from the detector.


#### Detection method (added from 4.6.2 testing)

4.6.2 matches the built-in risky-package table through two channels at once:

- `pm list packages`: parses the installed package names returned by the package manager;
- `/sdcard/Android/data/<package>`: enumerates external data directory names and compares `<package>` against the risky table; directory names carrying zero-width characters (such as U+200B / U+200C / U+200D / U+FEFF) are normalised as well, so zero-width characters are no longer a way around it.

After `pm hide <package>` the package disappears from the risky list, which only proves the **package-manager channel** was affected — it does not mean the directory channel is absent; conversely, deleting `/sdcard/Android/data/<package>` only suppresses the **directory channel**, and `pm list packages` can still hit.

</details>

<details><summary><b>Hidden app list</b></summary>

 A directory name hits the risk table but `pm` does not list the corresponding package (only shown when there are no risky apps)

</details>

<details><summary><b>HMA may exist</b></summary>

#### Detection method

Check whether HMA (Hide My Applist) related services / package signatures exist while the detector itself cannot see the corresponding app.

Suspected to be detecting the behaviour of the old version using the Scene_Hide-eBPF module (the scene app cannot be detected as existing, but the related service is detected)

[Fork the project / pull updates, rebuild the module and flash it / download from Releases](https://github.com/Andrea-lyz/Scene-Port-Hider-by-eBPF)
If it is an old version / cracked version / unofficial Scene: refer to [Scene-Port-Hider-by-eBPF](https://github.com/Andrea-lyz/Scene-Port-Hider-by-eBPF); for the official Scene just update to the latest.
(Note: HMA (Hide My Applist) and Scene are two modules with different purposes; this entry and "Scene port occupancy detected" may appear at the same time — handle them separately.)

</details>

<details><summary><b>SU binary detected</b></summary>

#### Detection method

Detect su / similar binaries in common paths.

SU binary detected (ROOT detected)
iQoo/Vivo users note: `/apex/com.android.virt/bin/su` will be hit → move that file away or remove its execute bit.
General principle: **do not give Chunqiu Detector root permission**.

</details>

<details><summary><b>Mount Detector(14)</b></summary>

To be added

</details>

<details><summary><b>Hidden app list in effect 2</b></summary>

**Solution:**
Update hma/hma_oss to the latest version
[HMA update channel](https://t.me/HideMyApplist/175)
[HMA_OSS update channel](https://t.me/buggychat/121613)
Flash this module to solve it: [UIDFilter](https://t.me/Suxiaomingpd/402)
If it is the hidden app list taking effect, then please turn off "spoof install source" for Chunqiu Detector
</details>

<details><summary><b>HMA's heap-planting handling found</b></summary>

**Solution:**
[HMA update channel](https://t.me/HideMyApplist/175)
[HMA_OSS update channel](https://t.me/buggychat/121613)
</details>

## 9. Timing, Page Residency & Differential Side Channels

The criteria are the ratio of time the same operation takes on different carriers, and the change in a page's referenced/resident state, rather than a single return value.

<details><summary><b>Abnormal Environment</b></summary>

#### Detection method

(consistent with the [KSU/APatch side-channel notes](/File/Doc/ksu_kp_sidechannel_zh.md) in the repository):
- **APatch / KernelPatch**: ① **"lazily allocated page" probe** — take the address of a "lazily allocated" page (one that only occupies a virtual address and has not yet been mapped to a physical page) as the address where the superkey lives and issue an authentication request; when KernelPatch dereferences that address it will **actually map / read in** that page, and the detector then only has to check whether that page became mapped to determine whether KernelPatch exists; ② **authentication latency probe** — prepare in advance one "in-range cmd" and one "out-of-range cmd", issue authentication for each, measure repeatedly and take the sum so that the ratio is stable; a time ratio greater than about 2 means it is judged present.
  The output of this entry on screen is a **page-level kB comparison** (e.g. `No-read control: 0→0 kB, expected` / `Read control: 0→4 kB, expected` / `Target call: 0→4 kB, unexpected read`) plus multi-round consistency (`Consistency: n/n`); in essence it is judging "whether that page was actually mapped / read".
- **KernelSU**: the framework uses Kprobe to hook `newfstatat` / `faccessat`, making the two noticeably slower, while `statx` is unaffected; the total elapsed time of repeated calls is taken as a ratio, and `newfstatat : statx > 1.2` means KernelSU is judged present.
- This also explains why this kind of kernel-level hiding KPM must "refuse authentication before the cmd is judged" — by not entering the path that reads / verifies the superkey, both probes fail at the same time.
- Note: there is another entry `APatch authentication key found` that tests "whether the kernel reads an extra page of user arguments on that syscall path"; **an exclusion list has no effect on it** (the read happens before/outside the interception point), see that entry for details.

KSU/APatch detected (side-channel detection)

For the detection principle please refer to [this document](/File/Doc/ksu_kp_sidechannel_zh.md)

#### Solution

**Solution (KernelSU family)**: update your KernelSU manager and re-patch (LKM working mode) or re-integrate (GKI and Non-GKI working modes).

**Solution (APatch family)**:
1. Embed / load **NoHello.kpm** (module link in "Related module recommendations" in the Prologue), and add the detector to the exclusion list — this KPM can judge, before KernelPatch evaluates the `cmd` value, whether the app issuing the authentication request is in the exclusion list, and refuse authentication if so.

2. Future versions of APatch will introduce a signature-based authentication method, directly refusing authentication requests from apps that do not match the signature yet issued one. This is not fully implemented yet and will take some more time.

**Solution (KPatch-Next)**: update the KPatch-Next driver to 0.13.5-2.

Principle: the old KPatch-Next fully inherited KernelPatch's authentication method, so side-channel detection methods that work on APatch also work on the old KPatch-Next; but the latest KPatch-Next implements authentication by judging the uid of the userspace kpatch-android component, and is no longer detected by the side channel.
Community testing: this item is **unstable and appears probabilistically** — the same manager version may report on one device and not on another (you can try **downgrading the manager**); it also tends to appear on APatch once the exclusion list is enabled.

</details>

<details><summary><b>APatch authentication key found</b></summary>

#### Detection method

A side channel whose criterion is "**the syscall argument page is read an extra time**". The detector places the target call's arguments / buffer on a monitored user page, and measures how many pages (kB) of that page the kernel reads before and after the call:
- `No-read control`: a call in which "the kernel should not read that page per its semantics" → expected `0→0 kB`;
- `Read control`: a call in which "the kernel should read that page" → expected `0→4 kB`;
- `Target call`: the target call → if `0→4 kB, unexpected read` appears, it means the kernel **read user memory one extra time** on that syscall path, i.e. that path is additionally handled by a kernel patch (the authentication path of KernelPatch / APatch).

This entry also outputs `Argument layouts` (a probe of the register layout with which the kernel reads syscall arguments), multi-round consistency `Consistency: n/n`, `Page size` and `Probe duration` (on the order of seconds; sampling is fairly heavy).

**Relationship with `Abnormal Environment`**: both target the same class of "authentication path" side channel — the [KSU/APatch side-channel notes](/File/Doc/ksu_kp_sidechannel_zh.md) in the repository describe two measures, "whether the lazily allocated page gets mapped" and "the authentication latency ratio"; this entry is an implementation that compares by **page read volume**, a different variant of the same idea, and the two can corroborate each other.

#### Solution

Newer KernelPatch versions have already adjusted the authentication path, so the old note that "you can only wait for an upstream fix" no longer applies to all versions:

- **Update APatch**: use a new version of [APatch](https://github.com/bmax121/APatch) that already integrates this change. The key condition is that **the KernelPatch actually running already contains the new logic, and the patched image does not have a preset SuperKey**; merely installing the new manager APK does not mean the kernel patch has been updated. Update the kernel patch following the official upgrade procedure for the corresponding version, reboot, then re-test.
- **You may also consider [Aster](https://github.com/LyraVoid/Aster)**: a manager developed by FolkPatch's author Yuki (Matsuzaka Yuki) and based on APatch's capability chain. The project uses a modern Miuix interface; according to the project introduction and the author's feedback, its direction is restrained changes with stability first. Users who want to try this direction can learn about it from the repository and obtain an adapted version. Using it likewise requires confirming the running KernelPatch and the no-preset-SuperKey condition — swapping only the APK cannot be regarded as completing the fix.
- **Version reminder**: according to version feedback provided by the maintainer, FolkPatch **115032** has not yet switched to a KernelPatch containing this change, so it may still hit this item; this is not a conclusion about later FolkPatch versions.

In the new version, the first argument is read and `auth_superkey()` is executed only when `has_preset_superkey()` holds. When no SuperKey is preset, that read is skipped: trusted manager UIDs get full authorisation, already-authorised ordinary UIDs are only marked as trusted callers, and restricted operations still require further authorisation. Therefore **new logic + no preset SuperKey** can eliminate this extra page-read behaviour that this entry targets; if a SuperKey is still preset, the related read path still exists. This does not amount to deleting the SuperKey, nor does it guarantee passing other detection items.

[Source basis](https://github.com/bmax121/KernelPatch/blob/997b687f19d150642d56a5c4a49dc06143d33422/kernel/patch/common/supercall.c#L395-L434). APatch's "latest version" needs to distinguish between official Releases, CI builds and the KernelPatch built into them: you cannot conclude from the version name alone that the change is included. Before switching managers or updating the kernel patch, keep the original boot image and a usable recovery method; this note does not require blindly changing your Root solution for a single detection result.

#### Note

In the English interface this entry currently **has no corresponding English title** (it is displayed in Chinese only).

</details>

<details><summary><b>Miscellaneous Check(12)</b></summary>

#### Detection method

Use the page residency (`Referenced`) from `smaps` together with `MADV_COLD` / `clear_refs` to do a heuristic scan, probing for hidden mappings or Zygisk-type implementations; the current implementation has problems and may fail or produce false positives.

It heuristically probes the Zygisk implementation (especially the Zygisk provider) by scanning smaps, but the current implementation has problems, which makes the detection ineffective.

Please ignore this entry until the detection method is fixed or removed.

</details>

## 10. Local Services & Terminal Form Factor

The criteria are local port occupancy, system service queries and tty form factor.

<details><summary><b>Scene port occupancy detected</b></summary>

#### Detection method

Check whether the local port / service used by Scene is listening.

Please look at this [project](https://github.com/Andrea-lyz/Scene-Port-Hider-by-eBPF) and see whether it solves it.

Ignore this detection item, or turn off Scene's accessibility permission, or update Scene to 9.3.1 or above.

</details>

<details><summary><b>Thanox service detected</b></summary>

#### Detection method

Check for Thanox-related services.

Thanox service detected.

You can use this xp module to hide it: [hideThanox](https://t.me/Suxiaomingpd/125).

</details>

<details><summary><b>Terminal environment questionable</b></summary>

#### Detection method

Check whether pty (terminal emulation) traces exist.

Pty detected.

</details>

## Appendix: Entries Not Covered by the Criteria Above

<details><summary><b>Something wrong</b></summary>

#### Detection method

Internal exception / unclassified hit.

Unknown

</details>

<details><summary><b>Environment questionable 1 (experimental detection)</b></summary>

#### Detection method

Experimental environment-consistency judgement (community feedback: appears when the App-hiding module is in blacklist mode with the "input method" preset ticked).

After enabling blacklist-mode hiding for the detector in the App-hiding module, does this detection item appear if the "input method" option in the settings presets is ticked?

</details>

<details><summary><b>Invalid spoofed information(1)</b></summary>

#### Detection method

A hit when Widevine (`MediaDrm`) reports `securityLevel = L1`, `openSession()` throws `NotProvisionedException`, and `getProvisionRequest().getData()` returns data of length **0**.

Note: **when the device reports L3, this detection point is skipped directly** (the subsequent judgement only continues when `securityLevel = L1`).

#### Symptom

The device shows Widevine L1 (both DRM Info and the detector's "device info" show L1), yet this entry still judges it "inconsistent with L1". In the interface this entry **has no expandable details** (it is a summary-type entry).

**Step one: first determine whether it is a false positive**
1. Play content that **can only be decoded with L1** (HD / 1080p+ on Netflix / Disney+ / Prime, etc.):
   - If it plays normally in HD / 1080p+ ⇒ L1 itself is fine, and this entry is **very likely a false positive** (it is known to hit consistently on Xiaomi devices, including **unlocked stock devices**), so you can ignore it for now and wait for a version update;
   - If it only plays SD ⇒ continue to step 2.

2. Troubleshoot modules that "spoof the L1 state": the key module's target list, `keybox.xml`, security patch sync, and the various PIF / property-spoofing modules; turn them off one by one, **reboot** and re-test.

3. Only consider "remote RKP key (RKPConfig)" as a last resort: if the device is already on RKP (remote key provisioning) it is usually ineffective, and on Xiaomi models it is currently generally ineffective.

⚠️ **Security note**: RKPConfig-type apps make the device request RKP key provisioning from Google and will **change the device's key provisioning / attestation state**; before installing, confirm the source is trustworthy and that it is revocable.
Community testing addendum: **fake-relocked / no-unlock / completely unrooted machines also hit it by chance**, so you can ignore it directly; if you want to try, it is still advisable to first judge whether L1 is really usable using "step one" above.

</details>

<details><summary><b>Miscellaneous Check(4/5/6/7/8/9)</b></summary>

#### Detection method

A group of detections for emulators / virtual machines, model-changing behaviour, third-party and ported ROMs, etc.; some models (such as Poco / Samsung on overseas devices) produce false positives.

Some detections about emulators and virtual machines / model-changing behaviour detection / third-party & ported ROMs.

False positives on overseas Poco / Samsung devices (to be fixed).
Community feedback: overseas Poco / Samsung models have false positives; on some devices using Scene also reports it.
If it still reports after uninstalling the model-changing module, it is mostly caused by module residue / irreversible behaviour.

</details>

---

## Appendices

<details><summary><b>Appendix A: Risky / blacklisted package names (85)</b></summary>

Compiled from a summary of hits in community testing; subject to change with versions.

- `cn.android.x`
- `cn.aodlyric.xiaowine`
- `cn.geektang.privacyspace`
- `cn.kwaiching.hook`
- `cn.myflv.monitor.noactive`
- `cn.myflv.noactive`
- `com.apocalua.run`
- `com.byyoung.setting`
- `com.coderstory.toolkit`
- `com.cshlolss.vipkill`
- `com.ddm.qute`
- `com.demo.serendipity`
- `com.didjdk.adbhelper`
- `com.dna.tools`
- `com.example.ourom`
- `com.fankes.enforcehighrefreshrate`
- `com.fankes.tsbattery`
- `com.fkzhang.wechatxposed`
- `com.fuck.android.rimet`
- `com.github.tianma8023.xposed.smscode`
- `com.hchen.appretention`
- `com.hchen.switchfreeform`
- `com.houvven.impad`
- `com.kooritea.fcmfix`
- `com.lerist.fakelocation`
- `com.luckyzyx.luckytool`
- `com.modify.installer`
- `com.nnnen.plusne`
- `com.omarea.vtools`
- `com.padi.hook.hookqq`
- `com.qq.qcxm`
- `com.rifsxd.ksunext`
- `com.rkg.IAMRKG`
- `com.sevtinge.hyperceiler`
- `com.shatyuka.zhiliao`
- `com.silverlab.app.deviceidchanger.free`
- `com.sukisu.ultra`
- `com.suqi8.oshin`
- `com.syyf.quickpay`
- `com.tencent.JYNB`
- `com.tencent.jingshi`
- `com.termux`
- `com.tsng.hidemyapplist`
- `com.tsng.pzyhrx.hma`
- `com.twifucker.hachidori`
- `com.wei.vip`
- `com.wn.app.np`
- `com.xayah.databackup.foss`
- `com.yuanwofei.cardemulator.pro`
- `com.yxer.packageinstalles`
- `com.zhufucdev.motion_emulator`
- `dialog.box`
- `dknb.con`
- `dknb.coo8`
- `github.tornaco.android.thanos`
- `have.fun`
- `io.github.Retmon403.oppotheme`
- `io.github.a13e300.ksuwebui`
- `io.github.qauxv`
- `io.github.vvb2060.magisk`
- `kk.dk.anqu`
- `lin.xposed`
- `me.bingyue.IceCore`
- `me.gm.cleaner`
- `me.plusne`
- `me.simpleHook`
- `me.teble.xposed.autodaily`
- `miko.client`
- `moe.fuqiuluo.portal`
- `name.monwf.customiuizer`
- `nep.timeline.freezer`
- `nep.timeline.re_telegram`
- `one.yufz.hmspush`
- `org.lsposed.lspatch`
- `org.lsposed.lspd`
- `org.lsposed.manager`
- `ru.maximoff.apktool`
- `top.bienvenido.saas.i18n`
- `top.hookvip.pro`
- `top.sacz.timtool`
- `tornaco.apps.shortx.ext`
- `vn.kwaiching.tao`
- `xzr.hkf`
- `xzr.konabess`
- `zako.zako.zako`

</details>

<details><summary><b>Appendix B: Suspicious / cheat-related files and directories (68)</b></summary>

Only **suspicious or cheat-related** files and directories are listed (clean them up as needed).
System paths such as `/proc`, `/sys`, `/dev`, `/system` are objects the detector **reads**; **do not delete them**.

- `/data/A内核.ini`
- `/data/BingHPJY/pz.cfg`
- `/data/BingPUBG`
- `/data/Dit驱动`
- `/data/HPX`
- `/data/HPY`
- `/data/encore/custom_default_cpu_gov`
- `/data/encore/default_cpu_gov`
- `/data/gpu_freq_table.conf`
- `/data/js`
- `/data/js.sh`
- `/data/local/MIO`
- `/data/local/luckys`
- `/data/local/stryker/`
- `/data/local/tmp denied`
- `/data/local/tmp/A内核公益-和平精英0215x1`
- `/data/local/tmp/A内核公益-和平精英0215x1(1)`
- `/data/local/tmp/A内核公益-和平精英0215x1(2)`
- `/data/local/tmp/DisabledAllGoogleServices`
- `/data/local/tmp/HyperCeiler`
- `/data/local/tmp/Surfing_update`
- `/data/local/tmp/android_server`
- `/data/local/tmp/android_server64`
- `/data/local/tmp/cleaner_starter`
- `/data/local/tmp/encore_logo.png`
- `/data/local/tmp/gdbserver`
- `/data/local/tmp/horae_control.log`
- `/data/local/tmp/luckys`
- `/data/local/tmp/mount_mask`
- `/data/local/tmp/resetprop`
- `/data/local/tmp/scriptTMP`
- `/data/local/tmp/simpleHook`
- `/data/local/tmp/yshell`
- `/data/local/中野三玖`
- `/data/nh.ko`
- `/data/nh2`
- `/data/nh3`
- `/data/nh4`
- `/data/nh5`
- `/data/swap_config.conf`
- `/data/system/AppRetention`
- `/data/system/Freezer/`
- `/data/system/HPX`
- `/data/system/HPY`
- `/data/system/NoActive/`
- `/data/system/junge/`
- `/data/system/liboxmem.so`
- `/data/system/xydriver.ko`
- `/data/南瓜三角洲公益最新版本.sh`
- `/data/物资.txt`
- `/dev/Bing`
- `/my_product/etc/permissions/oplus_google_cn_gms_features.xml`
- `/sdcard/Download/com.niunaijun.blackdexa64_logcat.txt`
- `/sdcard/Download/dexdump/`
- `/sdcard/fart`
- `/storage/emulated/0/`
- `/storage/emulated/0/Android/Clash/`
- `/storage/emulated/0/Android/HChai/`
- `/storage/emulated/0/Android/Yume-Yunyun/`
- `/storage/emulated/0/Android/naki/`
- `/storage/emulated/0/Documents/advanced/`
- `/storage/emulated/0/Download/advanced/`
- `/storage/emulated/0/MT2/`
- `/storage/emulated/0/TpTestReport/screenOn/OK/0/`
- `/storage/emulated/0/rlgg/`
- `/storage/emulated/0/弱隐.sh`
- `/storage/emulated/0/落叶配置`
- `/storage/emulated/elgg/`

</details>

<details><summary><b>Appendix C: System properties checked (34)</b></summary>

- `dalvik.vm.dex2oat-flags`
- `persist.chunqiu.path_hide`
- `persist.chunqiu.path_hide=1`
- `persist.debug.dalvik.vm.core_platform_api_policy`
- `persist.logd.size`
- `persist.logd.size.crash`
- `persist.logd.size.main`
- `persist.logd.size.system`
- `persist.sys.pihooks.disable.gms`
- `persist.sys.pihooks_BRAND`
- `persist.sys.pihooks_DEVICE`
- `persist.sys.pihooks_DEVICE_INIT`
- `persist.sys.pihooks_MANUFACTURE`
- `persist.sys.pihooks_MODEL`
- `persist.sys.pihooks_PRODUCT`
- `persist.sys.pihooks_RELEASE`
- `persist.sys.pihooks_SDK_INT`
- `persist.sys.pixelprops.gapps`
- `persist.sys.pixelprops.gms`
- `persist.sys.pixelprops.google`
- `persist.sys.pixelprops.gphotos`
- `persist.sys.spoof.gms`
- `persist.sys.vold_app_data_isolation_enabled`
- `ro.boot.flash.locked`
- `ro.boot.selinux`
- `ro.boot.vbmeta.avb_version`
- `ro.boot.vbmeta.device_state`
- `ro.boot.vbmeta.digest`
- `ro.boot.verifiedbootstate`
- `ro.build.date.utc`
- `ro.build.type`
- `ro.build.version.sdk`
- `ro.product.brand`
- `ro.product.brand=`

</details>
