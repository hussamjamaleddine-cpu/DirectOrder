import { useState, useEffect } from 'react';
import { store } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, MessageSquare, Bell, Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  emailAddress: string;
  smsNumber: string;
  notifyOnNewOrder: boolean;
  notifyOnOrderReady: boolean;
  notifyOnOrderDelivered: boolean;
  dailyReportEmail: boolean;
  dailyReportTime: string;
}

export default function Notifications() {
  const [settings, setSettings] = useState<NotificationSettings>({
    emailEnabled: false,
    smsEnabled: false,
    emailAddress: '',
    smsNumber: '',
    notifyOnNewOrder: true,
    notifyOnOrderReady: true,
    notifyOnOrderDelivered: true,
    dailyReportEmail: true,
    dailyReportTime: '09:00',
  });

  const [testEmail, setTestEmail] = useState('');
  const [testSMS, setTestSMS] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const stored = localStorage.getItem('directorder_notification_settings');
    if (stored) {
      setSettings(JSON.parse(stored));
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('directorder_notification_settings', JSON.stringify(settings));
      toast.success('Notification settings saved!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      toast.loading('Sending test email...');
      // In production, this would call a backend API
      // For now, we'll simulate the sending
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('✅ Test email sent! Check your inbox.');
    } catch (error) {
      toast.error('Failed to send test email');
    }
  };

  const sendTestSMS = async () => {
    if (!testSMS) {
      toast.error('Please enter a phone number');
      return;
    }

    try {
      toast.loading('Sending test SMS...');
      // In production, this would call a backend API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('✅ Test SMS sent!');
    } catch (error) {
      toast.error('Failed to send test SMS');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">🔔 Notification Settings</h2>
        <p className="text-gray-600 mt-1">Configure email and SMS notifications for your restaurant</p>
      </div>

      {/* Email Configuration */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            Email Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <label className="text-sm font-semibold text-gray-700">Enable Email Notifications</label>
            <input
              type="checkbox"
              checked={settings.emailEnabled}
              onChange={(e) => setSettings({ ...settings, emailEnabled: e.target.checked })}
              className="w-5 h-5 cursor-pointer"
            />
          </div>

          {settings.emailEnabled && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <Input
                  type="email"
                  value={settings.emailAddress}
                  onChange={(e) => setSettings({ ...settings, emailAddress: e.target.value })}
                  placeholder="owner@restaurant.com"
                />
              </div>

              {/* Email Trigger Options */}
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-semibold text-gray-700">Send notifications for:</p>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifyOnNewOrder}
                    onChange={(e) => setSettings({ ...settings, notifyOnNewOrder: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">🆕 New orders received</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifyOnOrderReady}
                    onChange={(e) => setSettings({ ...settings, notifyOnOrderReady: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">✓ Orders ready for pickup</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifyOnOrderDelivered}
                    onChange={(e) => setSettings({ ...settings, notifyOnOrderDelivered: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">📦 Orders delivered</span>
                </label>
              </div>

              {/* Daily Report */}
              <div className="space-y-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.dailyReportEmail}
                    onChange={(e) => setSettings({ ...settings, dailyReportEmail: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-semibold text-gray-700">📊 Send daily summary report</span>
                </label>
                {settings.dailyReportEmail && (
                  <div>
                    <label className="block text-xs text-gray-600 mb-2">Report time</label>
                    <input
                      type="time"
                      value={settings.dailyReportTime}
                      onChange={(e) => setSettings({ ...settings, dailyReportTime: e.target.value })}
                      className="w-32 px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>
                )}
              </div>

              {/* Test Email */}
              <div className="space-y-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm font-semibold text-gray-700">🧪 Send Test Email</p>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="test@example.com"
                  />
                  <Button
                    onClick={sendTestEmail}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  >
                    Send
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SMS Configuration */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-600" />
            SMS Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
            <label className="text-sm font-semibold text-gray-700">Enable SMS Notifications</label>
            <input
              type="checkbox"
              checked={settings.smsEnabled}
              onChange={(e) => setSettings({ ...settings, smsEnabled: e.target.checked })}
              className="w-5 h-5 cursor-pointer"
            />
          </div>

          {settings.smsEnabled && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <Input
                  type="tel"
                  value={settings.smsNumber}
                  onChange={(e) => setSettings({ ...settings, smsNumber: e.target.value })}
                  placeholder="+961 1 234 567"
                />
              </div>

              {/* SMS Trigger Options */}
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-semibold text-gray-700">Send SMS for:</p>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifyOnNewOrder}
                    onChange={(e) => setSettings({ ...settings, notifyOnNewOrder: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">🆕 New orders received</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifyOnOrderReady}
                    onChange={(e) => setSettings({ ...settings, notifyOnOrderReady: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">✓ Orders ready for pickup</span>
                </label>
              </div>

              {/* Test SMS */}
              <div className="space-y-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm font-semibold text-gray-700">🧪 Send Test SMS</p>
                <div className="flex gap-2">
                  <Input
                    type="tel"
                    value={testSMS}
                    onChange={(e) => setTestSMS(e.target.value)}
                    placeholder="+961 1 234 567"
                  />
                  <Button
                    onClick={sendTestSMS}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold"
                  >
                    Send
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900">
          <p className="font-semibold mb-1">📧 Email & SMS Integration</p>
          <p>To enable email and SMS notifications in production, you'll need to integrate with services like:</p>
          <ul className="mt-2 space-y-1 ml-4">
            <li>• <strong>Email:</strong> SendGrid, Mailgun, or AWS SES</li>
            <li>• <strong>SMS:</strong> Twilio, AWS SNS, or local SMS gateway</li>
          </ul>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-3">
        <Button
          onClick={saveSettings}
          disabled={isSaving}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
