#!/bin/bash

echo "=== Build Environment Debug ==="
echo "Date: $(date)"
echo "Working Directory: $(pwd)"
echo "Node.js Version: $(node --version)"
echo "NPM Version: $(npm --version)"
echo ""

echo "=== Package.json Contents ==="
cat package.json
echo ""

echo "=== Package-lock.json exists? ==="
if [ -f "package-lock.json" ]; then
    echo "✅ package-lock.json exists"
    echo "Lock file version: $(head -n 10 package-lock.json | grep lockfileVersion)"
else
    echo "❌ package-lock.json missing"
fi
echo ""

echo "=== Installing Dependencies ==="
npm ci --verbose
echo ""

echo "=== Verifying Next.js Installation ==="
if command -v npx &> /dev/null; then
    echo "✅ npx is available"
    npx next --version
else
    echo "❌ npx not found"
fi

if [ -f "node_modules/.bin/next" ]; then
    echo "✅ Next.js binary exists"
    ./node_modules/.bin/next --version
else
    echo "❌ Next.js binary not found"
fi
echo ""

echo "=== Node Modules Structure ==="
ls -la node_modules/ | head -20
echo ""

echo "=== Build Process ==="
npm run build