import mongoose from "mongoose";

const booksSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    category: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
    },
    totalCopies: {
        type: Number,
        required: true
    },
    availableCopies: {
        type: Number,
    },
    edition: {
        type: String,
        required: true
    },
    isbn: {
        type: String,
    },
    publishedYear: {
        type: Number,
        required: true
    },
    publisher: {
        type: String,
        required: true
    },
    coverImage: {
        type: String
    },
    description: {
        type: String
    }
}, { timestamps: true });

const Books = mongoose.model("Book", booksSchema);

export default Books;