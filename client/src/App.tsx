import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Menu from "./pages/Menu";
import POS from "./pages/POS";
import KDS from "./pages/KDS";
import DeliveryTracking from "./pages/DeliveryTracking";
import Notifications from "./pages/Notifications";
import Analytics from "./pages/Analytics";
import Loyalty from "./pages/Loyalty";
import Inventory from "./pages/Inventory";
import Staff from "./pages/Staff";
import Recipes from "./pages/Recipes";
import Production from "./pages/Production";
import Suppliers from "./pages/Suppliers";
import Waste from "./pages/Waste";
import Reports from "./pages/Reports";
import Customers from "./pages/Customers";
import Settings from "./pages/Settings";
import CustomerOrder from "./pages/CustomerOrder";
import DashboardLayout from "./components/DashboardLayout";
import { useState } from "react";
import ErrorBoundary from "./components/ErrorBoundary";

function AppContent() {
  const { isAuthenticated, role } = useAuth();
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [showCustomerView, setShowCustomerView] = useState(false);

  // Customer view (no auth required)
  if (showCustomerView) {
    return (
      <div>
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setShowCustomerView(false)}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
        <CustomerOrder />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <DashboardLayout currentPage={currentPage} onNavigate={setCurrentPage}>
      {/* Add Customer View Button */}
      <div className="fixed top-4 right-4 z-40">
        <button
          onClick={() => setShowCustomerView(true)}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
        >
          👥 View Customer Site
        </button>
      </div>

      {currentPage === "dashboard" && <Dashboard />}
      {currentPage === "orders" && <Orders />}
      {currentPage === "menu" && role !== "staff" && <Menu />}
      {currentPage === "pos" && <POS />}
      {currentPage === "kds" && <KDS />}
      {currentPage === "delivery" && <DeliveryTracking />}
      {currentPage === "notifications" && role !== "staff" && <Notifications />}
      {currentPage === "analytics" && role !== "staff" && <Analytics />}
      {currentPage === "loyalty" && role !== "staff" && <Loyalty />}
      {currentPage === "inventory" && role !== "staff" && <Inventory />}
      {currentPage === "staff" && role !== "staff" && <Staff />}
      {currentPage === "recipes" && role !== "staff" && <Recipes />}
      {currentPage === "production" && role !== "staff" && <Production />}
      {currentPage === "suppliers" && role !== "staff" && <Suppliers />}
      {currentPage === "waste" && role !== "staff" && <Waste />}
      {currentPage === "reports" && role !== "staff" && <Reports />}
      {currentPage === "customers" && role !== "staff" && <Customers />}
      {currentPage === "settings" && role === "owner" && <Settings />}
    </DashboardLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <AppContent />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
