import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import "./App.css";
import Home from "./app/home/Home";
import Users from "./app/Users/Users";
import UserEdit from "./app/UserEdit/UserEdit";
import EditAssignment from "./app/EditAssignment/EditAssignment";
import VehicleEditRegistration from "./app/VehicleEditRegistration/VehicleEditRegistration";
import Vehicles from "./app/vehicles/Vehicles";
import Metrics from "./app/metrics/Metrics";
import Assignaments from "./app/assignment/Assignment";
import ReservationEdit from "./app/ReservationEdit/ReservationEdit";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/users" element={<Users />} />
        <Route path="/user/edit/:id" element={<UserEdit />} />
        <Route path="/assignment/create" element={<EditAssignment />} />
        <Route
          path="/assignment/create/:vehicleId"
          element={<EditAssignment />}
        />
        <Route
          path="/assignment/edit/:assignmentId"
          element={<EditAssignment />}
        />
        <Route path="/reservation/create" element={<ReservationEdit />} />
        <Route path="/reservation/edit/:id" element={<ReservationEdit />} />
        <Route path="/metrics" element={<Metrics />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/vehicle/edit/:id" element={<VehicleEditRegistration />} />
        <Route path="/vehicle/create" element={<VehicleEditRegistration />} />
        <Route path="/assignments" element={<Assignaments />} />
      </Routes>
    </Router>
  );
}

export default App;
