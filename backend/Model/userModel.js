const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// User schema
const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },

  lastName: {
    type: String,
    required: true,
    trim: true,
  },

  country: {
    type: String,
    required: true,
    default: "Sri Lanka",
  },

  dob: {
    type: Date,
    required: true,
  },

  gender: {
    type: String,
    enum: ["male", "female"],
    required: true,
  },

  phone: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true, // each email must be unique
    lowercase: true,
    trim: true,
  },

  password: {
    type: String,
    required: true,
  },

  agreeTerms: {
    type: Boolean,
    required: true,
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user", // default is regular user
  },

  profilePicture: {
    type: String,
    default: "", // path to profile picture
  },
});

module.exports = mongoose.model("userModel", userSchema);
