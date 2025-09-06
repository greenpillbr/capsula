#!/bin/bash

# Capsula Android Build Script
# This script builds the Capsula wallet for Android deployment

set -e

echo "🚀 Starting Capsula Android Build Process..."

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "📦 Installing EAS CLI..."
    bun add -g @expo/eas-cli
fi

# Check if logged into Expo
echo "🔐 Checking Expo authentication..."
if ! eas whoami &> /dev/null; then
    echo "❌ Please login to Expo first:"
    echo "   eas login"
    exit 1
fi

# Environment check
echo "🔍 Checking environment..."
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please copy .env.example and configure:"
    echo "   cp .env.example .env"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
bun install

# Generate database schema
echo "🗄️ Generating database schema..."
bun run db:generate

# Code quality check
echo "✨ Running code formatting..."
bun run format

# Check Expo dependencies
echo "🔍 Checking Expo dependencies..."
bun run expo-check

# Build for development
echo "🛠️ Building development APK..."
eas build --platform android --profile development --local

# Build for preview
echo "📱 Building preview APK..."
eas build --platform android --profile preview --local

echo "✅ Build complete!"
echo ""
echo "📱 APK files generated:"
echo "   - Development build in ./android/app/build/outputs/apk/debug/"
echo "   - Preview build via EAS"
echo ""
echo "🔧 To install on device:"
echo "   adb install path/to/capsula.apk"
echo ""
echo "📖 See docs/development-workflow.md for testing instructions"