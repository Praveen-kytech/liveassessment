import { createBrowserRouter, Navigate } from "react-router-dom"
import { AppShell } from "@/components/layout/AppShell"
import { DashboardView } from "@/features/dashboard/DashboardView"
import { DoctorLiveControlPage } from "@/features/live-assessment/pages/DoctorLiveControlPage"
import { ParticipantLiveAssessmentPage } from "@/features/live-assessment/pages/ParticipantLiveAssessmentPage"
import { SessionResultsView } from "@/features/results/SessionResultsView"
import { ResultsView } from "@/features/results/ResultsView"
import { ResultsPage } from "@/features/results/pages/ResultsPage"
import { CertificatePage } from "@/features/results/pages/CertificatePage"
import { AssessmentsView } from "@/features/assessments/AssessmentsView"
import { AssessmentBuilderPage } from "@/features/assessments/pages/AssessmentBuilderPage"
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
        path: "dashboard",
        element: <Navigate to="/" replace />
      },
      {
        path: "/assessments/create",
        element: <AssessmentBuilderPage />,
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
        path: "results",
        element: <ResultsView />,
      },
      {
        path: "sessions/:id/results",
        element: <SessionResultsView />,
      },
      {
        path: "results/:id",
        element: <ResultsPage />,
      },
      {
        path: "certificate/:id",
        element: <CertificatePage />,
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
    element: (
      <ProtectedRoute>
        <ParticipantLiveAssessmentPage />
      </ProtectedRoute>
    ),
  }
])
