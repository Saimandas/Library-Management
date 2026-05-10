import { useEffect, useState } from "react";
import AdminNavbar from "./components/AdminNavbar";
import { Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUser, clearUser } from "./redux/authSlice";
import { getCurrentAdmin } from "./services/adminService";
import LoadingScreen from "./components/LoadingScreen";

const Admin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await getCurrentAdmin();
        dispatch(setUser({ ...data.data, isAdmin: true }));
        setIsLoading(false);
      } catch (err) {
        dispatch(clearUser());
        navigate("/admin/login");
      }
    };
    checkAuth();
  }, [dispatch, navigate]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user?.isAdmin) {
    navigate("/admin/login");
    return null;
  }

  return (
    <>
      <AdminNavbar />
      <Outlet />
    </>
  );
};

export default Admin;