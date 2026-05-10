import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { getBooks, deleteBook, getCategories, updateBook } from "../../services/adminService";
import { showToast } from "../../components/Toast";
import Pagination from "../../components/Pagination";
import Modal from "../../components/Modal";
import { TableRowSkeleton } from "../../components/Skeleton";
import EmptyState from "../../components/EmptyState";
import CreatableSelect from "react-select/creatable";

export default function ViewBooks() {
  const dispatch = useDispatch();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [editingBook, setEditingBook] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [currentPage, selectedCategory, search]);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: 10 };
      if (search) params.search = search;
      if (selectedCategory) params.category = selectedCategory;
      const data = await getBooks(params);
      setBooks(data.data.books);
      setTotalPages(data.data.pages);
      setTotal(data.data.total);
    } catch (err) {
      showToast(dispatch, "error", "Failed to fetch books");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (book) => {
    setEditingBook({
      _id: book._id,
      title: book.title,
      author: book.author,
      edition: book.edition,
      isbn: book.isbn,
      publishedYear: book.publishedYear,
      publisher: book.publisher,
      totalCopies: book.totalCopies,
      category: book.category?.name || "",
      coverImage: book.coverImage || "",
      description: book.description || "",
    });
    setShowEditModal(true);
  };

  const handleUpdateBook = async (e) => {
    e.preventDefault();
    try {
      await updateBook(editingBook._id, editingBook);
      showToast(dispatch, "success", "Book updated successfully!");
      setShowEditModal(false);
      setEditingBook(null);
      fetchBooks();
    } catch (err) {
      showToast(dispatch, "error", err);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    setDeletingId(deleteId);
    try {
      await deleteBook(deleteId);
      showToast(dispatch, "success", "Book deleted successfully!");
      setShowDeleteModal(false);
      setDeleteId(null);
      fetchBooks();
    } catch (err) {
      showToast(dispatch, "error", err);
    } finally {
      setDeletingId(null);
    }
  };

  const categoryOptions = categories.map((c) => ({ label: c.name, value: c._id }));

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">All Books</h1>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search by title, author, or ISBN..."
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
          />
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
            className="px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 outline-none min-w-48"
          >
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          {loading ? (
            <table className="w-full"><tbody>{Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} columns={6} />)}</tbody></table>
          ) : books.length === 0 ? (
            <EmptyState icon="📚" title="No books found" description={search || selectedCategory ? "Try adjusting your filters" : "Add some books to get started"} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Book</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ISBN</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {books.map((book) => (
                    <tr key={book._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{book.title}</p>
                          <p className="text-sm text-gray-500">{book.author}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{book.category?.name || "N/A"}</td>
                      <td className="px-6 py-4">
                        <span className={`font-medium ${book.availableCopies > 0 ? "text-green-600" : "text-red-500"}`}>
                          {book.availableCopies} / {book.totalCopies}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{book.isbn}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(book)} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">Edit</button>
                          <button onClick={() => handleDeleteClick(book._id)} className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200">Delete</button>
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

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Book" size="lg">
        {editingBook && (
          <form onSubmit={handleUpdateBook} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" value={editingBook.title} onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                <input type="text" value={editingBook.author} onChange={(e) => setEditingBook({ ...editingBook, author: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 outline-none" required />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
                <input type="text" value={editingBook.isbn} onChange={(e) => setEditingBook({ ...editingBook, isbn: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Edition</label>
                <input type="text" value={editingBook.edition} onChange={(e) => setEditingBook({ ...editingBook, edition: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Copies</label>
                <input type="number" value={editingBook.totalCopies} onChange={(e) => setEditingBook({ ...editingBook, totalCopies: parseInt(e.target.value) })} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 outline-none" required />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <CreatableSelect isMulti={false} value={{ label: editingBook.category, value: editingBook.category }} options={categoryOptions} onChange={(opt) => setEditingBook({ ...editingBook, category: opt?.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Published Year</label>
                <input type="number" value={editingBook.publishedYear} onChange={(e) => setEditingBook({ ...editingBook, publishedYear: parseInt(e.target.value) })} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 outline-none" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Publisher</label>
              <input type="text" value={editingBook.publisher} onChange={(e) => setEditingBook({ ...editingBook, publisher: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 outline-none" required />
            </div>
            <div className="flex gap-4 pt-4">
              <button type="submit" className="flex-1 py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600">Update Book</button>
              <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancel</button>
            </div>
          </form>
        )}
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Book" size="sm">
        <p className="text-gray-600 mb-6">Are you sure you want to delete this book? This action cannot be undone.</p>
        <div className="flex gap-4">
          <button onClick={handleDelete} disabled={deletingId} className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400">Delete</button>
          <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancel</button>
        </div>
      </Modal>
    </div>
  );
}