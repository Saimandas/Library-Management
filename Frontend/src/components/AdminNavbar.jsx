import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearUser } from "../redux/authSlice";
import api from "../services/readerService";
import { showToast } from "./Toast";

const AdminNavbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/admin/logout");
    } catch (err) {
      console.error("Logout error:", err);
    }
    dispatch(clearUser());
    showToast(dispatch, "success", "Logged out successfully!");
    navigate("/admin/login");
  };

  return (
    <div className="w-full bg-white border-b shadow-sm px-6 md:px-10 py-4 flex justify-between items-center">
      
      <h1 className="text-xl md:text-2xl font-bold text-emerald-800">
        Book-Flow
      </h1>

      <div className="hidden md:flex items-center gap-6 text-emerald-700 font-medium">
        
        <NavLink to="/admin/" end>
          {({ isActive }) => (
            <button className={`transition relative pb-1 
              ${isActive ? "text-gray-900 after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-gray-900 after:rounded" : "hover:text-gray-900"}`}>
              Dashboard
            </button>
          )}
        </NavLink>

        <NavLink to={"/admin/add-books"}>
          {({ isActive }) => (
            <button className={`transition relative pb-1 
              ${isActive ? "text-gray-900 after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-gray-900 after:rounded" : "hover:text-gray-900"}`}>
              Add Books
            </button>
          )}
        </NavLink>

        <NavLink to={"/admin/books"}>
          {({ isActive }) => (
            <button className={`transition relative pb-1 
              ${isActive ? "text-gray-900 after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-gray-900 after:rounded" : "hover:text-gray-900"}`}>
              Books
            </button>
          )}
        </NavLink>

        <NavLink to="/admin/view-users">
          {({ isActive }) => (
            <button className={`transition relative pb-1 
              ${isActive ? "text-gray-900 after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-gray-900 after:rounded" : "hover:text-gray-900"}`}>
              Users
            </button>
          )}
        </NavLink>

      </div>

      <div className="flex items-center gap-4">
        <span className="hidden sm:block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium">
          Admin
        </span>

        <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition">
          Logout
        </button>
      </div>

    </div>
  );
};

export default AdminNavbar;