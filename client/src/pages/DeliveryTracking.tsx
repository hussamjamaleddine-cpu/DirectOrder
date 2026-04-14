import { useState, useEffect } from 'react';
import { store, Order } from '@/lib/store';
import { MapPin, Navigation, Phone, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface DeliveryLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface DeliverySession {
  orderId: string;
  driverId: string;
  driverName: string;
  locations: DeliveryLocation[];
  isTracking: boolean;
  startedAt: number;
}

export default function DeliveryTracking() {
  const [deliverySessions, setDeliverySessions] = useState<DeliverySession[]>([]);
  const [activeSession, setActiveSession] = useState<DeliverySession | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [watchId, setWatchId] = useState<number | null>(null);

  useEffect(() => {
    loadDeliveries();
  }, []);

  const loadDeliveries = () => {
    const allOrders = store.getOrders();
    const deliveryOrders = allOrders.filter((order) => order.type === 'delivery');
    setOrders(deliveryOrders);

    // Load delivery sessions from localStorage
    const sessions = localStorage.getItem('directorder_delivery_sessions');
    if (sessions) {
      setDeliverySessions(JSON.parse(sessions));
    }
  };

  const startTracking = (orderId: string, driverName: string) => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported on this device');
      return;
    }

    const driverId = `driver_${Date.now()}`;
    const newSession: DeliverySession = {
      orderId,
      driverId,
      driverName,
      locations: [],
      isTracking: true,
      startedAt: Date.now(),
    };

    // Start watching position
    const id = navigator.geolocation.watchPosition(
      (position) => {
        const location: DeliveryLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: Date.now(),
        };

        setDeliverySessions((prev) => {
          const updated = prev.map((session) =>
            session.driverId === driverId
              ? {
                  ...session,
                  locations: [...session.locations, location],
                }
              : session
          );
          localStorage.setItem('directorder_delivery_sessions', JSON.stringify(updated));
          return updated;
        });
      },
      (error) => {
        toast.error(`Location error: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    );

    setWatchId(id);
    setDeliverySessions((prev) => [...prev, newSession]);
    setActiveSession(newSession);
    toast.success('Tracking started! 📍');
  };

  const stopTracking = (driverId: string) => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }

    setDeliverySessions((prev) => {
      const updated = prev.map((session) =>
        session.driverId === driverId
          ? { ...session, isTracking: false }
          : session
      );
      localStorage.setItem('directorder_delivery_sessions', JSON.stringify(updated));
      return updated;
    });

    setActiveSession(null);
    toast.success('Tracking stopped');
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const calculateETA = (currentLat: number, currentLon: number, destLat: number, destLon: number) => {
    const distance = calculateDistance(currentLat, currentLon, destLat, destLon);
    const avgSpeed = 30; // km/h average city speed
    const minutes = Math.ceil((distance / avgSpeed) * 60);
    return { distance: distance.toFixed(2), minutes };
  };

  const getTrackingLink = (driverId: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}?track=${driverId}`;
  };

  const getLastLocation = (session: DeliverySession) => {
    return session.locations[session.locations.length - 1];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">🚗 Delivery Tracking</h2>
        <p className="text-gray-600 mt-1">Manage delivery orders and track driver locations in real-time</p>
      </div>

      {/* Active Tracking Session */}
      {activeSession && (
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border-2 border-emerald-300 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">🟢 Tracking Active</h3>
              <p className="text-sm text-gray-600">Driver: {activeSession.driverName}</p>
            </div>
            <button
              onClick={() => stopTracking(activeSession.driverId)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              ⏹ Stop Tracking
            </button>
          </div>

          {/* Live Location Info */}
          {getLastLocation(activeSession) && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded p-3">
                <p className="text-xs text-gray-600">Current Location</p>
                <p className="font-mono text-sm font-bold text-gray-900">
                  {getLastLocation(activeSession)!.latitude.toFixed(6)}, {getLastLocation(activeSession)!.longitude.toFixed(6)}
                </p>
              </div>
              <div className="bg-white rounded p-3">
                <p className="text-xs text-gray-600">Last Updated</p>
                <p className="font-semibold text-gray-900">
                  {new Date(getLastLocation(activeSession)!.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          )}

          {/* Tracking Link */}
          <div className="bg-white rounded p-3">
            <p className="text-xs text-gray-600 mb-2">📱 Share Tracking Link with Customer</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={getTrackingLink(activeSession.driverId)}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded font-mono text-sm"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(getTrackingLink(activeSession.driverId));
                  toast.success('Link copied!');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Orders */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900">📦 Delivery Orders</h3>

        {orders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg">No delivery orders</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders.map((order) => {
              const session = deliverySessions.find((s) => s.orderId === order.id);
              const lastLocation = session ? getLastLocation(session) : null;

              return (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-900">{order.customerName}</p>
                      <p className="text-xs text-gray-600">Order: {order.id.split('-')[1]}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      order.status === 'delivered'
                        ? 'bg-green-100 text-green-700'
                        : order.status === 'ready'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-2 mb-3 pb-3 border-b border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Phone className="w-4 h-4" />
                      <span>{order.customerPhone}</span>
                    </div>
                    {order.address && (
                      <div className="flex items-start gap-2 text-sm text-gray-700">
                        <MapPin className="w-4 h-4 mt-0.5" />
                        <span>{order.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Tracking Status */}
                  {session ? (
                    <div className="space-y-2 mb-3 p-3 bg-blue-50 rounded">
                      <div className="flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-900">
                          {session.isTracking ? '🟢 Tracking Active' : '⚫ Tracking Stopped'}
                        </span>
                      </div>
                      {lastLocation && (
                        <div className="text-xs text-gray-600">
                          <p>📍 {lastLocation.latitude.toFixed(4)}, {lastLocation.longitude.toFixed(4)}</p>
                          <p>⏱ {new Date(lastLocation.timestamp).toLocaleTimeString()}</p>
                        </div>
                      )}
                    </div>
                  ) : null}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {!session || !session.isTracking ? (
                      <button
                        onClick={() => startTracking(order.id, order.deliveryAssignee || 'Driver')}
                        className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded font-semibold hover:bg-emerald-700 transition-colors text-sm"
                      >
                        📍 Start Tracking
                      </button>
                    ) : (
                      <button
                        onClick={() => stopTracking(session.driverId)}
                        className="flex-1 px-3 py-2 bg-red-600 text-white rounded font-semibold hover:bg-red-700 transition-colors text-sm"
                      >
                        ⏹ Stop Tracking
                      </button>
                    )}
                    {session && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(getTrackingLink(session.driverId));
                          toast.success('Link copied!');
                        }}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition-colors text-sm"
                      >
                        📱 Share Link
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tracking History */}
      {deliverySessions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900">📍 Tracking History</h3>
          <div className="space-y-3">
            {deliverySessions.map((session) => (
              <div key={session.driverId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-bold text-gray-900">{session.driverName}</p>
                    <p className="text-xs text-gray-600">
                      {session.locations.length} location points recorded
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    session.isTracking
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {session.isTracking ? '🟢 Active' : '⚫ Stopped'}
                  </span>
                </div>
                {session.locations.length > 0 && (
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>
                      Started: {new Date(session.startedAt).toLocaleTimeString()}
                    </p>
                    <p>
                      Last: {new Date(session.locations[session.locations.length - 1].timestamp).toLocaleTimeString()}
                    </p>
                    <p>
                      Distance: ~{(
                        session.locations.length * 0.05
                      ).toFixed(2)} km (estimated)
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
