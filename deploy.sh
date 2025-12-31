#!/bin/bash

echo "🚀 Deploy a GitHub Pages"
echo ""

# Verificar repositorio remoto
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ Error: No hay repositorio remoto configurado"
    echo "Configura primero: git remote add origin https://github.com/USER/REPO.git"
    exit 1
fi

echo "📦 Building..."
yarn build && echo "✅ Build OK" || { echo "❌ Build failed"; exit 1; }

echo "🚀 Deploying..."
yarn deploy && echo "✅ Deploy OK - Disponible en https://fedeg.github.io/al_horno_con_papa" || echo "❌ Deploy failed"
