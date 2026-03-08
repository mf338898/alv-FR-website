import { FileText, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const MAIL_SUBJECT = encodeURIComponent("Envoi de pièces justificatives - Dossier locataire")
const MAIL_BODY = encodeURIComponent(
  "Bonjour,\n\nVeuillez trouver ci-joint les pièces justificatives demandées pour mon dossier locataire.\n\nNom :\nPrénom :\nBien concerné (si connu) :\n\nCordialement,"
)
const MAILTO_HREF = `mailto:contact@alvimmobilier.bzh?subject=${MAIL_SUBJECT}&body=${MAIL_BODY}`

export default function PiecesJustificativesPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Card className="border border-slate-200 shadow-sm bg-white">
          <CardHeader className="border-b border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-sky-100 text-sky-700">
                <FileText className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-semibold text-slate-900">
                Pièces justificatives à prévoir après la visite
              </CardTitle>
            </div>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              La fiche de renseignements vous permet de préparer votre dossier locataire.
              <br />
              Si vous confirmez votre intérêt après la visite, nous vous demanderons ensuite les pièces justificatives ci-dessous afin de transmettre votre dossier au propriétaire.
            </p>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 space-y-6">
            <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900 leading-relaxed">
              Pour un traitement plus simple et plus rapide de votre dossier, merci de transmettre vos documents de préférence en format PDF.
              <br />
              Merci d’éviter les photos lorsque cela est possible, afin de garantir une bonne lisibilité des pièces.
            </div>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">1. Justificatif de domicile</h2>
              <ul className="list-disc pl-5 text-sm sm:text-base text-slate-700 space-y-1">
                <li>3 dernières quittances de loyer si vous êtes locataire</li>
                <li>ou attestation d’hébergement si vous êtes hébergé(e)</li>
                <li>ou dernière taxe foncière si vous êtes propriétaire</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">2. Justificatifs de ressources</h2>
              <ul className="list-disc pl-5 text-sm sm:text-base text-slate-700 space-y-1">
                <li>dernier avis d’imposition</li>
                <li>ou les 2 derniers avis d’imposition en cas de location « loi Pinel »</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">3. Justificatifs d’activité professionnelle</h2>
              <ul className="list-disc pl-5 text-sm sm:text-base text-slate-700 space-y-1">
                <li>contrat de travail</li>
                <li>3 derniers bulletins de salaire</li>
                <li>ou 2 derniers bilans pour les travailleurs indépendants</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">4. Garantie</h2>
              <ul className="list-disc pl-5 text-sm sm:text-base text-slate-700 space-y-1">
                <li>le cas échéant, certificat Visale</li>
                <li>pour tout cautionnaire éventuel : les mêmes pièces justificatives devront être transmises</li>
              </ul>
            </section>

            <div className="pt-2">
              <Button asChild className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                <a href={MAILTO_HREF}>
                  <Mail className="h-4 w-4 mr-2" />
                  Envoyer mes pièces
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
