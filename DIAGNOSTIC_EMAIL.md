# Diagnostic des problèmes d'envoi d'email

## Test rapide de la configuration SMTP

### 1. Tester la configuration via l'API de diagnostic

Une fois le site redéployé, visitez cette URL pour tester la configuration SMTP :

```
https://votre-site.vercel.app/api/test-smtp
```

Cette route vous dira :
- Si les variables d'environnement sont configurées
- Si la connexion SMTP fonctionne
- Les détails de la configuration

### 2. Vérifier les logs Vercel

1. Allez sur https://vercel.com → votre projet
2. Cliquez sur **Deployments** → le dernier déploiement
3. Cliquez sur **Functions** → cherchez les logs des routes API
4. Cherchez les erreurs liées à `sendMail`, `SMTP`, ou `email`

### 3. Vérifier les variables d'environnement sur Vercel

1. Allez sur **Settings** → **Environment Variables**
2. Vérifiez que ces variables existent pour **Production** :
   - `GMAIL_USER` = `noreply.alvimmobilier.bzh@gmail.com`
   - `GMAIL_APP_PASSWORD` = `qowgrmomraiiqpjf`
   - `RECIPIENT_EMAIL` = `foveau16@gmail.com`
   - `SMTP_FROM_NAME` = `ALV Immobilier` (optionnel)

3. **Important** : Assurez-vous que les variables sont bien assignées à **Production** (pas seulement Preview ou Development)

### 4. Tester l'envoi d'un formulaire

1. Remplissez un formulaire (locataire, garant, etc.)
2. Soumettez-le
3. **Vérifiez la console du navigateur** (F12 → Console) pour voir les erreurs
4. **Vérifiez les logs Vercel** pour voir les erreurs côté serveur

## Erreurs courantes et solutions

### "SMTP not configured"

**Cause** : Les variables d'environnement ne sont pas définies ou mal nommées.

**Solution** :
- Vérifiez que `GMAIL_USER` et `GMAIL_APP_PASSWORD` sont bien configurées
- Vérifiez qu'elles sont assignées à l'environnement **Production**
- Redéployez l'application après avoir ajouté les variables

### "SMTP verify error"

**Cause** : La connexion au serveur SMTP échoue.

**Solutions possibles** :
1. Vérifiez que le mot de passe d'application Gmail est correct
2. Vérifiez que la validation en deux étapes est activée sur Gmail
3. Vérifiez que le compte Gmail n'a pas de restrictions de sécurité
4. Essayez de régénérer le mot de passe d'application

### L'email n'est pas envoyé mais aucune erreur n'est affichée

**Cause** : Le frontend ne gère pas correctement les erreurs HTTP.

**Solution** : 
- Vérifiez la console du navigateur (F12)
- Vérifiez les logs Vercel
- Le code a été amélioré pour mieux afficher les erreurs

## Commandes utiles

### Voir les variables d'environnement configurées

```bash
npx vercel env ls
```

### Tester la configuration localement

```bash
# Vérifier que .env.local contient les bonnes valeurs
cat .env.local

# Tester l'envoi d'email en local
npm run dev
# Puis remplir un formulaire et vérifier les logs
```

## Checklist de vérification

- [ ] Variables d'environnement configurées sur Vercel (Production)
- [ ] Application redéployée après configuration des variables
- [ ] Test de diagnostic SMTP accessible : `/api/test-smtp`
- [ ] Logs Vercel consultés pour voir les erreurs détaillées
- [ ] Console du navigateur vérifiée lors de l'envoi d'un formulaire
- [ ] Mot de passe d'application Gmail valide et récent
