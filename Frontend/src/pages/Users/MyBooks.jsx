import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getMyBorrows, getMyTransactions, returnBook } from "../../services/readerService";
import { showToast } from "../../components/Toast";
import EmptyState from "../../components/EmptyState";
import { TableRowSkeleton } from "../../components/Skeleton";

export default function MyBooks() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [activeBorrows, setActiveBorrows] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("borrowed");
  const [returning, setReturning] = useState(null);

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      const [borrows, trans] = await Promise.all([getMyBorrows(), getMyTransactions()]);
      setActiveBorrows(borrows.data);
      setTransactions(trans.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (transactionId, bookTitle) => {
    if (!confirm(`Return "${bookTitle}"?`)) return;
    setReturning(transactionId);
    try {
      await returnBook(transactionId);
      showToast(dispatch, "success", "Book returned successfully!");
      fetchData();
    } catch (err) {
      showToast(dispatch, "error", err);
    } finally {
      setReturning(null);
    }
  };

  const isOverdue = (returnDate) => {
    return new Date(returnDate) < new Date();
  };

  const getDaysLeft = (returnDate) => {
    const diff = new Date(returnDate) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">My Books</h1>
          <table className="w-full bg-white rounded-xl shadow">
            <tbody>{Array.from({ length: 3 }).map((_, i) => <TableRowSkeleton key={i} columns={5} />)}</tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Books</h1>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("borrowed")}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              activeTab === "borrowed" ? "bg-emerald-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            Currently Borrowed ({activeBorrows.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              activeTab === "history" ? "bg-emerald-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            History ({transactions.filter(t => t.transactionType === "return").length})
          </button>
        </div>

        {activeTab === "borrowed" ? (
          activeBorrows.length === 0 ? (
            <EmptyState
              icon="📖"
              title="No borrowed books"
              description="You haven't borrowed any books yet"
              action={{ label: "Browse Books", onClick: () => {} }}
            />
          ) : (
            <div className="space-y-4">
              {activeBorrows.map((t) => (
                <div key={t._id} className="bg-white rounded-xl shadow-md p-6 flex items-center gap-6">
                  <div className="w-16 h-20 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-emerald-600 text-2xl font-bold">{t.bookId?.title?.[0]}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">{t.bookId?.title}</h3>
                    <p className="text-gray-500">by {t.bookId?.author}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Borrowed on: {new Date(t.issueDate).toLocaleDateString()}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`text-sm font-medium ${isOverdue(t.returnDate) ? "text-red-500" : "text-green-600"}`}>
                        {isOverdue(t.returnDate) ? `Overdue by ${Math.abs(getDaysLeft(t.returnDate))} days` : `${getDaysLeft(t.returnDate)} days left`}
                      </span>
                      {isOverdue(t.returnDate) && <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">Overdue</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleReturn(t._id, t.bookId?.title)}
                    disabled={returning === t._id}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-emerald-400 transition shrink-0"
                  >
                    {returning === t._id ? "Returning..." : "Return Book"}
                  </button>
                </div>
              ))}
            </div>
          )
        ) : transactions.filter(t => t.transactionType === "return").length === 0 ? (
          <EmptyState icon="📜" title="No history" description="Your borrowing history will appear here" />
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Book</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Borrowed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Returned</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {transactions.filter(t => t.transactionType === "return").map((t) => (
                  <tr key={t._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link to={`/books/${t.bookId?._id}`} className="text-gray-900 hover:text-emerald-600">
                        {t.bookId?.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{new Date(t.issueDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-gray-600">{new Date(t.issueDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Returned</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}