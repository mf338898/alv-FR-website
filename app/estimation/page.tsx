import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function EstimationPlaceholderPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto w-full max-w-2xl px-4 py-10">
        <Card className="border border-slate-200 shadow-sm bg-white">
          <CardHeader className="space-y-2 border-b border-slate-200">
            <CardTitle className="text-xl text-slate-900">Demander une estimation</CardTitle>
            <p className="text-sm text-slate-600">
              Cette page est temporaire. Le module d&apos;estimation sera intégré prochainement.
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <Button asChild variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100">
              <Link href="/demande-estimation">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à la page demande / estimation
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
