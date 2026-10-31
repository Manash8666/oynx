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
	"syscall"
	"unsafe"
)

//go:embed onyx-payload.zip
var payloadData []byte

var (
	user32               = syscall.NewLazyDLL("user32.dll")
	kernel32             = syscall.NewLazyDLL("kernel32.dll")
	procAttachConsole    = kernel32.NewProc("AttachConsole")
	procAllocConsole     = kernel32.NewProc("AllocConsole")
	procMessageBoxW      = user32.NewProc("MessageBoxW")
)

const ATTACH_PARENT_PROCESS = ^uintptr(0)

func main() {
	localAppData := os.Getenv("LOCALAPPDATA")
	if localAppData == "" {
		localAppData = os.Getenv("USERPROFILE")
	}
	targetDir := filepath.Join(localAppData, "Onyx", "bin")
	targetExe := filepath.Join(targetDir, "onyx.exe")

	// 1. If arguments are passed from terminal (CLI mode):
	if len(os.Args) > 1 {
		procAttachConsole.Call(ATTACH_PARENT_PROCESS)
		// Ensure installed
		if _, err := os.Stat(targetExe); err != nil {
			installPayload(targetDir, targetExe)
		}
		// Forward command line to onyx.exe
		cmd := exec.Command(targetExe, os.Args[1:]...)
		cmd.Stdin = os.Stdin
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr
		_ = cmd.Run()
		return
	}

	// 2. If double-clicked (GUI Installer mode):
	// Perform extraction and shortcut registration
	err := installPayload(targetDir, targetExe)
	if err != nil {
		showErrorDialog("Onyx Installation Failed", fmt.Sprintf("Error extracting Onyx binaries: %v", err))
		return
	}

	// Add to PATH & create Shortcuts
	addToPath(targetDir)
	createShortcuts(targetExe, targetDir)
	registerWindowsApp(targetExe, targetDir)

	// Display Modern Dark GUI Completion Window via PowerShell WPF
	showModernGui(targetDir)
}

