import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMyTransactions, logoutUser } from "../../services/readerService";
import { clearUser } from "../../redux/authSlice";
import { showToast } from "../../components/Toast";
import Modal from "../../components/Modal";

export default function Profile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const data = await getMyTransactions();
      setTransactions(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      dispatch(clearUser());
      showToast(dispatch, "success", "Logged out successfully!");
      window.location.href = "/";
    } catch (err) {
      showToast(dispatch, "error", "Logout failed");
    }
  };

  const activeBorrows = transactions.filter(t => t.transactionType === "borrow" && !t.returnDate);
  const completedBorrows = transactions.filter(t => t.transactionType === "return");

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-emerald-600 text-4xl font-bold">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-gray-500">@{user?.username}</p>
                <p className="text-gray-400 text-sm mt-1">{user?.email}</p>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Member since</span>
                  <span className="font-medium">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                  <span className="text-gray-600">Active borrows</span>
                  <span className="font-bold text-emerald-600">{activeBorrows.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Total borrowed</span>
                  <span className="font-medium">{transactions.length}</span>
                </div>
              </div>

              <button
                onClick={() => setShowLogoutModal(true)}
                className="mt-6 w-full py-3 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Borrows</h3>
              {loading ? (
                <p className="text-gray-500">Loading...</p>
              ) : activeBorrows.length === 0 ? (
                <p className="text-gray-400 py-8 text-center">No active borrows</p>
              ) : (
                <div className="space-y-4">
                  {activeBorrows.map((t) => (
                    <div key={t._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-12 h-16 bg-emerald-100 rounded flex items-center justify-center">
                        <span className="text-emerald-600 font-bold">{t.bookId?.title?.[0]}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{t.bookId?.title}</p>
                        <p className="text-sm text-gray-500">by {t.bookId?.author}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">
                          Due: {new Date(t.returnDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Borrowing History</h3>
              {completedBorrows.length === 0 ? (
                <p className="text-gray-400 py-8 text-center">No completed borrows yet</p>
              ) : (
                <div className="space-y-3">
                  {completedBorrows.map((t) => (
                    <div key={t._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-14 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-500 text-sm font-bold">{t.bookId?.title?.[0]}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{t.bookId?.title}</p>
                        <p className="text-sm text-gray-400">
                          Borrowed: {new Date(t.issueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Returned</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} title="Confirm Logout" size="sm">
        <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
        <div className="flex gap-4">
          <button onClick={handleLogout} className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Logout
          </button>
          <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
}