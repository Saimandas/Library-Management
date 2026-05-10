import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUser } from '../../redux/authSlice'
import { useNavigate, NavLink } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
import Loader from "../../components/Loader";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { status, isAdmin } = useSelector((state) => state.auth);

  const [totalUsers, setTotalUsers] = useState(0);
  const [totalBooks, setTotalBooks] = useState(0);

  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  useEffect(() => {
    if (status === "succeeded" && !isAdmin) {
      navigate("/admin/login");
    }
  }, [status, isAdmin, navigate]);

  useEffect(() => {
    if (status === "succeeded" && isAdmin) {
      const fetchData = async () => {
        const [booksRes, usersRes] = await Promise.all([
          axios.get("/api/admin/total-books"),
          axios.get("/api/admin/total-users")
        ]);

        setTotalBooks(booksRes.data.data);
        setTotalUsers(usersRes.data.data);
      };

      fetchData();
    }
  }, [status, isAdmin]);

  if (status === "loading" || isAdmin === undefined) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="bg-white rounded-2xl p-6 shadow-md border">
          <p className="text-sm text-gray-500">Total Books</p>
          <h2 className="text-3xl font-bold text-gray-800 mt-2">
            {totalBooks}
          </h2>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md border">
          <p className="text-sm text-gray-500">Total Users</p>
          <h2 className="text-3xl font-bold text-gray-800 mt-2">
            {totalUsers}
          </h2>
        </div>

      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Quick Actions
        </h2>

        <div className="flex flex-wrap gap-4">
          <NavLink to="/admin/add-books">
            <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition">
              Add Books
            </button>
          </NavLink>

          <NavLink to="/admin/view-users">
            <button className="px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition">
              View Users
            </button>
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;