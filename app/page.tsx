import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { Shield, Building2, HandCoins, Tag, Phone, Mail, MapPin, CheckCircle2, ArrowRight, Clock, Users, FileText, ChevronDown, Target, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FadeInText, Reveal } from "@/components/react-bits"

export default function ALVImmobilierHome() {
  return (
    <div className="min-h-screen relative bg-slate-50 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,90,156,0.06),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(76,175,80,0.06),transparent_30%),linear-gradient(120deg,rgba(0,90,156,0.03),rgba(76,175,80,0.03))]" />
      {/* Header moderne avec navigation */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo avec animation subtile */}
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <Image
                  src="/images/logo-alv-2.jpg"
                  alt="Logo ALV Pleyben Immobilier"
                  width={180}
                  height={60}
                  className="h-12 w-auto transition-transform duration-300 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/10 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
              </div>
              <div className="hidden sm:block">
                <h2 className="text-lg font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  ALV Pleyben Immobilier
                </h2>
                <p className="text-xs text-slate-500 font-medium">Votre partenaire immobilier de confiance</p>
              </div>
            </div>

            {/* Contact info avec design moderne */}
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center space-x-4 text-sm">
              <a
                href="tel:0298267147"
                  className="flex items-center space-x-2 text-slate-700 hover:text-blue-600 transition-colors duration-200 group"
                >
                  <div className="p-2 rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors duration-200">
                    <Phone className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="font-medium">02 98 26 71 47</span>
                </a>
                <a
                  href="mailto:contact@alvimobilier.bzh"
                  className="flex items-center space-x-2 text-slate-700 hover:text-blue-600 transition-colors duration-200 group"
                >
                  <div className="p-2 rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors duration-200">
                    <Mail className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="font-medium">contact@alvimobilier.bzh</span>
                </a>
              </div>
              
              {/* Menu contact mobile */}
              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                      <Phone className="h-4 w-4 mr-2" />
                      Contact
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuItem asChild>
                      <a 
                        href="tel:0298267147" 
                        className="flex items-center space-x-3 cursor-pointer py-3"
                      >
                        <Phone className="h-4 w-4 text-blue-600" />
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900">📞 Appeler</span>
                          <span className="text-sm text-slate-600">02 98 26 71 47</span>
                        </div>
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a 
                        href="mailto:contact@alvimobilier.bzh" 
                        className="flex items-center space-x-3 cursor-pointer py-3"
                      >
                        <Mail className="h-4 w-4 text-blue-600" />
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900">📧 Email</span>
                          <span className="text-sm text-slate-600">contact@alvimobilier.bzh</span>
                        </div>
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section avec design moderne */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/40 to-emerald-50/30" />
          <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_30%_20%,rgba(0,90,156,0.12),transparent_35%),radial-gradient(circle_at_80%_70%,rgba(76,175,80,0.12),transparent_32%)] blur-3xl" />
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
            <div className="text-center max-w-4xl mx-auto">
              <Reveal>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                  Préparez votre dossier{" "}
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 bg-clip-text text-transparent">
                    en ligne
                  </span>
                </h1>
              </Reveal>
              
              <Reveal delay={80}>
                <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                  <FadeInText text="Remplissez votre fiche de renseignements en quelques minutes." />
                  <span className="block mt-1">
                    <FadeInText text="Nous recevons votre dossier et vous recontactons rapidement pour la suite." delay={150} />
                  </span>
                </p>
              </Reveal>

              <Reveal delay={120}>
                <div className="mt-10 bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-lg p-6 sm:p-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                  {[
                    "Sélectionnez votre situation",
                    "Remplissez le formulaire adapté",
                    "Recevez une copie PDF par email",
                    "L’agence traite votre dossier sous 24 h",
                  ].map((step, index) => (
                  <div key={step} className="flex items-start space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md">
                        {index + 1}
                      </div>
                      <p className="text-slate-700 font-medium leading-snug">{step}</p>
                    </div>
                  ))}
                  </div>
              </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Section des services avec design moderne */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="text-center mb-16">
            <FadeInText text="Choisissez votre situation" className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 inline-block" />
            <Reveal delay={80}>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Remplissez le formulaire adapté pour préparer votre dossier en quelques minutes.
              </p>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Locataire - Carte active avec design premium */}
            <Reveal className="h-full">
            <Card className="group relative overflow-hidden border border-slate-100 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-500 bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />
              <CardHeader className="relative pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                    <Building2 className="h-6 w-6" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Je suis locataire</p>
                <CardTitle className="text-2xl font-bold text-slate-900 mb-2">
                  Préparer mon dossier locataire
                </CardTitle>
                <p className="text-slate-600 leading-relaxed">
                  Créez votre fiche locataire avant toute visite.
                  <span className="block">Vos informations nous permettent d’étudier votre dossier et de vous recontacter rapidement.</span>
                </p>
              </CardHeader>
              <CardContent className="relative flex flex-col h-full">
                <div className="space-y-4 mb-6">
                  <div className="flex items-center space-x-3 text-sm text-slate-600">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span>5 à 10 minutes pour remplir</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-slate-600">
                    <FileText className="h-4 w-4 text-indigo-600" />
                    <span>Vos informations regroupées en une seule fois</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-slate-600">
                    <Target className="h-4 w-4 text-purple-600" />
                    <span>Possibilité d’indiquer vos critères de recherche (location et/ou achat)</span>
                  </div>
                </div>
                <Button
                  asChild
                  className="mt-auto w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  size="lg"
                >
                  <Link href="/locataire/formulaire" className="flex items-center justify-center space-x-2">
                    <span>Remplir la fiche locataire</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            </Reveal>

            {/* Cautionnaire - Carte active avec design premium */}
            <Reveal className="h-full" delay={60}>
            <Card className="group relative overflow-hidden border border-slate-100 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-500 bg-gradient-to-br from-emerald-50 to-teal-50 flex flex-col">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />
              <CardHeader className="relative pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
                    <Shield className="h-6 w-6" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">Je me porte cautionnaire</p>
                <CardTitle className="text-2xl font-bold text-slate-900 mb-2">
                  Préparer ma fiche de caution
                </CardTitle>
                <p className="text-slate-600 leading-relaxed">
                  Renseignez vos informations de caution pour accompagner le dossier locataire.
                </p>
              </CardHeader>
              <CardContent className="relative flex flex-col h-full">
                <div className="space-y-4 mb-6">
                  <div className="flex items-center space-x-3 text-sm text-slate-600">
                    <Shield className="h-4 w-4 text-emerald-600" />
                    <span>Sécurise et accompagne le dossier locataire</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-slate-600">
                    <FileText className="h-4 w-4 text-teal-600" />
                    <span>Coordonnées et ressources regroupées</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-slate-600">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>PDF récapitulatif envoyé par email</span>
                  </div>
                </div>
                <Button
                  asChild
                  className="mt-auto w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  size="lg"
                >
                  <Link href="/garant/formulaire" className="flex items-center justify-center space-x-2">
                    <span>Remplir la fiche cautionnaire</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            </Reveal>

            {/* Propriétaire - Carte activée */}
            <Reveal className="h-full" delay={100}>
            <Card className="group relative overflow-hidden border border-slate-100 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-500 bg-gradient-to-br from-slate-50 to-gray-50 flex flex-col">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-400/20 to-gray-400/20 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />
              <CardHeader className="relative pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-slate-500 to-gray-700 text-white shadow-lg">
                    <Tag className="h-6 w-6" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Je suis propriétaire</p>
                <CardTitle className="text-2xl font-bold text-slate-900 mb-2">
                  Préparer mon dossier propriétaire
                </CardTitle>
                <p className="text-slate-600 leading-relaxed">
                  Renseignez votre situation en vue de la mise en location de votre bien (location simple ou gestion locative).
                </p>
              </CardHeader>
              <CardContent className="relative flex flex-col h-full">
                <div className="space-y-4 mb-6">
                  <div className="flex items-center space-x-3 text-sm text-slate-600">
                    <User className="h-4 w-4 text-slate-600" />
                    <span>Coordonnées et situation du ou des propriétaires</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-slate-600">
                    <FileText className="h-4 w-4 text-slate-600" />
                    <span>Informations utiles pour préparer les documents de location</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-slate-600">
                    <Clock className="h-4 w-4 text-slate-600" />
                    <span>Gain de temps pour la mise en place du dossier</span>
                  </div>
                </div>
                <Button
                  asChild
                  className="mt-auto w-full bg-gradient-to-r from-slate-700 to-gray-800 hover:from-slate-800 hover:to-gray-900 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  size="lg"
                >
                  <Link href="/proprietaire/formulaire" className="flex items-center justify-center space-x-2">
                    <span>Remplir la fiche propriétaire</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            </Reveal>

            {/* Acquéreur - Carte activée */}
            <Reveal className="h-full" delay={140}>
            <Card className="group relative overflow-hidden border border-slate-100 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-500 bg-gradient-to-br from-amber-50 to-orange-50 flex flex-col">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />
              <CardHeader className="relative pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg">
                    <HandCoins className="h-6 w-6" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-amber-700 uppercase tracking-wide">Je suis acquéreur</p>
                <CardTitle className="text-2xl font-bold text-slate-900 mb-2">
                  Préparer mon dossier acquéreur
                </CardTitle>
                <p className="text-slate-600 leading-relaxed">
                  Vous avez une offre d’achat acceptée ? Renseignez votre situation pour finaliser votre projet.
                </p>
              </CardHeader>
              <CardContent className="relative flex flex-col h-full">
                <div className="space-y-4 mb-6">
                  <div className="flex items-center space-x-3 text-sm text-slate-600">
                    <Users className="h-4 w-4 text-amber-500" />
                    <span>Situation familiale et coordonnées complètes</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-slate-600">
                    <HandCoins className="h-4 w-4 text-amber-500" />
                    <span>Informations sur votre mode de financement</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-slate-600">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span>Gain de temps pour la rédaction et la signature du compromis</span>
                  </div>
                </div>
                <Button
                  asChild
                  className="mt-auto w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  size="lg"
                >
                  <Link href="/acquereur/formulaire" className="flex items-center justify-center space-x-2">
                    <span>Remplir la fiche acquéreur</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            </Reveal>

            {/* Vendeur - Carte active */}
            <Reveal className="h-full" delay={180}>
            <Card className="group relative overflow-hidden border border-slate-100 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-500 bg-gradient-to-br from-purple-50 to-pink-50 flex flex-col">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />
              <CardHeader className="relative pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 text-white shadow-lg">
                    <Tag className="h-6 w-6" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-purple-700 uppercase tracking-wide">Je suis vendeur</p>
                <CardTitle className="text-2xl font-bold text-slate-900 mb-2">
                  Préparer mon dossier de vente
                </CardTitle>
                <p className="text-slate-600 leading-relaxed">
                  Renseignez votre situation personnelle pour préparer votre dossier vendeur.
                </p>
              </CardHeader>
              <CardContent className="relative flex flex-col h-full">
                <div className="space-y-4 mb-6">
                  <div className="flex items-center space-x-3 text-sm text-slate-600">
                    <User className="h-4 w-4 text-purple-500" />
                    <span>État civil et coordonnées à jour</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-slate-600">
                    <FileText className="h-4 w-4 text-purple-500" />
                    <span>Informations utiles pour la rédaction du mandat</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-slate-600">
                    <Clock className="h-4 w-4 text-purple-500" />
                    <span>Gain de temps lors des rendez-vous et démarches</span>
                  </div>
                </div>
                <Button
                  asChild
                  className="mt-auto w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  size="lg"
                >
                  <Link href="/vendeur/formulaire" className="flex items-center justify-center space-x-2">
                    <span>Remplir la fiche vendeur</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            </Reveal>
          </div>

          {/* Section de confiance */}
          <div className="mt-20 text-center">
            <Reveal>
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/60 shadow-lg">
                <div className="flex flex-col md:flex-row items-center justify-center space-y-6 md:space-y-0 md:space-x-12">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-8 w-8 text-emerald-600" />
                    <div className="text-left">
                      <p className="font-semibold text-slate-900">Données sécurisées</p>
                      <p className="text-sm text-slate-600">Conformité RGPD garantie</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div className="text-left">
                      <p className="font-semibold text-slate-900">PDF automatique</p>
                      <p className="text-sm text-slate-600">Génération et envoi par email</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-8 w-8 text-purple-600" />
                    <div className="text-left">
                      <p className="font-semibold text-slate-900">Traitement rapide</p>
                      <p className="text-sm text-slate-600">Réponse sous 24h</p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* Footer moderne */}
      <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Informations de l'agence */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white">ALV Immobilier</h3>
                <p className="text-sm text-slate-300">Pleyben</p>
              </div>
                             <p className="text-slate-300 mb-6 max-w-md leading-relaxed">
                 Agence immobilière à Pleyben. 
                 Nous traitons vos demandes de location et vous accompagnons dans vos démarches.
               </p>
              <div className="flex space-x-4">
                <a href="tel:0298267147" className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
                  <Phone className="h-5 w-5" />
                </a>
                <a href="mailto:contact@alvimobilier.bzh" className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
                  <Mail className="h-5 w-5" />
                </a>
                <a href="#" className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
                  <MapPin className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Contact rapide */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact rapide</h3>
              <div className="space-y-3 text-slate-300">
                <p className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-blue-400" />
                  <span>02 98 26 71 47</span>
                </p>
                <p className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-blue-400" />
                  <span>contact@alvimobilier.bzh</span>
                </p>
                <p className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-blue-400" />
                  <span>19 Place du Général de Gaulle</span>
                </p>
                <p className="ml-6 text-slate-400">29190 Pleyben</p>
              </div>
            </div>

            {/* Informations légales */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Informations</h3>
              <div className="space-y-3 text-sm text-slate-400">
                <p>Carte Professionnelle n° 2903 2016 000 009 781</p>
                <p>Compte séquestre CMB 045454259149</p>
                <p>Garantie SOCAF 120 000 €</p>
                <p>SAS au capital de 5720 €</p>
                <p>Siret 440 808 913 00014</p>
                <p>R.C.S. Quimper 440 808 913</p>
                <p>NAF 6831Z</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700 mt-12 pt-8 text-center">
            <p className="text-slate-400 text-sm">
              © 2024 ALV Immobilier. Tous droits réservés. | 
              <a href="#" className="hover:text-white transition-colors duration-200 ml-2">Mentions légales</a> | 
              <a href="#" className="hover:text-white transition-colors duration-200 ml-2">Politique de confidentialité</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
