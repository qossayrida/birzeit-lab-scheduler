#!/bin/bash

# Birzeit Lab Scheduler - Setup Script
# This script helps you get started quickly

set -e

echo "🎓 Birzeit Lab Scheduler - Setup"
echo "================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher"
    echo "Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✅ npm $(npm -v) detected"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Dependencies installed successfully!"
echo ""

# Ask about development or production
echo "What would you like to do?"
echo "1) Start development server"
echo "2) Build for production"
echo "3) Run tests"
echo "4) Exit"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Starting development server..."
        echo "Visit http://localhost:5173 when ready"
        echo ""
        npm run dev
        ;;
    2)
        echo ""
        echo "🏗️  Building for production..."
        npm run build
        echo ""
        echo "✅ Build complete! Files are in ./dist"
        echo ""
        read -p "Preview the build? (y/n): " preview
        if [ "$preview" = "y" ]; then
            npm run preview
        fi
        ;;
    3)
        echo ""
        echo "🧪 Running tests..."
        npm test
        ;;
    4)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac
