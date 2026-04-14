import { useState, useEffect } from 'react';
import { store, Order, MenuItem } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Users, DollarSign, ShoppingCart } from 'lucide-react';

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topItems: Array<{ name: string; count: number; revenue: number }>;
  dailyRevenue: Array<{ date: string; revenue: number; orders: number }>;
  ordersByType: Array<{ type: string; count: number }>;
  customerMetrics: {
    totalCustomers: number;
    repeatCustomers: number;
    newCustomers: number;
  };
  peakHours: Array<{ hour: number; orders: number }>;
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    topItems: [],
    dailyRevenue: [],
    ordersByType: [],
    customerMetrics: { totalCustomers: 0, repeatCustomers: 0, newCustomers: 0 },
    peakHours: [],
  });

  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');

  useEffect(() => {
    calculateAnalytics();
  }, [timeRange]);

  const calculateAnalytics = () => {
    const orders = store.getOrders();
    const customers = store.getCustomers();
    const menu = store.getMenu();
    const now = Date.now();

    // Determine date range
    let startDate = new Date();
    switch (timeRange) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate.setDate(startDate.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
        break;
    }

    const filteredOrders = orders.filter((o) => o.createdAt >= startDate.getTime());

    // Calculate basic metrics
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.totalUSD, 0);
    const totalOrders = filteredOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Top items
    const itemCounts: { [key: number]: { name: string; count: number; revenue: number } } = {};
    filteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (!itemCounts[item.menuItemId]) {
          itemCounts[item.menuItemId] = {
            name: item.name,
            count: 0,
            revenue: 0,
          };
        }
        itemCounts[item.menuItemId].count += item.quantity;
        itemCounts[item.menuItemId].revenue += item.unitPriceUSD * item.quantity;
      });
    });

    const topItems = Object.values(itemCounts)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Daily revenue
    const dailyData: { [key: string]: { revenue: number; orders: number } } = {};
    filteredOrders.forEach((order) => {
      const date = new Date(order.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      if (!dailyData[date]) {
        dailyData[date] = { revenue: 0, orders: 0 };
      }
      dailyData[date].revenue += order.totalUSD;
      dailyData[date].orders += 1;
    });

    const dailyRevenue = Object.entries(dailyData)
      .map(([date, data]) => ({
        date,
        revenue: parseFloat(data.revenue.toFixed(2)),
        orders: data.orders,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Orders by type
    const typeData: { [key: string]: number } = {};
    filteredOrders.forEach((order) => {
      typeData[order.type] = (typeData[order.type] || 0) + 1;
    });

    const ordersByType = Object.entries(typeData).map(([type, count]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count,
    }));

    // Peak hours
    const hourData: { [key: number]: number } = {};
    filteredOrders.forEach((order) => {
      const hour = new Date(order.createdAt).getHours();
      hourData[hour] = (hourData[hour] || 0) + 1;
    });

    const peakHours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      orders: hourData[i] || 0,
    }));

    // Customer metrics
    const repeatCustomers = customers.filter((c) => c.totalOrders > 1).length;
    const newCustomers = customers.filter((c) => c.totalOrders === 1).length;

    setAnalytics({
      totalRevenue,
      totalOrders,
      averageOrderValue,
      topItems,
      dailyRevenue,
      ordersByType,
      customerMetrics: {
        totalCustomers: customers.length,
        repeatCustomers,
        newCustomers,
      },
      peakHours,
    });
  };

  const COLORS = ['#059669', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">📊 Analytics & Insights</h2>
          <p className="text-gray-600 mt-1">Business performance and customer insights</p>
        </div>
        <div className="flex gap-2">
          {(['today', 'week', 'month'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                timeRange === range
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600 font-mono">${analytics.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">USD</p>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-blue-600" />
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{analytics.totalOrders}</div>
            <p className="text-xs text-gray-500 mt-1">Orders placed</p>
          </CardContent>
        </Card>

        {/* Average Order Value */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              Avg Order Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600 font-mono">${analytics.averageOrderValue.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">Per order</p>
          </CardContent>
        </Card>

        {/* Total Customers */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{analytics.customerMetrics.totalCustomers}</div>
            <p className="text-xs text-gray-500 mt-1">Unique customers</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Revenue Chart */}
        {analytics.dailyRevenue.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Daily Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#059669"
                    name="Revenue ($)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Orders by Type */}
        {analytics.ordersByType.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Orders by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.ordersByType}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {analytics.ordersByType.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Peak Hours */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Peak Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.peakHours}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" label={{ value: 'Hour of Day', position: 'insideBottomRight', offset: -5 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#3b82f6" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Items */}
        {analytics.topItems.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Top Selling Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.topItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-600">{item.count} sold</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">${item.revenue.toFixed(2)}</p>
                      <p className="text-xs text-gray-600">{((item.revenue / analytics.totalRevenue) * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Customer Insights */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Customer Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-3xl font-bold text-blue-600">{analytics.customerMetrics.totalCustomers}</p>
              <p className="text-sm text-gray-600 mt-1">Total Customers</p>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-lg">
              <p className="text-3xl font-bold text-emerald-600">{analytics.customerMetrics.repeatCustomers}</p>
              <p className="text-sm text-gray-600 mt-1">Repeat Customers</p>
              <p className="text-xs text-gray-500 mt-1">
                {analytics.customerMetrics.totalCustomers > 0
                  ? (
                      (analytics.customerMetrics.repeatCustomers / analytics.customerMetrics.totalCustomers) *
                      100
                    ).toFixed(1)
                  : '0'}
                %
              </p>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <p className="text-3xl font-bold text-amber-600">{analytics.customerMetrics.newCustomers}</p>
              <p className="text-sm text-gray-600 mt-1">New Customers</p>
              <p className="text-xs text-gray-500 mt-1">
                {analytics.customerMetrics.totalCustomers > 0
                  ? ((analytics.customerMetrics.newCustomers / analytics.customerMetrics.totalCustomers) * 100).toFixed(1)
                  : '0'}
                %
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
