import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { addBook, getCategories, addCategory } from "../../services/adminService";
import { showToast } from "../../components/Toast";
import CreatableSelect from "react-select/creatable";

export default function AddBook() {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    title: "", author: "", edition: "", isbn: "", publishedYear: "", publisher: "", totalCopies: "", coverImage: "", description: ""
  });
  const [category, setCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.author) newErrors.author = "Author is required";
    if (!formData.edition) newErrors.edition = "Edition is required";
    if (!formData.isbn) newErrors.isbn = "ISBN is required";
    if (!formData.publishedYear) newErrors.publishedYear = "Published year is required";
    if (!formData.publisher) newErrors.publisher = "Publisher is required";
    if (!formData.totalCopies || parseInt(formData.totalCopies) < 1) newErrors.totalCopies = "Total copies must be at least 1";
    if (!category) newErrors.category = "Category is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleCategoryChange = (selectedOption) => {
    setCategory(selectedOption);
  };

  const handleCreateCategory = async (inputValue) => {
    try {
      const data = await addCategory(inputValue);
      setCategories([...categories, data.data]);
      setCategory({ label: inputValue, value: data.data._id });
      showToast(dispatch, "success", "Category created!");
    } catch (err) {
      showToast(dispatch, "error", "Failed to create category");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await addBook({ ...formData, totalCopies: parseInt(formData.totalCopies), category: category?.label });
      showToast(dispatch, "success", "Book added successfully!");
      setFormData({ title: "", author: "", edition: "", isbn: "", publishedYear: "", publisher: "", totalCopies: "", coverImage: "", description: "" });
      setCategory(null);
    } catch (err) {
      showToast(dispatch, "error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({ title: "", author: "", edition: "", isbn: "", publishedYear: "", publisher: "", totalCopies: "", coverImage: "", description: "" });
    setCategory(null);
  };

  const categoryOptions = categories.map((c) => ({ label: c.name, value: c._id }));

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Add New Book</h1>
          <p className="text-gray-500 mt-1">Fill the details to add a book to the library</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Book Title *</label>
              <input type="text" value={formData.title} onChange={(e) => handleChange("title", e.target.value)} placeholder="Enter book title"
                className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-amber-400 ${errors.title ? "border-red-500" : "border-gray-300"}`} />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Author *</label>
              <input type="text" value={formData.author} onChange={(e) => handleChange("author", e.target.value)} placeholder="Enter author name"
                className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-amber-400 ${errors.author ? "border-red-500" : "border-gray-300"}`} />
              {errors.author && <p className="text-red-500 text-sm mt-1">{errors.author}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Edition *</label>
                <input type="text" value={formData.edition} onChange={(e) => handleChange("edition", e.target.value)} placeholder="e.g. 1st Edition"
                  className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-amber-400 ${errors.edition ? "border-red-500" : "border-gray-300"}`} />
                {errors.edition && <p className="text-red-500 text-sm mt-1">{errors.edition}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">ISBN *</label>
                <input type="text" value={formData.isbn} onChange={(e) => handleChange("isbn", e.target.value)} placeholder="Enter ISBN"
                  className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-amber-400 ${errors.isbn ? "border-red-500" : "border-gray-300"}`} />
                {errors.isbn && <p className="text-red-500 text-sm mt-1">{errors.isbn}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Category *</label>
              <div className="[&_.css-1u6t5l5-input]:!outline-none [&_.css-1u6t5l5-input]:!ring-0">
              <CreatableSelect
                isClearable
                value={category}
                options={categoryOptions}
                onChange={handleCategoryChange}
                onCreateOption={handleCreateCategory}
                placeholder="Select or create category"
                styles={{
                  control: (base) => ({
                    ...base,
                    borderRadius: '0.75rem',
                    borderColor: errors.category ? '#ef4444' : '#d1d5db',
                    padding: '6px',
                    minHeight: '48px',
                    '&:hover': { borderColor: '#d97706' },
                    '&:focus-within': { borderColor: '#d97706', boxShadow: '0 0 0 2px rgba(217, 119, 6, 0.2)' }
                  }),
                  placeholder: (base) => ({ ...base, color: '#9ca3af' }),
                  input: (base) => ({ ...base, color: '#374151' })
                }}
              />
            </div>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Total Copies *</label>
                <input type="number" value={formData.totalCopies} onChange={(e) => handleChange("totalCopies", e.target.value)} placeholder="0" min="1"
                  className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-amber-400 ${errors.totalCopies ? "border-red-500" : "border-gray-300"}`} />
                {errors.totalCopies && <p className="text-red-500 text-sm mt-1">{errors.totalCopies}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Published Year *</label>
                <input type="number" value={formData.publishedYear} onChange={(e) => handleChange("publishedYear", e.target.value)} placeholder="e.g. 2020"
                  className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-amber-400 ${errors.publishedYear ? "border-red-500" : "border-gray-300"}`} />
                {errors.publishedYear && <p className="text-red-500 text-sm mt-1">{errors.publishedYear}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Publisher *</label>
              <input type="text" value={formData.publisher} onChange={(e) => handleChange("publisher", e.target.value)} placeholder="Enter publisher name"
                className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-amber-400 ${errors.publisher ? "border-red-500" : "border-gray-300"}`} />
              {errors.publisher && <p className="text-red-500 text-sm mt-1">{errors.publisher}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Cover Image URL (optional)</label>
              <input type="url" value={formData.coverImage} onChange={(e) => handleChange("coverImage", e.target.value)} placeholder="https://..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-400" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Description (optional)</label>
              <textarea value={formData.description} onChange={(e) => handleChange("description", e.target.value)} placeholder="Book description..."
                rows="3" className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
            </div>

            <div className="flex gap-4 pt-4">
              <button type="submit" disabled={loading}
                className="flex-1 py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 disabled:bg-amber-300 transition">
                {loading ? "Adding..." : "Add Book"}
              </button>
              <button type="button" onClick={handleClear}
                className="flex-1 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition">
                Clear
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}