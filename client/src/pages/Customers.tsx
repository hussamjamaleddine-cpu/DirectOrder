import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { store, Customer, Order } from '@/lib/store';
import { AlertCircle, MessageCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [sortBy, setSortBy] = useState<'orders' | 'spent' | 'recent'>('spent');

  useEffect(() => {
    const customersData = store.getCustomers();
    const ordersData = store.getOrders();
    setCustomers(customersData);
    setOrders(ordersData);
  }, []);

  const getCustomerOrders = (phone: string) => {
    return orders.filter((o) => o.customerPhone === phone);
  };

  const sortedCustomers = [...customers].sort((a, b) => {
    if (sortBy === 'orders') {
      return b.totalOrders - a.totalOrders;
    } else if (sortBy === 'spent') {
      return b.totalSpentLBP - a.totalSpentLBP;
    } else {
      return (b.lastOrderAt || 0) - (a.lastOrderAt || 0);
    }
  });

  const handleDeleteCustomer = (id: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      const updatedCustomers = customers.filter((c) => c.id !== id);
      setCustomers(updatedCustomers);
      store.setCustomers(updatedCustomers);
      setSelectedCustomer(null);
      toast.success('Customer deleted');
    }
  };

  const sendWhatsApp = (customer: Customer) => {
    const message = `Hi ${customer.name}! We appreciate your business. You've placed ${customer.totalOrders} order(s) with us!`;
    const encodedMsg = encodeURIComponent(message);
    const phone = customer.phone.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${encodedMsg}`, '_blank');
  };

  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpentLBP, 0);
  const avgOrderValue = customers.length > 0 ? totalRevenue / customers.reduce((sum, c) => sum + c.totalOrders, 0) : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{customers.length}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 font-mono">
              {totalRevenue.toLocaleString()} LBP
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 font-mono">
              {avgOrderValue.toLocaleString()} LBP
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customers List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customers Table */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Customers</CardTitle>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-sm px-3 py-1 border border-gray-300 rounded-lg"
                >
                  <option value="spent">Sort by Spent</option>
                  <option value="orders">Sort by Orders</option>
                  <option value="recent">Sort by Recent</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              {sortedCustomers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No customers yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-3 font-semibold text-gray-700">Name</th>
                        <th className="text-left py-3 px-3 font-semibold text-gray-700">Phone</th>
                        <th className="text-center py-3 px-3 font-semibold text-gray-700">Orders</th>
                        <th className="text-right py-3 px-3 font-semibold text-gray-700">Total Spent</th>
                        <th className="text-center py-3 px-3 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedCustomers.map((customer) => (
                        <tr
                          key={customer.id}
                          className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => setSelectedCustomer(customer)}
                        >
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                                style={{ backgroundColor: customer.color }}
                              >
                                {customer.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-semibold text-gray-900">{customer.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-gray-600">{customer.phone}</td>
                          <td className="py-3 px-3 text-center font-semibold text-gray-900">
                            {customer.totalOrders}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-semibold text-emerald-600">
                            {customer.totalSpentLBP.toLocaleString()} LBP
                          </td>
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  sendWhatsApp(customer);
                                }}
                                className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                                title="Send WhatsApp"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCustomer(customer.id);
                                }}
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Customer Details */}
        {selectedCustomer && (
          <Card className="border-0 shadow-sm lg:sticky lg:top-4 h-fit">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Customer Details</CardTitle>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Customer Info */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold"
                    style={{ backgroundColor: selectedCustomer.color }}
                  >
                    {selectedCustomer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">{selectedCustomer.name}</p>
                    <p className="text-sm text-gray-600">{selectedCustomer.phone}</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Orders:</span>
                    <span className="font-semibold text-gray-900">{selectedCustomer.totalOrders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Spent:</span>
                    <span className="font-mono font-semibold text-emerald-600">
                      {selectedCustomer.totalSpentLBP.toLocaleString()} LBP
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg per Order:</span>
                    <span className="font-mono font-semibold text-blue-600">
                      {selectedCustomer.totalOrders > 0
                        ? (selectedCustomer.totalSpentLBP / selectedCustomer.totalOrders).toLocaleString()
                        : '0'}{' '}
                      LBP
                    </span>
                  </div>
                  {selectedCustomer.lastOrderAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Order:</span>
                      <span className="text-gray-900">
                        {new Date(selectedCustomer.lastOrderAt).toLocaleDateString('en-LB')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order History */}
              <div className="border-t pt-4">
                <p className="font-semibold text-gray-900 mb-3">Order History</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {getCustomerOrders(selectedCustomer.phone).length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-4">No orders</p>
                  ) : (
                    getCustomerOrders(selectedCustomer.phone)
                      .sort((a, b) => b.createdAt - a.createdAt)
                      .slice(0, 5)
                      .map((order) => (
                        <div key={order.id} className="p-2 bg-gray-50 rounded text-xs">
                          <div className="flex justify-between mb-1">
                            <span className="font-semibold text-gray-900">#{order.id}</span>
                            <span className="font-mono text-emerald-600 font-semibold">
                              ${order.totalUSD.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span>{new Date(order.createdAt).toLocaleDateString('en-LB')}</span>
                            <span className="capitalize">{order.status}</span>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="border-t pt-4 space-y-2">
                <button
                  onClick={() => sendWhatsApp(selectedCustomer)}
                  className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-sm transition-colors"
                >
                  💬 Send WhatsApp
                </button>
                <button
                  onClick={() => handleDeleteCustomer(selectedCustomer.id)}
                  className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm transition-colors"
                >
                  🗑️ Delete Customer
                </button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
