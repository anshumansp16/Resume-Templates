#!/bin/bash

# ResumePro Backend-Only Deployment Script
# Frontend is on Vercel
# Run this on the ResumePro EC2 instance
# Usage: bash deploy-resumepro-backend.sh

set -e

APP_NAME="resumepro"
APP_DIR="$HOME/$APP_NAME"
API_DOMAIN="api.resume.anshumansp.com"

echo "================================"
echo "ResumePro Backend Deployment"
echo "================================"

# Check if running in correct environment
if ! command -v docker &> /dev/null; then
    echo "Error: Docker not found. Please run ec2-setup.sh first"
    exit 1
fi

# Clone repository if not exists
if [ ! -d "$APP_DIR" ]; then
    echo "Cloning repository..."
    read -p "Enter ResumePro repository URL: " REPO_URL
    git clone "$REPO_URL" "$APP_DIR"
else
    echo "Repository already exists, pulling latest changes..."
    cd "$APP_DIR"
    git pull
fi

cd "$APP_DIR"

# Create production environment file
echo "Setting up environment variables..."
if [ ! -f ".env.production" ]; then
    cp .env.docker.example .env.production

    # Get server IP
    SERVER_IP=$(curl -s http://checkip.amazonaws.com)

    echo ""
    echo "Server IP: $SERVER_IP"
    echo ""
    echo "Configure these in .env.production:"
    echo "  - MONGODB_URI (use MongoDB Atlas)"
    echo "  - RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET"
    echo "  - EMAIL credentials"
    echo "  - FRONTEND_URL=https://resume.anshumansp.com"
    echo ""
    echo "Opening editor in 5 seconds..."
    sleep 5
    nano .env.production
fi

# Create backend-only docker-compose override
echo "Creating docker-compose.backend.yml..."
cat > docker-compose.backend.yml <<'EOF'
services:
  # Backend Server Only
  server:
    ports:
      - "127.0.0.1:5000:5000"  # Only accessible via localhost/nginx
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    profiles:
      - backend
EOF

# Create systemd service
echo "Creating systemd service..."
sudo tee /etc/systemd/system/$APP_NAME-backend.service > /dev/null <<EOF
[Unit]
Description=ResumePro Backend API
Requires=docker.service
After=docker.service network.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$APP_DIR
ExecStart=/usr/local/bin/docker-compose -f docker-compose.yml -f docker-compose.backend.yml --profile backend up -d server
ExecStop=/usr/local/bin/docker-compose -f docker-compose.yml -f docker-compose.backend.yml --profile backend down
User=$USER
Group=docker
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Create nginx configuration
echo "Creating nginx configuration..."
sudo tee /etc/nginx/sites-available/$APP_NAME-api > /dev/null <<EOF
# ResumePro Backend API
server {
    listen 80;
    server_name $API_DOMAIN;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # API endpoint
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://127.0.0.1:5000/health;
        access_log off;
    }
}
EOF

# Enable nginx site
sudo ln -sf /etc/nginx/sites-available/$APP_NAME-api /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Build and start backend
echo "Building and starting backend container..."
docker-compose -f docker-compose.yml -f docker-compose.backend.yml --profile backend build server
docker-compose -f docker-compose.yml -f docker-compose.backend.yml --profile backend up -d server

# Wait for service to start
echo "Waiting for backend to start..."
sleep 10

# Enable and start systemd service
sudo systemctl daemon-reload
sudo systemctl enable $APP_NAME-backend
sudo systemctl start $APP_NAME-backend

echo ""
echo "================================"
echo "Deployment Status"
echo "================================"
docker ps | grep resumepro
echo ""

# Test backend
echo "Testing backend..."
sleep 3
curl -I http://localhost:5000/health || echo "Health check endpoint may not exist yet"

# Setup SSL
echo ""
echo "================================"
read -p "Setup SSL certificate now? (y/n): " SETUP_SSL
if [ "$SETUP_SSL" = "y" ]; then
    read -p "Enter email for Let's Encrypt: " EMAIL
    sudo certbot --nginx -d $API_DOMAIN --non-interactive --agree-tos -m "$EMAIL" --redirect
    echo "SSL certificate installed successfully"
fi

# Get server IP
SERVER_IP=$(curl -s http://checkip.amazonaws.com)

echo ""
echo "================================"
echo "Backend Deployment Complete!"
echo "================================"
echo "Backend API: https://$API_DOMAIN"
echo "Server IP: $SERVER_IP"
echo "Test with: curl http://$SERVER_IP:5000/health (before SSL)"
echo "Test with: curl https://$API_DOMAIN/health (after SSL)"
echo ""
echo "Update Vercel frontend environment variables:"
echo "  NEXT_PUBLIC_SERVER_URL=https://$API_DOMAIN"
echo ""
echo "Useful commands:"
echo "  View logs: sudo journalctl -u $APP_NAME-backend -f"
echo "  Docker logs: docker logs resumepro-server -f"
echo "  Restart: sudo systemctl restart $APP_NAME-backend"
echo "  Status: sudo systemctl status $APP_NAME-backend"
echo ""
