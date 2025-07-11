#!/bin/bash

# Farcaster Miniapp Deployment Script
# This script builds and prepares the miniapp for deployment

echo "🚀 Starting Farcaster Miniapp deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Error: Build failed. dist directory not found."
    exit 1
fi

# Create .well-known directory in dist
echo "📁 Creating .well-known directory..."
mkdir -p dist/.well-known

# Copy manifest file
echo "📄 Copying Farcaster manifest..."
cp public/.well-known/farcaster.json dist/.well-known/

# Copy icon
echo "🎨 Copying icon..."
cp public/icon.svg dist/

# Copy manifest
echo "📋 Copying PWA manifest..."
cp public/manifest.json dist/

# Create deployment info
echo "📋 Creating deployment info..."
cat > dist/DEPLOYMENT.md << EOF
# Farcaster Miniapp - Spinning Money

## Deployment Information

- **App Name**: Spinning Money
- **Version**: 1.0.0
- **Contract**: 0x501434B1eAa8A85dBAb5D6d933F2f22cb10e6253
- **Chain**: Base Mainnet
- **Domain**: farcmoney.com

## Files to Deploy

1. All files in \`dist/\` directory
2. Ensure \`.well-known/farcaster.json\` is accessible
3. Ensure \`icon.svg\` is accessible

## Domain Setup

1. Point your domain to the hosting provider
2. Ensure HTTPS is enabled
3. Verify manifest is accessible at: \`https://yourdomain.com/.well-known/farcaster.json\`
4. Verify icon is accessible at: \`https://yourdomain.com/icon.svg\`

## Testing

1. Test the app in Farcaster app
2. Verify wallet connection works
3. Test spin functionality
4. Verify real-time events work

## Support

For issues or questions, contact the development team.
EOF

echo "✅ Build completed successfully!"
echo "📁 Files ready in dist/ directory"
echo "🌐 Deploy the contents of dist/ to your hosting provider"
echo "📋 See dist/DEPLOYMENT.md for deployment instructions"

# Optional: Show file sizes
echo ""
echo "📊 Build Statistics:"
du -sh dist/
echo ""
echo "📄 Key files:"
ls -la dist/.well-known/
ls -la dist/icon.svg 