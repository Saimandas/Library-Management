import axios from "axios";
import React, { useEffect, useState } from "react";

const Books = () => {
  const [books, setbooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get("/api/admin/books");
        console.log("Books fetched successfully:", response.data);
        
        if (response.data) {
          setbooks(response.data.data);
        }
      } catch (error) {
        alert("Error fetching books:", error.response.data.message || error.message);
      }
    };
    fetchBooks();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6 md:p-10">

      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">
        All Books
      </h1>

      <div className="backdrop-blur-lg bg-white/60 border border-white/30 rounded-2xl shadow-lg p-6 transition-all duration-500 hover:shadow-xl">

        {books.length > 0 && (
          <div className="grid grid-cols-2 font-semibold text-gray-600 border-b pb-3 mb-4">
            <span>Book Name</span>
            <span>Available Copies</span>
          </div>
        )}

        <div className="space-y-3">
          {
            console.log(books)
          }

          {books.length > 0 && books.map((book, index) => (
            <div
              key={index}
              className="grid grid-cols-2 items-center bg-white/70 backdrop-blur-md rounded-xl px-4 py-3 shadow-sm hover:scale-[1.02] hover:bg-white transition-all duration-300"
            >
              {
                console.log("book", book)
              }
              <span className="text-gray-800 font-medium">
                {book.title}
              </span>

              <span className="text-gray-600">
                {book.availableCopies}
              </span>
            </div>
          ))}

          {books.length === 0 && (
            <p className="text-center text-gray-500 mt-6">
              No books found
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

export default Books;