import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getBookById } from "../../services/readerService";
import PdfViewer from "../../components/PdfViewer";
import Skeleton from "../../components/Skeleton";
import api from "../../services/readerService";

export default function PdfReaderPage() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [pdfData, setPdfData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getBookById(id);
        setBook(res.data);

        if (res.data.pdfFile) {
          const pdfRes = await api.get(`/readers/books/${id}/read`, {
            responseType: "arraybuffer"
          });
          setPdfData(pdfRes.data);
        }
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

  if (!pdfData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0s]" />
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.15s]" />
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.3s]" />
        </div>
      </div>
    );
  }

  return (
    <PdfViewer
      pdfData={new Uint8Array(pdfData)}
      title={book.title}
    />
  );
}
