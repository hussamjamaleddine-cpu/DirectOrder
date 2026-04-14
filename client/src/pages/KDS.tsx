import { useState, useEffect } from 'react';
import { store, Order } from '@/lib/store';
import { ChevronUp, ChevronDown, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function KDS() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(() => {
      if (autoRefresh) {
        loadOrders();
      }
    }, 3000); // Refresh every 3 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const loadOrders = () => {
    const allOrders = store.getOrders();
    // Show only new and confirmed orders, sorted by creation time (newest first)
    const activeOrders = allOrders
      .filter((order) => order.status === 'new' || order.status === 'confirmed')
      .sort((a, b) => b.createdAt - a.createdAt);
    setOrders(activeOrders);
  };

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    const allOrders = store.getOrders();
    const updatedOrders = allOrders.map((order) =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    store.setOrders(updatedOrders);
    loadOrders();

    if (newStatus === 'ready') {
      toast.success(`Order ${orderId} is ready!`);
      // Play a notification sound (optional)
      playNotificationSound();
    }
  };

  const playNotificationSound = () => {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'new':
        return 'bg-red-500';
      case 'confirmed':
        return 'bg-yellow-500';
      case 'ready':
        return 'bg-green-500';
      case 'delivered':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'new':
        return '🆕 NEW ORDER';
      case 'confirmed':
        return '👨‍🍳 COOKING';
      case 'ready':
        return '✓ READY';
      case 'delivered':
        return '📦 DELIVERED';
      default:
        return 'UNKNOWN';
    }
  };

  const getOrderTypeEmoji = (type: Order['type']) => {
    switch (type) {
      case 'dinein':
        return '🪑';
      case 'takeaway':
        return '📦';
      case 'delivery':
        return '🚗';
      default:
        return '📋';
    }
  };

  const getTimeElapsed = (createdAt: number) => {
    const elapsed = Math.floor((Date.now() - createdAt) / 1000);
    if (elapsed < 60) return `${elapsed}s`;
    if (elapsed < 3600) return `${Math.floor(elapsed / 60)}m`;
    return `${Math.floor(elapsed / 3600)}h`;
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-black border-b-4 border-emerald-600 p-4 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">🍳 KITCHEN DISPLAY SYSTEM</h1>
          <p className="text-emerald-400 text-sm mt-1">
            {orders.length} active order{orders.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-white cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-5 h-5"
            />
            <span className="text-sm font-semibold">Auto-Refresh</span>
          </label>
          <div className="text-right">
            <p className="text-white text-sm font-mono">
              {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="flex-1 overflow-auto p-4">
        {orders.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-8xl mb-4">✨</div>
              <h2 className="text-4xl font-bold text-white mb-2">All Caught Up!</h2>
              <p className="text-gray-400 text-lg">No active orders at the moment</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 auto-rows-max">
            {orders.map((order) => (
              <div
                key={order.id}
                className={`rounded-xl overflow-hidden shadow-2xl transform transition-all hover:scale-105 ${
                  order.status === 'new'
                    ? 'ring-4 ring-red-500 animate-pulse'
                    : order.status === 'confirmed'
                    ? 'ring-4 ring-yellow-500'
                    : 'ring-4 ring-green-500'
                }`}
              >
                {/* Card Header */}
                <div className={`${getStatusColor(order.status)} text-white p-4 font-bold text-xl`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-75">Order ID</p>
                      <p className="text-2xl font-mono">{order.id.split('-')[1]}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl">{getOrderTypeEmoji(order.type)}</p>
                      <p className="text-xs mt-1 opacity-75">{getStatusLabel(order.status)}</p>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="bg-gray-800 text-white p-4 space-y-3">
                  {/* Customer Info */}
                  <div className="border-b border-gray-700 pb-3">
                    <p className="text-xs text-gray-400 uppercase font-semibold">Customer</p>
                    <p className="text-lg font-bold text-emerald-400">{order.customerName}</p>
                    <p className="text-xs text-gray-400">{order.customerPhone}</p>
                  </div>

                  {/* Items */}
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Items</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-700 rounded p-2 text-sm"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-bold text-emerald-300">
                                {item.quantity}x {item.name}
                              </p>
                              {item.selectedVariant && (
                                <p className="text-xs text-gray-300">
                                  • {item.selectedVariant}
                                </p>
                              )}
                              {item.selectedAddons.length > 0 && (
                                <p className="text-xs text-yellow-300">
                                  + {item.selectedAddons.join(', ')}
                                </p>
                              )}
                              {item.specialRequest && (
                                <p className="text-xs text-red-400 font-bold mt-1">
                                  📝 {item.specialRequest}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Time Elapsed */}
                  <div className="bg-gray-700 rounded p-2 text-center">
                    <p className="text-xs text-gray-400">Time</p>
                    <p className="text-2xl font-bold text-orange-400 font-mono">
                      {getTimeElapsed(order.createdAt)}
                    </p>
                  </div>

                  {/* Status Buttons */}
                  <div className="flex gap-2 pt-2">
                    {order.status === 'new' && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'confirmed')}
                        className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-3 rounded transition-colors"
                      >
                        👨‍🍳 START COOKING
                      </button>
                    )}
                    {order.status === 'confirmed' && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'ready')}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        READY
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-black border-t-4 border-emerald-600 p-3 text-center text-gray-400 text-xs">
        <p>DirectOrder Kitchen Display System • Last updated: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
}
