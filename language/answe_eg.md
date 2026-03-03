Spring Detection Solutions (Follows Latest Version)

Organized by: mingzun09(SuXiaoMing) | For reference only, specific results may vary by device/environment

Table of Contents

· Process/Service Anomalies
· File/Directory Permission/Path Anomalies
· System Property/Kernel/Key Anomalies
· Module/Tool Residue Anomalies
· Environment/Mount/Hiding Anomalies
· Other Miscellaneous Checks

---

Process/Service Anomalies

01. Abnormal Process Group

· Related Item: LSP
· Solutions:
  1. Enable "App Cloning" in settings (any app), the principle is creating user 999 to eliminate this detection point
  2. Update the system to the latest version (Android security patch date ≥ 2026-02-01)
  3. Update LSP modules to the latest version

02. Evil Service

· Related Item: Zygisk Next
· Solutions:
  · KSU branch (sukisu/ksunext, etc.): Enable "Unmount Injection Only" in Zygisk
  · Magisk branch (Alpha/Kitsune): Enable "Force Mode/Unmount Injection Only" in Zygisk Next (may be ineffective on some devices)

03. Abnormal Process xxxx (PID)

· Feature: Usually an LSP process
· Solutions: Ignore / Uninstall LSP module / Manually identify the corresponding PID process (can be located via process tools)

04. Evil loop

· Feature: Folder permission anomaly set to 000 (caused by modules/manual modification)
· Solution: Change the corresponding folder permissions to 555

---

File/Directory Permission/Path Anomalies

05. /data/local/tmp denied

· Feature: The /data/local/tmp directory has been modified (permissions changed, deleted, etc.)
· Solutions (Choose one):
  1. Restore directory using Susfs hiding / Format (not recommended)
  2. Delete the original tmp folder, rename any folder under /data/local/ to tmp

06. Suspicious Surroundings (a/b/c)

· Detection Path: /data/local/tmp
· Detailed Solutions:
  · (a): Change tmp folder owner/group to shell (default root triggers detection)
  · (b): tmp inode value > 10000 → Refer to "05. futile hode" solution
  · (c): Change tmp permissions to 771 (current non-771 triggers detection)

07. MT2/Abnormal Files

· Feature: "mt2" folder / .sh/.img and other abnormal files exist in the root directory
· Solutions:
  1. Change the default path name in MT Manager settings, delete the old mt2 folder
  2. Delete abnormal files like .sh/.img from the root directory

08. GG Modifier Traces Found

· Solution: Delete the path /storage/emulated/0/legacy

09. Conventional Test (10)

· Feature: Presence of sh scripts in external storage
· Solution: Delete the script / Move it to a directory unreadable by the detection tool

10. Abnormal Files / Suspicious Files (General)

· Detection Paths: dev / /data/local/tmp
· Solutions:
  1. Rename/delete files in relevant directories (formatting system/flashing stock ROM recommended)
  2. Identify and delete the following high-risk paths:
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

11. /system/bin/xxx Anomaly

· Common Triggers: /system/bin/adb / fastboot / imgbox
· Cause: Flashing flashing tool modules
· Solution: Uninstall the corresponding flashing tool module

---

System Property/Kernel/Key Anomalies

12. Magisk/sukisu/Hidden/Dirty files

· Detection Feature: Files containing keywords (magisk/sukisu/alpha/zygisk/riru/lsposed/xposed/root/flashing/hide/ksu/shamiko/tircky)
· Solutions:
  1. Delete files containing the above keywords in the storage directory
  2. Avoid taking screenshots in root managers (Xiaomi screenshots may include app names)
  3. Upgrade Android security patch (no zero-width vulnerability to bypass detection) / Install FuseFixer module

13. Tampered Attestation Key

· Feature: Key has been tampered with (new detection point)
· Solutions: Attempt to flash the key (results vary) / Wait for TS module update

14. ro.boot.vbmeta.avb_version = Error Value

· Feature: AVB version anomaly (caused by module modification)
· Solutions: Identify the module modifying this property / See item 17

15. Spoofed Kernel Version

· Solution: When using Susfs spoofing, check post-data, use stock kernel build information

16. Tampered Attestation (a)/(b)

· Detailed Solutions:
  · (a): Key replaced → Clear all Chunqiu data
  · (b): Unstable test item → No action needed

17. Illegal Hash Value

· Solutions:
  1. Use Native Detector to get Boot hash value
  2. Create an sh script, execute as root:
     ```sh
     resetprop ro.boot.vbmeta.digest <your_hash_value>
     ```
  3. Or use Tricky Store + TS plugin to configure the hash value

18. Untrusted keyAttestation

· Solution: Replace with a valid keybox

19. Key Tampering (!) / Key Tampering (128)

· Cause: Adding "!" in Tricky Store package name file enabling forced mode
· Solution: Remove the "!" symbol / Change it to "?" symbol

20. Key Revoked

· Feature: Keybox is revoked
· Solution: Replace the keybox

---

Module/Tool Residue Anomalies

21. Audit Log Forgery

· Related Items: ZN-AuditPatch / Susfs AVC Spoofing
· Solutions: Wait for module update / Update system to Android security patch 2025-09-01+ (integration timing varies by OEM)

22. Abnormal Environment (02)

