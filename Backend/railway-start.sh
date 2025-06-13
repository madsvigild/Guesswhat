#!/bin/bash

# Script to set up environment for Railway deployment

# Set the DATABASE_URL for Railway deployment
echo "Setting DATABASE_URL for Railway deployment..."
export DATABASE_URL="postgresql://postgres:QbdHbHphrBGSQiQnYToHYxHBdipNxFOX@postgres.railway.internal:5432/railway"

# Run the server
echo "Starting the server with Railway database connection..."
node src/app.js