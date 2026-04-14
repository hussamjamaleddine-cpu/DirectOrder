import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { store, MenuItem } from '@/lib/store';
import { Plus, Edit2, Trash2, AlertCircle, Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';

export default function Menu() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    emoji: '',
    photo: '',
    category: '',
    priceLBP: 0,
    priceUSD: 0,
    costLBP: 0,
    stock: 0,
    lowStockAlert: 0,
    prepTime: 10,
    variants: [],
    addons: [],
    allergens: [],
    visibility: 'both',
    status: 'available',
    allowAddons: true,
    allowSpecialRequests: true,
  });

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = () => {
    const menuData = store.getMenu();
    const catsData = store.getCategories();
    setMenu(menuData);
    setCategories(catsData);
    if (catsData.length > 0) {
      setSelectedCategory(catsData[0]);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setFormData({ ...formData, photo: base64 });
        setPreviewImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveItem = () => {
    if (!formData.name || !formData.category || !formData.priceLBP) {
      toast.error('Please fill in all required fields');
      return;
    }

    let updatedMenu: MenuItem[];
    if (editingItem) {
      updatedMenu = menu.map((item) =>
        item.id === editingItem.id
          ? { ...item, ...formData, id: editingItem.id }
          : item
      ) as MenuItem[];
    } else {
      const newItem: MenuItem = {
        id: Math.max(...menu.map((m) => m.id), 0) + 1,
        name: formData.name!,
        category: formData.category!,
        description: formData.description || '',
        emoji: formData.emoji || '',
        photo: formData.photo || '',
        priceLBP: formData.priceLBP!,
        priceUSD: formData.priceUSD || 0,
        costLBP: formData.costLBP || 0,
        stock: formData.stock || 0,
        lowStockAlert: formData.lowStockAlert || 0,
        prepTime: formData.prepTime || 10,
        variants: formData.variants || [],
        addons: formData.addons || [],
        allergens: formData.allergens || [],
        visibility: formData.visibility || 'both',
        status: formData.status || 'available',
        allowAddons: formData.allowAddons !== false,
        allowSpecialRequests: formData.allowSpecialRequests !== false,
      };
      updatedMenu = [...menu, newItem];
    }

    setMenu(updatedMenu);
    store.setMenu(updatedMenu);
    toast.success(editingItem ? 'Item updated' : 'Item added');
    resetForm();
  };

  const handleDeleteItem = (id: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      const updatedMenu = menu.filter((item) => item.id !== id);
      setMenu(updatedMenu);
      store.setMenu(updatedMenu);
      toast.success('Item deleted');
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setShowForm(false);
    setPreviewImage('');
    setFormData({
      name: '',
      description: '',
      emoji: '',
      photo: '',
      category: '',
      priceLBP: 0,
      priceUSD: 0,
      costLBP: 0,
      stock: 0,
      lowStockAlert: 0,
      prepTime: 10,
      variants: [],
      addons: [],
      allergens: [],
      visibility: 'both',
      status: 'available',
      allowAddons: true,
      allowSpecialRequests: true,
    });
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setFormData(item);
    setPreviewImage(item.photo || '');
    setShowForm(true);
  };

  const filteredMenu = selectedCategory
    ? menu.filter((item) => item.category === selectedCategory)
    : menu;

  const settings = store.getSettings();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">🍽️ Menu Management</h2>
          <p className="text-gray-600 mt-1">Manage your menu items, prices, and photos</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMenu.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg">No items in this category</p>
          </div>
        ) : (
          filteredMenu.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Item Image */}
              <div className="relative h-40 bg-gray-200 overflow-hidden">
                {item.photo ? (
                  <img
                    src={item.photo}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <span className="text-5xl">{item.emoji || '🍽️'}</span>
                  </div>
                )}
                {item.status === '86' && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">OUT OF STOCK</span>
                  </div>
                )}
              </div>

              {/* Item Info */}
              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                  )}
                </div>

                {/* Pricing */}
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-600">Price</p>
                    <p className="font-bold text-emerald-600">
                      {item.priceLBP.toLocaleString()} LBP
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Stock</p>
                    <p className={`font-bold ${item.stock && item.stock <= (item.lowStockAlert || 5) ? 'text-red-600' : 'text-gray-900'}`}>
                      {item.stock || 0} units
                    </p>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                    item.status === 'available'
                      ? 'bg-green-100 text-green-700'
                      : item.status === '86'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {item.status === 'available' ? '✓ Available' : item.status === '86' ? '✗ Out of Stock' : '🙈 Hidden'}
                  </span>
                  {item.variants.length > 0 && (
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold">
                      {item.variants.length} variants
                    </span>
                  )}
                  {item.addons.length > 0 && settings.enableAddons && (
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 font-semibold">
                      {item.addons.length} add-ons
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleEditItem(item)}
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDeleteItem(item.id)}
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex items-center justify-between flex-row">
              <CardTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</CardTitle>
              <button
                onClick={() => resetForm()}
                className="text-2xl text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📷 Item Photo
                </label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-emerald-500 transition-colors">
                      <div className="text-center">
                        <ImageIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">Click to upload image</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {previewImage && (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => {
                          setPreviewImage('');
                          setFormData({ ...formData, photo: '' });
                        }}
                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Item Name *
                  </label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Hummus Beiruti"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Emoji 🎨
                  </label>
                  <Input
                    value={formData.emoji || ''}
                    onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                    placeholder="e.g., 🫘"
                    maxLength={2}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Item description"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Category & Pricing */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Price (LBP) *
                  </label>
                  <Input
                    type="number"
                    value={formData.priceLBP || 0}
                    onChange={(e) => setFormData({ ...formData, priceLBP: parseFloat(e.target.value) })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Price (USD)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.priceUSD || 0}
                    onChange={(e) => setFormData({ ...formData, priceUSD: parseFloat(e.target.value) })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Cost (LBP)
                  </label>
                  <Input
                    type="number"
                    value={formData.costLBP || 0}
                    onChange={(e) => setFormData({ ...formData, costLBP: parseFloat(e.target.value) })}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Stock & Status */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Stock
                  </label>
                  <Input
                    type="number"
                    value={formData.stock || 0}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Low Stock Alert
                  </label>
                  <Input
                    type="number"
                    value={formData.lowStockAlert || 0}
                    onChange={(e) => setFormData({ ...formData, lowStockAlert: parseInt(e.target.value) })}
                    placeholder="5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Prep Time (min)
                  </label>
                  <Input
                    type="number"
                    value={formData.prepTime || 10}
                    onChange={(e) => setFormData({ ...formData, prepTime: parseInt(e.target.value) })}
                    placeholder="10"
                  />
                </div>
              </div>

              {/* Status & Visibility */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status || 'available'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="available">✓ Available</option>
                    <option value="86">✗ Out of Stock</option>
                    <option value="hidden">🙈 Hidden</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Visibility
                  </label>
                  <select
                    value={formData.visibility || 'both'}
                    onChange={(e) => setFormData({ ...formData, visibility: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="both">Both (POS + Online)</option>
                    <option value="pos">POS Only</option>
                    <option value="online">Online Only</option>
                  </select>
                </div>
              </div>

              {/* Customization Toggles */}
              {settings.enableAddons && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <label className="text-sm font-semibold text-gray-700">Allow Add-ons</label>
                  <input
                    type="checkbox"
                    checked={formData.allowAddons !== false}
                    onChange={(e) => setFormData({ ...formData, allowAddons: e.target.checked })}
                    className="w-4 h-4"
                  />
                </div>
              )}

              {settings.enableSpecialRequests && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <label className="text-sm font-semibold text-gray-700">Allow Special Requests</label>
                  <input
                    type="checkbox"
                    checked={formData.allowSpecialRequests !== false}
                    onChange={(e) => setFormData({ ...formData, allowSpecialRequests: e.target.checked })}
                    className="w-4 h-4"
                  />
                </div>
              )}

              {/* Save Button */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                  onClick={handleSaveItem}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3"
                >
                  ✓ Save Item
                </Button>
                <Button
                  onClick={() => resetForm()}
                  variant="outline"
                  className="flex-1 py-3"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
