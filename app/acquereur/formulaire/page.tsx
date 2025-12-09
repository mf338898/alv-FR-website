"use client"

import { useMemo, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  AlertCircle,
  ArrowLeft,
  BadgeInfo,
  Building2,
  FileText,
  HandCoins,
  Home,
  Info,
  Sparkles,
  Shield,
  Tag,
  User,
  Users
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ModernFormField, ModernFormSection } from "@/components/modern-form-section"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoadingOverlay } from "@/components/loading-overlay"
import ErrorMessage from "@/components/error-message"
import { Copy } from "lucide-react"
import {
  buildTestAddress,
  buildTestDate,
  buildTestEmail,
  buildTestPhone,
  pickRandom,
  sampleCity,
  sampleCompany,
  sampleFirstName,
  sampleJob,
  sampleLastName
} from "@/lib/test-data"
import { CommuneAutocompleteInput } from "@/components/commune-autocomplete-input"
import { AddressAutocompleteField } from "@/components/address-autocomplete-field"
import { cn } from "@/lib/utils"

type OuiNon = "oui" | "non" | ""

type AcquereurType =
  | "personne_seule"
  | "couple_monsieur_madame"
  | "couple_monsieur_monsieur"
  | "couple_madame_madame"
  | "societe"
  | "entreprise_individuelle"
  | "association"
  | "personne_morale_autre"
  | "mineur"
  | "majeur_protege"
  | "indivision"
  | "autre"

type SituationMatrimoniale =
  | "marie_apres_1966"
  | "marie_avant_1966"
  | "separation_de_biens"
  | "communaute_universelle"
  | "participation_aux_acquets"
  | "communaute_acquets_contrat"
  | "autre_regime"
  | "changement_regime"
  | "pacs"
  | "celibataire"
  | "veuf"
  | "divorce"
  | "autre"

interface PersonneBuyer {
  civilite: "Monsieur" | "Madame" | ""
  nom: string
  prenom: string
  dateNaissance: string
  lieuNaissance: string
  nationalite: string
  adresse: string
  telephone: string
  email: string
  residenceFiscaleFrance: OuiNon
  residenceFiscalePays: string
  residenceFiscaleAdresse: string
  residenceFiscaleNumero: string
  situationMatrimoniale: SituationMatrimoniale | ""
  situationDetails: Record<string, string>
  representation: {
    seraPresent: OuiNon
    representantNom: string
    representantPrenom: string
    representantTelephone: string
    representantEmail: string
  }
  notaireDesigne: OuiNon
  notaireNom: string
  notaireVille: string
  precisions: string
}

interface SocieteSeller {
  denomination: string
  forme: string
  capital: string
  siege: string
  villeRcs: string
  numeroRcs: string
  telephone: string
  email: string
  representantType: "monsieur" | "madame" | "societe" | "autre" | ""
  representantPhysique: {
    nom: string
    prenom: string
    fonction: string
    pouvoirs: string
    telephone: string
    email: string
  }
  representantSociete: {
    denomination: string
    forme: string
    capital: string
    siege: string
    villeRcs: string
    numeroRcs: string
    pouvoirs: string
    representantCivilite: "monsieur" | "madame" | ""
    representantNom: string
    representantPrenom: string
    representantFonction: string
    representantPouvoirs: string
    representantTelephone: string
    representantEmail: string
  }
  representantAutre: {
    description: string
    signataireNom: string
    signatairePrenom: string
    telephone: string
    email: string
  }
  precisions: string
}

interface EISeller {
  nom: string
  prenom: string
  adresse: string
  registre: "RCS" | "RM" | "Autre" | ""
  registrePrecision: string
  numero: string
  codeApeChoix: OuiNon
  codeApe: string
}

interface AssociationSeller {
  denomination: string
  siege: string
  numeroRna: string
  numeroSiren: string
  telephone: string
  email: string
  representantType: "monsieur" | "madame" | "autre" | ""
  representantPhysique: {
    nom: string
    prenom: string
    fonction: string
    pouvoirs: string
    telephone: string
    email: string
  }
  representantAutre: {
    description: string
    signataireNom: string
    signatairePrenom: string
    telephone: string
    email: string
  }
  precisions: string
}

interface PersonneMoraleSeller {
  description: string
  telephone: string
  email: string
  representantType: "monsieur" | "madame" | "autre" | ""
  representantPhysique: {
    nom: string
    prenom: string
    fonction: string
    pouvoirs: string
    telephone: string
    email: string
  }
  representantAutre: {
    description: string
    signataireNom: string
    signatairePrenom: string
    telephone: string
    email: string
  }
  precisions: string
}

interface MineurSeller {
  nom: string
  prenom: string
  dateNaissance: string
  lieuNaissance: string
  nationalite: string
  adresse: string
  autorite: "mere" | "pere" | "les_deux" | "tuteur" | "autre" | ""
  mere: {
    nom: string
    prenom: string
    adresse: string
    telephone: string
    email: string
  }
  pere: {
    nom: string
    prenom: string
    adresse: string
    telephone: string
    email: string
  }
  tuteur: {
    nom: string
    prenom: string
    tribunalVille: string
    dateOrdonnance: string
    adresse: string
    telephone: string
    email: string
  }
  autre: {
    description: string
    signataireNom: string
    signatairePrenom: string
    telephone: string
    email: string
  }
  precisions: string
}

interface MajeurProtegeSeller {
  nom: string
  prenom: string
  dateNaissance: string
  lieuNaissance: string
  nationalite: string
  adresse: string
  mesure: "curatelle" | "tutelle" | "habilitation" | "sauvegarde" | "autre" | ""
  mesureDetails: string
  representantNom: string
  representantPrenom: string
  representantQualite: string
  baseJuridique: string
  telephone: string
  email: string
  precisions: string
}

interface AutreSituation {
  description: string
  contactNom: string
  contactPrenom: string
  telephone: string
  email: string
}

interface AcquereurFormState {
  type: AcquereurType
  nombreVendeurs: number
  identificationRapide: Array<{ nom: string; prenom: string }>
  vendeursARemplir: boolean[]
  personne: PersonneBuyer
  couple: {
    vendeur1: PersonneBuyer
    vendeur2: PersonneBuyer
    synchroniserSituation: boolean
  }
  indivision: PersonneBuyer[]
  societe: SocieteSeller
  ei: EISeller
  association: AssociationSeller
  personneMorale: PersonneMoraleSeller
  mineur: MineurSeller
  majeurProtege: MajeurProtegeSeller
  autreSituation: AutreSituation
}

const acquereurTypeOptions: Array<{ value: AcquereurType; label: string }> = [
  { value: "personne_seule", label: "Une personne seule (Monsieur ou Madame)" },
  { value: "couple_monsieur_madame", label: "Un couple : Monsieur et Madame" },
  { value: "couple_monsieur_monsieur", label: "Un couple : Monsieur et Monsieur" },
  { value: "couple_madame_madame", label: "Un couple : Madame et Madame" },
  { value: "indivision", label: "Plusieurs acquéreurs en indivision / héritiers" },
  { value: "societe", label: "Une société (SARL, SAS, SCI, etc.)" },
  { value: "entreprise_individuelle", label: "Une entreprise individuelle (EI, micro-entreprise…)" },
  { value: "association", label: "Une association" },
  { value: "personne_morale_autre", label: "Une autre personne morale (autre qu’une société)" },
  { value: "mineur", label: "Un mineur" },
  { value: "majeur_protege", label: "Un majeur protégé" },
  { value: "autre", label: "Autre situation" }
]

const situationOptions: Array<{ value: SituationMatrimoniale; label: string }> = [
  { value: "marie_apres_1966", label: "Marié(e) sans contrat après le 01/02/1966" },
  { value: "marie_avant_1966", label: "Marié(e) sans contrat avant le 01/02/1966" },
  { value: "separation_de_biens", label: "Marié(e) sous le régime de la séparation de biens" },
  { value: "communaute_universelle", label: "Marié(e) sous le régime de la communauté universelle" },
  { value: "participation_aux_acquets", label: "Marié(e) sous le régime de la participation aux acquêts" },
  { value: "communaute_acquets_contrat", label: "Marié(e) sous le régime de la communauté d’acquêts avec contrat de mariage" },
  { value: "autre_regime", label: "Marié(e) sous un autre régime (étranger)" },
  { value: "changement_regime", label: "Marié(e) avec changement de régime matrimonial" },
  { value: "pacs", label: "Célibataire lié(e) par un PACS" },
  { value: "celibataire", label: "Célibataire" },
  { value: "veuf", label: "Veuf / veuve non remarié(e)" },
  { value: "divorce", label: "Divorcé(e), non remarié(e)" },
  { value: "autre", label: "Autre situation" }
]

const createEmptyPerson = (): PersonneBuyer => ({
  civilite: "",
  nom: "",
  prenom: "",
  dateNaissance: "",
  lieuNaissance: "",
  nationalite: "",
  adresse: "",
  telephone: "",
  email: "",
  residenceFiscaleFrance: "",
  residenceFiscalePays: "",
  residenceFiscaleAdresse: "",
  residenceFiscaleNumero: "",
  situationMatrimoniale: "",
  situationDetails: {
    conjointNomPrenom: "",
    villeMariage: "",
    dateMariage: "",
    notaireNom: "",
    notaireVille: "",
    dateContrat: "",
    regimeOrigine: "",
    regimeActuel: "",
    basePouvoir: "",
    partenaireNomPrenom: "",
    datePacs: "",
    conjointDecede: "",
    divorceDetails: "",
    autreDescription: ""
  },
  representation: {
    seraPresent: "oui",
    representantNom: "",
    representantPrenom: "",
    representantTelephone: "",
    representantEmail: ""
  },
  notaireDesigne: "non",
  notaireNom: "",
  notaireVille: "",
  precisions: ""
})

const createEmptySociete = (): SocieteSeller => ({
  denomination: "",
  forme: "",
  capital: "",
  siege: "",
  villeRcs: "",
  numeroRcs: "",
  telephone: "",
  email: "",
  representantType: "",
  representantPhysique: {
    nom: "",
    prenom: "",
    fonction: "",
    pouvoirs: "",
    telephone: "",
    email: ""
  },
  representantSociete: {
    denomination: "",
    forme: "",
    capital: "",
    siege: "",
    villeRcs: "",
    numeroRcs: "",
    pouvoirs: "",
    representantCivilite: "",
    representantNom: "",
    representantPrenom: "",
    representantFonction: "",
    representantPouvoirs: "",
    representantTelephone: "",
    representantEmail: ""
  },
  representantAutre: {
    description: "",
    signataireNom: "",
    signatairePrenom: "",
    telephone: "",
    email: ""
  },
  precisions: ""
})

const createEmptyEI = (): EISeller => ({
  nom: "",
  prenom: "",
  adresse: "",
  registre: "",
  registrePrecision: "",
  numero: "",
  codeApeChoix: "",
  codeApe: ""
})

const createEmptyAssociation = (): AssociationSeller => ({
  denomination: "",
  siege: "",
  numeroRna: "",
  numeroSiren: "",
  telephone: "",
  email: "",
  representantType: "",
  representantPhysique: {
    nom: "",
    prenom: "",
    fonction: "",
    pouvoirs: "",
    telephone: "",
    email: ""
  },
  representantAutre: {
    description: "",
    signataireNom: "",
    signatairePrenom: "",
    telephone: "",
    email: ""
  },
  precisions: ""
})

const createEmptyPersonneMorale = (): PersonneMoraleSeller => ({
  description: "",
  telephone: "",
  email: "",
  representantType: "",
  representantPhysique: {
    nom: "",
    prenom: "",
    fonction: "",
    pouvoirs: "",
    telephone: "",
    email: ""
  },
  representantAutre: {
    description: "",
    signataireNom: "",
    signatairePrenom: "",
    telephone: "",
    email: ""
  },
  precisions: ""
})

const createEmptyMineur = (): MineurSeller => ({
  nom: "",
  prenom: "",
  dateNaissance: "",
  lieuNaissance: "",
  nationalite: "",
  adresse: "",
  autorite: "",
  mere: { nom: "", prenom: "", adresse: "", telephone: "", email: "" },
  pere: { nom: "", prenom: "", adresse: "", telephone: "", email: "" },
  tuteur: {
    nom: "",
    prenom: "",
    tribunalVille: "",
    dateOrdonnance: "",
    adresse: "",
    telephone: "",
    email: ""
  },
  autre: { description: "", signataireNom: "", signatairePrenom: "", telephone: "", email: "" },
  precisions: ""
})

const createEmptyMajeurProtege = (): MajeurProtegeSeller => ({
  nom: "",
  prenom: "",
  dateNaissance: "",
  lieuNaissance: "",
  nationalite: "",
  adresse: "",
  mesure: "",
  mesureDetails: "",
  representantNom: "",
  representantPrenom: "",
  representantQualite: "",
  baseJuridique: "",
  telephone: "",
  email: "",
  precisions: ""
})

const createEmptyAutre = (): AutreSituation => ({
  description: "",
  contactNom: "",
  contactPrenom: "",
  telephone: "",
  email: ""
})

const resizePersonList = (list: PersonneBuyer[], count: number) => {
  const next = [...list]
  while (next.length < count) {
    next.push(createEmptyPerson())
  }
  return next.slice(0, Math.max(1, count))
}

