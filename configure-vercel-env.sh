#!/bin/bash

# Script pour configurer automatiquement les variables d'environnement sur Vercel
# Valeurs extraites de .env.local

set -e

echo "🚀 Configuration des variables d'environnement sur Vercel"
echo ""

# Vérifier la connexion
if ! npx vercel whoami &>/dev/null; then
    echo "⚠️  Vous devez d'abord vous connecter à Vercel"
    echo "   Exécutez: npx vercel login"
    exit 1
fi

echo "✅ Connecté à Vercel"
echo ""

# Variables depuis .env.local
GMAIL_USER="noreply.alvimmobilier.bzh@gmail.com"
GMAIL_APP_PASSWORD="qowgrmomraiiqpjf"
RECIPIENT_EMAIL="foveau16@gmail.com"
SMTP_FROM_NAME="ALV Immobilier"

# Fonction pour ajouter une variable
add_env_var() {
    local var_name=$1
    local var_value=$2
    local env=$3
    
    echo "  → $var_name ($env)"
    echo "$var_value" | npx vercel env add "$var_name" "$env" --yes 2>&1 | grep -v "NOTE:" || true
}

# Configurer pour chaque environnement
for env in production preview development; do
    echo "📦 Configuration pour: $env"
    add_env_var "GMAIL_USER" "$GMAIL_USER" "$env"
    add_env_var "GMAIL_APP_PASSWORD" "$GMAIL_APP_PASSWORD" "$env"
    add_env_var "RECIPIENT_EMAIL" "$RECIPIENT_EMAIL" "$env"
    add_env_var "SMTP_FROM_NAME" "$SMTP_FROM_NAME" "$env"
    echo ""
done

echo "✅ Toutes les variables ont été configurées !"
echo ""
echo "📌 Prochaine étape: Redéployez votre application"
echo "   Option 1: Via l'interface Vercel (Settings > Deployments > Redeploy)"
echo "   Option 2: Via la CLI: npx vercel --prod"
