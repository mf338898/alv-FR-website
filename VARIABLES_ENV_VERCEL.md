# Variables d'environnement à configurer sur Vercel

## Configuration minimale requise (Gmail)

Voici exactement ce que vous devez mettre dans les variables d'environnement sur Vercel :

### 1. GMAIL_USER
**Nom de la variable :** `GMAIL_USER`  
**Valeur :** Votre adresse email Gmail complète  
**Exemple :** `foveau16@gmail.com`

### 2. GMAIL_APP_PASSWORD
**Nom de la variable :** `GMAIL_APP_PASSWORD`  
**Valeur :** Le mot de passe d'application Gmail (16 caractères, avec ou sans espaces)  
**Exemple :** `abcd efgh ijkl mnop` ou `abcdefghijklmnop`

> **Comment obtenir le mot de passe d'application :**
> 1. Allez sur https://myaccount.google.com/
> 2. Sécurité > Validation en deux étapes (doit être activée)
> 3. Mots de passe des applications
> 4. Sélectionnez "Autre (nom personnalisé)" → entrez "ALV Immobilier"
> 5. Cliquez "Générer"
> 6. Copiez le mot de passe de 16 caractères affiché

### 3. RECIPIENT_EMAIL
**Nom de la variable :** `RECIPIENT_EMAIL`  
**Valeur :** L'email où seront envoyés tous les formulaires  
**Exemple :** `contact@alvimobilier.bzh`

### 4. SMTP_FROM_NAME (optionnel)
**Nom de la variable :** `SMTP_FROM_NAME`  
**Valeur :** Le nom qui apparaîtra comme expéditeur  
**Exemple :** `ALV Immobilier`

---

## Résumé : Ce que vous devez faire sur Vercel

1. Allez sur https://vercel.com → votre projet → **Settings** → **Environment Variables**

2. Ajoutez ces 3 variables (minimum) :

```
GMAIL_USER = foveau16@gmail.com
GMAIL_APP_PASSWORD = [votre mot de passe d'application de 16 caractères]
RECIPIENT_EMAIL = contact@alvimobilier.bzh
```

3. Optionnellement, ajoutez :

```
SMTP_FROM_NAME = ALV Immobilier
```

4. Sélectionnez **Production**, **Preview** et **Development** pour chaque variable

5. Cliquez sur **Save**

6. **Redéployez votre application** pour que les changements prennent effet

---

## Exemple de configuration complète

Si vous utilisez l'email `foveau16@gmail.com` et que vous voulez recevoir les formulaires sur `contact@alvimobilier.bzh`, voici ce que vous devez mettre :

| Variable | Valeur |
|----------|--------|
| `GMAIL_USER` | `foveau16@gmail.com` |
| `GMAIL_APP_PASSWORD` | `[votre mot de passe d'application]` |
| `RECIPIENT_EMAIL` | `contact@alvimobilier.bzh` |
| `SMTP_FROM_NAME` | `ALV Immobilier` |

---

## Important

- ⚠️ Le `GMAIL_APP_PASSWORD` est différent de votre mot de passe Gmail normal
- ⚠️ Vous devez avoir la validation en deux étapes activée sur Gmail
- ⚠️ Le mot de passe d'application ne peut être vu qu'une seule fois lors de sa création
- ⚠️ Si vous perdez le mot de passe, vous devrez en créer un nouveau

---

## Vérification

Après avoir configuré les variables et redéployé :

1. Testez l'envoi d'un formulaire
2. Si ça fonctionne, vous recevrez l'email avec le PDF en pièce jointe
3. Si ça ne fonctionne pas, vérifiez les logs Vercel pour voir l'erreur exacte
