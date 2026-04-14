import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'owner' | 'manager' | 'staff'>('owner');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    
    if (pin.length !== 4) {
      setError('PIN must be 4 digits');
      setLoading(false);
      return;
    }

    const success = login(selectedRole, pin);
    if (!success) {
      setError('Invalid PIN');
      setPin('');
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center p-4">
      {/* Background accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-100 rounded-full blur-3xl opacity-20"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-full mb-4">
            <span className="text-2xl">🍽️</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 font-sora">DirectOrder</h1>
          <p className="text-gray-600 mt-1 text-sm">Restaurant Management System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
              Select Your Role
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'owner', label: '👑', name: 'Owner' },
                { value: 'manager', label: '👨‍💼', name: 'Manager' },
                { value: 'staff', label: '👨‍🍳', name: 'Staff' },
              ].map((role) => (
                <button
                  key={role.value}
                  onClick={() => setSelectedRole(role.value as 'owner' | 'manager' | 'staff')}
                  className={`py-3 px-2 rounded-lg border-2 transition-all font-medium text-sm ${
                    selectedRole === role.value
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{role.label}</div>
                  <div className="text-xs">{role.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* PIN Input */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
              Enter PIN
            </label>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              onKeyDown={handleKeyDown}
              className="text-center text-2xl tracking-widest font-mono"
              disabled={loading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Login Button */}
          <Button
            onClick={handleLogin}
            disabled={loading || pin.length !== 4}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In →'}
          </Button>

          {/* Demo Info */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
            <p className="font-semibold mb-2">Demo PINs:</p>
            <p>👑 Owner: <span className="font-mono font-bold">1111</span></p>
            <p>👨‍💼 Manager: <span className="font-mono font-bold">2222</span></p>
            <p>👨‍🍳 Staff: <span className="font-mono font-bold">3333</span></p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-6">
          DirectOrder © 2026 · Restaurant Management System
        </p>
      </div>
    </div>
  );
}
