import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { getUsers, getUserById, updateUser, deleteUser, toggleUserStatus, approveUser } from "../../services/adminService";
import { showToast } from "../../components/Toast";
import { useDispatch } from "react-redux";
import Modal from "../../components/Modal";
import Pagination from "../../components/Pagination";
import EmptyState from "../../components/EmptyState";
import TableRowSkeleton from "../../components/Skeleton";

export default function ViewUsers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const page = parseInt(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";

  const [detailUser, setDetailUser] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      const res = await getUsers(params);
      setUsers(res.data?.users || []);
      setTotal(res.data?.total || 0);
      setPages(res.data?.pages || 1);
    } catch (err) {
      showToast(dispatch, "error", "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, search, dispatch]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const updateParams = (updates) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    if (updates.search !== undefined) params.delete("page");
    setSearchParams(params);
  };

  const openDetail = async (user) => {
    try {
      const res = await getUserById(user._id);
      setDetailUser(user);
      setDetailData(res.data);
    } catch (err) {
      showToast(dispatch, "error", "Failed to load user details");
    }
  };

  const openEdit = (user) => {
    setEditUser(user);
    setEditForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      username: user.username || "",
      email: user.email || "",
    });
  };

  const handleEdit = async () => {
    try {
      await updateUser(editUser._id, editForm);
      showToast(dispatch, "success", "User updated");
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      showToast(dispatch, "error", err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser(deleteId);
      showToast(dispatch, "success", "User deleted");
      setDeleteId(null);
      fetchUsers();
    } catch (err) {
      showToast(dispatch, "error", err);
    }
  };

  const handleToggleStatus = async () => {
    try {
      await toggleUserStatus(statusTarget);
      showToast(dispatch, "success", "User status updated");
      setStatusTarget(null);
      fetchUsers();
    } catch (err) {
      showToast(dispatch, "error", err);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await approveUser(userId, true);
      showToast(dispatch, "success", "User approved");
      fetchUsers();
    } catch (err) {
      showToast(dispatch, "error", err);
    }
  };

  const getStatusBadge = (user) => {
    if (!user.isApproved) return { label: "Pending", class: "bg-amber-50 text-amber-700" };
    if (!user.isActive) return { label: "Suspended", class: "bg-red-50 text-red-700" };
    return { label: "Approved", class: "bg-emerald-50 text-emerald-700" };
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Users</h1>
        <input
          placeholder="Search users..."
          value={search}
          onChange={(e) => updateParams({ search: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none w-64"
        />
      </div>

      {loading ? (
        <TableRowSkeleton columns={5} />
      ) : users.length === 0 ? (
        <EmptyState title="No users found" description={search ? "Try a different search" : "No users registered yet"} />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 text-left text-sm text-gray-500">
              <tr>
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Username</th>
                <th className="p-3 font-medium">Email</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => {
                const status = getStatusBadge(user);
                return (
                  <tr key={user._id} className="hover:bg-gray-50 text-sm">
                    <td className="p-3 font-medium text-gray-800">{user.firstName} {user.lastName}</td>
                    <td className="p-3 text-gray-600">@{user.username}</td>
                    <td className="p-3 text-gray-600">{user.email}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.class}`}>{status.label}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1.5 flex-wrap">
                        <button onClick={() => openDetail(user)} className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 text-xs">View</button>
                        <button onClick={() => openEdit(user)} className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-xs">Edit</button>
                        {!user.isApproved && (
                          <button onClick={() => handleApprove(user._id)} className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100 text-xs">Approve</button>
                        )}
                        <button onClick={() => setStatusTarget(user._id)} className="px-2.5 py-1 bg-amber-50 text-amber-600 rounded hover:bg-amber-100 text-xs">
                          {user.isActive ? "Suspend" : "Activate"}
                        </button>
                        <button onClick={() => setDeleteId(user._id)} className="px-2.5 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 text-xs">Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {pages > 1 && (
            <div className="p-4 flex justify-center border-t">
              <Pagination currentPage={page} totalPages={pages} onPageChange={(p) => updateParams({ page: p.toString() })} />
            </div>
          )}
        </div>
      )}

      <Modal isOpen={!!detailUser} onClose={() => { setDetailUser(null); setDetailData(null); }} title="User Details & Download History" size="lg">
        {detailUser && detailData && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">Name:</span><p className="font-medium">{detailUser.firstName} {detailUser.lastName}</p></div>
              <div><span className="text-gray-500">Username:</span><p className="font-medium">@{detailUser.username}</p></div>
              <div><span className="text-gray-500">Email:</span><p className="font-medium">{detailUser.email}</p></div>
              <div><span className="text-gray-500">Status:</span>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(detailUser).class}`}>
                  {getStatusBadge(detailUser).label}
                </span>
              </div>
              <div><span className="text-gray-500">Joined:</span><p className="font-medium">{new Date(detailUser.createdAt).toLocaleDateString()}</p></div>
              {detailUser.approvalDate && <div><span className="text-gray-500">Approved:</span><p className="font-medium">{new Date(detailUser.approvalDate).toLocaleDateString()}</p></div>}
            </div>
            <div className="border-t pt-3">
              <h3 className="font-medium text-gray-800 mb-2">Download History ({detailData.downloads?.length || 0})</h3>
              {(!detailData.downloads || detailData.downloads.length === 0) ? (
                <p className="text-gray-400 text-sm">No downloads yet</p>
              ) : (
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {detailData.downloads.map((d) => (
                    <div key={d._id} className="flex justify-between p-2 bg-gray-50 rounded text-sm">
                      <span className="font-medium text-gray-700">{d.bookId?.title || "Unknown"}</span>
                      <span className="text-gray-400 text-xs">{new Date(d.downloadedAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title="Edit User" size="md">
        {editForm && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-500">First Name</label><input value={editForm.firstName} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm mt-1 focus:ring-2 focus:ring-amber-500 outline-none" /></div>
              <div><label className="text-xs text-gray-500">Last Name</label><input value={editForm.lastName} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm mt-1 focus:ring-2 focus:ring-amber-500 outline-none" /></div>
            </div>
            <div><label className="text-xs text-gray-500">Username</label><input value={editForm.username} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm mt-1 focus:ring-2 focus:ring-amber-500 outline-none" /></div>
            <div><label className="text-xs text-gray-500">Email</label><input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm mt-1 focus:ring-2 focus:ring-amber-500 outline-none" /></div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleEdit} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm">Save</button>
              <button onClick={() => setEditUser(null)} className="px-4 py-2 border rounded-lg text-gray-700 text-sm">Cancel</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete User" size="sm">
        <p className="text-gray-600 mb-4">Are you sure you want to delete this user? This action cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleteId(null)} className="px-4 py-2 border rounded-lg text-gray-700">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
        </div>
      </Modal>

      <Modal isOpen={!!statusTarget} onClose={() => setStatusTarget(null)} title="Update User Status" size="sm">
        <p className="text-gray-600 mb-4">Are you sure you want to change this user's status?</p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setStatusTarget(null)} className="px-4 py-2 border rounded-lg text-gray-700">Cancel</button>
          <button onClick={handleToggleStatus} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">Confirm</button>
        </div>
      </Modal>
    </div>
  );
}
