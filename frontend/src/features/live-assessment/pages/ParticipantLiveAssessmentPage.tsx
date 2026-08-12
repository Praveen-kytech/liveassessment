import { useState } from "react"
import { Clock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/Card"

export function ParticipantLiveAssessmentPage() {
  const [selectedOption, setSelectedOption] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-muted/10 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl space-y-6">
        {/* Progress & Status */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
              Question 3 of 10
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
          <div className="h-full bg-primary transition-all duration-500 ease-in-out w-[30%]" />
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
            <Button size="lg" disabled={selectedOption === null} className="px-8 font-semibold shadow-md">
              Submit Answer
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
