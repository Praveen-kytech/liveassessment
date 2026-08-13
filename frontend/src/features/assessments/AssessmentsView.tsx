import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus, Clock, PlayCircle } from "lucide-react"
import { DataTable } from "@/components/ui/DataTable"
import { api } from "@/lib/api"

export function AssessmentsView() {
  const navigate = useNavigate()

  const { data: assessments } = useQuery({
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
          onClick={() => navigate('/assessments/create')}
          className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Assessment
        </button>
      </div>

      <div className="bg-card border rounded-lg shadow-sm">
        <DataTable columns={columns} data={data} searchKey="title" />
      </div>

    </div>
  )
}
