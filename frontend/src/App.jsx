import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PostDetails from './pages/PostDetails';
import CreateEditPost from './pages/CreateEditPost';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/post/:id" element={<PostDetails />} />
          <Route path="/create" element={<CreateEditPost />} />
          <Route path="/edit/:id" element={<CreateEditPost />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
