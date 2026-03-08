#!/bin/bash
# Ce script lance le projet depuis un chemin SANS espaces pour éviter les 404.
# Cause identifiée : Next.js a des bugs avec les chemins contenant des espaces (ex: "CURSOR FR-ALV").

set -e
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TARGET_DIR="$HOME/FR-ALV"

echo "📁 Projet actuel : $PROJECT_ROOT"
echo "📁 Copie vers    : $TARGET_DIR (sans espaces)"
echo ""

# Copier le projet (exclure node_modules et .next pour aller plus vite)
echo "📋 Copie du projet..."
mkdir -p "$TARGET_DIR"
if command -v rsync &>/dev/null; then
  rsync -a --delete --exclude node_modules --exclude .next "$PROJECT_ROOT/" "$TARGET_DIR/"
else
  rm -rf "$TARGET_DIR"
  cp -R "$PROJECT_ROOT" "$TARGET_DIR"
  rm -rf "$TARGET_DIR/node_modules" "$TARGET_DIR/.next"
fi

echo ""
echo "▶️  Lancement depuis $TARGET_DIR"
echo ""

cd "$TARGET_DIR"
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
rm -rf .next
npm install --legacy-peer-deps
npm run build
npm run start
