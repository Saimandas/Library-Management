import { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getStats, getRecentTransactions } from "../../services/adminService";
import { clearUser } from "../../redux/authSlice";
import { showToast } from "../../components/Toast";
import api from "../../services/readerService";
import Modal from "../../components/Modal";

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({ totalBooks: 0, totalUsers: 0, totalTransactions: 0 });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  useEffect(() => {
    if (user?.isAdmin) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [statsData, transactionsData] = await Promise.all([
        getStats(),
        getRecentTransactions(10)
      ]);
      setStats(statsData);
      setRecentTransactions(transactionsData.data);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
      showToast(dispatch, "error", "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/admin/logout");
    } catch (err) {
      console.error("Logout error:", err);
    }
    dispatch(clearUser());
    showToast(dispatch, "success", "Logged out successfully!");
    navigate("/admin/login");
  };

  const viewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500">Welcome back, {user?.firstName} {user?.lastName}</p>
          </div>
          <button onClick={() => setShowLogoutModal(true)} className="px-6 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100">
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Books</p>
                <h2 className="text-3xl font-bold text-gray-900 mt-1">{stats.totalBooks}</h2>
              </div>
              <span className="text-4xl">📚</span>
            </div>
            <NavLink to="/admin/books" className="mt-4 text-sm text-emerald-600 hover:underline block">View all →</NavLink>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <h2 className="text-3xl font-bold text-gray-900 mt-1">{stats.totalUsers}</h2>
              </div>
              <span className="text-4xl">👥</span>
            </div>
            <NavLink to="/admin/view-users" className="mt-4 text-sm text-emerald-600 hover:underline block">View all →</NavLink>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Transactions</p>
                <h2 className="text-3xl font-bold text-gray-900 mt-1">{stats.totalTransactions}</h2>
              </div>
              <span className="text-4xl">📋</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
            {recentTransactions.length === 0 ? (
              <p className="text-gray-400 py-8 text-center">No transactions yet</p>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((t) => (
                  <div
                    key={t._id}
                    onClick={() => viewTransaction(t)}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-10 h-10 rounded-full flex items-center justify-center ${t.transactionType === "borrow" ? "bg-emerald-100 text-emerald-600" : "bg-green-100 text-green-600"}`}>
                        {t.transactionType === "borrow" ? "📖" : "✅"}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">{t.bookId?.title || "Unknown Book"}</p>
                        <p className="text-sm text-gray-500">@{t.userId?.username || "Unknown User"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${t.transactionType === "borrow" ? "bg-emerald-100 text-emerald-700" : "bg-green-100 text-green-700"}`}>
                        {t.transactionType === "borrow" ? "Borrowed" : "Returned"}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">{new Date(t.issueDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <NavLink to="/admin/add-books">
                <button className="w-full px-6 py-3 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 transition text-left">
                  ➕ Add New Book
                </button>
              </NavLink>
              <NavLink to="/admin/books">
                <button className="w-full px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition text-left">
                  📚 Manage Books
                </button>
              </NavLink>
              <NavLink to="/admin/view-users">
                <button className="w-full px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition text-left">
                  👥 Manage Users
                </button>
              </NavLink>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} title="Confirm Logout" size="sm">
        <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
        <div className="flex gap-4">
          <button onClick={handleLogout} className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Logout</button>
          <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancel</button>
        </div>
      </Modal>

      <Modal isOpen={showTransactionModal} onClose={() => setShowTransactionModal(false)} title="Transaction Details" size="md">
        {selectedTransaction && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <span className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedTransaction.transactionType === "borrow" ? "bg-emerald-100 text-emerald-600" : "bg-green-100 text-green-600"}`}>
                {selectedTransaction.transactionType === "borrow" ? "📖" : "✅"}
              </span>
              <div>
                <p className="text-lg font-semibold">{selectedTransaction.bookId?.title}</p>
                <p className="text-gray-500">by {selectedTransaction.bookId?.author}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500 text-sm">User</p>
                <p className="font-medium">{selectedTransaction.userId?.username}</p>
                <p className="text-sm text-gray-400">{selectedTransaction.userId?.email}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500 text-sm">Type</p>
                <span className={`px-2 py-1 rounded text-xs font-medium ${selectedTransaction.transactionType === "borrow" ? "bg-emerald-100 text-emerald-700" : "bg-green-100 text-green-700"}`}>
                  {selectedTransaction.transactionType === "borrow" ? "Borrow" : "Return"}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500 text-sm">Issue Date</p>
                <p className="font-medium">{new Date(selectedTransaction.issueDate).toLocaleDateString()}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500 text-sm">Due Date</p>
                <p className="font-medium">{new Date(selectedTransaction.returnDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}