import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import "./App.css";
import Home from "./app/home/Home";
import User from "./app/user/User";
import UserEdit from "./app/UserEdit/UserEdit";

function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/user" element={<User />} />
          <Route path="/useredit" element={<UserEdit />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
