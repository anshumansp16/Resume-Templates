# Docker Setup for ResumePro

This guide explains how to run ResumePro using Docker and Docker Compose.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

## Quick Start

### 1. Setup Environment Variables

Copy the example environment file and configure your values:

```bash
cp .env.docker.example .env.docker
```

Edit `.env.docker` with your actual credentials (Razorpay keys, email config, etc.)

### 2. Run in Development Mode

Start both client and server in development mode with hot-reload:

```bash
docker compose --env-file .env.docker --profile dev up
```

Or use the shorthand:

```bash
docker compose --env-file .env.docker --profile dev up -d
```

The `-d` flag runs containers in detached mode (background).

Access the application:
- **Client:** http://localhost:3000
- **Server API:** http://localhost:5000
- **Server Health:** http://localhost:5000/health

### 3. Run in Production Mode

Build and run optimized production containers:

```bash
# First, set BUILD_TARGET=production in .env.docker
docker compose --env-file .env.docker --profile prod up --build
```

### 4. Run with MongoDB

If you want to use the included MongoDB container instead of in-memory database:

```bash
# Update MONGODB_URI in .env.docker to:
# MONGODB_URI=mongodb://admin:password@mongodb:27017/resumepro?authSource=admin

docker compose --env-file .env.docker --profile prod --profile mongodb up
```

## Available Commands

### Start Services

```bash
# Development mode (with hot-reload)
docker compose --env-file .env.docker --profile dev up

# Development mode (detached)
docker compose --env-file .env.docker --profile dev up -d

# Production mode
docker compose --env-file .env.docker --profile prod up

# With MongoDB
docker compose --env-file .env.docker --profile prod --profile mongodb up
```

### Stop Services

```bash
# Stop all running containers
docker compose --env-file .env.docker down

# Stop and remove volumes (⚠️ deletes database data)
docker compose --env-file .env.docker down -v
```

### View Logs

```bash
# View logs from all services
docker compose --env-file .env.docker logs

# Follow logs (live tail)
docker compose --env-file .env.docker logs -f

# View logs for specific service
docker compose --env-file .env.docker logs client
docker compose --env-file .env.docker logs server
docker compose --env-file .env.docker logs mongodb
```

### Rebuild Containers

```bash
# Rebuild all containers
docker compose --env-file .env.docker --profile dev build

# Rebuild specific service
docker compose --env-file .env.docker build client
docker compose --env-file .env.docker build server

# Rebuild and restart
docker compose --env-file .env.docker --profile dev up --build
```

### Execute Commands in Containers

```bash
# Access server container shell
docker compose --env-file .env.docker exec server sh

# Access client container shell
docker compose --env-file .env.docker exec client sh

# Run npm commands in server
docker compose --env-file .env.docker exec server npm install <package-name>

# Run npm commands in client
docker compose --env-file .env.docker exec client npm install <package-name>
```

## Configuration

### Profiles

The docker-compose.yml uses profiles to control which services run:

- `dev` - Development mode (both client and server with hot-reload)
- `prod` - Production mode (optimized builds)
- `mongodb` - Optional MongoDB database

### Environment Variables

Key environment variables (see `.env.docker.example` for full list):

#### Build Configuration
- `BUILD_TARGET` - `development` or `production`
- `NODE_ENV` - `development` or `production`

#### Ports
- `CLIENT_PORT` - Client port (default: 3000)
- `SERVER_PORT` - Server port (default: 5000)
- `MONGO_PORT` - MongoDB port (default: 27017)

#### Razorpay
- `RAZORPAY_KEY_ID` - Your Razorpay key ID
- `RAZORPAY_KEY_SECRET` - Your Razorpay secret
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` - Public Razorpay key for client

#### Database
- `MONGODB_URI` - MongoDB connection string (leave empty for in-memory)
- `MONGODB_DB_NAME` - Database name (default: resumepro)

### Volumes

The setup uses Docker volumes to persist data and enable hot-reload:

- `server_node_modules` - Server dependencies
- `client_node_modules` - Client dependencies
- `client_next` - Next.js build cache
- `mongodb_data` - MongoDB data (when using mongodb profile)
- `mongodb_config` - MongoDB configuration

## Development Workflow

### Hot Reload

In development mode, code changes are automatically detected:

- **Server:** Changes to `/server/src` trigger automatic restart
- **Client:** Changes to `/client/app`, `/client/components`, etc. trigger hot reload

### Adding Dependencies

When you add new npm packages:

```bash
# For server
docker compose --env-file .env.docker exec server npm install <package-name>

# For client
docker compose --env-file .env.docker exec client npm install <package-name>

# Rebuild containers to persist changes
docker compose --env-file .env.docker --profile dev up --build
```

## Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

```bash
# Check what's using the port
lsof -i :3000
lsof -i :5000

# Or change ports in .env.docker
CLIENT_PORT=3001
SERVER_PORT=5001
```

### Container Won't Start

```bash
# Check container logs
docker compose --env-file .env.docker logs

# Remove all containers and volumes, then rebuild
docker compose --env-file .env.docker down -v
docker compose --env-file .env.docker --profile dev up --build
```

### Permission Issues

```bash
# Reset permissions on volumes
docker compose --env-file .env.docker down -v
docker volume rm resumepro_client_node_modules resumepro_server_node_modules
docker compose --env-file .env.docker --profile dev up
```

### Database Connection Issues

If using MongoDB:

```bash
# Check MongoDB is running
docker compose --env-file .env.docker ps

# Check MongoDB logs
docker compose --env-file .env.docker logs mongodb

# Verify connection string in .env.docker
MONGODB_URI=mongodb://admin:password@mongodb:27017/resumepro?authSource=admin
```

## Production Deployment

For production deployment:

1. Set `BUILD_TARGET=production` in `.env.docker`
2. Set `NODE_ENV=production` in `.env.docker`
3. Configure production MongoDB URI
4. Update `FRONTEND_URL` to your production domain
5. Build and run:

```bash
docker compose --env-file .env.docker --profile prod --profile mongodb up -d --build
```

## Health Checks

Both services include health checks:

- **Server:** `GET http://localhost:5000/health`
- **Client:** `GET http://localhost:3000/api/health`

Check health status:

```bash
docker compose --env-file .env.docker ps
```

## Cleaning Up

### Remove Stopped Containers

```bash
docker compose --env-file .env.docker down
```

### Remove Volumes (⚠️ Deletes Data)

```bash
docker compose --env-file .env.docker down -v
```

### Remove Images

```bash
# Remove project images
docker rmi resumepro-client resumepro-server

# Remove all unused images
docker image prune -a
```

## Tips

1. **Always use `--env-file .env.docker`** to ensure environment variables are loaded
2. **Use profiles** to control which services run (`--profile dev` or `--profile prod`)
3. **Monitor logs** during development with `docker compose logs -f`
4. **Rebuild after dependency changes** with `docker compose up --build`
5. **Use volumes cautiously** - removing volumes deletes database data

## Support

For issues or questions:
- Check logs: `docker compose --env-file .env.docker logs`
- Verify environment variables in `.env.docker`
- Ensure Docker and Docker Compose are up to date
