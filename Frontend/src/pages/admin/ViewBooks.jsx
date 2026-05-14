import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { getBooks, updateBook, deleteBook, getCategories } from "../../services/adminService";
import { showToast } from "../../components/Toast";
import { useDispatch } from "react-redux";
import Modal from "../../components/Modal";
import Pagination from "../../components/Pagination";
import CreatableSelect from "react-select/creatable";
import EmptyState from "../../components/EmptyState";
import TableRowSkeleton from "../../components/Skeleton";

export default function ViewBooks() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const page = parseInt(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";

  const [selectedBook, setSelectedBook] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editPdf, setEditPdf] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (category) params.category = category;
      const res = await getBooks(params);
      setBooks(res.data?.books || []);
      setTotal(res.data?.total || 0);
      setPages(res.data?.pages || 1);
    } catch (err) {
      showToast(dispatch, "error", "Failed to load books");
    } finally {
      setLoading(false);
    }
  }, [page, search, category, dispatch]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  useEffect(() => {
    (async () => {
      try {
        const res = await getCategories();
        setCategories((res.data || []).map((c) => ({ value: c._id, label: c.name })));
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const updateParams = (updates) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    if (updates.search !== undefined || updates.category !== undefined) params.delete("page");
    setSearchParams(params);
  };

  const openEdit = (book) => {
    setSelectedBook(book);
    setEditForm({
      title: book.title || "",
      author: book.author || "",
      category: book.category ? { value: book.category._id, label: book.category.name } : null,
      edition: book.edition || "",
      isbn: book.isbn || "",
      publishedYear: book.publishedYear || "",
      publisher: book.publisher || "",
      coverImage: book.coverImage || "",
      description: book.description || "",
      pages: book.pages || ""
    });
    setEditPdf(null);
  };

  const handleEdit = async () => {
    if (!editForm.title || !editForm.author || !editForm.category || !editForm.edition || !editForm.publishedYear || !editForm.publisher) {
      showToast(dispatch, "error", "Fill all required fields");
      return;
    }
    try {
      const formData = new FormData();
      Object.entries(editForm).forEach(([key, val]) => {
        if (key === "category") formData.append("category", val.label);
        else if (val) formData.append(key, val);
      });
      if (editPdf) formData.append("pdfFile", editPdf);

      await updateBook(selectedBook._id, formData);
      showToast(dispatch, "success", "Book updated");
      setSelectedBook(null);
      fetchBooks();
    } catch (err) {
      showToast(dispatch, "error", err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteBook(deleteId);
      showToast(dispatch, "success", "Book deleted");
      setDeleteId(null);
      fetchBooks();
    } catch (err) {
      showToast(dispatch, "error", err);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Books</h1>
        <div className="flex gap-2">
          <input
            placeholder="Search..."
            value={search}
            onChange={(e) => updateParams({ search: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none w-48"
          />
          <select
            value={category}
            onChange={(e) => updateParams({ category: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white"
          >
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <TableRowSkeleton columns={6} />
      ) : books.length === 0 ? (
        <EmptyState title="No books found" description={search ? "Try a different search" : "Add your first book"} />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 text-left text-sm text-gray-500">
              <tr>
                <th className="p-3 font-medium">Title</th>
                <th className="p-3 font-medium">Author</th>
                <th className="p-3 font-medium">Category</th>
                <th className="p-3 font-medium">PDF</th>
                <th className="p-3 font-medium">Pages</th>
                <th className="p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {books.map((book) => (
                <tr key={book._id} className="hover:bg-gray-50 text-sm">
                  <td className="p-3 font-medium text-gray-800">{book.title}</td>
                  <td className="p-3 text-gray-600">{book.author}</td>
                  <td className="p-3">{book.category?.name && <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-full text-xs">{book.category.name}</span>}</td>
                  <td className="p-3">
                    {book.pdfFile ? (
                      <span className="text-emerald-600 font-medium text-xs bg-emerald-50 px-2 py-1 rounded-full">Uploaded</span>
                    ) : (
                      <span className="text-red-400 text-xs bg-red-50 px-2 py-1 rounded-full">Missing</span>
                    )}
                  </td>
                  <td className="p-3 text-gray-600">{book.pages || "—"}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(book)} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-xs font-medium">Edit</button>
                      <button onClick={() => setDeleteId(book._id)} className="px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-xs font-medium">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pages > 1 && (
            <div className="p-4 flex justify-center border-t">
              <Pagination currentPage={page} totalPages={pages} onPageChange={(p) => updateParams({ page: p.toString() })} />
            </div>
          )}
        </div>
      )}

      <Modal isOpen={!!selectedBook} onClose={() => setSelectedBook(null)} title="Edit Book" size="lg">
        {editForm && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-500">Title *</label><input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm mt-1 focus:ring-2 focus:ring-amber-500 outline-none" /></div>
              <div><label className="text-xs text-gray-500">Author *</label><input value={editForm.author} onChange={(e) => setEditForm({ ...editForm, author: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm mt-1 focus:ring-2 focus:ring-amber-500 outline-none" /></div>
              <div><label className="text-xs text-gray-500">Category *</label>
                <CreatableSelect
                  isClearable
                  options={categories}
                  value={editForm.category}
                  onChange={(val) => setEditForm({ ...editForm, category: val })}
                  className="mt-1 text-sm"
                />
              </div>
              <div><label className="text-xs text-gray-500">Edition *</label><input value={editForm.edition} onChange={(e) => setEditForm({ ...editForm, edition: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm mt-1 focus:ring-2 focus:ring-amber-500 outline-none" /></div>
              <div><label className="text-xs text-gray-500">ISBN</label><input value={editForm.isbn} onChange={(e) => setEditForm({ ...editForm, isbn: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm mt-1 focus:ring-2 focus:ring-amber-500 outline-none" /></div>
              <div><label className="text-xs text-gray-500">Year *</label><input type="number" value={editForm.publishedYear} onChange={(e) => setEditForm({ ...editForm, publishedYear: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm mt-1 focus:ring-2 focus:ring-amber-500 outline-none" /></div>
              <div><label className="text-xs text-gray-500">Publisher *</label><input value={editForm.publisher} onChange={(e) => setEditForm({ ...editForm, publisher: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm mt-1 focus:ring-2 focus:ring-amber-500 outline-none" /></div>
              <div><label className="text-xs text-gray-500">Pages</label><input type="number" value={editForm.pages} onChange={(e) => setEditForm({ ...editForm, pages: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm mt-1 focus:ring-2 focus:ring-amber-500 outline-none" /></div>
            </div>
            <div><label className="text-xs text-gray-500">Cover URL</label><input value={editForm.coverImage} onChange={(e) => setEditForm({ ...editForm, coverImage: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm mt-1 focus:ring-2 focus:ring-amber-500 outline-none" /></div>
            <div>
              <label className="text-xs text-gray-500">Replace PDF</label>
              <input type="file" accept=".pdf,application/pdf" onChange={(e) => setEditPdf(e.target.files[0])} className="w-full px-3 py-2 border rounded-lg text-sm mt-1 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-amber-50 file:text-amber-700 file:text-xs" />
            </div>
            <div><label className="text-xs text-gray-500">Description</label><textarea rows={3} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm mt-1 focus:ring-2 focus:ring-amber-500 outline-none resize-none" /></div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleEdit} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm">Save</button>
              <button onClick={() => setSelectedBook(null)} className="px-4 py-2 border rounded-lg text-gray-700 text-sm">Cancel</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Book" size="sm">
        <p className="text-gray-600 mb-4">Are you sure you want to delete this book? This action cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleteId(null)} className="px-4 py-2 border rounded-lg text-gray-700">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
