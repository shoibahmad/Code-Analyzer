#!/usr/bin/env bash
# Build script for Render deployment

# Exit on error
set -o errexit

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create necessary directories
mkdir -p logs
mkdir -p cache

echo "Build completed successfully!"
