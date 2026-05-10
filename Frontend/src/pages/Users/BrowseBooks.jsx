import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { getAllBooks } from "../../services/readerService";
import { getCategories } from "../../services/adminService";
import Pagination from "../../components/Pagination";
import { BookCardSkeleton } from "../../components/Skeleton";
import EmptyState from "../../components/EmptyState";

export default function BrowseBooks() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { isAuthenticated } = useSelector((state) => state.auth);

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
      const params = { page: currentPage, limit: 12 };
      if (search) params.search = search;
      if (selectedCategory) params.category = selectedCategory;
      const data = await getAllBooks(params);
      setBooks(data.data.books);
      setTotalPages(data.data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBooks();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Browse Books</h1>
          
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or author..."
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700"
              >
                Search
              </button>
            </form>
            
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
              className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none min-w-48"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <BookCardSkeleton key={i} />)}
          </div>
        ) : books.length === 0 ? (
          <EmptyState
            icon="📚"
            title="No books found"
            description={search || selectedCategory ? "Try adjusting your search or filters" : "No books available yet"}
            action={search || selectedCategory ? { label: "Clear Filters", onClick: () => { setSearch(""); setSelectedCategory(""); } } : null}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {books.map((book) => (
                <Link
                  key={book._id}
                  to={`/books/${book._id}`}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition group"
                >
                  <div className="h-48 bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
                    {book.coverImage ? (
                      <img src={book.coverImage} alt={book.title} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-white text-6xl font-bold opacity-30">{book.title[0]}</span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition line-clamp-2">{book.title}</h3>
                    <p className="text-gray-500 text-sm mt-1">{book.author}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                        {book.category?.name || "Uncategorized"}
                      </span>
                      <span className={`text-sm font-medium ${book.availableCopies > 0 ? "text-green-600" : "text-red-500"}`}>
                        {book.availableCopies > 0 ? `${book.availableCopies} available` : "Not available"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </>
        )}
      </div>
    </div>
  );
}