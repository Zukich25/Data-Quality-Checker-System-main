import "@/styles/global.css";

import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import HomePage from "@/pages/guest/home";
import IssuesPage from "@/pages/issues/issues";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/issues" element={<IssuesPage />} />
    </Routes>
  </BrowserRouter>,
);