const defaultState: AcquereurFormState = {
  type: "personne_seule",
  nombreVendeurs: 1,
  identificationRapide: [{ nom: "", prenom: "" }],
  vendeursARemplir: [true],
  personne: createEmptyPerson(),
  couple: { vendeur1: createEmptyPerson(), vendeur2: createEmptyPerson(), synchroniserSituation: true },
  indivision: resizePersonList([], 2),
  societe: createEmptySociete(),
  ei: createEmptyEI(),
  association: createEmptyAssociation(),
  personneMorale: createEmptyPersonneMorale(),
  mineur: createEmptyMineur(),
  majeurProtege: createEmptyMajeurProtege(),
  autreSituation: createEmptyAutre()
}

const computeIdentificationList = (
  identification: Array<{ nom: string; prenom: string }>,
  nombreVendeurs: number,
  isCouple: boolean
) => {
  const list = [...identification]
  if (isCouple && list.length < 2) {
    list.push({ nom: "", prenom: "" })
  }
  while (list.length < nombreVendeurs) {
    list.push({ nom: "", prenom: "" })
  }
  return list.slice(0, Math.max(nombreVendeurs, isCouple ? 2 : 1))
}

const buildSamplePersonBuyer = (index: number, situationMatrimoniale?: SituationMatrimoniale): PersonneBuyer => {
  const base = createEmptyPerson()
  const situation = situationMatrimoniale || pickRandom(situationOptions).value
  return {
    ...base,
    civilite: index % 2 ? "Monsieur" : "Madame",
    nom: sampleLastName(),
    prenom: sampleFirstName(),
    dateNaissance: buildTestDate(1970, 1994),
    lieuNaissance: sampleCity(),
    nationalite: "Française",
    adresse: buildTestAddress(),
    telephone: buildTestPhone(),
    email: buildTestEmail(`acquereur${index}`),
    residenceFiscaleFrance: "oui",
    residenceFiscalePays: "",
    residenceFiscaleAdresse: "",
    residenceFiscaleNumero: `${100000000 + Math.floor(Math.random() * 900000000)}`,
    situationMatrimoniale: situation,
    situationDetails: {
      ...base.situationDetails,
      conjointNomPrenom: `${sampleFirstName()} ${sampleLastName()}`,
      villeMariage: sampleCity(),
      dateMariage: buildTestDate(2010, 2018),
      notaireNom: "Selarl Demo Notaires",
      notaireVille: sampleCity(),
      dateContrat: buildTestDate(2012, 2016),
      regimeOrigine: "Communauté",
      regimeActuel: "Communauté réduite aux acquêts",
      basePouvoir: "Régime légal",
      partenaireNomPrenom: `${sampleFirstName()} ${sampleLastName()}`,
      datePacs: buildTestDate(2015, 2019),
      conjointDecede: "non",
      divorceDetails: "",
      autreDescription: ""
    },
    representation: { ...base.representation, seraPresent: "oui" },
    notaireDesigne: "non",
    notaireNom: "Etude Durand",
    notaireVille: sampleCity(),
    precisions: "Données fictives pour vérifier la génération du PDF."
  }
}

const buildSampleSociete = (): SocieteSeller => {
  const base = createEmptySociete()
  return {
    ...base,
    denomination: `${sampleCompany()} Immobilier`,
    forme: pickRandom(["SAS", "SARL", "SCI"]),
    capital: `${pickRandom([5000, 10000, 30000])}`,
    siege: buildTestAddress(),
    villeRcs: sampleCity(),
    numeroRcs: `RCS-${Math.floor(100000 + Math.random() * 900000)}`,
    telephone: buildTestPhone(),
    email: buildTestEmail("societe"),
    representantType: "monsieur",
    representantPhysique: {
      ...base.representantPhysique,
      nom: sampleLastName(),
      prenom: sampleFirstName(),
      fonction: "Gérant",
      pouvoirs: "Statuts",
      telephone: buildTestPhone(),
      email: buildTestEmail("representant")
    },
    representantSociete: {
      ...base.representantSociete,
      denomination: `${sampleCompany()} Holding`,
      forme: "SAS",
      capital: "120000",
      siege: buildTestAddress(),
      villeRcs: sampleCity(),
      numeroRcs: `RCS-${Math.floor(200000 + Math.random() * 700000)}`,
      pouvoirs: "Mandat du conseil",
      representantCivilite: "monsieur",
      representantNom: sampleLastName(),
      representantPrenom: sampleFirstName(),
      representantFonction: "Président",
      representantPouvoirs: "Statuts",
      representantTelephone: buildTestPhone(),
      representantEmail: buildTestEmail("delegue")
    },
    representantAutre: {
      ...base.representantAutre,
      description: "Mandataire désigné",
      signataireNom: sampleLastName(),
      signatairePrenom: sampleFirstName(),
      telephone: buildTestPhone(),
      email: buildTestEmail("mandataire")
    },
    precisions: "Préremplissage automatique pour tests."
  }
}

const buildSampleEI = (): EISeller => {
  const base = createEmptyEI()
  return {
    ...base,
    nom: sampleLastName(),
    prenom: sampleFirstName(),
    adresse: buildTestAddress(),
    registre: "RCS",
    registrePrecision: "",
    numero: `EI-${Math.floor(10000 + Math.random() * 90000)}`,
    codeApeChoix: "oui",
    codeApe: "7022Z"
  }
}

const buildSampleAssociation = (): AssociationSeller => {
  const base = createEmptyAssociation()
  return {
    ...base,
    denomination: "Association Test Habitat",
    siege: buildTestAddress(),
    numeroRna: `W${Math.floor(100000000 + Math.random() * 900000000)}`,
    numeroSiren: `${Math.floor(100000000 + Math.random() * 900000000)}`,
    telephone: buildTestPhone(),
    email: buildTestEmail("association"),
    representantType: "madame",
    representantPhysique: {
      ...base.representantPhysique,
      nom: sampleLastName(),
      prenom: sampleFirstName(),
      fonction: "Présidente",
      pouvoirs: "Statuts",
      telephone: buildTestPhone(),
      email: buildTestEmail("representant-asso")
    },
    representantAutre: {
      ...base.representantAutre,
      description: "Mandataire spécial",
      signataireNom: sampleLastName(),
      signatairePrenom: sampleFirstName(),
      telephone: buildTestPhone(),
      email: buildTestEmail("mandataire-asso")
    },
    precisions: "Préremplissage automatique pour vos tests."
  }
}

const buildSamplePersonneMorale = (): PersonneMoraleSeller => {
  const base = createEmptyPersonneMorale()
  return {
    ...base,
    description: "Fonds de dotation Exemple - données fictives pour test.",
    telephone: buildTestPhone(),
    email: buildTestEmail("personne-morale"),
    representantType: "madame",
    representantPhysique: {
      ...base.representantPhysique,
      nom: sampleLastName(),
      prenom: sampleFirstName(),
      fonction: "Représentante légale",
      pouvoirs: "Statuts",
      telephone: buildTestPhone(),
      email: buildTestEmail("representant-morale")
    },
    representantAutre: {
      ...base.representantAutre,
      description: "Mandataire désigné",
      signataireNom: sampleLastName(),
      signatairePrenom: sampleFirstName(),
      telephone: buildTestPhone(),
      email: buildTestEmail("mandataire-morale")
    },
    precisions: "Données fictives pour test."
  }
}

const buildSampleMineur = (): MineurSeller => {
  const base = createEmptyMineur()
  return {
    ...base,
    nom: sampleLastName(),
    prenom: sampleFirstName(),
    dateNaissance: buildTestDate(2010, 2016),
    lieuNaissance: sampleCity(),
    nationalite: "Française",
    adresse: buildTestAddress(),
    autorite: "les_deux",
    mere: {
      ...base.mere,
      nom: sampleLastName(),
      prenom: sampleFirstName(),
      adresse: buildTestAddress(),
      telephone: buildTestPhone(),
      email: buildTestEmail("mere")
    },
    pere: {
      ...base.pere,
      nom: sampleLastName(),
      prenom: sampleFirstName(),
      adresse: buildTestAddress(),
      telephone: buildTestPhone(),
      email: buildTestEmail("pere")
    },
    tuteur: {
      ...base.tuteur,
      nom: sampleLastName(),
      prenom: sampleFirstName(),
      tribunalVille: sampleCity(),
      dateOrdonnance: buildTestDate(2020, 2023),
      adresse: buildTestAddress(),
      telephone: buildTestPhone(),
      email: buildTestEmail("tuteur")
    },
    autre: {
      ...base.autre,
      description: "Autre représentant (fictif)",
      signataireNom: sampleLastName(),
      signatairePrenom: sampleFirstName(),
      telephone: buildTestPhone(),
      email: buildTestEmail("autre-representant")
    },
    precisions: "Données fictives pour test PDF."
  }
}

const buildSampleMajeurProtege = (): MajeurProtegeSeller => {
  const base = createEmptyMajeurProtege()
  return {
    ...base,
    nom: sampleLastName(),
    prenom: sampleFirstName(),
    dateNaissance: buildTestDate(1965, 1985),
    lieuNaissance: sampleCity(),
    nationalite: "Française",
    adresse: buildTestAddress(),
    mesure: "curatelle",
    mesureDetails: "Curatelle simple prononcée par le juge (fictif).",
    representantNom: sampleLastName(),
    representantPrenom: sampleFirstName(),
    representantQualite: "Curateur",
    baseJuridique: "Jugement du TJ (données fictives)",
    telephone: buildTestPhone(),
    email: buildTestEmail("curateur"),
    precisions: "Fiche générée automatiquement pour test."
  }
}

const buildSampleAutre = (): AutreSituation => ({
  description: "Situation particulière fictive (usufruit, indivision complexe...) pour test.",
  contactNom: sampleLastName(),
  contactPrenom: sampleFirstName(),
  telephone: buildTestPhone(),
  email: buildTestEmail("autre-situation")
})

function SituationMatrimonialeFields({
  data,
  onChange
}: {
  data: PersonneBuyer
  onChange: (data: PersonneBuyer) => void
}) {
  const updateDetail = (key: string, value: string) => {
    onChange({
      ...data,
      situationDetails: {
        ...data.situationDetails,
        [key]: value
      }
    })
  }

  const sharedMarriageFields = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ModernFormField label="Nom et prénom de votre conjoint" required>
        <Input
          value={data.situationDetails.conjointNomPrenom}
          onChange={(e) => updateDetail("conjointNomPrenom", e.target.value)}
          placeholder="Nom et prénom"
        />
      </ModernFormField>
      <ModernFormField label="Ville du mariage (Mairie de...)" required>
        <Input
          value={data.situationDetails.villeMariage}
          onChange={(e) => updateDetail("villeMariage", e.target.value)}
          placeholder="Ville"
        />
      </ModernFormField>
      <ModernFormField label="Date du mariage" required>
        <Input
          type="date"
          value={data.situationDetails.dateMariage}
          onChange={(e) => updateDetail("dateMariage", e.target.value)}
        />
      </ModernFormField>
    </div>
  )

  const contratFields = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ModernFormField label="Nom du notaire (contrat de mariage)" required>
        <Input
          value={data.situationDetails.notaireNom}
          onChange={(e) => updateDetail("notaireNom", e.target.value)}
          placeholder="Nom du notaire"
        />
      </ModernFormField>
      <ModernFormField label="Ville de l’étude du notaire" required>
        <Input
          value={data.situationDetails.notaireVille}
          onChange={(e) => updateDetail("notaireVille", e.target.value)}
          placeholder="Ville"
        />
      </ModernFormField>
      <ModernFormField label="Date du contrat de mariage" required>
        <Input
          type="date"
          value={data.situationDetails.dateContrat}
          onChange={(e) => updateDetail("dateContrat", e.target.value)}
        />
      </ModernFormField>
      <ModernFormField label="Ville du mariage (Mairie de...)" required>
        <Input
          value={data.situationDetails.villeMariage}
          onChange={(e) => updateDetail("villeMariage", e.target.value)}
          placeholder="Ville"
        />
      </ModernFormField>
      <ModernFormField label="Date du mariage" required>
        <Input
          type="date"
          value={data.situationDetails.dateMariage}
          onChange={(e) => updateDetail("dateMariage", e.target.value)}
        />
      </ModernFormField>
    </div>
  )

  switch (data.situationMatrimoniale) {
    case "marie_apres_1966":
    case "marie_avant_1966":
      return sharedMarriageFields
    case "separation_de_biens":
    case "communaute_universelle":
    case "participation_aux_acquets":
    case "communaute_acquets_contrat":
      return contratFields
    case "autre_regime":
      return (
        <ModernFormField
          label="Merci de décrire votre régime matrimonial (pays, loi applicable, type de régime, références...)"
          required
        >
          <Textarea
            value={data.situationDetails.autreDescription}
            onChange={(e) => updateDetail("autreDescription", e.target.value)}
            placeholder="Description du régime matrimonial"
          />
        </ModernFormField>
      )
    case "changement_regime":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ModernFormField label="Nom et prénom de votre conjoint" required>
            <Input
              value={data.situationDetails.conjointNomPrenom}
              onChange={(e) => updateDetail("conjointNomPrenom", e.target.value)}
            />
          </ModernFormField>
          <ModernFormField label="Régime matrimonial d’origine" required>
            <Input
              value={data.situationDetails.regimeOrigine}
              onChange={(e) => updateDetail("regimeOrigine", e.target.value)}
            />
          </ModernFormField>
          <ModernFormField label="Régime matrimonial actuel" required>
            <Input
              value={data.situationDetails.regimeActuel}
              onChange={(e) => updateDetail("regimeActuel", e.target.value)}
            />
          </ModernFormField>
          <ModernFormField label="Nom du notaire (acte de changement)" required>
            <Input
              value={data.situationDetails.notaireNom}
              onChange={(e) => updateDetail("notaireNom", e.target.value)}
            />
          </ModernFormField>
          <ModernFormField label="Ville de l’étude du notaire" required>
            <Input
              value={data.situationDetails.notaireVille}
              onChange={(e) => updateDetail("notaireVille", e.target.value)}
            />
          </ModernFormField>
          <ModernFormField label="Date de l’acte de changement de régime" required>
            <Input
              type="date"
              value={data.situationDetails.dateContrat}
              onChange={(e) => updateDetail("dateContrat", e.target.value)}
            />
          </ModernFormField>
        </div>
      )
    case "pacs":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ModernFormField label="Nom et prénom de votre partenaire de PACS" required>
            <Input
              value={data.situationDetails.partenaireNomPrenom}
              onChange={(e) => updateDetail("partenaireNomPrenom", e.target.value)}
            />
          </ModernFormField>
          <ModernFormField label="Date d’enregistrement du PACS" required>
            <Input
              type="date"
              value={data.situationDetails.datePacs}
              onChange={(e) => updateDetail("datePacs", e.target.value)}
            />
          </ModernFormField>
        </div>
      )
    case "veuf":
      return (
        <ModernFormField label="Nom et prénom de votre conjoint décédé" required>
          <Input
            value={data.situationDetails.conjointDecede}
            onChange={(e) => updateDetail("conjointDecede", e.target.value)}
          />
        </ModernFormField>
      )
    case "divorce":
      return (
        <ModernFormField label="Souhaitez-vous préciser la date et le lieu de votre divorce ?" helpText="Facultatif">
          <Input
            value={data.situationDetails.divorceDetails}
            onChange={(e) => updateDetail("divorceDetails", e.target.value)}
            placeholder="Date et lieu"
          />
        </ModernFormField>
      )
    case "autre":
      return (
        <ModernFormField label="Merci de décrire votre situation matrimoniale" required>
          <Textarea
            value={data.situationDetails.autreDescription}
            onChange={(e) => updateDetail("autreDescription", e.target.value)}
          />
        </ModernFormField>
      )
    case "celibataire":
    default:
      return null
  }
}

