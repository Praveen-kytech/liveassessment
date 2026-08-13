import { Activity, Users, FileText, CheckCircle, TrendingUp, Clock, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { DataTable } from "@/components/ui/DataTable"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Legend
} from "recharts"

const chartData = [
  { name: "Mon", participants: 120 },
  { name: "Tue", participants: 210 },
  { name: "Wed", participants: 180 },
  { name: "Thu", participants: 290 },
  { name: "Fri", participants: 340 },
  { name: "Sat", participants: 150 },
  { name: "Sun", participants: 400 },
]

const upcomingColumns = [
  {
    accessorKey: "name",
    header: "Assessment Name",
  },
  {
    accessorKey: "start_time",
    header: "Starts At",
    cell: ({ row }: any) => {
      const time = row.getValue("start_time")
      if (!time) return "TBD"
      return new Date(time).toLocaleString()
    }
  },
  {
    accessorKey: "candidates",
    header: "Candidates",
  },
]

export function DashboardView() {
  const { data: stats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const res = await api.get('/dashboard/stats')
      return res.data
    }
  })

  const { data: upcoming } = useQuery({
    queryKey: ['dashboardUpcoming'],
    queryFn: async () => {
      const res = await api.get('/dashboard/upcoming')
      return res.data
    }
  })

  const { data: timeline } = useQuery({
    queryKey: ['dashboardTimeline'],
    queryFn: async () => {
      const res = await api.get('/dashboard/timeline')
      return res.data
    }
  })

  const { data: assessmentStats } = useQuery({
    queryKey: ['dashboardAssessmentStats'],
    queryFn: async () => {
      const res = await api.get('/dashboard/assessment-stats')
      return res.data
    }
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-2">
          Real-time overview of your assessment platform metrics.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Participants" value={stats?.totalParticipants || "0"} trend="+12.5%" icon={Users} />
        <MetricCard title="Active Sessions" value={stats?.activeSessions || "0"} trend="+2" icon={Activity} />
        <MetricCard title="Completed Assessments" value={stats?.completedAssessments || "0"} trend="+18.2%" icon={CheckCircle} />
        <MetricCard title="Average Score" value={stats?.averageScore ? `${stats.averageScore.toFixed(1)}%` : "0%"} trend="-1.1%" icon={FileText} downTrend />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Participant Activity (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorParticipants" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area type="monotone" dataKey="participants" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorParticipants)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 shadow-soft">
          <CardHeader>
            <CardTitle>Upcoming Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={upcomingColumns} data={upcoming || []} searchKey="name" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              Assessment Accuracy (Correct vs Wrong)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={assessmentStats || []} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} angle={-15} textAnchor="end" />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="correct" name="Correct Answers" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="wrong" name="Wrong Answers" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 shadow-soft h-[420px] flex flex-col">
          <CardHeader className="shrink-0 border-b pb-4">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Recent Global Events
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {timeline?.map((event: any, i: number) => (
              <div key={i} className="flex gap-3 text-sm pb-4 border-b last:border-0 last:pb-0">
                <div className="w-16 text-muted-foreground shrink-0 text-xs mt-0.5">
                  {new Date(event.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-primary">{event.assessment_name}</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-muted text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{event.event_type.replace(/_/g, ' ')}</span>
                  </div>
                  {event.metadata && (
                    <div className="mt-1">
                      {(() => {
                        try {
                          const data = typeof event.metadata === 'string' ? JSON.parse(event.metadata) : event.metadata;
                          if (event.event_type === "ANSWER_SUBMITTED") {
                            return (
                              <div className="flex items-center gap-1.5 text-xs bg-muted/30 p-2 rounded-md">
                                <span className="text-muted-foreground">Participant #{data.participant_id}</span>
                                <span className="text-muted-foreground">→</span>
                                {data.is_correct ? (
                                  <span className="text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded border border-green-200 text-[10px]">Correct Answer</span>
                                ) : (
                                  <span className="text-red-600 font-medium bg-red-50 px-1.5 py-0.5 rounded border border-red-200 text-[10px]">Wrong Answer</span>
                                )}
                              </div>
                            );
                          }
                          return (
                            <div className="text-muted-foreground text-xs bg-muted/30 p-2 rounded-md font-mono">
                              {typeof event.metadata === 'string' ? event.metadata : JSON.stringify(event.metadata)}
                            </div>
                          );
                        } catch (e) {
                          return (
                            <div className="text-muted-foreground text-xs bg-muted/30 p-2 rounded-md font-mono">
                              {event.metadata}
                            </div>
                          );
                        }
                      })()}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {timeline?.length === 0 && (
              <div className="text-center text-muted-foreground py-8">No recent events.</div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  )
}

function MetricCard({ title, value, trend, icon: Icon, downTrend = false }: any) {
  return (
    <Card className="hover:shadow-glow transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">
          <span className={downTrend ? "text-rose-500" : "text-emerald-500"}>
            {trend}
          </span>{" "}
          from last month
        </p>
      </CardContent>
    </Card>
  )
}
