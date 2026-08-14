import React from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Activity, CheckCircle, Clock } from "lucide-react"
import { api } from "@/lib/api"
import { DataTable } from "@/components/ui/DataTable"

export function ResultsView() {
  const navigate = useNavigate()
  
  const [searchParams] = useSearchParams()
  const filterAssessmentId = searchParams.get('assessment_id')
  
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['all_sessions'],
    queryFn: () => api.get('/sessions/').then(res => res.data)
  })

  // Filter for completed sessions to show results
  let completedSessions = sessions?.filter((s: any) => s.status === 'COMPLETED') || []
  if (filterAssessmentId) {
    completedSessions = completedSessions.filter((s: any) => s.assessment_id.toString() === filterAssessmentId)
  }

  const columns = [
    {
      accessorKey: "id",
      header: "Session ID",
      cell: ({ row }: any) => <div className="font-medium">#{row.original.id}</div>
    },
    {
      accessorKey: "assessment_id",
      header: "Assessment Topic",
      cell: ({ row }: any) => <div>{row.original.assessment?.title || `ID: ${row.original.assessment_id}`}</div>
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 flex items-center gap-1 w-max">
          <CheckCircle className="w-3 h-3" /> Completed
        </span>
      )
    },
    {
      id: "actions",
      cell: ({ row }: any) => {
        return (
          <button 
            onClick={() => navigate(`/sessions/${row.original.id}/results`)}
            className="text-primary hover:underline font-medium text-sm"
          >
            View Analytics
          </button>
        )
      }
    }
  ]

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Results...</div>
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Assessment Results</h2>
        <p className="text-muted-foreground mt-2">
          View analytics and performance reports for all completed sessions.
        </p>
      </div>

      <div className="bg-card border rounded-lg shadow-sm">
        <DataTable columns={columns} data={completedSessions} searchKey="id" />
      </div>
    </div>
  )
}
