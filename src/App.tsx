import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import "./App.css";

import { LoginPage } from "./pages/auth";
import { HomePage } from "./pages/home";
import MetricsPage from "./pages/metrics/MetricsPage";

import MaintenanceCategoriesPage from "./pages/maintenance/categories/CategoriesPage";
import MaintenanceCategoryPage from "./pages/maintenance/categories/CategoryPage";
import MaintenanceItemPage from "./pages/maintenance/items/MaintenancePage";
import MaintenanceItemsPage from "./pages/maintenance/items/MaintenancesPage";
import BrandsPage from "./pages/vehicles/brands/BrandsPage";
import BrandPage from "./pages/vehicles/brands/BrandPage";
import ModelsPage from "./pages/vehicles/models/ModelsPage";
import ModelPage from "./pages/vehicles/models/ModelPage";
import AssignedMaintenancesPage from "./pages/maintenance/assignments/AssignedMaintenancePage";
import AssignmentPage from "./pages/maintenance/assignments/AssignedMaintenancesPage";
import VehiclesAssignmentsPage from "./pages/vehicles/assignments/AssignmentsPage";
import MaintenanceRecordsPage from "./pages/maintenance/records/MaintenanceRecordsPage";
import MaintenanceRecordPage from "./pages/maintenance/records/MaintenanceRecordPage";

import { useMsal } from "@azure/msal-react";
import { ensureActiveAccount } from "./common/auth";
import { useEffect, useState } from "react";
import VehiclesPage from "./pages/vehicles/items/VehiclesPage";
import VehiclePage from "./pages/vehicles/items/VehiclePage";
import ResponsiblesPage from "./pages/vehicles/responsibles/ResponsiblesPage";
import ResponsiblePage from "./pages/vehicles/responsibles/ResponsiblePage";
import ReservationPage from "./pages/reservations/ReservationPage";
import ReservationsPage from "./pages/reservations/ReservationsPage";
import UserPage from "./pages/users/UserPage";
import UsersPage from "./pages/users/UsersPage";
import VehicleAssignmentPage from "./pages/vehicles/assignments/AssignmentPage";
import KilometersLogsPage from "./pages/vehicles/kilometersLogs/KilometersLogsPage";
import KilometersLogPage from "./pages/vehicles/kilometersLogs/KilometersLogPage";

function ProtectedRoute() {
  const { inProgress } = useMsal();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (inProgress !== "none") {
        return; // Esperar a que termine el proceso de MSAL
      }

      const account = await ensureActiveAccount();
      setIsAuth(!!account);
      setIsChecking(false);
    };

    void checkAuth();
  }, [inProgress]);

  // Mostrar spinner mientras se verifica la autenticación
  if (inProgress !== "none" || isChecking) {
    return null; // o un spinner
  }

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Navbar />
      <main className="app-content">
        <div className="app-content-inner">
          <Outlet />
        </div>
        <Footer />
      </main>
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/metrics" element={<MetricsPage />} />

          <Route path="/users" element={<UsersPage />} />
          <Route path="/users/:id" element={<UserPage />} />

          <Route
            path="/vehicles/assignments"
            element={<VehiclesAssignmentsPage />}
          />
          <Route
            path="/vehicles/assignments/new"
            element={<VehicleAssignmentPage />}
          />
          <Route
            path="/vehicles/assignments/:assignmentId"
            element={<VehicleAssignmentPage />}
          />

          <Route
            path="/maintenance/categories"
            element={<MaintenanceCategoriesPage />}
          />
          <Route
            path="/maintenance/categories/new"
            element={<MaintenanceCategoryPage />}
          />
          <Route
            path="/maintenance/categories/:id"
            element={<MaintenanceCategoryPage />}
          />

          <Route path="/maintenance/items" element={<MaintenanceItemsPage />} />
          <Route
            path="/maintenance/items/new"
            element={<MaintenanceItemPage />}
          />
          <Route
            path="/maintenance/items/:id"
            element={<MaintenanceItemPage />}
          />

          <Route
            path="/maintenance/assignments"
            element={<AssignedMaintenancesPage />}
          />
          <Route
            path="/maintenance/assignments/new"
            element={<AssignmentPage />}
          />
          <Route
            path="/maintenance/assignments/:id"
            element={<AssignmentPage />}
          />

          <Route
            path="/maintenance/records"
            element={<MaintenanceRecordsPage />}
          />
          <Route
            path="/maintenance/records/new"
            element={<MaintenanceRecordPage />}
          />
          <Route
            path="/maintenance/records/:id"
            element={<MaintenanceRecordPage />}
          />

          <Route path="/vehicles" element={<VehiclesPage />} />
          <Route path="/vehicles/new" element={<VehiclePage />} />
          <Route path="/vehicles/:id" element={<VehiclePage />} />

          <Route path="/vehicles/brands" element={<BrandsPage />} />
          <Route path="/vehicles/brands/new" element={<BrandPage />} />
          <Route path="/vehicles/brands/:id" element={<BrandPage />} />

          <Route path="/vehicles/models" element={<ModelsPage />} />
          <Route path="/vehicles/models/new" element={<ModelPage />} />
          <Route path="/vehicles/models/:id" element={<ModelPage />} />

          <Route path="/vehicles/responsibles" element={<ResponsiblesPage />} />
          <Route
            path="/vehicles/responsibles/new"
            element={<ResponsiblePage />}
          />
          <Route
            path="/vehicles/responsibles/:id"
            element={<ResponsiblePage />}
          />

          <Route
            path="/vehicles/kilometersLogs"
            element={<KilometersLogsPage />}
          />
          <Route
            path="/vehicles/kilometersLogs/new"
            element={<KilometersLogPage />}
          />
          <Route
            path="/vehicles/kilometersLogs/:id"
            element={<KilometersLogPage />}
          />

          <Route path="/reservations" element={<ReservationsPage />} />
          <Route path="/reservations/new" element={<ReservationPage />} />
          <Route path="/reservations/:id" element={<ReservationPage />} />

          <Route path="*" element={<Navigate to="/home" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
