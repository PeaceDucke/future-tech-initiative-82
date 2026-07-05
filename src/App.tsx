import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ThankYouPage from "./pages/ThankYouPage";
import UserAgreementPage from "./pages/UserAgreementPage";
import PrivacyPage from "./pages/PrivacyPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
        <Route path="/user-agreement" element={<UserAgreementPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;