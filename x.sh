#!/bin/bash

# Define the new npm global directory
NPM_GLOBAL_DIR="${HOME}/.npm-global"

# Create the new directory if it doesn't exist
if [ ! -d "$NPM_GLOBAL_DIR" ]; then
    mkdir "$NPM_GLOBAL_DIR"
    echo "Created directory $NPM_GLOBAL_DIR"
fi

# Configure npm to use the new directory
npm config set prefix "$NPM_GLOBAL_DIR"
echo "Configured npm to use $NPM_GLOBAL_DIR"

# Update PATH variable
SHELL_PROFILE=""
if [ -f "$HOME/.bashrc" ]; then
    SHELL_PROFILE="$HOME/.bashrc"
elif [ -f "$HOME/.zshrc" ]; then
    SHELL_PROFILE="$HOME/.zshrc"
else
    echo "No supported shell profile file found. Please update PATH manually."
    exit 1
fi

# Add the new npm global directory to PATH if it's not already there
if ! grep -q "$NPM_GLOBAL_DIR/bin" "$SHELL_PROFILE"; then
    echo "export PATH=\"$NPM_GLOBAL_DIR/bin:\$PATH\"" >> "$SHELL_PROFILE"
    echo "Added $NPM_GLOBAL_DIR/bin to PATH in $SHELL_PROFILE"
else
    echo "$NPM_GLOBAL_DIR/bin is already in PATH."
fi

# Reload shell profile
source "$SHELL_PROFILE"
echo "Reloaded shell profile."

# Install shadcn-ui globally
npm install -g shadcn-ui
if [ $? -eq 0 ]; then
    echo "shadcn-ui installed successfully."
else
    echo "Failed to install shadcn-ui."
    exit 1
fi

