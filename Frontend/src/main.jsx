import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./User.jsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Homepage from "./pages/Users/Homepage.jsx";
import LoginPage from "./pages/Users/LoginPage.jsx";
import RegisterPage from "./pages/Users/RegisterPage.jsx";
import ForgotPassword from "./pages/Users/ForgotPassword.jsx";
import ResetPassword from "./pages/Users/ResetPassword.jsx";
import PdfReaderPage from "./pages/Users/PdfReaderPage.jsx";
import Dashboard from "./pages/admin/DashBoard.jsx";
import AddBooks from "./pages/admin/AddBook.jsx";
import Admin from "./Admin.jsx";
import Users from "./pages/admin/ViewUsers.jsx";
import { Provider } from "react-redux";
import store from "./redux/store.js";
import Books from "./pages/admin/ViewBooks.jsx";
import AdminLogin from "./pages/admin/AdminLogin.jsx";
import Toast from "./components/Toast.jsx";
import BrowseBooks from "./pages/Users/BrowseBooks.jsx";
import BookDetail from "./pages/Users/BookDetail.jsx";
import Profile from "./pages/Users/Profile.jsx";
import NotFound from "./pages/Users/NotFound.jsx";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <BrowserRouter>
      <Toast />
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Homepage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password/:token" element={<ResetPassword />} />
          <Route path="books" element={<BrowseBooks />} />
          <Route path="books/:id" element={<BookDetail />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/books/:id/read" element={<PdfReaderPage />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<Admin />}>
          <Route index element={<Dashboard />} />
          <Route path="add-books" element={<AddBooks />} />
          <Route path="view-users" element={<Users />} />
          <Route path="books" element={<Books />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </Provider>
);
