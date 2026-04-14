import { useState, useEffect } from 'react';
import { store, Supplier, MenuItem } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Truck, Plus, Trash2, Edit2, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    paymentTerms: '',
  });
  const [selectedItems, setSelectedItems] = useState<Array<{
    menuItemId: number;
    itemName: string;
    pricePerUnit: number;
    unit: string;
    minOrderQuantity?: number;
    leadTimeDays?: number;
  }>>([]);
  const [selectedMenuItemId, setSelectedMenuItemId] = useState<number | null>(null);
  const [itemPrice, setItemPrice] = useState('');
  const [itemUnit, setItemUnit] = useState('piece');
  const [minOrder, setMinOrder] = useState('1');
  const [leadTime, setLeadTime] = useState('1');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setSuppliers(store.getSuppliers());
    setMenu(store.getMenu());
  };

  const addItemToSupplier = () => {
    if (!selectedMenuItemId || !itemPrice) {
      toast.error('Please select item and price');
      return;
    }

    const menuItem = menu.find((m) => m.id === selectedMenuItemId);
    if (!menuItem) return;

    const item = {
      menuItemId: selectedMenuItemId,
      itemName: menuItem.name,
      pricePerUnit: parseFloat(itemPrice),
      unit: itemUnit,
      minOrderQuantity: parseInt(minOrder) || 1 as number,
      leadTimeDays: parseInt(leadTime) || 1 as number,
    };

    setSelectedItems([...selectedItems, item]);
    setSelectedMenuItemId(null);
    setItemPrice('');
    setItemUnit('piece');
    setMinOrder('1');
    setLeadTime('1');
  };

  const removeItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const saveSupplier = () => {
    if (!newSupplier.name || !newSupplier.phone || selectedItems.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    const supplier: Supplier = {
      id: editingId || `supplier_${Date.now()}`,
      name: newSupplier.name,
      contactPerson: newSupplier.contactPerson || undefined,
      phone: newSupplier.phone,
      email: newSupplier.email || undefined,
      address: newSupplier.address || undefined,
      paymentTerms: newSupplier.paymentTerms || undefined,
      items: selectedItems,
      active: true,
      createdAt: editingId ? suppliers.find((s) => s.id === editingId)?.createdAt || Date.now() : Date.now(),
    };

    let updatedSuppliers: Supplier[];
    if (editingId) {
      updatedSuppliers = suppliers.map((s) => (s.id === editingId ? supplier : s));
    } else {
      updatedSuppliers = [...suppliers, supplier];
    }

    store.setSuppliers(updatedSuppliers);
    setSuppliers(updatedSuppliers);
    resetForm();
    toast.success(editingId ? 'Supplier updated!' : 'Supplier added!');
  };

  const resetForm = () => {
    setNewSupplier({
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      paymentTerms: '',
    });
    setSelectedItems([]);
    setEditingId(null);
    setShowAddSupplier(false);
  };

  const deleteSupplier = (id: string) => {
    const updatedSuppliers = suppliers.filter((s) => s.id !== id);
    store.setSuppliers(updatedSuppliers);
    setSuppliers(updatedSuppliers);
    toast.success('Supplier deleted');
  };

  const toggleSupplierActive = (id: string) => {
    const updatedSuppliers = suppliers.map((s) =>
      s.id === id ? { ...s, active: !s.active } : s
    );
    store.setSuppliers(updatedSuppliers);
    setSuppliers(updatedSuppliers);
  };

  const editSupplier = (supplier: Supplier) => {
    setNewSupplier({
      name: supplier.name,
      contactPerson: supplier.contactPerson || '',
      phone: supplier.phone,
      email: supplier.email || '',
      address: supplier.address || '',
      paymentTerms: supplier.paymentTerms || '',
    });
    setSelectedItems(supplier.items);
    setEditingId(supplier.id);
    setShowAddSupplier(true);
  };

  const activeSuppliers = suppliers.filter((s) => s.active).length;
  const totalItems = suppliers.reduce((sum, s) => sum + s.items.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">🚚 Supplier Management</h2>
        <p className="text-gray-600 mt-1">Manage suppliers and their pricing</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{suppliers.length}</p>
              <p className="text-sm text-gray-600 mt-1">Total Suppliers</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-600">{activeSuppliers}</p>
              <p className="text-sm text-gray-600 mt-1">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-600">{totalItems}</p>
              <p className="text-sm text-gray-600 mt-1">Items Supplied</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Supplier Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => setShowAddSupplier(!showAddSupplier)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" />
          {editingId ? 'Update Supplier' : 'Add Supplier'}
        </Button>
      </div>

      {/* Supplier Form */}
      {showAddSupplier && (
        <Card className="border-0 shadow-sm bg-emerald-50">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Supplier' : 'Add New Supplier'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Supplier Details */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Supplier name"
                value={newSupplier.name}
                onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
              />
              <Input
                placeholder="Contact person"
                value={newSupplier.contactPerson}
                onChange={(e) => setNewSupplier({ ...newSupplier, contactPerson: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Phone"
                value={newSupplier.phone}
                onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
              />
              <Input
                placeholder="Email"
                type="email"
                value={newSupplier.email}
                onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
              />
            </div>

            <Input
              placeholder="Address"
              value={newSupplier.address}
              onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
            />

            <Input
              placeholder="Payment terms (e.g., Net 30, COD)"
              value={newSupplier.paymentTerms}
              onChange={(e) => setNewSupplier({ ...newSupplier, paymentTerms: e.target.value })}
            />

            {/* Items Section */}
            <div className="border-t pt-4">
              <h3 className="font-bold text-gray-900 mb-3">Items Supplied</h3>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <select
                    value={selectedMenuItemId || ''}
                    onChange={(e) => setSelectedMenuItemId(parseInt(e.target.value))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select item...</option>
                    {menu.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    placeholder="Price"
                    step="0.01"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    className="w-24"
                  />
                  <select
                    value={itemUnit}
                    onChange={(e) => setItemUnit(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="piece">piece</option>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="liter">liter</option>
                    <option value="ml">ml</option>
                  </select>
                  <Button
                    onClick={addItemToSupplier}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Add
                  </Button>
                </div>

                {selectedItems.length > 0 && (
                  <div className="space-y-2">
                    {selectedItems.map((item, idx) => (
                      <div key={idx} className="p-2 bg-white rounded border border-gray-200 flex justify-between items-center">
                        <span className="text-sm">
                          {item.itemName}: ${item.pricePerUnit}/{item.unit} (Min: {item.minOrderQuantity}, Lead: {item.leadTimeDays}d)
                        </span>
                        <button
                          onClick={() => removeItem(idx)}
                          className="text-red-600 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Min order qty"
                    value={minOrder}
                    onChange={(e) => setMinOrder(e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Lead time (days)"
                    value={leadTime}
                    onChange={(e) => setLeadTime(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={saveSupplier}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                {editingId ? 'Update Supplier' : 'Add Supplier'}
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

      {/* Suppliers List */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-600" />
            Suppliers ({suppliers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {suppliers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Truck className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No suppliers yet. Add one to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {suppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  className={`p-4 rounded-lg border-2 ${
                    supplier.active ? 'bg-gray-50 border-gray-200' : 'bg-gray-100 border-gray-300 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 text-lg">{supplier.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded font-bold ${
                          supplier.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-300 text-gray-700'
                        }`}>
                          {supplier.active ? '✓ Active' : '⊗ Inactive'}
                        </span>
                      </div>

                      <div className="flex gap-4 mt-2 text-sm text-gray-600">
                        {supplier.contactPerson && (
                          <span>👤 {supplier.contactPerson}</span>
                        )}
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {supplier.phone}
                        </span>
                        {supplier.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {supplier.email}
                          </span>
                        )}
                      </div>

                      {supplier.address && (
                        <p className="text-xs text-gray-600 mt-1">📍 {supplier.address}</p>
                      )}

                      {supplier.paymentTerms && (
                        <p className="text-xs text-gray-600 mt-1">💳 {supplier.paymentTerms}</p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-2">
                        {supplier.items.slice(0, 3).map((item, idx) => (
                          <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {item.itemName}: ${item.pricePerUnit}/{item.unit}
                          </span>
                        ))}
                        {supplier.items.length > 3 && (
                          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                            +{supplier.items.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleSupplierActive(supplier.id)}
                        className={`px-3 py-1 rounded font-semibold text-sm ${
                          supplier.active
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                        }`}
                      >
                        {supplier.active ? '✓ Active' : '⊗ Inactive'}
                      </button>
                      <button
                        onClick={() => editSupplier(supplier)}
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-5 h-5 text-blue-600" />
                      </button>
                      <button
                        onClick={() => deleteSupplier(supplier.id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
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
