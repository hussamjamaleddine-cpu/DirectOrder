import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { store, RestaurantSettings } from '@/lib/store';
import { toast } from 'sonner';

export default function Settings() {
  const [settings, setSettings] = useState<RestaurantSettings>(store.getSettings());
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field: keyof RestaurantSettings, value: any) => {
    setSettings({ ...settings, [field]: value });
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!settings.name.trim()) {
      toast.error('Restaurant name is required');
      return;
    }
    store.setSettings(settings);
    setHasChanges(false);
    toast.success('Settings saved successfully');
  };

  const handleReset = () => {
    setSettings(store.getSettings());
    setHasChanges(false);
  };

  const handleClearAllData = () => {
    if (
      confirm(
        'Are you sure you want to clear ALL data? This includes orders, customers, menu, and settings. This action cannot be undone!'
      )
    ) {
      store.clear();
      toast.success('All data cleared. Refreshing...');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const businessTypeDescriptions = {
    restaurant: '🍽️ Restaurant - Full customization with add-ons and special requests',
    grocery: '🛒 Grocery/Mini Market - Simple ordering without customization',
    butchery: '🥩 Butchery - Basic items with optional special requests',
    market: '🏪 Market - General retail with standard ordering',
    retail: '🛍️ Retail - Any retail business with simple ordering',
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Business Type */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle>Business Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Select your business type to enable appropriate features
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(['restaurant', 'grocery', 'butchery', 'market', 'retail'] as const).map((type) => (
              <button
                key={type}
                onClick={() => handleChange('businessType', type)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  settings.businessType === type
                    ? 'border-blue-600 bg-blue-100'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <p className="font-semibold text-gray-900">
                  {businessTypeDescriptions[type].split(' - ')[0]}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {businessTypeDescriptions[type].split(' - ')[1]}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Customization Features */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-emerald-50 to-teal-50">
        <CardHeader>
          <CardTitle>Customization Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Enable or disable features for your business type
          </p>

          {/* Add-ons Toggle */}
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
            <div>
              <p className="font-semibold text-gray-900">Add-ons/Extras</p>
              <p className="text-xs text-gray-600 mt-1">
                Allow customers to add extras (e.g., extra sauce, larger size)
              </p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableAddons}
                onChange={(e) => handleChange('enableAddons', e.target.checked)}
                className="w-5 h-5"
              />
              <span className="ml-2 text-sm font-semibold text-gray-700">
                {settings.enableAddons ? '✓ Enabled' : '✗ Disabled'}
              </span>
            </label>
          </div>

          {/* Special Requests Toggle */}
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
            <div>
              <p className="font-semibold text-gray-900">Special Requests</p>
              <p className="text-xs text-gray-600 mt-1">
                Allow customers to add special instructions (e.g., no onions, well done)
              </p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableSpecialRequests}
                onChange={(e) => handleChange('enableSpecialRequests', e.target.checked)}
                className="w-5 h-5"
              />
              <span className="ml-2 text-sm font-semibold text-gray-700">
                {settings.enableSpecialRequests ? '✓ Enabled' : '✗ Disabled'}
              </span>
            </label>
          </div>

          {/* Feature Recommendations */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs font-semibold text-amber-900 mb-2">💡 Recommended for your business:</p>
            <ul className="text-xs text-amber-800 space-y-1">
              {settings.businessType === 'restaurant' && (
                <>
                  <li>✓ Add-ons: Enabled (for size/sauce options)</li>
                  <li>✓ Special Requests: Enabled (for dietary preferences)</li>
                </>
              )}
              {settings.businessType === 'grocery' && (
                <>
                  <li>✗ Add-ons: Disabled (simple products)</li>
                  <li>✗ Special Requests: Disabled (standard items)</li>
                </>
              )}
              {settings.businessType === 'butchery' && (
                <>
                  <li>✗ Add-ons: Disabled (meat cuts)</li>
                  <li>✓ Special Requests: Enabled (cut type, thickness)</li>
                </>
              )}
              {settings.businessType === 'market' && (
                <>
                  <li>✗ Add-ons: Disabled (standard products)</li>
                  <li>✗ Special Requests: Disabled (basic ordering)</li>
                </>
              )}
              {settings.businessType === 'retail' && (
                <>
                  <li>✗ Add-ons: Disabled (standard items)</li>
                  <li>✗ Special Requests: Disabled (simple ordering)</li>
                </>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Restaurant Info */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
            <Input
              value={settings.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Your Business Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <Input
              value={settings.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Business Address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <Input
              value={settings.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+961 1 234 5678"
            />
          </div>
        </CardContent>
      </Card>

      {/* Financial Settings */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Financial Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exchange Rate (LBP per USD)</label>
            <Input
              type="number"
              value={settings.exchangeRate}
              onChange={(e) => handleChange('exchangeRate', parseFloat(e.target.value))}
              placeholder="89500"
            />
            <p className="text-xs text-gray-600 mt-1">
              Used to convert between USD and LBP pricing
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">VAT Percentage (%)</label>
            <Input
              type="number"
              step="0.1"
              value={settings.vatPercentage}
              onChange={(e) => handleChange('vatPercentage', parseFloat(e.target.value))}
              placeholder="11"
            />
            <p className="text-xs text-gray-600 mt-1">
              Applied to all orders in the POS system
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-900">
              ⚠️ <strong>Important:</strong> In a production environment, PINs should be hashed and encrypted. 
              This demo version stores them in plain text for simplicity.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Owner PIN</label>
            <Input
              type="password"
              value={settings.ownerPIN.replace('hashed_', '')}
              onChange={(e) => handleChange('ownerPIN', e.target.value)}
              placeholder="1111"
              disabled
            />
            <p className="text-xs text-gray-600 mt-1">Demo PIN: 1111</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Manager PIN</label>
            <Input
              type="password"
              value={settings.managerPIN.replace('hashed_', '')}
              onChange={(e) => handleChange('managerPIN', e.target.value)}
              placeholder="2222"
              disabled
            />
            <p className="text-xs text-gray-600 mt-1">Demo PIN: 2222</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Staff PIN</label>
            <Input
              type="password"
              value={settings.staffPIN.replace('hashed_', '')}
              onChange={(e) => handleChange('staffPIN', e.target.value)}
              placeholder="3333"
              disabled
            />
            <p className="text-xs text-gray-600 mt-1">Demo PIN: 3333</p>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              💾 All data is stored locally in your browser's localStorage. 
              Clearing browser data will delete everything.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Storage Status:</p>
            <div className="text-xs text-gray-600 space-y-1">
              <p>Orders: {store.getOrders().length} records</p>
              <p>Customers: {store.getCustomers().length} records</p>
              <p>Menu Items: {store.getMenu().length} records</p>
            </div>
          </div>

          <Button
            onClick={handleClearAllData}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            🗑️ Clear All Data
          </Button>
        </CardContent>
      </Card>

      {/* Save Buttons */}
      <div className="flex gap-3 sticky bottom-4">
        <Button
          onClick={handleSave}
          disabled={!hasChanges}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3"
        >
          ✓ Save Changes
        </Button>
        <Button
          onClick={handleReset}
          disabled={!hasChanges}
          variant="outline"
          className="flex-1 py-3"
        >
          ↻ Reset
        </Button>
      </div>

      {/* Info Section */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-emerald-50 to-blue-50">
        <CardHeader>
          <CardTitle className="text-base">About DirectOrder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-700">
          <p>
            <strong>Version:</strong> 1.0.0 (Modern React Edition)
          </p>
          <p>
            <strong>Built with:</strong> React 19 + Tailwind CSS 4 + shadcn/ui
          </p>
          <p>
            <strong>Data Storage:</strong> Browser localStorage (local only)
          </p>
          <p className="text-xs text-gray-600 mt-3">
            DirectOrder is a flexible restaurant and retail management system designed for restaurants, grocery stores, butcheries, markets, and any retail business. 
            Configure it for your business type and enable only the features you need.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
