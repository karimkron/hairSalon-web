import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AdminLayout from "./components/layout/AdminLayout";
import ServicesList from "./pages/services/ServicesList";
import ServiceForm from "./components/forms/ServiceForm";
import LoginPage from "./pages/auth/LoginPage";
import AdminRegisterPage from "./pages/auth/AdminRegisterPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRegistrationForm from "./components/auth/AdminRegistrationForm";
import ForgotPasswordPage from "./components/auth/ForgotPasswordPage";
import ResetPasswordPage from "./components/auth/ResetPasswordPage";
import PasswordUpdatedPage from "./components/auth/PasswordUpdatedPage";
import ProductsList from "./pages/products/ProductsList";
import ProductForm from "./components/forms/ProductForm";
import UsersList from "./pages/users/UsersList";
import UserForm from "./components/forms/UserForm";
import AdminSettings from "./pages/settings/AdminSettings";
import AppointmentsCalendarPage from "./components/appointments/AppointmentsCalendar";
import { AuthProvider } from "./context/AuthProvider";
import SalesPage from "./components/SalesPage/SalesPage";
import DashboardOverview from "./pages/dashboard/DashboardOverview";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Redirigir la raíz a /login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Ruta de login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Ruta de registro de administradores */}
          <Route path="/admin/register" element={<AdminRegisterPage />} />

          {/* Ruta de formulario de registro de administradores */}
          <Route
            path="/admin/register-form"
            element={<AdminRegistrationForm />}
          />

          {/* Rutas de autenticación */}
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* ruta recuperar contraseña */}
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Ruta de contraseña actualizada */}
          <Route path="/password-updated" element={<PasswordUpdatedPage />} />

          {/* Rutas protegidas */}
          <Route element={<ProtectedRoute />}>
            {/* Ruta para el nuevo dashboard como página principal */}
            <Route
              path="/admin"
              element={
                <AdminLayout>
                  <DashboardOverview />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/services"
              element={
                <AdminLayout>
                  <ServicesList />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <AdminLayout>
                  <AdminSettings />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/services/create"
              element={
                <AdminLayout>
                  <ServiceForm />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/sales"
              element={
                <AdminLayout>
                  <SalesPage />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/services/edit/:id"
              element={
                <AdminLayout>
                  <ServiceForm />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/products"
              element={
                <AdminLayout>
                  <ProductsList />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/appointments"
              element={
                <AdminLayout>
                  <AppointmentsCalendarPage />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/products/create"
              element={
                <AdminLayout>
                  <ProductForm />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/products/edit/:id"
              element={
                <AdminLayout>
                  <ProductForm />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminLayout>
                  <UsersList />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/users/edit/:id"
              element={
                <AdminLayout>
                  <UserForm />
                </AdminLayout>
              }
            />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;