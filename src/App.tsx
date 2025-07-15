import { UserProvider } from "./contexts/UserContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import "./App.css";
import Home from "./app/home/Home";
import User from "./app/user/User";
import UserEdit from "./app/UserEdit/UserEdit";
import VehicleEdit from "./app/VehiclesEdit/VehicleEdit";
import Vehicles from "./app/vehicles/Vehicles";
import Metrics from "./app/metrics/Metrics";
import Assignaments from "./app/assignment/Assignment";

function App() {
  return (
    <UserProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/user" element={<User />} />
          <Route path="/useredit" element={<UserEdit />} />
          <Route path="/metrics" element={<Metrics />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/vehicleedit" element={<VehicleEdit />} />
          <Route path="/assignments" element={<Assignaments />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
