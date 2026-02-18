import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import ProductionStudio from "@/pages/ProductionStudio";
import NotFound from "@/pages/NotFound";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/studio" element={<ProductionStudio />} />
        <Route path="/studio/:projectId" element={<ProductionStudio />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;
