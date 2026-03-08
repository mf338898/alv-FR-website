# Démarrage du projet FR-ALV

## Problème identifié : chemin avec espaces

Le dossier **`CURSOR FR-ALV`** contient un **espace** dans son nom. Next.js a des bugs connus avec les chemins contenant des espaces ou caractères spéciaux, ce qui provoque des 404 sur toutes les routes.

## Solution : lancer depuis un chemin sans espaces

Une commande a été ajoutée pour copier le projet vers `~/FR-ALV` (sans espaces) et lancer le serveur depuis là.

### À faire (dans un Terminal macOS)

```bash
cd "/Users/matthisfoveau/CURSOR FR-ALV/FR-ALV"
npm run start:fix
```

La première fois, cela peut prendre 1 à 2 minutes (copie + `npm install` + build). Ensuite le serveur démarre sur **http://localhost:3000**.

Ouvre dans ton navigateur :
- http://localhost:3000/
- http://localhost:3000/accueil
- http://localhost:3000/locataire/formulaire

### Pour le développement (avec rechargement automatique)

Utilise **`npm run dev:fix`** au lieu de `start:fix` :

```bash
npm run dev:fix
```

Ce script :
- copie le projet vers `~/FR-ALV`
- synchronise automatiquement tes modifs toutes les 2 secondes
- lance le serveur de dev avec hot reload

Tu édites dans Cursor, la page se met à jour automatiquement dans le navigateur.

### Pour la production (sans hot reload)

`npm run start:fix` lance le serveur de production. Il faut le relancer après chaque modification.

### Alternative : renommer le dossier parent

Si tu préfères une solution définitive, ferme Cursor puis renomme le dossier :
- **Avant** : `CURSOR FR-ALV` (avec espace)
- **Après** : `CURSOR-FR-ALV` (avec tiret)

Puis rouvre le projet et lance normalement `npm run build && npm run start`.