function PersonBuyerCard({
  title,
  data,
  onChange,
  showResidenceDetails = false,
  showCivilite = false,
  showValidationErrors = false,
  missing,
  pathPrefix
}: {
  title: string
  data: PersonneBuyer
  onChange: (data: PersonneBuyer) => void
  showResidenceDetails?: boolean
  showCivilite?: boolean
  showValidationErrors?: boolean
  missing?: Record<string, boolean>
  pathPrefix: string
}) {
  const update = (key: keyof PersonneBuyer, value: string | OuiNon | SituationMatrimoniale | "") => {
    onChange({ ...data, [key]: value } as PersonneBuyer)
  }

  const updateRepresentation = (key: keyof PersonneBuyer["representation"], value: string) => {
    onChange({
      ...data,
      representation: {
        ...data.representation,
        [key]: value
      }
    })
  }

  const updateNotaire = (key: "notaireDesigne" | "notaireNom" | "notaireVille", value: string | OuiNon) => {
    onChange({
      ...data,
      [key]: value
    })
  }

  const isMissing = (path: string) => Boolean(showValidationErrors && missing?.[`${pathPrefix}.${path}`])
  const fieldId = (path: string) => `field-${`${pathPrefix}.${path}`.replace(/\./g, "-")}`

  return (
    <div className="space-y-6">
      <ModernFormSection
        title={title}
        subtitle="Identité et contacts"
        icon={<User className="h-5 w-5" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {showCivilite && (
            <ModernFormField label="Civilité" required isMissing={isMissing("civilite")} fieldId={fieldId("civilite")}>
              <Select
                value={data.civilite}
                onValueChange={(val: "Monsieur" | "Madame") => update("civilite", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Monsieur ou Madame" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Monsieur">Monsieur</SelectItem>
                  <SelectItem value="Madame">Madame</SelectItem>
                </SelectContent>
              </Select>
            </ModernFormField>
          )}
          <ModernFormField label="Nom" required isMissing={isMissing("nom")} fieldId={fieldId("nom")}>
            <Input value={data.nom} onChange={(e) => update("nom", e.target.value)} autoComplete="family-name" />
          </ModernFormField>
          <ModernFormField label="Prénom" required isMissing={isMissing("prenom")} fieldId={fieldId("prenom")}>
            <Input value={data.prenom} onChange={(e) => update("prenom", e.target.value)} autoComplete="given-name" />
          </ModernFormField>
          <ModernFormField label="Date de naissance" required isMissing={isMissing("dateNaissance")} fieldId={fieldId("dateNaissance")}>
            <Input type="date" value={data.dateNaissance} onChange={(e) => update("dateNaissance", e.target.value)} />
          </ModernFormField>
          <ModernFormField
            label="Lieu de naissance"
            required
            isMissing={isMissing("lieuNaissance")}
            fieldId={fieldId("lieuNaissance")}
            helpText="Format conseillé : 33000 Bordeaux (CP + ville)"
          >
            <CommuneAutocompleteInput
              value={data.lieuNaissance}
              onChange={(val) => update("lieuNaissance", val)}
              placeholder="Ex: 33000 Bordeaux"
            />
          </ModernFormField>
          <ModernFormField label="Nationalité" required isMissing={isMissing("nationalite")} fieldId={fieldId("nationalite")}>
            <Input value={data.nationalite} onChange={(e) => update("nationalite", e.target.value)} />
          </ModernFormField>
          <ModernFormField label="Adresse de résidence actuelle" required isMissing={isMissing("adresse")} fieldId={fieldId("adresse")}>
            <AddressAutocompleteField value={data.adresse} onChange={(val) => update("adresse", val)} placeholder="Entrer l'adresse complète" />
          </ModernFormField>
          <ModernFormField label="Téléphone" required isMissing={isMissing("telephone")} fieldId={fieldId("telephone")}>
            <Input value={data.telephone} onChange={(e) => update("telephone", e.target.value)} autoComplete="tel" />
          </ModernFormField>
          <ModernFormField label="Adresse e-mail" required isMissing={isMissing("email")} fieldId={fieldId("email")}>
            <Input type="email" value={data.email} onChange={(e) => update("email", e.target.value)} autoComplete="email" />
          </ModernFormField>
        </div>
      </ModernFormSection>

      <ModernFormSection
        title="Résidence fiscale"
        subtitle="Question obligatoire"
        icon={<Shield className="h-5 w-5" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ModernFormField
            label="Avez-vous votre résidence fiscale en France ?"
            required
            isMissing={isMissing("residenceFiscaleFrance")}
            fieldId={fieldId("residenceFiscaleFrance")}
          >
            <Select value={data.residenceFiscaleFrance} onValueChange={(val: OuiNon) => update("residenceFiscaleFrance", val)}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir une option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oui">Oui</SelectItem>
                <SelectItem value="non">Non</SelectItem>
              </SelectContent>
            </Select>
          </ModernFormField>
          {showResidenceDetails && data.residenceFiscaleFrance === "non" && (
            <>
              <ModernFormField
                label="Pays de résidence fiscale"
                required
                isMissing={isMissing("residenceFiscalePays")}
                fieldId={fieldId("residenceFiscalePays")}
              >
                <Input value={data.residenceFiscalePays} onChange={(e) => update("residenceFiscalePays", e.target.value)} />
              </ModernFormField>
              <ModernFormField
                label="Adresse fiscale"
                required
                isMissing={isMissing("residenceFiscaleAdresse")}
                fieldId={fieldId("residenceFiscaleAdresse")}
              >
                <AddressAutocompleteField
                  value={data.residenceFiscaleAdresse}
                  onChange={(val) => update("residenceFiscaleAdresse", val)}
                  placeholder="Adresse complète"
                />
              </ModernFormField>
              <ModernFormField label="Numéro d’identification fiscale">
                <Input
                  value={data.residenceFiscaleNumero}
                  onChange={(e) => update("residenceFiscaleNumero", e.target.value)}
                />
              </ModernFormField>
            </>
          )}
        </div>
      </ModernFormSection>

      <ModernFormSection
        title="Situation matrimoniale"
        subtitle="Affichage conditionnel des champs"
        icon={<HandCoins className="h-5 w-5" />}
      >
        <div className="space-y-4">
          <ModernFormField
            label="Quelle est votre situation matrimoniale ?"
            required
            isMissing={isMissing("situationMatrimoniale")}
            fieldId={fieldId("situationMatrimoniale")}
          >
            <Select
              value={data.situationMatrimoniale}
              onValueChange={(val: SituationMatrimoniale) => update("situationMatrimoniale", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez votre situation" />
              </SelectTrigger>
              <SelectContent>
                {situationOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </ModernFormField>

          <SituationMatrimonialeFields data={data} onChange={onChange} />
        </div>
      </ModernFormSection>

      <ModernFormSection
        title="Représentation"
        subtitle="Présence ou représentation à la signature"
        icon={<Users className="h-5 w-5" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ModernFormField
            label="Serez-vous présent(e) en personne pour signer chez le notaire ?"
            required
            isMissing={isMissing("representation.seraPresent")}
            fieldId={fieldId("representation.seraPresent")}
          >
            <Select
              value={data.representation.seraPresent}
              onValueChange={(val: OuiNon) => updateRepresentation("seraPresent", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir une option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oui">Oui</SelectItem>
                <SelectItem value="non">Non</SelectItem>
              </SelectContent>
            </Select>
          </ModernFormField>
          {data.representation.seraPresent === "non" && (
            <>
              <ModernFormField label="Nom du représentant" required isMissing={isMissing("representation.representantNom")} fieldId={fieldId("representation.representantNom")}>
                <Input
                  value={data.representation.representantNom}
                  onChange={(e) => updateRepresentation("representantNom", e.target.value)}
                />
              </ModernFormField>
              <ModernFormField label="Prénom du représentant" required isMissing={isMissing("representation.representantPrenom")} fieldId={fieldId("representation.representantPrenom")}>
                <Input
                  value={data.representation.representantPrenom}
                  onChange={(e) => updateRepresentation("representantPrenom", e.target.value)}
                />
              </ModernFormField>
              <ModernFormField label="Téléphone du représentant" required isMissing={isMissing("representation.representantTelephone")} fieldId={fieldId("representation.representantTelephone")}>
                <Input
                  value={data.representation.representantTelephone}
                  onChange={(e) => updateRepresentation("representantTelephone", e.target.value)}
                />
              </ModernFormField>
              <ModernFormField label="Email du représentant" required isMissing={isMissing("representation.representantEmail")} fieldId={fieldId("representation.representantEmail")}>
                <Input
                  value={data.representation.representantEmail}
                  onChange={(e) => updateRepresentation("representantEmail", e.target.value)}
                />
              </ModernFormField>
            </>
          )}
        </div>
      </ModernFormSection>

          <ModernFormSection
            title="Désignation du notaire"
            subtitle="Optionnel"
            icon={<Home className="h-5 w-5" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ModernFormField
            label="Souhaitez-vous désigner un notaire particulier ?"
            required
            isMissing={isMissing("notaireDesigne")}
            fieldId={fieldId("notaireDesigne")}
          >
                <Select
                  value={data.notaireDesigne}
                  onValueChange={(val: OuiNon) => updateNotaire("notaireDesigne", val)}
                >
                  <SelectTrigger>
                <SelectValue placeholder="Non par défaut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="non">Non</SelectItem>
                <SelectItem value="oui">Oui</SelectItem>
              </SelectContent>
            </Select>
          </ModernFormField>
          {data.notaireDesigne === "oui" && (
            <>
              <ModernFormField label="Nom du notaire" required isMissing={isMissing("notaireNom")} fieldId={fieldId("notaireNom")}>
                <Input
                  value={data.notaireNom}
                  onChange={(e) => updateNotaire("notaireNom", e.target.value)}
                  placeholder="Ex: Maître Dupont"
                />
              </ModernFormField>
              <ModernFormField label="Ville de l'étude" required isMissing={isMissing("notaireVille")} fieldId={fieldId("notaireVille")}>
                <Input
                  value={data.notaireVille}
                  onChange={(e) => updateNotaire("notaireVille", e.target.value)}
                  placeholder="Ex: Quimper"
                />
              </ModernFormField>
            </>
          )}
        </div>
      </ModernFormSection>

      <ModernFormSection title="Précisions complémentaires" icon={<Info className="h-5 w-5" />}>
        <ModernFormField label="Souhaitez-vous ajouter des précisions ?" helpText="Zone libre">
          <Textarea value={data.precisions} onChange={(e) => update("precisions", e.target.value)} rows={3} />
        </ModernFormField>
      </ModernFormSection>
    </div>
  )
}

function SocieteSection({
  data,
  onChange,
  showValidationErrors = false,
  pathPrefix,
  missing
}: {
  data: SocieteSeller
  onChange: (data: SocieteSeller) => void
  showValidationErrors?: boolean
  pathPrefix: string
  missing?: Record<string, boolean>
}) {
  const update = (key: keyof SocieteSeller, value: any) => {
    onChange({ ...data, [key]: value })
  }

  const updatePhysique = (key: keyof SocieteSeller["representantPhysique"], value: string) => {
    onChange({
      ...data,
      representantPhysique: { ...data.representantPhysique, [key]: value }
    })
  }

  const updateSocieteRep = (key: keyof SocieteSeller["representantSociete"], value: string) => {
    onChange({
      ...data,
      representantSociete: { ...data.representantSociete, [key]: value }
    })
  }

  const updateAutre = (key: keyof SocieteSeller["representantAutre"], value: string) => {
    onChange({
      ...data,
      representantAutre: { ...data.representantAutre, [key]: value }
    })
  }

  const isMissing = (path: string) => Boolean(showValidationErrors && missing?.[`${pathPrefix}.${path}`])
  const fieldId = (path: string) => `field-${`${pathPrefix}.${path}`.replace(/\./g, "-")}`

  return (
    <div className="space-y-6">
      <ModernFormSection
        title="Identification de la société acquéreuse"
        subtitle="Champs obligatoires"
        icon={<Building2 className="h-5 w-5" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ModernFormField label="Dénomination de la société acquéreuse" required isMissing={isMissing("denomination")} fieldId={fieldId("denomination")}>
            <Input value={data.denomination} onChange={(e) => update("denomination", e.target.value)} />
          </ModernFormField>
          <ModernFormField label="Forme de la société" required isMissing={isMissing("forme")} fieldId={fieldId("forme")}>
            <Input value={data.forme} onChange={(e) => update("forme", e.target.value)} placeholder="SARL, SAS, SCI..." />
          </ModernFormField>
          <ModernFormField label="Montant du capital social (en euros)" required isMissing={isMissing("capital")} fieldId={fieldId("capital")}>
            <Input type="number" value={data.capital} onChange={(e) => update("capital", e.target.value)} />
          </ModernFormField>
          <ModernFormField label="Ville d’immatriculation au RCS" required isMissing={isMissing("villeRcs")} fieldId={fieldId("villeRcs")}>
            <Input value={data.villeRcs} onChange={(e) => update("villeRcs", e.target.value)} />
          </ModernFormField>
          <ModernFormField label="Numéro RCS ou SIREN" required isMissing={isMissing("numeroRcs")} fieldId={fieldId("numeroRcs")}>
            <Input value={data.numeroRcs} onChange={(e) => update("numeroRcs", e.target.value)} />
          </ModernFormField>
          <ModernFormField label="Adresse complète du siège social" required isMissing={isMissing("siege")} fieldId={fieldId("siege")}>
            <AddressAutocompleteField value={data.siege} onChange={(val) => update("siege", val)} placeholder="Adresse complète du siège social" />
          </ModernFormField>
          <ModernFormField label="Téléphone de la société" required isMissing={isMissing("telephone")} fieldId={fieldId("telephone")}>
            <Input value={data.telephone} onChange={(e) => update("telephone", e.target.value)} />
          </ModernFormField>
          <ModernFormField label="Adresse e-mail de la société" required isMissing={isMissing("email")} fieldId={fieldId("email")}>
            <Input type="email" value={data.email} onChange={(e) => update("email", e.target.value)} />
          </ModernFormField>
        </div>
      </ModernFormSection>

      <ModernFormSection
        title="Représentant de la société acquéreuse"
        subtitle="Qui signe pour la société ?"
        icon={<Users className="h-5 w-5" />}
      >
        <div className="space-y-4">
          <ModernFormField label="Qui représente la société pour cet achat ?" required isMissing={isMissing("representantType")} fieldId={fieldId("representantType")}>
            <Select value={data.representantType} onValueChange={(val) => update("representantType", val)}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un représentant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monsieur">Monsieur</SelectItem>
                <SelectItem value="madame">Madame</SelectItem>
                <SelectItem value="societe">Une société</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </ModernFormField>

          {(data.representantType === "monsieur" || data.representantType === "madame") && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ModernFormField label="Nom du représentant" required isMissing={isMissing("representantPhysique.nom")} fieldId={fieldId("representantPhysique.nom")}>
                <Input value={data.representantPhysique.nom} onChange={(e) => updatePhysique("nom", e.target.value)} />
              </ModernFormField>
              <ModernFormField label="Prénom du représentant" required isMissing={isMissing("representantPhysique.prenom")} fieldId={fieldId("representantPhysique.prenom")}>
                <Input
                  value={data.representantPhysique.prenom}
                  onChange={(e) => updatePhysique("prenom", e.target.value)}
                />
              </ModernFormField>
              <ModernFormField label="Fonction dans la société" required isMissing={isMissing("representantPhysique.fonction")} fieldId={fieldId("representantPhysique.fonction")}>
                <Input
                  value={data.representantPhysique.fonction}
                  onChange={(e) => updatePhysique("fonction", e.target.value)}
                  placeholder="Gérant, président..."
                />
              </ModernFormField>
              <ModernFormField label="Base des pouvoirs" required isMissing={isMissing("representantPhysique.pouvoirs")} fieldId={fieldId("representantPhysique.pouvoirs")}>
                <Input
                  value={data.representantPhysique.pouvoirs}
                  onChange={(e) => updatePhysique("pouvoirs", e.target.value)}
                  placeholder="Statuts, procès-verbal, procuration..."
                />
              </ModernFormField>
              <ModernFormField label="Téléphone du représentant" required isMissing={isMissing("representantPhysique.telephone")} fieldId={fieldId("representantPhysique.telephone")}>
                <Input
                  value={data.representantPhysique.telephone}
                  onChange={(e) => updatePhysique("telephone", e.target.value)}
                />
              </ModernFormField>
              <ModernFormField label="Adresse e-mail du représentant" required isMissing={isMissing("representantPhysique.email")} fieldId={fieldId("representantPhysique.email")}>
                <Input
                  type="email"
                  value={data.representantPhysique.email}
                  onChange={(e) => updatePhysique("email", e.target.value)}
                />
              </ModernFormField>
            </div>
          )}

          {data.representantType === "societe" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ModernFormField label="Dénomination de la société représentante" required isMissing={isMissing("representantSociete.denomination")} fieldId={fieldId("representantSociete.denomination")}>
                  <Input
                    value={data.representantSociete.denomination}
                    onChange={(e) => updateSocieteRep("denomination", e.target.value)}
                  />
                </ModernFormField>
                <ModernFormField label="Forme de la société représentante" required isMissing={isMissing("representantSociete.forme")} fieldId={fieldId("representantSociete.forme")}>
                  <Input
                    value={data.representantSociete.forme}
                    onChange={(e) => updateSocieteRep("forme", e.target.value)}
                  />
                </ModernFormField>
                <ModernFormField label="Capital social (en euros)" required isMissing={isMissing("representantSociete.capital")} fieldId={fieldId("representantSociete.capital")}>
                  <Input
                    type="number"
                    value={data.representantSociete.capital}
                    onChange={(e) => updateSocieteRep("capital", e.target.value)}
                  />
                </ModernFormField>
                <ModernFormField label="Ville d’immatriculation au RCS" required isMissing={isMissing("representantSociete.villeRcs")} fieldId={fieldId("representantSociete.villeRcs")}>
                  <Input
                    value={data.representantSociete.villeRcs}
                    onChange={(e) => updateSocieteRep("villeRcs", e.target.value)}
                  />
                </ModernFormField>
                <ModernFormField label="Numéro RCS ou SIREN" required isMissing={isMissing("representantSociete.numeroRcs")} fieldId={fieldId("representantSociete.numeroRcs")}>
                  <Input
                    value={data.representantSociete.numeroRcs}
                    onChange={(e) => updateSocieteRep("numeroRcs", e.target.value)}
                  />
                </ModernFormField>
                <ModernFormField label="Adresse complète du siège social" required isMissing={isMissing("representantSociete.siege")} fieldId={fieldId("representantSociete.siege")}>
                  <AddressAutocompleteField value={data.representantSociete.siege} onChange={(val) => updateSocieteRep("siege", val)} placeholder="Adresse complète du siège social" />
                </ModernFormField>
                <ModernFormField label="Document donnant pouvoir" required isMissing={isMissing("representantSociete.pouvoirs")} fieldId={fieldId("representantSociete.pouvoirs")}>
                  <Input
                    value={data.representantSociete.pouvoirs}
                    onChange={(e) => updateSocieteRep("pouvoirs", e.target.value)}
                    placeholder="Statuts, décision..."
                  />
                </ModernFormField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ModernFormField label="Qui représente cette société ?" required isMissing={isMissing("representantSociete.representantCivilite")} fieldId={fieldId("representantSociete.representantCivilite")}>
                  <Select
                    value={data.representantSociete.representantCivilite}
                    onValueChange={(val: "monsieur" | "madame") => updateSocieteRep("representantCivilite", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monsieur">Monsieur</SelectItem>
                      <SelectItem value="madame">Madame</SelectItem>
                    </SelectContent>
                  </Select>
                </ModernFormField>
                <ModernFormField label="Nom du représentant" required isMissing={isMissing("representantSociete.representantNom")} fieldId={fieldId("representantSociete.representantNom")}>
                  <Input
                    value={data.representantSociete.representantNom}
                    onChange={(e) => updateSocieteRep("representantNom", e.target.value)}
                  />
                </ModernFormField>
                <ModernFormField label="Prénom du représentant" required isMissing={isMissing("representantSociete.representantPrenom")} fieldId={fieldId("representantSociete.representantPrenom")}>
                  <Input
                    value={data.representantSociete.representantPrenom}
                    onChange={(e) => updateSocieteRep("representantPrenom", e.target.value)}
                  />
                </ModernFormField>
                <ModernFormField label="Fonction dans la société représentante" required isMissing={isMissing("representantSociete.representantFonction")} fieldId={fieldId("representantSociete.representantFonction")}>
                  <Input
                    value={data.representantSociete.representantFonction}
                    onChange={(e) => updateSocieteRep("representantFonction", e.target.value)}
                  />
                </ModernFormField>
                <ModernFormField label="Base de ses pouvoirs" required isMissing={isMissing("representantSociete.representantPouvoirs")} fieldId={fieldId("representantSociete.representantPouvoirs")}>
                  <Input
                    value={data.representantSociete.representantPouvoirs}
                    onChange={(e) => updateSocieteRep("representantPouvoirs", e.target.value)}
                  />
                </ModernFormField>
                <ModernFormField label="Téléphone du représentant" required isMissing={isMissing("representantSociete.representantTelephone")} fieldId={fieldId("representantSociete.representantTelephone")}>
                  <Input
                    value={data.representantSociete.representantTelephone}
                    onChange={(e) => updateSocieteRep("representantTelephone", e.target.value)}
                  />
                </ModernFormField>
                <ModernFormField label="Adresse e-mail du représentant" required isMissing={isMissing("representantSociete.representantEmail")} fieldId={fieldId("representantSociete.representantEmail")}>
                  <Input
                    type="email"
                    value={data.representantSociete.representantEmail}
                    onChange={(e) => updateSocieteRep("representantEmail", e.target.value)}
                  />
                </ModernFormField>
              </div>
            </div>
          )}

          {data.representantType === "autre" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ModernFormField label="Merci de décrire qui représente la société et en vertu de quel document" required isMissing={isMissing("representantAutre.description")} fieldId={fieldId("representantAutre.description")}>
                <Textarea
                  value={data.representantAutre.description}
                  onChange={(e) => updateAutre("description", e.target.value)}
                  rows={4}
                />
              </ModernFormField>
              <ModernFormField label="Nom et prénom de la personne signataire" required isMissing={isMissing("representantAutre.signataireNom")} fieldId={fieldId("representantAutre.signataireNom")}>
                <Input
                  value={data.representantAutre.signataireNom}
                  onChange={(e) => updateAutre("signataireNom", e.target.value)}
                  placeholder="Nom"
                />
                <div className="mt-2">
                  <Input
                    value={data.representantAutre.signatairePrenom}
                    onChange={(e) => updateAutre("signatairePrenom", e.target.value)}
                    placeholder="Prénom"
                  />
                </div>
              </ModernFormField>
              <ModernFormField label="Téléphone du signataire" required isMissing={isMissing("representantAutre.telephone")} fieldId={fieldId("representantAutre.telephone")}>
                <Input value={data.representantAutre.telephone} onChange={(e) => updateAutre("telephone", e.target.value)} />
              </ModernFormField>
              <ModernFormField label="Adresse e-mail du signataire" required isMissing={isMissing("representantAutre.email")} fieldId={fieldId("representantAutre.email")}>
                <Input
                  type="email"
                  value={data.representantAutre.email}
                  onChange={(e) => updateAutre("email", e.target.value)}
                />
              </ModernFormField>
            </div>
          )}
        </div>
      </ModernFormSection>

      <ModernFormSection title="Précisions complémentaires" icon={<Info className="h-5 w-5" />}>
        <ModernFormField label="Souhaitez-vous apporter des précisions complémentaires ?" helpText="Zone libre (facultatif)">
          <Textarea value={data.precisions} onChange={(e) => update("precisions", e.target.value)} rows={3} />
        </ModernFormField>
      </ModernFormSection>
    </div>
  )
}

function EISection({ data, onChange }: { data: EISeller; onChange: (data: EISeller) => void }) {
  const update = (key: keyof EISeller, value: any) => onChange({ ...data, [key]: value })

  return (
    <div className="space-y-6">
      <ModernFormSection
        title="Identification de l’entrepreneur individuel"
        subtitle="Champs obligatoires"
        icon={<User className="h-5 w-5" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ModernFormField label="Votre nom" required>
            <Input value={data.nom} onChange={(e) => update("nom", e.target.value)} />
          </ModernFormField>
          <ModernFormField label="Votre prénom" required>
            <Input value={data.prenom} onChange={(e) => update("prenom", e.target.value)} />
          </ModernFormField>
          <ModernFormField label="Adresse complète du siège (ou établissement principal)" required>
            <AddressAutocompleteField value={data.adresse} onChange={(val) => update("adresse", val)} placeholder="Adresse complète du siège" />
          </ModernFormField>
          <ModernFormField label="Registre où vous êtes immatriculé(e)" required>
            <Select value={data.registre} onValueChange={(val: EISeller["registre"]) => update("registre", val)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un registre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RCS">RCS</SelectItem>
                <SelectItem value="RM">RM</SelectItem>
                <SelectItem value="Autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </ModernFormField>
          {data.registre === "Autre" && (
            <ModernFormField label="Précision sur le registre" required>
              <Input value={data.registrePrecision} onChange={(e) => update("registrePrecision", e.target.value)} />
            </ModernFormField>
          )}
          <ModernFormField label="Numéro d’immatriculation (SIREN/SIRET)" required>
            <Input value={data.numero} onChange={(e) => update("numero", e.target.value)} />
          </ModernFormField>
        </div>
        <p className="text-sm text-slate-600 mt-2">
          Qualité affichée automatiquement : “{data.nom || "Nom"} {data.prenom || "Prénom"}, entrepreneur individuel (EI)...”
        </p>
      </ModernFormSection>

      <ModernFormSection title="Code APE" subtitle="Facultatif" icon={<BadgeInfo className="h-5 w-5" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ModernFormField label="Souhaitez-vous indiquer votre code APE ?" required>
            <Select value={data.codeApeChoix} onValueChange={(val: OuiNon) => update("codeApeChoix", val)}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oui">Oui</SelectItem>
                <SelectItem value="non">Non</SelectItem>
              </SelectContent>
            </Select>
          </ModernFormField>
          {data.codeApeChoix === "oui" && (
            <ModernFormField
              label="Votre code APE"
              helpText="Le code APE est composé de 4 chiffres et 1 lettre (exemple : 6831Z)."
            >
              <Input value={data.codeApe} onChange={(e) => update("codeApe", e.target.value)} />
            </ModernFormField>
          )}
        </div>
      </ModernFormSection>
    </div>
  )
}

function AssociationSection({
  data,
  onChange
}: {
  data: AssociationSeller
  onChange: (data: AssociationSeller) => void
}) {
  const update = (key: keyof AssociationSeller, value: any) => onChange({ ...data, [key]: value })

  const updatePhysique = (key: keyof AssociationSeller["representantPhysique"], value: string) => {
    onChange({
      ...data,
      representantPhysique: { ...data.representantPhysique, [key]: value }
    })
  }

  const updateAutre = (key: keyof AssociationSeller["representantAutre"], value: string) => {
    onChange({
      ...data,
      representantAutre: { ...data.representantAutre, [key]: value }
    })
  }

  return (
    <div className="space-y-6">
      <ModernFormSection
        title="Identification de l’association vendeuse"
        subtitle="Champs obligatoires"
        icon={<Home className="h-5 w-5" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ModernFormField label="Dénomination de l’association vendeuse" required>
            <Input value={data.denomination} onChange={(e) => update("denomination", e.target.value)} />
          </ModernFormField>
          <ModernFormField label="Adresse complète du siège social" required>
            <Input value={data.siege} onChange={(e) => update("siege", e.target.value)} />
          </ModernFormField>
          <ModernFormField label="Numéro au Registre National des Associations (RNA)" required>
            <Input value={data.numeroRna} onChange={(e) => update("numeroRna", e.target.value)} />
          </ModernFormField>
          <ModernFormField label="Numéro SIREN (si applicable)" helpText="Facultatif">
            <Input value={data.numeroSiren} onChange={(e) => update("numeroSiren", e.target.value)} />
          </ModernFormField>
          <ModernFormField label="Téléphone de l’association" required>
            <Input value={data.telephone} onChange={(e) => update("telephone", e.target.value)} />
          </ModernFormField>
          <ModernFormField label="Adresse e-mail de l’association" required>
            <Input type="email" value={data.email} onChange={(e) => update("email", e.target.value)} />
          </ModernFormField>
        </div>
      </ModernFormSection>

      <ModernFormSection
        title="Représentant de l’association"
        subtitle="Qui signe pour l’association ?"
        icon={<Users className="h-5 w-5" />}
      >
        <div className="space-y-4">
          <ModernFormField label="Qui représente l’association pour cette vente ?" required>
            <Select value={data.representantType} onValueChange={(val) => update("representantType", val)}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monsieur">Monsieur</SelectItem>
                <SelectItem value="madame">Madame</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </ModernFormField>

          {(data.representantType === "monsieur" || data.representantType === "madame") && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ModernFormField label="Nom du représentant" required>
                <Input value={data.representantPhysique.nom} onChange={(e) => updatePhysique("nom", e.target.value)} />
              </ModernFormField>
              <ModernFormField label="Prénom du représentant" required>
                <Input value={data.representantPhysique.prenom} onChange={(e) => updatePhysique("prenom", e.target.value)} />
              </ModernFormField>
              <ModernFormField label="Fonction dans l’association" required>
                <Input
                  value={data.representantPhysique.fonction}
                  onChange={(e) => updatePhysique("fonction", e.target.value)}
                  placeholder="Président, trésorier..."
                />
              </ModernFormField>
              <ModernFormField label="Base des pouvoirs" required>
                <Input
                  value={data.representantPhysique.pouvoirs}
                  onChange={(e) => updatePhysique("pouvoirs", e.target.value)}
                  placeholder="Statuts, procès-verbal, mandat..."
                />
              </ModernFormField>
              <ModernFormField label="Téléphone du représentant" required>
                <Input
                  value={data.representantPhysique.telephone}
                  onChange={(e) => updatePhysique("telephone", e.target.value)}
                />
              </ModernFormField>
              <ModernFormField label="Adresse e-mail du représentant" required>
                <Input
                  type="email"
                  value={data.representantPhysique.email}
                  onChange={(e) => updatePhysique("email", e.target.value)}
                />
              </ModernFormField>
            </div>
          )}

          {data.representantType === "autre" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ModernFormField label="Description et base de représentation" required>
                <Textarea
                  value={data.representantAutre.description}
                  onChange={(e) => updateAutre("description", e.target.value)}
                  rows={4}
                />
              </ModernFormField>
              <ModernFormField label="Personne signataire / contact principal" required>
                <Input
                  value={data.representantAutre.signataireNom}
                  onChange={(e) => updateAutre("signataireNom", e.target.value)}
                  placeholder="Nom"
                />
                <div className="mt-2">
                  <Input
                    value={data.representantAutre.signatairePrenom}
                    onChange={(e) => updateAutre("signatairePrenom", e.target.value)}
                    placeholder="Prénom"
                  />
                </div>
              </ModernFormField>
              <ModernFormField label="Téléphone de cette personne" required>
                <Input
                  value={data.representantAutre.telephone}
                  onChange={(e) => updateAutre("telephone", e.target.value)}
                />
              </ModernFormField>
              <ModernFormField label="Adresse e-mail de cette personne" required>
                <Input
                  type="email"
                  value={data.representantAutre.email}
                  onChange={(e) => updateAutre("email", e.target.value)}
                />
              </ModernFormField>
            </div>
          )}
        </div>
      </ModernFormSection>

      <ModernFormSection title="Précisions complémentaires" icon={<Info className="h-5 w-5" />}>
        <ModernFormField label="Souhaitez-vous apporter des précisions complémentaires ?" helpText="Zone libre (facultatif)">
          <Textarea value={data.precisions} onChange={(e) => update("precisions", e.target.value)} rows={3} />
        </ModernFormField>
      </ModernFormSection>
    </div>
  )
}

function PersonneMoraleSection({
  data,
  onChange
}: {
  data: PersonneMoraleSeller
  onChange: (data: PersonneMoraleSeller) => void
}) {
  const update = (key: keyof PersonneMoraleSeller, value: any) => onChange({ ...data, [key]: value })

  const updatePhysique = (key: keyof PersonneMoraleSeller["representantPhysique"], value: string) => {
    onChange({
      ...data,
      representantPhysique: { ...data.representantPhysique, [key]: value }
    })
  }

  const updateAutre = (key: keyof PersonneMoraleSeller["representantAutre"], value: string) => {
    onChange({
      ...data,
      representantAutre: { ...data.representantAutre, [key]: value }
    })
  }

  return (
    <div className="space-y-6">
      <ModernFormSection
        title="Identification de la personne morale acquéreuse"
        subtitle="Champ libre pour décrire l’entité"
        icon={<FileText className="h-5 w-5" />}
      >
        <ModernFormField
          label="Merci de décrire la personne morale acquéreuse (nom, forme, adresse du siège, immatriculation, références utiles…)"
          required
        >
          <Textarea value={data.description} onChange={(e) => update("description", e.target.value)} rows={4} />
        </ModernFormField>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <ModernFormField label="Téléphone de la personne morale" required>
            <Input value={data.telephone} onChange={(e) => update("telephone", e.target.value)} />
          </ModernFormField>
          <ModernFormField label="Adresse e-mail de la personne morale" required>
            <Input type="email" value={data.email} onChange={(e) => update("email", e.target.value)} />
          </ModernFormField>
        </div>
      </ModernFormSection>

      <ModernFormSection
        title="Représentant de la personne morale"
        subtitle="Qui représente l’entité pour cette vente ?"
        icon={<Users className="h-5 w-5" />}
      >
        <div className="space-y-4">
          <ModernFormField label="Qui représente cette personne morale pour cet achat ?" required>
            <Select value={data.representantType} onValueChange={(val) => update("representantType", val)}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monsieur">Monsieur</SelectItem>
                <SelectItem value="madame">Madame</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </ModernFormField>

          {(data.representantType === "monsieur" || data.representantType === "madame") && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ModernFormField label="Nom du représentant" required>
                <Input value={data.representantPhysique.nom} onChange={(e) => updatePhysique("nom", e.target.value)} />
              </ModernFormField>
              <ModernFormField label="Prénom du représentant" required>
                <Input
                  value={data.representantPhysique.prenom}
                  onChange={(e) => updatePhysique("prenom", e.target.value)}
                />
              </ModernFormField>
              <ModernFormField label="Fonction ou qualité du représentant" required>
                <Input
                  value={data.representantPhysique.fonction}
                  onChange={(e) => updatePhysique("fonction", e.target.value)}
                  placeholder="Président, directeur..."
                />
              </ModernFormField>
              <ModernFormField label="Base de ses pouvoirs" required>
                <Input
                  value={data.representantPhysique.pouvoirs}
                  onChange={(e) => updatePhysique("pouvoirs", e.target.value)}
                  placeholder="Statuts, décision, mandat..."
                />
              </ModernFormField>
              <ModernFormField label="Téléphone du représentant" required>
                <Input
                  value={data.representantPhysique.telephone}
                  onChange={(e) => updatePhysique("telephone", e.target.value)}
                />
              </ModernFormField>
              <ModernFormField label="Adresse e-mail du représentant" required>
                <Input
                  type="email"
                  value={data.representantPhysique.email}
                  onChange={(e) => updatePhysique("email", e.target.value)}
                />
              </ModernFormField>
            </div>
          )}

          {data.representantType === "autre" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ModernFormField label="Description du représentant et base juridique" required>
                <Textarea
                  value={data.representantAutre.description}
                  onChange={(e) => updateAutre("description", e.target.value)}
                  rows={4}
                />
              </ModernFormField>
              <ModernFormField label="Nom et prénom de la personne qui signera" required>
                <Input
                  value={data.representantAutre.signataireNom}
                  onChange={(e) => updateAutre("signataireNom", e.target.value)}
                  placeholder="Nom"
                />
                <div className="mt-2">
                  <Input
                    value={data.representantAutre.signatairePrenom}
                    onChange={(e) => updateAutre("signatairePrenom", e.target.value)}
                    placeholder="Prénom"
                  />
                </div>
              </ModernFormField>
              <ModernFormField label="Téléphone de cette personne" required>
                <Input
                  value={data.representantAutre.telephone}
                  onChange={(e) => updateAutre("telephone", e.target.value)}
                />
              </ModernFormField>
              <ModernFormField label="Adresse e-mail de cette personne" required>
                <Input
                  type="email"
                  value={data.representantAutre.email}
                  onChange={(e) => updateAutre("email", e.target.value)}
                />
              </ModernFormField>
            </div>
          )}
        </div>
      </ModernFormSection>

      <ModernFormSection title="Précisions complémentaires" icon={<Info className="h-5 w-5" />}>
        <ModernFormField label="Souhaitez-vous apporter des précisions complémentaires ?" helpText="Zone libre (facultatif)">
          <Textarea value={data.precisions} onChange={(e) => update("precisions", e.target.value)} rows={3} />
        </ModernFormField>
      </ModernFormSection>
    </div>
  )
}

function MineurSection({ data, onChange }: { data: MineurSeller; onChange: (data: MineurSeller) => void }) {
  const update = (key: keyof MineurSeller, value: any) => onChange({ ...data, [key]: value })
  const updateMere = (key: keyof MineurSeller["mere"], value: string) =>
    onChange({ ...data, mere: { ...data.mere, [key]: value } })
  const updatePere = (key: keyof MineurSeller["pere"], value: string) =>
    onChange({ ...data, pere: { ...data.pere, [key]: value } })
  const updateTuteur = (key: keyof MineurSeller["tuteur"], value: string) =>
    onChange({ ...data, tuteur: { ...data.tuteur, [key]: value } })
  const updateAutre = (key: keyof MineurSeller["autre"], value: string) =>
    onChange({ ...data, autre: { ...data.autre, [key]: value } })

  return (
    <div className="space-y-6">
      <ModernFormSection title="Informations sur le mineur acquéreur" icon={<User className="h-5 w-5" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ModernFormField label="Nom du mineur" required>
            <Input value={data.nom} onChange={(e) => update("nom", e.target.value)} />
          </ModernFormField>
          <ModernFormField label="Prénom du mineur" required>
            <Input value={data.prenom} onChange={(e) => update("prenom", e.target.value)} />
          </ModernFormField>
          <ModernFormField label="Date de naissance du mineur" required>
            <Input type="date" value={data.dateNaissance} onChange={(e) => update("dateNaissance", e.target.value)} />
          </ModernFormField>
          <ModernFormField label="Lieu de naissance du mineur" required helpText="Format : 33000 Ville">
            <CommuneAutocompleteInput
              value={data.lieuNaissance}
              onChange={(val) => update("lieuNaissance", val)}
              placeholder="Ex: 33000 Bordeaux"
            />
          </ModernFormField>
          <ModernFormField label="Nationalité du mineur" required>
            <Input value={data.nationalite} onChange={(e) => update("nationalite", e.target.value)} />
          </ModernFormField>
          <ModernFormField label="Adresse de résidence du mineur" required>
            <AddressAutocompleteField value={data.adresse} onChange={(val) => update("adresse", val)} placeholder="Adresse de résidence du mineur" />
          </ModernFormField>
        </div>
      </ModernFormSection>

      <ModernFormSection title="Autorité parentale" icon={<Shield className="h-5 w-5" />}>
        <div className="space-y-4">
          <ModernFormField label="Qui est titulaire de l’autorité parentale sur le mineur ?" required>
            <Select value={data.autorite} onValueChange={(val) => update("autorite", val)}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mere">La mère</SelectItem>
                <SelectItem value="pere">Le père</SelectItem>
                <SelectItem value="les_deux">Les deux parents</SelectItem>
                <SelectItem value="tuteur">Un tuteur</SelectItem>
                <SelectItem value="autre">Autre situation</SelectItem>
              </SelectContent>
            </Select>
          </ModernFormField>

          {data.autorite === "mere" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ModernFormField label="Nom et prénom de la mère" required>
                <Input value={data.mere.nom} onChange={(e) => updateMere("nom", e.target.value)} placeholder="Nom" />
                <div className="mt-2">
                  <Input value={data.mere.prenom} onChange={(e) => updateMere("prenom", e.target.value)} placeholder="Prénom" />
                </div>
              </ModernFormField>
              <ModernFormField label="Adresse de la mère (si différente)" helpText="Facultatif">
                <AddressAutocompleteField value={data.mere.adresse} onChange={(val) => updateMere("adresse", val)} placeholder="Adresse de la mère" />
              </ModernFormField>
              <ModernFormField label="Numéro de téléphone de la mère" required>
                <Input value={data.mere.telephone} onChange={(e) => updateMere("telephone", e.target.value)} />
              </ModernFormField>
              <ModernFormField label="Adresse e-mail de la mère" required>
                <Input type="email" value={data.mere.email} onChange={(e) => updateMere("email", e.target.value)} />
              </ModernFormField>
            </div>
          )}

          {data.autorite === "pere" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ModernFormField label="Nom et prénom du père" required>
                <Input value={data.pere.nom} onChange={(e) => updatePere("nom", e.target.value)} placeholder="Nom" />
                <div className="mt-2">
                  <Input value={data.pere.prenom} onChange={(e) => updatePere("prenom", e.target.value)} placeholder="Prénom" />
                </div>
              </ModernFormField>
              <ModernFormField label="Adresse du père (si différente)" helpText="Facultatif">
                <AddressAutocompleteField value={data.pere.adresse} onChange={(val) => updatePere("adresse", val)} placeholder="Adresse du père" />
              </ModernFormField>
              <ModernFormField label="Numéro de téléphone du père" required>
                <Input value={data.pere.telephone} onChange={(e) => updatePere("telephone", e.target.value)} />
              </ModernFormField>
              <ModernFormField label="Adresse e-mail du père" required>
                <Input type="email" value={data.pere.email} onChange={(e) => updatePere("email", e.target.value)} />
              </ModernFormField>
            </div>
          )}

          {data.autorite === "les_deux" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ModernFormField label="Nom et prénom de la mère" required>
                  <Input value={data.mere.nom} onChange={(e) => updateMere("nom", e.target.value)} placeholder="Nom" />
                  <div className="mt-2">
                    <Input value={data.mere.prenom} onChange={(e) => updateMere("prenom", e.target.value)} placeholder="Prénom" />
                  </div>
                </ModernFormField>
                <ModernFormField label="Adresse de la mère (si différente)" helpText="Facultatif">
                  <AddressAutocompleteField value={data.mere.adresse} onChange={(val) => updateMere("adresse", val)} placeholder="Adresse de la mère" />
                </ModernFormField>
                <ModernFormField label="Numéro de téléphone de la mère" required>
                  <Input value={data.mere.telephone} onChange={(e) => updateMere("telephone", e.target.value)} />
                </ModernFormField>
                <ModernFormField label="Adresse e-mail de la mère" required>
                  <Input type="email" value={data.mere.email} onChange={(e) => updateMere("email", e.target.value)} />
                </ModernFormField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ModernFormField label="Nom et prénom du père" required>
                  <Input value={data.pere.nom} onChange={(e) => updatePere("nom", e.target.value)} placeholder="Nom" />
                  <div className="mt-2">
                    <Input value={data.pere.prenom} onChange={(e) => updatePere("prenom", e.target.value)} placeholder="Prénom" />
                  </div>
                </ModernFormField>
                <ModernFormField label="Adresse du père (si différente)" helpText="Facultatif">
                  <AddressAutocompleteField value={data.pere.adresse} onChange={(val) => updatePere("adresse", val)} placeholder="Adresse du père" />
                </ModernFormField>
                <ModernFormField label="Numéro de téléphone du père" required>
                  <Input value={data.pere.telephone} onChange={(e) => updatePere("telephone", e.target.value)} />
                </ModernFormField>
                <ModernFormField label="Adresse e-mail du père" required>
                  <Input type="email" value={data.pere.email} onChange={(e) => updatePere("email", e.target.value)} />
                </ModernFormField>
              </div>
            </div>
          )}

          {data.autorite === "tuteur" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ModernFormField label="Nom et prénom du tuteur" required>
                <Input value={data.tuteur.nom} onChange={(e) => updateTuteur("nom", e.target.value)} placeholder="Nom" />
                <div className="mt-2">
                  <Input
                    value={data.tuteur.prenom}
                    onChange={(e) => updateTuteur("prenom", e.target.value)}
                    placeholder="Prénom"
                  />
                </div>
              </ModernFormField>
              <ModernFormField label="Ville du Tribunal / JAF" required>
                <Input value={data.tuteur.tribunalVille} onChange={(e) => updateTuteur("tribunalVille", e.target.value)} />
              </ModernFormField>
              <ModernFormField label="Date de l’ordonnance de désignation" required>
                <Input
                  type="date"
                  value={data.tuteur.dateOrdonnance}
                  onChange={(e) => updateTuteur("dateOrdonnance", e.target.value)}
                />
              </ModernFormField>
              <ModernFormField label="Adresse du tuteur" required>
                <AddressAutocompleteField value={data.tuteur.adresse} onChange={(val) => updateTuteur("adresse", val)} placeholder="Adresse du tuteur" />
              </ModernFormField>
              <ModernFormField label="Numéro de téléphone du tuteur" required>
                <Input value={data.tuteur.telephone} onChange={(e) => updateTuteur("telephone", e.target.value)} />
              </ModernFormField>
              <ModernFormField label="Adresse e-mail du tuteur" required>
                <Input type="email" value={data.tuteur.email} onChange={(e) => updateTuteur("email", e.target.value)} />
              </ModernFormField>
            </div>
          )}

          {data.autorite === "autre" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ModernFormField label="Merci de décrire qui exerce l’autorité parentale" required>
                <Textarea
                  value={data.autre.description}
                  onChange={(e) => updateAutre("description", e.target.value)}
                  rows={4}
                />
              </ModernFormField>
              <ModernFormField label="Nom et prénom de la personne qui signera la vente" required>
                <Input
                  value={data.autre.signataireNom}
                  onChange={(e) => updateAutre("signataireNom", e.target.value)}
                  placeholder="Nom"
                />
                <div className="mt-2">
                  <Input
                    value={data.autre.signatairePrenom}
                    onChange={(e) => updateAutre("signatairePrenom", e.target.value)}
                    placeholder="Prénom"
                  />
                </div>
              </ModernFormField>
              <ModernFormField label="Numéro de téléphone de cette personne" required>
                <Input
                  value={data.autre.telephone}
                  onChange={(e) => updateAutre("telephone", e.target.value)}
                />
              </ModernFormField>
              <ModernFormField label="Adresse e-mail de cette personne" required>
                <Input
                  type="email"
                  value={data.autre.email}
                  onChange={(e) => updateAutre("email", e.target.value)}
                />
              </ModernFormField>
            </div>
          )}
        </div>
      </ModernFormSection>

      <ModernFormSection title="Précisions complémentaires" icon={<Info className="h-5 w-5" />}>
        <ModernFormField label="Souhaitez-vous apporter des précisions complémentaires ?" helpText="Zone libre (facultatif)">
          <Textarea value={data.precisions} onChange={(e) => update("precisions", e.target.value)} rows={3} />
        </ModernFormField>
      </ModernFormSection>
    </div>
  )
}

function MajeurProtegeSection({
  data,
  onChange
}: {
  data: MajeurProtegeSeller
  onChange: (data: MajeurProtegeSeller) => void
}) {
  const update = (key: keyof MajeurProtegeSeller, value: any) => onChange({ ...data, [key]: value })

  return (
    <div className="space-y-6">
      <ModernFormSection title="Identification du majeur protégé" icon={<User className="h-5 w-5" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ModernFormField label="Nom" required>
            <Input value={data.nom} onChange={(e) => update("nom", e.target.value)} />
          </ModernFormField>
          <ModernFormField label="Prénom" required>
            <Input value={data.prenom} onChange={(e) => update("prenom", e.target.value)} />
          </ModernFormField>
          <ModernFormField label="Date de naissance" required>
            <Input type="date" value={data.dateNaissance} onChange={(e) => update("dateNaissance", e.target.value)} />
          </ModernFormField>
          <ModernFormField label="Lieu de naissance" required helpText="Format : 33000 Ville">
            <CommuneAutocompleteInput
              value={data.lieuNaissance}
              onChange={(val) => update("lieuNaissance", val)}
              placeholder="Ex: 33000 Bordeaux"
            />
          </ModernFormField>
          <ModernFormField label="Nationalité" required>
            <Input value={data.nationalite} onChange={(e) => update("nationalite", e.target.value)} />
          </ModernFormField>
          <ModernFormField label="Adresse de résidence" required>
            <AddressAutocompleteField value={data.adresse} onChange={(val) => update("adresse", val)} placeholder="Adresse de résidence" />
          </ModernFormField>
        </div>
      </ModernFormSection>

      <ModernFormSection title="Mesure de protection" icon={<Shield className="h-5 w-5" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ModernFormField label="Type de mesure" required>
            <Select value={data.mesure} onValueChange={(val) => update("mesure", val)}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="curatelle">Curatelle</SelectItem>
                <SelectItem value="tutelle">Tutelle</SelectItem>
                <SelectItem value="habilitation">Habilitation familiale</SelectItem>
                <SelectItem value="sauvegarde">Sauvegarde de justice</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </ModernFormField>
          <ModernFormField label="Précisions sur la mesure" required>
            <Textarea value={data.mesureDetails} onChange={(e) => update("mesureDetails", e.target.value)} rows={3} />
          </ModernFormField>
          <ModernFormField label="Nom et prénom du représentant légal / mandataire" required>
            <Input value={data.representantNom} onChange={(e) => update("representantNom", e.target.value)} placeholder="Nom" />
            <div className="mt-2">
              <Input
                value={data.representantPrenom}
                onChange={(e) => update("representantPrenom", e.target.value)}
                placeholder="Prénom"
              />
            </div>
          </ModernFormField>
          <ModernFormField label="Qualité / fonction" required>
            <Input
              value={data.representantQualite}
              onChange={(e) => update("representantQualite", e.target.value)}
              placeholder="Curateur, tuteur, mandataire..."
            />
          </ModernFormField>
          <ModernFormField label="Base juridique (décision, mandat…)" required>
            <Textarea value={data.baseJuridique} onChange={(e) => update("baseJuridique", e.target.value)} rows={3} />
          </ModernFormField>
          <ModernFormField label="Téléphone du représentant" required>
            <Input value={data.telephone} onChange={(e) => update("telephone", e.target.value)} />
          </ModernFormField>
          <ModernFormField label="Adresse e-mail du représentant" required>
            <Input type="email" value={data.email} onChange={(e) => update("email", e.target.value)} />
          </ModernFormField>
        </div>
      </ModernFormSection>

      <ModernFormSection title="Précisions complémentaires" icon={<Info className="h-5 w-5" />}>
        <ModernFormField label="Souhaitez-vous apporter des précisions complémentaires ?" helpText="Zone libre (facultatif)">
          <Textarea value={data.precisions} onChange={(e) => update("precisions", e.target.value)} rows={3} />
        </ModernFormField>
      </ModernFormSection>
    </div>
  )
}

function AutreSituationSection({
  data,
  onChange
}: {
  data: AutreSituation
  onChange: (data: AutreSituation) => void
}) {
  const update = (key: keyof AutreSituation, value: string) => onChange({ ...data, [key]: value })

  return (
    <ModernFormSection
      title="Autre situation"
      subtitle="Zone libre pour décrire une situation non prévue"
      icon={<AlertCircle className="h-5 w-5" />}
    >
      <div className="space-y-4">
        <ModernFormField label="Merci de décrire la situation" required>
          <Textarea value={data.description} onChange={(e) => update("description", e.target.value)} rows={4} />
        </ModernFormField>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ModernFormField label="Nom du contact / signataire principal" required>
            <Input value={data.contactNom} onChange={(e) => update("contactNom", e.target.value)} placeholder="Nom" />
            <div className="mt-2">
              <Input value={data.contactPrenom} onChange={(e) => update("contactPrenom", e.target.value)} placeholder="Prénom" />
            </div>
          </ModernFormField>
          <ModernFormField label="Téléphone" required>
            <Input value={data.telephone} onChange={(e) => update("telephone", e.target.value)} />
          </ModernFormField>
          <ModernFormField label="Adresse e-mail" required>
            <Input type="email" value={data.email} onChange={(e) => update("email", e.target.value)} />
          </ModernFormField>
        </div>
      </div>
    </ModernFormSection>
  )
}

export default function AcquereurFormPage() {
  const router = useRouter()
  const [state, setState] = useState<AcquereurFormState>(defaultState)
  const [showIndivisionModal, setShowIndivisionModal] = useState(false)
  const [indivisionCount, setIndivisionCount] = useState(2)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showValidationErrors, setShowValidationErrors] = useState(false)
  const [missingFields, setMissingFields] = useState<Record<string, boolean>>({})
  const acquereurTypeIndexRef = useRef(0)

  const isCouple =
    state.type === "couple_madame_madame" ||
    state.type === "couple_monsieur_madame" ||
    state.type === "couple_monsieur_monsieur"
  const isIndivision = state.type === "indivision"

  const scrollToFirstMissing = (paths: string[]) => {
    if (!paths.length) return
    const firstId = `field-${paths[0].replace(/\./g, "-")}`
    const el = document.getElementById(firstId)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" })
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const validatePerson = (p: PersonneBuyer, prefix: string): string[] => {
    const missing: string[] = []
    const require = (key: string, cond: boolean = true) => {
      if (cond && (!p[key as keyof PersonneBuyer] || String(p[key as keyof PersonneBuyer]).trim() === "")) {
        missing.push(`${prefix}.${key}`)
      }
    }
    require("civilite")
    require("nom")
    require("prenom")
    require("dateNaissance")
    require("lieuNaissance")
    require("nationalite")
    require("adresse")
    require("telephone")
    require("email")
    require("residenceFiscaleFrance")
    if (p.residenceFiscaleFrance === "non") {
      require("residenceFiscalePays")
      require("residenceFiscaleAdresse")
    }
    require("situationMatrimoniale")
    if (p.representation.seraPresent === "non") {
      if (!p.representation.representantNom.trim()) missing.push(`${prefix}.representantNom`)
      if (!p.representation.representantPrenom.trim()) missing.push(`${prefix}.representantPrenom`)
      if (!p.representation.representantTelephone.trim()) missing.push(`${prefix}.representantTelephone`)
      if (!p.representation.representantEmail.trim()) missing.push(`${prefix}.representantEmail`)
    }
    if (p.notaireDesigne === "oui") {
      if (!p.notaireNom.trim()) missing.push(`${prefix}.notaireNom`)
      if (!p.notaireVille.trim()) missing.push(`${prefix}.notaireVille`)
    }
    return missing
  }

  const handleSubmit = async () => {
    setShowValidationErrors(false)
    setMissingFields({})
    const missing: string[] = []

    const seededIndivision =
      state.type === "indivision"
        ? state.indivision.map((p, idx) => (idx === 0 ? { ...p, ...state.personne } : p))
        : []
    const indivisionData = state.type === "indivision" ? buildIndivisionData({ ...state, indivision: seededIndivision }) : []

    if (state.type === "personne_seule") {
      missing.push(...validatePerson(state.personne, "personne"))
    }

    if (state.type === "indivision") {
      // Valider uniquement les fiches des acquéreurs sélectionnés dans vendeursARemplir
      // L'acquéreur 1 (index 0) doit toujours être validé
      const indexesToValidate = indivisionData
        .map((_, idx) => idx)
        .filter((idx) => {
          const vendeurARemplir = state.vendeursARemplir[idx] ?? (idx === 0 ? true : false)
          return vendeurARemplir
        })
      
      indexesToValidate.forEach((idx) => {
        const prefix = idx === 0 ? "personne" : `indivision.${idx}`
        missing.push(...validatePerson(indivisionData[idx], prefix))
      })
    }
    if (isCouple) {
      missing.push(...validatePerson(state.couple.vendeur1, "couple.vendeur1"))
      missing.push(...validatePerson(state.couple.vendeur2, "couple.vendeur2"))
    }

    if (missing.length) {
      const map: Record<string, boolean> = {}
      missing.forEach((m) => (map[m] = true))
      setMissingFields(map)
      setShowValidationErrors(true)
      toast.error("Veuillez compléter les champs obligatoires.")
      scrollToFirstMissing(missing)
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)
    try {
      const payload =
        state.type === "indivision"
          ? {
              ...state,
              personne: indivisionData[0] || state.personne,
              indivision: indivisionData
            }
          : state

      const response = await fetch("/api/generer-pdf-acquereur", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
      const result = await response.json()
      if (result?.success) {
        setIsSuccess(true)
        toast.success("Formulaire acquéreur envoyé à l'agence.")
      } else {
        setErrorMessage(result?.error || "Une erreur est survenue.")
        toast.error("Erreur lors de l'envoi.")
      }
    } catch (e) {
      setErrorMessage("Impossible d'envoyer le formulaire. Vérifiez votre connexion et réessayez.")
      toast.error("Erreur lors de l'envoi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const identificationList = useMemo(
    () => computeIdentificationList(state.identificationRapide, state.nombreVendeurs, isCouple),
    [state.identificationRapide, state.nombreVendeurs, isCouple]
  )

  const updateIdentification = (index: number, field: "nom" | "prenom", value: string) => {
    setState((prev) => {
      const next = identificationList.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
      
      if (prev.type === "indivision") {
        const nextIndivision = resizePersonList(prev.indivision, Math.max(prev.nombreVendeurs, next.length)).map((person, idx) =>
          idx === index ? { ...person, [field]: value } : person
        )
        
        // Pour l'acquéreur 1 (index 0), synchroniser aussi avec state.personne
        const nextPersonne = index === 0 ? { ...prev.personne, [field]: value } : prev.personne
        
        return { ...prev, identificationRapide: next, indivision: nextIndivision, personne: nextPersonne }
      }

      return { ...prev, identificationRapide: next }
    })
  }

  const updateIndivisionPerson = (index: number, data: PersonneBuyer) => {
    setState((prev) => {
      const nextIndivision = resizePersonList(prev.indivision, Math.max(prev.nombreVendeurs, index + 1))
      nextIndivision[index] = data

      const isCoupleType =
        prev.type === "couple_madame_madame" ||
        prev.type === "couple_monsieur_madame" ||
        prev.type === "couple_monsieur_monsieur"

      // Synchroniser avec identificationRapide : utiliser les valeurs de data si elles existent, sinon garder les valeurs existantes
      const currentIdentification = computeIdentificationList(prev.identificationRapide, prev.nombreVendeurs, isCoupleType)
      const nextIdentification = currentIdentification.map((item, idx) =>
        idx === index
          ? {
              nom: data.nom.trim() || item.nom,
              prenom: data.prenom.trim() || item.prenom
            }
          : item
      )

      return {
        ...prev,
        personne: index === 0 ? data : prev.personne,
        indivision: nextIndivision,
        identificationRapide: nextIdentification
      }
    })
  }

  const buildIndivisionData = (currentState: AcquereurFormState) => {
    const names = computeIdentificationList(currentState.identificationRapide, currentState.nombreVendeurs, false)
    const list = resizePersonList(currentState.indivision, currentState.nombreVendeurs)

    return list.map((person, idx) => ({
      ...person,
      nom: person.nom || names[idx]?.nom || "",
      prenom: person.prenom || names[idx]?.prenom || ""
    }))
  }

  const handleTypeChange = (value: AcquereurType) => {
    setState((prev) => {
      // Couples forcés à 2, personne seule forcée à 1, indivision libre (min 2 par défaut)
      const isCoupleType = value.startsWith("couple")
      const isPersonneSeule = value === "personne_seule"
      const isIndivision = value === "indivision"
      const baseNombre = isIndivision ? Math.max(prev.nombreVendeurs, 2) : prev.nombreVendeurs
      const nextNombre = isCoupleType ? 2 : isPersonneSeule ? 1 : baseNombre

      // Initialiser vendeursARemplir pour indivision : acquéreur 1 toujours true, autres selon l'état actuel ou false par défaut
      let nextVendeursARemplir = prev.vendeursARemplir || [true]
      if (isIndivision) {
        // S'assurer que l'acquéreur 1 est toujours true
        nextVendeursARemplir = Array.from({ length: nextNombre }, (_, idx) => {
          if (idx === 0) return true
          return prev.vendeursARemplir?.[idx] ?? false
        })
      } else {
        // Pour les autres types, garder seulement le vendeur 1
        nextVendeursARemplir = [true]
      }

      return {
        ...prev,
        type: value,
        nombreVendeurs: nextNombre,
        indivision: isIndivision ? resizePersonList(prev.indivision, nextNombre) : prev.indivision,
        vendeursARemplir: nextVendeursARemplir
      }
    })

    if (value === "indivision") {
      setIndivisionCount(state.nombreVendeurs && state.nombreVendeurs > 1 ? state.nombreVendeurs : 2)
      setShowIndivisionModal(true)
    } else {
      setShowIndivisionModal(false)
    }
  }

  const handleNombreChange = (value: string) => {
    const parsed = Math.max(1, Number.parseInt(value, 10) || 1)
    setState((prev) => {
      // Ajuster vendeursARemplir pour maintenir la cohérence : acquéreur 1 toujours true, autres selon leur état actuel ou false par défaut
      const currentVendeursARemplir = prev.vendeursARemplir || [true]
      const nextVendeursARemplir = Array.from({ length: parsed }, (_, idx) => {
        if (idx === 0) return true // Acquéreur 1 toujours true
        return currentVendeursARemplir[idx] ?? false
      })

      return {
        ...prev,
        nombreVendeurs: parsed,
        indivision: prev.type === "indivision" ? resizePersonList(prev.indivision, parsed) : prev.indivision,
        vendeursARemplir: nextVendeursARemplir
      }
    })
  }

  const handleSaveDraft = () => {
    toast.success("Brouillon acquéreur enregistré localement (aucun envoi déclenché).")
  }

  const fillWithTestData = () => {
    // Rotation séquentielle du type de vendeur
    acquereurTypeIndexRef.current = (acquereurTypeIndexRef.current + 1) % acquereurTypeOptions.length
    const nextType = acquereurTypeOptions[acquereurTypeIndexRef.current].value
    
    // Choisir aléatoirement une situation matrimoniale
    const randomSituation = pickRandom(situationOptions).value
    
    setState((prev) => {
      const vendeur1 = buildSamplePersonBuyer(1, randomSituation)
      const vendeur2 = buildSamplePersonBuyer(2, randomSituation)
      const vendeur3 = buildSamplePersonBuyer(3, randomSituation)
      const sellerCount =
        nextType === "personne_seule"
          ? 1
          : nextType.startsWith("couple")
            ? 2
            : nextType === "indivision"
              ? Math.max(prev.nombreVendeurs, 3)
              : 1

      const identification = Array.from({ length: sellerCount }, (_, idx) => {
        const person = [vendeur1, vendeur2, vendeur3][idx] || buildSamplePersonBuyer(idx + 1, randomSituation)
        return { nom: person.nom, prenom: person.prenom }
      })

      const indivisionList = Array.from({ length: sellerCount }, (_, idx) => {
        return [vendeur1, vendeur2, vendeur3][idx] || buildSamplePersonBuyer(idx + 1, randomSituation)
      })

      return {
        ...prev,
        type: nextType,
        nombreVendeurs: sellerCount,
        identificationRapide: identification,
        personne: vendeur1,
        couple: { vendeur1, vendeur2, synchroniserSituation: true },
        indivision: indivisionList,
        vendeursARemplir: Array.from({ length: sellerCount }, () => true),
        societe: buildSampleSociete(),
        ei: buildSampleEI(),
        association: buildSampleAssociation(),
        personneMorale: buildSamplePersonneMorale(),
        mineur: buildSampleMineur(),
        majeurProtege: buildSampleMajeurProtege(),
        autreSituation: buildSampleAutre()
      }
    })
    
    setShowValidationErrors(false)
    setMissingFields({})
    setErrorMessage(null)
    toast.success("Champs préremplis avec des données fictives pour vos tests PDF.")
  }

  // handleSubmit moved below with validation

  return (
    <div className="min-h-screen bg-slate-50">
      <LoadingOverlay
        show={isSubmitting || isSuccess}
        isSuccess={isSuccess}
        onClose={() => {
          setIsSuccess(false)
          router.push("/")
        }}
      />

      {errorMessage && (
        <ErrorMessage
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}

      {showIndivisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Indivision / héritiers</h2>
                <p className="text-sm text-slate-600">
                  Si vous êtes plusieurs acquéreurs, chaque personne doit remplir sa propre fiche. Vous pourrez partager le lien.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Combien d'acquéreurs achètent ce bien ?</label>
              <Input
                type="number"
                min={1}
                value={indivisionCount}
                onChange={(e) => setIndivisionCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
              />
              <p className="text-xs text-slate-500">Vous pourrez encore ajuster ce nombre ensuite.</p>
            </div>
            <div className="flex items-center justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowIndivisionModal(false)}>
                Annuler
              </Button>
              <Button
                onClick={() => {
                  setState((prev) => ({
                    ...prev,
                    nombreVendeurs: indivisionCount,
                    indivision: resizePersonList(prev.indivision, indivisionCount)
                  }))
                  setShowIndivisionModal(false)
                }}
                className="bg-amber-600 hover:bg-amber-700"
              >
                Valider
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 pt-safe">
        <div className="max-w-6xl mx-auto space-y-3">
          <Button variant="ghost" size="lg" onClick={() => router.push("/")} className="flex items-center gap-3 h-14 px-6 text-base">
            <ArrowLeft className="h-6 w-6" />
            Retour
          </Button>
          <div className="flex items-start gap-3">
            <FileText className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h1 className="text-xl font-semibold text-slate-900 leading-tight">Fiche de renseignements acquéreur</h1>
              <p className="text-sm text-slate-600">
                Onglet acquéreur – Étape 1 : Qui est l'acquéreur ? Branches complètes pour personnes, couples, sociétés et cas
                particuliers. Informations utiles pour la rédaction du compromis de vente.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
        <Card className="p-4 sm:p-6 shadow-lg border-0 bg-gradient-to-br from-amber-50/60 to-orange-50/40">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-amber-900">Nombre d'acquéreurs et partage du formulaire</h2>
              <p className="text-sm text-amber-800">
                Si vous êtes plusieurs vendeurs (indivision, héritiers, etc.), chaque vendeur doit remplir sa propre fiche de
                renseignements. Vous pouvez partager le lien de ce formulaire aux autres vendeurs pour qu’ils complètent leurs
                informations.
              </p>
            </div>
          </div>
        </Card>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-amber-900">Mode test : préremplissage automatique</p>
              <p className="text-xs text-amber-800">Remplit les branches clés avec des données fictives pour vérifier l’envoi du PDF.</p>
            </div>
          </div>
          <Button
            type="button"
            onClick={fillWithTestData}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Remplir automatiquement
          </Button>
        </div>

        <ModernFormSection
          title="Profil de l'acquéreur"
          subtitle="Type d'acquéreur (V0), nombre d'acquéreurs (G0) et identification rapide (G1)"
          icon={<Tag className="h-5 w-5 text-amber-600" />}
          isActive
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ModernFormField label="Qui est l'acquéreur ?" required>
              <Select value={state.type} onValueChange={(val: AcquereurType) => handleTypeChange(val)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Choisir un type d'acquéreur" />
                </SelectTrigger>
                <SelectContent>
                  {acquereurTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ModernFormField>

            <ModernFormField label="Combien d'acquéreurs achètent ce bien ?" required>
              <Input
                type="number"
                min={1}
                disabled={isCouple || state.type === "personne_seule"}
                value={state.nombreVendeurs}
                onChange={(e) => handleNombreChange(e.target.value)}
              />
              {isCouple && <p className="text-xs text-slate-500 mt-1">Fixé à 2 acquéreurs pour la branche couple.</p>}
              {state.type === "personne_seule" && (
                <p className="text-xs text-slate-500 mt-1">Fixé à 1 acquéreur pour une personne seule.</p>
              )}
              {state.type === "indivision" && (
                <p className="text-xs text-slate-600 mt-2">
                  Indiquez le nombre total d'acquéreurs (indivision, héritiers...). Chaque personne remplira sa fiche.
                </p>
              )}
            </ModernFormField>
          </div>

          {state.type !== "personne_seule" && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50">
                  G1
                </Badge>
                <p className="text-sm text-slate-700">Merci d’indiquer le nom et le prénom de chaque vendeur :</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {identificationList.map((vendeur, index) => {
                  const isVendeur1 = index === 0
                  const vendeurARemplir = state.vendeursARemplir[index] ?? (isVendeur1 ? true : false)
                  
                  return (
                    <div key={`vendeur-${index}`} className="p-4 border border-slate-200 rounded-lg bg-white shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-amber-600" />
                          <p className="text-sm font-semibold text-slate-800">Acquéreur {index + 1}</p>
                        </div>
                        <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200">
                          Identification rapide
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        <Input
                          value={vendeur.nom}
                          onChange={(e) => updateIdentification(index, "nom", e.target.value)}
                          placeholder="Nom"
                          autoComplete="family-name"
                        />
                        <Input
                          value={vendeur.prenom}
                          onChange={(e) => updateIdentification(index, "prenom", e.target.value)}
                          placeholder="Prénom"
                          autoComplete="given-name"
                        />
                      </div>
                      {isIndivision && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
                              checked={vendeurARemplir}
                              disabled={isVendeur1}
                              onChange={(e) => {
                                if (!isVendeur1) {
                                  setState((prev) => {
                                    const nextVendeursARemplir = [...(prev.vendeursARemplir || [])]
                                    while (nextVendeursARemplir.length <= index) {
                                      nextVendeursARemplir.push(false)
                                    }
                                    nextVendeursARemplir[index] = e.target.checked
                                    // S'assurer que le vendeur 1 est toujours true
                                    if (nextVendeursARemplir[0] !== true) {
                                      nextVendeursARemplir[0] = true
                                    }
                                    return { ...prev, vendeursARemplir: nextVendeursARemplir }
                                  })
                                }
                              }}
                            />
                            <span className={isVendeur1 ? "text-slate-500" : ""}>
                              {isVendeur1 ? "Remplir la fiche de cet acquéreur (obligatoire)" : "Remplir la fiche de cet acquéreur"}
                            </span>
                          </label>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </ModernFormSection>

        {state.type === "personne_seule" ? (
          <PersonBuyerCard
            title="Fiche acquéreur – personne seule"
            data={state.personne}
            onChange={(data) => setState((prev) => ({ ...prev, personne: data }))}
            showCivilite
            showValidationErrors={showValidationErrors}
            missing={missingFields}
            pathPrefix="personne"
          />
        ) : null}

        {isCouple && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-600" />
              <h3 className="text-lg font-semibold text-slate-900">Branche couple : deux fiches symétriques</h3>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 flex items-start gap-3">
              <BadgeInfo className="h-5 w-5 mt-0.5" />
              <div>
                <p>Pour gagner du temps, la situation matrimoniale de l'acquéreur 2 peut être synchronisée automatiquement.</p>
                <label className="flex items-center gap-2 mt-2 text-amber-900">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={state.couple.synchroniserSituation}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        couple: { ...prev.couple, synchroniserSituation: e.target.checked }
                      }))
                    }
                  />
                  Copier la situation matrimoniale de l'acquéreur 1 vers l'acquéreur 2
                </label>
              </div>
            </div>

            <PersonBuyerCard
              title="Fiche couple – Acquéreur 1"
              data={state.couple.vendeur1}
              onChange={(data) =>
                setState((prev) => ({
                  ...prev,
                  couple: {
                    ...prev.couple,
                    vendeur1: data,
                    vendeur2: prev.couple.synchroniserSituation
                      ? { ...prev.couple.vendeur2, situationMatrimoniale: data.situationMatrimoniale, situationDetails: data.situationDetails }
                      : prev.couple.vendeur2
                  }
                }))
              }
              showResidenceDetails
              showValidationErrors={showValidationErrors}
              missing={missingFields}
              pathPrefix="couple.vendeur1"
            />

            <PersonBuyerCard
              title="Fiche couple – Acquéreur 2"
              data={state.couple.vendeur2}
              onChange={(data) =>
                setState((prev) => ({
                  ...prev,
                  couple: { ...prev.couple, vendeur2: data }
                }))
              }
              showResidenceDetails
              showValidationErrors={showValidationErrors}
              missing={missingFields}
              pathPrefix="couple.vendeur2"
            />
          </div>
        )}

        {state.type === "societe" && (
          <SocieteSection data={state.societe} onChange={(data) => setState((prev) => ({ ...prev, societe: data }))} />
        )}

        {state.type === "entreprise_individuelle" && (
          <EISection data={state.ei} onChange={(data) => setState((prev) => ({ ...prev, ei: data }))} />
        )}

        {state.type === "association" && (
          <AssociationSection data={state.association} onChange={(data) => setState((prev) => ({ ...prev, association: data }))} />
        )}

        {state.type === "personne_morale_autre" && (
          <PersonneMoraleSection
            data={state.personneMorale}
            onChange={(data) => setState((prev) => ({ ...prev, personneMorale: data }))}
          />
        )}

        {state.type === "mineur" && (
          <MineurSection data={state.mineur} onChange={(data) => setState((prev) => ({ ...prev, mineur: data }))} />
        )}

        {state.type === "majeur_protege" && (
          <MajeurProtegeSection
            data={state.majeurProtege}
            onChange={(data) => setState((prev) => ({ ...prev, majeurProtege: data }))}
          />
        )}

        {isIndivision && (
          <div className="space-y-4">
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
              <Users className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-900">Chaque acquéreur doit remplir sa fiche</p>
                <p className="text-sm text-slate-700">
                  L'acquéreur qui remplit actuellement est considéré comme « Acquéreur 1 ». Il peut compléter uniquement sa fiche ou,
                  s&apos;il le souhaite, remplir également celles des autres acquéreurs.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              {resizePersonList(state.indivision, state.nombreVendeurs)
                .map((personne, index) => {
                  const vendeurARemplir = state.vendeursARemplir[index] ?? (index === 0 ? true : false)
                  return { personne, index, vendeurARemplir }
                })
                .filter(({ vendeurARemplir }) => vendeurARemplir)
                .map(({ personne, index }) => (
                  <PersonBuyerCard
                    key={`indivision-${index}`}
                    title={`Fiche acquéreur ${index + 1} ${index === 0 ? "(vous)" : ""}`.trim()}
                    data={personne}
                    onChange={(data) => updateIndivisionPerson(index, data)}
                    showCivilite
                    showResidenceDetails
                    showValidationErrors={showValidationErrors}
                    missing={missingFields}
                    pathPrefix={index === 0 ? "personne" : `indivision.${index}`}
                  />
                ))}
            </div>
            {state.vendeursARemplir.filter((v, idx) => idx > 0 && !v).length > 0 && (
              <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-700">
                Pensez à partager le lien de ce formulaire aux autres acquéreurs pour qu&apos;ils remplissent leur fiche de renseignements
                de leur côté.
              </div>
            )}
          </div>
        )}

        {state.type === "autre" && (
          <AutreSituationSection data={state.autreSituation} onChange={(data) => setState((prev) => ({ ...prev, autreSituation: data }))} />
        )}

        <div className="flex items-center justify-center gap-3 pt-4">
          <Button
            variant="outline"
            className="px-6"
            onClick={() => router.push("/")}
          >
            Retour à l’accueil
          </Button>
          <Button
            className="px-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Envoi en cours..." : "Envoyer à l'agence"}
          </Button>
          <Button
            variant="outline"
            className="px-6 border-amber-200 text-amber-700 hover:bg-amber-50"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href)
              toast.success("Lien copié dans le presse-papiers")
            }}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copier le lien
          </Button>
        </div>
      </div>
    </div>
  )
}
