import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import './index.css'

import App from "./App.js";
import { BrowserRouter } from "react-router-dom";

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <BrowserRouter>
      <StrictMode>
        <App />
      </StrictMode>
    </BrowserRouter>,
  );
}
