import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Order, User } from '../types';

interface TodaySchedule {
  _id: string;
  arrivalTime: string;
  availableQuantity: number;
  pricePerLitre: number;
  date: string;
}

const DoodhwalaDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'schedule' | 'orders'>('schedule');
  const [todaySchedule, setTodaySchedule] = useState<TodaySchedule | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    arrivalTime: '07:00',
    availableQuantity: 10,
    pricePerLitre: 60,
  });

  useEffect(() => {
    fetchTodaySchedule();
    fetchOrders();
  }, []);

  const fetchTodaySchedule = async () => {
    try {
      const { data } = await api.get('/schedules/today');
      if (data.data) setTodaySchedule(data.data);
    } catch { }
  };

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders/doodhwala');
      setOrders(data.data || []);
    } catch { toast.error('Failed to load orders'); }
  };

  const saveSchedule = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/schedules', form);
      toast.success('Schedule saved! ✅');
      fetchTodaySchedule();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to save schedule');
    } finally { setLoading(false); }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      toast.success(`Order ${status}! ✅`);
      fetchOrders();
    } catch { toast.error('Failed to update order'); }
  };

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐄</span>
          <span className="font-bold text-xl text-gray-800">DoodhWala</span>
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Doodhwala</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-600 text-sm hidden sm:block">{user?.name} 👋</span>
          <button
            onClick={() => navigate('/profile')}
            className="text-sm bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition font-medium"
          >
            👤 Profile
          </button>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="text-sm text-red-500 hover:underline"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 mt-6">

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-sm text-gray-500">Today's Orders</p>
            <p className="text-3xl font-bold text-indigo-600">
              {orders.filter((o) => o.status !== 'cancelled').length}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-sm text-gray-500">Today's Revenue</p>
            <p className="text-3xl font-bold text-green-600">₹{totalRevenue}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-xl p-1 shadow-sm">
          {(['schedule', 'orders'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg font-medium capitalize transition ${
                tab === t ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t === 'schedule' ? '📅 Set Schedule' : `📋 Orders (${orders.length})`}
            </button>
          ))}
        </div>

        {/* Schedule Tab */}
        {tab === 'schedule' && (
          <div className="space-y-4">
            {todaySchedule && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                <p className="font-semibold text-green-800 mb-1">✅ Today's Schedule Set</p>
                <p className="text-sm text-green-700">
                  Arrival: {todaySchedule.arrivalTime} · {todaySchedule.availableQuantity}L @ ₹{todaySchedule.pricePerLitre}/L
                </p>
              </div>
            )}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-semibold text-gray-800 mb-4">
                {todaySchedule ? 'Update Schedule' : "Set Today's Schedule"}
              </h2>
              <form onSubmit={saveSchedule} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">📅 Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">⏰ Arrival Time</label>
                  <input
                    type="time"
                    value={form.arrivalTime}
                    onChange={(e) => setForm({ ...form, arrivalTime: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">🥛 Available (Litres)</label>
                    <input
                      type="number"
                      min={1}
                      value={form.availableQuantity}
                      onChange={(e) => setForm({ ...form, availableQuantity: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">💰 Price per Litre (₹)</label>
                    <input
                      type="number"
                      min={1}
                      value={form.pricePerLitre}
                      onChange={(e) => setForm({ ...form, pricePerLitre: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : todaySchedule ? 'Update Schedule ✅' : 'Set Schedule 📅'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {tab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <div className="text-5xl mb-3">📋</div>
                <p className="text-gray-500 font-medium">No orders yet today</p>
                <p className="text-gray-400 text-sm mt-1">Set your schedule so customers can order!</p>
              </div>
            ) : (
              orders.map((o) => {
                const customer = o.customerId as User;
                return (
                  <div key={o._id} className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-800">{customer?.name}</p>
                        <p className="text-sm text-gray-500">📞 {customer?.phone}</p>
                        <p className="text-sm text-gray-500">📍 {customer?.address || 'Address not set'}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[o.status]}`}>
                        {o.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 font-medium">{o.quantity}L · ₹{o.totalAmount}</p>
                    {o.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateOrderStatus(o._id, 'confirmed')}
                          className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                        >
                          ✅ Confirm
                        </button>
                        <button
                          onClick={() => updateOrderStatus(o._id, 'cancelled')}
                          className="flex-1 border border-red-300 text-red-500 py-2 rounded-lg text-sm font-medium hover:bg-red-50"
                        >
                          ❌ Cancel
                        </button>
                      </div>
                    )}
                    {o.status === 'confirmed' && (
                      <button
                        onClick={() => updateOrderStatus(o._id, 'delivered')}
                        className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700"
                      >
                        🚚 Mark Delivered
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoodhwalaDashboard;