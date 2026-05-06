import { Center, Spinner } from '@chakra-ui/react';
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { ProtectedRoute, PublicOnlyRoute } from '@/features/auth/ProtectedRoute';

const LandingPage = lazy(() => import('@/features/landing/LandingPage'));
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'));
const CustomersPage = lazy(() => import('@/features/customers/CustomersPage'));
const CustomerDetailPage = lazy(() => import('@/features/customers/CustomerDetailPage'));
const LoansPage = lazy(() => import('@/features/loans/LoansPage'));
const PaymentsPage = lazy(() => import('@/features/payments/PaymentsPage'));
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage'));
const LoginPage = lazy(() => import('@/features/auth/LoginPage'));
const SignUpPage = lazy(() => import('@/features/auth/SignUpPage'));
const ForgotPasswordPage = lazy(() => import('@/features/auth/ForgotPasswordPage'));

function Fallback() {
  return (
    <Center minH="60dvh">
      <Spinner size="lg" thickness="3px" color="brand.500" />
    </Center>
  );
}

export function AppRouter() {
  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicOnlyRoute>
              <SignUpPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicOnlyRoute>
              <ForgotPasswordPage />
            </PublicOnlyRoute>
          }
        />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="customers/:id" element={<CustomerDetailPage />} />
          <Route path="loans" element={<LoansPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
