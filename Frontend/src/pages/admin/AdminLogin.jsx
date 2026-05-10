import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginAdmin } from "../../services/adminService";
import { setUser } from "../../redux/authSlice";
import { showToast } from "../../components/Toast";

export default function AdminLogin() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      showToast(dispatch, "warning", "Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      const data = await loginAdmin(formData.email, formData.password);
      const adminData = { ...data.data, isAdmin: true };
      dispatch(setUser(adminData));
      showToast(dispatch, "success", "Welcome, Admin!");
      navigate("/admin");
    } catch (error) {
      showToast(dispatch, "error", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <span className="text-5xl mb-4 block">🔐</span>
          <h2 className="text-3xl font-bold text-gray-900">Admin Login</h2>
          <p className="text-gray-500 mt-2">Sign in to admin dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 disabled:bg-amber-400 transition"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6">
          <a href="/" className="text-amber-600 font-semibold hover:underline">← Back to Home</a>
        </p>
      </div>
    </div>
  );
}