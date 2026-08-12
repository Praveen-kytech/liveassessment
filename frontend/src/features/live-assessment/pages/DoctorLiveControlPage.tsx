import { useState, useEffect, useRef } from "react"
import { useParams } from "react-router-dom"
import { Activity, Users, Clock, PlayCircle, StopCircle, LayoutList, CheckCircle, Video, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useAuthStore } from "@/features/auth/hooks/authStore"

interface AlertEvent {
  id: number;
  time: string;
  participantId: number;
  type: string;
  message: string;
}

export function DoctorLiveControlPage() {
  const { id } = useParams()
  const { token } = useAuthStore()
  const [alerts, setAlerts] = useState<AlertEvent[]>([])
  const ws = useRef<WebSocket | null>(null)

  const { data: session } = useQuery({
    queryKey: ['session', id],
    queryFn: async () => {
      const res = await api.get(`/sessions/${id}`)
      return res.data
    },
    enabled: !!id,
  })

  useEffect(() => {
    if (!id || !token) return;

    // Connect to WebSocket
    const wsUrl = `ws://localhost:8000/api/live/ws/session/${id}?token=${token}`
    ws.current = new WebSocket(wsUrl)

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.action === "proctoring_alert") {
          setAlerts(prev => [{
            id: Date.now(),
            time: new Date().toLocaleTimeString(),
            participantId: data.participant_id,
            type: data.type,
            message: data.message
          }, ...prev].slice(0, 50)) // Keep last 50
        }
      } catch (err) {
        console.error("WS parse error", err)
      }
    }

    return () => {
      ws.current?.close()
    }
  }, [id, token])

  const launchZoom = () => {
    if (session?.host_meeting_link) {
      window.open(session.host_meeting_link, '_blank')
    }
  }

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
            Assessment Session (ID: #{id})
          </p>
        </div>
        <div className="flex items-center gap-3">
          {session?.host_meeting_link && (
            <Button onClick={launchZoom} className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Video className="h-4 w-4" /> Launch Zoom as Host
            </Button>
          )}
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
                      Q1 of 10
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
                        q === 1 ? 'bg-primary text-primary-foreground shadow-md ring-2 ring-primary ring-offset-2 ring-offset-background' :
                        'bg-muted/20 text-muted-foreground hover:bg-muted/50'
                      }`}
                    >
                      <span className="text-xs font-semibold">Q{q}</span>
                      {q === 1 && <Activity className="h-3 w-3 mt-0.5" />}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Stats & Live Analytics */}
          <div className="md:col-span-4 space-y-6">
            <Card className="border-rose-200 shadow-md">
              <CardHeader className="bg-rose-50/50 pb-4 border-b border-rose-100">
                <CardTitle className="text-base flex items-center gap-2 text-rose-700">
                  <AlertTriangle className="h-4 w-4" /> Proctoring Alerts
                </CardTitle>
                <CardDescription className="text-rose-600/80">Real-time suspicious activity</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 h-[300px] overflow-y-auto">
                {alerts.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground mt-10">
                    No suspicious activity detected.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {alerts.map(alert => (
                      <div key={alert.id} className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold text-rose-800 text-sm">Participant #{alert.participantId}</span>
                          <span className="text-xs text-rose-500">{alert.time}</span>
                        </div>
                        <p className="text-sm text-rose-700">{alert.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                    <Users className="h-4 w-4" /> Active Participants
                  </span>
                  <span className="text-2xl font-bold">12</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
