import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeToast } from "../redux/toastSlice";

const Toast = () => {
  const toasts = useSelector((state) => state.toast.toasts);
  const dispatch = useDispatch();

  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        dispatch(removeToast(toasts[0].id));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toasts, dispatch]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`animate-slide-in-right flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg min-w-72 ${
            toast.type === "success"
              ? "bg-green-600 text-white"
              : toast.type === "error"
              ? "bg-red-600 text-white"
              : toast.type === "warning"
              ? "bg-yellow-600 text-white"
              : "bg-blue-600 text-white"
          }`}
        >
          <span className="text-xl">
            {toast.type === "success" && "✓"}
            {toast.type === "error" && "✕"}
            {toast.type === "warning" && "⚠"}
            {toast.type === "info" && "ℹ"}
          </span>
          <span className="flex-1 text-sm">{toast.message}</span>
          <button
            onClick={() => dispatch(removeToast(toast.id))}
            className="text-lg hover:opacity-70"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export const showToast = (dispatch, type, message) => {
  const id = Date.now().toString();
  dispatch({ type: "toast/addToast", payload: { id, type, message } });
};

export default Toast;