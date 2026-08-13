import { Activity, Users, FileText, CheckCircle, TrendingUp } from "lucide-react"
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
    accessorKey: "time",
    header: "Starts In",
  },
  {
    accessorKey: "candidates",
    header: "Candidates",
  },
]

const upcomingData = [
  { id: "1", name: "Frontend Engineer Quiz", time: "2 hours", candidates: 45 },
  { id: "2", name: "System Design Interview", time: "5 hours", candidates: 12 },
  { id: "3", name: "Annual Compliance Training", time: "Tomorrow", candidates: 128 },
]

export function DashboardView() {
  const { data: stats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const res = await api.get('/dashboard/stats')
      return res.data
    }
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-2">
          Real-time overview of your assessment platform metrics.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Participants" value={stats?.totalParticipants || "60"} trend="+12.5%" icon={Users} />
        <MetricCard title="Active Sessions" value={stats?.activeSessions || "5"} trend="+2" icon={Activity} />
        <MetricCard title="Completed Assessments" value={stats?.completedAssessments || "17"} trend="+18.2%" icon={CheckCircle} />
        <MetricCard title="Average Score" value={stats?.averageScore ? `${stats.averageScore.toFixed(1)}%` : "20%"} trend="-1.1%" icon={FileText} downTrend />
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
            <DataTable columns={upcomingColumns} data={upcomingData} searchKey="name" />
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
