#!/bin/bash

# Script pour pousser vers GitHub avec un Personal Access Token
# Usage: ./push-with-token.sh VOTRE_TOKEN_GITHUB

if [ -z "$1" ]; then
    echo "❌ Usage: ./push-with-token.sh VOTRE_TOKEN_GITHUB"
    echo ""
    echo "Pour créer un token GitHub:"
    echo "1. Allez sur https://github.com/settings/tokens"
    echo "2. Cliquez sur 'Generate new token (classic)'"
    echo "3. Donnez-lui un nom (ex: 'Vercel Deploy')"
    echo "4. Cochez la permission 'repo' (accès complet aux repositories)"
    echo "5. Cliquez sur 'Generate token'"
    echo "6. Copiez le token et utilisez-le avec ce script"
    exit 1
fi

TOKEN=$1
REPO_URL="https://github.com/elfovo/ALV-IMMO.git"

echo "🚀 Push vers GitHub avec token..."

# Modifier temporairement l'URL du remote pour inclure le token
git remote set-url origin "https://${TOKEN}@github.com/elfovo/ALV-IMMO.git"

# Pousser
git push origin main

# Restaurer l'URL originale (sans token)
git remote set-url origin "https://github.com/elfovo/ALV-IMMO.git"

echo "✅ Terminé !"
