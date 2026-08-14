import { useState, useEffect, useRef } from "react"
import { useParams } from "react-router-dom"
import { Clock, AlertCircle, AlertTriangle, Video, Maximize } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/Card"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useAuthStore } from "@/features/auth/hooks/authStore"
import { ZoomEmbed } from "@/components/zoom/ZoomEmbed"

export function ParticipantLiveAssessmentPage() {
  const { id } = useParams()
  const { token } = useAuthStore()
  const [currentQuestion] = useState<{id: number, text: string, type: string} | null>(null)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [warning, setWarning] = useState<string | null>(null)
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null)
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

  // WebSocket Connection
  useEffect(() => {
    if (!id || !token) return;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/live/ws/session/${id}?token=${token}`
    ws.current = new WebSocket(wsUrl)
    
    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.action === "new_question") {
          setActiveQuestion(data.question_id)
          setSelectedOption(null) // Reset selection for new question
        } else if (data.action === "close_question") {
          setActiveQuestion(null)
          setSelectedOption(null)
        }
      } catch (err) {
        console.error("WS parse error", err)
      }
    }

    return () => ws.current?.close()
  }, [id, token])

  // Anti-Cheat (Proctoring) Logic
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isFullscreen) {
        setWarning("WARNING: You have switched tabs. This activity has been recorded.")
        ws.current?.send(JSON.stringify({ action: "proctoring_event", type: "tab_switch" }))
      }
    }

    const handleBlur = () => {
      if (isFullscreen) {
        setWarning("WARNING: Window lost focus. This activity has been recorded.")
        ws.current?.send(JSON.stringify({ action: "proctoring_event", type: "window_blur" }))
      }
    }

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullscreen) {
        setWarning("WARNING: You exited full screen. This activity has been recorded.")
        ws.current?.send(JSON.stringify({ action: "proctoring_event", type: "fullscreen_exit" }))
        setIsFullscreen(false)
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("blur", handleBlur)
    document.addEventListener("fullscreenchange", handleFullscreenChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("blur", handleBlur)
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [isFullscreen])

  const enterFullscreen = () => {
    document.documentElement.requestFullscreen().then(() => {
      setIsFullscreen(true)
      setHasStarted(true)
      setWarning(null)
    }).catch(err => {
      console.error("Error attempting to enable fullscreen:", err)
    })
  }

  // const joinZoom = () => {
  //   if (session?.meeting_link) {
  //     window.open(session.meeting_link, '_blank')
  //   }
  // }

  // We use a fixed overlay instead of unmounting the component tree.
  // This prevents the Zoom SDK from being destroyed when the browser exits fullscreen
  // (e.g. when requesting camera permissions or screen sharing).

  return (
    <div className="min-h-screen bg-muted/10 flex flex-col p-4 relative">
      
      {!isFullscreen && (
        <div className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center p-4">
          <Card className="w-full max-w-md p-8 text-center space-y-6 shadow-xl border-primary/20">
            <h1 className="text-2xl font-bold">{hasStarted ? "Assessment Paused" : "Assessment Setup"}</h1>
            <p className="text-muted-foreground">
              {hasStarted 
                ? "You exited full screen mode (or the browser opened a permission dialog). Please return to full screen to continue." 
                : "Before starting, you must enter Full Screen mode. Navigating away from this tab during the assessment is strictly monitored."}
            </p>
            <div className="space-y-4">
              <Button onClick={enterFullscreen} className="w-full gap-2" size="lg">
                <Maximize className="h-5 w-5" /> {hasStarted ? "Return to Full Screen" : "Enter Full Screen & Start"}
              </Button>
            </div>
          </Card>
        </div>
      )}
      {/* Anti-cheat Warning Overlay */}
      {warning && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <AlertTriangle className="h-6 w-6" />
          <span className="font-bold">{warning}</span>
          <Button size="sm" variant="secondary" onClick={() => setWarning(null)}>Dismiss</Button>
        </div>
      )}

      <div className="flex gap-6 h-[calc(100vh-2rem)] max-w-[1600px] mx-auto w-full">
        
        {/* Left Side: Zoom Embed */}
        <div className="w-[800px] bg-card rounded-2xl border shadow-xl flex flex-col overflow-hidden shrink-0">
          <div className="px-4 py-3 border-b font-semibold text-sm flex justify-between items-center bg-muted/30">
            <span>Live Proctoring</span>
            <Badge variant="destructive" className="text-xs animate-pulse px-2 py-0.5">Recording</Badge>
          </div>
          <div className="flex-1 relative bg-black">
            {session?.meeting_link && (
              <ZoomEmbed meetingLink={session.meeting_link} role={0} />
            )}
          </div>
        </div>

        {/* Right Side: Assessment Form */}
        <div className="flex-1 bg-card rounded-2xl border shadow-xl flex flex-col overflow-hidden">
          {/* Header Area */}
          <div className="px-8 py-5 border-b bg-muted/10 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className="px-4 py-1.5 text-sm rounded-full shadow-sm">
                  {activeQuestion ? `Question ${assessment?.questions?.findIndex((q: any) => q.id === activeQuestion) + 1} of ${assessment?.questions?.length || 0}` : "Standby Mode"}
                </Badge>
                <span className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">{currentQuestion?.type || "Waiting..."}</span>
              </div>
              <div className="flex items-center gap-2 text-rose-600 font-bold bg-rose-50 px-4 py-1.5 rounded-full border border-rose-200 shadow-sm">
                <Clock className="h-4 w-4" />
                <span>Live Assessment</span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="h-2.5 w-full bg-muted/50 rounded-full overflow-hidden shadow-inner">
              <div className="h-full bg-primary transition-all duration-500 ease-in-out w-[100%]" />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-8 flex flex-col bg-muted/5 relative overflow-y-auto">
            {activeQuestion && assessment?.questions?.find((q: any) => q.id === activeQuestion) ? (
              <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-4 max-w-4xl mx-auto w-full">
                <h2 className="text-3xl font-extrabold leading-tight text-foreground mb-8 text-center mt-4">
                  {assessment.questions.find((q: any) => q.id === activeQuestion).text}
                </h2>
                <div className="space-y-4 flex-1">
                  {assessment.questions.find((q: any) => q.id === activeQuestion).options?.map((option: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedOption(index)}
                      className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                        selectedOption === index
                          ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20 scale-[1.01]"
                          : "border-muted hover:border-primary/40 hover:bg-white bg-card shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          selectedOption === index ? "border-primary" : "border-muted-foreground/30"
                        }`}>
                          {selectedOption === index && <div className="w-3.5 h-3.5 rounded-full bg-primary" />}
                        </div>
                        <span className={`text-lg ${selectedOption === index ? "font-bold text-primary" : "font-medium text-foreground/80"}`}>
                          {option}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="pt-8 mt-8 border-t flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-white px-4 py-2 rounded-lg border shadow-sm">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    <span>Please double-check before submitting</span>
                  </div>
                  <Button 
                    size="lg" 
                    disabled={selectedOption === null} 
                    className="px-10 py-6 text-lg font-bold shadow-lg transition-transform hover:scale-105 active:scale-95"
                    onClick={() => {
                      ws.current?.send(JSON.stringify({ action: "submit_answer", question_id: activeQuestion, answer: selectedOption }))
                      setSelectedOption(null)
                      setActiveQuestion(null)
                    }}
                  >
                    Submit Answer
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-1000">
                <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-pulse shadow-inner">
                  <Clock className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-3xl font-extrabold text-foreground mb-3">Waiting for the next question...</h2>
                <p className="text-muted-foreground max-w-md text-lg leading-relaxed">
                  The Doctor is currently reviewing the results. Pay attention to the Zoom feed for instructions.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
