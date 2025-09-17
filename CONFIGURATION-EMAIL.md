# 📧 Configuration Email - ALV Formulaires

## 🚨 **Problème actuel**
L'envoi d'email ne fonctionne pas car il manque la configuration SMTP.

## 🔧 **Solution : Configuration Gmail**

### **Étape 1 : Créer un fichier `.env.local`**
Créez un fichier `.env.local` à la racine du projet avec ce contenu :

```bash
# Configuration Gmail pour l'envoi d'emails
GMAIL_USER=contact@alvimobilier.bzh
GMAIL_APP_PASSWORD=votre-mot-de-passe-app-gmail
TEST_EMAIL=test@example.com
RECIPIENT_EMAIL=contact@alvimobilier.bzh
```

### **Étape 2 : Configurer Gmail**

1. **Aller dans Google Account** : https://myaccount.google.com/
2. **Sécurité** → **Validation en 2 étapes** (activer si pas déjà fait)
3. **Mots de passe d'application** → **Générer un mot de passe**
4. **Sélectionner "Mail"** → **Générer**
5. **Copier le mot de passe généré** (16 caractères)
6. **Remplacer `votre-mot-de-passe-app-gmail`** dans `.env.local`

### **Étape 3 : Redémarrer le serveur**
```bash
npm run dev
```

### **Étape 4 : Tester la configuration**
```bash
curl -X GET http://localhost:3000/api/smtp-debug
```

## 🧪 **Test d'envoi d'email**

Une fois configuré, vous pouvez tester avec :
```bash
curl -X POST http://localhost:3000/api/test-email-send \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Test","message":"Test email"}'
```

## 📋 **Variables d'environnement disponibles**

- `GMAIL_USER` : Email Gmail de l'agence
- `GMAIL_APP_PASSWORD` : Mot de passe d'application Gmail
- `SMTP_HOST` : Serveur SMTP (auto-détecté pour Gmail)
- `SMTP_PORT` : Port SMTP (auto-détecté pour Gmail)
- `SMTP_USER` : Alternative à GMAIL_USER
- `SMTP_PASS` : Alternative à GMAIL_APP_PASSWORD
- `SMTP_FROM_NAME` : Nom d'expéditeur (défaut: "ALV Immobilier - noreply")

## ⚠️ **Important**
- Ne jamais commiter le fichier `.env.local` (déjà dans .gitignore)
- Utiliser un mot de passe d'application, pas le mot de passe normal Gmail
- Le fichier `.env.local` est prioritaire sur `.env`

## 🚀 **Déploiement Vercel**
Pour Vercel, ajoutez ces variables dans le dashboard Vercel :
- `GMAIL_USER`
- `GMAIL_APP_PASSWORD`
- `RECIPIENT_EMAIL`
