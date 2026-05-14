import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CreatableSelect from "react-select/creatable";
import { addBook, getCategories, addCategory } from "../../services/adminService";
import { showToast } from "../../components/Toast";
import { useDispatch } from "react-redux";

export default function AddBook() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [form, setForm] = useState({
    title: "", author: "", category: null, edition: "", isbn: "",
    publishedYear: "", publisher: "", coverImage: "", description: "", pages: ""
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await getCategories();
        setCategories((res.data || []).map((c) => ({ value: c._id, label: c.name })));
      } catch (err) {
        showToast(dispatch, "error", "Failed to load categories");
      }
    })();
  }, [dispatch]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.author || !form.category || !form.edition || !form.publishedYear || !form.publisher) {
      showToast(dispatch, "error", "Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("author", form.author);
      formData.append("category", form.category.label);
      formData.append("edition", form.edition);
      if (form.isbn) formData.append("isbn", form.isbn);
      formData.append("publishedYear", form.publishedYear);
      formData.append("publisher", form.publisher);
      if (form.coverImage) formData.append("coverImage", form.coverImage);
      if (form.description) formData.append("description", form.description);
      if (form.pages) formData.append("pages", form.pages);
      if (pdfFile) formData.append("pdfFile", pdfFile);

      await addBook(formData);
      showToast(dispatch, "success", "Book added successfully!");
      navigate("/admin/books");
    } catch (err) {
      showToast(dispatch, "error", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Add New Book</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input name="title" value={form.title} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Author *</label>
            <input name="author" value={form.author} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <CreatableSelect
              isClearable
              placeholder="Select or create..."
              options={categories}
              value={form.category}
              onChange={(val) => setForm({ ...form, category: val })}
              onCreateOption={async (inputValue) => {
                try {
                  const res = await addCategory(inputValue);
                  const newOption = { value: res.data._id, label: res.data.name };
                  setCategories([...categories, newOption]);
                  setForm({ ...form, category: newOption });
                  showToast(dispatch, "success", "Category created");
                } catch (err) {
                  showToast(dispatch, "error", err);
                }
              }}
              className="[&_.css-13cymwt-control]:border-gray-300 [&_.css-13cymwt-control]:hover:border-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Edition *</label>
            <input name="edition" value={form.edition} onChange={handleChange} placeholder="e.g., 1st Edition" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
            <input name="isbn" value={form.isbn} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Published Year *</label>
            <input type="number" name="publishedYear" value={form.publishedYear} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Publisher *</label>
            <input name="publisher" value={form.publisher} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pages</label>
            <input type="number" name="pages" value={form.pages} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
          <input name="coverImage" value={form.coverImage} onChange={handleChange} placeholder="https://..." className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">PDF File</label>
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => setPdfFile(e.target.files[0])}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-amber-50 file:text-amber-700 file:font-medium hover:file:bg-amber-100"
          />
          {pdfFile && <p className="text-xs text-gray-500 mt-1">Selected: {pdfFile.name} ({(pdfFile.size / 1048576).toFixed(1)} MB)</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none resize-none" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="px-6 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 font-medium">
            {loading ? "Adding Book..." : "Add Book"}
          </button>
          <button type="button" onClick={() => navigate("/admin/books")} className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
