import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', address: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPasswords, setShowPasswords] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<'profile' | 'password'>('profile');

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', address: user.address || '' });
    }
  }, [user]);

  const validateProfile = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    else if (form.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors: Record<string, string> = {};
    if (!passwordForm.currentPassword) newErrors.currentPassword = 'Current password is required';
    if (!passwordForm.newPassword) newErrors.newPassword = 'New password is required';
    else if (passwordForm.newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters';
    if (passwordForm.newPassword !== passwordForm.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateProfile()) return;
    setLoading(true);
    try {
      await api.patch('/auth/profile', form);
      toast.success('Profile updated successfully! ✅');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!validatePassword()) return;
    setLoading(true);
    try {
      await api.patch('/auth/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password updated successfully! 🔒');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      if (error.response?.data?.message?.includes('incorrect')) {
        setErrors({ currentPassword: 'Current password is incorrect' });
      } else {
        toast.error('Failed to update password');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition ${
      errors[field] ? 'border-red-400 focus:ring-red-300 bg-red-50' : 'border-gray-300 focus:ring-indigo-500'
    }`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐄</span>
          <span className="font-bold text-xl text-gray-800">DoodhWala</span>
        </div>
        <button
          onClick={() => navigate(user?.role === 'doodhwala' ? '/doodhwala' : '/customer')}
          className="text-indigo-600 font-medium hover:underline text-sm"
        >
          ← Back to Dashboard
        </button>
      </header>

      <div className="max-w-lg mx-auto px-4 mt-8">

        {/* Avatar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-4 text-center">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-3">
            {user?.role === 'doodhwala' ? '🥛' : '🏠'}
          </div>
          <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
          <p className="text-gray-500 text-sm">{user?.phone}</p>
          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
            user?.role === 'doodhwala' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
          }`}>
            {user?.role === 'doodhwala' ? '🥛 Doodhwala' : '🏠 Customer'}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 bg-white rounded-xl p-1 shadow-sm">
          {(['profile', 'password'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setErrors({}); }}
              className={`flex-1 py-2 rounded-lg font-medium capitalize transition ${
                tab === t ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t === 'profile' ? '👤 Edit Profile' : '🔒 Change Password'}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {tab === 'profile' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">👤 Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => { setForm({ ...form, name: e.target.value }); if (errors.name) setErrors({ ...errors, name: '' }); }}
                  placeholder="Your full name"
                  className={inputClass('name')}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">❌ {errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📱 Phone Number
                </label>
                <input
                  type="tel"
                  value={user?.phone || ''}
                  disabled
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">Phone number cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📍 Address <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Your area / locality"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
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
                ) : 'Save Changes ✅'}
              </button>
            </form>
          </div>
        )}

        {/* Password Tab */}
        {tab === 'password' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              {[
                { key: 'currentPassword', label: 'Current Password', placeholder: 'Enter current password' },
                { key: 'newPassword', label: 'New Password', placeholder: 'Min 6 characters' },
                { key: 'confirmPassword', label: 'Confirm New Password', placeholder: 'Repeat new password' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">🔒 {field.label}</label>
                  <div className="relative">
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      placeholder={field.placeholder}
                      value={passwordForm[field.key as keyof typeof passwordForm]}
                      onChange={(e) => {
                        setPasswordForm({ ...passwordForm, [field.key]: e.target.value });
                        if (errors[field.key]) setErrors({ ...errors, [field.key]: '' });
                      }}
                      className={`${inputClass(field.key)} pr-12`}
                    />
                    {field.key === 'currentPassword' && (
                      <button
                        type="button"
                        onClick={() => setShowPasswords(!showPasswords)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg"
                      >
                        {showPasswords ? '🙈' : '👁️'}
                      </button>
                    )}
                  </div>
                  {errors[field.key] && <p className="text-red-500 text-xs mt-1">❌ {errors[field.key]}</p>}
                </div>
              ))}
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
                    Updating...
                  </>
                ) : 'Update Password 🔒'}
              </button>
            </form>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="w-full mt-4 mb-8 border-2 border-red-300 text-red-500 py-3 rounded-xl font-semibold hover:bg-red-50 transition"
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
