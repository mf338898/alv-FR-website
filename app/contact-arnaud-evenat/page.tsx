"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Phone, Mail, MapPin, Copy, CheckCircle2, QrCode, Link2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type ContactField = {
  label: string
  value: string
  copyValue?: string
  href?: string
}

const contactFields: ContactField[] = [
  { label: "Nom", value: "Arnaud Evenat" },
  { label: "Fonction", value: "Responsable d'agence - ALV Immobilier Pleyben" },
  { label: "Téléphone agence", value: "+33 2 98 26 71 47", copyValue: "+33298267147", href: "tel:+33298267147" },
  { label: "Mobile", value: "+33 6 59 85 06 62", copyValue: "+33659850662", href: "tel:+33659850662" },
  { label: "Email", value: "contact@alvimobilier.bzh", href: "mailto:contact@alvimobilier.bzh" },
  { label: "Adresse", value: "19 Pl. Charles de Gaulle, 29190 Pleyben, France" },
  { label: "Site", value: "alvimmobilier.bzh", copyValue: "https://alvimmobilier.bzh", href: "https://alvimmobilier.bzh" },
]

const androidHelp =
  "Après téléchargement : ouvrez la notification “Téléchargé” ou l’app “Fichiers / Téléchargements”. Essayez d’ouvrir le lien dans Chrome si rien ne se passe."
const iphoneHelp = "Si rien ne se passe : ouvrez le lien dans Safari."

export default function ContactArnaudEvenatPage() {
  const [activeTab, setActiveTab] = useState<"iphone" | "android">("iphone")
  const [landingUrl, setLandingUrl] = useState("https://alvimmobilier.bzh/contact-arnaud-evenat")

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLandingUrl(`${window.location.origin}/contact-arnaud-evenat`)
    }
  }, [])

  const handleCopy = async (value: string, label: string) => {
    try {
      if (!navigator?.clipboard) {
        throw new Error("Clipboard unavailable")
      }
      await navigator.clipboard.writeText(value)
      toast.success(`${label} copié`)
    } catch (error) {
      console.error(error)
      toast.error("Copie impossible. Sélectionnez ou appuyez longuement pour copier.")
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
        <header className="max-w-3xl">
          <p className="text-sm font-semibold text-blue-700 mb-2">Enregistrer le contact</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Ajouter Arnaud Evenat</h1>
          <p className="text-lg text-slate-600">
            En 10 secondes : cliquez ci-dessous, puis “Ajouter aux contacts”.
          </p>
        </header>

        <div className="mt-8">
          <Card className="bg-white border-slate-200 shadow-lg">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="h-28 w-28 rounded-full overflow-hidden border-4 border-white shadow-md bg-slate-100">
                  <img
                    src="/images/logo-alv.png"
                    alt="Logo ALV Immobilier"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">ALV Immobilier</p>
                  <h2 className="text-3xl font-bold text-slate-900">Arnaud Evenat</h2>
                  <p className="text-lg text-slate-600">Responsable d'agence – Pleyben</p>
                </div>

                <div className="flex items-center gap-3">
                  <Button asChild size="icon" variant="secondary" className="h-12 w-12 rounded-full">
                    <a href="tel:+33298267147" aria-label="Appeler l’agence">
                      <Phone className="h-5 w-5" />
                    </a>
                  </Button>
                  <Button asChild size="icon" variant="secondary" className="h-12 w-12 rounded-full">
                    <a href="mailto:contact@alvimobilier.bzh" aria-label="Envoyer un email">
                      <Mail className="h-5 w-5" />
                    </a>
                  </Button>
                  <Button asChild size="icon" variant="secondary" className="h-12 w-12 rounded-full">
                    <a href="https://alvimmobilier.bzh" aria-label="Visiter le site">
                      <MapPin className="h-5 w-5" />
                    </a>
                  </Button>
                </div>

                <p className="text-base text-slate-600 max-w-3xl">
                  Ajout en 1 clic → utilisez “Ajouter le contact (.vcf)” ou copiez les coordonnées juste en dessous.
                </p>

                <div className="w-full flex flex-col sm:flex-row gap-3">
                  <Button
                    asChild
                    size="lg"
                    className="flex-1 min-h-[48px] bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                  >
                    <a href="/api/contact-arnaud-evenat">Ajouter le contact (.vcf)</a>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1 min-h-[48px] border-blue-200 text-blue-700"
                    onClick={() => handleCopy(landingUrl, "Lien")}
                  >
                    <Link2 className="h-4 w-4" />
                    Copier le lien
                  </Button>
                </div>

                <div className="w-full space-y-3 pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Informations du contact</p>
                    <p className="text-xs text-slate-600">
                      Si l’ajout automatique ne fonctionne pas, copiez les infos ci-dessous.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {contactFields.map((field) => (
                      <div
                        key={field.label}
                        className="flex items-start justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-3"
                      >
                        <div className="min-w-0">
                          <p className="text-[11px] uppercase tracking-wide text-slate-500">{field.label}</p>
                          <p className="text-slate-900 font-medium leading-snug break-words">
                            {field.href ? (
                              <a href={field.href} className="text-blue-700 hover:underline">
                                {field.value}
                              </a>
                            ) : (
                              field.value
                            )}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 shrink-0 border-slate-200"
                          onClick={() => handleCopy(field.copyValue ?? field.value, field.label)}
                          aria-label={`Copier ${field.label}`}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-900 text-sm flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 mt-0.5" />
                    <p>
                      Enregistrement manuel : copiez le numéro → ouvrez Contacts → “Nouveau contact” → collez → enregistrez.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 mt-8">
          <Card className="bg-white border-slate-200 shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-900">Guides iPhone / Android</CardTitle>
              <p className="text-sm text-slate-600">Parcours guidé + QR code (ouvre cette page).</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex space-x-2 mb-4">
                  <Button
                    variant={activeTab === "iphone" ? "default" : "outline"}
                    onClick={() => setActiveTab("iphone")}
                    className="flex-1"
                  >
                    iPhone
                  </Button>
                  <Button
                    variant={activeTab === "android" ? "default" : "outline"}
                    onClick={() => setActiveTab("android")}
                    className="flex-1"
                  >
                    Android
                  </Button>
                </div>

                {activeTab === "iphone" ? (
                  <div className="space-y-3 text-slate-700">
                    <StepItem text='Touchez "Ajouter le contact (.vcf)"' />
                    <StepItem text='La fiche s’ouvre : touchez "Ajouter aux contacts"' />
                    <StepItem text="Enregistrez" />
                    <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-md p-3">
                      {iphoneHelp}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 text-slate-700">
                    <StepItem text='Touchez "Ajouter le contact (.vcf)"' />
                    <StepItem text="Ouvrez le fichier téléchargé (notification ou dossier Téléchargements)" />
                    <StepItem text="Choisissez Importer / Ajouter aux contacts" />
                    <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-md p-3">
                      {androidHelp}
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-slate-900 font-semibold">
                    <QrCode className="h-5 w-5 text-blue-600" />
                    <span>QR code (ouvre cette page)</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">
                    Ouvrez la caméra → visez le QR → touchez la notification.
                  </p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(landingUrl)}`}
                    alt="QR code vers la page contact"
                    className="h-[180px] w-[180px] sm:h-[200px] sm:w-[200px] object-contain"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function StepItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-white px-3 py-2 shadow-sm">
      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
      <span className="text-sm text-slate-800">{text}</span>
    </div>
  )
}

