import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { getUsers, deleteUser, updateUser, toggleUserStatus, getUserById } from "../../services/adminService";
import { showToast } from "../../components/Toast";
import Pagination from "../../components/Pagination";
import Modal from "../../components/Modal";
import { TableRowSkeleton } from "../../components/Skeleton";
import EmptyState from "../../components/EmptyState";

export default function ViewUsers() {
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [deletingId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: 10 };
      if (search) params.search = search;
      const data = await getUsers(params);
      setUsers(data.data.users);
      setTotalPages(data.data.pages);
      setTotal(data.data.total);
    } catch (err) {
      showToast(dispatch, "error", "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (id) => {
    try {
      const data = await getUserById(id);
      setViewingUser(data.data);
      setShowViewModal(true);
    } catch (err) {
      showToast(dispatch, "error", "Failed to load user details");
    }
  };

  const handleEdit = (user) => {
    setEditingUser({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await updateUser(editingUser._id, editingUser);
      showToast(dispatch, "success", "User updated successfully!");
      setShowEditModal(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      showToast(dispatch, "error", err);
    }
  };

  const handleToggleStatus = async (id) => {
    setTogglingId(id);
    try {
      const data = await toggleUserStatus(id);
      showToast(dispatch, "success", data.data.isActive ? "User activated" : "User suspended");
      fetchUsers();
    } catch (err) {
      showToast(dispatch, "error", err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await deleteUser(deletingId);
      showToast(dispatch, "success", "User deleted successfully!");
      setShowDeleteModal(false);
      setDeleteId(null);
      fetchUsers();
    } catch (err) {
      showToast(dispatch, "error", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">All Users</h1>

        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search by name, username, or email..."
            className="w-full md:w-96 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
          />
        </div>

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          {loading ? (
            <table className="w-full"><tbody>{Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} columns={6} />)}</tbody></table>
          ) : users.length === 0 ? (
            <EmptyState icon="👥" title="No users found" description={search ? "Try adjusting your search" : "No users registered yet"} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                            <span className="text-amber-600 font-bold">{user.firstName?.[0]}{user.lastName?.[0]}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">@{user.username}</td>
                      <td className="px-6 py-4 text-gray-500">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.isActive !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {user.isActive !== false ? "Active" : "Suspended"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 flex-wrap">
                          <button onClick={() => handleView(user._id)} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">View</button>
                          <button onClick={() => handleEdit(user)} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">Edit</button>
                          <button onClick={() => handleToggleStatus(user._id)} disabled={togglingId === user._id} className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-sm hover:bg-yellow-200">
                            {user.isActive !== false ? "Suspend" : "Activate"}
                          </button>
                          <button onClick={() => handleDeleteClick(user._id)} className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="User Details" size="lg">
        {viewingUser && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-amber-600 text-2xl font-bold">{viewingUser.user?.firstName?.[0]}{viewingUser.user?.lastName?.[0]}</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">{viewingUser.user?.firstName} {viewingUser.user?.lastName}</h3>
                <p className="text-gray-500">@{viewingUser.user?.username}</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${viewingUser.user?.isActive !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {viewingUser.user?.isActive !== false ? "Active" : "Suspended"}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-3"><p className="text-gray-500 text-sm">Email</p><p className="font-medium">{viewingUser.user?.email}</p></div>
              <div className="bg-gray-50 rounded-lg p-3"><p className="text-gray-500 text-sm">Joined</p><p className="font-medium">{new Date(viewingUser.user?.createdAt).toLocaleDateString()}</p></div>
            </div>
            <h4 className="font-semibold text-gray-900 mb-3">Borrowing History ({viewingUser.transactions?.length || 0})</h4>
            {viewingUser.transactions?.length === 0 ? (
              <p className="text-gray-400 py-4 text-center">No transactions yet</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {viewingUser.transactions.map((t) => (
                  <div key={t._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{t.bookId?.title}</p>
                      <p className="text-sm text-gray-400">by {t.bookId?.author}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${t.transactionType === "return" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      {t.transactionType === "return" ? "Returned" : "Borrowed"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit User" size="md">
        {editingUser && (
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input type="text" value={editingUser.firstName} onChange={(e) => setEditingUser({ ...editingUser, firstName: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input type="text" value={editingUser.lastName} onChange={(e) => setEditingUser({ ...editingUser, lastName: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 outline-none" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input type="text" value={editingUser.username} onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={editingUser.email} onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 outline-none" required />
            </div>
            <div className="flex gap-4 pt-4">
              <button type="submit" className="flex-1 py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600">Update User</button>
              <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancel</button>
            </div>
          </form>
        )}
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete User" size="sm">
        <p className="text-gray-600 mb-6">Are you sure you want to delete this user? All their data will be lost.</p>
        <div className="flex gap-4">
          <button onClick={handleDelete} className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
          <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancel</button>
        </div>
      </Modal>
    </div>
  );
}