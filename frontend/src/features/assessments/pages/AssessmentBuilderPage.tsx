import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Trash2, Save, ArrowLeft, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { api } from "@/lib/api"
import { useAuthStore } from "@/features/auth/hooks/authStore"

interface Option {
  text: string;
}

interface QuestionForm {
  id: string;
  text: string;
  type: string;
  options: Option[];
  correctOptionIndex: number;
}

export function AssessmentBuilderPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Assessment Details
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [passingScore, setPassingScore] = useState(70)
  
  // Questions State
  const [questions, setQuestions] = useState<QuestionForm[]>([
    {
      id: "q1",
      text: "",
      type: "MULTIPLE_CHOICE",
      options: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
      correctOptionIndex: 0
    }
  ])

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `q${Date.now()}`,
        text: "",
        type: "MULTIPLE_CHOICE",
        options: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
        correctOptionIndex: 0
      }
    ])
  }

  const removeQuestion = (id: string) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter(q => q.id !== id))
  }

  const updateQuestionText = (id: string, text: string) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, text } : q))
  }

  const addOption = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options.length < 5) {
        return { ...q, options: [...q.options, { text: "" }] }
      }
      return q
    }))
  }

  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options.length > 2) {
        const newOptions = [...q.options]
        newOptions.splice(optionIndex, 1)
        // Adjust correct index if needed
        let newCorrect = q.correctOptionIndex
        if (newCorrect === optionIndex) newCorrect = 0
        else if (newCorrect > optionIndex) newCorrect--
        return { ...q, options: newOptions, correctOptionIndex: newCorrect }
      }
      return q
    }))
  }

  const updateOptionText = (questionId: string, optionIndex: number, text: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options]
        newOptions[optionIndex].text = text
        return { ...q, options: newOptions }
      }
      return q
    }))
  }

  const setCorrectOption = (questionId: string, optionIndex: number) => {
    setQuestions(questions.map(q => q.id === questionId ? { ...q, correctOptionIndex: optionIndex } : q))
  }

  const handlePublish = async () => {
    if (!title) {
      alert("Please provide an assessment title")
      return
    }
    
    // Validate questions
    for (const q of questions) {
      if (!q.text) {
        alert("All questions must have text")
        return
      }
      for (const opt of q.options) {
        if (!opt.text) {
          alert("All options must have text")
          return
        }
      }
    }

    setIsSubmitting(true)
    try {
      const orgId = user?.organization_id || 1; 
      
      const assessmentRes = await api.post("/assessments/", {
        title,
        description,
        organization_id: orgId,
        passing_percentage: passingScore,
        question_timer_seconds: 60,
        max_attempts: 1,
        is_certificate_eligible: true
      })
      
      const assessmentId = assessmentRes.data.id

      // 2. Create all Questions concurrently
      const questionPromises = questions.map((q, index) => {
        return api.post("/questions/", {
          text: q.text,
          type: q.type,
          assessment_id: assessmentId,
          correct_answer: q.correctOptionIndex.toString(),
          options: q.options.map(o => o.text),
          order: index + 1
        })
      })

      await Promise.all(questionPromises)
      
      navigate('/assessments')
    } catch (error: any) {
      console.error("Failed to publish assessment", error)
      const detail = error.response?.data?.detail || error.message
      alert(`Failed to publish assessment: ${detail}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/20 pb-20">
      {/* Header */}
      <div className="bg-white border-b px-8 py-6 sticky top-0 z-10 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Assessment Builder</h1>
            <p className="text-sm text-muted-foreground">Create a new live assessment</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
          <Button onClick={handlePublish} disabled={isSubmitting} className="gap-2 px-6">
            <Save className="h-4 w-4" /> 
            {isSubmitting ? "Publishing..." : "Publish Assessment"}
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full mt-8 space-y-8 px-4">
        {/* Assessment Details */}
        <Card className="border-primary/20 shadow-md bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Assessment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input 
                placeholder="e.g. Midterm React Assessment" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg py-6"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea 
                placeholder="Provide a brief overview of this assessment..." 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <div className="w-1/3 space-y-2">
              <label className="text-sm font-medium">Passing Score (%)</label>
              <Input 
                type="number" 
                min="0" max="100" 
                value={passingScore}
                onChange={(e) => setPassingScore(Number(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Questions List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Questions</h2>
            <Badge variant="secondary" className="px-3 py-1 text-sm">
              {questions.length} Question{questions.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {questions.map((q, qIndex) => (
            <Card key={q.id} className="relative shadow-sm border-slate-200 transition-all hover:border-primary/30">
              <div className="absolute -left-4 -top-4 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-sm">
                {qIndex + 1}
              </div>
              
              <CardHeader className="pb-3 flex flex-row items-start justify-between">
                <div className="flex-1 mr-6">
                  <Textarea 
                    placeholder={`Question ${qIndex + 1} text...`}
                    value={q.text}
                    onChange={(e) => updateQuestionText(q.id, e.target.value)}
                    className="text-base font-medium resize-none min-h-[80px]"
                  />
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                  onClick={() => removeQuestion(q.id)}
                  disabled={questions.length === 1}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="text-sm font-medium text-slate-500 mb-2">Options</div>
                {q.options.map((opt, oIndex) => (
                  <div key={oIndex} className="flex items-center gap-3">
                    <button 
                      onClick={() => setCorrectOption(q.id, oIndex)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                        q.correctOptionIndex === oIndex 
                          ? "border-green-500 bg-green-50 text-green-500" 
                          : "border-slate-300 hover:border-primary/50"
                      }`}
                      title="Mark as correct answer"
                    >
                      {q.correctOptionIndex === oIndex && <CheckCircle2 className="h-4 w-4" />}
                    </button>
                    
                    <div className="flex-1 flex items-center gap-2">
                      <div className="w-6 text-center text-sm font-bold text-slate-400 shrink-0">
                        {String.fromCharCode(65 + oIndex)}
                      </div>
                      <Input 
                        value={opt.text}
                        onChange={(e) => updateOptionText(q.id, oIndex, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                        className={q.correctOptionIndex === oIndex ? "border-green-200 bg-green-50/30" : ""}
                      />
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="shrink-0 text-slate-400 hover:text-rose-500"
                      onClick={() => removeOption(q.id, oIndex)}
                      disabled={q.options.length <= 2}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="bg-slate-50 border-t rounded-b-xl py-3 px-6">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 text-primary"
                  onClick={() => addOption(q.id)}
                  disabled={q.options.length >= 5}
                >
                  <Plus className="h-4 w-4" /> Add Option
                </Button>
              </CardFooter>
            </Card>
          ))}

          <Button 
            className="w-full h-16 border-2 border-dashed bg-transparent hover:bg-slate-50 gap-2 text-muted-foreground hover:text-primary"
            onClick={addQuestion}
          >
            <Plus className="h-5 w-5" /> Add Another Question
          </Button>
        </div>
      </div>
    </div>
  )
}
