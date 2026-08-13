import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Award, Download, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { api } from "@/lib/api"

export function ResultsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isGeneratingCert, setIsGeneratingCert] = useState(false)

  const { data: result, isLoading } = useQuery({
    queryKey: ['result', id],
    queryFn: async () => {
      // In a full implementation we'd fetch the exact result details
      // For now we simulate it but use the real ID for the certificate generation
      return {
        id: Number(id),
        score: 85,
        is_passed: true,
        assessment_title: "Frontend Engineer Assessment"
      }
    },
    enabled: !!id
  })

  if (isLoading || !result) {
    return <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>
  }

  const passed = result.is_passed
  const score = result.score

  const handleClaimCertificate = async () => {
    try {
      setIsGeneratingCert(true)
      const res = await api.post(`/certificates/generate/${result.id}`)
      navigate(`/certificate/${res.data.certificate_url}`)
    } catch (err) {
      console.error("Failed to generate certificate", err)
      alert("Failed to generate certificate.")
    } finally {
      setIsGeneratingCert(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assessment Results</h1>
          <p className="text-muted-foreground mt-1">Frontend Engineer Assessment</p>
        </div>
        <Button className="gap-2">
          <Download className="h-4 w-4" /> Download Full Report
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Score Card */}
        <Card className={`md:col-span-1 border-t-4 ${passed ? 'border-t-emerald-500' : 'border-t-destructive'}`}>
          <CardHeader className="text-center pb-2">
            <CardTitle>Final Score</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center pt-4 pb-6">
            <div className="relative flex items-center justify-center w-32 h-32 rounded-full border-8 border-muted">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="50%" cy="50%" r="46%"
                  fill="transparent"
                  stroke={passed ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'}
                  strokeWidth="8"
                  strokeDasharray={`${score * 2.89} 289`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <span className="text-4xl font-bold">{score}%</span>
            </div>
            <Badge 
              variant={passed ? "default" : "destructive"} 
              className={`mt-6 text-sm px-4 py-1 ${passed ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : ''}`}
            >
              {passed ? 'PASSED' : 'FAILED'}
            </Badge>
          </CardContent>
        </Card>

        {/* Breakdown */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Performance Breakdown</CardTitle>
            <CardDescription>How you scored across different categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { name: 'React Fundamentals', score: 90 },
                { name: 'State Management', score: 80 },
                { name: 'Performance Optimization', score: 70 },
                { name: 'CSS & Styling', score: 100 },
              ].map((category) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>{category.name}</span>
                    <span>{category.score}%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${category.score}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Certificate Section */}
      {passed && (
        <Card className="bg-primary/5 border-primary/20 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Award className="w-48 h-48" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" /> Certificate of Completion
            </CardTitle>
            <CardDescription>You have successfully earned this certificate.</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="flex items-center gap-4 mt-2">
              <Button variant="default" className="gap-2" onClick={handleClaimCertificate} disabled={isGeneratingCert}>
                {isGeneratingCert ? <Loader2 className="h-4 w-4 animate-spin" /> : <Award className="h-4 w-4" />}
                {isGeneratingCert ? "Generating..." : "Claim Certificate"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Question Review */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Review</CardTitle>
          <CardDescription>Review your answers and explanations</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Q#</TableHead>
                <TableHead>Question</TableHead>
                <TableHead className="w-24 text-center">Result</TableHead>
                <TableHead className="w-24 text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((q) => (
                <TableRow key={q}>
                  <TableCell className="font-medium">{q}</TableCell>
                  <TableCell>What is the primary purpose of the React useMemo hook?</TableCell>
                  <TableCell className="text-center">
                    {q !== 3 ? (
                      <CheckCircle className="h-5 w-5 text-emerald-500 mx-auto" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">45s</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
