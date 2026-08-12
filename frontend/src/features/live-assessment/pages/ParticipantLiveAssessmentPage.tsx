import { useState, useEffect, useRef } from "react"
import { useParams } from "react-router-dom"
import { Clock, AlertCircle, Video, Maximize } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/Card"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useAuthStore } from "@/features/auth/hooks/authStore"

export function ParticipantLiveAssessmentPage() {
  const { id } = useParams()
  const { token } = useAuthStore()
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [warning, setWarning] = useState<string | null>(null)
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

  const joinZoom = () => {
    if (session?.meeting_link) {
      window.open(session.meeting_link, '_blank')
    }
  }

  // Pre-assessment Gate
  if (!isFullscreen) {
    return (
      <div className="min-h-screen bg-muted/10 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center space-y-6 shadow-xl border-primary/20">
          <h1 className="text-2xl font-bold">Assessment Setup</h1>
          <p className="text-muted-foreground">
            Before starting, you must join the Zoom meeting and enter Full Screen mode.
            Navigating away from this tab during the assessment is strictly monitored.
          </p>
          <div className="space-y-4">
            {session?.meeting_link && (
              <Button onClick={joinZoom} className="w-full gap-2 bg-blue-600 hover:bg-blue-700" size="lg">
                <Video className="h-5 w-5" /> 1. Join Zoom Meeting
              </Button>
            )}
            <Button onClick={enterFullscreen} className="w-full gap-2" size="lg" variant={session?.meeting_link ? "outline" : "default"}>
              <Maximize className="h-5 w-5" /> 2. Enter Full Screen & Start
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/10 flex flex-col items-center justify-center p-4">
      {/* Anti-cheat Warning Overlay */}
      {warning && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <AlertTriangle className="h-6 w-6" />
          <span className="font-bold">{warning}</span>
          <Button size="sm" variant="secondary" onClick={() => setWarning(null)}>Dismiss</Button>
        </div>
      )}

      <div className="w-full max-w-3xl space-y-6">
        {/* Progress & Status */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
              Question 1 of 10
            </span>
            <span className="text-sm text-muted-foreground font-medium">Multiple Choice</span>
          </div>
          <div className="flex items-center gap-2 text-rose-500 font-bold bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100">
            <Clock className="h-4 w-4" />
            <span>02:45</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-500 ease-in-out w-[10%]" />
        </div>

        {/* Question Card */}
        <Card className="shadow-lg border-primary/10 relative overflow-hidden">
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
                ws.current?.send(JSON.stringify({ action: "submit_answer", question_id: 1, answer: selectedOption }))
              }}
            >
              Submit Answer
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
