# Docker Setup Guide

This document explains how to run the Tactical Report Frontend using Docker.

## Prerequisites

- Docker (v20.10 or higher)
- Docker Compose (v2.0 or higher)

## Quick Start

### Production Build

Build and run the production-optimized container:

```bash
# Build the image
docker-compose build frontend

# Start the container
docker-compose up frontend
```

The application will be available at `http://localhost:3000`

### Development Mode with Hot Reload

For development with hot reload:

```bash
# Start in development mode
docker-compose --profile dev up frontend-dev
```

This mounts your local code as a volume, so changes are reflected immediately.

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` with your settings:
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: `http://localhost:8080/api`)

### Building with Custom Environment Variables

```bash
# Build with custom API URL
docker-compose build --build-arg NEXT_PUBLIC_API_URL=https://api.example.com frontend
```

## Docker Commands

### Build

```bash
# Build the production image
docker-compose build frontend

# Build without cache
docker-compose build --no-cache frontend
```

### Run

```bash
# Start in detached mode
docker-compose up -d frontend

# View logs
docker-compose logs -f frontend

# Stop container
docker-compose down
```

### Using Plain Docker (without docker-compose)

```bash
# Build
docker build -t tactical-report-frontend \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:8080/api .

# Run
docker run -d \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:8080/api \
  --name tactical-report-frontend \
  tactical-report-frontend
```

## Container Details

### Image Optimization

The Dockerfile uses a multi-stage build for optimal image size:
- **Stage 1 (deps)**: Installs dependencies
- **Stage 2 (builder)**: Builds the Next.js application
- **Stage 3 (runner)**: Minimal production runtime

### Security Features

- Runs as non-root user (`nextjs:nodejs`)
- Minimal Alpine-based image
- Only production dependencies included
- Health checks enabled

### Health Check

The container includes a health check that runs every 30 seconds:

```bash
# Check container health
docker inspect --format='{{.State.Health.Status}}' tactical-report-frontend
```

## Networking

The docker-compose setup creates a bridge network (`tactical-report-network`) for easy integration with backend services.

To connect with a backend:

```yaml
services:
  backend:
    networks:
      - tactical-report-network

  frontend:
    networks:
      - tactical-report-network
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8080/api
```

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, change it in docker-compose.yml:

```yaml
ports:
  - "3001:3000"  # Maps host port 3001 to container port 3000
```

### Build Fails

Clear Docker cache and rebuild:

```bash
docker-compose down
docker system prune -af
docker-compose build --no-cache frontend
```

### Container Exits Immediately

Check logs:

```bash
docker-compose logs frontend
```

### Hot Reload Not Working in Dev Mode

Ensure volumes are properly mounted in docker-compose.yml and you're using the `dev` profile.

## Production Deployment

For production deployment:

1. Build the image with production environment variables
2. Tag the image appropriately
3. Push to your container registry
4. Deploy using your orchestration platform (Kubernetes, ECS, etc.)

Example:

```bash
# Build for production
docker build -t myregistry.com/tactical-report-frontend:1.0.0 \
  --build-arg NEXT_PUBLIC_API_URL=https://api.production.com .

# Push to registry
docker push myregistry.com/tactical-report-frontend:1.0.0
```