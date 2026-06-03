import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Schedule, Order, User } from '../types';

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<'home' | 'orders'>('home');
  const [loading, setLoading] = useState(false);
  const [orderQty, setOrderQty] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchSchedules();
    fetchOrders();
  }, []);

  const fetchSchedules = async () => {
    try {
      const { data } = await api.get('/schedules/active');
      setSchedules(data.data || []);
    } catch { toast.error('Failed to load doodhwalas'); }
  };

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders/my');
      setOrders(data.data || []);
    } catch { toast.error('Failed to load orders'); }
  };

  const placeOrder = async (schedule: Schedule) => {
    const qty = orderQty[schedule._id] || 1;
    setLoading(true);
    try {
      await api.post('/orders', { scheduleId: schedule._id, quantity: qty });
      toast.success('Order placed! 🥛');
      fetchSchedules();
      fetchOrders();
      setTab('orders');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally { setLoading(false); }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      await api.patch(`/orders/${orderId}/cancel`);
      toast.success('Order cancelled');
      fetchOrders();
    } catch { toast.error('Cannot cancel this order'); }
  };

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐄</span>
          <span className="font-bold text-xl text-gray-800">DoodhWala</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-600 text-sm hidden sm:block">Hi, {user?.name} 👋</span>
          <button
            onClick={() => navigate('/profile')}
            className="text-sm bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition font-medium"
          >
            👤 Profile
          </button>
          <button onClick={() => { logout(); navigate('/login'); }} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-2xl mx-auto px-4 mt-6">
        <div className="flex gap-2 mb-6 bg-white rounded-xl p-1 shadow-sm">
          {(['home', 'orders'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg font-medium capitalize transition ${
                tab === t ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t === 'home' ? '🥛 Order Milk' : `📦 My Orders (${orders.length})`}
            </button>
          ))}
        </div>

        {/* Home Tab */}
        {tab === 'home' && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-700">Available Today</h2>
            {schedules.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <div className="text-5xl mb-3">😴</div>
                <p className="text-gray-500 font-medium">No doodhwalas available today</p>
                <p className="text-gray-400 text-sm mt-1">Check back tomorrow!</p>
              </div>
            ) : (
              schedules.map((s) => {
                const doodhwala = s.doodhwalaId as User;
                return (
                  <div key={s._id} className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-800">{doodhwala?.name || 'Doodhwala'}</h3>
                        <p className="text-sm text-gray-500">📍 {doodhwala?.address || 'Location not set'}</p>
                        <p className="text-sm text-gray-500">📞 {doodhwala?.phone}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-indigo-600 text-lg">₹{s.pricePerLitre}/L</p>
                        <p className="text-xs text-gray-400">⏰ {s.arrivalTime}</p>
                      </div>
                    </div>
                    <p className="text-sm text-green-600 mb-3 font-medium">✅ {s.availableQuantity}L available</p>
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        min={0.5}
                        max={s.availableQuantity}
                        step={0.5}
                        value={orderQty[s._id] || 1}
                        onChange={(e) => setOrderQty({ ...orderQty, [s._id]: parseFloat(e.target.value) })}
                        className="w-24 px-3 py-2 border rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-500">litres</span>
                      <span className="text-sm font-medium text-gray-700 ml-auto">
                        = ₹{((orderQty[s._id] || 1) * s.pricePerLitre).toFixed(0)}
                      </span>
                      <button
                        onClick={() => placeOrder(s)}
                        disabled={loading}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-60"
                      >
                        Order 🥛
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Orders Tab */}
        {tab === 'orders' && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-700">My Orders</h2>
            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <div className="text-5xl mb-3">📦</div>
                <p className="text-gray-500 font-medium">No orders yet</p>
                <p className="text-gray-400 text-sm mt-1">Order milk from the home tab!</p>
                <button
                  onClick={() => setTab('home')}
                  className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
                >
                  Order Now 🥛
                </button>
              </div>
            ) : (
              orders.map((o) => {
                const dw = o.doodhwalaId as User;
                return (
                  <div key={o._id} className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-800">{dw?.name || 'Doodhwala'}</p>
                        <p className="text-sm text-gray-500">{new Date(o.date).toLocaleDateString('en-IN')}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[o.status]}`}>
                        {o.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{o.quantity}L · ₹{o.totalAmount}</p>
                    {o.status === 'pending' && (
                      <button
                        onClick={() => cancelOrder(o._id)}
                        className="text-sm text-red-500 hover:underline border border-red-200 px-3 py-1 rounded-lg hover:bg-red-50 transition"
                      >
                        ❌ Cancel Order
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

export default CustomerDashboard;