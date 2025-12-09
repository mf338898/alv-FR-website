#!/bin/bash

# Script pour configurer les variables d'environnement sur Vercel
# Les valeurs sont extraites de .env.local

echo "🔧 Configuration des variables d'environnement sur Vercel..."
echo ""

# Vérifier si l'utilisateur est connecté à Vercel
if ! npx vercel whoami &>/dev/null; then
    echo "❌ Vous n'êtes pas connecté à Vercel."
    echo "📝 Exécutez d'abord: npx vercel login"
    exit 1
fi

echo "✅ Connecté à Vercel"
echo ""

# Variables à configurer (valeurs depuis .env.local)
GMAIL_USER="noreply.alvimmobilier.bzh@gmail.com"
GMAIL_APP_PASSWORD="qowgrmomraiiqpjf"
RECIPIENT_EMAIL="foveau16@gmail.com"
SMTP_FROM_NAME="ALV Immobilier"

echo "📝 Configuration des variables pour Production, Preview et Development..."
echo ""

# Configurer pour tous les environnements
for env in production preview development; do
    echo "🔹 Configuration pour l'environnement: $env"
    
    echo "  - GMAIL_USER"
    echo "$GMAIL_USER" | npx vercel env add GMAIL_USER $env
    
    echo "  - GMAIL_APP_PASSWORD"
    echo "$GMAIL_APP_PASSWORD" | npx vercel env add GMAIL_APP_PASSWORD $env
    
    echo "  - RECIPIENT_EMAIL"
    echo "$RECIPIENT_EMAIL" | npx vercel env add RECIPIENT_EMAIL $env
    
    echo "  - SMTP_FROM_NAME"
    echo "$SMTP_FROM_NAME" | npx vercel env add SMTP_FROM_NAME $env
    
    echo ""
done

echo "✅ Configuration terminée !"
echo ""
echo "📌 N'oubliez pas de redéployer votre application pour que les changements prennent effet."
echo "   Vous pouvez le faire depuis l'interface Vercel ou avec: npx vercel --prod"
