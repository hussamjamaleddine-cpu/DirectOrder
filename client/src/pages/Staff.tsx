import { useState, useEffect } from 'react';
import { store, StaffMember, Shift, Order } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Calendar, DollarSign, Plus, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Staff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showAddShift, setShowAddShift] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [newStaff, setNewStaff] = useState({
    name: '',
    phone: '',
    role: 'waiter' as 'manager' | 'chef' | 'waiter' | 'delivery',
    email: '',
    salary: 0,
    commissionPercentage: 0,
  });
  const [newShift, setNewShift] = useState({
    staffId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setStaff(store.getStaffMembers());
    setShifts(store.getShifts());
    setOrders(store.getOrders());
  };

  const addStaff = () => {
    if (!newStaff.name || !newStaff.phone) {
      toast.error('Please fill in required fields');
      return;
    }

    const member: StaffMember = {
      id: `staff_${Date.now()}`,
      name: newStaff.name,
      phone: newStaff.phone,
      role: newStaff.role,
      email: newStaff.email || undefined,
      salary: newStaff.salary || undefined,
      commissionPercentage: newStaff.commissionPercentage || undefined,
      joinedAt: Date.now(),
      active: true,
    };

    const updatedStaff = [...staff, member];
    store.setStaffMembers(updatedStaff);
    setStaff(updatedStaff);
    setNewStaff({
      name: '',
      phone: '',
      role: 'waiter',
      email: '',
      salary: 0,
      commissionPercentage: 0,
    });
    setShowAddStaff(false);
    toast.success('Staff member added!');
  };

  const addShift = () => {
    if (!newShift.staffId) {
      toast.error('Please select a staff member');
      return;
    }

    const shift: Shift = {
      id: `shift_${Date.now()}`,
      staffId: newShift.staffId,
      date: newShift.date,
      startTime: newShift.startTime,
      endTime: newShift.endTime,
      status: 'scheduled',
      notes: newShift.notes || undefined,
    };

    const updatedShifts = [...shifts, shift];
    store.setShifts(updatedShifts);
    setShifts(updatedShifts);
    setNewShift({
      staffId: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '17:00',
      notes: '',
    });
    setShowAddShift(false);
    toast.success('Shift scheduled!');
  };

  const deleteStaff = (id: string) => {
    const updatedStaff = staff.filter((s) => s.id !== id);
    store.setStaffMembers(updatedStaff);
    setStaff(updatedStaff);
    toast.success('Staff member removed');
  };

  const deleteShift = (id: string) => {
    const updatedShifts = shifts.filter((s) => s.id !== id);
    store.setShifts(updatedShifts);
    setShifts(updatedShifts);
    toast.success('Shift deleted');
  };

  const toggleStaffActive = (id: string) => {
    const updatedStaff = staff.map((s) =>
      s.id === id ? { ...s, active: !s.active } : s
    );
    store.setStaffMembers(updatedStaff);
    setStaff(updatedStaff);
  };

  const completeShift = (id: string) => {
    const updatedShifts = shifts.map((s) =>
      s.id === id ? { ...s, status: 'completed' as const } : s
    );
    store.setShifts(updatedShifts);
    setShifts(updatedShifts);
    toast.success('Shift marked as completed');
  };

  const calculateCommission = (staffId: string) => {
    const member = staff.find((s) => s.id === staffId);
    if (!member || !member.commissionPercentage) return 0;

    const staffOrders = orders.filter((o) => o.deliveryAssignee === member.name);
    const totalRevenue = staffOrders.reduce((sum, o) => sum + o.totalUSD, 0);
    return (totalRevenue * member.commissionPercentage) / 100;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'manager':
        return '👔';
      case 'chef':
        return '👨‍🍳';
      case 'waiter':
        return '🧑‍💼';
      case 'delivery':
        return '🚴';
      default:
        return '👤';
    }
  };

  const getUpcomingShifts = () => {
    const today = new Date().toISOString().split('T')[0];
    return shifts.filter((s) => s.date >= today && s.status !== 'cancelled');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">👥 Staff Management</h2>
        <p className="text-gray-600 mt-1">Manage team members, shifts, and commissions</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{staff.filter((s) => s.active).length}</p>
              <p className="text-sm text-gray-600 mt-1">Active Staff</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-600">{getUpcomingShifts().length}</p>
              <p className="text-sm text-gray-600 mt-1">Upcoming Shifts</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-600">
                ${staff
                  .reduce((sum, s) => sum + calculateCommission(s.id), 0)
                  .toFixed(2)}
              </p>
              <p className="text-sm text-gray-600 mt-1">Total Commissions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Staff Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => setShowAddStaff(!showAddStaff)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      {/* Add Staff Form */}
      {showAddStaff && (
        <Card className="border-0 shadow-sm bg-emerald-50">
          <CardHeader>
            <CardTitle>Add Staff Member</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Full name"
              value={newStaff.name}
              onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
            />
            <Input
              placeholder="Phone number"
              value={newStaff.phone}
              onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
            />
            <select
              value={newStaff.role}
              onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="manager">Manager</option>
              <option value="chef">Chef</option>
              <option value="waiter">Waiter</option>
              <option value="delivery">Delivery</option>
            </select>
            <Input
              placeholder="Email (optional)"
              type="email"
              value={newStaff.email}
              onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
            />
            <Input
              placeholder="Monthly salary ($)"
              type="number"
              value={newStaff.salary}
              onChange={(e) => setNewStaff({ ...newStaff, salary: parseFloat(e.target.value) })}
            />
            <Input
              placeholder="Commission percentage (%)"
              type="number"
              step="0.1"
              value={newStaff.commissionPercentage}
              onChange={(e) => setNewStaff({ ...newStaff, commissionPercentage: parseFloat(e.target.value) })}
            />
            <div className="flex gap-2">
              <Button
                onClick={addStaff}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                Add Member
              </Button>
              <Button
                onClick={() => setShowAddStaff(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Staff List */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Team Members ({staff.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {staff.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No staff members yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {staff.map((member) => (
                <div
                  key={member.id}
                  className={`p-4 rounded-lg border-2 ${
                    member.active ? 'bg-gray-50 border-gray-200' : 'bg-gray-100 border-gray-300 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getRoleIcon(member.role)}</span>
                        <div>
                          <p className="font-bold text-gray-900">{member.name}</p>
                          <p className="text-xs text-gray-600">
                            {member.role.charAt(0).toUpperCase() + member.role.slice(1)} • {member.phone}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4 mt-2 text-sm">
                        {member.salary && (
                          <span className="text-gray-600">
                            💰 ${member.salary}/month
                          </span>
                        )}
                        {member.commissionPercentage && (
                          <span className="text-emerald-600 font-semibold">
                            📈 {member.commissionPercentage}% commission (${calculateCommission(member.id).toFixed(2)})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleStaffActive(member.id)}
                        className={`px-3 py-1 rounded font-semibold text-sm ${
                          member.active
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                        }`}
                      >
                        {member.active ? '✓ Active' : '⊗ Inactive'}
                      </button>
                      <button
                        onClick={() => deleteStaff(member.id)}
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

      {/* Shift Scheduling */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Shift Schedule
          </CardTitle>
          <Button
            onClick={() => setShowAddShift(!showAddShift)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Schedule Shift
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {showAddShift && (
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 space-y-3">
              <select
                value={newShift.staffId}
                onChange={(e) => setNewShift({ ...newShift, staffId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select staff member...</option>
                {staff.filter((s) => s.active).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <Input
                type="date"
                value={newShift.date}
                onChange={(e) => setNewShift({ ...newShift, date: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="time"
                  value={newShift.startTime}
                  onChange={(e) => setNewShift({ ...newShift, startTime: e.target.value })}
                />
                <Input
                  type="time"
                  value={newShift.endTime}
                  onChange={(e) => setNewShift({ ...newShift, endTime: e.target.value })}
                />
              </div>
              <Input
                placeholder="Notes (optional)"
                value={newShift.notes}
                onChange={(e) => setNewShift({ ...newShift, notes: e.target.value })}
              />
              <div className="flex gap-2">
                <Button
                  onClick={addShift}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                >
                  Schedule
                </Button>
                <Button
                  onClick={() => setShowAddShift(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {getUpcomingShifts().length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No upcoming shifts scheduled</p>
            </div>
          ) : (
            <div className="space-y-3">
              {getUpcomingShifts().map((shift) => {
                const member = staff.find((s) => s.id === shift.staffId);
                return (
                  <div key={shift.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900">{member?.name}</p>
                      <p className="text-sm text-gray-600">
                        📅 {new Date(shift.date).toLocaleDateString()} • ⏰ {shift.startTime} - {shift.endTime}
                      </p>
                      {shift.notes && <p className="text-xs text-gray-600 mt-1">📝 {shift.notes}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => completeShift(shift.id)}
                        className="px-3 py-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded font-semibold text-sm"
                      >
                        ✓ Complete
                      </button>
                      <button
                        onClick={() => deleteShift(shift.id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
