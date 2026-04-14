import { useState, useEffect } from 'react';
import { store, Recipe, ProductionBatch, MenuItem, Supplier } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Factory, Plus, Trash2, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function Production() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [batches, setBatches] = useState<ProductionBatch[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showAddBatch, setShowAddBatch] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setRecipes(store.getRecipes());
    setBatches(store.getProductionBatches());
    setMenu(store.getMenu());
    setSuppliers(store.getSuppliers());
  };

  const startProduction = () => {
    if (!selectedRecipeId || !quantity) {
      toast.error('Please select recipe and quantity');
      return;
    }

    const recipe = recipes.find((r) => r.id === selectedRecipeId);
    if (!recipe) return;

    const supplier = suppliers.find((s) => s.id === selectedSupplierId);

    const quantityNum = parseInt(quantity);
    const totalCost = (recipe.costPerServing * quantityNum);
    const totalRevenue = (recipe.sellingPriceUSD * quantityNum);

    const batch: ProductionBatch = {
      id: `batch_${Date.now()}`,
      recipeId: recipe.id,
      recipeName: recipe.name,
      supplierId: supplier?.id,
      supplierName: supplier?.name,
      quantity: quantityNum,
      totalCost: totalCost,
      totalRevenue: totalRevenue,
      status: 'planned',
      startedAt: Date.now(),
      ingredientsUsed: recipe.ingredients.map((ing) => ({
        menuItemId: ing.menuItemId,
        itemName: ing.itemName,
        quantityUsed: ing.quantity * quantityNum,
        costUsed: ing.quantity * ing.costPerUnit * quantityNum,
      })),
      notes: notes || undefined,
    };

    const updatedBatches = [...batches, batch];
    store.setProductionBatches(updatedBatches);
    setBatches(updatedBatches);

    // Deduct from inventory
    const updatedMenu = menu.map((item) => {
      const ingredientUsed = batch.ingredientsUsed.find((i) => i.menuItemId === item.id);
      if (ingredientUsed) {
        return {
          ...item,
          stock: Math.max(0, (item.stock || 0) - ingredientUsed.quantityUsed),
        };
      }
      return item;
    });
    store.setMenu(updatedMenu);
    setMenu(updatedMenu);

    resetForm();
    toast.success('Production batch created!');
  };

  const resetForm = () => {
    setSelectedRecipeId(null);
    setSelectedSupplierId(null);
    setQuantity('1');
    setNotes('');
    setShowAddBatch(false);
  };

  const updateBatchStatus = (batchId: string, status: 'in-progress' | 'completed' | 'cancelled') => {
    const updatedBatches = batches.map((b) =>
      b.id === batchId
        ? {
            ...b,
            status,
            completedAt: status === 'completed' ? Date.now() : b.completedAt,
          }
        : b
    );
    store.setProductionBatches(updatedBatches);
    setBatches(updatedBatches);
    toast.success(`Batch marked as ${status}`);
  };

  const deleteBatch = (id: string) => {
    const batch = batches.find((b) => b.id === id);
    if (!batch) return;

    // Restore inventory
    const updatedMenu = menu.map((item) => {
      const ingredientUsed = batch.ingredientsUsed.find((i) => i.menuItemId === item.id);
      if (ingredientUsed) {
        return {
          ...item,
          stock: (item.stock || 0) + ingredientUsed.quantityUsed,
        };
      }
      return item;
    });
    store.setMenu(updatedMenu);
    setMenu(updatedMenu);

    const updatedBatches = batches.filter((b) => b.id !== id);
    store.setProductionBatches(updatedBatches);
    setBatches(updatedBatches);
    toast.success('Batch deleted and inventory restored');
  };

  const getActiveBatches = () => batches.filter((b) => b.status !== 'completed' && b.status !== 'cancelled');
  const getCompletedBatches = () => batches.filter((b) => b.status === 'completed');

  const totalProduced = batches
    .filter((b) => b.status === 'completed')
    .reduce((sum, b) => sum + b.totalRevenue, 0);
  const totalCost = batches
    .filter((b) => b.status === 'completed')
    .reduce((sum, b) => sum + b.totalCost, 0);
  const totalProfit = totalProduced - totalCost;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">🏭 Production Tracking</h2>
        <p className="text-gray-600 mt-1">Manage production batches and track costs</p>
      </div>

      {/* Production Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{getActiveBatches().length}</p>
              <p className="text-sm text-gray-600 mt-1">Active Batches</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-600">${totalProduced.toFixed(2)}</p>
              <p className="text-sm text-gray-600 mt-1">Total Produced</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">${totalCost.toFixed(2)}</p>
              <p className="text-sm text-gray-600 mt-1">Total Cost</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className={`text-3xl font-bold ${totalProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                ${totalProfit.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600 mt-1">Total Profit</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Batch Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => setShowAddBatch(!showAddBatch)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Start Production
        </Button>
      </div>

      {/* Add Batch Form */}
      {showAddBatch && (
        <Card className="border-0 shadow-sm bg-emerald-50">
          <CardHeader>
            <CardTitle>Start Production Batch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Recipe</label>
                <select
                  value={selectedRecipeId || ''}
                  onChange={(e) => setSelectedRecipeId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select recipe...</option>
                  {recipes.map((recipe) => (
                    <option key={recipe.id} value={recipe.id}>
                      {recipe.name} (${recipe.sellingPriceUSD}/serving)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Supplier (Optional)</label>
                <select
                  value={selectedSupplierId || ''}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select supplier...</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedRecipeId && (
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                {recipes.find((r) => r.id === selectedRecipeId) && (
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Ingredients:</strong>{' '}
                      {recipes.find((r) => r.id === selectedRecipeId)?.ingredients.length}
                    </p>
                    <p>
                      <strong>Cost per Serving:</strong> $
                      {recipes.find((r) => r.id === selectedRecipeId)?.costPerServing.toFixed(2)}
                    </p>
                    <p>
                      <strong>Selling Price:</strong> $
                      {recipes.find((r) => r.id === selectedRecipeId)?.sellingPriceUSD.toFixed(2)}
                    </p>
                    <p>
                      <strong>Profit per Serving:</strong> $
                      {(
                        (recipes.find((r) => r.id === selectedRecipeId)?.sellingPriceUSD || 0) -
                        (recipes.find((r) => r.id === selectedRecipeId)?.costPerServing || 0)
                      ).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            )}

            <Input
              type="number"
              placeholder="Quantity (servings)"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />

            {selectedRecipeId && quantity && (
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                {recipes.find((r) => r.id === selectedRecipeId) && (
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Total Cost:</strong> $
                      {(
                        (recipes.find((r) => r.id === selectedRecipeId)?.costPerServing || 0) *
                        parseInt(quantity)
                      ).toFixed(2)}
                    </p>
                    <p>
                      <strong>Total Revenue:</strong> $
                      {(
                        (recipes.find((r) => r.id === selectedRecipeId)?.sellingPriceUSD || 0) *
                        parseInt(quantity)
                      ).toFixed(2)}
                    </p>
                    <p className="font-bold text-emerald-600">
                      <strong>Expected Profit:</strong> $
                      {(
                        ((recipes.find((r) => r.id === selectedRecipeId)?.sellingPriceUSD || 0) -
                          (recipes.find((r) => r.id === selectedRecipeId)?.costPerServing || 0)) *
                        parseInt(quantity)
                      ).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            )}

            <Input
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <div className="flex gap-2">
              <Button
                onClick={startProduction}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                Start Batch
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

      {/* Active Batches */}
      {getActiveBatches().length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Active Batches ({getActiveBatches().length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getActiveBatches().map((batch) => (
                <div key={batch.id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{batch.recipeName}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Quantity: {batch.quantity} servings | Cost: ${batch.totalCost.toFixed(2)} | Revenue: ${batch.totalRevenue.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(batch.startedAt).toLocaleString()}
                        {batch.supplierName && ` · Supplier: ${batch.supplierName}`}
                      </p>
                      {batch.notes && <p className="text-xs text-gray-600 mt-1">📝 {batch.notes}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateBatchStatus(batch.id, 'in-progress')}
                        className={`px-3 py-1 rounded font-semibold text-sm ${
                          batch.status === 'in-progress'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-gray-200 text-gray-700 hover:bg-amber-100'
                        }`}
                      >
                        ⏳ In Progress
                      </button>
                      <button
                        onClick={() => updateBatchStatus(batch.id, 'completed')}
                        className="px-3 py-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded font-semibold text-sm"
                      >
                        ✓ Complete
                      </button>
                      <button
                        onClick={() => deleteBatch(batch.id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Batches */}
      {getCompletedBatches().length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              Completed Batches ({getCompletedBatches().length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getCompletedBatches().map((batch) => (
                <div key={batch.id} className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{batch.recipeName}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Quantity: {batch.quantity} servings | Cost: ${batch.totalCost.toFixed(2)} | Revenue: ${batch.totalRevenue.toFixed(2)}
                      </p>
                      <p className="text-sm font-bold text-emerald-600 mt-2">
                        Profit: ${(batch.totalRevenue - batch.totalCost).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Completed: {batch.completedAt ? new Date(batch.completedAt).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteBatch(batch.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {batches.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Factory className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No production batches yet</p>
        </div>
      )}
    </div>
  );
}
