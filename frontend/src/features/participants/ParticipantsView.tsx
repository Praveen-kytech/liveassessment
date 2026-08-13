import { useQuery } from "@tanstack/react-query"
import { QrCode, MoreHorizontal, CheckCircle } from "lucide-react"
import { DataTable } from "@/components/ui/DataTable"
import { api } from "@/lib/api"

export function ParticipantsView() {
  const { data: participants } = useQuery({
    queryKey: ["participants"],
    queryFn: async () => {
      const response = await api.get('/participants/')
      return response.data
    }
  })

  const data = participants || []

  const columns = [
    {
      accessorKey: "name",
      header: "Participant Name",
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-xs text-muted-foreground">{row.original.email}</div>
        </div>
      )
    },
    {
      accessorKey: "session",
      header: "Enrolled Session",
    },
    {
      accessorKey: "status",
      header: "Check-in Status",
      cell: ({ row }: any) => {
        const s = row.original.status
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-max ${
            s === 'CHECKED_IN' ? 'bg-emerald-100 text-emerald-800' : 
            s === 'COMPLETED' ? 'bg-blue-100 text-blue-800' : 
            'bg-gray-100 text-gray-800'
          }`}>
            {s === 'CHECKED_IN' && <CheckCircle className="w-3 h-3" />}
            {s.replace('_', ' ')}
          </span>
        )
      }
    },
    {
      id: "actions",
      cell: ({ row }: any) => (
        <div className="flex gap-2">
          {row.original.status === 'REGISTERED' && (
            <button className="px-3 py-1 bg-secondary text-secondary-foreground text-xs rounded-md hover:bg-secondary/80 font-medium">
              Manual Check-in
            </button>
          )}
          <button className="p-2 hover:bg-muted rounded-md transition-colors" title="View QR Code">
            <QrCode className="w-4 h-4 text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-muted rounded-md transition-colors">
            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Participants</h2>
        <p className="text-muted-foreground mt-2">
          Manage session registrations and physical check-ins.
        </p>
      </div>

      <div className="bg-card border rounded-lg shadow-sm">
        <DataTable columns={columns} data={data} searchKey="name" />
      </div>
    </div>
  )
}
