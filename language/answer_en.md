# Chunqiu Detector Solutions (Latest Version) - English Version

> Checked against version: 4.5.5(68) | Last updated: 2026-09-13
> Credits: [thanks list](/File/Doc/thanks.md) | For reference only, results vary by device/environment.
> Document Link: [github](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution)
> Some entries include a **Detection method** section (compiled from community testing and observed behaviour; it may differ from the implementation and is meant only to help locate the problem).

---

## Disclaimer

1. Chunqiu Detector is provided to Root enthusiasts as an environment-detection tool, for technical study and research discussion only. It is strictly forbidden to use this detector, or any solution in this document, to bypass anti-cheat, evade risk control, cheat in games, or for any other illegal or non-compliant purpose; all consequences of such use are borne solely by the user.

2. All operations, scripts and module configurations described here are technical references only. Modifying system images, replacing keys, embedding kernel modules, running root shell commands and similar operations carry irreversible risks and may render the device unbootable or cause data loss; all risk is borne by the user, and the document author accepts no liability for device damage or data loss.

3. These solutions are compiled from community testing and are affected by ROM version, kernel, root manager and module combinations; detection items may produce false positives or hit only intermittently. The solutions given here are not guaranteed to work, and detection results are for debugging reference only — not an absolute basis for judgement.

4. Third-party modules, scripts and external project links referenced in this document are public community resources; the author is not responsible for the safety or reliability of third-party tools — please verify their sources yourself.

5. The “risky / blacklisted package names” and “suspicious / cheat-related files and directories” listed in Appendix A and Appendix B come from the detector's built-in datasets, with classification based on public community information and project release pages; they are for environment-detection and anti-cheat reference only and do not constitute an absolute conclusion.

6. The device-type definitions added in this document (Genuinely Unlocked Device, Fake-Relocked Device, No-Unlock Device, Self-Signed Device) are the first standardised definitions in this community, intended to promote uniform terminology; they carry no legal authority and are technical references only.

7. The modules in the recommendation list are the editors' subjective technical recommendations with no commercial interest involved; for reference only.

## Help & Feedback

### Detections you tried but can't pass

Open an issue with your module list and which Xposed modules you're using, etc. I'll reply/help when I have time.

### General troubleshooting (for “unknown / unsolved” items)

1. **Record the current state**: `ls /data/adb/modules`, Xposed module list, Zygisk exclusion policy, spoofing properties (`getprop | grep -iE "spoof|pihooks|pixelprops|resetprop"`).
2. **Re-test with a minimal set**: keep only the root manager + the required Zygisk provider (e.g. ZygiskNext), reboot and scan to see whether the hit persists.
3. **Binary search**: then enable one module at a time → reboot → re-scan, until the trigger is isolated (change one variable at a time).
4. **Mount-related items**: adjust the meta-module, the Zygisk exclusion policy (“restore mounts only”), SusFS / PathMask-style hiding first.
5. **Key / TEE items**: after editing `keybox.xml`, `target.txt` or security-patch sync you **must reboot** before re-testing.
6. A few items are **side-channel / unstable**: repeated scans in the same environment can differ, so rule out flakiness before digging further.

⚠️ **Security note**: any “replace keybox / replace RKP key / fake the lock state / change security-patch sync” action changes the device's key and attestation state and **may be irreversible**; evaluate the risk and back up the relevant directories first.

---

## Table of Contents

