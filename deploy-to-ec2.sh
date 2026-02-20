#!/bin/bash

# ResumePro Full Deployment Orchestrator
# Run this from your LOCAL MACHINE
# This script: commits → pushes → SSHs → pulls → deploys

set -e

echo "========================================"
echo "ResumePro Backend Deployment Orchestrator"
echo "========================================"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Check if we're in a git repo
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo ""
    echo "📝 Uncommitted changes detected:"
    git status --short

    echo ""
    read -p "Commit message (or press Enter to skip commit): " COMMIT_MSG

    if [ -n "$COMMIT_MSG" ]; then
        echo "Adding all changes..."
        git add .

        echo "Committing changes..."
        git commit -m "$COMMIT_MSG" || echo "⚠️  Commit failed, continuing..."

        echo "Pushing to remote..."
        git push || echo "⚠️  Push failed, continuing..."
    else
        echo "Skipping commit and push"
    fi
else
    echo "✓ No uncommitted changes"
    echo "Pushing any unpushed commits..."
    git push 2>/dev/null || echo "⚠️  Nothing to push or push failed"
fi

echo ""
echo "========================================"
echo "Deploying to EC2 Instance"
echo "========================================"

# SSH into EC2 and run deployment
echo "Connecting to resumepro EC2..."
echo ""

ssh resumepro << 'ENDSSH'
set -e

echo "📍 Connected to ResumePro EC2"
echo ""

# Navigate to project
cd ~/Resume-Templates || { echo "❌ Project directory not found"; exit 1; }

echo "📥 Pulling latest changes..."
git pull

echo ""
echo "🚀 Running deployment script..."
bash server/deploy-resumepro-backend.sh

echo ""
echo "✅ Deployment complete on EC2!"
ENDSSH

echo ""
echo "========================================"
echo "✅ Full Deployment Complete!"
echo "========================================"
echo ""
echo "Test the backend:"
echo "  curl https://api.resume.anshumansp.com/health"
echo ""
echo "View logs (SSH first):"
echo "  ssh resumepro"
echo "  docker logs resumepro-server -f"
echo ""
