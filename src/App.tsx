import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/lib/auth'
import { RequireAuth } from '@/components/RequireAuth'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { HomePage } from '@/pages/public/HomePage'
import { ServicesPage } from '@/pages/public/ServicesPage'
import { ServiceDetailPage } from '@/pages/public/ServiceDetailPage'
import { PricingPage } from '@/pages/public/PricingPage'
import {
  AboutPage,
  ConsultationPage,
  ContactPage,
  FaqPage,
  LegalPage,
  NotFoundPage,
  ResourcesPage,
} from '@/pages/public/SimplePages'
import { ForgotPasswordPage, LoginPage, RegisterPage } from '@/pages/auth/AuthPages'
import {
  AdminCasesPage,
  AdminDashboard,
  AdminFinancePage,
  AdminHrPage,
  AdminInvoicesPage,
  AdminLayout,
  AdminLeadsPage,
  AdminServicesPage,
  AdminTaxPage,
  ModulePlaceholder,
} from '@/pages/admin/AdminRoutes'
import {
  PortalCasesPage,
  PortalDashboard,
  PortalDocumentsPage,
  PortalInvoicesPage,
  PortalLayout,
  PortalSupportPage,
} from '@/pages/portal/PortalRoutes'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="services/:slug" element={<ServiceDetailPage />} />
            <Route path="pricing" element={<PricingPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="consultation" element={<ConsultationPage />} />
            <Route path="resources" element={<ResourcesPage />} />
            <Route path="faq" element={<FaqPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="privacy" element={<LegalPage kind="privacy" />} />
            <Route path="terms" element={<LegalPage kind="terms" />} />
            <Route path="refund-policy" element={<LegalPage kind="refund" />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          <Route
            path="/app"
            element={
              <RequireAuth staffOnly>
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="leads" element={<AdminLeadsPage />} />
            <Route path="cases" element={<AdminCasesPage />} />
            <Route path="services" element={<AdminServicesPage />} />
            <Route
              path="tasks"
              element={
                <ModulePlaceholder
                  title="Tasks"
                  body="Task board schema and automation hooks are planned for the CRM/ops phase."
                />
              }
            />
            <Route path="finance" element={<AdminFinancePage />} />
            <Route path="invoices" element={<AdminInvoicesPage />} />
            <Route
              path="petty-cash"
              element={
                <ModulePlaceholder
                  title="Petty cash"
                  body="Petty cash accounts and entries will post through the double-entry ledger."
                />
              }
            />
            <Route path="tax" element={<AdminTaxPage />} />
            <Route path="hr" element={<AdminHrPage />} />
            <Route
              path="attendance"
              element={
                <ModulePlaceholder
                  title="Attendance"
                  body="attendance_records table exists. Check-in UI connects next."
                />
              }
            />
            <Route
              path="payroll"
              element={
                <ModulePlaceholder
                  title="Payroll"
                  body="Payroll runs will post salary journals with approval gates — schema groundwork in progress."
                />
              }
            />
            <Route
              path="documents"
              element={
                <ModulePlaceholder
                  title="Documents"
                  body="Private bucket client-documents + RLS policies are in migrations."
                />
              }
            />
            <Route
              path="reports"
              element={
                <ModulePlaceholder title="Reports" body="Financial and ops reports come after journal posting." />
              }
            />
            <Route
              path="settings"
              element={
                <ModulePlaceholder
                  title="Settings"
                  body="Roles, permissions matrix, and workspace prefs land with RBAC hardening."
                />
              }
            />
          </Route>

          <Route
            path="/portal"
            element={
              <RequireAuth>
                <PortalLayout />
              </RequireAuth>
            }
          >
            <Route index element={<PortalDashboard />} />
            <Route path="cases" element={<PortalCasesPage />} />
            <Route path="documents" element={<PortalDocumentsPage />} />
            <Route path="invoices" element={<PortalInvoicesPage />} />
            <Route path="support" element={<PortalSupportPage />} />
          </Route>

          <Route path="/signup" element={<Navigate to="/register" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
