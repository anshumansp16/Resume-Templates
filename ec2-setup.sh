#!/bin/bash

# EC2 Initial Setup Script
# Run this script on BOTH EC2 instances after first SSH login
# Usage: bash ec2-setup.sh

set -e

echo "================================"
echo "EC2 Instance Setup"
echo "================================"

# Update system
echo "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install essential tools
echo "Installing essential tools..."
sudo apt install -y curl git vim wget htop net-tools unzip

# Install Docker
echo "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo "Docker installed successfully"
else
    echo "Docker already installed"
fi

# Install Docker Compose
echo "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "Docker Compose installed successfully"
else
    echo "Docker Compose already installed"
fi

# Install Nginx
echo "Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
    sudo systemctl enable nginx
    sudo systemctl start nginx
    echo "Nginx installed successfully"
else
    echo "Nginx already installed"
fi

# Install Certbot
echo "Installing Certbot for Let's Encrypt..."
if ! command -v certbot &> /dev/null; then
    sudo apt install -y certbot python3-certbot-nginx
    echo "Certbot installed successfully"
else
    echo "Certbot already installed"
fi

# Install AWS CLI
echo "Installing AWS CLI v2..."
if ! command -v aws &> /dev/null; then
    cd /tmp
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip -q awscliv2.zip
    sudo ./aws/install
    rm -rf aws awscliv2.zip
    echo "AWS CLI installed successfully"
else
    echo "AWS CLI already installed"
fi

# Setup UFW Firewall
echo "Configuring UFW firewall..."
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'
echo "y" | sudo ufw enable
echo "Firewall configured"

# Create backup directory
echo "Creating backup directory..."
mkdir -p ~/backups

# Verify installations
echo ""
echo "================================"
echo "Installation Summary"
echo "================================"
docker --version
docker-compose --version
nginx -v
certbot --version
aws --version
echo ""
echo "================================"
echo "Setup Complete!"
echo "================================"
echo ""
echo "IMPORTANT: You need to log out and log back in for Docker group permissions to take effect"
echo "Then proceed with deploying your application"
echo ""
