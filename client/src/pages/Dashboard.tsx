import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { store, Order } from '@/lib/store';
import { useEffect, useState } from 'react';
import { TrendingUp, AlertCircle, Users, DollarSign } from 'lucide-react';
import { useOrderNotifications } from '@/hooks/useOrderNotifications';

interface DashboardStats {
  ordersToday: number;
  revenueUSD: number;
  revenueLBP: number;
  pendingOrders: number;
  totalCustomers: number;
  weeklyRevenueUSD: number;
  weeklyOrders: number;
}

export default function Dashboard() {
  useOrderNotifications(); // Enable real-time notifications
  const [stats, setStats] = useState<DashboardStats>({
    ordersToday: 0,
    revenueUSD: 0,
    revenueLBP: 0,
    pendingOrders: 0,
    totalCustomers: 0,
    weeklyRevenueUSD: 0,
    weeklyOrders: 0,
  });

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    const orders = store.getOrders();
    const customers = store.getCustomers();
    const settings = store.getSettings();

    // Calculate stats from TODAY only (using timestamps)
    const now = Date.now();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startOfDayTime = startOfDay.getTime();

    const todayOrders = orders.filter((o) => o.createdAt >= startOfDayTime);
    const totalRevenueUSD = todayOrders.reduce((sum, o) => sum + o.totalUSD, 0);
    const totalRevenueLBP = todayOrders.reduce((sum, o) => sum + o.totalLBP, 0);
    const pending = todayOrders.filter((o) => o.status === 'new' || o.status === 'confirmed').length;

    setStats({
      ordersToday: todayOrders.length,
      revenueUSD: totalRevenueUSD,
      revenueLBP: totalRevenueLBP,
      pendingOrders: pending,
      totalCustomers: customers.length,
      weeklyRevenueUSD: totalRevenueUSD * 7, // Placeholder - real data would come from historical data
      weeklyOrders: todayOrders.length * 7,
    });

    setRecentOrders(todayOrders.slice(0, 5));
  }, []);

  const formatCurrency = (usd: number, lbp: number) => {
    const rate = store.getSettings().exchangeRate;
    return `$${usd.toFixed(2)} · ${lbp.toLocaleString()} LBP`;
  };

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Orders Today */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <span className="text-lg">🧾</span>
              Orders Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.ordersToday}</div>
            <p className="text-xs text-gray-500 mt-1">All orders placed today</p>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 font-mono">${stats.revenueUSD.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">{stats.revenueLBP.toLocaleString()} LBP</p>
          </CardContent>
        </Card>

        {/* Pending Orders */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{stats.pendingOrders}</div>
            <p className="text-xs text-gray-500 mt-1">New & Confirmed</p>
          </CardContent>
        </Card>

        {/* Customers */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.totalCustomers}</div>
            <p className="text-xs text-gray-500 mt-1">In database</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Summary */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            This Week (Estimated)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-emerald-600 font-mono">${stats.weeklyRevenueUSD.toFixed(2)}</div>
              <p className="text-xs text-gray-600 mt-1">Weekly Revenue</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">{stats.weeklyOrders}</div>
              <p className="text-xs text-gray-600 mt-1">Weekly Orders</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600 font-mono">
                ${stats.weeklyOrders > 0 ? (stats.weeklyRevenueUSD / stats.weeklyOrders).toFixed(2) : '0.00'}
              </div>
              <p className="text-xs text-gray-600 mt-1">Avg per Order</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4 text-center italic">
            ⚠️ Estimated based on today's data. For accurate analytics, integrate real historical data.
          </p>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No orders yet today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div>
                    <div className="font-semibold text-gray-900">{order.customerName}</div>
                    <div className="text-xs text-gray-600">
                      {order.id} · {new Date(order.createdAt).toLocaleTimeString('en-LB', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-semibold text-emerald-600">${order.totalUSD.toFixed(2)}</div>
                    <div className={`text-xs font-semibold ${
                      order.status === 'new' ? 'text-amber-600' :
                      order.status === 'confirmed' ? 'text-blue-600' :
                      order.status === 'ready' ? 'text-emerald-600' :
                      'text-gray-600'
                    }`}>
                      {order.status.toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
