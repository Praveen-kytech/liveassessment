import { Activity, Users, Clock, PlayCircle, StopCircle, LayoutList, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"

export function DoctorLiveControlPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      {/* Control Room Header */}
      <div className="flex items-center justify-between pb-6 border-b">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Live Control Room</h1>
            <Badge variant="destructive" className="animate-pulse flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-white block"></span>
              LIVE
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Frontend Engineer Assessment (ID: #FE-9801)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <PlayCircle className="h-4 w-4" /> Pause Session
          </Button>
          <Button variant="destructive" className="gap-2">
            <StopCircle className="h-4 w-4" /> End Session
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto pt-6">
        <div className="grid gap-6 md:grid-cols-12">
          {/* Main View - Current Question & Timeline */}
          <div className="md:col-span-8 space-y-6">
            <Card className="border-primary/20 shadow-md">
              <CardHeader className="bg-muted/30 pb-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                      Q3 of 10
                    </Badge>
                    <span className="text-sm text-muted-foreground font-medium">Multiple Choice</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm font-medium">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-4 w-4" /> 02:45 remaining
                    </span>
                    <Button size="sm">Close Question</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-6">
                  What is the primary purpose of the React useMemo hook?
                </h3>
                <div className="space-y-3">
                  {['To cache complex calculation results', 'To memoize entire components', 'To manage side effects', 'To subscribe to context changes'].map((opt, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <span className="text-sm">{opt}</span>
                      <span className="text-xs text-muted-foreground font-medium">{Math.floor(Math.random() * 60) + 10}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <LayoutList className="h-4 w-4 text-muted-foreground" /> Question Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((q) => (
                    <button
                      key={q}
                      className={`flex-shrink-0 w-12 h-12 rounded-lg border flex flex-col items-center justify-center transition-colors ${
                        q < 3 ? 'bg-primary/10 border-primary/30 text-primary' :
                        q === 3 ? 'bg-primary text-primary-foreground shadow-md ring-2 ring-primary ring-offset-2 ring-offset-background' :
                        'bg-muted/20 text-muted-foreground hover:bg-muted/50'
                      }`}
                    >
                      <span className="text-xs font-semibold">Q{q}</span>
                      {q < 3 && <CheckCircle className="h-3 w-3 mt-0.5" />}
                      {q === 3 && <Activity className="h-3 w-3 mt-0.5" />}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Stats & Live Analytics */}
          <div className="md:col-span-4 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                      <Users className="h-4 w-4" /> Active
                    </span>
                    <span className="text-2xl font-bold">142</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                      <CheckCircle className="h-4 w-4" /> Submitted
                    </span>
                    <span className="text-2xl font-bold">89</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" /> Live Analytics
                </CardTitle>
                <CardDescription>Current question statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metric</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium text-sm">Avg. Time</TableCell>
                      <TableCell className="text-right text-sm">45s</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-sm">Difficulty</TableCell>
                      <TableCell className="text-right text-sm"><Badge variant="outline" className="text-amber-500 border-amber-200 bg-amber-50">Medium</Badge></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-sm">Drop-offs</TableCell>
                      <TableCell className="text-right text-sm text-destructive">2</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
