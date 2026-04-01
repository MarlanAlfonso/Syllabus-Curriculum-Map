import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import AppShell from "./components/layout/AppShell";
import App from "./App";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="*" element={<App />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  </StrictMode>
);