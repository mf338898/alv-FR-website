# Commandes pour configurer Vercel automatiquement

## Option 1 : Script automatique (recommandé)

1. Connectez-vous d'abord à Vercel :
```bash
npx vercel login
```

2. Exécutez le script :
```bash
./configure-vercel-env.sh
```

## Option 2 : Commandes manuelles

Si vous préférez exécuter les commandes une par une :

### 1. Se connecter à Vercel
```bash
npx vercel login
```

### 2. Configurer les variables pour Production

```bash
echo "noreply.alvimmobilier.bzh@gmail.com" | npx vercel env add GMAIL_USER production
echo "qowgrmomraiiqpjf" | npx vercel env add GMAIL_APP_PASSWORD production
echo "foveau16@gmail.com" | npx vercel env add RECIPIENT_EMAIL production
echo "ALV Immobilier" | npx vercel env add SMTP_FROM_NAME production
```

### 3. Configurer les variables pour Preview

```bash
echo "noreply.alvimmobilier.bzh@gmail.com" | npx vercel env add GMAIL_USER preview
echo "qowgrmomraiiqpjf" | npx vercel env add GMAIL_APP_PASSWORD preview
echo "foveau16@gmail.com" | npx vercel env add RECIPIENT_EMAIL preview
echo "ALV Immobilier" | npx vercel env add SMTP_FROM_NAME preview
```

### 4. Configurer les variables pour Development

```bash
echo "noreply.alvimmobilier.bzh@gmail.com" | npx vercel env add GMAIL_USER development
echo "qowgrmomraiiqpjf" | npx vercel env add GMAIL_APP_PASSWORD development
echo "foveau16@gmail.com" | npx vercel env add RECIPIENT_EMAIL development
echo "ALV Immobilier" | npx vercel env add SMTP_FROM_NAME development
```

### 5. Redéployer l'application

```bash
npx vercel --prod
```

## Variables configurées

- **GMAIL_USER**: `noreply.alvimmobilier.bzh@gmail.com`
- **GMAIL_APP_PASSWORD**: `qowgrmomraiiqpjf`
- **RECIPIENT_EMAIL**: `foveau16@gmail.com`
- **SMTP_FROM_NAME**: `ALV Immobilier`
