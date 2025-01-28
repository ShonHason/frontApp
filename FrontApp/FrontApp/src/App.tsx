import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ResponsiveAppBar from "./components/header/ResponsiveAppBar";
import AuthBox from "./components/authBox/AuthBox";
import Home from "./components/home/Home";
import "./App.css";

function App() {
  return (
    <Router>
      {" "}
      {/* Wrap everything with Router */}
      <ResponsiveAppBar />
      <Routes>
        <Route path="" element={<AuthBox />} /> {/* Default route */}
        <Route path="/home" element={<Home />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
