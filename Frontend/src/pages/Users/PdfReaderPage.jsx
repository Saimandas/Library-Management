import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getBookById } from "../../services/readerService";
import PdfViewer from "../../components/PdfViewer";
import Skeleton from "../../components/Skeleton";

export default function PdfReaderPage() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getBookById(id);
        setBook(res.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-[80vh] w-full" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <p className="text-xl font-semibold mb-2">Book not found</p>
          <p className="text-sm">{error || "Unable to load this book."}</p>
        </div>
      </div>
    );
  }

  if (!book.pdfFile) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <p className="text-xl font-semibold mb-2">PDF not available</p>
          <p className="text-sm">This book does not have a PDF file yet.</p>
        </div>
      </div>
    );
  }

  return (
    <PdfViewer
      pdfUrl={`/api/readers/books/${book._id}/read`}
      title={book.title}
    />
  );
}
