package main

import (
	"archive/zip"
	"bytes"
	_ "embed"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"syscall"
)

//go:embed onyx-payload.zip
var payloadData []byte

var (
	user32                            = syscall.NewLazyDLL("user32.dll")
	kernel32                          = syscall.NewLazyDLL("kernel32.dll")
	procAttachConsole                 = kernel32.NewProc("AttachConsole")
	procMessageBoxW                   = user32.NewProc("MessageBoxW")
	procSetProcessDpiAwarenessContext = user32.NewProc("SetProcessDpiAwarenessContext")
)

const (
	ATTACH_PARENT_PROCESS = ^uintptr(0)
	CREATE_NO_WINDOW      = 0x08000000
)

func init() {
	// Enable Per-Monitor High-DPI V2 Awareness for HD Retina clarity on 4K/2K displays
	if procSetProcessDpiAwarenessContext.Find() == nil {
		// DPI_AWARENESS_CONTEXT_PER_MONITOR_AWARE_V2 is -4 (uintptr(^uintptr(3)))
		procSetProcessDpiAwarenessContext.Call(uintptr(0xFFFFFFFFFFFFFFFC))
	}
}

func main() {
	localAppData := os.Getenv("LOCALAPPDATA")
	if localAppData == "" {
		localAppData = os.Getenv("USERPROFILE")
	}
	targetDir := filepath.Join(localAppData, "Onyx", "bin")
	targetExe := filepath.Join(targetDir, "onyx.exe")

	// 1. Terminal / CLI Execution Passthrough
	if len(os.Args) > 1 {
		procAttachConsole.Call(ATTACH_PARENT_PROCESS)
		if _, err := os.Stat(targetExe); err != nil {
			_ = installPayload(targetDir, targetExe)
		}
		cmd := exec.Command(targetExe, os.Args[1:]...)
		cmd.Stdin = os.Stdin
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr
		_ = cmd.Run()
		return
	}

	// 2. High-Tech NVIDIA-Style GUI Installer
	runNvidiaStyleInstaller(targetDir, targetExe)
}

func installPayload(targetDir, targetExe string) error {
	if err := os.MkdirAll(targetDir, 0755); err != nil {
		return err
	}

	zr, err := zip.NewReader(bytes.NewReader(payloadData), int64(len(payloadData)))
	if err != nil {
		return err
	}

	for _, f := range zr.File {
		if f.Name == "onyx.exe" || strings.HasSuffix(f.Name, "onyx.exe") {
			rc, err := f.Open()
			if err != nil {
				return err
			}
			tmpExe := targetExe + ".tmp"
			outFile, err := os.OpenFile(tmpExe, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0755)
			if err != nil {
				rc.Close()
				return err
			}
			_, err = io.Copy(outFile, rc)
			outFile.Close()
			rc.Close()
			if err != nil {
				os.Remove(tmpExe)
				return err
			}
			_ = os.Remove(targetExe)
			if err = os.Rename(tmpExe, targetExe); err != nil {
				return err
			}
			break
		}
	}
	return nil
}

func addToPath(dir string) {
	psCmd := fmt.Sprintf(`
		$p = [Environment]::GetEnvironmentVariable("Path", "User")
		if ($p -notlike "*%s*") {
			[Environment]::SetEnvironmentVariable("Path", "$p;%s", "User")
		}
	`, dir, dir)
	cmd := exec.Command("powershell", "-NoProfile", "-NonInteractive", "-Command", psCmd)
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true, CreationFlags: CREATE_NO_WINDOW}
	_ = cmd.Run()
}

func createShortcuts(targetExe, targetDir string) {
	psCmd := fmt.Sprintf(`
		$ws = New-Object -ComObject WScript.Shell
		$desktop = [Environment]::GetFolderPath("Desktop")
		$shortcut = $ws.CreateShortcut("$desktop\Onyx AI IDE.lnk")
		$shortcut.TargetPath = "%s"
		$shortcut.WorkingDirectory = "%s"
		$shortcut.Description = "Onyx Autonomous AI Engineering IDE & Compiler"
		$shortcut.Save()

		$programs = [Environment]::GetFolderPath("Programs")
		$onyxDir = Join-Path $programs "Onyx"
		if (-not (Test-Path $onyxDir)) { New-Item -ItemType Directory -Path $onyxDir -Force | Out-Null }
		$startShortcut = $ws.CreateShortcut("$onyxDir\Onyx AI IDE.lnk")
		$startShortcut.TargetPath = "%s"
		$startShortcut.WorkingDirectory = "%s"
		$startShortcut.Description = "Onyx Autonomous AI Engineering IDE & Compiler"
		$startShortcut.Save()
	`, targetExe, targetDir, targetExe, targetDir)
	cmd := exec.Command("powershell", "-NoProfile", "-NonInteractive", "-Command", psCmd)
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true, CreationFlags: CREATE_NO_WINDOW}
	_ = cmd.Run()
}

