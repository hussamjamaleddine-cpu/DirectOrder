import { useState, useEffect } from 'react';
import { store, MenuItem, InventoryAlert, Supplier } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Package, TrendingDown, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Inventory() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [newAlert, setNewAlert] = useState({
    lowStockThreshold: 5,
    reorderQuantity: 20,
    supplier: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const menuData = store.getMenu();
    setMenu(menuData);
    const alertsData = store.getInventoryAlerts();
    setAlerts(alertsData);
    setSuppliers(store.getSuppliers());
  };

  const addAlert = () => {
    if (!selectedItem || newAlert.lowStockThreshold <= 0 || newAlert.reorderQuantity <= 0) {
      toast.error('Please fill in all fields');
      return;
    }

    const item = menu.find((m) => m.id === selectedItem);
    if (!item) return;

    const alert: InventoryAlert = {
      id: `alert_${Date.now()}`,
      menuItemId: selectedItem,
      itemName: item.name,
      currentStock: item.stock || 0,
      lowStockThreshold: newAlert.lowStockThreshold,
      reorderQuantity: newAlert.reorderQuantity,
      supplier: newAlert.supplier || undefined,
      alertSent: false,
      createdAt: Date.now(),
    };

    const updatedAlerts = [...alerts, alert];
    store.setInventoryAlerts(updatedAlerts);
    setAlerts(updatedAlerts);
    setSelectedItem(null);
    setNewAlert({ lowStockThreshold: 5, reorderQuantity: 20, supplier: '' });
    setShowAddAlert(false);
    toast.success('Inventory alert created!');
  };

  const deleteAlert = (id: string) => {
    const updatedAlerts = alerts.filter((a) => a.id !== id);
    store.setInventoryAlerts(updatedAlerts);
    setAlerts(updatedAlerts);
    toast.success('Alert deleted');
  };

  const updateStock = (itemId: number, newStock: number) => {
    const updatedMenu = menu.map((item) =>
      item.id === itemId ? { ...item, stock: newStock } : item
    );
    store.setMenu(updatedMenu);
    setMenu(updatedMenu);

    // Update alerts
    const updatedAlerts = alerts.map((alert) =>
      alert.menuItemId === itemId
        ? { ...alert, currentStock: newStock }
        : alert
    );
    store.setInventoryAlerts(updatedAlerts);
    setAlerts(updatedAlerts);
    toast.success('Stock updated!');
  };

  const getLowStockItems = () => {
    return alerts.filter((alert) => alert.currentStock <= alert.lowStockThreshold);
  };

  const getTrackedItems = () => {
    return menu.filter((item) => alerts.some((a) => a.menuItemId === item.id));
  };

  const lowStockItems = getLowStockItems();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">📦 Inventory Management</h2>
        <p className="text-gray-600 mt-1">Track stock levels and manage reorders</p>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <div className="p-4 bg-red-50 rounded-lg border-2 border-red-300 flex gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-900">⚠️ {lowStockItems.length} Items Low in Stock</p>
            <p className="text-sm text-red-800 mt-1">
              {lowStockItems.map((a) => a.itemName).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Add Alert Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => setShowAddAlert(!showAddAlert)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Track Item
        </Button>
      </div>

      {/* Add Alert Form */}
      {showAddAlert && (
        <Card className="border-0 shadow-sm bg-emerald-50">
          <CardHeader>
            <CardTitle>Add Inventory Alert</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Item</label>
              <select
                value={selectedItem || ''}
                onChange={(e) => setSelectedItem(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Choose an item...</option>
                {menu
                  .filter((item) => !alerts.some((a) => a.menuItemId === item.id))
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} (Stock: {item.stock || 0})
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Low Stock Threshold</label>
                <Input
                  type="number"
                  min="1"
                  value={newAlert.lowStockThreshold}
                  onChange={(e) => setNewAlert({ ...newAlert, lowStockThreshold: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Reorder Quantity</label>
                <Input
                  type="number"
                  min="1"
                  value={newAlert.reorderQuantity}
                  onChange={(e) => setNewAlert({ ...newAlert, reorderQuantity: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Supplier (Optional)</label>
              <select
                value={newAlert.supplier}
                onChange={(e) => setNewAlert({ ...newAlert, supplier: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select a supplier...</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={addAlert}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                Create Alert
              </Button>
              <Button
                onClick={() => setShowAddAlert(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tracked Items */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Tracked Items ({getTrackedItems().length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {getTrackedItems().length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No items being tracked yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {getTrackedItems().map((item) => {
                const alert = alerts.find((a) => a.menuItemId === item.id);
                const isLowStock = alert && item.stock! <= alert.lowStockThreshold;

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg border-2 flex items-center justify-between ${
                      isLowStock
                        ? 'bg-red-50 border-red-300'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900">{item.name}</p>
                        {isLowStock && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-bold">
                            LOW STOCK
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Current: <span className="font-bold">{item.stock || 0}</span> | Threshold:{' '}
                        <span className="font-bold">{alert?.lowStockThreshold}</span> | Reorder:{' '}
                        <span className="font-bold">{alert?.reorderQuantity}</span>
                      </p>
                      {alert?.supplier && (
                        <p className="text-xs text-gray-600 mt-1">📞 Supplier: {alert.supplier}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateStock(item.id, Math.max(0, item.stock! - 1))}
                          className="px-2 py-1 bg-gray-300 hover:bg-gray-400 rounded text-sm font-bold"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={item.stock || 0}
                          onChange={(e) => updateStock(item.id, parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-center font-bold"
                        />
                        <button
                          onClick={() => updateStock(item.id, item.stock! + 1)}
                          className="px-2 py-1 bg-gray-300 hover:bg-gray-400 rounded text-sm font-bold"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => deleteAlert(alert!.id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{getTrackedItems().length}</p>
              <p className="text-sm text-gray-600 mt-1">Items Tracked</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-600">
                {getTrackedItems().filter((i) => {
                  const alert = alerts.find((a) => a.menuItemId === i.id);
                  return alert && i.stock! > alert.lowStockThreshold;
                }).length}
              </p>
              <p className="text-sm text-gray-600 mt-1">In Stock</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">{lowStockItems.length}</p>
              <p className="text-sm text-gray-600 mt-1">Low Stock</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
