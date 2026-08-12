import { Activity, Users, FileText, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"

const metrics = [
  {
    title: "Total Participants",
    value: "2,543",
    change: "+12.5%",
    trend: "up",
    icon: Users,
  },
  {
    title: "Active Sessions",
    value: "14",
    change: "+2",
    trend: "up",
    icon: Activity,
  },
  {
    title: "Completed Assessments",
    value: "1,204",
    change: "+18.2%",
    trend: "up",
    icon: CheckCircle,
  },
  {
    title: "Average Score",
    value: "76.4%",
    change: "-1.1%",
    trend: "down",
    icon: FileText,
  },
]

export function DashboardView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-2">
          Overview of your assessment platform metrics.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span
                  className={
                    metric.trend === "up" ? "text-emerald-500" : "text-rose-500"
                  }
                >
                  {metric.change}
                </span>{" "}
                from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-md m-4">
              <span className="text-muted-foreground">Chart Placeholder</span>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Upcoming Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Frontend Engineer Assessment #{i}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Starts in {i * 2} hours
                    </p>
                  </div>
                  <div className="ml-auto font-medium">
                    {i * 12} candidates
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
