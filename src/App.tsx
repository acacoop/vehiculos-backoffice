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

// NO MIGRADAS - Comentadas temporalmente
// import UserEdit from "./app/UserEdit/UserEdit";
// import EditAssignment from "./app/EditAssignment/EditAssignment";
// import VehicleEditRegistration from "./app/VehicleEditRegistration/VehicleEditRegistration";
// import Vehicles from "./app/Vehicles/Vehicles";
// import Metrics from "./app/Metrics/Metrics";
// import Assignaments from "./app/Assignment/Assignment";
// import ReservationEdit from "./app/ReservationEdit/ReservationEdit";
// import MaintenancePage from "./app/Maintenances/Maintenances";
// import EditMaintenance from "./app/EditMaintenance/EditMaintenance";
// import MaintenanceAssignment from "./app/MaintenanceAssignment/MaintenanceAssignment";
// import MaintenanceRecordRegisterEdit from "./app/MaintenanceRecordRegisterEdit/MaintenanceRecordRegisterEdit";
// import VehicleResponsibles from "./app/VehicleResponsibles/VehicleResponsibles";
// import EditVehicleResponsibles from "./app/EditVehicleResponsibles/EditVehicleResponsibles";
// import KilometersEdit from "./app/KilometersEdit/KilometersEdit";
// import Models from "./app/Models/Models";
// import ModelsEdit from "./app/ModelsEdit/ModelsEdit";

// MIGRADAS - Auth, Home & Users
import { LoginPage } from "./pages/auth";
import { HomePage } from "./pages/home";

// MIGRADAS
import MaintenanceCategoriesPage from "./pages/maintenance/categories/CategoriesPage";
import MaintenanceCategoryPage from "./pages/maintenance/categories/CategoryPage";
import MaintenanceItemPage from "./pages/maintenance/items/MaintenancePage";
import MaintenanceItemsPage from "./pages/maintenance/items/MaintenancesPage";
import BrandsPage from "./pages/vehicles/brands/BrandsPage";
import BrandPage from "./pages/vehicles/brands/BrandPage";
import ModelsPage from "./pages/vehicles/models/ModelsPage";
import ModelPage from "./pages/vehicles/models/ModelPage";
import AssignmentsPage from "./pages/maintenance/assignments/AssignmentsPage";
import AssignmentPage from "./pages/maintenance/assignments/AssignmentPage";

import { useMsal } from "@azure/msal-react";
import { getActiveAccount } from "./common/auth";
import { UserPage, UsersPage } from "./pages/users";
import VehiclesPage from "./pages/vehicles/items/VehiclesPage";
import VehiclePage from "./pages/vehicles/items/VehiclePage";

function ProtectedRoute() {
  const { inProgress } = useMsal();
  const isAuthenticated = !!getActiveAccount();
  if (inProgress !== "none") {
    return null; // optionally a spinner
  }
  if (!isAuthenticated) {
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
          <Route path="/users" element={<UsersPage />} />
          <Route path="/users/:id" element={<UserPage />} />
          {/* <Route path="/user/edit/:id" element={<UserEdit />} /> */}

          {/* NO MIGRADAS - Comentadas temporalmente */}
          {/* <Route path="/assignment/create" element={<EditAssignment />} /> */}
          {/* <Route path="/assignment/create/:vehicleId" element={<EditAssignment />} /> */}
          {/* <Route path="/assignment/edit/:assignmentId" element={<EditAssignment />} /> */}
          {/* <Route path="/reservation/create" element={<ReservationEdit />} /> */}
          {/* <Route path="/reservation/edit/:id" element={<ReservationEdit />} /> */}
          {/* <Route path="/metrics" element={<Metrics />} /> */}
          {/* <Route path="/assignments" element={<Assignaments />} /> */}
          {/* <Route path="/maintenances" element={<MaintenancePage />} /> */}

          {/* MIGRADAS - Maintenance Categories */}
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

          {/* MIGRADAS - Maintenance Items */}
          <Route path="/maintenance/items" element={<MaintenanceItemsPage />} />
          <Route
            path="/maintenance/items/new"
            element={<MaintenanceItemPage />}
          />
          <Route
            path="/maintenance/items/:id"
            element={<MaintenanceItemPage />}
          />

          {/* MIGRADAS - Maintenance Assignments */}
          <Route
            path="/maintenance/assignments"
            element={<AssignmentsPage />}
          />
          <Route
            path="/maintenance/assignments/new"
            element={<AssignmentPage />}
          />
          <Route
            path="/maintenance/assignments/:id"
            element={<AssignmentPage />}
          />

          {/* NO MIGRADAS - Maintenance (old routes) */}
          {/* <Route path="/maintenance/create" element={<EditMaintenance />} /> */}
          {/* <Route path="/maintenance/edit/:maintenanceId" element={<EditMaintenance />} /> */}
          {/* <Route path="/maintenance-assignment/:maintenanceId" element={<MaintenanceAssignment />} /> */}
          {/* <Route path="/vehicle-maintenance-assignment/:vehicleId" element={<MaintenanceAssignment />} /> */}
          {/* <Route path="/edit-maintenance-assignment/:vehicleId/:maintenanceId/:assignmentId" element={<MaintenanceAssignment />} /> */}
          {/* <Route path="/maintenance-record-register-edit/:vehicleId/:maintenanceId/:assignedMaintenanceId" element={<MaintenanceRecordRegisterEdit />} /> */}
          {/* <Route path="/maintenance-record-register-edit/:vehicleId" element={<MaintenanceRecordRegisterEdit />} /> */}
          {/* <Route path="/maintenance/possible/edit/:maintenanceId" element={<EditMaintenance />} /> */}
          {/* <Route path="/kilometers/create/:vehicleId" element={<KilometersEdit />} /> */}
          {/* <Route path="/vehicle-responsibles" element={<VehicleResponsibles />} /> */}
          {/* <Route path="/edit-vehicle-responsibles" element={<EditVehicleResponsibles />} /> */}
          {/* <Route path="/edit-vehicle-responsibles/:id" element={<EditVehicleResponsibles />} /> */}
          {/* <Route path="/models" element={<Models />} /> */}

          <Route path="/vehicles" element={<VehiclesPage />} />
          <Route path="/vehicles/new" element={<VehiclePage />} />
          <Route path="/vehicles/:id" element={<VehiclePage />} />

          {/* MIGRADAS - Vehicle Brands */}
          <Route path="/vehicles/brands" element={<BrandsPage />} />
          <Route path="/vehicles/brands/new" element={<BrandPage />} />
          <Route path="/vehicles/brands/:id" element={<BrandPage />} />

          {/* MIGRADAS - Vehicle Models */}
          <Route path="/vehicles/models" element={<ModelsPage />} />
          <Route path="/vehicles/models/new" element={<ModelPage />} />
          <Route path="/vehicles/models/:id" element={<ModelPage />} />

          <Route path="*" element={<Navigate to="/home" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
