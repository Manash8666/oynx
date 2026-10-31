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
	"time"
)

//go:embed onyx-payload.zip
var payloadData []byte

const banner = `
  ██████╗ ███╗   ██╗██╗   ██╗██╗  ██╗
 ██╔═══██╗████╗  ██║╚██╗ ██╔╝╚██╗██╔╝
 ██║   ██║██╔██╗ ██║ ╚████╔╝  ╚███╔╝ 
 ██║   ██║██║╚██╗██║  ╚██╔╝   ██╔██╗ 
 ╚██████╔╝██║ ╚████║   ██║   ██╔╝ ██╗
  ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝
  Onyx Autonomous AI IDE Engine [v1.0.0]
  Commercial High-Performance AI IDE & Compiler
`

func main() {
	// If launched directly or installing:
	localAppData := os.Getenv("LOCALAPPDATA")
	if localAppData == "" {
		localAppData = os.Getenv("USERPROFILE")
	}
	targetDir := filepath.Join(localAppData, "Onyx", "bin")
	targetExe := filepath.Join(targetDir, "onyx.exe")

	// Check if already installed and matching size
	needInstall := true
	if fi, err := os.Stat(targetExe); err == nil && fi.Size() > 100000000 {
		needInstall = false
	}

	if needInstall {
		fmt.Print(banner)
		fmt.Printf("\n[*] Installing Onyx AI IDE to: %s\n", targetDir)
		err := os.MkdirAll(targetDir, 0755)
		if err != nil {
			fmt.Printf("[-] Failed to create install directory: %v\n", err)
			time.Sleep(3 * time.Second)
			os.Exit(1)
		}

		// Extract embedded zip
		zr, err := zip.NewReader(bytes.NewReader(payloadData), int64(len(payloadData)))
		if err != nil {
			fmt.Printf("[-] Corrupted installer package: %v\n", err)
			time.Sleep(3 * time.Second)
			os.Exit(1)
		}

		for _, f := range zr.File {
			if f.Name == "onyx.exe" {
				fmt.Print("[*] Unpacking native AI IDE binary (240MB)... ")
				rc, err := f.Open()
				if err != nil {
					fmt.Printf("Failed: %v\n", err)
					os.Exit(1)
				}

				tmpExe := targetExe + ".tmp"
				outFile, err := os.OpenFile(tmpExe, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0755)
				if err != nil {
					fmt.Printf("Failed to open destination: %v\n", err)
					rc.Close()
					os.Exit(1)
				}

				_, err = io.Copy(outFile, rc)
				outFile.Close()
				rc.Close()
				if err != nil {
					fmt.Printf("Failed to write binary: %v\n", err)
					os.Remove(tmpExe)
					os.Exit(1)
				}

				os.Remove(targetExe)
				err = os.Rename(tmpExe, targetExe)
				if err != nil {
					fmt.Printf("Failed to finalize: %v\n", err)
					os.Exit(1)
				}
				fmt.Println("Done [✓]")
			}
		}

		// Add to User PATH if not present
		addToPath(targetDir)
		fmt.Println("[✓] Onyx successfully registered in environment PATH.")
		fmt.Println("[✓] Launching Onyx IDE Engine...")
		time.Sleep(1 * time.Second)
	}

	// Forward arguments to the installed binary
	args := os.Args[1:]
	cmd := exec.Command(targetExe, args...)
	cmd.Stdin = os.Stdin
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	err := cmd.Run()
	if err != nil {
		if exitError, ok := err.(*exec.ExitError); ok {
			if status, ok := exitError.Sys().(syscall.WaitStatus); ok {
				os.Exit(status.ExitStatus())
			}
		}
		os.Exit(1)
	}
}

func addToPath(dir string) {
	// Execute powershell command to ensure User PATH contains dir
	psCmd := fmt.Sprintf(`
		$p = [Environment]::GetEnvironmentVariable("Path", "User")
		if ($p -notlike "*%s*") {
			[Environment]::SetEnvironmentVariable("Path", "$p;%s", "User")
		}
	`, dir, dir)
	_ = exec.Command("powershell", "-NoProfile", "-NonInteractive", "-Command", psCmd).Run()
}
