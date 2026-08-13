import { useParams, Link } from "react-router-dom"
import { ArrowLeft, Trophy, Users, ShieldAlert, CheckCircle, FileText } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"

export function SessionResultsView() {
  const { id } = useParams()
  
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['session_analytics', id],
    queryFn: () => api.get(`/analytics/sessions/${id}/analytics`).then(res => res.data)
  })

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Generating Report...</div>
  if (!analytics) return <div className="p-8 text-center text-rose-500 font-medium">Failed to load analytics</div>

  return (
    <div className="flex-1 overflow-auto bg-muted/10 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <Link to="/assessments" className="text-sm text-primary hover:underline flex items-center gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to Assessments
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Assessment Report</h1>
              <p className="text-muted-foreground mt-1">Detailed performance and proctoring analytics for Session #{id}</p>
            </div>
            <Button className="gap-2 bg-slate-900">
              <FileText className="h-4 w-4" /> Export CSV
            </Button>
          </div>
        </div>

        {/* Top KPIs */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="border-primary/20 shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.stats.total_participants}</div>
            </CardContent>
          </Card>
          
          <Card className="border-primary/20 shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.stats.pass_rate.toFixed(1)}%</div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Violations Logged</CardTitle>
              <ShieldAlert className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-rose-600">{analytics.proctoring_logs.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Leaderboard Table */}
          <Card className="md:col-span-2 border-primary/20 shadow-sm">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" /> Final Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Participant</TableHead>
                    <TableHead>Final Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Certificate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.leaderboard.map((row: any) => (
                    <TableRow key={row.participant_id}>
                      <TableCell className="font-medium">{row.user_name}</TableCell>
                      <TableCell>{row.score}</TableCell>
                      <TableCell>
                        {row.is_passed ? (
                          <Badge className="bg-green-500">Passed</Badge>
                        ) : (
                          <Badge variant="destructive">Failed</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {row.certificate_issued ? (
                          <span className="text-xs font-semibold text-green-600">ISSUED</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {analytics.leaderboard.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-10">No participant data recorded.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Audit Logs */}
          <Card className="border-primary/20 shadow-sm">
            <CardHeader className="bg-rose-50/50 border-b border-rose-100">
              <CardTitle className="text-rose-700 flex items-center gap-2 text-base">
                <ShieldAlert className="h-4 w-4" /> Proctoring Audit Log
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 max-h-[400px] overflow-y-auto bg-slate-50">
              <div className="p-4 space-y-4">
                {analytics.proctoring_logs.map((log: any, i: number) => (
                  <div key={i} className="flex flex-col gap-1 p-3 bg-white rounded-lg border shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-slate-800">{log.user_name}</span>
                      <span className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                    </div>
                    <Badge variant="outline" className="w-fit text-rose-600 text-[10px] bg-rose-50 border-rose-200">{log.event_type}</Badge>
                    <span className="text-xs text-slate-600 leading-tight">{log.description}</span>
                  </div>
                ))}
                {analytics.proctoring_logs.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-10">
                    No violations detected.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
