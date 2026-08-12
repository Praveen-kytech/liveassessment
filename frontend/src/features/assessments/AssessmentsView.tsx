import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Clock, PlayCircle } from "lucide-react"
import { DataTable } from "@/components/ui/DataTable"
import { api } from "@/lib/api"

export function AssessmentsView() {
  const [isModalOpen, setModalOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: assessments, isLoading, isError } = useQuery({
    queryKey: ["assessments"],
    queryFn: async () => {
      const response = await api.get('/assessments/')
      return response.data
    }
  })

  // Provide an empty array as fallback so DataTable doesn't crash on undefined
  const data = assessments || []

  const columns = [
    {
      accessorKey: "title",
      header: "Assessment Title",
      cell: ({ row }: any) => <div className="font-medium">{row.original.title}</div>
    },
    {
      accessorKey: "passing_percentage",
      header: "Pass %",
      cell: ({ row }: any) => <div>{row.original.passing_percentage}%</div>
    },
    {
      accessorKey: "question_timer_seconds",
      header: "Timer",
      cell: ({ row }: any) => (
        <div className="flex items-center text-muted-foreground gap-1">
          <Clock className="w-4 h-4" /> {row.original.question_timer_seconds}s
        </div>
      )
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const s = row.original.status
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            s === 'LIVE' ? 'bg-emerald-100 text-emerald-800' : 
            s === 'PUBLISHED' ? 'bg-blue-100 text-blue-800' : 
            'bg-gray-100 text-gray-800'
          }`}>
            {s}
          </span>
        )
      }
    },
    {
      id: "actions",
      cell: ({ row }: any) => {
        const assessmentId = row.original.id
        
        const handleLaunch = async () => {
          try {
            const res = await api.post('/sessions/', {
              assessment_id: assessmentId,
              start_time: new Date().toISOString(),
              delivery_mode: 'ONLINE',
              meeting_provider: 'ZOOM'
            });
            // Redirect to control room
            window.location.href = `/live/control/${res.data.id}`
          } catch (e: any) {
            console.error("Failed to launch session", e);
            alert("Failed to create session: " + (e.response?.data?.detail || e.message));
          }
        }

        return (
          <button 
            onClick={handleLaunch} 
            title="Launch Live Session"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold rounded-md transition-colors shadow-sm"
          >
            <PlayCircle className="w-4 h-4" /> Launch
          </button>
        )
      }
    }
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Assessments</h2>
          <p className="text-muted-foreground mt-2">
            Manage your organization's assessments and business rules.
          </p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Assessment
        </button>
      </div>

      <div className="bg-card border rounded-lg shadow-sm">
        <DataTable columns={columns} data={data} searchKey="title" />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card border shadow-lg rounded-lg w-full max-w-lg p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Create Assessment</h3>
              <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              await api.post('/assessments/', {
                title: formData.get('title'),
                passing_percentage: Number(formData.get('passing_percentage')),
                question_timer_seconds: Number(formData.get('question_timer_seconds')),
                max_attempts: Number(formData.get('max_attempts')),
                is_certificate_eligible: formData.get('cert') === 'on',
                organization_id: 1 // hardcoded for POC
              });
              queryClient.invalidateQueries({ queryKey: ["assessments"] });
              setModalOpen(false);
            }} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <input name="title" required type="text" className="w-full mt-1 px-3 py-2 border rounded-md" placeholder="e.g. Q3 Engineering Review" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Passing Percentage</label>
                  <input name="passing_percentage" type="number" defaultValue={70} className="w-full mt-1 px-3 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="text-sm font-medium">Question Timer (sec)</label>
                  <input name="question_timer_seconds" type="number" defaultValue={60} className="w-full mt-1 px-3 py-2 border rounded-md" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Max Attempts</label>
                  <input name="max_attempts" type="number" defaultValue={1} className="w-full mt-1 px-3 py-2 border rounded-md" />
                </div>
                <div className="flex items-center h-full pt-6 space-x-2">
                  <input name="cert" type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300" id="cert" />
                  <label htmlFor="cert" className="text-sm font-medium">Certificate Eligible</label>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded-md hover:bg-muted font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-medium">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
