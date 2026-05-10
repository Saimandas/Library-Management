import { NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "../redux/authSlice";
import { logoutUser } from "../services/readerService";
import { showToast } from "./Toast";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  return (
    <div className="h-20 bg-green-50 border-b border-green-200 flex items-center justify-between px-10 md:px-24 shadow-sm">
      
      <NavLink to="/" className="text-2xl font-bold text-emerald-800">
        Book-Flow
      </NavLink>

      <div className="flex items-center gap-6 text-emerald-800 font-medium">
        {!isAuthenticated ? (
          <>
            <NavLink to="/admin/login" className="hover:text-emerald-600 transition">
              Admin
            </NavLink>
            <NavLink to="/register" className="hover:text-emerald-600 transition">
              Register
            </NavLink>
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `transition px-5 py-2 rounded-lg font-semibold shadow ${
                  isActive ? "bg-gray-300" : "bg-emerald-600 text-white"
                }`
              }
            >
              Login
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/books" className="hover:text-emerald-600 transition">
              Browse
            </NavLink>
            <NavLink to="/my-books" className="hover:text-emerald-600 transition">
              My Books
            </NavLink>
            <NavLink to="/profile" className="hover:text-emerald-600 transition">
              Profile
            </NavLink>
            <button
              onClick={handleLogout}
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
              <span className="text-sm font-medium">
                {user?.firstName} {user?.lastName}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;