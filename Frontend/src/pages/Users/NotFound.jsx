import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 py-16">
      <span className="text-8xl mb-6">🔍</span>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
      <h2 className="text-xl font-semibold text-gray-700 mb-2">Page Not Found</h2>
      <p className="text-gray-500 mb-8 text-center max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition"
      >
        Go Home
      </Link>
    </div>
  );
}