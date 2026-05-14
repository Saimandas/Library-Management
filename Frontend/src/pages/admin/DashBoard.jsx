import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getStats, getRecentDownloads, logoutAdmin } from "../../services/adminService";
import { clearUser } from "../../redux/authSlice";
import { showToast } from "../../components/Toast";
import Modal from "../../components/Modal";
import Skeleton from "../../components/Skeleton";

export default function DashBoard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogout, setShowLogout] = useState(false);
  const [detailModal, setDetailModal] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [statsRes, recentRes] = await Promise.all([
          getStats(), getRecentDownloads(5)
        ]);
        setStats(statsRes.data);
        setRecent(recentRes.data || []);
      } catch (err) {
        showToast(dispatch, "error", "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, [dispatch]);

  const handleLogout = async () => {
    try {
      await logoutAdmin();
    } catch (err) {
      console.error(err);
    }
    dispatch(clearUser());
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Books", value: stats?.totalBooks || 0, color: "bg-blue-500", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
    { label: "Total Users", value: stats?.totalUsers || 0, color: "bg-emerald-500", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
    { label: "Total Downloads", value: stats?.totalDownloads || 0, color: "bg-violet-500", icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" },
    { label: "Pending Approvals", value: stats?.pendingApprovals || 0, color: "bg-amber-500", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <button onClick={() => setShowLogout(true)} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm">Logout</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
            <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={card.icon} />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              <p className="text-sm text-gray-500">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Recent Downloads</h2>
          {recent.length === 0 ? (
            <p className="text-gray-400 text-sm">No downloads yet</p>
          ) : (
            <div className="space-y-2">
              {recent.map((d) => (
                <div key={d._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                  onClick={() => setDetailModal(d)}
                >
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{d.bookId?.title || "Unknown"}</p>
                    <p className="text-xs text-gray-500">{d.userId?.firstName} {d.userId?.lastName} ({d.userId?.username})</p>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(d.downloadedAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <button onClick={() => navigate("/admin/add-books")} className="w-full text-left p-3 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 text-sm font-medium">
              + Add New Book
            </button>
            <button onClick={() => navigate("/admin/books")} className="w-full text-left p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium">
              Manage Books
            </button>
            <button onClick={() => navigate("/admin/view-users")} className="w-full text-left p-3 bg-violet-50 text-violet-700 rounded-lg hover:bg-violet-100 text-sm font-medium">
              Manage Users
            </button>
          </div>
        </div>
      </div>

      <Modal isOpen={!!detailModal} onClose={() => setDetailModal(null)} title="Download Details" size="md">
        {detailModal && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-gray-500">User:</span><p className="font-medium">{detailModal.userId?.firstName} {detailModal.userId?.lastName}</p></div>
              <div><span className="text-gray-500">Username:</span><p className="font-medium">@{detailModal.userId?.username}</p></div>
              <div><span className="text-gray-500">Book:</span><p className="font-medium">{detailModal.bookId?.title}</p></div>
              <div><span className="text-gray-500">Author:</span><p className="font-medium">{detailModal.bookId?.author}</p></div>
              <div><span className="text-gray-500">Downloaded:</span><p className="font-medium">{new Date(detailModal.downloadedAt).toLocaleString()}</p></div>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showLogout} onClose={() => setShowLogout(false)} title="Confirm Logout" size="sm">
        <p className="text-gray-600 mb-4">Are you sure you want to logout?</p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setShowLogout(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Logout</button>
        </div>
      </Modal>
    </div>
  );
}
