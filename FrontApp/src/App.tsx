import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ResponsiveAppBar from "./components/header/ResponsiveAppBar";
import AuthBox from "./pages/authBox/AuthBox.tsx";
import Home from "./pages/Home.tsx";
import ProfilePage from "./pages/myprofile/ProfilePage.tsx";
import "./App.css";
import SinglePostPage from "./pages/singlePost/singlePost.tsx";

function App() {
  return (
    <Router>
      <ResponsiveAppBar />
      <div className="page-container">
        <Routes>
          <Route
            path="/"
            element={
              <div className="auth-container">
                <AuthBox />
              </div>
            }
          />
          <Route path="/feed" element={<Home />} />
          <Route path="/myprofile" element={<ProfilePage />} />
          <Route path="/post/:id" element={<SinglePostPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
