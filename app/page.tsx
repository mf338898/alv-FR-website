import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { Shield, Building2, HandCoins, Tag, Phone, Mail, MapPin, CheckCircle2, ArrowRight, Star, Clock, Users, Home, Key, Calculator, FileText, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function ALVImmobilierHome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Header moderne avec navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
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
          {/* Background avec éléments visuels */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-indigo-600/5 to-purple-600/5" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-emerald-400/10 to-blue-400/10 rounded-full blur-3xl" />
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
            <div className="text-center max-w-4xl mx-auto">
              {/* Badge de confiance */}
              <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-2 mb-8">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">Agence certifiée et de confiance</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Fiche de renseignements
                </span>
                <br />
                <span className="text-slate-800">en ligne</span>
          </h1>
              
              <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                Remplissez votre fiche de renseignements en ligne. 
                Nous recevons votre dossier par email et vous contactons rapidement.
              </p>
            </div>
          </div>
        </section>

        {/* Section des services avec design moderne */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Sélectionnez votre profil
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Remplissez le formulaire adapté à votre situation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Locataire - Carte active avec design premium */}
            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />
              <CardHeader className="relative pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200">
                    Disponible
                  </Badge>
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900 mb-2">
                  Je suis locataire
                </CardTitle>
                <p className="text-slate-600 leading-relaxed">
                  Créez votre fiche de renseignements pour une demande de location. 
                  Formulaire en 7 étapes avec validation automatique.
                </p>
              </CardHeader>
              <CardContent className="relative">
                <div className="space-y-4 mb-6">
                  <div className="flex items-center space-x-3 text-sm text-slate-600">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span>Complétion en 5-10 minutes</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-slate-600">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Validation automatique des données</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-slate-600">
                    <FileText className="h-4 w-4 text-purple-600" />
                    <span>Génération PDF automatique</span>
                  </div>
                </div>
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                  size="lg"
                >
                  <Link href="/locataire/formulaire" className="flex items-center justify-center space-x-2">
                    <span>Commencer maintenant</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Cautionnaire - Carte active avec design premium */}
            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />
              <CardHeader className="relative pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
                    <Shield className="h-6 w-6" />
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200">
                    Disponible
                  </Badge>
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900 mb-2">
                  Je me porte cautionnaire
                </CardTitle>
                <p className="text-slate-600 leading-relaxed">
                  Créez votre fiche garant avec vos informations personnelles et professionnelles.
                </p>
              </CardHeader>
              <CardContent className="relative">
                <div className="space-y-4 mb-6">
                  <div className="flex items-center space-x-3 text-sm text-slate-600">
                    <Shield className="h-4 w-4 text-emerald-600" />
                    <span>Protection du locataire</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-slate-600">
                    <Calculator className="h-4 w-4 text-teal-600" />
                    <span>Évaluation de solvabilité</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-slate-600">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Processus simplifié</span>
                  </div>
                </div>
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                  size="lg"
                >
                  <Link href="/garant/formulaire" className="flex items-center justify-center space-x-2">
                    <span>Accéder à la fiche</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Propriétaire - Carte inactive avec design moderne */}
            <Card className="group relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-slate-50 to-gray-50 opacity-75">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-400/20 to-gray-400/20 rounded-full blur-2xl" />
              <CardHeader className="relative pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-slate-400 to-gray-500 text-white shadow-lg">
                    <Tag className="h-6 w-6" />
                  </div>
                  <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-slate-200">
                    Bientôt disponible
                  </Badge>
                </div>
                <CardTitle className="text-2xl font-bold text-slate-600 mb-2">
                  Je suis propriétaire
                </CardTitle>
                <p className="text-slate-500 leading-relaxed">
                  Confiez-nous la gestion ou la location de votre bien. 
                  Notre expertise au service de votre patrimoine.
                </p>
              </CardHeader>
              <CardContent className="relative">
                <div className="space-y-4 mb-6">
                  <div className="flex items-center space-x-3 text-sm text-slate-500">
                    <Home className="h-4 w-4 text-slate-400" />
                    <span>Gestion locative</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-slate-500">
                    <Key className="h-4 w-4 text-slate-400" />
                    <span>Location de biens</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-slate-500">
                    <Calculator className="h-4 w-4 text-slate-400" />
                    <span>Évaluation de biens</span>
                  </div>
                </div>
                <Button
                  disabled
                  className="w-full bg-slate-200 text-slate-400 cursor-not-allowed"
                  size="lg"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Bientôt disponible
                </Button>
              </CardContent>
            </Card>

            {/* Acquéreur - Carte inactive */}
            <Card className="group relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 opacity-75">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-2xl" />
              <CardHeader className="relative pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg">
                    <HandCoins className="h-6 w-6" />
                  </div>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-600 border-amber-200">
                    Bientôt disponible
                  </Badge>
                </div>
                <CardTitle className="text-2xl font-bold text-slate-600 mb-2">
                  Je suis acquéreur
                </CardTitle>
                <p className="text-slate-500 leading-relaxed">
                  Achetez un bien par notre agence avec un accompagnement 
                  personnalisé et sécurisé.
                </p>
              </CardHeader>
              <CardContent className="relative">
                <div className="space-y-4 mb-6">
                  <div className="flex items-center space-x-3 text-sm text-slate-500">
                    <Home className="h-4 w-4 text-amber-400" />
                    <span>Recherche de biens</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-slate-500">
                    <Calculator className="h-4 w-4 text-amber-400" />
                    <span>Simulation de prêt</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-slate-500">
                    <Shield className="h-4 w-4 text-amber-400" />
                    <span>Accompagnement juridique</span>
                  </div>
                </div>
                <Button
                  disabled
                  className="w-full bg-amber-200 text-amber-400 cursor-not-allowed"
                  size="lg"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Bientôt disponible
                </Button>
              </CardContent>
            </Card>

            {/* Vendeur - Carte inactive */}
            <Card className="group relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 opacity-75">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl" />
              <CardHeader className="relative pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 text-white shadow-lg">
                    <Tag className="h-6 w-6" />
                  </div>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-600 border-purple-200">
                    Bientôt disponible
                  </Badge>
                </div>
                <CardTitle className="text-2xl font-bold text-slate-600 mb-2">
                  Je suis vendeur
                </CardTitle>
                <p className="text-slate-500 leading-relaxed">
                  Vendez votre bien avec ALV Immobilier. 
                  Notre expertise pour valoriser votre patrimoine.
                </p>
              </CardHeader>
              <CardContent className="relative">
                <div className="space-y-4 mb-6">
                  <div className="flex items-center space-x-3 text-sm text-slate-500">
                    <Home className="h-4 w-4 text-purple-400" />
                    <span>Estimation gratuite</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-slate-500">
                    <Users className="h-4 w-4 text-purple-400" />
                    <span>Mise en relation</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-slate-500">
                    <Calculator className="h-4 w-4 text-purple-400" />
                    <span>Accompagnement complet</span>
                  </div>
                </div>
                <Button
                  disabled
                  className="w-full bg-purple-200 text-purple-400 cursor-not-allowed"
                  size="lg"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Bientôt disponible
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Section de confiance */}
          <div className="mt-20 text-center">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/60 shadow-lg">
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