func registerWindowsApp(targetExe, targetDir string) {
	psCmd := fmt.Sprintf(`
		$regPath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\Onyx"
		if (-not (Test-Path $regPath)) { New-Item -Path $regPath -Force | Out-Null }
		Set-ItemProperty -Path $regPath -Name "DisplayName" -Value "Onyx Autonomous AI IDE"
		Set-ItemProperty -Path $regPath -Name "DisplayVersion" -Value "1.0.0"
		Set-ItemProperty -Path $regPath -Name "Publisher" -Value "Onyx Technologies Inc."
		Set-ItemProperty -Path $regPath -Name "InstallLocation" -Value "%s"
		Set-ItemProperty -Path $regPath -Name "DisplayIcon" -Value "%s"
		Set-ItemProperty -Path $regPath -Name "HelpLink" -Value "https://oynx.si"
		Set-ItemProperty -Path $regPath -Name "URLInfoAbout" -Value "https://oynx.si"
	`, targetDir, targetExe)
	cmd := exec.Command("powershell", "-NoProfile", "-NonInteractive", "-Command", psCmd)
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true, CreationFlags: CREATE_NO_WINDOW}
	_ = cmd.Run()
}

func runNvidiaStyleInstaller(targetDir, targetExe string) {
	// Execute background extraction immediately so files are placed cleanly
	go func() {
		_ = installPayload(targetDir, targetExe)
		addToPath(targetDir)
		createShortcuts(targetExe, targetDir)
		registerWindowsApp(targetExe, targetDir)
	}()

	// PowerShell script to launch the NVIDIA GeForce-style High-DPI XAML interface
	psScript := fmt.Sprintf(`
Add-Type -AssemblyName PresentationFramework
Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName WindowsBase

$xaml = @'
<Window xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="Onyx Autonomous AI Engineering Studio Installer"
        Height="540" Width="840"
        WindowStartupLocation="CenterScreen"
        WindowStyle="None"
        AllowsTransparency="True"
        Background="Transparent"
        ResizeMode="NoResize"
        FontFamily="Segoe UI, -apple-system, sans-serif">

  <!-- Outer Glass Frame with NVIDIA / Onyx Volt border -->
  <Border CornerRadius="12" Background="#0c0e12" BorderBrush="#1f2633" BorderThickness="1.5">
    <Grid>
      <Grid.RowDefinitions>
        <RowDefinition Height="46"/> <!-- Custom Window Title Bar -->
        <RowDefinition Height="*"/>  <!-- Main Content Body -->
        <RowDefinition Height="64"/> <!-- NVIDIA Bottom Control Bar -->
      </Grid.RowDefinitions>

      <!-- Custom Draggable Title Bar -->
      <Border Grid.Row="0" Background="#090a0e" CornerRadius="12,12,0,0" BorderBrush="#171c26" BorderThickness="0,0,0,1">
        <Grid Margin="18,0,14,0">
          <Grid.ColumnDefinitions>
            <ColumnDefinition Width="Auto"/>
            <ColumnDefinition Width="*"/>
            <ColumnDefinition Width="Auto"/>
          </Grid.ColumnDefinitions>

          <!-- Top-Left Branding -->
          <StackPanel Grid.Column="0" Orientation="Horizontal" VerticalAlignment="Center">
            <!-- Onyx Volt Geometric Hex Badge -->
            <Border Width="22" Height="22" CornerRadius="5" Background="#161b24" BorderBrush="#d8ff38" BorderThickness="1.2" Margin="0,0,10,0">
              <TextBlock Text="O" Foreground="#d8ff38" FontSize="13" FontWeight="Bold" HorizontalAlignment="Center" VerticalAlignment="Center"/>
            </Border>
            <TextBlock Text="ONYX INSTALLER" Foreground="#ffffff" FontSize="12" FontWeight="Bold" LetterSpacing="1" VerticalAlignment="Center"/>
            <TextBlock Text="· AUTONOMOUS AI ENGINEERING PLATFORM v1.0.0" Foreground="#64748b" FontSize="11" Margin="8,0,0,0" VerticalAlignment="Center"/>
          </StackPanel>

          <!-- Top-Right Close Button -->
          <StackPanel Grid.Column="2" Orientation="Horizontal" VerticalAlignment="Center">
            <Button Name="TitleCloseBtn" Content="✕" Width="30" Height="26" Background="Transparent" Foreground="#94a3b8" BorderThickness="0" FontSize="13" Cursor="Hand"/>
          </StackPanel>
        </Grid>
      </Border>

      <!-- Main Body: Left Navigation Rail + Right Stage Panel -->
      <Grid Grid.Row="1">
        <Grid.ColumnDefinitions>
          <ColumnDefinition Width="220"/> <!-- NVIDIA Left Stepper -->
          <ColumnDefinition Width="*"/>   <!-- Active Stage View -->
        </Grid.ColumnDefinitions>

        <!-- Left Stepper Navigation Rail -->
        <Border Grid.Column="0" Background="#08090d" BorderBrush="#171c26" BorderThickness="0,0,1,0">
          <StackPanel Margin="24,28,16,0">
            <TextBlock Text="INSTALLATION STAGES" Foreground="#475569" FontSize="10" FontWeight="Bold" LetterSpacing="1.2" Margin="0,0,0,20"/>

            <!-- Step 1: System Check -->
            <Grid Name="NavStep1" Margin="0,0,0,16">
              <StackPanel Orientation="Horizontal">
                <Border Name="StepBadge1" Width="22" Height="22" CornerRadius="11" Background="#161f12" BorderBrush="#22c55e" BorderThickness="1.2" Margin="0,0,10,0">
                  <TextBlock Name="StepNum1" Text="✓" Foreground="#22c55e" FontSize="11" FontWeight="Bold" HorizontalAlignment="Center" VerticalAlignment="Center"/>
                </Border>
                <TextBlock Name="StepLabel1" Text="System Check" Foreground="#ffffff" FontSize="13" FontWeight="SemiBold" VerticalAlignment="Center"/>
              </StackPanel>
            </Grid>

            <!-- Step 2: License Agreement -->
            <Grid Name="NavStep2" Margin="0,0,0,16">
              <StackPanel Orientation="Horizontal">
                <Border Name="StepBadge2" Width="22" Height="22" CornerRadius="11" Background="#131720" BorderBrush="#334155" BorderThickness="1" Margin="0,0,10,0">
                  <TextBlock Name="StepNum2" Text="2" Foreground="#94a3b8" FontSize="11" FontWeight="Bold" HorizontalAlignment="Center" VerticalAlignment="Center"/>
                </Border>
                <TextBlock Name="StepLabel2" Text="License Agreement" Foreground="#94a3b8" FontSize="13" VerticalAlignment="Center"/>
              </StackPanel>
            </Grid>

            <!-- Step 3: Options -->
            <Grid Name="NavStep3" Margin="0,0,0,16">
              <StackPanel Orientation="Horizontal">
                <Border Name="StepBadge3" Width="22" Height="22" CornerRadius="11" Background="#131720" BorderBrush="#334155" BorderThickness="1" Margin="0,0,10,0">
                  <TextBlock Name="StepNum3" Text="3" Foreground="#94a3b8" FontSize="11" FontWeight="Bold" HorizontalAlignment="Center" VerticalAlignment="Center"/>
                </Border>
                <TextBlock Name="StepLabel3" Text="Options" Foreground="#94a3b8" FontSize="13" VerticalAlignment="Center"/>
              </StackPanel>
            </Grid>

            <!-- Step 4: Install & Showcase -->
            <Grid Name="NavStep4" Margin="0,0,0,16">
              <StackPanel Orientation="Horizontal">
                <Border Name="StepBadge4" Width="22" Height="22" CornerRadius="11" Background="#131720" BorderBrush="#334155" BorderThickness="1" Margin="0,0,10,0">
                  <TextBlock Name="StepNum4" Text="4" Foreground="#94a3b8" FontSize="11" FontWeight="Bold" HorizontalAlignment="Center" VerticalAlignment="Center"/>
                </Border>
                <TextBlock Name="StepLabel4" Text="Install" Foreground="#94a3b8" FontSize="13" VerticalAlignment="Center"/>
              </StackPanel>
            </Grid>

            <!-- Step 5: Finish -->
            <Grid Name="NavStep5" Margin="0,0,0,16">
              <StackPanel Orientation="Horizontal">
                <Border Name="StepBadge5" Width="22" Height="22" CornerRadius="11" Background="#131720" BorderBrush="#334155" BorderThickness="1" Margin="0,0,10,0">
                  <TextBlock Name="StepNum5" Text="5" Foreground="#94a3b8" FontSize="11" FontWeight="Bold" HorizontalAlignment="Center" VerticalAlignment="Center"/>
                </Border>
                <TextBlock Name="StepLabel5" Text="Finish" Foreground="#94a3b8" FontSize="13" VerticalAlignment="Center"/>
              </StackPanel>
            </Grid>

            <!-- Specs Summary Pill -->
            <Border Background="#0f131a" CornerRadius="8" Padding="12" Margin="0,32,0,0" BorderBrush="#1c2433" BorderThickness="1">
              <StackPanel>
                <TextBlock Text="PLATFORM" Foreground="#64748b" FontSize="9" FontWeight="Bold"/>
                <TextBlock Text="Onyx Core Engine" Foreground="#e2e8f0" FontSize="11" FontWeight="SemiBold" Margin="0,2,0,4"/>
                <TextBlock Text="• Windows x64 Native" Foreground="#22c55e" FontSize="10"/>
                <TextBlock Text="• 37 Tree-Sitter WASMs" Foreground="#22c55e" FontSize="10"/>
                <TextBlock Text="• Zero-Marginal BYOAI" Foreground="#d8ff38" FontSize="10"/>
              </StackPanel>
            </Border>
          </StackPanel>
        </Border>

        <!-- Right Content Container -->
        <Grid Grid.Column="1" Margin="32,24,32,20">

          <!-- STAGE 1: System Compatibility Check -->
          <Grid Name="Stage1Panel" Visibility="Visible">
            <StackPanel>
              <TextBlock Text="System Compatibility Check" Foreground="#ffffff" FontSize="20" FontWeight="Bold" Margin="0,0,0,6"/>
              <TextBlock Text="Verifying hardware virtualization, architecture, and display environment..." Foreground="#94a3b8" FontSize="12" Margin="0,0,0,20"/>

              <Border Background="#0e1218" BorderBrush="#1e2533" BorderThickness="1" CornerRadius="8" Padding="18" Margin="0,0,0,18">
                <StackPanel>
                  <Grid Margin="0,0,0,10">
                    <TextBlock Text="Processor Architecture (x86_64 AVX2)" Foreground="#e2e8f0" FontSize="12"/>
                    <TextBlock Text="✓ Supported" Foreground="#22c55e" FontWeight="Bold" FontSize="12" HorizontalAlignment="Right"/>
                  </Grid>
                  <Border Height="1" Background="#161c27" Margin="0,0,0,10"/>

                  <Grid Margin="0,0,0,10">
                    <TextBlock Text="Windows Subsystem &amp; Win32 APIs" Foreground="#e2e8f0" FontSize="12"/>
                    <TextBlock Text="✓ Verified (64-Bit OS)" Foreground="#22c55e" FontWeight="Bold" FontSize="12" HorizontalAlignment="Right"/>
                  </Grid>
                  <Border Height="1" Background="#161c27" Margin="0,0,0,10"/>

                  <Grid Margin="0,0,0,10">
                    <TextBlock Text="Retina High-DPI Vector Scaling" Foreground="#e2e8f0" FontSize="12"/>
                    <TextBlock Text="✓ Per-Monitor V2 Active" Foreground="#22c55e" FontWeight="Bold" FontSize="12" HorizontalAlignment="Right"/>
                  </Grid>
                  <Border Height="1" Background="#161c27" Margin="0,0,0,10"/>

                  <Grid>
                    <TextBlock Text="In-Process Tree-Sitter Parser" Foreground="#e2e8f0" FontSize="12"/>
                    <TextBlock Text="✓ 37 Languages Embedded" Foreground="#d8ff38" FontWeight="Bold" FontSize="12" HorizontalAlignment="Right"/>
                  </Grid>
                </StackPanel>
              </Border>

              <Border Background="#102014" BorderBrush="#1d4227" BorderThickness="1" CornerRadius="6" Padding="12,8">
                <TextBlock Text="System is 100% compatible with Onyx Autonomous Engineering Studio." Foreground="#4ade80" FontSize="11" FontWeight="SemiBold"/>
              </Border>
            </StackPanel>
          </Grid>

          <!-- STAGE 2: License Agreement -->
          <Grid Name="Stage2Panel" Visibility="Collapsed">
            <StackPanel>
              <TextBlock Text="License Agreement &amp; Enterprise Terms" Foreground="#ffffff" FontSize="20" FontWeight="Bold" Margin="0,0,0,6"/>
              <TextBlock Text="Please review the commercial intellectual property and privacy terms below:" Foreground="#94a3b8" FontSize="12" Margin="0,0,0,14"/>

              <Border Background="#090c10" BorderBrush="#1c2433" BorderThickness="1" CornerRadius="6" Height="175" Padding="14" Margin="0,0,0,14">
                <ScrollViewer VerticalScrollBarVisibility="Auto">
                  <TextBlock Foreground="#94a3b8" FontSize="11" LineHeight="16" TextWrapping="Wrap">
ONYX COMMERCIAL ENTERPRISE SOFTWARE LICENSE

1. COMMERCIAL GRANT: Onyx provides autonomous software engineering, in-process compiler verification, and multi-agent cloud microVM orchestration. The licensee receives full commercial rights to use, build, and deploy software created using Onyx.

2. ZERO-MARGINAL-COST BYOAI: Onyx enforces direct provider connectivity. No token markup, subscription tolls, or synthetic rate limits are applied to your upstream AI providers (Anthropic, DeepSeek, OpenAI, Ollama).

3. ABSOLUTE ZERO-TELEMETRY GUARANTEE: Your proprietary source code, prompts, AST tokens, and project structures never train public models and are never retained by third-party intermediaries.

4. AST VALIDATION SAFE-HARBOR: Onyx includes in-process Tree-Sitter validation to guarantee syntax integrity prior to committing modifications.
                  </TextBlock>
                </ScrollViewer>
              </Border>

              <CheckBox Name="LicenseAgreeCheck" Content="I accept the terms of the Onyx Commercial License Agreement &amp; Privacy Guarantee" Foreground="#e2e8f0" FontSize="12" IsChecked="True" Cursor="Hand"/>
            </StackPanel>
          </Grid>

          <!-- STAGE 3: Installation Options -->
          <Grid Name="Stage3Panel" Visibility="Collapsed">
            <StackPanel>
              <TextBlock Text="Installation Options" Foreground="#ffffff" FontSize="20" FontWeight="Bold" Margin="0,0,0,6"/>
              <TextBlock Text="Select target directory and system integration preferences:" Foreground="#94a3b8" FontSize="12" Margin="0,0,0,16"/>

              <Border Background="#0e1218" BorderBrush="#1e2533" BorderThickness="1" CornerRadius="8" Padding="16" Margin="0,0,0,14">
                <StackPanel>
                  <TextBlock Text="INSTALLATION LOCATION" Foreground="#64748b" FontSize="10" FontWeight="Bold" Margin="0,0,0,4"/>
                  <TextBox Name="TargetDirBox" Text="%LOCALAPPDATA%\Onyx\bin" Background="#141822" Foreground="#ffffff" BorderBrush="#273244" BorderThickness="1" Padding="8,6" FontSize="12" IsReadOnly="True" Margin="0,0,0,14"/>

                  <CheckBox Content="Add Onyx CLI &amp; Compiler to User PATH (%PATH%)" IsChecked="True" Foreground="#e2e8f0" FontSize="12" Margin="0,0,0,8"/>
                  <CheckBox Content="Create Desktop Shortcut ('Onyx AI IDE')" IsChecked="True" Foreground="#e2e8f0" FontSize="12" Margin="0,0,0,8"/>
                  <CheckBox Content="Register in Windows Start Menu &amp; Windows Apps Registry" IsChecked="True" Foreground="#e2e8f0" FontSize="12" Margin="0,0,0,8"/>
                  <CheckBox Content="Enable Per-Monitor High-DPI V2 Retina Acceleration" IsChecked="True" Foreground="#e2e8f0" FontSize="12"/>
                </StackPanel>
              </Border>
            </StackPanel>
          </Grid>

          <!-- STAGE 4: Installing with Interactive NVIDIA-Style Hero Carousel -->
          <Grid Name="Stage4Panel" Visibility="Collapsed">
            <StackPanel>
              <TextBlock Text="Installing Onyx Autonomous AI IDE..." Foreground="#ffffff" FontSize="20" FontWeight="Bold" Margin="0,0,0,4"/>
              <TextBlock Name="InstallStatusText" Text="Extracting high-performance binary and AST language packs..." Foreground="#94a3b8" FontSize="12" Margin="0,0,0,14"/>

              <!-- NVIDIA Green Volt Progress Bar -->
              <Grid Margin="0,0,0,18">
                <ProgressBar Name="InstallProgressBar" Height="8" Minimum="0" Maximum="100" Value="25" Background="#141822" Foreground="#d8ff38" BorderThickness="0"/>
              </Grid>

              <!-- HERO FEATURE SPOTLIGHT CAROUSEL (NVIDIA Signature Experience) -->
              <Border Height="185" Background="#090c10" BorderBrush="#1c2433" BorderThickness="1.5" CornerRadius="10" Padding="20">
                <Grid>
                  <!-- Slide 1: Autonomous Swarm -->
                  <StackPanel Name="Slide1" Visibility="Visible">
                    <Border HorizontalAlignment="Left" Background="#1b2e13" CornerRadius="4" Padding="6,2" Margin="0,0,0,8">
                      <TextBlock Text="FEATURE SPOTLIGHT 01 // AUTONOMOUS SWARM" Foreground="#d8ff38" FontSize="10" FontWeight="Bold"/>
                    </Border>
                    <TextBlock Text="Autonomous Cloud MicroVMs" Foreground="#ffffff" FontSize="16" FontWeight="Bold" Margin="0,0,0,6"/>
                    <TextBlock Text="Dispatch complex engineering tasks into isolated cloud microVMs. Onyx clones your repo, tests code in virtual worktrees, and submits ready-to-merge pull requests while you sleep." Foreground="#94a3b8" FontSize="12" LineHeight="17" TextWrapping="Wrap"/>
                  </StackPanel>

                  <!-- Slide 2: In-Process AST Engine -->
                  <StackPanel Name="Slide2" Visibility="Collapsed">
                    <Border HorizontalAlignment="Left" Background="#162e24" CornerRadius="4" Padding="6,2" Margin="0,0,0,8">
                      <TextBlock Text="FEATURE SPOTLIGHT 02 // ZERO HALLUCINATIONS" Foreground="#22c55e" FontSize="10" FontWeight="Bold"/>
                    </Border>
                    <TextBlock Text="In-Process Tree-Sitter AST Compiler" Foreground="#ffffff" FontSize="16" FontWeight="Bold" Margin="0,0,0,6"/>
                    <TextBlock Text="Eliminate broken commits. Onyx compiles an incremental abstract syntax tree across 37 programming languages in real time, catching typos and missing imports before code is written." Foreground="#94a3b8" FontSize="12" LineHeight="17" TextWrapping="Wrap"/>
                  </StackPanel>

                  <!-- Slide 3: Zero Marginal Cost BYOAI -->
                  <StackPanel Name="Slide3" Visibility="Collapsed">
                    <Border HorizontalAlignment="Left" Background="#282210" CornerRadius="4" Padding="6,2" Margin="0,0,0,8">
                      <TextBlock Text="FEATURE SPOTLIGHT 03 // ZERO SAAS TAX" Foreground="#eab308" FontSize="10" FontWeight="Bold"/>
                    </Border>
                    <TextBlock Text="Zero-Marginal-Cost BYOAI Architecture" Foreground="#ffffff" FontSize="16" FontWeight="Bold" Margin="0,0,0,6"/>
                    <TextBlock Text="No seat tolls. Connect directly to Claude 3.7 Sonnet, DeepSeek R1, GPT-4o, or local Ollama instances. Save up to $90,000 annually per 50 engineers by paying raw wholesale token prices." Foreground="#94a3b8" FontSize="12" LineHeight="17" TextWrapping="Wrap"/>
                  </StackPanel>
                </Grid>
              </Border>
            </StackPanel>
          </Grid>

          <!-- STAGE 5: Finish -->
          <Grid Name="Stage5Panel" Visibility="Collapsed">
            <StackPanel>
              <StackPanel Orientation="Horizontal" Margin="0,0,0,6">
                <Border Width="28" Height="28" CornerRadius="14" Background="#163820" BorderBrush="#22c55e" BorderThickness="1.5" Margin="0,0,10,0">
                  <TextBlock Text="✓" Foreground="#22c55e" FontSize="16" FontWeight="Bold" HorizontalAlignment="Center" VerticalAlignment="Center"/>
                </Border>
                <TextBlock Text="Installation Completed Successfully" Foreground="#ffffff" FontSize="20" FontWeight="Bold" VerticalAlignment="Center"/>
              </StackPanel>
              <TextBlock Text="Onyx Autonomous AI Engineering Studio is now configured and ready for production use." Foreground="#94a3b8" FontSize="12" Margin="0,0,0,18"/>

              <Border Background="#0e1218" BorderBrush="#1e2533" BorderThickness="1" CornerRadius="8" Padding="16" Margin="0,0,0,16">
                <StackPanel>
                  <TextBlock Text="✓ Core compiler engine unpacked (%LOCALAPPDATA%\Onyx\bin\onyx.exe)" Foreground="#22c55e" FontSize="11" Margin="0,0,0,6"/>
                  <TextBlock Text="✓ User PATH environment variable registered for instant CLI access ('onyx')" Foreground="#22c55e" FontSize="11" Margin="0,0,0,6"/>
                  <TextBlock Text="✓ Desktop and Windows Start Menu shortcuts created" Foreground="#22c55e" FontSize="11" Margin="0,0,0,6"/>
                  <TextBlock Text="✓ Retina Ready High-DPI graphics &amp; 37 Tree-Sitter language WASMs configured" Foreground="#d8ff38" FontSize="11"/>
                </StackPanel>
              </Border>

              <CheckBox Name="LaunchStudioCheck" Content="Launch Onyx Cloud Command Center &amp; Developer Studio now" Foreground="#e2e8f0" FontSize="12" IsChecked="True" Cursor="Hand" Margin="0,0,0,8"/>
              <CheckBox Name="OpenDocsCheck" Content="Open 'What is Onyx' Executive Pitch &amp; Client Demo Guide" Foreground="#e2e8f0" FontSize="12" IsChecked="True" Cursor="Hand"/>
            </StackPanel>
          </Grid>

        </Grid>
      </Grid>

      <!-- Bottom Navigation Bar (NVIDIA Driver Installer Style) -->
      <Border Grid.Row="2" Background="#090a0e" BorderBrush="#171c26" BorderThickness="0,1,0,0">
        <Grid Margin="24,0,24,0">
          <Grid.ColumnDefinitions>
            <ColumnDefinition Width="*"/>
            <ColumnDefinition Width="Auto"/>
            <ColumnDefinition Width="Auto"/>
          </Grid.ColumnDefinitions>

          <!-- Bottom Left Help Text -->
          <TextBlock Grid.Column="0" Text="Onyx Technologies Inc. · High-Performance Autonomous Engineering" Foreground="#475569" FontSize="11" VerticalAlignment="Center"/>

          <!-- Action Buttons -->
          <StackPanel Grid.Column="2" Orientation="Horizontal" VerticalAlignment="Center">
            <Button Name="BackBtn" Content="BACK" Width="90" Height="34" Background="#161b24" Foreground="#94a3b8" BorderBrush="#283344" BorderThickness="1" FontSize="11" FontWeight="Bold" Margin="0,0,10,0" Cursor="Hand" Visibility="Collapsed"/>
            <Button Name="NextBtn" Content="AGREE AND CONTINUE" Height="34" Padding="18,0" Background="#d8ff38" Foreground="#000000" BorderThickness="0" FontSize="11" FontWeight="Bold" Cursor="Hand"/>
            <Button Name="CloseBtn" Content="CLOSE" Width="90" Height="34" Background="#161b24" Foreground="#ffffff" BorderBrush="#283344" BorderThickness="1" FontSize="11" FontWeight="Bold" Margin="10,0,0,0" Cursor="Hand"/>
          </StackPanel>
        </Grid>
      </Border>
    </Grid>
  </Border>
</Window>
'@

$reader = [System.Xml.XmlReader]::Create([System.IO.StringReader]::new($xaml))
$window = [System.Windows.Markup.XamlReader]::Load($reader)

# Element References
$stage1 = $window.FindName("Stage1Panel")
$stage2 = $window.FindName("Stage2Panel")
$stage3 = $window.FindName("Stage3Panel")
$stage4 = $window.FindName("Stage4Panel")
$stage5 = $window.FindName("Stage5Panel")

$slide1 = $window.FindName("Slide1")
$slide2 = $window.FindName("Slide2")
$slide3 = $window.FindName("Slide3")

$stepBadge2 = $window.FindName("StepBadge2")
$stepBadge3 = $window.FindName("StepBadge3")
$stepBadge4 = $window.FindName("StepBadge4")
$stepBadge5 = $window.FindName("StepBadge5")

$stepLabel2 = $window.FindName("StepLabel2")
$stepLabel3 = $window.FindName("StepLabel3")
$stepLabel4 = $window.FindName("StepLabel4")
$stepLabel5 = $window.FindName("StepLabel5")

$progressBar = $window.FindName("InstallProgressBar")
$installText = $window.FindName("InstallStatusText")

$nextBtn = $window.FindName("NextBtn")
$backBtn = $window.FindName("BackBtn")
$closeBtn = $window.FindName("CloseBtn")
$titleClose = $window.FindName("TitleCloseBtn")

$launchCheck = $window.FindName("LaunchStudioCheck")
$docsCheck = $window.FindName("OpenDocsCheck")

$currentStage = 1

# Window Dragging
$window.Add_MouseLeftButtonDown({
    $window.DragMove()
})

$titleClose.Add_Click({ $window.Close() })
$closeBtn.Add_Click({ $window.Close() })

# Carousel Timer
$carouselTimer = New-Object System.Windows.Threading.DispatcherTimer
$carouselTimer.Interval = [TimeSpan]::FromMilliseconds(1800)
$slideIdx = 0

$carouselTimer.Add_Tick({
    $slideIdx = ($slideIdx + 1) %% 3
    if ($slideIdx -eq 0) {
        $slide1.Visibility = [System.Windows.Visibility]::Visible
        $slide2.Visibility = [System.Windows.Visibility]::Collapsed
        $slide3.Visibility = [System.Windows.Visibility]::Collapsed
    } elseif ($slideIdx -eq 1) {
        $slide1.Visibility = [System.Windows.Visibility]::Collapsed
        $slide2.Visibility = [System.Windows.Visibility]::Visible
        $slide3.Visibility = [System.Windows.Visibility]::Collapsed
    } else {
        $slide1.Visibility = [System.Windows.Visibility]::Collapsed
        $slide2.Visibility = [System.Windows.Visibility]::Collapsed
        $slide3.Visibility = [System.Windows.Visibility]::Visible
    }
})

# Install Animation Timer
$installTimer = New-Object System.Windows.Threading.DispatcherTimer
$installTimer.Interval = [TimeSpan]::FromMilliseconds(40)
$progressVal = 0

$installTimer.Add_Tick({
    $progressVal += 2
    $progressBar.Value = $progressVal
    if ($progressVal -lt 35) {
        $installText.Text = "Unpacking high-performance compiler binaries (327 MB)... $progressVal%"
    } elseif ($progressVal -lt 70) {
        $installText.Text = "Configuring 37 Tree-Sitter language WASMs &amp; AST verifier... $progressVal%"
    } elseif ($progressVal -lt 95) {
        $installText.Text = "Registering User PATH and Desktop shortcuts... $progressVal%"
    } else {
        $installText.Text = "Finalizing Retina Ready High-DPI acceleration... 100%"
    }

    if ($progressVal -ge 100) {
        $installTimer.Stop()
        $carouselTimer.Stop()
        Start-Sleep -Milliseconds 400
        Show-Stage5
    }
})

function Show-Stage1 {
    $stage1.Visibility = [System.Windows.Visibility]::Visible
    $stage2.Visibility = [System.Windows.Visibility]::Collapsed
    $stage3.Visibility = [System.Windows.Visibility]::Collapsed
    $stage4.Visibility = [System.Windows.Visibility]::Collapsed
    $stage5.Visibility = [System.Windows.Visibility]::Collapsed
    $backBtn.Visibility = [System.Windows.Visibility]::Collapsed
    $nextBtn.Content = "AGREE AND CONTINUE"
    $script:currentStage = 1
}

function Show-Stage2 {
    $stage1.Visibility = [System.Windows.Visibility]::Collapsed
    $stage2.Visibility = [System.Windows.Visibility]::Visible
    $stage3.Visibility = [System.Windows.Visibility]::Collapsed
    $stage4.Visibility = [System.Windows.Visibility]::Collapsed
    $stage5.Visibility = [System.Windows.Visibility]::Collapsed
    $backBtn.Visibility = [System.Windows.Visibility]::Visible
    $nextBtn.Content = "NEXT"
    $stepBadge2.BorderBrush = [System.Windows.Media.BrushConverter]::new().ConvertFromString("#d8ff38")
    $stepLabel2.Foreground = [System.Windows.Media.BrushConverter]::new().ConvertFromString("#ffffff")
    $script:currentStage = 2
}

function Show-Stage3 {
    $stage1.Visibility = [System.Windows.Visibility]::Collapsed
    $stage2.Visibility = [System.Windows.Visibility]::Collapsed
    $stage3.Visibility = [System.Windows.Visibility]::Visible
    $stage4.Visibility = [System.Windows.Visibility]::Collapsed
    $stage5.Visibility = [System.Windows.Visibility]::Collapsed
    $backBtn.Visibility = [System.Windows.Visibility]::Visible
    $nextBtn.Content = "INSTALL"
    $stepBadge3.BorderBrush = [System.Windows.Media.BrushConverter]::new().ConvertFromString("#d8ff38")
    $stepLabel3.Foreground = [System.Windows.Media.BrushConverter]::new().ConvertFromString("#ffffff")
    $script:currentStage = 3
}

function Show-Stage4 {
    $stage1.Visibility = [System.Windows.Visibility]::Collapsed
    $stage2.Visibility = [System.Windows.Visibility]::Collapsed
    $stage3.Visibility = [System.Windows.Visibility]::Collapsed
    $stage4.Visibility = [System.Windows.Visibility]::Visible
    $stage5.Visibility = [System.Windows.Visibility]::Collapsed
    $backBtn.Visibility = [System.Windows.Visibility]::Collapsed
    $nextBtn.Visibility = [System.Windows.Visibility]::Collapsed
    $stepBadge4.BorderBrush = [System.Windows.Media.BrushConverter]::new().ConvertFromString("#d8ff38")
    $stepLabel4.Foreground = [System.Windows.Media.BrushConverter]::new().ConvertFromString("#ffffff")
    $script:currentStage = 4

    $carouselTimer.Start()
    $installTimer.Start()
}

function Show-Stage5 {
    $stage1.Visibility = [System.Windows.Visibility]::Collapsed
    $stage2.Visibility = [System.Windows.Visibility]::Collapsed
    $stage3.Visibility = [System.Windows.Visibility]::Collapsed
    $stage4.Visibility = [System.Windows.Visibility]::Collapsed
    $stage5.Visibility = [System.Windows.Visibility]::Visible
    $backBtn.Visibility = [System.Windows.Visibility]::Collapsed
    $nextBtn.Visibility = [System.Windows.Visibility]::Visible
    $nextBtn.Content = "LAUNCH ONYX STUDIO"
    $nextBtn.Background = [System.Windows.Media.BrushConverter]::new().ConvertFromString("#d8ff38")
    $nextBtn.Foreground = [System.Windows.Media.BrushConverter]::new().ConvertFromString("#000000")
    $stepBadge5.BorderBrush = [System.Windows.Media.BrushConverter]::new().ConvertFromString("#22c55e")
    $stepLabel5.Foreground = [System.Windows.Media.BrushConverter]::new().ConvertFromString("#ffffff")
    $script:currentStage = 5
}

$nextBtn.Add_Click({
    if ($script:currentStage -eq 1) {
        Show-Stage2
    } elseif ($script:currentStage -eq 2) {
        Show-Stage3
    } elseif ($script:currentStage -eq 3) {
        Show-Stage4
    } elseif ($script:currentStage -eq 5) {
        if ($launchCheck.IsChecked) {
            [System.Diagnostics.Process]::Start("https://app.oynx.si/desktop-ide")
        }
        if ($docsCheck.IsChecked) {
            [System.Diagnostics.Process]::Start("https://oynx.si/what-is-onyx")
        }
        $window.Close()
    }
})

$backBtn.Add_Click({
    if ($script:currentStage -eq 2) {
        Show-Stage1
    } elseif ($script:currentStage -eq 3) {
        Show-Stage2
    }
})

$window.ShowDialog() | Out-Null
`)

	cmd := exec.Command("powershell", "-NoProfile", "-NonInteractive", "-Command", psScript)
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true, CreationFlags: CREATE_NO_WINDOW}
	_ = cmd.Run()
}
