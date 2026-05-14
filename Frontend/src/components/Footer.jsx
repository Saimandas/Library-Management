import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-emerald-900 text-emerald-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-3">Book Flow</h3>
            <p className="text-emerald-200 text-sm leading-relaxed">
              Your digital library. Read online, download with an account. Discover thousands of books.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Quick Links</h4>
            <div className="space-y-2 text-sm">
              <Link to="/" className="block text-emerald-200 hover:text-white transition">Home</Link>
              <Link to="/books" className="block text-emerald-200 hover:text-white transition">Browse Books</Link>
              <Link to="/login" className="block text-emerald-200 hover:text-white transition">Login</Link>
              <Link to="/register" className="block text-emerald-200 hover:text-white transition">Register</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Contact</h4>
            <p className="text-emerald-200 text-sm">
              Have questions? Reach out to our support team.
            </p>
          </div>
        </div>
        <div className="border-t border-emerald-800 mt-8 pt-6 text-center text-sm text-emerald-300">
          &copy; {new Date().getFullYear()} Book Flow. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
