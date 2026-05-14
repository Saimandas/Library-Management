import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllBooks } from "../../services/readerService";
import api from "../../services/readerService";
import Skeleton from "../../components/Skeleton";

export default function Homepage() {
  const [categories, setCategories] = useState([]);
  const [categoryBooks, setCategoryBooks] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const catRes = await api.get("/admin/categories");
        const cats = catRes.data.data || [];
        setCategories(cats);

        const bookPromises = cats.slice(0, 6).map(async (cat) => {
          const res = await getAllBooks({ category: cat._id, limit: 6 });
          return { [cat._id]: res.data?.books || [] };
        });
        const results = await Promise.all(bookPromises);
        setCategoryBooks(Object.assign({}, ...results));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/books?search=${encodeURIComponent(search.trim())}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Skeleton className="h-64 w-full mb-8 rounded-2xl" />
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Discover Your Next Read</h1>
            <p className="text-emerald-100 text-lg mb-8">Browse thousands of digital books. Read online for free. Download with an account.</p>
            <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mx-auto">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or author..."
                className="flex-1 px-5 py-3 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-300 outline-none"
              />
              <button type="submit" className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 rounded-xl font-medium transition">
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Browse by Category</h2>
          <Link to="/books" className="text-emerald-600 hover:text-emerald-700 font-medium text-sm">View All →</Link>
        </div>
        {categories.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg">No categories available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/books?category=${cat._id}`}
                className="bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition border border-gray-100"
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <p className="font-medium text-gray-700 text-sm truncate">{cat.name}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {categories.slice(0, 4).map((cat) => {
        const books = categoryBooks[cat._id] || [];
        if (books.length === 0) return null;
        return (
          <section key={cat._id} className="max-w-7xl mx-auto px-4 pb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">{cat.name}</h2>
              <Link to={`/books?category=${cat._id}`} className="text-emerald-600 hover:text-emerald-700 font-medium text-sm">View All →</Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
              {books.map((book) => (
                <Link
                  key={book._id}
                  to={`/books/${book._id}`}
                  className="flex-shrink-0 w-40 bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 overflow-hidden"
                >
                  <div className="h-48 bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                    {book.coverImage ? (
                      <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-12 h-12 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-medium text-gray-800 text-sm truncate">{book.title}</p>
                    <p className="text-xs text-gray-500 truncate">{book.author}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-full">Read Online</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      <section className="bg-emerald-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-3">Start Reading Today</h2>
          <p className="text-emerald-100 mb-6 max-w-lg mx-auto">Create an account to download books and track your reading history. It's free!</p>
          <div className="flex gap-3 justify-center">
            <Link to="/register" className="px-6 py-3 bg-white text-emerald-700 rounded-xl font-medium hover:bg-emerald-50 transition">
              Get Started
            </Link>
            <Link to="/books" className="px-6 py-3 border border-emerald-400 rounded-xl font-medium hover:bg-emerald-500 transition">
              Browse Books
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
