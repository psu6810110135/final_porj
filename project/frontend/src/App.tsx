import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/loginpage'; // path ตามที่คุณวางไฟล์ไว้
import RegisterPage from './pages/RegisterPage'; 
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* หน้าแรก */}
        <Route path="/" element={<HomePage />} />
        
        {/* หน้า Login */}
        <Route path="/login" element={<LoginPage />} />
        {/* หน้า Register */}
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;