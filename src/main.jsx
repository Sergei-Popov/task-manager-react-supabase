import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import LandingPage from "./pages/LandingPage/LandingPage.jsx";
import RegistrationPage from "./pages/RegistrationPage/RegistrationPage.jsx";
import LoginPage from "./pages/LoginPage/LoginPage.jsx";
import Wrapper from "./pages/Wrapper.jsx";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider delayDuration={300}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/registration" element={<RegistrationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <Wrapper>
                <App />
              </Wrapper>
            }
          />
        </Routes>
        <Toaster position="top-right" richColors closeButton />
      </TooltipProvider>
    </ThemeProvider>
  </BrowserRouter>,
);
