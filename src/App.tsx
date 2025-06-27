import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import "./App.css";
import Home from "./app/home/Home";
import User from "./app/user/User";
import UserEdit from "./app/UserEdit/UserEdit";
import Vehicles from "./app/vehicles/Vehicles";
import Metrics from "./app/metrics/Metrics";

function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/user" element={<User />} />
          <Route path="/useredit" element={<UserEdit />} />
          <Route path="/metrics" element={<Metrics />} />
          <Route path="/vehicles" element={<Vehicles />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
