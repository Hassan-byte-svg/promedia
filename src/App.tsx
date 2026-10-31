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
  AdminFinancePage,
  AdminHrPage,
  AdminInvoicesPage,
  AdminLayout,
  AdminLeadsPage,
  AdminServicesPage,
  AdminTaxPage,
  ModulePlaceholder,
} from '@/pages/admin/AdminRoutes'
import { FinanceDashboard } from '@/pages/admin/FinanceDashboard'
import {
  BanksPage,
  JournalsPage,
  PaymentsPage,
  PettyCashPage,
} from '@/pages/admin/FinanceModules'
import {
  BudgetsPage,
  ExpensesPage,
  FixedAssetsPage,
  ReportsPage,
} from '@/pages/admin/FinanceStubs'
import {
  AttendancePage,
  DocumentsPage,
  NotificationsPage,
  PayrollPage,
  TasksPage,
  TaxCompliancePage,
} from '@/pages/admin/OpsModules'
import {
  PortalCasesPage,
  PortalDashboard,
  PortalDocumentsPage,
  PortalInvoicesPage,
  PortalLayout,
  PortalSupportPage,
} from '@/pages/portal/PortalRoutes'
import { Seo } from '@/components/Seo'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Seo />
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
            <Route index element={<FinanceDashboard />} />
            <Route path="leads" element={<AdminLeadsPage />} />
            <Route path="cases" element={<AdminCasesPage />} />
            <Route path="services" element={<AdminServicesPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="finance" element={<AdminFinancePage />} />
            <Route path="journals" element={<JournalsPage />} />
            <Route path="banks" element={<BanksPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="invoices" element={<AdminInvoicesPage />} />
            <Route path="petty-cash" element={<PettyCashPage />} />
            <Route path="expenses" element={<ExpensesPage />} />
            <Route path="assets" element={<FixedAssetsPage />} />
            <Route path="budgets" element={<BudgetsPage />} />
            <Route path="tax" element={<AdminTaxPage />} />
            <Route path="tax-compliance" element={<TaxCompliancePage />} />
            <Route path="hr" element={<AdminHrPage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="payroll" element={<PayrollPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route
              path="settings"
              element={
                <ModulePlaceholder
                  title="Settings"
                  body="Role matrix UI forthcoming. RLS + RequireAuth already enforce client vs staff."
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
