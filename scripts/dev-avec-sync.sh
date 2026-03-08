#!/bin/bash
# Dev avec hot reload : sync automatique des modifs vers ~/FR-ALV (sans espaces) + serveur dev.

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TARGET_DIR="$HOME/FR-ALV"

echo "📁 Source (Cursor) : $PROJECT_ROOT"
echo "📁 Cible (serveur) : $TARGET_DIR"
echo ""

# Sync initial
echo "📋 Sync initial..."
mkdir -p "$TARGET_DIR"
if command -v rsync &>/dev/null; then
  rsync -a --delete --exclude node_modules --exclude .next "$PROJECT_ROOT/" "$TARGET_DIR/"
else
  rm -rf "$TARGET_DIR"
  cp -R "$PROJECT_ROOT" "$TARGET_DIR"
  rm -rf "$TARGET_DIR/node_modules" "$TARGET_DIR/.next"
fi

# Installer si besoin
if [ ! -d "$TARGET_DIR/node_modules" ]; then
  echo "📦 Installation des dépendances..."
  (cd "$TARGET_DIR" && npm install --legacy-peer-deps)
fi

# Nettoyer et lancer
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Lancer la sync en arrière-plan (toutes les 2 s)
SYNC_PID=""
if command -v rsync &>/dev/null; then
  echo "🔄 Sync automatique activée (modifs → serveur)"
  (
    while true; do
      sleep 2
      rsync -a --delete --exclude node_modules --exclude .next "$PROJECT_ROOT/" "$TARGET_DIR/" 2>/dev/null || true
    done
  ) &
  SYNC_PID=$!
else
  echo "⚠️  rsync non trouvé : pas de sync auto. Relance le script après chaque modif."
fi

# Arrêter la sync à la sortie
cleanup() {
  [ -n "$SYNC_PID" ] && kill $SYNC_PID 2>/dev/null || true
  exit 0
}
trap cleanup INT TERM

echo "▶️  Serveur dev sur http://localhost:3000"
echo "   (Modifie dans Cursor, la page se met à jour automatiquement)"
echo ""

cd "$TARGET_DIR"
npm run dev
