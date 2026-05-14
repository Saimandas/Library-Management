import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "../redux/authSlice";
import { logoutUser } from "../services/readerService";
import { showToast } from "./Toast";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
      dispatch(clearUser());
      showToast(dispatch, "success", "Logged out successfully!");
      navigate("/");
    } catch (err) {
      dispatch(clearUser());
      navigate("/");
    }
  };

  const linkClass = ({ isActive }) =>
    `transition hover:text-emerald-600 ${isActive ? "text-emerald-700 font-semibold" : ""}`;

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="bg-green-50 border-b border-green-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          <NavLink to="/" className="text-xl md:text-2xl font-bold text-emerald-800 shrink-0" onClick={closeMenu}>
            Book Flow
          </NavLink>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-emerald-700 hover:bg-emerald-100 transition"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          <div className="hidden md:flex items-center gap-5 lg:gap-6 text-emerald-800 font-medium">
            <NavLink to="/" end className={linkClass}>Home</NavLink>
            <NavLink to="/books" className={linkClass}>Browse</NavLink>
            {!isAuthenticated ? (
              <>
                <NavLink to="/admin/login" className={linkClass}>Admin</NavLink>
                <NavLink to="/register" className={linkClass}>Register</NavLink>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `transition px-5 py-2 rounded-lg font-semibold shadow ${
                      isActive ? "bg-gray-300" : "bg-emerald-600 text-white hover:bg-emerald-700"
                    }`
                  }
                >
                  Login
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/profile" className={linkClass}>Profile</NavLink>
                <button
                  onClick={() => setShowLogout(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 transition px-5 py-2 rounded-lg text-white font-semibold shadow"
                >
                  Logout
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </span>
                  </div>
                  <span className="text-sm font-medium hidden lg:inline">
                    {user?.firstName} {user?.lastName}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-green-200 mt-2 pt-4 space-y-2 text-emerald-800 font-medium">
            <NavLink to="/" end className={linkClass} onClick={closeMenu}>
              <span className="block px-3 py-2 rounded-lg hover:bg-emerald-100">Home</span>
            </NavLink>
            <NavLink to="/books" className={linkClass} onClick={closeMenu}>
              <span className="block px-3 py-2 rounded-lg hover:bg-emerald-100">Browse</span>
            </NavLink>
            {!isAuthenticated ? (
              <>
                <NavLink to="/admin/login" className={linkClass} onClick={closeMenu}>
                  <span className="block px-3 py-2 rounded-lg hover:bg-emerald-100">Admin</span>
                </NavLink>
                <NavLink to="/register" className={linkClass} onClick={closeMenu}>
                  <span className="block px-3 py-2 rounded-lg hover:bg-emerald-100">Register</span>
                </NavLink>
                <NavLink to="/login" onClick={closeMenu}>
                  <span className="block px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-center">Login</span>
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/profile" className={linkClass} onClick={closeMenu}>
                  <span className="block px-3 py-2 rounded-lg hover:bg-emerald-100">Profile</span>
                </NavLink>
                <div className="flex items-center gap-2 px-3 py-2">
                  <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </span>
                  </div>
                  <span className="text-sm">{user?.firstName} {user?.lastName}</span>
                </div>
                <button
                  onClick={() => { setShowLogout(true); closeMenu(); }}
                  className="w-full text-left px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={showLogout} onClose={() => setShowLogout(false)} title="Confirm Logout" size="sm">
        <p className="text-gray-600 mb-4">Are you sure you want to logout?</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => setShowLogout(false)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </Modal>
    </nav>
  );
};

export default Navbar;
