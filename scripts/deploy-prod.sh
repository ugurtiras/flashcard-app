#!/bin/bash

# Production Deployment Script for Flashcard App on EC2
# Usage: ./scripts/deploy-prod.sh

set -e

echo "=== Flashcard App Production Deployment ==="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Install Docker first:${NC}"
    echo "curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed. Install Docker Compose first:${NC}"
    echo "sudo curl -L https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m) -o /usr/local/bin/docker-compose && sudo chmod +x /usr/local/bin/docker-compose"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}.env file not found. Creating from .env.prod.example${NC}"
    if [ -f .env.prod.example ]; then
        cp .env.prod.example .env
        echo -e "${YELLOW}Created .env from .env.prod.example. Please edit it with your actual values:${NC}"
        echo "nano .env"
        exit 1
    else
        echo -e "${RED}No .env.prod.example found. Cannot proceed.${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✓ Docker and Docker Compose found${NC}"
echo -e "${GREEN}✓ .env file exists${NC}"

# Pull latest images from Docker Hub
echo -e "${YELLOW}Pulling latest images from Docker Hub...${NC}"

DOCKERHUB_USERNAME=$(grep "DOCKERHUB_USERNAME" .env | cut -d '=' -f2)

if [ -z "$DOCKERHUB_USERNAME" ]; then
    echo -e "${RED}DOCKERHUB_USERNAME not set in .env${NC}"
    exit 1
fi

docker pull "$DOCKERHUB_USERNAME/flashcard-backend:latest"
docker pull "$DOCKERHUB_USERNAME/flashcard-frontend:latest"

echo -e "${GREEN}✓ Images pulled successfully${NC}"

# Stop and remove old containers
echo -e "${YELLOW}Stopping existing containers...${NC}"
docker-compose -f docker-compose.prod.yml down || true

echo -e "${GREEN}✓ Old containers removed${NC}"

# Start new containers
echo -e "${YELLOW}Starting new containers...${NC}"
docker-compose -f docker-compose.prod.yml up -d

# Wait for backend to be healthy
echo -e "${YELLOW}Waiting for backend to be healthy...${NC}"
max_attempts=10
attempt=1
while [ $attempt -le $max_attempts ]; do
    if curl -f http://localhost:5000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Backend is healthy${NC}"
        break
    fi
    echo "Attempt $attempt/$max_attempts - Backend not ready yet..."
    sleep 5
    ((attempt++))
done

if [ $attempt -gt $max_attempts ]; then
    echo -e "${RED}Backend failed to become healthy. Check logs:${NC}"
    docker-compose -f docker-compose.prod.yml logs backend
    exit 1
fi

# Check container status
echo -e "${YELLOW}Container status:${NC}"
docker-compose -f docker-compose.prod.yml ps

echo -e "${GREEN}=== Deployment Successful ===${NC}"
echo -e "${GREEN}Frontend: http://localhost:80${NC}"
echo -e "${GREEN}Backend API: http://localhost:5000${NC}"
echo ""
echo "To view logs:"
echo "  docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "To stop containers:"
echo "  docker-compose -f docker-compose.prod.yml down"
