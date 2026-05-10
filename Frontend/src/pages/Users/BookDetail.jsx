import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getBookById, borrowBook as borrowBookService } from "../../services/readerService";
import { showToast } from "../../components/Toast";
import Skeleton from "../../components/Skeleton";

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(false);
  const [alreadyBorrowed, setAlreadyBorrowed] = useState(false);

  useEffect(() => {
    fetchBook();
  }, [id]);

  const fetchBook = async () => {
    try {
      const data = await getBookById(id);
      setBook(data.data);
      if (data.data.alreadyBorrowed) setAlreadyBorrowed(true);
    } catch (err) {
      showToast(dispatch, "error", "Failed to load book details");
      navigate("/books");
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/books/${id}` } });
      return;
    }
    setBorrowing(true);
    try {
      await borrowBookService(id);
      showToast(dispatch, "success", "Book borrowed successfully!");
      fetchBook();
    } catch (err) {
      showToast(dispatch, "error", err);
    } finally {
      setBorrowing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex flex-col md:flex-row gap-8">
              <Skeleton className="w-full md:w-64 h-80 rounded-xl" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900">
          ← Back
        </button>
        
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-72 h-80 bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shrink-0">
              {book.coverImage ? (
                <img src={book.coverImage} alt={book.title} className="h-full w-full object-cover" />
              ) : (
                <span className="text-white text-8xl font-bold opacity-30">{book.title[0]}</span>
              )}
            </div>
            
            <div className="p-8 flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{book.title}</h1>
                  <p className="text-lg text-gray-600 mt-1">by {book.author}</p>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                  {book.category?.name || "Uncategorized"}
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">ISBN</p>
                  <p className="font-medium">{book.isbn || "N/A"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Edition</p>
                  <p className="font-medium">{book.edition}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Published</p>
                  <p className="font-medium">{book.publishedYear}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Publisher</p>
                  <p className="font-medium">{book.publisher}</p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div>
                  <span className={`text-lg font-bold ${book.availableCopies > 0 ? "text-green-600" : "text-red-500"}`}>
                    {book.availableCopies} of {book.totalCopies} copies available
                  </span>
                </div>
                <button
                  onClick={handleBorrow}
                  disabled={borrowing || book.availableCopies === 0}
                  className={`px-8 py-3 rounded-lg font-semibold transition ${
                    book.availableCopies === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : alreadyBorrowed
                      ? "bg-emerald-200 text-emerald-800 cursor-not-allowed"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  {borrowing ? "Processing..." : alreadyBorrowed ? "Already Borrowed" : book.availableCopies === 0 ? "Not Available" : "Borrow Book"}
                </button>
              </div>

              {book.description && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{book.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}