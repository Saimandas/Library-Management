import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { getBookById } from "../../services/readerService";
import Skeleton from "../../components/Skeleton";
import { showToast } from "../../components/Toast";
import { useDispatch } from "react-redux";

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadLoading, setDownloadLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getBookById(id);
        setBook(res.data);
      } catch (err) {
        showToast(dispatch, "error", "Failed to load book");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const getDownloadStatus = () => {
    if (!isAuthenticated) return { allowed: false, message: "Login to download this book", action: "login" };
    if (!user?.isApproved) return { allowed: false, message: "Account pending approval", action: null };
    return { allowed: true, message: "Download PDF", action: "download" };
  };

  const handleDownload = async () => {
    const status = getDownloadStatus();
    if (status.action === "login") {
      navigate("/login");
      return;
    }
    if (!status.allowed) return;

    setDownloadLoading(true);
    try {
      const a = document.createElement("a");
      a.href = `/api/readers/books/${book._id}/download`;
      a.download = `${book.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast(dispatch, "success", "Download started");
    } catch (err) {
      showToast(dispatch, "error", "Download failed");
    } finally {
      setDownloadLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="flex gap-8">
          <Skeleton className="w-64 h-80 rounded-xl" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-xl text-gray-500">Book not found</p>
        <Link to="/books" className="mt-4 inline-block text-emerald-600 hover:underline">Back to Browse</Link>
      </div>
    );
  }

  const downloadStatus = getDownloadStatus();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-emerald-600">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/books" className="hover:text-emerald-600">Books</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 font-medium">{book.title}</span>
      </nav>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-72 shrink-0">
          <div className="bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl h-80 flex items-center justify-center shadow-md">
            {book.coverImage ? (
              <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover rounded-xl" />
            ) : (
              <svg className="w-24 h-24 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            )}
          </div>
        </div>

        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{book.title}</h1>
          <p className="text-lg text-gray-600 mb-1">by {book.author}</p>
          {book.category && (
            <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium mb-4">
              {book.category.name}
            </span>
          )}

          <div className="grid grid-cols-2 gap-3 my-4 text-sm">
            {book.isbn && <div><span className="text-gray-500">ISBN:</span> <span className="text-gray-800">{book.isbn}</span></div>}
            {book.publisher && <div><span className="text-gray-500">Publisher:</span> <span className="text-gray-800">{book.publisher}</span></div>}
            {book.edition && <div><span className="text-gray-500">Edition:</span> <span className="text-gray-800">{book.edition}</span></div>}
            {book.publishedYear && <div><span className="text-gray-500">Year:</span> <span className="text-gray-800">{book.publishedYear}</span></div>}
            {book.pages && <div><span className="text-gray-500">Pages:</span> <span className="text-gray-800">{book.pages}</span></div>}
            {book.fileSize && <div><span className="text-gray-500">File Size:</span> <span className="text-gray-800">{(book.fileSize / 1048576).toFixed(1)} MB</span></div>}
          </div>

          {book.description && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-800 mb-1">Description</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{book.description}</p>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                if (book.pdfFile) navigate(`/books/${book._id}/read`);
                else showToast(dispatch, "warning", "PDF not available");
              }}
              disabled={!book.pdfFile}
              className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Read Online
            </button>

            <button
              onClick={handleDownload}
              disabled={!book.pdfFile || downloadLoading || !downloadStatus.allowed}
              className={`flex-1 py-3 rounded-xl font-medium transition flex items-center justify-center gap-2 ${
                downloadStatus.allowed
                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {downloadLoading ? "Downloading..." : downloadStatus.message}
            </button>
          </div>

          {!isAuthenticated && book.pdfFile && (
            <p className="text-xs text-gray-400 mt-2 text-center">
              <Link to="/login" className="text-emerald-600 hover:underline">Login</Link> or <Link to="/register" className="text-emerald-600 hover:underline">Register</Link> to download PDFs
            </p>
          )}
          {isAuthenticated && !user?.isApproved && book.pdfFile && (
            <p className="text-xs text-amber-600 mt-2 text-center">Your account is pending admin approval. Download will be available once approved.</p>
          )}
        </div>
      </div>
    </div>
  );
}
