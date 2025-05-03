#!/bin/bash

echo "🔧 Rebuilding application with drag-and-drop fixes..."

# Clean up node_modules (optional)
echo "🧹 Cleaning up node_modules/.cache..."
rm -rf node_modules/.cache

# Reinstall dependencies
echo "📦 Reinstalling dependencies..."
npm install --legacy-peer-deps

# If using Docker, rebuild the container
if [ -f "docker-compose.staging.yml" ]; then
  echo "🐳 Rebuilding Docker container..."
  docker-compose -f docker-compose.staging.yml down
  docker-compose -f docker-compose.staging.yml build --no-cache
  
  echo "🚀 Starting Docker container..."
  docker-compose -f docker-compose.staging.yml up -d
  
  echo "✅ Docker container rebuilt and started! Check logs with: docker-compose -f docker-compose.staging.yml logs -f"
else
  # Otherwise, restart the development server
  echo "🚀 Starting development server..."
  npm run dev
fi 