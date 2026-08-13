import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Award, Printer, Download, Share2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { api } from "@/lib/api"

export function CertificatePage() {
  const { id } = useParams()

  const { data: certificate, isLoading, error } = useQuery({
    queryKey: ['certificate', id],
    queryFn: async () => {
      const res = await api.get(`/certificates/${id}`)
      return res.data
    },
    enabled: !!id
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="p-8 text-center max-w-md">
          <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Certificate Not Found</h2>
          <p className="text-slate-600">
            This certificate does not exist or may have been revoked.
          </p>
        </Card>
      </div>
    )
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4 print:bg-white print:py-0 print:px-0 flex flex-col items-center">
      
      {/* Controls (Hidden when printing) */}
      <div className="mb-8 flex gap-4 print:hidden w-full max-w-5xl justify-end">
        <Button variant="outline" className="gap-2 bg-white" onClick={() => navigator.clipboard.writeText(window.location.href).then(() => alert('Link copied!'))}>
          <Share2 className="h-4 w-4" /> Share Link
        </Button>
        <Button className="gap-2 shadow-md" onClick={handlePrint}>
          <Printer className="h-4 w-4" /> Print / Save as PDF
        </Button>
      </div>

      {/* The Certificate UI */}
      <div className="w-full max-w-[1056px] aspect-[1.414/1] bg-white shadow-2xl print:shadow-none relative overflow-hidden flex flex-col items-center justify-center text-center p-16 print:p-0">
        
        {/* Decorative Border */}
        <div className="absolute inset-6 border-[12px] border-double border-slate-200 pointer-events-none" />
        <div className="absolute inset-8 border border-slate-300 pointer-events-none" />
        
        {/* Corner Ornaments */}
        <div className="absolute top-10 left-10 w-16 h-16 border-t-4 border-l-4 border-primary/40 pointer-events-none" />
        <div className="absolute top-10 right-10 w-16 h-16 border-t-4 border-r-4 border-primary/40 pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-16 h-16 border-b-4 border-l-4 border-primary/40 pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-16 h-16 border-b-4 border-r-4 border-primary/40 pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 w-full max-w-3xl flex flex-col items-center">
          
          <div className="mb-8">
            <Award className="h-24 w-24 text-primary mx-auto opacity-90" strokeWidth={1} />
          </div>

          <h1 className="text-6xl font-serif font-bold text-slate-800 tracking-wider mb-6">
            CERTIFICATE
          </h1>
          <h2 className="text-2xl font-serif text-slate-500 tracking-widest mb-12">
            OF ACHIEVEMENT
          </h2>

          <p className="text-lg text-slate-500 italic mb-6">
            This is to proudly certify that
          </p>

          <h3 className="text-5xl font-serif font-bold text-primary mb-8 pb-4 border-b-2 border-slate-200 inline-block px-12">
            {certificate.participant_name}
          </h3>

          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-12">
            has successfully completed the live assessment for <br />
            <span className="font-bold text-slate-800 text-xl block mt-2">"{certificate.assessment_title}"</span>
          </p>

          <div className="grid grid-cols-2 gap-24 w-full max-w-xl mx-auto mt-8">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-slate-800 mb-2">{certificate.score}%</span>
              <div className="h-px w-full bg-slate-300 mb-2" />
              <span className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Final Score</span>
            </div>
            
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-slate-800 mb-2 mt-2">
                {new Date(certificate.issued_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
              <div className="h-px w-full bg-slate-300 mb-2" />
              <span className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Date of Issue</span>
            </div>
          </div>

          <div className="mt-16 text-xs text-slate-400 font-mono">
            Verify at: {window.location.origin}/certificate/{certificate.url}
          </div>

        </div>
        
        {/* Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <Award className="w-[800px] h-[800px]" strokeWidth={0.5} />
        </div>
      </div>

    </div>
  )
}
