import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ResponsiveAppBar from './components/header/ResponsiveAppBar';
import AuthBox from './components/authBox/AuthBox';
import Home from './components/home/Home';
import './App.css';
import { Container } from '@mui/material';
import SinglePostPage from './components/singlePost/singlePost';



function App() {
  return (
    <Router>
      <ResponsiveAppBar />
      <Container>
        <Routes>
          <Route path="/" element={<AuthBox />} />
          <Route path="/feed" element={<Home />} />
          <Route path="/post/:id" element={<SinglePostPage />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
