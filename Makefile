# ResumePro Docker Commands
# Usage: make <command>

.PHONY: help setup dev prod mongodb up down logs build rebuild clean

# Default target
help:
	@echo "ResumePro Docker Commands"
	@echo ""
	@echo "Setup:"
	@echo "  make setup          - Create .env.docker from example file"
	@echo ""
	@echo "Development:"
	@echo "  make dev            - Start in development mode"
	@echo "  make dev-d          - Start in development mode (detached)"
	@echo ""
	@echo "Production:"
	@echo "  make prod           - Start in production mode"
	@echo "  make prod-d         - Start in production mode (detached)"
	@echo ""
	@echo "With MongoDB:"
	@echo "  make mongodb        - Start with MongoDB in production mode"
	@echo "  make mongodb-d      - Start with MongoDB (detached)"
	@echo ""
	@echo "Control:"
	@echo "  make down           - Stop all containers"
	@echo "  make logs           - View logs (live)"
	@echo "  make logs-client    - View client logs"
	@echo "  make logs-server    - View server logs"
	@echo ""
	@echo "Build:"
	@echo "  make build          - Build all containers"
	@echo "  make rebuild        - Rebuild and restart (dev mode)"
	@echo "  make rebuild-prod   - Rebuild and restart (production)"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean          - Stop containers and remove volumes"
	@echo "  make clean-all      - Remove containers, volumes, and images"

# Setup
setup:
	@if [ ! -f .env.docker ]; then \
		cp .env.docker.example .env.docker; \
		echo "✅ Created .env.docker from example"; \
		echo "⚠️  Please edit .env.docker with your configuration"; \
	else \
		echo "ℹ️  .env.docker already exists"; \
	fi

# Development
dev: setup
	docker compose --env-file .env.docker --profile dev up

dev-d: setup
	docker compose --env-file .env.docker --profile dev up -d
	@echo "✅ Development containers started in background"
	@echo "📱 Client: http://localhost:3000"
	@echo "🔌 Server: http://localhost:5000"

# Production
prod: setup
	docker compose --env-file .env.docker --profile prod up

prod-d: setup
	docker compose --env-file .env.docker --profile prod up -d
	@echo "✅ Production containers started in background"
	@echo "📱 Client: http://localhost:3000"
	@echo "🔌 Server: http://localhost:5000"

# MongoDB
mongodb: setup
	docker compose --env-file .env.docker --profile prod --profile mongodb up

mongodb-d: setup
	docker compose --env-file .env.docker --profile prod --profile mongodb up -d
	@echo "✅ Production containers with MongoDB started"
	@echo "📱 Client: http://localhost:3000"
	@echo "🔌 Server: http://localhost:5000"
	@echo "🗄️  MongoDB: localhost:27017"

# Control
down:
	docker compose --env-file .env.docker down

logs:
	docker compose --env-file .env.docker logs -f

logs-client:
	docker compose --env-file .env.docker logs -f client

logs-server:
	docker compose --env-file .env.docker logs -f server

# Build
build: setup
	docker compose --env-file .env.docker build

rebuild: setup
	docker compose --env-file .env.docker --profile dev up --build

rebuild-prod: setup
	docker compose --env-file .env.docker --profile prod up --build

# Cleanup
clean:
	docker compose --env-file .env.docker down -v
	@echo "✅ Containers and volumes removed"

clean-all: clean
	@echo "🧹 Removing images..."
	docker rmi -f resumepro-client resumepro-server 2>/dev/null || true
	@echo "✅ Complete cleanup finished"
