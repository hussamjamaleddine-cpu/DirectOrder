import { useState, useEffect } from 'react';
import { store, Recipe, MenuItem, RecipeIngredient } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChefHat, Plus, Trash2, Edit2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function Recipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newRecipe, setNewRecipe] = useState({
    name: '',
    description: '',
    category: 'Mains',
    servings: 1,
    sellingPriceUSD: 0,
    prepTime: 30,
    notes: '',
  });
  const [selectedIngredients, setSelectedIngredients] = useState<RecipeIngredient[]>([]);
  const [selectedMenuItemId, setSelectedMenuItemId] = useState<number | null>(null);
  const [ingredientQuantity, setIngredientQuantity] = useState('');
  const [ingredientUnit, setIngredientUnit] = useState('piece');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setRecipes(store.getRecipes());
    setMenu(store.getMenu());
  };

  const addIngredientToRecipe = () => {
    if (!selectedMenuItemId || !ingredientQuantity) {
      toast.error('Please select item and quantity');
      return;
    }

    const menuItem = menu.find((m) => m.id === selectedMenuItemId);
    if (!menuItem) return;

    const costPerUnit = (menuItem.costLBP || 0) / 89500; // Convert to USD
    const ingredient: RecipeIngredient = {
      menuItemId: selectedMenuItemId,
      itemName: menuItem.name,
      quantity: parseFloat(ingredientQuantity),
      unit: ingredientUnit,
      costPerUnit: costPerUnit,
    };

    setSelectedIngredients([...selectedIngredients, ingredient]);
    setSelectedMenuItemId(null);
    setIngredientQuantity('');
    setIngredientUnit('piece');
  };

  const removeIngredient = (index: number) => {
    setSelectedIngredients(selectedIngredients.filter((_, i) => i !== index));
  };

  const calculateRecipeCost = () => {
    return selectedIngredients.reduce((sum, ing) => sum + ing.quantity * ing.costPerUnit, 0);
  };

  const calculateProfitMargin = () => {
    const totalCost = calculateRecipeCost();
    const sellingPrice = newRecipe.sellingPriceUSD;
    if (sellingPrice === 0) return 0;
    return ((sellingPrice - totalCost) / sellingPrice) * 100;
  };

  const saveRecipe = () => {
    if (!newRecipe.name || selectedIngredients.length === 0 || newRecipe.sellingPriceUSD <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    const totalCost = calculateRecipeCost();
    const costPerServing = totalCost / newRecipe.servings;
    const profitMargin = calculateProfitMargin();

    const recipe: Recipe = {
      id: editingId || `recipe_${Date.now()}`,
      name: newRecipe.name,
      description: newRecipe.description,
      category: newRecipe.category,
      ingredients: selectedIngredients,
      totalCostUSD: totalCost,
      totalCostLBP: totalCost * 89500,
      servings: newRecipe.servings,
      costPerServing: costPerServing,
      sellingPriceUSD: newRecipe.sellingPriceUSD,
      sellingPriceLBP: newRecipe.sellingPriceUSD * 89500,
      profitMargin: profitMargin,
      prepTime: newRecipe.prepTime,
      notes: newRecipe.notes,
      createdAt: editingId ? recipes.find((r) => r.id === editingId)?.createdAt || Date.now() : Date.now(),
      updatedAt: Date.now(),
    };

    let updatedRecipes: Recipe[];
    if (editingId) {
      updatedRecipes = recipes.map((r) => (r.id === editingId ? recipe : r));
    } else {
      updatedRecipes = [...recipes, recipe];
    }

    store.setRecipes(updatedRecipes);
    setRecipes(updatedRecipes);
    resetForm();
    toast.success(editingId ? 'Recipe updated!' : 'Recipe created!');
  };

  const resetForm = () => {
    setNewRecipe({
      name: '',
      description: '',
      category: 'Mains',
      servings: 1,
      sellingPriceUSD: 0,
      prepTime: 30,
      notes: '',
    });
    setSelectedIngredients([]);
    setEditingId(null);
    setShowAddRecipe(false);
  };

  const deleteRecipe = (id: string) => {
    const updatedRecipes = recipes.filter((r) => r.id !== id);
    store.setRecipes(updatedRecipes);
    setRecipes(updatedRecipes);
    toast.success('Recipe deleted');
  };

  const editRecipe = (recipe: Recipe) => {
    setNewRecipe({
      name: recipe.name,
      description: recipe.description || '',
      category: recipe.category,
      servings: recipe.servings,
      sellingPriceUSD: recipe.sellingPriceUSD,
      prepTime: recipe.prepTime,
      notes: recipe.notes || '',
    });
    setSelectedIngredients(recipe.ingredients);
    setEditingId(recipe.id);
    setShowAddRecipe(true);
  };

  const totalCost = calculateRecipeCost();
  const costPerServing = newRecipe.servings > 0 ? totalCost / newRecipe.servings : 0;
  const profitMargin = calculateProfitMargin();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">👨‍🍳 Recipe Management</h2>
        <p className="text-gray-600 mt-1">Create recipes and track production costs</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{recipes.length}</p>
              <p className="text-sm text-gray-600 mt-1">Recipes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-600">
                ${recipes.reduce((sum, r) => sum + r.totalCostUSD, 0).toFixed(2)}
              </p>
              <p className="text-sm text-gray-600 mt-1">Total Recipe Cost</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-600">
                {(recipes.reduce((sum, r) => sum + r.profitMargin, 0) / recipes.length || 0).toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600 mt-1">Avg Profit Margin</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Recipe Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => setShowAddRecipe(!showAddRecipe)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" />
          {editingId ? 'Update Recipe' : 'Create Recipe'}
        </Button>
      </div>

      {/* Recipe Form */}
      {showAddRecipe && (
        <Card className="border-0 shadow-sm bg-emerald-50">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Recipe' : 'Create New Recipe'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Recipe Details */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Recipe name"
                value={newRecipe.name}
                onChange={(e) => setNewRecipe({ ...newRecipe, name: e.target.value })}
              />
              <select
                value={newRecipe.category}
                onChange={(e) => setNewRecipe({ ...newRecipe, category: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="Mezze">Mezze</option>
                <option value="Grills">Grills</option>
                <option value="Mains">Mains</option>
                <option value="Salads">Salads</option>
                <option value="Drinks">Drinks</option>
                <option value="Desserts">Desserts</option>
              </select>
            </div>

            <Input
              placeholder="Description"
              value={newRecipe.description}
              onChange={(e) => setNewRecipe({ ...newRecipe, description: e.target.value })}
            />

            <div className="grid grid-cols-3 gap-4">
              <Input
                type="number"
                placeholder="Servings"
                min="1"
                value={newRecipe.servings}
                onChange={(e) => setNewRecipe({ ...newRecipe, servings: parseInt(e.target.value) || 1 })}
              />
              <Input
                type="number"
                placeholder="Selling Price (USD)"
                step="0.01"
                value={newRecipe.sellingPriceUSD}
                onChange={(e) => setNewRecipe({ ...newRecipe, sellingPriceUSD: parseFloat(e.target.value) })}
              />
              <Input
                type="number"
                placeholder="Prep Time (min)"
                value={newRecipe.prepTime}
                onChange={(e) => setNewRecipe({ ...newRecipe, prepTime: parseInt(e.target.value) })}
              />
            </div>

            {/* Ingredients Section */}
            <div className="border-t pt-4">
              <h3 className="font-bold text-gray-900 mb-3">Ingredients</h3>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <select
                    value={selectedMenuItemId || ''}
                    onChange={(e) => setSelectedMenuItemId(parseInt(e.target.value))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select ingredient...</option>
                    {menu.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    placeholder="Qty"
                    step="0.01"
                    value={ingredientQuantity}
                    onChange={(e) => setIngredientQuantity(e.target.value)}
                    className="w-24"
                  />
                  <select
                    value={ingredientUnit}
                    onChange={(e) => setIngredientUnit(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="piece">piece</option>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="liter">liter</option>
                    <option value="ml">ml</option>
                  </select>
                  <Button
                    onClick={addIngredientToRecipe}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Add
                  </Button>
                </div>

                {selectedIngredients.length > 0 && (
                  <div className="space-y-2">
                    {selectedIngredients.map((ing, idx) => (
                      <div key={idx} className="p-2 bg-white rounded border border-gray-200 flex justify-between items-center">
                        <span className="text-sm">
                          {ing.itemName}: {ing.quantity} {ing.unit} (${(ing.quantity * ing.costPerUnit).toFixed(2)})
                        </span>
                        <button
                          onClick={() => removeIngredient(idx)}
                          className="text-red-600 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Cost Summary */}
            {selectedIngredients.length > 0 && (
              <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-700">Total Cost:</span>
                  <span className="font-bold">${totalCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Cost per Serving:</span>
                  <span className="font-bold">${costPerServing.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Selling Price:</span>
                  <span className="font-bold">${newRecipe.sellingPriceUSD.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-700 font-bold">Profit Margin:</span>
                  <span className={`font-bold ${profitMargin >= 30 ? 'text-emerald-600' : profitMargin >= 20 ? 'text-amber-600' : 'text-red-600'}`}>
                    {profitMargin.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}

            <Input
              placeholder="Notes"
              value={newRecipe.notes}
              onChange={(e) => setNewRecipe({ ...newRecipe, notes: e.target.value })}
            />

            <div className="flex gap-2">
              <Button
                onClick={saveRecipe}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                {editingId ? 'Update Recipe' : 'Create Recipe'}
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

      {/* Recipes List */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-orange-600" />
            Recipes ({recipes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recipes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No recipes yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recipes.map((recipe) => (
                <div key={recipe.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900">{recipe.name}</h3>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {recipe.category}
                        </span>
                      </div>
                      {recipe.description && (
                        <p className="text-sm text-gray-600 mt-1">{recipe.description}</p>
                      )}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm">
                        <div>
                          <p className="text-gray-600">Ingredients</p>
                          <p className="font-bold">{recipe.ingredients.length}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Cost/Serving</p>
                          <p className="font-bold">${recipe.costPerServing.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Selling Price</p>
                          <p className="font-bold">${recipe.sellingPriceUSD.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Profit</p>
                          <p className={`font-bold ${recipe.profitMargin >= 30 ? 'text-emerald-600' : recipe.profitMargin >= 20 ? 'text-amber-600' : 'text-red-600'}`}>
                            {recipe.profitMargin.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => editRecipe(recipe)}
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-5 h-5 text-blue-600" />
                      </button>
                      <button
                        onClick={() => deleteRecipe(recipe.id)}
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
