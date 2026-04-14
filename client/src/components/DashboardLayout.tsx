import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  roles: ('owner' | 'manager' | 'staff')[];
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', roles: ['owner', 'manager', 'staff'] },
  { id: 'orders', label: 'Orders', icon: '🧾', roles: ['owner', 'manager', 'staff'] },
  { id: 'menu', label: 'Menu', icon: '📋', roles: ['owner', 'manager'] },
  { id: 'pos', label: 'POS', icon: '🛒', roles: ['owner', 'manager', 'staff'] },
  { id: 'kds', label: 'Kitchen Display', icon: '🍳', roles: ['owner', 'manager', 'staff'] },
  { id: 'delivery', label: 'Delivery Tracking', icon: '🚗', roles: ['owner', 'manager', 'staff'] },
  { id: 'recipes', label: 'Recipes', icon: '👨‍🍳', roles: ['owner', 'manager'] },
  { id: 'production', label: 'Production', icon: '🏭', roles: ['owner', 'manager'] },
  { id: 'suppliers', label: 'Suppliers', icon: '🚚', roles: ['owner', 'manager'] },
  { id: 'waste', label: 'Waste Tracking', icon: '🗑️', roles: ['owner', 'manager'] },
  { id: 'reports', label: 'Reports', icon: '📋', roles: ['owner', 'manager'] },
  { id: 'notifications', label: 'Notifications', icon: '🔔', roles: ['owner', 'manager'] },
  { id: 'analytics', label: 'Analytics', icon: '📊', roles: ['owner', 'manager'] },
  { id: 'loyalty', label: 'Loyalty Program', icon: '🎁', roles: ['owner', 'manager'] },
  { id: 'inventory', label: 'Inventory', icon: '📦', roles: ['owner', 'manager'] },
  { id: 'staff', label: 'Staff', icon: '👥', roles: ['owner', 'manager'] },
  { id: 'customers', label: 'Customers', icon: '👥', roles: ['owner', 'manager'] },
  { id: 'settings', label: 'Settings', icon: '⚙️', roles: ['owner'] },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function DashboardLayout({ children, currentPage, onNavigate }: DashboardLayoutProps) {
  const { role, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const visibleNavItems = NAV_ITEMS.filter((item) => item.roles.includes(role!));

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      logout();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col shadow-sm`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center w-full'}`}>
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
              🍽️
            </div>
            {sidebarOpen && <span className="font-bold text-gray-900 text-sm">DirectOrder</span>}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {visibleNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                currentPage === item.id
                  ? 'bg-emerald-100 text-emerald-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              title={!sidebarOpen ? item.label : undefined}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <div
            className={`text-xs text-gray-600 px-2 py-1 ${!sidebarOpen && 'text-center'}`}
          >
            {sidebarOpen && (
              <>
                <div className="font-semibold text-gray-900">{role?.toUpperCase()}</div>
                <div className="text-gray-500">Role</div>
              </>
            )}
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className={`w-full ${!sidebarOpen && 'p-2'}`}
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && <span className="ml-2">Logout</span>}
          </Button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            {NAV_ITEMS.find((item) => item.id === currentPage)?.label || 'Dashboard'}
          </h1>
          <div className="text-sm text-gray-600">
            {new Date().toLocaleDateString('en-LB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Content */}
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
