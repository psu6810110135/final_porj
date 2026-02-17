import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ToursPage from "./pages/ToursPage"; // อย่าลืมสร้างไฟล์นี้ในโฟลเดอร์ pages นะครับ

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tours" element={<ToursPage />} />
      </Routes>
    </Router>
  );
}

export default App; // ต้องมีบรรทัดนี้เพื่อแก้ Error ในรูปสุดท้ายครับ!