# Onyx Enterprise Windows Distribution & Authenticode Signing Guide

## 1. Overview & Root Cause Analysis

### Why Microsoft Defender SmartScreen Triggers
When an executable (`.exe`) is downloaded through a web browser (Google Chrome, Microsoft Edge, Mozilla Firefox) on Windows 10/11:
1. Windows attaches an NTFS Alternate Data Stream named `Zone.Identifier` with value `ZoneId=3` (Internet).
2. Upon launch, **Microsoft Defender SmartScreen** queries Microsoft's Cloud Reputation Service with the SHA-256 hash of the binary.
3. If the binary:
   - Does not have an **Authenticode EV (Extended Validation) digital signature** from a recognized Certificate Authority (DigiCert, Sectigo, GlobalSign), AND
   - Has not yet accumulated sufficient download telemetry in the Microsoft Defender cloud database,
4. Windows displays the red/blue protective dialog:
   ```
   Windows protected your PC
   Microsoft Defender SmartScreen prevented an unrecognized app from starting.
   App: onyx-windows-x64.exe
   Publisher: Unknown publisher
   ```

---

## 2. Immediate Resolution for Developers & Evaluators

### Option 1: Unblock the Downloaded Binary via PowerShell
To immediately strip the browser's Mark-of-the-Web (`Zone.Identifier`):
```powershell
Unblock-File "$HOME\Downloads\onyx-windows-x64.exe"
```
Once unblocked, double-clicking `onyx-windows-x64.exe` will launch the native Onyx GUI installer immediately without any SmartScreen interruption.

### Option 2: Direct Automated Installation (Bypasses SmartScreen)
Installing directly via PowerShell does not attach the browser zone identifier:
```powershell
irm https://oynx.si/install.ps1 | iex
```

---

## 3. Commercial M&A Guide: EV Code Signing for Enterprise Buyers

When an acquiring IT company or SaaS vendor distributes Onyx to thousands of enterprise clients, they will sign the binary using their corporate EV Certificate.

### Prerequisites
1. Hardware Security Module (HSM) or Cloud Key Vault (Azure Key Vault, AWS CloudHSM, DigiCert KeyLocker).
2. Windows SDK installed (`signtool.exe`).

### Automated Signing Command
```cmd
signtool sign /v /fd sha256 /tr http://timestamp.digicert.com /td sha256 /sha1 <YOUR_CERT_THUMBPRINT> onyx-windows-x64.exe
```

### Verification
```cmd
signtool verify /pa /v onyx-windows-x64.exe
```
Once signed with an EV certificate, Microsoft Defender SmartScreen grants **instant global reputation**, and zero users will ever see a warning.

---

## 4. Modern Windows GUI Architecture

The installer (`installer/main.go`) has been upgraded from a legacy console application (`IMAGE_SUBSYSTEM_WINDOWS_CUI`) to a native Windows GUI application (`IMAGE_SUBSYSTEM_WINDOWS_GUI`):
1. **Zero MS-DOS Prompts:** No black command prompt window opens upon launch.
2. **Modern Dark Theme:** Custom WPF presentation interface matching the Onyx Volt Ring design language.
3. **Automated Shell Integration:**
   - Installs to `%LOCALAPPDATA%\Onyx\bin`.
   - Registers in User `PATH`.
   - Generates Desktop Shortcut (`Onyx AI IDE.lnk`).
   - Generates Start Menu Shortcut (`Programs\Onyx\Onyx AI IDE.lnk`).
   - Registers in Windows Registry (`HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall\Onyx`) for native Windows Settings / Add or Remove Programs support.
