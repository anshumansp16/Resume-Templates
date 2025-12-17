#!/bin/bash

# Script to sync templates from /templates to /public/templates
# This ensures the public templates always have the latest dynamic placeholders

SOURCE_DIR="./templates"
DEST_DIR="./public/templates"

echo "Syncing templates from $SOURCE_DIR to $DEST_DIR..."

# Create destination directory if it doesn't exist
mkdir -p "$DEST_DIR"

# Copy all HTML files
cp "$SOURCE_DIR"/*.html "$DEST_DIR/"

echo "✓ Templates synced successfully!"
echo "✓ All templates in $DEST_DIR are now up to date"
