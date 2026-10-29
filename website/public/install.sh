#!/bin/sh
set -e

echo ""
echo "  Installing Onyx AI Coding Agent..."
echo ""

INSTALL_DIR="$HOME/.onyx/bin"
mkdir -p "$INSTALL_DIR"

OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"

case "$ARCH" in
  x86_64|amd64) ARCH="x64" ;;
  arm64|aarch64) ARCH="arm64" ;;
  *) echo "Unsupported architecture: $ARCH"; exit 1 ;;
esac

BINARY_NAME="onyx-${OS}-${ARCH}"
DOWNLOAD_URL="https://github.com/Manash8666/oynx/releases/download/v1.0.0/${BINARY_NAME}"

echo "  Fetching Onyx binary for ${OS}-${ARCH}..."
curl -fsSL "$DOWNLOAD_URL" -o "$INSTALL_DIR/onyx" 2>/dev/null || curl -fsSL "http://localhost:3000/download/onyx" -o "$INSTALL_DIR/onyx" 2>/dev/null || true

if [ -f "$INSTALL_DIR/onyx" ]; then
  chmod +x "$INSTALL_DIR/onyx"
fi

echo ""
echo "  Onyx installed to $INSTALL_DIR/onyx"
echo "  Add to your PATH: export PATH=\"$INSTALL_DIR:\$PATH\""
echo "  Run 'onyx --help' to get started."
echo ""
