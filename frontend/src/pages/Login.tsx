import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { ApiResponse, User } from '../types';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string; password?: string; general?: string }>({});
  const [form, setForm] = useState({ phone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const validate = (): boolean => {
    const newErrors: { phone?: string; password?: string } = {};
    if (!form.phone) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(form.phone)) newErrors.phone = 'Enter valid 10-digit phone number';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      const { data } = await api.post<ApiResponse<{ token: string; user: User }>>('/auth/login', form);
      if (data.success && data.data) {
        login(data.data.token, data.data.user);
        toast.success(`Welcome back, ${data.data.user.name}! 🐄`);
        navigate(data.data.user.role === 'doodhwala' ? '/doodhwala' : '/customer');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string }; status?: number } };
      const status = error.response?.status;
      if (status === 401) {
        setErrors({ general: 'Invalid phone number or password. Please try again.' });
      } else if (status === 404) {
        setErrors({ phone: 'No account found with this phone number.' });
      } else {
        setErrors({ general: error.response?.data?.message || 'Something went wrong. Please try again.' });
      }
      toast.error('Login failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🐄</div>
          <h1 className="text-3xl font-bold text-gray-800">DoodhWala</h1>
          <p className="text-gray-500 mt-1">Login to your account</p>
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
            <span className="text-red-500 text-lg">⚠️</span>
            <p className="text-red-600 text-sm font-medium">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📱 Phone Number
            </label>
            <input
              type="tel"
              placeholder="Enter 10-digit phone number"
              value={form.phone}
              onChange={(e) => {
                setForm({ ...form, phone: e.target.value });
                if (errors.phone) setErrors({ ...errors, phone: undefined });
              }}
              maxLength={10}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition ${
                errors.phone
                  ? 'border-red-400 focus:ring-red-300 bg-red-50'
                  : 'border-gray-300 focus:ring-indigo-500'
              }`}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <span>❌</span> {errors.phone}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🔒 Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
                className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 transition ${
                  errors.password
                    ? 'border-red-400 focus:ring-red-300 bg-red-50'
                    : 'border-gray-300 focus:ring-indigo-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <span>❌</span> {errors.password}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                <span>Logging in...</span>
              </>
            ) : (
              'Login →'
            )}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
