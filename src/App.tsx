import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';
import ServicesList from './pages/services/ServicesList';
import ServiceForm from './components/forms/ServiceForm';
import LoginPage from './pages/auth/LoginPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirigir la raíz a /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Ruta de login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/admin"
            element={
              <AdminLayout>
                <h1>Dashboard Content</h1>
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
            path="/admin/services/create"
            element={
              <AdminLayout>
                <ServiceForm />
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
        </Route>
      </Routes>
    </Router>
  );
}

export default App;