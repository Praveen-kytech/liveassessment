import { Video, Calendar, Clock, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"

interface ZoomIntegrationProps {
  meetingId: string
  scheduledFor: Date
  durationMinutes: number
  status: "scheduled" | "in-progress" | "completed"
  joinUrl: string
}

export function ZoomIntegration({
  meetingId,
  scheduledFor,
  durationMinutes,
  status,
  joinUrl
}: ZoomIntegrationProps) {
  const isJoinable = status === "in-progress" || (status === "scheduled" && new Date().getTime() > scheduledFor.getTime() - 15 * 60000)

  return (
    <Card className="border-blue-200 shadow-sm overflow-hidden">
      <div className="h-1 w-full bg-blue-500" />
      <CardHeader className="bg-blue-50/50 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2 text-blue-900">
              <Video className="h-5 w-5 text-blue-600" />
              Live Proctoring Session
            </CardTitle>
            <CardDescription className="text-blue-700/70 mt-1">
              Zoom Meeting ID: {meetingId}
            </CardDescription>
          </div>
          <div className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
            status === 'in-progress' ? 'bg-blue-100 text-blue-700 border-blue-200 animate-pulse' :
            status === 'completed' ? 'bg-muted text-muted-foreground border-border' :
            'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            {status === 'in-progress' ? 'IN PROGRESS' : status.toUpperCase()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="p-2 bg-muted rounded-md"><Calendar className="h-4 w-4" /></div>
            <div>
              <p className="font-medium text-foreground">Date</p>
              <p>{scheduledFor.toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="p-2 bg-muted rounded-md"><Clock className="h-4 w-4" /></div>
            <div>
              <p className="font-medium text-foreground">Time</p>
              <p>{scheduledFor.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({durationMinutes} mins)</p>
            </div>
          </div>
        </div>
        
        <Button 
          className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white" 
          disabled={!isJoinable}
          onClick={() => window.open(joinUrl, '_blank')}
        >
          {isJoinable ? (
            <>Join Zoom Meeting <ExternalLink className="h-4 w-4" /></>
          ) : (
            "Meeting not yet started"
          )}
        </Button>
        {!isJoinable && status === "scheduled" && (
          <p className="text-xs text-center text-muted-foreground mt-3">
            The join button will be enabled 15 minutes before the scheduled time.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
