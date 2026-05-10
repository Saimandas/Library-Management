import mongoose from "mongoose";

const TransactionsSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    bookId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
        required: true
    },
    transactionType:{
        type: String,
        enum: ["borrow", "return"],
        required: true
    },
    issuedDate:{
        type: Date,
        default: Date.now
    },
    returnDate:{
        type: Date
    }
});

const Transactions = mongoose.model("Transactions", TransactionsSchema);

export default Transactions;
