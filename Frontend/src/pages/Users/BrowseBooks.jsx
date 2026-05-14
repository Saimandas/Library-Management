import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getAllBooks } from "../../services/readerService";
import api from "../../services/readerService";
import Pagination from "../../components/Pagination";
import BookCardSkeleton from "../../components/Skeleton";
import EmptyState from "../../components/EmptyState";

export default function BrowseBooks() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const page = parseInt(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (category) params.category = category;
      const res = await getAllBooks(params);
      setBooks(res.data?.books || []);
      setTotal(res.data?.total || 0);
      setPages(res.data?.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, category]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/admin/categories");
        setCategories(res.data?.data || []);
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
    if (updates.search !== undefined || updates.category !== undefined) {
      params.delete("page");
    }
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Browse Books</h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search by title or author..."
              value={search}
              onChange={(e) => updateParams({ search: e.target.value })}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <select
              value={category}
              onChange={(e) => updateParams({ category: e.target.value })}
              className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <BookCardSkeleton key={i} />
            ))}
          </div>
        ) : books.length === 0 ? (
          <EmptyState
            icon={
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
            title="No books found"
            description={search ? "Try a different search term" : "No books in this category yet"}
          />
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{total} book{total !== 1 ? "s" : ""} found</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {books.map((book) => (
                <Link
                  key={book._id}
                  to={`/books/${book._id}`}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 overflow-hidden group"
                >
                  <div className="h-48 bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                    {book.coverImage ? (
                      <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-16 h-16 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-gray-800 truncate group-hover:text-emerald-600 transition">{book.title}</p>
                    <p className="text-sm text-gray-500 truncate">{book.author}</p>
                    {book.category && (
                      <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-full">
                        {book.category.name}
                      </span>
                    )}
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md font-medium">Read Online</span>
                      {book.pdfFile && <span className="text-xs text-gray-400">PDF</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {pages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination currentPage={page} totalPages={pages} onPageChange={(p) => updateParams({ page: p.toString() })} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
