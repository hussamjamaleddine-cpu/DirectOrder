import { useState, useEffect } from 'react';
import { store, ProductionBatch, Recipe } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function Reports() {
  const [batches, setBatches] = useState<ProductionBatch[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'all'>('month');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setBatches(store.getProductionBatches());
    setRecipes(store.getRecipes());
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

  const filteredBatches = batches.filter((b) => {
    const timeMatch = b.startedAt >= getTimeRangeMs();
    const statusMatch = b.status === 'completed';
    return timeMatch && statusMatch;
  });

  const selectedBatch = batches.find((b) => b.id === selectedBatchId);
  const selectedRecipe = selectedBatch ? recipes.find((r) => r.id === selectedBatch.recipeId) : null;

  const totalCost = filteredBatches.reduce((sum, b) => sum + b.totalCost, 0);
  const totalRevenue = filteredBatches.reduce((sum, b) => sum + b.totalRevenue, 0);
  const totalProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  const generateCSVReport = () => {
    if (filteredBatches.length === 0) {
      toast.error('No batches to export');
      return;
    }

    let csv = 'Batch ID,Recipe Name,Supplier,Quantity,Total Cost,Total Revenue,Profit,Profit Margin %,Status,Date\n';

    filteredBatches.forEach((batch) => {
      const profit = batch.totalRevenue - batch.totalCost;
      const margin = batch.totalRevenue > 0 ? (profit / batch.totalRevenue) * 100 : 0;
      csv += `${batch.id},"${batch.recipeName}","${batch.supplierName || ''}",${batch.quantity},${batch.totalCost.toFixed(2)},${batch.totalRevenue.toFixed(2)},${profit.toFixed(2)},${margin.toFixed(2)},${batch.status},${new Date(batch.startedAt).toISOString()}\n`;
    });

    // Add summary
    csv += '\n\nSUMMARY\n';
    csv += `Total Batches,${filteredBatches.length}\n`;
    csv += `Total Cost,${totalCost.toFixed(2)}\n`;
    csv += `Total Revenue,${totalRevenue.toFixed(2)}\n`;
    csv += `Total Profit,${totalProfit.toFixed(2)}\n`;
    csv += `Profit Margin,${profitMargin.toFixed(2)}%\n`;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', `batch-report-${new Date().toISOString().split('T')[0]}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast.success('Report exported as CSV');
  };

  const generateDetailedReport = (batch: ProductionBatch, recipe: Recipe | undefined) => {
    if (!recipe) {
      toast.error('Recipe not found');
      return;
    }

    let report = `BATCH COSTING REPORT\n`;
    report += `Generated: ${new Date().toLocaleString()}\n\n`;

    report += `BATCH INFORMATION\n`;
    report += `Batch ID: ${batch.id}\n`;
    report += `Recipe: ${batch.recipeName}\n`;
    if (batch.supplierName) report += `Supplier: ${batch.supplierName}\n`;
    report += `Quantity: ${batch.quantity} servings\n`;
    report += `Status: ${batch.status}\n`;
    report += `Date: ${new Date(batch.startedAt).toLocaleString()}\n\n`;

    report += `INGREDIENT BREAKDOWN\n`;
    report += `Item Name,Quantity,Unit,Cost Per Unit,Total Cost\n`;
    batch.ingredientsUsed.forEach((ing) => {
      const costPerUnit = ing.costUsed / ing.quantityUsed;
      report += `"${ing.itemName}",${ing.quantityUsed},unit,${costPerUnit.toFixed(2)},${ing.costUsed.toFixed(2)}\n`;
    });

    report += `\nCOST ANALYSIS\n`;
    report += `Total Ingredient Cost,${batch.totalCost.toFixed(2)}\n`;
    report += `Cost Per Serving,${(batch.totalCost / batch.quantity).toFixed(2)}\n`;
    report += `Selling Price Per Serving,${(batch.totalRevenue / batch.quantity).toFixed(2)}\n`;
    report += `Total Revenue,${batch.totalRevenue.toFixed(2)}\n`;
    report += `Total Profit,${(batch.totalRevenue - batch.totalCost).toFixed(2)}\n`;

    const profitMargin = batch.totalRevenue > 0 ? ((batch.totalRevenue - batch.totalCost) / batch.totalRevenue) * 100 : 0;
    report += `Profit Margin,${profitMargin.toFixed(2)}%\n`;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(report));
    element.setAttribute('download', `batch-report-${batch.id}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast.success('Detailed report exported');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">📊 Batch Costing Reports</h2>
        <p className="text-gray-600 mt-1">Generate and export production reports</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{filteredBatches.length}</p>
              <p className="text-sm text-gray-600 mt-1">Completed Batches</p>
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
              <p className="text-3xl font-bold text-emerald-600">${totalRevenue.toFixed(2)}</p>
              <p className="text-sm text-gray-600 mt-1">Total Revenue</p>
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

      {/* Filters and Export */}
      <div className="flex gap-2 flex-wrap items-center">
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
        <Button
          onClick={generateCSVReport}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
        >
          <Download className="w-4 h-4 mr-2" />
          Export All as CSV
        </Button>
      </div>

      {/* Profit Margin Indicator */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-emerald-50 to-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Overall Profit Margin</p>
              <p className="text-4xl font-bold text-emerald-600 mt-2">{profitMargin.toFixed(1)}%</p>
            </div>
            <TrendingUp className="w-16 h-16 text-emerald-200" />
          </div>
        </CardContent>
      </Card>

      {/* Batch Selection and Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Batch List */}
        <Card className="border-0 shadow-sm md:col-span-1">
          <CardHeader>
            <CardTitle>Completed Batches</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredBatches.length === 0 ? (
              <p className="text-sm text-gray-600">No batches found</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredBatches
                  .sort((a, b) => b.startedAt - a.startedAt)
                  .map((batch) => (
                    <button
                      key={batch.id}
                      onClick={() => setSelectedBatchId(batch.id)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                        selectedBatchId === batch.id
                          ? 'bg-blue-100 border-blue-500'
                          : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <p className="font-bold text-sm">{batch.recipeName}</p>
                      <p className="text-xs text-gray-600">Qty: {batch.quantity}</p>
                      <p className="text-xs text-emerald-600 font-bold">
                        ${(batch.totalRevenue - batch.totalCost).toFixed(2)} profit
                      </p>
                    </button>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Batch Details */}
        {selectedBatch && selectedRecipe && (
          <Card className="border-0 shadow-sm md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{selectedBatch.recipeName}</span>
                <Button
                  onClick={() => generateDetailedReport(selectedBatch, selectedRecipe)}
                  className="bg-green-600 hover:bg-green-700 text-white text-sm"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Export Details
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Batch ID</p>
                  <p className="font-bold text-gray-900">{selectedBatch.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Quantity</p>
                  <p className="font-bold text-gray-900">{selectedBatch.quantity} servings</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-bold text-gray-900">{new Date(selectedBatch.startedAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-bold text-emerald-600 capitalize">{selectedBatch.status}</p>
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Ingredients Used</h3>
                <div className="space-y-2">
                  {selectedBatch.ingredientsUsed.map((ing, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded border border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">{ing.itemName}</span>
                        <span className="font-bold text-gray-900">${ing.costUsed.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Qty: {ing.quantityUsed}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cost Analysis */}
              <div className="border-t pt-4">
                <h3 className="font-bold text-gray-900 mb-3">Cost Analysis</h3>
                <div className="space-y-2">
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>Total Ingredient Cost</span>
                    <span className="font-bold">${selectedBatch.totalCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>Cost Per Serving</span>
                    <span className="font-bold">${(selectedBatch.totalCost / selectedBatch.quantity).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-blue-50 rounded border border-blue-200">
                    <span>Selling Price Per Serving</span>
                    <span className="font-bold text-blue-600">
                      ${(selectedBatch.totalRevenue / selectedBatch.quantity).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 bg-emerald-50 rounded border border-emerald-200">
                    <span>Total Revenue</span>
                    <span className="font-bold text-emerald-600">${selectedBatch.totalRevenue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-emerald-100 rounded border-2 border-emerald-300">
                    <span className="font-bold">Total Profit</span>
                    <span className="font-bold text-emerald-700">
                      ${(selectedBatch.totalRevenue - selectedBatch.totalCost).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-amber-100 rounded border-2 border-amber-300">
                    <span className="font-bold">Profit Margin</span>
                    <span className="font-bold text-amber-700">
                      {selectedBatch.totalRevenue > 0
                        ? (((selectedBatch.totalRevenue - selectedBatch.totalCost) / selectedBatch.totalRevenue) * 100).toFixed(1)
                        : '0'}
                      %
                    </span>
                  </div>
                </div>
              </div>

              {selectedBatch.notes && (
                <div className="border-t pt-4">
                  <h3 className="font-bold text-gray-900 mb-2">Notes</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{selectedBatch.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {!selectedBatch && (
          <Card className="border-0 shadow-sm md:col-span-2 bg-gray-50">
            <CardContent className="pt-6 text-center">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-gray-600">Select a batch to view detailed costing</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
