import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ResponsiveAppBar from "./components/header/ResponsiveAppBar.tsx";
import AuthBox from "./pages/authBox/AuthBox.tsx";
import Home from "./pages/Home.tsx";
import ProfilePage from "./pages/myprofile/ProfilePage.tsx";
import SinglePostPage from "./pages/singlePost/singlePost.tsx";
import "./App.css";

// Optional: Create a NotFound component
const NotFound = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column'
    }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for might have been removed or is temporarily unavailable.</p>
      <button onClick={() => window.location.href = '/'}>
        Go to Home
      </button>
    </div>
  );
};

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

          {/* Add a catch-all route */}
          <Route path="" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;