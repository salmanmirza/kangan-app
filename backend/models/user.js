const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: String,
    // lName: String,
    email : String,
    password : String,
}); 

const userModel = mongoose.model("user",UserSchema)
module.exports = userModel;