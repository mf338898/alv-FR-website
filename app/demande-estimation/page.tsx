import Link from "next/link"
import Image from "next/image"
import { MessageSquareText, Home, Phone, Mail, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DemandeEstimationLandingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto w-full max-w-md px-4 py-8 sm:py-10">
        <div className="mb-8 text-center">
          <div className="mb-3 flex justify-center">
            <Image
              src="/images/logo-alv-2.jpg"
              alt="Logo ALV Immobilier Pleyben"
              width={160}
              height={52}
              className="h-10 w-auto"
              priority
            />
          </div>
          <p className="text-xs tracking-wide text-slate-500">ALV Immobilier – Pleyben</p>
          <h1 className="mt-3 text-2xl font-semibold leading-tight text-slate-900">
            Vous vendez, vous louez ou vous cherchez un bien ?
          </h1>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            Indiquez votre demande en quelques clics.
            <br />
            Nous vous recontactons rapidement.
          </p>
        </div>

        <div className="space-y-4">
          <Card className="border border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-slate-900">Vous souhaitez une estimation ?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                Demandez une estimation de votre bien.
              </p>
              <Button asChild className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white">
                <a
                  href="https://online.jestimo.com/?uid=20bS969ad18841554cXy547671v7P200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Demander une estimation
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-slate-900">Vous avez une autre demande ?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                Vente, location, recherche de bien : envoyez-nous votre demande.
              </p>
              <Button asChild variant="outline" className="w-full h-11 border-slate-300 text-slate-800 hover:bg-slate-100">
                <a
                  href="https://www.alvimmobilier.bzh/catalog/contact_us.php?form=1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageSquareText className="h-4 w-4 mr-2" />
                  Envoyer votre demande
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-5 border border-slate-200 shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-800">Nous contacter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button asChild variant="outline" size="sm" className="h-auto py-2 justify-start border-slate-200 text-slate-700 hover:bg-slate-100 whitespace-normal leading-snug">
                <a href="tel:0298267147">
                  <Phone className="h-4 w-4 mr-2" />
                  Appeler l&apos;agence
                </a>
              </Button>
              <Button asChild variant="outline" size="sm" className="h-auto py-2 justify-start border-slate-200 text-slate-700 hover:bg-slate-100 whitespace-normal leading-snug">
                <a href="mailto:contact@alvimobilier.bzh">
                  <Mail className="h-4 w-4 mr-2" />
                  Envoyer un email
                </a>
              </Button>
              <Button asChild variant="outline" size="sm" className="h-auto py-2 justify-start border-slate-200 text-slate-700 hover:bg-slate-100 whitespace-normal leading-snug sm:col-span-2">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=19+Place+du+General+de+Gaulle+29190+Pleyben"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Voir l&apos;agence
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-xs text-slate-500">
          <p>ALV Immobilier – Pleyben</p>
          <p>Nous vous recontactons dans les meilleurs délais.</p>
        </div>
      </main>
    </div>
  )
}
