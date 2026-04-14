import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { store, Order } from '@/lib/store';
import { AlertCircle, Printer, MessageCircle, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_COLORS = {
  new: { bg: 'bg-amber-100', text: 'text-amber-700', label: '🟡 New', next: 'confirmed' },
  confirmed: { bg: 'bg-blue-100', text: 'text-blue-700', label: '🔵 Confirmed', next: 'ready' },
  ready: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: '🟢 Ready', next: 'delivered' },
  delivered: { bg: 'bg-gray-100', text: 'text-gray-700', label: '✅ Delivered', next: null },
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    const allOrders = store.getOrders();
    setOrders(allOrders.sort((a, b) => b.createdAt - a.createdAt));
  };

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    const updatedOrders = orders.map((o) =>
      o.id === orderId ? { ...o, status: newStatus as Order['status'] } : o
    );
    setOrders(updatedOrders);
    store.setOrders(updatedOrders);
    toast.success(`Order ${orderId} updated to ${newStatus}`);
  };

  const deleteOrder = (orderId: string) => {
    if (confirm('Are you sure you want to delete this order?')) {
      const updatedOrders = orders.filter((o) => o.id !== orderId);
      setOrders(updatedOrders);
      store.setOrders(updatedOrders);
      toast.success('Order deleted');
    }
  };

  const sendWhatsApp = (order: Order) => {
    const message = `Hi ${order.customerName}! Your order #${order.id} is ${order.status}. Total: $${order.totalUSD.toFixed(2)}`;
    const encodedMsg = encodeURIComponent(message);
    const phone = order.customerPhone.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${encodedMsg}`, '_blank');
  };

  const printOrder = (order: Order) => {
    const printContent = `
      <html>
        <head>
          <title>Order #${order.id}</title>
          <style>
            body { font-family: Arial; margin: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .details { margin-bottom: 20px; }
            .items { margin-bottom: 20px; }
            .items table { width: 100%; border-collapse: collapse; }
            .items th, .items td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .total { text-align: right; font-weight: bold; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Order Receipt</h1>
            <p>Order #${order.id}</p>
          </div>
          <div class="details">
            <p><strong>Customer:</strong> ${order.customerName}</p>
            <p><strong>Phone:</strong> ${order.customerPhone}</p>
            <p><strong>Type:</strong> ${order.type}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <div class="items">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.items
                  .map(
                    (item) => {
                      let details = '';
                      if (item.selectedVariant) details += `<div><small>Variant: ${item.selectedVariant}</small></div>`;
                      if (item.selectedAddons && item.selectedAddons.length > 0) details += `<div><small>Add-ons: ${item.selectedAddons.join(', ')}</small></div>`;
                      if (item.specialRequest) details += `<div><small><strong>Note: ${item.specialRequest}</strong></small></div>`;
                      
                      return `<tr>
                        <td>
                          <div>${item.name}</div>
                          ${details}
                        </td>
                        <td>${item.quantity}</td>
                        <td>$${item.unitPriceUSD.toFixed(2)}</td>
                        <td>$${(item.quantity * item.unitPriceUSD).toFixed(2)}</td>
                      </tr>`;
                    }
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
          <div class="total">
            <p>Total: $${order.totalUSD.toFixed(2)}</p>
            <p>${order.totalLBP.toLocaleString()} LBP</p>
          </div>
        </body>
      </html>
    `;
    const printWindow = window.open('', '', 'width=600,height=800');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const filteredOrders =
    filterStatus === 'all' ? orders : orders.filter((o) => o.status === filterStatus);

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'new', 'confirmed', 'ready', 'delivered'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              filterStatus === status
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status === 'all' ? '📋 All' : STATUS_COLORS[status as keyof typeof STATUS_COLORS]?.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-12 text-center text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No orders found</p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => {
            const statusInfo = STATUS_COLORS[order.status as keyof typeof STATUS_COLORS];
            return (
              <Card key={order.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 text-lg">#{order.id}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.bg} ${statusInfo.text}`}>
                          {statusInfo.label}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {order.type.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>{order.customerName}</strong> · {order.customerPhone}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleString('en-LB')}
                      </p>
                      <div className="mt-2 text-sm text-gray-700">
                        <p className="font-mono font-semibold text-emerald-600">${order.totalUSD.toFixed(2)} · {order.totalLBP.toLocaleString()} LBP</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {/* Status Update Button */}
                      {statusInfo.next && (
                        <Button
                          onClick={() => updateOrderStatus(order.id, statusInfo.next!)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm"
                          size="sm"
                        >
                          Next →
                        </Button>
                      )}

                      {/* Quick Actions */}
                      <div className="flex gap-1">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => printOrder(order)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Print"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => sendWhatsApp(order)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Send WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteOrder(order.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-96 overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Order #{selectedOrder.id} Details</CardTitle>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 uppercase">Customer</p>
                  <p className="font-semibold">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase">Phone</p>
                  <p className="font-semibold">{selectedOrder.customerPhone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase">Type</p>
                  <p className="font-semibold">{selectedOrder.type}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase">Status</p>
                  <p className="font-semibold">{selectedOrder.status}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-600 uppercase mb-2">Items</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="bg-gray-50 p-2 rounded">
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold">{item.name} × {item.quantity}</span>
                        <span className="font-mono">${(item.quantity * item.unitPriceUSD).toFixed(2)}</span>
                      </div>
                      {(item.selectedVariant || (item.selectedAddons && item.selectedAddons.length > 0) || item.specialRequest) && (
                        <div className="mt-1 text-xs text-gray-600 space-y-0.5">
                          {item.selectedVariant && <p>• Variant: {item.selectedVariant}</p>}
                          {item.selectedAddons && item.selectedAddons.length > 0 && (
                            <p>• Add-ons: {item.selectedAddons.join(', ')}</p>
                          )}
                          {item.specialRequest && (
                            <p className="italic text-amber-700 font-medium">
                              • Note: {item.specialRequest}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span className="font-mono text-emerald-600">${selectedOrder.totalUSD.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
