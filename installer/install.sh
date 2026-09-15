#!/bin/bash

# S.E.V Grandson Inventory Management - Linux/Mac Installer

echo "============================================"
echo "S.E.V Grandson Inventory Management Installer"
echo "============================================"
echo ""

INSTALL_DIR="$HOME/.sev-grandson-inventory"

# Create installation directory
mkdir -p "$INSTALL_DIR"

echo "Checking for Java 22..."
if ! command -v java &> /dev/null; then
    echo "Java not found. Installing Java 22..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get update
        sudo apt-get install -y openjdk-22-jdk
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install openjdk@22
    fi
else
    echo "Java is already installed."
    java -version
fi

echo ""
echo "Checking for Node.js..."
if ! command -v node &> /dev/null; then
    echo "Node.js not found. Installing Node.js..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install node
    fi
else
    echo "Node.js is already installed."
    node --version
fi

echo ""
echo "Copying application files..."
cp -r "$(dirname "$0")/app"/* "$INSTALL_DIR/"

echo ""
echo "============================================"
echo "Installation completed successfully!"
echo "============================================"
echo ""
echo "Application installed to: $INSTALL_DIR"
echo ""
echo "To run the application:"
echo "  cd $INSTALL_DIR"
echo "  npm install"
echo "  npm start"
echo ""
