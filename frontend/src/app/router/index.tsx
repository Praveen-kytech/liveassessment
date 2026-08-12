import { createBrowserRouter } from "react-router-dom"
import { AppShell } from "@/components/layout/AppShell"
import { DashboardView } from "@/features/dashboard/DashboardView"
import { DoctorLiveControlPage } from "@/features/live-assessment/pages/DoctorLiveControlPage"
import { ParticipantLiveAssessmentPage } from "@/features/live-assessment/pages/ParticipantLiveAssessmentPage"
import { ResultsPage } from "@/features/results/pages/ResultsPage"
import { AssessmentsView } from "@/features/assessments/AssessmentsView"
import { ParticipantsView } from "@/features/participants/ParticipantsView"
import { LoginPage } from "@/features/auth/pages/LoginPage"
import { SignupPage } from "@/features/auth/pages/SignupPage"
import { ProtectedRoute } from "@/components/layout/ProtectedRoute"

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/signup",
    element: <SignupPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardView />,
      },
      {
        path: "assessments",
        element: <AssessmentsView />,
      },
      {
        path: "participants",
        element: <ParticipantsView />,
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
