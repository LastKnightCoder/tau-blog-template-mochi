import { createRoot } from "react-dom/client";
import { Showcase } from "./Showcase";
import "@mochi/styles/global.css";

createRoot(document.getElementById("root")!).render(<Showcase />);
