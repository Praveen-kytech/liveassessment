import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Play, Maximize, AlertTriangle, Video, Users, Clock, ArrowRight, ShieldAlert, Trophy, Copy } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useAuthStore } from "@/features/auth/hooks/authStore"
import { ZoomEmbed } from "@/components/zoom/ZoomEmbed"

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
  const { data: analytics } = useQuery({
    queryKey: ['session_analytics', id],
    queryFn: () => api.get(`/analytics/sessions/${id}/analytics`).then(res => res.data),
    refetchInterval: 5000 // Poll every 5s for live updates
  });

  const navigate = useNavigate()
  const [alerts, setAlerts] = useState<AlertEvent[]>([])
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null)
  const [answerStats, setAnswerStats] = useState<Record<number, Record<number, number>>>({})
  const [newQuestionText, setNewQuestionText] = useState("")
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false)
  const ws = useRef<WebSocket | null>(null)

  const { data: session } = useQuery({
    queryKey: ['session', id],
    queryFn: async () => {
      const res = await api.get(`/sessions/${id}`)
      return res.data
    },
    enabled: !!id,
  })

  const { data: assessment } = useQuery({
    queryKey: ['assessment', session?.assessment_id],
    queryFn: async () => {
      const res = await api.get(`/assessments/${session.assessment_id}`)
      return res.data
    },
    enabled: !!session?.assessment_id,
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
        } else if (data.action === "answer_received") {
          setAnswerStats(prev => {
            const qId = data.question_id
            const ans = data.answer
            const currentQStats = prev[qId] || {}
            return {
              ...prev,
              [qId]: {
                ...currentQStats,
                [ans]: (currentQStats[ans] || 0) + 1
              }
            }
          })
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

  const copyParticipantLink = () => {
    const link = `${window.location.origin}/live/assessment/${id}`
    navigator.clipboard.writeText(link)
    alert("Participant link copied! Paste it in a new Incognito window to join as a student.")
  }

  const releaseQuestion = async (qNumber: number) => {
    try {
      // Use axios directly with the full URL because the live router is mounted at /api/live, not /api/v1
      await api.post(`http://localhost:8000/api/live/session/${id}/release-question/${qNumber}`)
      setActiveQuestion(qNumber)
    } catch (err) {
      console.error("Failed to release question:", err)
    }
  }

  const closeQuestion = () => {
    if (activeQuestion && ws.current) {
      ws.current.send(JSON.stringify({
        action: "close_question",
        question_id: activeQuestion
      }))
      setActiveQuestion(null)
    }
  }

  const endSession = async () => {
    try {
      await api.post(`/sessions/${id}/end`)
      navigate('/assessments')
    } catch (err) {
      console.error("Failed to end session", err)
    }
  }

  const activeQuestionData = assessment?.questions?.find((q: any) => q.id === activeQuestion)
  
  // Format stats for recharts
  const chartData = activeQuestionData?.options?.map((opt: string, i: number) => ({
    name: `Option ${String.fromCharCode(65 + i)}`,
    fullText: opt,
    count: answerStats[activeQuestion!]?.[i] || 0
  })) || []

  const handleCreateQuestion = async () => {
    if (!newQuestionText.trim() || !session?.assessment_id) return
    setIsSubmittingQuestion(true)
    try {
      const { data: question } = await api.post('/questions/', {
        text: newQuestionText,
        type: 'TEXT',
        assessment_id: session.assessment_id,
        order: 1
      })
      await api.post(`http://localhost:8000/api/live/session/${id}/release-question/${question.id}`)
      setNewQuestionText("")
    } catch (error) {
      console.error("Failed to create question", error)
    } finally {
      setIsSubmittingQuestion(false)
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
          <Button variant="outline" className="gap-2" onClick={copyParticipantLink}>
            <Copy className="h-4 w-4" /> Copy Join Link
          </Button>
          {session?.host_meeting_link && (
            <Button onClick={launchZoom} className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Video className="h-4 w-4" /> Launch Zoom as Host
            </Button>
          )}
          <Button variant="outline" className="gap-2">
            <Play className="h-4 w-4" /> Pause Session
          </Button>
          <Button variant="destructive" className="gap-2" onClick={endSession}>
            <ShieldAlert className="h-4 w-4" /> End Session
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto pt-6">
        <div className="grid gap-6 md:grid-cols-12">
          {/* Main View - Current Question & Timeline */}
          <div className="md:col-span-8 space-y-6">
            
            {/* Zoom Embedded Player */}
            {session?.host_meeting_link && (
              <Card className="border-primary/20 shadow-md min-h-[550px] pb-16">
                <div className="w-full h-full relative rounded-xl">
                  <ZoomEmbed 
                    meetingLink={session.host_meeting_link} 
                    participantLink={session.meeting_link}
                    role={1} 
                  />
                </div>
              </Card>
            )}

            <Card className="border-primary/20 shadow-md">
              <CardHeader className="bg-muted/30 pb-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                      {activeQuestionData ? `Q${assessment?.questions?.findIndex((q: any) => q.id === activeQuestion) + 1}` : 'Live Question Control'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm font-medium">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-4 w-4" /> 02:45 remaining
                    </span>
                    <Button 
                      size="sm" 
                      onClick={closeQuestion} 
                      disabled={!activeQuestion}
                    >
                      Close Question
                    </Button>
                    <Button size="sm" onClick={handleCreateQuestion} disabled={isSubmittingQuestion || !newQuestionText.trim()}>
                      {isSubmittingQuestion ? 'Sending...' : 'Push Live Question'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {activeQuestionData ? (
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold mb-6">
                        {activeQuestionData.text}
                      </h3>
                      <div className="space-y-3">
                        {activeQuestionData.options?.map((opt: string, i: number) => {
                          const totalAnswers = Object.values(answerStats[activeQuestion!] || {}).reduce((a, b) => a + b, 0)
                          const count = answerStats[activeQuestion!]?.[i] || 0
                          const percentage = totalAnswers > 0 ? Math.round((count / totalAnswers) * 100) : 0
                          return (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                              <span className="text-sm font-medium"><span className="text-muted-foreground mr-2">{String.fromCharCode(65+i)}.</span> {opt}</span>
                              <span className="text-xs text-muted-foreground font-medium">{percentage}% ({count})</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    <div className="h-[300px] flex flex-col">
                      <h4 className="text-sm font-semibold text-muted-foreground mb-4">Live Answer Distribution</h4>
                      <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis hide />
                            <Tooltip 
                              cursor={{fill: 'transparent'}}
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="bg-popover border shadow-sm p-2 rounded-md text-sm">
                                      <p className="font-semibold">{payload[0].payload.name}</p>
                                      <p className="text-muted-foreground">{payload[0].payload.fullText}</p>
                                      <p className="font-bold mt-1">Votes: {payload[0].value}</p>
                                    </div>
                                  )
                                }
                                return null
                              }}
                            />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                              {chartData.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill="hsl(var(--primary))" />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <label className="text-sm font-medium">Push a New Question on the Fly</label>
                    <textarea
                      className="w-full min-h-[120px] p-4 border rounded-lg bg-muted/5 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-y"
                      placeholder="Type a new question to send to participants instantly..."
                      value={newQuestionText}
                      onChange={(e) => setNewQuestionText(e.target.value)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Maximize className="h-4 w-4 text-muted-foreground" /> Question Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {assessment?.questions?.map((q: any, i: number) => (
                    <button
                      key={q.id}
                      onClick={() => releaseQuestion(q.id)}
                      className={`flex-shrink-0 w-12 h-12 rounded-lg border flex flex-col items-center justify-center transition-colors ${
                        activeQuestion === q.id ? 'bg-primary text-primary-foreground shadow-md ring-2 ring-primary ring-offset-2 ring-offset-background' :
                        'bg-muted/20 text-muted-foreground hover:bg-muted/50'
                      }`}
                    >
                      <span className="text-xs font-semibold">Q{i + 1}</span>
                      {activeQuestion === q.id && <ArrowRight className="h-3 w-3 mt-0.5" />}
                    </button>
                  ))}
                  {!assessment?.questions?.length && (
                    <div className="text-sm text-muted-foreground py-2">No questions available for this assessment.</div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Live Analytics Dashboard */}
            {analytics && (
              <div className="grid gap-6 md:grid-cols-2 mt-6">
                <Card className="border-primary/20 shadow-md">
                  <CardHeader className="bg-muted/30 pb-4 border-b">
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-500" /> Live Leaderboard
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 max-h-[300px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Participant</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Status</TableHead>
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
                                <Badge variant="secondary">In Progress</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                        {analytics.leaderboard.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground h-24">No scores yet.</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card className="border-primary/20 shadow-md">
                  <CardHeader className="bg-muted/30 pb-4 border-b">
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-500" /> Event Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 max-h-[300px] overflow-y-auto space-y-4">
                    {analytics.timeline.map((event: any, i: number) => (
                      <div key={i} className="flex gap-3 text-sm">
                        <div className="w-16 text-muted-foreground shrink-0">
                          {new Date(event.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-primary">{event.event_type}</span>
                          {event.metadata && (
                            <div className="mt-1">
                              {(() => {
                                try {
                                  const data = typeof event.metadata === 'string' ? JSON.parse(event.metadata) : event.metadata;
                                  if (event.event_type === "ANSWER_SUBMITTED") {
                                    return (
                                      <div className="flex items-center gap-1.5 text-xs">
                                        <span className="text-muted-foreground">Participant #{data.participant_id}</span>
                                        <span className="text-muted-foreground">→</span>
                                        {data.is_correct ? (
                                          <span className="text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded border border-green-200 text-[10px]">Correct</span>
                                        ) : (
                                          <span className="text-red-600 font-medium bg-red-50 px-1.5 py-0.5 rounded border border-red-200 text-[10px]">Wrong</span>
                                        )}
                                      </div>
                                    );
                                  }
                                  return <span className="text-muted-foreground block text-xs">Ref: {event.reference_id} | Data: {typeof event.metadata === 'string' ? event.metadata : JSON.stringify(event.metadata)}</span>;
                                } catch (e) {
                                  return <span className="text-muted-foreground block text-xs">Ref: {event.reference_id} | Data: {event.metadata}</span>;
                                }
                              })()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {analytics.timeline.length === 0 && (
                      <div className="text-center text-muted-foreground py-8">No events recorded.</div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
            
          </div>

          {/* Right Sidebar - Proctoring Alerts */}
          <div className="md:col-span-4 space-y-6">
            <Card className="border-rose-200 shadow-md h-full flex flex-col">
              <CardHeader className="bg-rose-50 border-b border-rose-100 pb-4">
                <CardTitle className="flex items-center gap-2 text-rose-700">
                  <AlertTriangle className="h-5 w-5" /> Live Proctoring Alerts
                </CardTitle>
                <CardDescription className="text-rose-600/80">
                  Suspicious activity monitor
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-hidden relative min-h-[500px]">
                <div className="absolute inset-0 overflow-y-auto p-4 space-y-3 bg-rose-50/30">
                  
                  {/* Historical Alerts from DB */}
                  {analytics?.proctoring_logs?.map((log: any, i: number) => (
                    <div key={`db-${i}`} className="bg-white border border-rose-200 p-3 rounded-lg shadow-sm border-l-4 border-l-rose-500">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline" className="text-rose-600 bg-rose-50 border-rose-200 font-mono text-[10px]">
                          {log.event_type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-800">{log.user_name}</p>
                      <p className="text-xs text-slate-600 mt-1">{log.description}</p>
                    </div>
                  ))}

                  {/* Realtime WS Alerts */}
                  {alerts.map((alert, i) => (
                    <div key={`ws-${i}`} className="bg-white border border-rose-200 p-3 rounded-lg shadow-sm border-l-4 border-l-rose-500 animate-in fade-in slide-in-from-right-2">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-rose-800 text-sm">Participant #{alert.participantId}</span>
                        <span className="text-xs text-rose-500">{alert.time}</span>
                      </div>
                      <p className="text-sm text-rose-700">{alert.message}</p>
                    </div>
                  ))}

                  {!analytics?.proctoring_logs?.length && alerts.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground mt-10">
                      No suspicious activity detected.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                    <Users className="h-4 w-4" /> Active Participants
                  </span>
                  <span className="text-2xl font-bold">{analytics?.stats?.total_participants || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
