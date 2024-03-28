import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    username: String,
    hash: String,
    salt: String
});
export default mongoose.model("User", userSchema);
