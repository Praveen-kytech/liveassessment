import { createBrowserRouter } from "react-router-dom"
import { AppShell } from "@/components/layout/AppShell"
import { DashboardView } from "@/features/dashboard/DashboardView"
import { DoctorLiveControlPage } from "@/features/live-assessment/pages/DoctorLiveControlPage"
import { ParticipantLiveAssessmentPage } from "@/features/live-assessment/pages/ParticipantLiveAssessmentPage"
import { ResultsPage } from "@/features/results/pages/ResultsPage"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <DashboardView />,
      },
      {
        path: "assessments",
        element: <div className="p-4 text-xl">Assessments Module (Coming soon)</div>,
      },
      {
        path: "participants",
        element: <div className="p-4 text-xl">Participants Module (Coming soon)</div>,
      },
      {
        path: "results/:id",
        element: <ResultsPage />,
      },
      {
        path: "settings",
        element: <div className="p-4 text-xl">Settings (Coming soon)</div>,
      },
      {
        path: "live/control/:id",
        element: <DoctorLiveControlPage />,
      }
    ],
  },
  {
    path: "/live/assessment/:id",
    element: <ParticipantLiveAssessmentPage />,
  }
])
