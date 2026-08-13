import { useState, useEffect, useRef } from "react"
import { useParams } from "react-router-dom"
import { Clock, AlertCircle, Maximize, AlertTriangle } from "lucide-react"
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

  // WebSocket Connection
  useEffect(() => {
    if (!id || !token) return;
    const wsUrl = `ws://localhost:8000/api/live/ws/session/${id}?token=${token}`
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

  // Pre-assessment Gate
  if (!isFullscreen) {
    return (
      <div className="min-h-screen bg-muted/10 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center space-y-6 shadow-xl border-primary/20">
          <h1 className="text-2xl font-bold">Assessment Setup</h1>
          <p className="text-muted-foreground">
            Before starting, you must enter Full Screen mode. Navigating away from this tab during the assessment is strictly monitored.
          </p>
          <div className="space-y-4">
            <Button onClick={enterFullscreen} className="w-full gap-2" size="lg">
              <Maximize className="h-5 w-5" /> Enter Full Screen & Start
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/10 flex flex-col p-4 relative">
      {/* Anti-cheat Warning Overlay */}
      {warning && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <AlertTriangle className="h-6 w-6" />
          <span className="font-bold">{warning}</span>
          <Button size="sm" variant="secondary" onClick={() => setWarning(null)}>Dismiss</Button>
        </div>
      )}

      <div className="flex gap-6 h-full max-w-7xl mx-auto w-full flex-1">
        
        {/* Left Side: Zoom Embed */}
        <div className="w-1/3 min-w-[300px] bg-card rounded-xl border shadow-sm flex flex-col">
          <div className="p-3 border-b font-medium text-sm flex justify-between items-center bg-muted/30">
            <span>Live Proctoring</span>
            <Badge variant="outline" className="text-xs">Recording</Badge>
          </div>
          {/* Zoom Video Feed */}
          <div className="flex-1 min-h-[550px] pb-16 relative bg-black rounded-xl">
            {session?.meeting_link && (
              <ZoomEmbed meetingLink={session.meeting_link} role={0} />
            )}
          </div>
        </div>

        {/* Right Side: Assessment Form */}
        <div className="flex-1 space-y-6 flex flex-col">
        {/* Progress & Status */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
              {activeQuestion ? `Question ${activeQuestion} of 10` : "Waiting for Question..."}
            </span>
            <span className="text-sm text-muted-foreground font-medium">{currentQuestion?.type || "Waiting..."}</span>
          </div>
          <div className="flex items-center gap-2 text-rose-500 font-bold bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100">
            <Clock className="h-4 w-4" />
            <span>Live</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-500 ease-in-out w-[100%]" />
        </div>

        {/* Question Card */}
        {activeQuestion ? (
          <Card className="shadow-lg border-primary/10 relative overflow-hidden animate-in slide-in-from-bottom-4 fade-in">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/50" />
            <CardHeader className="pt-8 pb-4">
              <h2 className="text-2xl font-semibold leading-tight text-foreground">
                What is the primary purpose of the React useMemo hook?
              </h2>
            </CardHeader>
            <CardContent className="space-y-4 pb-8">
              {[
                "To cache complex calculation results",
                "To memoize entire components",
                "To manage side effects",
                "To subscribe to context changes"
              ].map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedOption(index)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                    selectedOption === index
                      ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                      : "border-muted hover:border-primary/40 hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedOption === index ? "border-primary" : "border-muted-foreground/30"
                    }`}>
                      {selectedOption === index && <div className="w-3 h-3 rounded-full bg-primary" />}
                    </div>
                    <span className={`text-base ${selectedOption === index ? "font-medium" : ""}`}>
                      {option}
                    </span>
                  </div>
                </button>
              ))}
            </CardContent>
            <CardFooter className="bg-muted/20 border-t p-6 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span>Select one option</span>
              </div>
              <Button 
                size="lg" 
                disabled={selectedOption === null} 
                className="px-8 font-semibold shadow-md"
                onClick={() => {
                  ws.current?.send(JSON.stringify({ action: "submit_answer", question_id: activeQuestion, answer: selectedOption }))
                  // Show a temporary success state before the question closes
                  setSelectedOption(null)
                  setActiveQuestion(null)
                }}
              >
                Submit Answer
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="shadow-lg border-primary/10 relative overflow-hidden flex-1 flex flex-col items-center justify-center text-center p-8 animate-pulse bg-muted/20">
            <Clock className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h2 className="text-xl font-semibold text-foreground">Waiting for the next question...</h2>
            <p className="text-muted-foreground mt-2 max-w-md">The Doctor is currently reviewing the results. Pay attention to the Zoom feed for instructions.</p>
          </Card>
        )}
      </div>
      </div>
    </div>
  )
}
