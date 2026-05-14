import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser, getMyDownloads } from "../../services/readerService";
import { clearUser } from "../../redux/authSlice";
import { showToast } from "../../components/Toast";
import Modal from "../../components/Modal";
import Skeleton from "../../components/Skeleton";
import EmptyState from "../../components/EmptyState";

export default function Profile() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    (async () => {
      try {
        const res = await getMyDownloads();
        setDownloads(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated, navigate]);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error(err);
    }
    dispatch(clearUser());
    navigate("/");
  };

  if (!user) return null;

  const initials = (user.firstName?.[0] || "") + (user.lastName?.[0] || "");

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {initials}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-800">{user.fullName || `${user.firstName} ${user.lastName}`}</h1>
            <p className="text-gray-500 text-sm">@{user.username}</p>
            <p className="text-gray-500 text-sm">{user.email}</p>
          </div>
          <div className="text-right">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
              user.isApproved
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}>
              {user.isApproved ? "Approved" : "Pending Approval"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">{downloads.length}</p>
            <p className="text-sm text-gray-500">Downloads</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</p>
            <p className="text-sm text-gray-500">Member Since</p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button onClick={() => setShowLogout(true)} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium">
            Logout
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Download History</h2>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : downloads.length === 0 ? (
          <EmptyState
            icon={
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            }
            title="No downloads yet"
            description="Books you download will appear here"
            actionLabel="Browse Books"
            actionUrl="/books"
          />
        ) : (
          <div className="space-y-2">
            {downloads.map((d) => (
              <div key={d._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                onClick={() => navigate(`/books/${d.bookId?._id}`)}
              >
                <div>
                  <p className="font-medium text-gray-800">{d.bookId?.title || "Unknown Book"}</p>
                  <p className="text-xs text-gray-500">{d.bookId?.author || ""}</p>
                </div>
                <span className="text-xs text-gray-400">{new Date(d.downloadedAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

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
