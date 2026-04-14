import { useState, useEffect } from 'react';
import { store, Customer, LoyaltyReward } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Gift, Star, TrendingUp, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function Loyalty() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [settings, setSettings] = useState(store.getSettings());
  const [newReward, setNewReward] = useState({
    name: '',
    pointsRequired: 0,
    discount: 0,
    description: '',
  });
  const [showAddReward, setShowAddReward] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setCustomers(store.getCustomers());
    setRewards(store.getLoyaltyRewards());
    setSettings(store.getSettings());
  };

  const addReward = () => {
    if (!newReward.name || newReward.pointsRequired <= 0) {
      toast.error('Please fill in all fields');
      return;
    }

    const reward: LoyaltyReward = {
      id: `reward_${Date.now()}`,
      name: newReward.name,
      pointsRequired: newReward.pointsRequired,
      discount: newReward.discount || undefined,
      description: newReward.description,
    };

    const updatedRewards = [...rewards, reward];
    store.setLoyaltyRewards(updatedRewards);
    setRewards(updatedRewards);
    setNewReward({ name: '', pointsRequired: 0, discount: 0, description: '' });
    setShowAddReward(false);
    toast.success('Reward added!');
  };

  const deleteReward = (id: string) => {
    const updatedRewards = rewards.filter((r) => r.id !== id);
    store.setLoyaltyRewards(updatedRewards);
    setRewards(updatedRewards);
    toast.success('Reward deleted');
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return 'bg-amber-100 text-amber-800';
      case 'silver':
        return 'bg-gray-100 text-gray-800';
      case 'gold':
        return 'bg-yellow-100 text-yellow-800';
      case 'platinum':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return '🥉';
      case 'silver':
        return '🥈';
      case 'gold':
        return '🥇';
      case 'platinum':
        return '💎';
      default:
        return '⭐';
    }
  };

  const updatePointsPerDollar = (value: number) => {
    const updatedSettings = { ...settings, pointsPerDollar: value };
    store.setSettings(updatedSettings);
    setSettings(updatedSettings);
    toast.success('Points per dollar updated!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">🎁 Loyalty Program</h2>
        <p className="text-gray-600 mt-1">Manage customer rewards and tier benefits</p>
      </div>

      {/* Settings */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Loyalty Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <label className="text-sm font-semibold text-gray-700">Enable Loyalty Program</label>
            <input
              type="checkbox"
              checked={settings.loyaltyEnabled}
              onChange={(e) => {
                const updatedSettings = { ...settings, loyaltyEnabled: e.target.checked };
                store.setSettings(updatedSettings);
                setSettings(updatedSettings);
              }}
              className="w-5 h-5 cursor-pointer"
            />
          </div>

          {settings.loyaltyEnabled && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Points per $1 USD</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={settings.pointsPerDollar}
                  onChange={(e) => updatePointsPerDollar(parseFloat(e.target.value))}
                  className="flex-1"
                />
                <span className="px-4 py-2 bg-gray-100 rounded text-sm font-semibold text-gray-700">
                  {settings.pointsPerDollar} pts/$
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tier Information */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { tier: 'bronze', minOrders: 0, benefit: '1x Points' },
          { tier: 'silver', minOrders: 5, benefit: '1.25x Points' },
          { tier: 'gold', minOrders: 15, benefit: '1.5x Points' },
          { tier: 'platinum', minOrders: 30, benefit: '2x Points' },
        ].map((t) => (
          <Card key={t.tier} className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl mb-2">{getTierIcon(t.tier)}</p>
                <p className="font-bold text-gray-900 capitalize">{t.tier}</p>
                <p className="text-xs text-gray-600 mt-1">{t.minOrders}+ orders</p>
                <p className="text-sm font-semibold text-emerald-600 mt-2">{t.benefit}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rewards Management */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-amber-600" />
            Rewards Catalog
          </CardTitle>
          <Button
            onClick={() => setShowAddReward(!showAddReward)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Reward
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {showAddReward && (
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 space-y-3">
              <Input
                placeholder="Reward name (e.g., $5 Discount)"
                value={newReward.name}
                onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Points required"
                value={newReward.pointsRequired}
                onChange={(e) => setNewReward({ ...newReward, pointsRequired: parseInt(e.target.value) })}
              />
              <Input
                type="number"
                placeholder="Discount amount ($)"
                value={newReward.discount}
                onChange={(e) => setNewReward({ ...newReward, discount: parseFloat(e.target.value) })}
              />
              <Input
                placeholder="Description"
                value={newReward.description}
                onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
              />
              <div className="flex gap-2">
                <Button
                  onClick={addReward}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  Create Reward
                </Button>
                <Button
                  onClick={() => setShowAddReward(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {rewards.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Gift className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No rewards yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rewards.map((reward) => (
                <div key={reward.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">{reward.name}</p>
                    <p className="text-sm text-gray-600">{reward.description}</p>
                    <div className="flex gap-3 mt-2">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-semibold">
                        ⭐ {reward.pointsRequired} pts
                      </span>
                      {reward.discount && (
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-semibold">
                          💰 ${reward.discount}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteReward(reward.id)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Loyalty Customers */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-600" />
            Top Loyalty Customers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No customers yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {customers
                .sort((a, b) => b.loyaltyPoints - a.loyaltyPoints)
                .slice(0, 10)
                .map((customer) => (
                  <div key={customer.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900">{customer.name}</p>
                      <p className="text-xs text-gray-600">{customer.phone}</p>
                      <p className="text-sm text-gray-600 mt-1">Orders: {customer.totalOrders}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getTierColor(customer.loyaltyTier)}`}>
                        {getTierIcon(customer.loyaltyTier)} {customer.loyaltyTier.toUpperCase()}
                      </span>
                      <p className="text-lg font-bold text-emerald-600 mt-2">{customer.loyaltyPoints} pts</p>
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
