[62 tools called]

Voici le contenu proposé pour `.cursor/context.md` (basé uniquement sur le code actuel).

## .cursor/context.md

### 1. Design system réel
- Palette via CSS vars neutres (background/foreground, card, accent, destructive, sidebar) et radius `0.5rem`; thème dark prévu.
- Couleurs brand supplémentaires `alv.blue #005A9C`, `alv.green #4CAF50`; gradients bleu/indigo/purple/emerald sur la home et les CTA.
- Typographies : Geist Sans + Geist Mono injectées globalement; Tailwind hérite via `--font-sans` / `--font-mono`.
- Tailwind shadcn (baseColor neutral), radius mappé sur vars; animations `accordion-*`, spacing `safe` pour notch.
- UI shadcn par défaut (Button, Card, Input, Select, etc.) avec variantes `default/outline/ghost/link` et tailles `sm/lg/icon`; badges arrondis.
```11:47:app/globals.css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  ...
  --radius: 0.5rem;
}
```
```26:45:app/layout.tsx
<html lang="en">
  <head>
    <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
    `}</style>
  </head>
  <body>
    {children}
    <Toaster position="top-right" expand richColors closeButton />
  </body>
</html>
```
```66:70:tailwind.config.ts
alv: {
  blue: "#005A9C",
  green: "#4CAF50",
}
```

### 2. Structure exacte du site (App Router)
- `/` : landing ALV (header sticky, cartes profils : Locataire / Garant activés, Propriétaire/Acquéreur/Vendeur en disabled, bloc confiance, footer légal + coordonnées).
- `/locataire/formulaire` : formulaire multi-locataires, sections Bien concerné, Locataires, Critères (optionnel), Garanties (optionnel), actions envoyer + ajout locataire, overlay succès/chargement.
- `/garant/formulaire` : formulaire multi-garants + locataire concerné, validations équivalentes, overlay envoi.
- `/vendeur/formulaire` : très détaillé, choix type vendeur (personne, couple, indivision, société, EI, association, personne morale, mineur, majeur protégé, autre), sections ModernFormSection par cas, validations par type.
- `/locataire/layout.tsx` (container simple), `app/not-found.tsx` fallback minimal.
- API routes : `/api/generer-pdf-locataire`, `/api/generer-pdf-garant`, `/api/generer-pdf-vendeur`, `/api/generer-pdf` (stub) pour génération PDF/CSV + email.

### 3. Composants définis
- UI shadcn : `components/ui/*` (button, card, badge, input, select, textarea, dropdown-menu, dialog, popover, tooltip, alert-dialog, calendar, etc.).
- Thème : `components/theme-provider.tsx` (next-themes wrapper).
- Navigation & steps : `modern-step-navigation`, `segmented-progress`, `step-navigation`, `step-button`, `step-transition`.
- Form scaffolding : `modern-form-section` (+ ModernFormField/Actions), `form-section`, `form-field`, `form-header`.
- Domain cards : `locataire-card`, `garant-card`, `criteres-recherche-card`, `garanties-card`.
- Inputs avancés : `address-autocomplete`, `city-autocomplete`, `date-picker`.
- Feedback : `loading-overlay` (progress + succès), `error-message` (banner dismissable).
- Misc : `form-header` (header/logo/contact), `step-button`, `modern-step-navigation`.

### 4. Règles de cohérence UI/UX déjà présentes
- Champs obligatoires contrôlés via tableaux `requiredFields`; erreurs affichées (badge/points rouges) et toast `sonner`; scroll sur premier champ manquant.
- Boutons d’ajout/suppression avec confirmations (AlertDialog) pour locataires/garants; badges “Complet / À compléter”.
- Sections facultatives explicitement taguées (badge “Facultatif”) et toggles (ex. critères de recherche).
- Overlay de soumission (`LoadingOverlay`) avec étapes et état succès; retour accueil proposé.
- Autoremplissage de test (`handleAutofill`) basé sur `lib/test-data` pour vérifier PDF/CSV.
- Étapes et progression visuelle (barres segmentées + navigation mobile/desktop).
- Focus/hover states cohérents (rings Tailwind, gradients sur CTA, backgrounds pastel pour cartes).

### 5. Pratiques de code observées
- Next.js App Router, pages client pour formulaires, TypeScript strict avec alias `@/`.
- shadcn + Radix pour UI; Tailwind utilities intensives; framer-motion non utilisé ici.
- Gestion de données : types centralisés (`lib/types.ts`), données de test (`lib/test-data.ts`), utilitaires `cn`, logger JSON.
- Génération PDF avec pdf-lib : fichiers dédiés locataire/garant/vendeur/recherche (mise en page A4, wrappers de texte, couleurs brand, footers).
- Génération CSV lead ImmoFacile/AC3 (`lib/csv-generator.ts`) + nommage sécurisé.
- Emails via `lib/mail.ts` (SMTP auto-détection Gmail), templates HTML/texte (`lib/email-templates.ts`), attachements PDF/CSV; log structuré avec `logger`.
- Scripts NPM pré-build/maintenance (scripts/*.sh) et commandes Next standard.

### 6. Conventions de nommage
- Fichiers composants en kebab-case (`locataire-card.tsx`), composants React en PascalCase, hooks/props en camelCase.
- Champs métier en français (`typeContrat`, `bienConcerne`, `garantieVisale`, `nombreEnfantsFoyer`).
- Ids de champs préfixés (`field-${prefix}`) pour scroll/validation; préfixes `locataire_${i}_`, `garant_${i}_`, `criteres_`, `garanties_`.
- Types et interfaces en PascalCase (`Locataire`, `Garanties`, `AppFormData`).
- PDF/CSV filenames construits à partir des noms/prénoms, nettoyés pour filesystem.

### 7. Règles à toujours respecter pour futures modifications
- Respecter la palette existante (vars Tailwind + `alv.blue/green`) et les typos Geist; ne pas introduire d’autres fontes ou couleurs brand sans décision explicite.
- Conserver les variantes/tailles shadcn existantes et les states (focus ring, disabled opacity) sur nouveaux boutons/inputs.
- Quand vous ajoutez un champ obligatoire, mettez à jour les tableaux `requiredFields` + validations + ids `field-*` pour le scroll (locataire/garant/vendeur).
- Préserver l’autoremplissage de test (`createTest*`) et la cohérence des structures `AppFormData` / `GarantFormData` / vendor state avant de changer les APIs.
- Ne changez pas la structure des emails/PDF/CSV (formats attendus par l’agence et CRM) sans validation : attachments, sujets, destinataires CC sont déjà cadrés.
- Garder le logger pour toute nouvelle route API (traçabilité) et ne pas supprimer le support SMTP fallback; éviter de casser les envois si SMTP absent (comportement actuel : log + succès partiel).
- Conserver les patterns UI/UX : sections facultatives marquées, badges “Complet/À compléter”, overlays de soumission, navigation step responsive.

#### Références clés
```121:151:app/locataire/formulaire/page.tsx
const requiredFields: (keyof Locataire)[] = [
  "nom",
  "prenom",
  "civilite",
  "dateNaissance",
  "lieuNaissance",
  "adresseActuelle",
  "telephone",
  "email",
  "typeContrat"
]
const computeMissingPaths = () => { ... }
```
```171:224:components/segmented-progress.tsx
<div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
  <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-500 to-emerald-600" ... />
  <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-blue-600" ... />
</div>
```
```14:75:components/loading-overlay.tsx
<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm">
  <div className="... rounded-2xl ...">
    <Image src="/images/logo-alv-2.jpg" ... />
    ...
    <div className="h-full bg-gradient-to-r from-emerald-500 to-blue-500" style={{ width: `${progress}%` }} />
  </div>
</div>
```