import mongoose from "mongoose";

const DownloadsSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    downloadedAt: { type: Date, default: Date.now }
});

const Downloads = mongoose.model("Downloads", DownloadsSchema);

export default Downloads;
