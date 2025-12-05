#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
npm install

# Install Chrome dependencies for Puppeteer
# Render uses Ubuntu, so we need these system packages
echo "Installing Chrome dependencies..."

# Install Puppeteer Chrome binary
npx puppeteer browsers install chrome

echo "Build complete!"
