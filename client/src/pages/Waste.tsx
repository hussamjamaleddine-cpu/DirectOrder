import { useState, useEffect } from 'react';
import { store, WasteRecord, MenuItem } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash, Plus, BarChart3, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function Waste() {
  const [wasteRecords, setWasteRecords] = useState<WasteRecord[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [showAddWaste, setShowAddWaste] = useState(false);
  const [selectedMenuItemId, setSelectedMenuItemId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('piece');
  const [reason, setReason] = useState<'spoilage' | 'damage' | 'expiry' | 'overproduction' | 'other'>('spoilage');
  const [notes, setNotes] = useState('');
  const [filterReason, setFilterReason] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'all'>('month');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setWasteRecords(store.getWasteRecords());
    setMenu(store.getMenu());
  };

  const getMenuItemCost = (menuItemId: number): number => {
    const item = menu.find((m) => m.id === menuItemId);
    return item ? (item.costLBP || 0) / 89500 : 0; // Convert to USD
  };

  const recordWaste = () => {
    if (!selectedMenuItemId || !quantity) {
      toast.error('Please select item and quantity');
      return;
    }

    const menuItem = menu.find((m) => m.id === selectedMenuItemId);
    if (!menuItem) return;

    const costPerUnit = getMenuItemCost(selectedMenuItemId);
    const totalCost = costPerUnit * parseFloat(quantity);

    const wasteRecord: WasteRecord = {
      id: `waste_${Date.now()}`,
      menuItemId: selectedMenuItemId,
      itemName: menuItem.name,
      quantity: parseFloat(quantity),
      unit: unit,
      reason: reason,
      costLost: totalCost,
      notes: notes || undefined,
      recordedAt: Date.now(),
    };

    const updatedRecords = [...wasteRecords, wasteRecord];
    store.setWasteRecords(updatedRecords);
    setWasteRecords(updatedRecords);

    // Deduct from inventory
    const updatedMenu = menu.map((item) => {
      if (item.id === selectedMenuItemId) {
        return {
          ...item,
          stock: Math.max(0, (item.stock || 0) - parseFloat(quantity)),
        };
      }
      return item;
    });
    store.setMenu(updatedMenu);
    setMenu(updatedMenu);

    resetForm();
    toast.success('Waste recorded!');
  };

  const resetForm = () => {
    setSelectedMenuItemId(null);
    setQuantity('');
    setUnit('piece');
    setReason('spoilage');
    setNotes('');
    setShowAddWaste(false);
  };

  const deleteWaste = (id: string) => {
    const waste = wasteRecords.find((w) => w.id === id);
    if (!waste) return;

    // Restore inventory
    const updatedMenu = menu.map((item) => {
      if (item.id === waste.menuItemId) {
        return {
          ...item,
          stock: (item.stock || 0) + waste.quantity,
        };
      }
      return item;
    });
    store.setMenu(updatedMenu);
    setMenu(updatedMenu);

    const updatedRecords = wasteRecords.filter((w) => w.id !== id);
    store.setWasteRecords(updatedRecords);
    setWasteRecords(updatedRecords);
    toast.success('Waste record deleted and inventory restored');
  };

  const getTimeRangeMs = (): number => {
    const now = Date.now();
    switch (timeRange) {
      case 'day':
        return now - 24 * 60 * 60 * 1000;
      case 'week':
        return now - 7 * 24 * 60 * 60 * 1000;
      case 'month':
        return now - 30 * 24 * 60 * 60 * 1000;
      default:
        return 0;
    }
  };

  const filteredRecords = wasteRecords.filter((w) => {
    const reasonMatch = filterReason === 'all' || w.reason === filterReason;
    const timeMatch = w.recordedAt >= getTimeRangeMs();
    return reasonMatch && timeMatch;
  });

  const totalWasteCost = filteredRecords.reduce((sum, w) => sum + w.costLost, 0);
  const wasteByReason = {
    spoilage: filteredRecords.filter((w) => w.reason === 'spoilage').reduce((sum, w) => sum + w.costLost, 0),
    damage: filteredRecords.filter((w) => w.reason === 'damage').reduce((sum, w) => sum + w.costLost, 0),
    expiry: filteredRecords.filter((w) => w.reason === 'expiry').reduce((sum, w) => sum + w.costLost, 0),
    overproduction: filteredRecords.filter((w) => w.reason === 'overproduction').reduce((sum, w) => sum + w.costLost, 0),
    other: filteredRecords.filter((w) => w.reason === 'other').reduce((sum, w) => sum + w.costLost, 0),
  };

  const topWastedItems = menu
    .map((item) => ({
      id: item.id,
      name: item.name,
      wastedQty: filteredRecords
        .filter((w) => w.menuItemId === item.id)
        .reduce((sum, w) => sum + w.quantity, 0),
      wastedCost: filteredRecords
        .filter((w) => w.menuItemId === item.id)
        .reduce((sum, w) => sum + w.costLost, 0),
    }))
    .filter((item) => item.wastedQty > 0)
    .sort((a, b) => b.wastedCost - a.wastedCost)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">🗑️ Waste Tracking</h2>
        <p className="text-gray-600 mt-1">Monitor and analyze waste and spoilage</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">${totalWasteCost.toFixed(2)}</p>
              <p className="text-sm text-gray-600 mt-1">Total Waste Cost</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">{filteredRecords.length}</p>
              <p className="text-sm text-gray-600 mt-1">Waste Records</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-600">${wasteByReason.spoilage.toFixed(2)}</p>
              <p className="text-sm text-gray-600 mt-1">Spoilage Cost</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">${wasteByReason.expiry.toFixed(2)}</p>
              <p className="text-sm text-gray-600 mt-1">Expiry Cost</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="day">Last 24 Hours</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="all">All Time</option>
        </select>
        <select
          value={filterReason}
          onChange={(e) => setFilterReason(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">All Reasons</option>
          <option value="spoilage">Spoilage</option>
          <option value="damage">Damage</option>
          <option value="expiry">Expiry</option>
          <option value="overproduction">Overproduction</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Add Waste Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => setShowAddWaste(!showAddWaste)}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Record Waste
        </Button>
      </div>

      {/* Add Waste Form */}
      {showAddWaste && (
        <Card className="border-0 shadow-sm bg-red-50">
          <CardHeader>
            <CardTitle>Record Waste</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <select
              value={selectedMenuItemId || ''}
              onChange={(e) => setSelectedMenuItemId(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select item...</option>
              {menu.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} (Cost: ${getMenuItemCost(item.id).toFixed(2)})
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                placeholder="Quantity"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="piece">piece</option>
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="liter">liter</option>
                <option value="ml">ml</option>
              </select>
            </div>

            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="spoilage">Spoilage</option>
              <option value="damage">Damage</option>
              <option value="expiry">Expiry</option>
              <option value="overproduction">Overproduction</option>
              <option value="other">Other</option>
            </select>

            {selectedMenuItemId && quantity && (
              <div className="p-3 bg-white rounded border border-gray-200">
                <p className="text-sm">
                  <strong>Cost Lost:</strong> ${(getMenuItemCost(selectedMenuItemId) * parseFloat(quantity)).toFixed(2)}
                </p>
              </div>
            )}

            <Input
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <div className="flex gap-2">
              <Button
                onClick={recordWaste}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                Record Waste
              </Button>
              <Button
                onClick={resetForm}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Waste Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Waste by Reason */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Waste by Reason
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(wasteByReason).map(([reason, cost]) => (
                <div key={reason} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium capitalize">{reason}</span>
                  <span className="font-bold text-red-600">${cost.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Wasted Items */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              Top Wasted Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topWastedItems.length === 0 ? (
              <p className="text-sm text-gray-600">No waste recorded yet</p>
            ) : (
              <div className="space-y-2">
                {topWastedItems.map((item) => (
                  <div key={item.id} className="p-2 bg-gray-50 rounded">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className="font-bold text-red-600">${item.wastedCost.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-gray-600">Qty: {item.wastedQty}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Waste Records */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash className="w-5 h-5 text-red-600" />
            Waste Records ({filteredRecords.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRecords.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Trash className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No waste records found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRecords
                .sort((a, b) => b.recordedAt - a.recordedAt)
                .map((waste) => (
                  <div key={waste.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900">{waste.itemName}</h3>
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded capitalize">
                            {waste.reason}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Qty: {waste.quantity} {waste.unit} | Cost Lost: ${waste.costLost.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {new Date(waste.recordedAt).toLocaleString()}
                        </p>
                        {waste.notes && <p className="text-xs text-gray-600 mt-1">📝 {waste.notes}</p>}
                      </div>
                      <button
                        onClick={() => deleteWaste(waste.id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash className="w-5 h-5 text-red-600" />
                      </button>
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
