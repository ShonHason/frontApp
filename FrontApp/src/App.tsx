import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ResponsiveAppBar from "./components/header/ResponsiveAppBar";
import AuthBox from "./components/authBox/AuthBox";
import Home from "./components/home/Home";
import ProfilePage from "./components/ProfilePage/ProfilePage";
import "./App.css";
import SinglePostPage from "./components/singlePost/singlePost";
import MyPosts from "./components/MyPosts/MyPosts.tsx";

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
          <Route path="/my-posts" element={<MyPosts />} />
          <Route path="/post/:id" element={<SinglePostPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