- [Help & Feedback](#help--feedback)
- [Prologue](#prologue)
- [Root Permissions & SELinux Detection](#root-permissions--selinux-detection)
- [TEE & Key Attestation Detection](#tee--key-attestation-detection)
- [Mounts & Namespaces Detection](#mounts--namespaces-detection)
- [Environment, Processes & Files Detection](#environment-processes--files-detection)
- [Kernel, Properties & System Characteristics Detection](#kernel-properties--system-characteristics-detection)
- [Appendices](#appendices)

---

## Terminology

### Terminology & Conventions

#### Genuinely Unlocked Device

a device whose ABL unlock flag is genuinely set — unsigned images are allowed and flashable, and the unlock state is faithfully reflected in system properties and KeyMint attestation.

#### Fake-Relocked Device

on a genuinely unlocked device, a custom payload is injected and executed early in the boot chain (before the system and TEE read and latch the boot state) to rewrite the in-memory lock state and report it, so the device presents itself as “locked (locked & green)” and can return hardware-level “locked” attestation certificates — while it still actually loads patched boot / init_boot images (e.g. Qualcomm Snapdragon 8 Elite Gen 5 devices using the gbl_root_canoe project).

#### No-Unlock Device

(a.k.a. KSU jailbreak mode): the ABL stays genuinely locked (never unlocked) and root is obtained through an Android / userspace privilege-escalation vulnerability, usually with SELinux set to permissive. Such root is normally not persistent and must be re-obtained on every boot.

#### Self-Signed Device

a device whose boot chain trusts a boot / init_boot signing key that third parties can obtain or reproduce, so the user can sign patched boot / init_boot / vbmeta images themselves and boot them while the ABL stays genuinely locked; the boot state and OEM unlock state still report “unlocked = no” (typical case: Lenovo Legion Y700 2nd / 3rd / 4th gen — images re-signed with the public TestKey can be flashed with root patches without unlocking).

#### Root manager

a complete privilege-management component set — a user-facing Android app, a userspace daemon, plus persistent hooks or in-memory patches deployed in the kernel or ramdisk — used to control root access.

#### Metamodule

a top-level module-manager type module that does not itself provide device spoofing or system patching; its core job is managing sub-modules and providing mount functionality. Only one metamodule can be installed at a time (see the [KernelSU documentation](https://kernelsu.org/zh_CN/guide/metamodule.html)).

#### Key module

a module that intercepts / replaces the KeyMint attestation path inside the system keystore daemon (keystore2) and uses a keybox to produce fake “device is locked” proofs; most also spoof system properties.

#### Zygisk provider

a module that provides the Zygisk runtime — it injects code into Zygote / app processes and exposes a Zygisk behaviour API, giving other Zygisk modules a runtime environment.

#### App-hiding module

a module that operates on “package visibility” — it intercepts the package-query path inside a target process (or a system process) and hides selected apps from the configured target app.

## Prologue


### Minimal Module Set for a Perfectly Hidden Environment

- Genuinely unlocked device: **key module + Zygisk provider + app-hiding module**
- Fake-relocked / no-unlock / self-signed device: **Zygisk provider + app-hiding module**

For **APatch / FolkPatch** users, additionally load **[NoHello.kpm](https://t.me/welikeandroid)** to guard against the side-channel detection; newer managers may have a built-in SELinux hook (must be enabled manually), and users on older versions can additionally load **[SELinux_Hook.kpm](https://t.me/APatch_nightly)** (links are given in “Recommended Modules” below).

### Recommended Modules (in no particular order)

#### Key modules

- [TEESimulator-RS](https://github.com/Enginex0/TEESimulator-RS): the best-known key module after TrickyStore, actively updated, no built-in WebUI.
- [OhMyKeymint](https://github.com/qwq233/OhMyKeymint/): behaves closer to AOSP, possibly lower IO overhead than TEES-RS.
- A **WebUI-enabled build** is available at [ITxiao6666/OhMyKeymint](https://github.com/ITxiao6666/OhMyKeymint), branch `Xiaomi_LeiJun`.
- [Tricky-addon-Enhanced](https://github.com/Enginex0/tricky-addon-enhanced): a WebUI add-on module for TS / TEES-RS.
- The original TrickyStore is not recommended: its last update was 2025-11-30 and some features lag far behind other key modules.

#### Zygisk provider

- [Zygisk-Next](https://github.com/Dr-TSNG/ZygiskNext): the most widely used standalone Zygisk implementation.

#### App-hiding modules

- [HMA-OSS](https://github.com/frknkrc44/HMA-OSS): available in both Zygisk-module and Xposed-module flavours.

**KernelPatch hiding modules**
- [NoHello.kpm](https://t.me/welikeandroid): side-channel detection guard for AP / FP.
- [SELinux_Hook.kpm](https://t.me/APatch_nightly): SELinux hook module for AP / FP (may already be built into newer managers).
- The newest SuperKey detection in Chunqiu currently has **no counter-module**; this section will be updated as soon as one appears.

#### Metamodules

- If your root manager provides a metamodule API, consider enabling it;
- [Hybrid-Mount](https://github.com/Hybrid-Mount/meta-hybrid_mount): a widely used third-party metamodule.

### Correct Module Configuration

#### Key module

a. Add the target app to the package list (e.g. `/data/adb/tricky_store/target.txt` for TS / TEES, or configure it in the WebUI);
b. Set the security patch date correctly, or simply delete its config file (e.g. `/data/adb/tricky_store/security_patch.txt` — deleting it is the least trouble);
c. Set the boot hash correctly (it is normally set automatically).

#### Zygisk provider

Enable “use Zygisk connector” and “use anonymous memory”; “restore mounts only” may conflict with your root manager's “kernel unmount modules”, so pick one of the two.

#### App-hiding module

Usage varies; the following are terminology only (HMA-OSS as an example):
- **Blacklist mode**: apps with this mode enabled cannot see the apps contained in the blacklist template applied to them;
- **Blacklist template**: for an app this template is applied to, the apps inside the template become invisible;
- **Whitelist mode**: apps with this mode enabled can only see the apps contained in the whitelist template applied to them;
- **Whitelist template**: for an app this template is applied to, only the apps inside the template are visible.

---

## Detection Items

## Root Permissions & SELinux Detection

### Module Modifying Chunqiu Detected

#### Detection method

Compares modification traces inside the current process (policy / injection / mounts) against expectations.

Occurs after using the IsolPolicy module; resolve by disabling scope or uninstalling the module.

It's not just modules — Magisk's hide features (e.g., SELinux modification hiding) can also trigger this. Try updating to the latest CI version of your root manager to resolve.

### Suspicious SELinux Policy Detected / ROOT Detected

#### Detection method

1. Uses this process' own context (expected to be in the `app_zygote` domain) as a *carrier*, together with author-provisioned **sentinel contexts** (`…context_oracle_sentinel:s0` / `…_sentinel_file:s0`) to build positive / negative / file control groups;

2. Queries go through a **raw selinuxfs write** (directly on `/sys/fs/selinux/access`, not via libselinux) and validate the kernel-returned `avdSeqNo`;

3. Cross-checks the raw result against `selinux_check_access` / `getfilecon`, **re-checks after perturbation**, and validates repeatability (`Repeatability`);

4. Directly probes whether root-related rules are still accepted by the live policy (`shell -> su` transition, `magisk` / `ksu` / `apatch` domains, `ksu_file` / `lsposed_file` / `magisk_file` reads, etc.) and checks the KSU context “bit-pair / split” consistency.

**Common cause family** (shown in the details when it hits): `enforcing is not 1`, `deny_unknown is not 1`, `unexpected version`, `sequence/policyload unexpected`, `direct syscall and libc views disagree (PLT-hook residue)`.

#### Solution

- Detection method reference: [DirtySepolicy](https://github.com/LSPosed/DirtySepolicy);
- The decisive point is “the app zygote has permission to access `/sys/fs/selinux/access`”, so SELinux modifications must be hidden by the root implementation or kernel side:
  - **Built-in support (KernelSU / APatch families)**: update to the latest version and enable “hide SELinux modifications”. KernelSU users must re-patch the image or re-run the **no-unlock jailbreak**, then reboot.
    - Kernel support:
      - APatch family: 4.19 and later;
      - KernelSU family: support differs by branch and must be checked individually. Original KernelSU, for example, supports GKI2 kernels only.
  - **Kernel-module approach (KernelSU / APatch / Magisk families)**: a SELinux hook such as SELinux_Hook.kpm; see the Prologue's module recommendations for selinux_magisk_access_filter.
    - Two implementations are described here: original selinux_hook (selinux_magisk_access_filter) and [selinux_MAF_fork](https://github.com/741afb7/selinux_maf_fork).
    - Applicability: original selinux_hook is for KernelSU / APatch; selinux_MAF_fork focuses on Magisk while remaining usable with KernelSU / APatch. Magisk must include [this change](https://github.com/topjohnwu/Magisk/commit/5a28d2fcfcd3245f726933d7fd0a6173ea484e32), otherwise the approach cannot take effect.
    - Mode: KernelSU and Magisk require embedding; APatch can also use installation mode.
    - Kernel requirements:
      - selinux_MAF_fork: 4.19 and later, plus some 4.14 kernels; consult its README for details.
      - selinux_magisk_access_filter: theoretically 4.9 and later, but running it on 4.9 or 4.14 may carry risks.
    - Important limitations:
      1. Magisk has no native KPM support; additional KPM support is required:
         - [KPatch-Next-EXP](https://github.com/741afb7/KPatch-Next-Module-EXP): no OTA-update feature or planned long-term maintenance, but supports KPM installation mode;
         - [KPM-Manager](https://github.com/Yervant7/KPM-Manager);
         - [KPatch-Next](https://github.com/KernelSU-Next/KPatch-Next-Module): has not been updated for a considerable time and differs substantially from recent KernelPatch versions.
      2. Built-in KernelPatch cannot use these modules: its KPM embedding implementation differs from original KernelPatch, preventing these modules from taking effect.
  - If the current manager belongs to none of the KernelSU / APatch / Magisk families, consider switching to one of those families.

*Solution updates above are retained from [741afb7's upstream PR #45](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution/pull/45). Compatibility statements follow that contribution, not an independent device test.*

Relation: `SELinux status fingerprint suspicious`, `SELinux status channel inconsistency` and `ROOT access obtained / abnormal module` belong to the same family (different facets across versions) and **have been merged into this entry**.

### Found ksu/No-unlock Device

#### Detection method

KernelSU jailbreak (no-unlock) mode features, or a KSU-related process / device is present.

#### Solution

KSU detected in jailbreak mode, current device using KSU jailbreak mode ROOT method, or KSU processes detected, etc.

Jailbreak mode is not recommended, so no solution is provided here.

KSU detected in **no-unlock (jailbreak) mode**, or KSU-related processes found.
  > No-unlock mode is not recommended, so no solution is provided.

### SU binary detected

#### Detection method

Looks for `su` or similar binaries in common paths.

SU binary detected (ROOT detected).

iQoo / Vivo users: `/apex/com.android.virt/bin/su` gets flagged → move the file away or clear its executable bits.
General rule: **never grant root to the detector**.

### Abnormal Environment

#### Detection method

**Page-reference side channel.** (Same as the repo document [KSU/APatch side channel](/File/Doc/ksu_kp_sidechannel_zh.md).)
- **APatch / KernelPatch**: ① *lazy-page probe* — the address of a lazily-allocated page is passed as the “superkey address”; when KernelPatch dereferences it, the page becomes **actually mapped**, and the detector checks whether that happened. ② *authorisation-latency probe* — an in-range `cmd` and an out-of-range `cmd` are issued, and the total measured time ratio (>~2) reveals the extra read/verify path.
- **KernelSU**: the framework Kprobe-hooks `newfstatat` / `faccessat` (but not `statx`); summing many calls, a ratio `newfstatat : statx > 1.2` indicates KernelSU.
  In the UI this item prints **page-level kB deltas** (e.g. `No-read control: 0→0 kB, expected` / `Read control: 0→4 kB, expected` / `Target call: 0→4 kB, unexpected read`) plus a consistency count — i.e. whether the page was actually mapped/read. That is also why “reject auth *before* the cmd check” (e.g. nohello) defeats both probes.
  Note: the separate `APatch SuperKey detected` entry measures *whether the kernel read the user argument page on that syscall path*; an exclusion list **does not** help there (the read happens before/outside the hook point).

Detects KSU/APatch (side-channel detection).

Detection principle reference: [this document](/File/Doc/ksu_kp_sidechannel_zh.md)

#### Solution

**Solution (KernelSU)**: Update your KernelSU Manager and re-patch (LKM work mode) or re-integrate (GKI and Non-GKI work mode).

**Solution (APatch)**:
1. Install [nohello kpm](/File/Bin/Nohello-v1.8.2.9-83-b3e7d87-release.kpm), and add the detector to the exclusion list. Nohello can check whether the app initiating the authentication request is in the exclusion list before kernelpatch evaluates the cmd value, and if so, deny the authentication.

2. Future versions of APatch will introduce signature-based authentication, directly rejecting authentication requests from apps whose signatures do not match. This is not fully implemented yet and requires some waiting.

**Solution (KPatch-Next)**: Update KPatch-Next driver to 0.13.5-2.

Principle: Older KPatch-Next inherited KernelPatch authentication, making side-channel detection effective. The latest KPatch-Next authenticates via userland kpatch-android uid, bypassing side-channel detection.

Community measurement: this item is **unstable / probabilistic** — the same manager version can hit on one device and not on another (try **downgrading the manager**); it also appears more often after enabling APatch's exclusion list.

### APatch SuperKey detected (发现APatch 的鉴权密钥)

#### Detection method

a side channel based on “**the syscall argument page was read extra times**”. The detector places the target call's arguments/buffer on a monitored user page and measures how many kB of that page the kernel read before/after the call:
- `No-read control`: a call that should *not* read the page → expected `0→0 kB`;
- `Read control`: a call that *should* read the page → expected `0→4 kB`;
- `Target call`: if it reports `0→4 kB, unexpected read`, the kernel touched user memory on that syscall path where it should not — i.e. that path is patched (KernelPatch / the APatch authorisation path).

The item also prints `Argument layouts` (a probe of the register layout the kernel reads syscall arguments from), a consistency count (`Consistency: n/n`), `Page size` and `Probe duration` (seconds; the sampling is heavy).

**Relation to `Abnormal Environment`**: both target the same “authorisation path” side channel — [File/Doc/ksu_kp_sidechannel_zh.md](/File/Doc/ksu_kp_sidechannel_zh.md) describes the *“is the lazy page mapped?”* and *“authorisation-latency ratio”* variants, while this one compares **page-read amounts**; they are variants of the same idea and corroborate each other.

#### Solution

Newer KernelPatch code changes the authentication path; the old blanket statement that users can only wait for an upstream fix no longer applies to every version:

- **Update APatch**: use an [APatch](https://github.com/bmax121/APatch) build incorporating the change. The requirements are **a running KernelPatch containing the new logic and a patched image without a preset SuperKey**. Installing a newer manager APK alone does not update the running kernel patch. Follow that version's official kernel-patch upgrade procedure, reboot and retest.
- **Alternatively, consider [Aster](https://github.com/LyraVoid/Aster)**: an APatch-capability-chain manager developed by FolkPatch author Matsuzaka Yuki, with a modern Miuix interface. Its stated direction, as described by the project and author feedback, is restrained changes with stability as a priority. Visit the repository for details and an appropriate build. The same running-KernelPatch and no-preset-SuperKey requirements apply; replacing the APK alone is not a fix.
- **Version note**: according to version feedback supplied by the maintainer, FolkPatch **115032** has not adopted the KernelPatch update and may still trigger this item. This does not describe future FolkPatch releases.

The new code reads the first argument and calls `auth_superkey()` only when `has_preset_superkey()` is true. Without a preset SuperKey, that read is skipped: a trusted manager UID receives full authorisation, while an ordinary allowed UID is marked as a trusted caller and restricted operations still require further authorisation. Thus **the new logic plus no preset SuperKey** removes this particular extra argument-page read. Presetting a SuperKey retains that read path. This is not removal of SuperKey support and does not guarantee passing other checks.

[Source reference](https://github.com/bmax121/KernelPatch/blob/997b687f19d150642d56a5c4a49dc06143d33422/kernel/patch/common/supercall.c#L395-L434). Distinguish APatch's stable releases, CI builds and their bundled KernelPatch revisions rather than relying on the label “latest”. Before switching managers or updating the kernel patch, keep the original boot image and a working recovery path; one detection result alone is not a reason to change Root implementations blindly.

#### Note

this item currently has **no English title** in the English UI (it is shown in Chinese only).

### KernelSU loop device

#### Detection method

Checks for KernelSU-specific loop-device mounts.

KSU detected.

Update your manager and re-patch.

Update the manager and re-patch; or disable / change the metamodule.

### Suspicious Surroundings

#### Detection method

Environment sanity checks (`/data/local/tmp` metadata, suspicious processes / services).

APatch detected.

Update APatch and load a KernelPatch hiding module (e.g., NoHello.kpm — see the Prologue's “Recommended Modules”).

### ROOT Process

#### Detection method

Cross-references AVC audit logs (`auditd` records from `logcat -b events`) with `/proc/*/attr/current` to find processes running with root-related contexts.

Zygote environment detected?

Read via audit log vulnerability (avc).

Use SusFS features or the ZN-AuditPatch module.

Fixed in Android security update 2025/09/01 (not entirely accurate, but that's the observation).

Same origin as `Abnormal Process 0000 (pid)`; can hit on Lenovo / Google / niche models as false positives.

### Abnormal Process 0000 (pid)

#### Detection method

Same origin as above (audit-log leak); `0000` is the process pid — look it up with `ps -ef | grep <pid>`.

0000 represents the process PID.

You can run `ps -ef | grep <pid>` as root to identify the process (often a root-privileged daemon, e.g., lspd, Tricky-Store process).

#### Solution

This detection relies on a security vulnerability. Updating the security patch to 2026/01/01 can significantly reduce the detection rate, but it cannot be fully resolved at present. This security vulnerability will be completely fixed after Google officially releases Android 17.

Security patch updates usually require system updates. If you do not wish to update your system, you can ignore this item.

App cloning may temporarily bypass this check but does not resolve the underlying vulnerability.

False positives may occur.

### ROOT Manager Detected

#### Detection method

the native method `runRootManagerIntentChecks` probes whether a root manager is installed or responds, using intents / package visibility (`<queries>`) — matching the entries added to the new manifest (`me.bmax.apatch.magica.LAUNCH`, KSU `magica.LAUNCH`, `ksu://`, etc.).

#### Solution

use an **app-hiding module** to hide the root manager from the detector (see “Recommended Modules” and “Correct Module Configuration”).

Relation: the same “root traces” family as `Found ksu/No-unlock Device`, `Suspicious Surroundings`, `SU binary detected` and `Suspicious SELinux Policy Detected / ROOT Detected`; they can hit at the same time.

### Zygote Anomaly

#### Detection method

reads the GID list of this process (the app zygote child) and checks whether **GID 3009 (AID_READPROC)** is present (probe output `readproc_gid_3009=present/missing`) → a missing GID hits (**the cause of the missing GID is not yet confirmed**).

#### Solution

in the app-hiding module, disable the restriction on `INET_GID` / zygote permissions for the detector.

Note: that switch removes, as a **blacklist**, the extra GIDs the user ticks (the selectable set in HMA-OSS is 1015 / 1023 / 1032 / 1077 / 1078 / 1079 / 3003 / 9997 — **eight entries, not including 3009**). The **criterion** of this item is confirmed to be “GID 3009 missing”, but **whether this switch is the cause cannot be confirmed yet**.

### Current-app-root-domain-trace

#### Detection method

traverses every PID under `/proc` as `untrusted_app`, reading `attr/current`, `cmdline` and `comm` (normally all denied by SELinux), then searches `auditd` / `logcat` for AVC denied records; finding something like `tcontext=u:r:ksu:s0` hits (probe `proc_pid_avc_context_leak`).

#### Solution

KSU · LKM — flash a matching PathMask and enable “isolation guard (procguard)”, or use an audit-log patching kernel-side approach (may leak other items); KSU · GKI — enable “AVC log spoofing” in the manager; temporary workaround: disable legacy su support, run the check once, then re-enable it.

---

## TEE & Key Attestation Detection

### TEE Environment Untrusted

#### Detection method

checks whether the Tencent Soter service program exists and what its service property state is; the two are cross-validated to decide whether a Soter key is blocked (four quadrants):
1. service property abnormal + Soter program present → Soter is blocked (abnormal);

2. service property abnormal + program absent → the device natively has no Soter (normal);

3. service property normal + program present → the device supports Soter (normal);

4. service property normal + program absent → impossible.

#### Solution

**self-comfort** — hide the Soter service path with a kernel-level hiding solution, or hide the Soter system service app from the detector with an app-hiding module. Note that hiding Soter usually makes third-party checks worse.

### Tampered Attestation Key(X) (incl. 16 / 31)

#### Detection method

Runs 20+ tag-consistency checks on the attestation certificate chain, e.g. leaf `KeyUsage` vs. extension `KeyPurpose`, leaf signature algorithm vs. issuer key algorithm, the security-patch tag inside the certificate vs. system properties, `APPLICATION_ID` present without a challenge, `USER_ID` appearing in `teeEnforced`, vendor placeholder tags still issuing keys, etc.

Carries 20+ types of anomaly tags (mostly OEM-specific). Targets TEE's handling of anomaly tag feedback against expected values.

For TEE detection — if present, wait for module updates or re-lock the bootloader.

Even efisp's fake lock or custom bootloader "may" trigger this.

- 15: HanAttest chain inconsistency (different source from TeeSim constant below, but in the same mask)
- 18: Vendor placeholder KeyMint tag still successfully issued a key (tee2 §1)
- 23: Leaf certificate KeyUsage contradicts KeyPurpose in extensions
- 24: Binder over-long alias / large transaction probe anomaly
- 25: Leaf certificate SigAlg does not match issuing key algorithm
- 26: Certificate patch tag inconsistent with system properties (related to security patches) ([execute this sh script](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution/blob/main/File/Tampered%20Attestation%20Key(26)Pass.sh) to try resolving)
- 27: USER_ID appears in teeEnforced
- 29: APPLICATION_ID present without a challenge
- 30: Sensitive device identifier attestations not rejected (e.g., SERIAL)

Relation: labels 16 and 31 belong to the same check family — 16 to the HanAttest chain-inconsistency group, 31 to the security-patch-date group (usually false positives).
**Xiaomi / Redmi note**: on systems updated around 2026-03 the build time and the Android security patch date are simply different, so **(26) reports whether or not the device is rooted → ignore it**; modded key module builds / one-click hiding modules / some model-spoofing modules also cause it — switch back to the official module or uninstall them.

### TrickyStore Hook/2

#### Detection method

Compares the certificate chain / key attributes returned by Keystore with real-TEE characteristics (includes side-channel methods; unstable).

Timing side-channel (unstable). May disappear on re-open.

Replace with [key module](https://github.com/JingMatrix/TEESimulator) module.

### Found TrickyStore/Similar Module

#### Detection method

The chain is generated by a module (synthetic chain) and does not match real TEE chain characteristics.

**Attempt 1**: Replace with [key module](https://github.com/JingMatrix/TEESimulator).

**Attempt 2**: Delete `/data/adb/tricky_store/security_patch.txt`.

### TEE Spoofing (2)

#### Detection method

creates a key with both `SIGN` and `ATTEST_KEY` purposes via Keystore2 reflection — a normal device should reject this mixed use (e.g. with `-3`); if the key can sign but **both** sub-certificate issuances (with and without a challenge) fail (e.g. with `-49`), it is reported as TEE Spoofing (2).

#### Solution

replace / update the key module (see “Recommended Modules” and “Correct Module Configuration”).

### TEE Spoofing

#### Detection method

Certificate chain / key attributes indicate that TEE behaviour is being simulated.

### TEE Damaged

#### Detection method

The TEE-side key / certificate chain is incomplete or unusable.

Try using Tricky Store or the [key module](https://github.com/Enginex0/TEESimulator-RS) module.

Use with [TS-Plugin](https://github.com/KOWX712/Tricky-Addon-Update-Target-List/releases/tag/v5.0-beta.1).

Reboot after flashing, then open the module's webUI to configure.

For TEE-damaged devices, use certificate chain generation mode.

Add the detector's package name with `!` in `/data/adb/tricky_store/target.txt`, or use this one-liner:
```
su
TRICKY_DATA="/data/adb/tricky_store"
{ echo "com.google.android.gms!"; echo "com.android.vending!"; pm list packages -3 | sed 's/^package://;s/$/!/'; } > "$TRICKY_DATA/target.txt"
```

Community note: use the key module's certificate-chain generation mode where applicable.

### Key Attestation Incomplete or Chain Inconsistent

#### Detection method

The attestation certificate chain is incomplete or does not match the expected chain.

Use [key module](https://github.com/Enginex0/TEESimulator-RS) and configure it to try resolving.

### AOSP Key

#### Detection method

The keybox is signed by an AOSP test root instead of a vendor / Google production root.

Replace `keybox.xml` in `/data/adb/tricky_store/`.

You can also flash [TS-Plugin](https://github.com/KOWX712/Tricky-Addon-Update-Target-List/releases/tag/v5.0-beta.1). Reboot and open the module's webUI to configure keys.

### Boot Hash Mismatch

#### Detection method

Compares the boot / vbmeta hash (e.g. `ro.boot.vbmeta.digest`) against the baseline value.

Boot image hash mismatch.

Usually becomes `0000` after BL unlock. Use [Native detector](https://t.me/rootdetector/49) to get the correct hash, then use Tricky Store / [key module](https://github.com/Enginex0/TEESimulator-RS) with [TS-Plugin](https://github.com/KOWX712/Tricky-Addon-Update-Target-List/releases/tag/v5.0-beta.1) to configure the hash.

Open key attestation, copy the `VerifiedBootHash` value and write it with the TS add-on.

### Bootloader Unlock / Unlock Attributes

#### Detection method

reads bootloader lock-state properties / attestation results — `ro.boot.flash.locked`, `ro.boot.verifiedbootstate`, `ro.boot.vbmeta.device_state`, etc. (`0` / `orange` / `unlocked` means unlocked).

#### Solution

- **Genuinely unlocked device**: use the key module to hide the unlock state, and add the detector to the package list per “Correct Module Configuration” (the target list takes effect immediately, no reboot needed);
- **Fake-relocked / no-unlock / self-signed device**: the device already presents itself as locked (locked & green) — that state is provided by an early-boot-chain approach such as efisp — so this item normally should not fire.

See `Abnormal Boot Status` for the community's combined attempt; there are also reports that iQoo / Vivo (OriginOS 5) do not hit while OriginOS 6 does (not confirmed as a false positive).

### Abnormal Boot Status

#### Detection method

Reads verified-boot state (e.g. `ro.boot.verifiedbootstate`) and compares it with expectations.

BL unlocked. Use [key module](https://github.com/Enginex0/TEESimulator-RS) to hide.

Configure `target.txt` in `/data/adb/tricky_store/` by adding the app package name (takes effect in real-time, no reboot needed).

Community combination attempt: update the key module (-v307) + TS add-on v5.0-beta1 → disable “unmount modules (kernel-level)” in the manager → set the Zygisk provider to “restore mounts only” → freeze the phone manager (on Xiaomi, use an app-hiding / freeze approach and enable “disable environment check”) → put the property-hiding script into `/data/adb/service.d/`.

### Certificate Revoked (CRL)

#### Detection method

The certificate serial number hits a revocation list (local static list or online query).

Replace `keybox.xml` in `/data/adb/tricky_store/`.

### Key Tampering / Certificate Chain Tampering (x)

#### Detection method

- Key tampering: key / certificate-chain attribute consistency check failed; the group number is shown in the details;
- **Certificate Chain Tampering (x)**: a Java-layer check of the system property `ro.secureboot.lockstate` (that property name sits in the same table as `ro.lenovo.series`, `ro.lewa.version`, `ro.meizu.product.model`, `ro.miui.ui.version.name`, `ro.vivo.os.build.display.id`); a value of `unlocked` hits.

#### Groups

- **128**: the most common — typically seen when a key module uses the “certificate-chain generation mode” by default on OnePlus / Qualcomm devices;
- other groups (q, b, …): reasons not published.

#### Solution

- Key tampering: replace / update the key module and configure it per “Correct Module Configuration” (target list, security patch date, boot hash);
- Certificate Chain Tampering (x): `su -c '/data/adb/ksud' resetprop ro.secureboot.lockstate locked` (use `resetprop` on Magisk).

---

## Mounts & Namespaces Detection

### mountinfo

#### Detection method

An early mountinfo snapshot is taken at process start and later compared with the runtime view; any difference hits (`Mountinfo view drift`).

Mount views obtained via two different methods are inconsistent, suggesting potential concealment. Sometimes a service doesn't process in time and triggers this (early mountinfo snapshot vs. late comparison).

Xiaomi devices often show this when opening the detector under high system load after boot.

A hit right after boot is usually snapshot timing: **wait 20 s – 5 min after boot before testing**.

### zygote test (1) / App Zygote Fork Order Anomaly

#### Detection method

A fork-order probe inside the app_zygote: it opens the log socket (`/dev/socket/logdw`) to obtain identity / cookie and checks `prepare/parent/child`, parent/child liveness and fd close order to detect **Zygisk residue injected before the app-zygote**. Side-channel type; unstable.

Enable Zygisk provider's linker function and anonymous memory function to try resolving.

Exclusion list strategy — Restore mount only.

Unstable detection, occasional occurrence.

Relation: the same probe as the community name “App Zygote Fork Order Anomaly” (fork order inside the app_zygote / Zygisk early-injection residue).

### Mount loophole

#### Detection method

Checks whether magic mount from system-modifying modules actually takes effect on the system partition.

Magic Mount takes effect for system modification module mounts.

Mounting needs to be hidden by other modules (SusFS/Zygisk provider).

Use Zygisk provider's exclusion strategy > Restore mount only. Configure the exclusion list / enable default module unmounting to hide it.

Use the Zygisk provider's “restore mounts only” policy, or change the metamodule.

### Magic Mount

#### Detection method

Checks for magic-mount traces (module-driven mount rewriting).

Magic Mount detected.

Try excluding certain system-modifying modules. Use certain modules to hide this issue (e.g., Zygisk provider's exclusion strategy).

Same as above: Zygisk provider “restore mounts only” / change the metamodule.

### Inconsistent mount / debug_ramdisk

#### Detection method

resolves mounts from `/proc/self/exe` and compares them with the filesystem type reported by `statfs`; a mismatch hits. A `/debug_ramdisk` mount-view mismatch is another variant.

#### Solution

`su -c umount /debug_ramdisk`.

Note: some devices show an unfixed false positive here (partly fixed in 3.4).

### Mount Gap

#### Detection method

Checks continuity of mount group IDs / the peer-group table: a gap in group IDs (e.g. 1,2,3,6,7…) or an inconsistent peer-group table (hidden mount points) hits.

Determines whether root hiding behavior exists by checking mount group IDs.

In this method, when mount group IDs grow discontinuously (e.g., 1,2,3,6,7,8...), it is determined that root hiding behavior exists. Conversely, when mount group IDs grow continuously (e.g., 1,2,3,4,5,6,7...), it is normal.

This phenomenon occurs when Magisk switches namespace. For KernelSU/APatch, it may also occur if certain modules with bind mount functionality are used.

#### Solutions

- **Magisk**: Use Magisk Alpha to resolve, principle unknown.
- **KernelSU/APatch**: Try replacing the "meta-module" or updating the root manager.

If the problem persists, check system modules with bind mount functionality, and whether the system natively exhibits this phenomenon.

*Note*: A small number of ROMs natively exhibit this phenomenon. If this is the case, please ignore this item.

Change the metamodule / update the root manager and re-patch; if you use Scene, update Scene.

### Mount Anomaly (X)

#### Detection method

mount-table scanning (`verdict=hit: peer-group table inconsistency (hidden mount points)`, `suspicious mount entry`, overlay detection, etc.); when it hits, the expanded details contain the concrete `/dev/block/...` or module name.

#### Solution

KSU · LKM — hide the path shown in the details with a matching PathMask and hot-reload; GKI + SUSFS — add the hidden path in SUSFS; GKI without SUSFS — follow the LKM approach; other managers have no method yet.
If the details contain **overlay**, change the metamodule; if a specific module clearly causes the mount, uninstall it.

Relation: same mount family as the `/data/local/tmp` metadata anomaly family (incl. `2222`, `Futile hide 04`), `Mount loophole`, `Magic Mount` and `Mount Gap`.

### /data/local/tmp metadata anomaly family (Futile hide / 1 / 2 / 04 / 2222)

#### Detection method

all of them judge anomalies in the **metadata** of the `/data/local/tmp` directory (timestamps / inode / owner / permissions); in the app they are five separate messages:
- `Futile hide`: the directory timestamp was modified;
- `Futile hide 1` / `Futile hide 2` / `Futile hide 04`: variants of the same metadata anomaly;
- `2222`: a mount / metadata related variant.

#### Solution

`su -c rm -rf /data/local/tmp` → reboot → then fix per `Suspicious Surroundings (a)/(b)/(c)` (owner / inode / permissions); `Futile hide 1` may also simply disappear after a reboot.

Relation: same family as `Suspicious Surroundings` and `/data/local/tmp denied`, with the same handling.

### UID Namespace mismatch（same UID namespace inconsistent）

#### Detection method

the user-namespace view differs for the same UID (`UID namespace mismatch for same UID`).

#### Solution

check whether your hiding framework alters namespaces; re-test after replacing / updating the metamodule.

### Mount Namespace（mount namespace）/ Mount namespace anomaly

#### Detection method

abnormal mount-namespace view (`Mount namespace anomaly`); related to `Inconsistent mount / debug_ramdisk` and `Mount Gap` but a different criterion (namespace views, not the mount table / statfs).

#### Solution

as with the mount family (Zygisk provider “restore mounts only” / change the metamodule / PathMask, SUSFS hiding).

### PID Namespace（process namespace）/ PID namespace anomaly

#### Detection method

abnormal process-namespace view (`PID namespace anomaly`).

#### Solution

check what your hiding framework / metamodule changes about namespaces, update it and re-test.

---

## Environment, Processes & Files Detection

### Miscellaneous Check(12)

#### Detection method

A heuristic scan of page residency (`smaps` `Referenced`) combined with `MADV_COLD` / `clear_refs` to look for hidden mappings or Zygisk-like implementations; the current implementation has known problems and may fail or false-positive.

Heuristic detection of Zygisk implementations (especially Zygisk provider) via smaps scanning. However, the current implementation has issues that render the detection ineffective.

Please ignore this item until the detection method is fixed or removed.

### Looper fd Graph Anomaly

#### Detection method

Reads the fd targets of this process (`/proc/self/fd` + `readlink`) and compares the fd graph (files / sockets / anonymous inodes) against expectations.

Under analysis for reproduction, to be supplemented...

Some older kernels may show this item; the fix is currently unknown.

### HMA Possibly Present

#### Detection method

Checks for HMA (Hide My Applist) related services / package traces while the detector itself cannot see the corresponding app.

Suspected detection of old Scene_Hide-eBPF module behavior (cannot detect Scene app, but detects related services).

[Branch project / Pull update to rebuild module and flash / Download from Releases](https://github.com/Andrea-lyz/Scene-Port-Hider-by-eBPF)

If it is an old / cracked / unofficial Scene: see [Scene-Port-Hider-by-eBPF](https://github.com/Andrea-lyz/Scene-Port-Hider-by-eBPF); on the official Scene, simply update to the latest version.
(Note: HMA (Hide My Applist) and Scene are different modules with different purposes; this item and `Scene Port Occupied Detected` may appear together and should be handled separately.)

### fdinfo mnt Sampling Anomaly (c)

#### Detection method

Samples `mnt_id` from `/proc/*/fdinfo` and cross-checks it with the mount view; USB-debugging residue or temporary mounts often trigger it.

Likely detects USB debugging traces, low probability false positive. Try using the [ADB Trace Cleaner](https://github.com/YiJieqwq/ADB-Trace-Cleaner/releases) script to resolve.

### Memory Anomaly

#### Detection method

Page-residency / soft-dirty probes (`clear_refs`, `smaps`, `MADV_COLD`) used to find hidden or anomalous mappings.

Clear the detector app data first. If it persists, open an issue with your module list and which Xposed modules you're using, I'll look into it when I have time.

### Risky Applications / Risk apps 'package name'

#### Detection method

reads the directory names under `/storage/emulated/0/Android/data/` to obtain installed package names (normal apps do not have this permission), bypassing the read restriction with a **Unicode zero-width character** where that is possible (it is not a fixed method), then matches them against the risky list (see Appendix A).

#### Solution

- Effective combination: **app-hiding module blacklist mode + zero-width read fix** ([FuseFixer](https://github.com/5ec1cff/FuseFixer)); on some devices enabling the scope may cause a boot hang — turn the scope off in safe mode;
- To make only this item pass: in the app-hiding module enable “restrict zygote permissions” for the detector and turn on everything except `INET_GID`;
- For items whose criteria are unknown, you can also hide the suspicious app from the detector with the app-hiding module.

### Dirty Device(a)

#### Detection method

detects folders / files whose names contain `sh` under `/storage/emulated/0/` (`/sdcard`), plus cheat-related files / drivers (some versions also combine this with “key-replacement behaviour”).

#### Solution

this item simply means “game-cheat files were found on the device” → **just delete them yourself**, then reboot and re-test.

### Environment Doubt 1 (Experimental Detection)

#### Detection method

Experimental environment-consistency check (community report: appears after enabling app-hiding module blacklist mode with the “input method” preset checked).

In app-hiding module, if the "Input Method" option in preset settings is checked while hiding the detector in blacklist mode, this detection may appear?

Experimental environment-consistency check (community report: appears after enabling the app-hiding module's blacklist mode with the “input method” preset checked).

### Evil Service

#### Detection method

Checks for services / bindings belonging to LSPosed, Shizuku or other Xposed modules.

Detection related to LSPosed, Shizuku, and some Xposed module modifications.

First check `/sdcard` and `/data/local/tmp` for stray files left behind by modules.

### Miscellaneous Check (a)

#### Detection method

Checks dex2oat-related flags (e.g. `dalvik.vm.dex2oat-flags`); LSP / Xposed modules often modify them.

dex2oat detected (Usually an LSP issue; replace/update the LSP module).

### [Hook] Suspicious library injection

#### Detection method

Checks for library-injection traces (typical zygisk / riru / xposed features).

(zygisk/riru/xposed)

HOOK detected. Troubleshoot the cause yourself — too many possible factors.

### Device is an Emulator

#### Detection method

emulator / virtualisation features (`/dev/goldfish_pipe`, `/dev/qemu_pipe`, `/dev/socket/genyd`, `/sys/qemu_trace`) plus model keywords (`goldfish`, `ranchu`, `qemu`, `genymotion`, `bluestacks`, `ldplayer`, `nox`, `memu`, `ttvm`, `vbox`, `vmware`); it also references `android/os/BatteryManager` and `android/telephony/TelephonyManager`, so **battery / charging state and SIM state** are taken into account.

#### Solution

uninstall and reinstall the detector first; avoid testing with **no SIM card + full battery + charging** (community measurement: it does hit in that state even without direct evidence).

### Found LSPHook Framework

#### Detection method

Checks for runtime traces of LSPosed / LSPatch-style frameworks.

LSPHook Framework detected.

Caused by certain Xposed module modifications. You can also uninstall and replace the LSP module.

### Scene Port Occupied Detected

#### Detection method

Checks whether Scene's local port / service is listening.

Check this [project](https://github.com/Andrea-lyz/Scene-Port-Hider-by-eBPF) to resolve.

Ignore this detection, or disable Scene's accessibility access, or update Scene to v9.3.1+.

### Zygisk detected

#### Detection method

Checks Zygisk injection traces (anonymous executable mappings, process environment, module entry, etc.).

Zygisk detected — usually Magisk's built-in Zygisk (disable it) or other causes.

Update the [Zygisk provider module](http://github.com/Dr-TSNG/ZygiskNext).

Checks Zygisk injection traces (anonymous executable mappings, process environment, module entry, etc.).

### Suspicious Surroundings (a)

#### Detection method

Metadata check on `/data/local/tmp`: whether the directory group is `shell`.

Path: `/data/local/tmp` folder's group is abnormal.

#### Solution

Change group to shell.

Community measurement: this item checks that `/data/local/tmp` is **owned by root**; change it to shell: `su -c chown shell:shell /data/local/tmp`.

### Suspicious Surroundings (b)

#### Detection method

Checks whether the inode value of `/data/local/tmp` is abnormally high (usually caused by the directory being replaced / recreated).

Path: `/data/local/tmp` folder's inode value > 10000.

#### Solutions

Factory reset the device / Use SusFS to spoof inode value < 1000 / Try using the [Inode-Hijacker](https://github.com/YiJieqwq/Inode-Hijacker/releases) script to resolve.

If wired display projection (e.g. Scrcpy) becomes unavailable, use `su -c restorecon -RF /data/local/tmp` to resolve.

Tool: [Inode-Hijacker](https://github.com/YiJieqwq/Inode-Hijacker) (just download and run it; use an older release if it fails).

### Suspicious Surroundings (c)

#### Detection method

Checks whether `/data/local/tmp` permissions are at the default value (771).

`/data/local/tmp` — permissions modified (default is 771).

#### Solution

Reset permissions.

Restore the default permissions: `su -c chmod 771 /data/local/tmp`.

### /data/local/tmp denied

#### Detection method

Checks accessibility of `/data/local/tmp` (permissions / existence).

Access to `/data/local/tmp` denied. Permission issue? Folder doesn't exist?

Same as above: delete the directory, reboot, then handle whatever new items appear.

### Suspicious Terminal Environment

#### Detection method

Checks for pty (terminal-emulation) traces.

Pty detected.

### MT Manager (MT2 folder) / Abnormal Files

#### Detection method

Checks `/storage/emulated/0/MT2/`, boot.img, `.xml` and similar files.

Abnormal files: Detects the `mt2` folder in root directory, `boot.img` files, and `.xml` abnormal files.

Change the MT2 path in MT Manager settings (custom path) and delete the old folder.

### Thanox service detected

#### Detection method

Checks for Thanox-related services.

Thanox service detected.

Use the [hideThanox](https://t.me/Suxiaomingpd/125) Xposed module to hide it.

### Abnormal Files

#### Detection method

Matches suspicious file names / cheat features under `/dev`, `/data`, `/data/local/tmp`, `/storage/emulated/0`, etc. (list in Appendix B).

#### Detection paths

`/dev` and `/data/local/tmp`
1. Rename or delete relevant directory files.

2. Investigate and delete the following high-risk paths:
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

When it hits, the entry also prints the **actual matched path** (the community calls it “a path”); delete it as instructed.

### Suspicious Runtime Environment: Container / Clone

#### Detection method

validates the `/proc/self/cgroup` path against `^0::/uid_\d+/pid_\d+$` or `^0::/apps/uid_\d+/pid_\d+$` (both regexes are built in), together with parallel / clone probes (`parallel_ok=`, `signal_parallel_access_mismatch=`); an unexpected format or probe mismatch hits.

#### Solution

uninstall and reinstall the detector; **never use app cloning / dual apps on the detector**.

### Suspicious Modules Detected

#### Detection method

hits the signatures of thermal / scheduler / optimisation modules — most commonly the **Encore Tweaks** family: the management app, `/system/bin/encore_profiler`, `/data/encore/default_cpu_gov`, `/data/encore/custom_default_cpu_gov`, `/data/local/tmp/encore_logo.png`; separate messages are reported (`Encore management app installed / Encore Tweaks module / Encore Tweaks possible`).

#### Solution

find and uninstall the relevant module (these items are often probabilistic — reboot a few times and re-test).

### GMS Blocked

#### Detection method

checks ROM-side “GMS blocked” characteristic files / executables — `/my_product/etc/permissions/oplus_google_cn_gms_features.xml` (OPPO / OnePlus CN models; the detector directly `access`es this path) and `/system/bin/gmsc`; plus PIF-style properties `persist.sys.pihooks.disable.gms`, `persist.sys.pixelprops.gms`, `persist.sys.spoof.gms`.

#### Solution

check whether your app-hiding module hides system components (Google services), or investigate ROM-side GMS issues.

### /dev/cpuset/AppOpt

#### Detection method

this path is the signature of “thread / scheduler module mounts” (same table as `/data/swap_config.conf`, `/data/encore/*_cpu_gov`, `/data/local/tmp/yshell`); its existence hits.

#### Solution

uninstall the corresponding thread / scheduler module.

### /system/bin/fastboot and /system/bin/adb

#### Detection method

checks for abnormally present system executables (`/system/bin/adb` is confirmed to be in the signature table; `fastboot` is unconfirmed); typical of Xiaomi modified stock ROMs.

#### Solution

flash back the official ROM, or hide the two files with a kernel-level path-hiding solution.

### OBB Directory Anomaly

#### Detection method

reads the app's **own OBB path** through several read-only methods and compares the results — `statx` / `newfstatat` / `openat_chain` (probes `self_obb_path_visible`, `inconsistent_read_only_views`) → inconsistent views (i.e. a module is intercepting / hiding that path) hit.

#### Solution

find the module that blocks scanning / hides paths and uninstall it.

### USB Debugging Enabled

#### Detection method

the native method `runFormalUsbDebuggingCheck`; no `adb_enabled`-style settings string exists in the static artifacts, so it is presumed to relate to the `adbd` / `adbroot` / `adb_data_file` **SELinux rule family** (same origin as the SELinux rule probing); the exact criterion is still to be confirmed.

#### Solution

turn off USB debugging (`su -c settings put global adb_enabled 0`); this can be placed in `/data/adb/service.d/` to disable it automatically on every boot.

Relation: both this and `fdinfo mnt Sampling Anomaly (c)` involve USB debugging, but the criteria differ — that one looks at `mnt_id` residue in `/proc/*/fdinfo`.

---

## Kernel, Properties & System Characteristics Detection

### Invalid forged info (1)

#### Detection method

hits when Widevine (`MediaDrm`) reports `securityLevel = L1`, `openSession()` throws `NotProvisionedException`, and `getProvisionRequest().getData()` returns **zero-length** data.

Note: **if the device reports L3, this check is skipped entirely** (the following logic only runs when `securityLevel = L1`).

#### Symptom

the device shows Widevine L1 (both DRM Info and the detector's “Device information” panel), yet the item still reports “does not match L1”. This item has **no expandable detail** in the UI.

**Step 1 — decide whether it is a false positive**
1. Play content that **requires L1** (Netflix / Disney+ / Prime in HD / 1080p+):
   - HD / 1080p+ plays fine ⇒ L1 itself is healthy and this entry is **very likely a false positive** (known to hit on Xiaomi devices, including **locked** ones); you can ignore it and wait for an update;
   - only SD plays ⇒ continue with step 2.

2. Check “L1-spoofing” modules: TrickyStore / key module(-RS) target list, `keybox.xml`, security-patch sync, and PIF / property-spoofing modules; disable them one by one, **reboot**, and re-scan.

3. Only as a **last resort** consider the “remote RKP key (RKPConfig)”: it usually does nothing if the device already uses RKP, and currently it generally does not help on Xiaomi devices.

⚠️ **Security note**: RKPConfig-type apps make the device request an RKP key from Google and therefore **change the device's key-provisioning / attestation state**; verify the source and reversibility before installing.

Community measurement: **fake-relocked / no-unlock / completely unrooted devices can also hit this**, so it may simply be ignored; to investigate, follow “Step 1” above first.

### Found property

#### Detection method

Checks whether `persist.logd.size` / `persist.logd.size.crash` / `persist.logd.size.system` / `persist.logd.size.main` are set to **non-empty** values (non-empty hits).

Execute [this sh script](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution/blob/main/File/Found%20property.sh) to try resolving.

### Property Modified (Number represents how many properties were modified)

#### Detection method

Scans for property-area holes: permissions / ownership / size and SELinux context of files under `/dev/__properties__/`, plus whether the property area contains unused holes (`prop_area` overlap / holes) — holes imply properties were modified at runtime.

Principle: Checks for holes in the property area — if holes exist, properties have been modified.

To hide modified properties, add the [the repo's property-hiding script](https://github.com/mingzun09/Chunqiu-Detector-Problem-solution/blob/main/File/shamiko_Plus.sh) file to `/data/adb/service.d/` and reboot to try resolving.

Note: `the repo's property-hiding script` writes properties early with `resetprop -n`; run it from `/data/adb/service.d/` and **do not persist**, otherwise it may create new property-area holes.

### avb verification abnormal avb=2.0

#### Detection method

Reads vbmeta properties such as `ro.boot.vbmeta.avb_version` and compares them with expectations.

Abnormal avb version.

Certain modules can cause this, such as device model changers. Troubleshoot yourself.

If it still hits after removing the model-spoofing module: `su -c resetprop -n ro.boot.avb_version 1.3`.

### Tampered Kernel / Spoofed Kernel

#### Detection method

reads the kernel uname (version string, build time) and compares it against a preset list / baseline; the consistency check after the kernel information has been spoofed (e.g. by SUSFS) also belongs here.

#### Solution

- Hide the kernel name with a kernel-level solution (e.g. SUSFS); when spoofing the kernel, set the start stage to `post-fs-data`;
- Or restore the unmodified boot.img.

Developer's own words: on a stock system booting in LKM mode, a hit here is a false positive.

### [hook] Resetprop modified

#### Detection method

Traces of properties being modified at runtime by resetprop-style tools.

resetprop has been modified.

Unknown cause.

### Miscellaneous Check (2)

#### Detection method

Device / model tampering detection (commonly triggered by model-spoofing modules).

Device tampering / model modification detected.

Caused by model-changing modules? Troubleshoot yourself.

### Miscellaneous Check (3)

#### Detection method

Modification / isolation related detection (e.g. effects of Vold appdata isolation).

Device modification detection?

The following solution may be outdated: Did you enable HMA's "Vold app data isolation"?

Note (to be confirmed by the author): this item and `Vold isolation enabled` pull against each other — enabling HMA / app-hiding module Vold appdata isolation may clear this item but triggers `Vold isolation enabled` (that property gets written); choose whichever is more important to you.

### Netlink socket anomaly

#### Detection method

Sends a netlink `sock_diag` query as a normal app: a correct policy should reject it; if a response comes back, the netlink policy has been rewritten (common with root-hiding solutions that allow this interface).

Currently unknown.

### Third-party Kernel

#### Detection method

Kernel version information matches a preset signature list.

Kernel information matches a preset list.

Resolve by spoofing kernel information.

Use a kernel-level hidden solution (e.g. SUSFS) to spoof the kernel name.

### Third-party ROM / Self-compiled Kernel

#### Detection method

Kernel version suffix contains self-build markers such as `-Dirty`.

Third-party ROM flagged.

Kernel version suffix contains `-Dirty`.

Resolve by spoofing kernel information.

Use a kernel-level hidden solution (e.g. SUSFS) to spoof the kernel name.

### Third-party ROM (2)

#### Detection method

Third-party ROM characteristics (second group).

Currently unknown.

### ROM detected

#### Detection method

System / model characteristics match a third-party ROM list.

Third-party ROM detected.

Some characteristics match known custom ROMs.

Try spoofing.

Use a kernel-level hidden solution (e.g. SUSFS) to spoof the kernel name.

### Environment Fake

#### Detection method

Trigger surfaces differ by reproduction case: ① it triggers after flashing audit patches such as ZN-Audit Patch (see below); ② reports also point to **property-spoofing modules** (`persist.sys.pihooks_*`, `persist.sys.pixelprops.*`, `persist.sys.spoof.gms`, … — to be confirmed). A useful self-check is whether PIF / IntegrityFix / PixelProps related modules appear in this process' maps.

Old devices (Kernel 4.x) may have false positives?

This detection is triggered after flashing ZN-Audit Patch or similar modules.

Uninstall the ZN-Audit Patch module.

Trigger surfaces differ by case: ① it fires after flashing an audit-log patching kernel-side approach (see below); ② reports also point to **property-spoofing modules** (`persist.sys.pihooks_*`, `persist.sys.pixelprops.*`, `persist.sys.spoof.gms`, … — to be confirmed). A useful self-check is whether PIF / IntegrityFix / PixelProps related modules appear in this process' maps.

### Detection Failed

#### Detection method

This check itself did not complete (environment limits / timeout, etc.) — **it is not a hit**; retry or ignore it.

### Something wrong

#### Detection method

Internal error / unclassified hit.

Unknown.

### Miscellaneous Check (4/5/6/7/8/9)

#### Detection method

A group of emulator / virtual-machine, modification-behaviour and ported-ROM checks; some models (e.g. Poco / Samsung devices abroad) false-positive.

Some detections related to emulator/virtual machine characteristics, device modification behavior, or third-party/ported ROMs.

False positives on international devices like Poco/Samsung (to be fixed).

Community reports: false positives on Poco / Samsung devices abroad; some devices using Scene also hit.
If it still hits after uninstalling the model-spoofing module, it is usually module residue / an irreversible action.

### Vold isolation enabled

#### Detection method

Reads `persist.sys.vold_app_data_isolation_enabled` (HMA / app-hiding module Vold appdata isolation writes this property).

Disable "Vold app data isolation" in HMA/HMAOSS settings.

If `persist.sys.vold_app_data_isolation_enabled=0` still exists after rebooting:

Execute `resetprop -p --delete persist.sys.vold_app_data_isolation_enabled` in su shell, then reboot.

Note (to be confirmed by the author): pulls against `Miscellaneous Check (3)`; see that entry.

---

## Appendices

### Appendix A: risky / blacklisted packages (85)

Compiled from community-reported hits; changes with each version.

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

### Appendix B: suspicious / cheat-related files and directories (68)

Only **suspicious or cheat-related** files and directories are listed (safe to clean up as needed).
System paths such as `/proc`, `/sys`, `/dev`, `/system` are only **read** by the detector — **do not delete them**.

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

### Appendix C: system properties that are checked (34)

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
