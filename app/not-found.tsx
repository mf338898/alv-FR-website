import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h2 className="text-3xl font-bold mb-3">Page non trouvée</h2>
      <p className="text-gray-600 mb-6">
        La page que vous recherchez n&apos;existe pas ou n&apos;est plus
        disponible.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/accueil"
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          Retour à l&apos;accueil
        </Link>
        <Link
          href="/locataire/formulaire"
          className="inline-flex items-center justify-center rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Je suis locataire
        </Link>
      </div>
    </div>
  )
}