import type { CriteresRecherche, GarantContact, Garanties, Locataire, RevenuAdditionnel } from "./types"

const firstNames = ["Alex", "Camille", "Louis", "Emma", "Chloe", "Hugo", "Lena", "Noah", "Zoe", "Ethan"]
const lastNames = ["Martin", "Bernard", "Dubois", "Durand", "Moreau", "Lefevre", "Roux", "Petit", "Robert", "Richard"]
const streets = ["rue de la Paix", "avenue des Lilas", "boulevard Voltaire", "chemin des Arts", "rue Victor Hugo", "rue des Jardins"]
const cities = ["Paris", "Lyon", "Marseille", "Bordeaux", "Nantes", "Toulouse", "Lille", "Strasbourg"]
const companies = ["Nova Conseil", "Atelier Urbain", "Hexa Services", "Clairvoyant", "Alpinia", "Studio Atlas"]
const jobs = ["Consultant", "Ingenieur logiciel", "Chef de projet", "Architecte", "Responsable RH", "Analyste financier"]

export const pickRandom = <T,>(list: T[]): T => list[Math.floor(Math.random() * list.length)]

export const buildTestPhone = (): string => `06${Math.floor(10000000 + Math.random() * 90000000)}`

export const buildTestEmail = (label = "test"): string =>
  `${label}-${Math.floor(1000 + Math.random() * 9000)}@alv-test.fr`

export const buildTestAddress = (): string =>
  `${Math.floor(Math.random() * 180) + 12} ${pickRandom(streets)}, ${pickRandom(cities)}`

export const buildTestDate = (startYear = 1970, endYear = 2000): string => {
  const year = Math.floor(Math.random() * (endYear - startYear + 1)) + startYear
  const month = Math.floor(Math.random() * 12) + 1
  const day = Math.floor(Math.random() * 28) + 1
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

export const sampleFirstName = () => pickRandom(firstNames)
export const sampleLastName = () => pickRandom(lastNames)
export const sampleCity = () => pickRandom(cities)
export const sampleJob = () => pickRandom(jobs)
export const sampleCompany = () => pickRandom(companies)

const buildRevenuAdditionnel = (index: number): RevenuAdditionnel => ({
  id: `rev-${Date.now()}-${index}`,
  type: "Prime",
  montant: `${120 + Math.floor(Math.random() * 200)}`,
  precision: "Bonus mensuel"
})

export function createTestLocataire(index = 1, overrides: Partial<Locataire> = {}): Locataire {
  const prenom = sampleFirstName()
  const nom = sampleLastName()
  const base: Locataire = {
    nom,
    prenom,
    civilite: index % 2 ? "Monsieur" : "Madame",
    situationConjugale: "Marié(e)",
    adresseActuelle: buildTestAddress(),
    telephone: buildTestPhone(),
    email: buildTestEmail(`locataire${index}`),
    dateNaissance: buildTestDate(1975, 1999),
    lieuNaissance: sampleCity(),
    situationActuelle: "En poste",
    preavisADeposer: "non",
    dureePreavise: "",
    dureePreaviseAutre: "",
    hebergeParQui: "",
    profession: sampleJob(),
    etablissementFormation: "",
    employeurNom: sampleCompany(),
    employeurAdresse: buildTestAddress(),
    employeurTelephone: buildTestPhone(),
    dateEmbauche: buildTestDate(2016, 2023),
    typeContrat: pickRandom(["CDI", "CDD", "Stage", "Alternance"]),
    salaire: `${2000 + Math.floor(Math.random() * 2000)}`,
    salaireNet: `${2400 + Math.floor(Math.random() * 1200)}`,
    indemnitesChomage: "",
    aahAllocationsHandicap: "",
    rsa: "",
    pension: "",
    revenusAutoEntrepreneur: "",
    aidesAuLogement: "250",
    revenusAdditionnels: [buildRevenuAdditionnel(index)],
    dateFinContrat: "",
    dureeInscriptionInterim: "",
    agenceInterim: "",
    dateDebutActivite: buildTestDate(2018, 2024),
    regimeRetraite: "",
    dateDebutRetraite: "",
    alternance: "",
    typeAlternance: "",
    situationActuelleSansEmploi: "",
    origineRevenuPrincipal: "Salaire",
    origineRevenuPrincipalAutre: "",
    locataireConcerneNom: "",
    locataireConcernePrenom: "",
    locataireConcerneEmail: "",
    locataireConcerneTelephone: "",
  }

  return { ...base, ...overrides }
}

export const createTestCriteres = (): CriteresRecherche => ({
  rechercheType: "location",
  typeBienAchat: "Appartement",
  budgetAchat: "450000",
  financementAchat: "Prêt + apport",
  banqueConsultee: "Crédit municipal",
  nombreChambres: "3",
  secteurSouhaite: sampleCity(),
  rayonKm: "10",
  dateEmmenagement: buildTestDate(new Date().getFullYear(), new Date().getFullYear() + 1),
  preavisADeposer: "non",
  raisonDemenagement: "Mutation professionnelle",
  informationsComplementaires: "Préremplissage automatique pour vérification PDF",
  loyerMax: "1400"
})

export const createTestGaranties = (): Garanties => ({
  garantFamilial: "oui",
  garantieVisale: "non",
  precisionGarant: "Parents se portent garants (données fictives)",
  garants: [
    {
      nom: sampleLastName(),
      prenom: sampleFirstName(),
      email: buildTestEmail("garant"),
      telephone: buildTestPhone()
    }
  ]
})

export const createTestGarantContact = (label = "locataire"): GarantContact => ({
  nom: sampleLastName(),
  prenom: sampleFirstName(),
  email: buildTestEmail(label),
  telephone: buildTestPhone()
})
