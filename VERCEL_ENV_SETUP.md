# Configuration des variables d'environnement sur Vercel

Ce document explique comment configurer les variables d'environnement nécessaires pour l'envoi d'emails sur Vercel.

## Variables d'environnement requises

### Configuration SMTP (obligatoire)

Pour que l'envoi d'emails fonctionne, vous devez configurer les variables suivantes dans Vercel :

#### Option 1 : Configuration Gmail (recommandée)

Si vous utilisez Gmail, vous pouvez utiliser ces variables :

- **`GMAIL_USER`** : Votre adresse email Gmail (ex: `votre-email@gmail.com`)
- **`GMAIL_APP_PASSWORD`** : Mot de passe d'application Gmail (voir section ci-dessous)
- **`RECIPIENT_EMAIL`** : Email destinataire (ex: `contact@alvimobilier.bzh`)

> **Note** : Si vous utilisez `GMAIL_USER`, les variables `SMTP_HOST` et `SMTP_PORT` sont automatiquement détectées.

#### Option 2 : Configuration SMTP générique

Si vous utilisez un autre fournisseur SMTP :

- **`SMTP_USER`** : Adresse email pour l'envoi
- **`SMTP_PASS`** : Mot de passe SMTP
- **`SMTP_HOST`** : Serveur SMTP (ex: `smtp.gmail.com`)
- **`SMTP_PORT`** : Port SMTP (ex: `465` pour SSL, `587` pour TLS)
- **`RECIPIENT_EMAIL`** : Email destinataire (ex: `contact@alvimobilier.bzh`)

### Variables optionnelles

- **`SMTP_FROM_NAME`** : Nom de l'expéditeur (par défaut: `ALV Immobilier - noreply`)

## Comment obtenir un mot de passe d'application Gmail

1. Allez sur votre compte Google : https://myaccount.google.com/
2. Activez la validation en deux étapes si ce n'est pas déjà fait
3. Allez dans **Sécurité** > **Validation en deux étapes**
4. Faites défiler jusqu'à **Mots de passe des applications**
5. Sélectionnez **Autre (nom personnalisé)** et entrez "ALV Immobilier"
6. Cliquez sur **Générer**
7. Copiez le mot de passe généré (16 caractères) - vous ne pourrez plus le voir après
8. Utilisez ce mot de passe comme valeur pour `GMAIL_APP_PASSWORD`

## Configuration sur Vercel

### Via l'interface web

1. Connectez-vous à votre projet sur [Vercel](https://vercel.com)
2. Allez dans **Settings** > **Environment Variables**
3. Ajoutez chaque variable d'environnement :
   - Cliquez sur **Add New**
   - Entrez le nom de la variable (ex: `GMAIL_USER`)
   - Entrez la valeur
   - Sélectionnez les environnements (Production, Preview, Development)
   - Cliquez sur **Save**

### Via la CLI Vercel

```bash
# Installer la CLI Vercel si ce n'est pas déjà fait
npm i -g vercel

# Se connecter
vercel login

# Ajouter les variables d'environnement
vercel env add GMAIL_USER production
vercel env add GMAIL_APP_PASSWORD production
vercel env add RECIPIENT_EMAIL production

# Ou pour tous les environnements
vercel env add GMAIL_USER
vercel env add GMAIL_APP_PASSWORD
vercel env add RECIPIENT_EMAIL
```

## Variables à configurer (exemple complet)

```
GMAIL_USER=votre-email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
RECIPIENT_EMAIL=contact@alvimobilier.bzh
SMTP_FROM_NAME=ALV Immobilier
```

## Vérification de la configuration

Après avoir configuré les variables d'environnement :

1. Redéployez votre application sur Vercel
2. Testez l'envoi d'un formulaire
3. Si l'envoi échoue, vérifiez les logs Vercel pour voir les erreurs détaillées

## Dépannage

### L'email n'est pas envoyé

1. Vérifiez que toutes les variables d'environnement sont bien configurées dans Vercel
2. Vérifiez que le mot de passe d'application Gmail est correct
3. Vérifiez les logs Vercel pour voir les erreurs détaillées
4. Assurez-vous que la validation en deux étapes est activée sur votre compte Gmail

### Erreur "SMTP not configured"

Cela signifie que les variables d'environnement SMTP ne sont pas correctement configurées. Vérifiez que :
- `GMAIL_USER` ou `SMTP_USER` est défini
- `GMAIL_APP_PASSWORD` ou `SMTP_PASS` est défini
- Les valeurs sont correctes (pas d'espaces en début/fin)

### Erreur "SMTP verify error"

Cela signifie que la connexion au serveur SMTP échoue. Vérifiez que :
- Le mot de passe d'application est correct
- Le compte Gmail n'a pas de restrictions de sécurité
- Les variables `SMTP_HOST` et `SMTP_PORT` sont correctes si vous n'utilisez pas Gmail

## Sécurité

- **Ne commitez jamais** les variables d'environnement dans le code
- Utilisez des mots de passe d'application plutôt que votre mot de passe principal
- Limitez l'accès aux variables d'environnement dans Vercel aux personnes autorisées
- En production, utilisez `contact@alvimobilier.bzh` comme `RECIPIENT_EMAIL`
