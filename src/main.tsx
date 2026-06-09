import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n/i18n";
const savedLang = localStorage.getItem("lang") || "en";
document.documentElement.dir = savedLang === "ar" ? "rtl" : "ltr";
createRoot(document.getElementById("root")!).render(<App />);
