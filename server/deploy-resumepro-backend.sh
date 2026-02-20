#!/bin/bash

# ResumePro Backend Deployment Script
# Run this ON THE EC2 INSTANCE (after git pull)
# This script assumes the repo is already cloned

set -e

echo "================================"
echo "ResumePro Backend Deployment"
echo "================================"

# Get project root (parent of server directory where this script is)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"
echo "Project root: $PROJECT_ROOT"

# Check if running in correct environment
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker not found. Please run ec2-setup.sh first"
    exit 1
fi

# Pull latest changes
echo ""
echo "Pulling latest changes from git..."
git pull || echo "⚠️  Warning: git pull failed, continuing anyway..."

# Check if .env.production exists
if [ ! -f "$PROJECT_ROOT/.env.production" ]; then
    echo ""
    echo "Creating .env.production from .env.docker.example..."
    cp "$PROJECT_ROOT/.env.docker.example" "$PROJECT_ROOT/.env.production" 2>/dev/null || \
    cp "$PROJECT_ROOT/server/.env.example" "$PROJECT_ROOT/.env.production" 2>/dev/null || \
    touch "$PROJECT_ROOT/.env.production"

    SERVER_IP=$(curl -s http://checkip.amazonaws.com || echo "unknown")

    echo ""
    echo "Server IP: $SERVER_IP"
    echo ""
    echo "⚠️  IMPORTANT: Configure .env.production with:"
    echo "  - NODE_ENV=production"
    echo "  - PORT=5000"
    echo "  - FRONTEND_URL=https://resume.anshumansp.com"
    echo "  - MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/resumepro_prod"
    echo "  - RAZORPAY_KEY_ID=rzp_live_xxxxx"
    echo "  - RAZORPAY_KEY_SECRET=your_secret"
    echo "  - EMAIL_HOST=smtp.gmail.com"
    echo "  - EMAIL_PORT=587"
    echo "  - EMAIL_USER=your_email@gmail.com"
    echo "  - EMAIL_PASSWORD=your_app_password"
    echo "  - GROQ_API_KEY=gsk_xxxxx"
    echo ""
    read -p "Press Enter to edit .env.production now..."
    nano "$PROJECT_ROOT/.env.production"
fi

# Create backend-only docker-compose override
echo ""
echo "Creating docker-compose.backend.yml..."
cat > "$PROJECT_ROOT/docker-compose.backend.yml" <<'EOF'
services:
  server:
    ports:
      - "127.0.0.1:5000:5000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    profiles:
      - backend
EOF

# Create or update systemd service
echo "Setting up systemd service..."
sudo tee /etc/systemd/system/resumepro-backend.service > /dev/null <<EOF
[Unit]
Description=ResumePro Backend API
Requires=docker.service
After=docker.service network.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$PROJECT_ROOT
ExecStart=/usr/local/bin/docker-compose -f docker-compose.yml -f docker-compose.backend.yml --profile backend up -d server
ExecStop=/usr/local/bin/docker-compose -f docker-compose.yml -f docker-compose.backend.yml --profile backend down
User=$USER
Group=docker
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Create or update nginx configuration
if [ ! -f "/etc/nginx/sites-available/resumepro-api" ]; then
    echo "Creating nginx configuration..."
    sudo tee /etc/nginx/sites-available/resumepro-api > /dev/null <<'EOF'
server {
    listen 80;
    server_name api.resume.anshumansp.com;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location /health {
        proxy_pass http://127.0.0.1:5000/health;
        access_log off;
    }
}
EOF

    sudo ln -sf /etc/nginx/sites-available/resumepro-api /etc/nginx/sites-enabled/
    sudo nginx -t && sudo systemctl reload nginx

    echo ""
    read -p "Setup SSL certificate now? (y/n): " SETUP_SSL
    if [ "$SETUP_SSL" = "y" ]; then
        read -p "Enter email for Let's Encrypt: " EMAIL
        sudo certbot --nginx -d api.resume.anshumansp.com --non-interactive --agree-tos -m "$EMAIL" --redirect || echo "⚠️  SSL setup failed, continuing..."
    fi
fi

echo ""
echo "================================"
echo "Building and Deploying Backend"
echo "================================"

# Stop existing containers
docker-compose -f docker-compose.yml -f docker-compose.backend.yml --profile backend down 2>/dev/null || true

# Build and start
echo "Building backend container..."
docker-compose -f docker-compose.yml -f docker-compose.backend.yml --profile backend build server

echo "Starting backend container..."
docker-compose -f docker-compose.yml -f docker-compose.backend.yml --profile backend up -d server

echo "Waiting for backend to start..."
sleep 10

# Enable and restart systemd service
sudo systemctl daemon-reload
sudo systemctl enable resumepro-backend 2>/dev/null || true
sudo systemctl restart resumepro-backend 2>/dev/null || true

echo ""
echo "================================"
echo "✅ Deployment Complete!"
echo "================================"
docker ps | grep resumepro || echo "⚠️  No resumepro containers running"

# Test backend
echo ""
echo "Testing backend..."
if curl -s -f -m 5 http://localhost:5000/health > /dev/null 2>&1; then
    echo "✅ Backend health check passed"
else
    echo "⚠️  Health check failed (may not have /health endpoint)"
fi

SERVER_IP=$(curl -s http://checkip.amazonaws.com || echo "unknown")

echo ""
echo "Backend API: https://api.resume.anshumansp.com"
echo "Server IP: $SERVER_IP"
echo ""
echo "📝 Update Vercel with:"
echo "   NEXT_PUBLIC_SERVER_URL=https://api.resume.anshumansp.com"
echo ""
echo "📊 Monitor with:"
echo "   docker logs resumepro-server -f"
echo "   sudo journalctl -u resumepro-backend -f"
echo ""
