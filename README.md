# 🏠 ALV Formulaires - Application de gestion immobilière

Application Next.js moderne pour la gestion des formulaires de garant et locataire pour ALV Immobilier.

## ✨ Fonctionnalités

### 📋 Formulaires intelligents
- **Formulaire Garant** : Interface "papier PDF" avec validation en temps réel
- **Formulaire Locataire** : Gestion complète des candidatures locatives
- **Composants réutilisables** : FormField, FormSection, Cards spécialisées
- **Validation automatique** : Indicateurs visuels de progression

### 📄 Génération PDF automatique
- **PDF Garant** : Formulaire complet avec toutes les informations
- **PDF Locataire** : Dossier de candidature professionnel
- **PDF Critères** : Fiche de recherche personnalisée
- **Génération dynamique** : Basée sur les données du formulaire

### 📧 Système d'email professionnel
- **Templates HTML** : Emails stylés et responsives
- **Configuration SMTP** : Support Gmail avec App Password
- **Pièces jointes** : PDFs automatiquement attachés
- **Notifications** : Confirmation d'envoi avec suivi

### 🎨 Interface utilisateur moderne
- **Design responsive** : Mobile, tablette, desktop
- **Support Dynamic Island** : iPhone optimisé
- **Thème cohérent** : Couleurs ALV Immobilier
- **Animations fluides** : Transitions et micro-interactions

## 🚀 Installation et démarrage

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Compte Gmail avec App Password (pour l'envoi d'emails)

### Installation
```bash
# Cloner le repository
git clone https://github.com/elfovo/alv.git
cd alv

# Installer les dépendances
npm install

# Configuration des variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos paramètres Gmail
```

### Configuration email
```bash
# .env.local
GMAIL_USER=votre-email@gmail.com
GMAIL_APP_PASSWORD=votre-app-password
RECIPIENT_EMAIL=foveau16@gmail.com  # tests; passer à contact@alvimmobilier.bzh en prod
SMTP_FROM_NAME=ALV Immobilier
```

### Démarrage
```bash
# Mode développement
npm run dev

# Build de production
npm run build
npm start
```

## 📁 Structure du projet

```
alv/
├── app/                          # App Router Next.js
│   ├── api/                      # API Routes
│   │   ├── generer-pdf-garant/   # Génération PDF garant
│   │   └── generer-pdf-locataire/# Génération PDF locataire
│   ├── garant/formulaire/        # Formulaire garant
│   ├── locataire/formulaire/     # Formulaire locataire
│   └── page.tsx                  # Page d'accueil
├── components/                   # Composants React
│   ├── ui/                      # Composants UI de base
│   ├── form-field.tsx           # Champ de formulaire réutilisable
│   ├── form-section.tsx         # Section de formulaire
│   ├── garant-card.tsx          # Carte garant
│   └── locataire-card.tsx       # Carte locataire
├── lib/                         # Utilitaires et logique métier
│   ├── email-templates.ts       # Templates d'email
│   ├── mail.ts                 # Configuration SMTP
│   ├── pdf-*-generator.ts      # Générateurs PDF
│   └── types.ts                # Types TypeScript
├── scripts/                     # Scripts de maintenance
└── public/images/              # Assets statiques
```

## 🛠️ Scripts disponibles

```bash
npm run dev          # Démarrage développement
npm run build        # Build de production
npm run start        # Démarrage production
npm run lint         # Linting ESLint
npm run clean        # Nettoyage cache
npm run fresh        # Reset complet + rebuild
npm run health       # Vérification santé app
npm run maintenance  # Maintenance cache
```

## 🔧 Technologies utilisées

- **Framework** : Next.js 15 (App Router)
- **Langage** : TypeScript
- **Styling** : Tailwind CSS
- **UI Components** : Radix UI + Shadcn/ui
- **PDF Generation** : pdf-lib
- **Email** : Nodemailer
- **Icons** : Lucide React
- **Animations** : Framer Motion

## 📱 Responsive Design

- **Mobile First** : Optimisé pour smartphones
- **Tablette** : Adaptation fluide des layouts
- **Desktop** : Interface complète avec toutes les fonctionnalités
- **Dynamic Island** : Support iPhone avec safe areas

## 🚀 Déploiement

### GitHub Pages
```bash
npm run deploy:gh-pages
```

### Build de production
```bash
npm run build:production
```

## 📞 Support

Pour toute question ou problème :
- **Email** : contact@alvimobilier.bzh
- **Repository** : https://github.com/elfovo/alv

## 📄 Licence

Projet privé - ALV Immobilier © 2025