· Feature: Detected HyperCeiler residue
· Solution: Execute the following sh commands:
  ```sh
  resetprop persist.hyperceiler.log.level ""
  resetprop --delete persist.hyperceiler.log.level
  ```

23. Found Injection (a) / Found Injection (01), (02), (03)

· Common Causes: Tuning modules (e.g., full-core)/ Outdated LSP/Zygisk versions
· Solutions:
  1. Identify and uninstall tuning modules
  2. Update Zygisk Next and LSP modules to the latest versions

24. Cheats Files Found

· Solution: Delete the corresponding file according to the detection prompt path

25. Found Evil Version

· Solution: Disable Scene accessibility list permission → Reboot the phone

26. Play lntegrity Fix

· Solution: Replace/Uninstall the play integrity fix module

27. Found Rekernel Module

· Solution: Update Rekernel / Uninstall Rekernel (if possible)

28. Found XP

· Feature: Detected XP modules like HyperCeiler / related files
· Solution: Clear all files under /data/local/tmp/ / Uninstall corresponding modules

---

Environment/Mount/Hiding Anomalies

29. Virtual Machine Environment

· Cause: Device model changing modules / prop modified
· Solution: Disable device model changing modules / Restore prop

30. Environment Anomaly (a) / Abnormal Environment / AbnormalEnvironment(04)/(01)

· Feature: Side-channel detection / APatch environment anomaly
· Solutions:
  1. Update root manager
  2. APatch users: Install Nohello.kpm module to hide
  3. Rename/delete abnormal files under dev / /data/local/tmp

31. Hidden UID Found

· Detection Path: /sys/fs/cgroup/
· Solution: Hide using Sus mounts / Investigate manually

32. Risky Apps / Risky Apps [Detected Count]

· Solution: Uninstall risky apps / Hide with Susfs / Hide with HMA-OSS / Use random package names

33. Bootloader Status Anomaly / TEE Damaged / Bootloader Unlocked or Key Anomaly

· Solutions:
  1. Flash the Tricky Store module
  2. Add the detector package name to /data/adb/tricky_store/target.txt (add English ! for BL anomaly)

34. Hidden App Path Found

· Solution: Hide paths with Sus / Use random package names / Use HMA

35. Suspicious Mount Found

· Cause: Modules not used to hide mounts
· Solution: Use Susfs / Enable "Unmount Injection Only" in Zygisk Next

36. Bootloader Unlocked / Boot Status Anomaly

· Solution: Hide using Tricky Store

37. ADB [running]

· Feature: USB debugging is enabled
· Solution: Disable USB debugging in Developer options

38. Found SU

· Trigger Conditions: Susfs vulnerability / Magisk not hidden / Su authorization granted to detection software
· Solutions: Fix Susfs / Re-hide Magisk / Revoke Su authorization for the detection software

39. Hide Hook

· Feature: Detected Hook behavior
· Solution: Uncheck the Chunqiu detector in LSP's module scope

40. Mount Loophole / Magic Mount

· Feature: Usually appear together
· Solutions: Enable DenyList for the detector / Uninstall mounting modules like Zygisk Next

41. SU list

· Feature: Appears after enabling DenyList for the detector (unstable)
· Solution: Ignore (appears/disappears intermittently, no strong impact)

42. Scene Port Occupancy Detected

· Feature: Scene daemon process detected
· Solutions: Uninstall Scene / Disable Scene accessibility permission / Hide with Susfs / Ignore

---

Other Miscellaneous Checks

43. Miscellaneous Check (13)

· Feature: Usually appears alongside other issues
· Solution: Use Susfs module

44. Device Model Tampered

· Feature: 2.6.4 sweep test item (later renamed Property Modified)
· Solution: Refer to "Property Modified"

45. Property Modified

· Feature: System properties have been modified
· Solutions:
  1. Identify modules modifying properties / Hide system properties
  2. Move Shamiko module's service.sh to /data/adb/service.d/ → Reboot

46. Chunqiu Has Been Hidden by Hidden App List / Attempting to Hide Apps

· Feature: Literal meaning (detected hiding behavior)
· Solution: Adjust hiding strategy (e.g., use Susfs instead of hiding via app list)

47. System Abnormal Modification >> com.android.camera

· Cause: Ported camera / Non-stock camera (not system-signed)
· Solution: Use HMA to prevent Chunqiu from reading camera info (may be detected later)

48. Miscellaneous Check (a) / Conventional Test (a) / Detected anomalous file

· Solution: Format system / Flash stock ROM / Identify and delete abnormal files

49. Abnormal Environment (09)

· Feature: Unknown trigger condition
· Solution: No clear solution yet, suggest checking recently modified system configurations

50. Conventional Tests (a/b)

· Feature: Unknown trigger condition
· Solution: No clear solution yet, suggest waiting for detection rule updates

51. Abnormal Modification Found

· Feature: Unknown (suspected software package tampering)
· Solutions: Check system file integrity / Reinstall the detection software

52. Attempting to Hide Path

· Cause: Incorrect usage of Sus path hiding method
· Solution: Reconfigure Sus path hiding rules

53. Found Bootloader Hide

· Feature: Found BL hiding list
· Solution: Manually check the system for configurations/modules hiding BL

54. Tampered Kernel

· Feature: System kernel information has been tampered with
· Solution: Restore unmodified boot.img / Use susfs to hide kernel-related properties