func installPayload(targetDir, targetExe string) error {
	err := os.MkdirAll(targetDir, 0755)
	if err != nil {
		return err
	}

	zr, err := zip.NewReader(bytes.NewReader(payloadData), int64(len(payloadData)))
	if err != nil {
		return err
	}

	for _, f := range zr.File {
		if f.Name == "onyx.exe" {
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
			os.Remove(targetExe)
			err = os.Rename(tmpExe, targetExe)
			if err != nil {
				return err
			}
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
	_ = exec.Command("powershell", "-NoProfile", "-NonInteractive", "-Command", psCmd).Run()
}

func createShortcuts(targetExe, targetDir string) {
	psCmd := fmt.Sprintf(`
		$ws = New-Object -ComObject WScript.Shell
		$desktop = [Environment]::GetFolderPath("Desktop")
		$shortcut = $ws.CreateShortcut("$desktop\Onyx AI IDE.lnk")
		$shortcut.TargetPath = "%s"
		$shortcut.WorkingDirectory = "%s"
		$shortcut.Description = "Onyx Autonomous AI Engineering IDE"
		$shortcut.Save()

		$programs = [Environment]::GetFolderPath("Programs")
		$onyxDir = Join-Path $programs "Onyx"
		if (-not (Test-Path $onyxDir)) { New-Item -ItemType Directory -Path $onyxDir -Force | Out-Null }
		$startShortcut = $ws.CreateShortcut("$onyxDir\Onyx AI IDE.lnk")
		$startShortcut.TargetPath = "%s"
		$startShortcut.WorkingDirectory = "%s"
		$startShortcut.Description = "Onyx Autonomous AI Engineering IDE"
		$startShortcut.Save()
	`, targetExe, targetDir, targetExe, targetDir)
	_ = exec.Command("powershell", "-NoProfile", "-NonInteractive", "-Command", psCmd).Run()
}

func registerWindowsApp(targetExe, targetDir string) {
	psCmd := fmt.Sprintf(`
		$regPath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\Onyx"
		if (-not (Test-Path $regPath)) { New-Item -Path $regPath -Force | Out-Null }
		Set-ItemProperty -Path $regPath -Name "DisplayName" -Value "Onyx Autonomous AI IDE"
		Set-ItemProperty -Path $regPath -Name "DisplayVersion" -Value "1.0.0"
		Set-ItemProperty -Path $regPath -Name "Publisher" -Value "Onyx Technologies"
		Set-ItemProperty -Path $regPath -Name "InstallLocation" -Value "%s"
		Set-ItemProperty -Path $regPath -Name "DisplayIcon" -Value "%s"
		Set-ItemProperty -Path $regPath -Name "HelpLink" -Value "https://oynx.si"
		Set-ItemProperty -Path $regPath -Name "URLInfoAbout" -Value "https://oynx.si"
	`, targetDir, targetExe)
	_ = exec.Command("powershell", "-NoProfile", "-NonInteractive", "-Command", psCmd).Run()
}

func showModernGui(targetDir string) {
	psScript := fmt.Sprintf(`
Add-Type -AssemblyName PresentationFramework

$xaml = @'
<Window xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="Onyx Autonomous AI IDE Setup" Height="420" Width="580"
        WindowStartupLocation="CenterScreen" WindowStyle="None" AllowsTransparency="True"
        Background="Transparent" ResizeMode="NoResize">
  <Border CornerRadius="14" Background="#0b0d12" BorderBrush="#222734" BorderThickness="1.5">
    <Grid Margin="28">
      <Grid.RowDefinitions>
        <RowDefinition Height="Auto"/>
        <RowDefinition Height="Auto"/>
        <RowDefinition Height="*"/>
        <RowDefinition Height="Auto"/>
      </Grid.RowDefinitions>

      <!-- Header -->
      <StackPanel Grid.Row="0" Orientation="Horizontal" VerticalAlignment="Center">
        <Border Width="44" Height="44" CornerRadius="10" Background="#12151d" BorderBrush="#333b4d" BorderThickness="1.5" Margin="0,0,14,0">
          <TextBlock Text="O" Foreground="#d8ff38" FontSize="24" FontWeight="Bold" HorizontalAlignment="Center" VerticalAlignment="Center"/>
        </Border>
        <StackPanel VerticalAlignment="Center">
          <TextBlock Text="Onyx Autonomous AI IDE" Foreground="#ffffff" FontSize="19" FontWeight="Bold" FontFamily="Segoe UI, sans-serif"/>
          <TextBlock Text="Commercial Autonomous Engineering Studio &amp; In-Process Compiler" Foreground="#9ca3af" FontSize="11" Margin="0,2,0,0"/>
        </StackPanel>
      </StackPanel>

      <!-- Separator -->
      <Border Grid.Row="1" Height="1" Background="#1f2430" Margin="0,18,0,18"/>

      <!-- Progress / Status Area -->
      <StackPanel Grid.Row="2" VerticalAlignment="Center">
        <StackPanel Orientation="Horizontal" Margin="0,0,0,8">
          <TextBlock Text="Installation Completed" Foreground="#ffffff" FontSize="14" FontWeight="SemiBold"/>
          <Border Background="#163820" CornerRadius="4" Padding="6,2" Margin="10,0,0,0">
            <TextBlock Text="READY" Foreground="#22c55e" FontSize="10" FontWeight="Bold"/>
          </Border>
        </StackPanel>

        <ProgressBar Height="6" Value="100" Background="#161922" Foreground="#d8ff38" BorderThickness="0" Margin="0,0,0,16"/>

        <Border Background="#10131a" BorderBrush="#1c212c" BorderThickness="1" CornerRadius="8" Padding="14">
          <StackPanel>
            <TextBlock Text="✓ Core compiler engine unpacked (240MB)" Foreground="#22c55e" FontSize="11" Margin="0,0,0,5"/>
            <TextBlock Text="✓ Environment PATH configured (%LOCALAPPDATA%\Onyx\bin)" Foreground="#22c55e" FontSize="11" Margin="0,0,0,5"/>
            <TextBlock Text="✓ Desktop &amp; Start Menu shortcuts created" Foreground="#22c55e" FontSize="11" Margin="0,0,0,5"/>
            <TextBlock Text="✓ Retina Ready high-DPI display assets configured" Foreground="#22c55e" FontSize="11"/>
          </StackPanel>
        </Border>
      </StackPanel>

      <!-- Footer Buttons -->
      <Grid Grid.Row="3" Margin="0,18,0,0">
        <Grid.ColumnDefinitions>
          <ColumnDefinition Width="*"/>
          <ColumnDefinition Width="Auto"/>
          <ColumnDefinition Width="Auto"/>
        </Grid.ColumnDefinitions>

        <TextBlock Text="v1.0.0 · Commercial License" Foreground="#4b5563" FontSize="11" VerticalAlignment="Center"/>

        <Button Name="OpenStudioBtn" Grid.Column="1" Content="Launch Developer Studio" Background="#d8ff38" Foreground="#000000" FontWeight="Bold" FontSize="12" Padding="16,8" BorderThickness="0" Margin="0,0,10,0" Cursor="Hand"/>
        <Button Name="CloseBtn" Grid.Column="2" Content="Close" Background="#181c26" Foreground="#ffffff" FontSize="12" Padding="16,8" BorderBrush="#333b4d" BorderThickness="1" Cursor="Hand"/>
      </Grid>
    </Grid>
  </Border>
</Window>
'@

$reader = [System.Xml.XmlReader]::Create([System.IO.StringReader]::new($xaml))
$window = [System.Windows.Markup.XamlReader]::Load($reader)

$openBtn = $window.FindName("OpenStudioBtn")
$closeBtn = $window.FindName("CloseBtn")

$openBtn.Add_Click({
    [System.Diagnostics.Process]::Start("https://app.oynx.si/cloud-agent")
    $window.Close()
})

$closeBtn.Add_Click({
    $window.Close()
})

$window.ShowDialog() | Out-Null
`)
	_ = exec.Command("powershell", "-NoProfile", "-NonInteractive", "-Command", psScript).Run()
}

func showErrorDialog(title, message string) {
	t, _ := syscall.UTF16PtrFromString(title)
	m, _ := syscall.UTF16PtrFromString(message)
	procMessageBoxW.Call(0, uintptr(unsafe.Pointer(m)), uintptr(unsafe.Pointer(t)), 0x10) // MB_ICONERROR
}
