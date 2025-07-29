import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import "./App.css";
import Home from "./app/home/Home";
import User from "./app/user/User";
import UserEdit from "./app/UserEdit/UserEdit";
import UserEditAssignment from "./app/UserEditAssignment/UserEditAssignment";
import VehicleEditRegistration from "./app/VehicleEditRegistration/VehicleEditRegistration";
import Vehicles from "./app/vehicles/Vehicles";
import Metrics from "./app/metrics/Metrics";
import Assignaments from "./app/assignment/Assignment";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/user" element={<User />} />
        <Route path="/user/edit/:id" element={<UserEdit />} />
        <Route path="/userassignment/create" element={<UserEditAssignment />} />
        <Route
          path="/userassignment/create/:vehicleId"
          element={<UserEditAssignment />}
        />
        <Route
          path="/userassignment/:assignmentId"
          element={<UserEditAssignment />}
        />
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
