import { Navigate, Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import SummaryPage from "./pages/SummaryPage";

const App = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/summary" element={<SummaryPage />} />
    <Route path="/login" element={<Navigate to="/dashboard" replace />} />
    <Route path="/signup" element={<Navigate to="/dashboard" replace />} />

    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default App;
