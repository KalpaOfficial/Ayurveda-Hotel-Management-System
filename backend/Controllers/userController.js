const User = require("../Model/userModel");

// ✅ Get all users
const getAllUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }

  if (!users || users.length === 0) {
    return res.status(404).json({ message: "Users not found" });
  }
  return res.status(200).json({ users });
};

// ✅ Add new user (Signup)
const addUser = async (req, res, next) => {
  try {
    console.log("Signup request received:", req.body);
    console.log("File received:", req.file);
    
    const {
      firstName,
      lastName,
      country,
      dob,
      gender,
      phone,
      email,
      password,
      confirmPassword,
      agreeTerms,
      role,
    } = req.body;

    // Check confirm password
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Handle profile picture
    let profilePicturePath = "";
    if (req.file) {
      profilePicturePath = `/uploads/${req.file.filename}`;
    }

    const user = new User({
      firstName,
      lastName,
      country,
      dob,
      gender,
      phone,
      email,
      password, // plain text for now
      agreeTerms,
      role: role || "user", // default to 'user' if not provided
      profilePicture: profilePicturePath,
    });

    await user.save();
    console.log("User saved successfully:", user);
    return res.status(201).json({ 
      message: "User registered successfully", 
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        country: user.country,
        dob: user.dob ? user.dob.toISOString().split('T')[0] : user.dob,
        gender: user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : user.gender,
        phone: user.phone,
        role: user.role,
        profilePicture: user.profilePicture,
        agreeTerms: user.agreeTerms
      }
    });
  } catch (err) {
    console.error("Error in addUser:", err);
    return res.status(500).json({ message: "Unable to add user", error: err.message });
  }
};

// ✅ User Login
const loginUser = async (req, res, next) => {
  try {
    console.log("Login request received:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.password !== password) {
    return res.status(401).json({ message: "Invalid password" });
  }

  return res.status(200).json({
    message: "Login successful",
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      country: user.country,
      dob: user.dob ? user.dob.toISOString().split('T')[0] : user.dob,
      gender: user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : user.gender,
      phone: user.phone,
      role: user.role,
      profilePicture: user.profilePicture,
      agreeTerms: user.agreeTerms
    },
  });
  } catch (err) {
    console.error("Error in loginUser:", err);
    return res.status(500).json({ message: "Login failed", error: err.message });
  }
};

// ✅ Get user by ID
const getById = async (req, res, next) => {
  const id = req.params.id;
  console.log("Getting user by ID:", id);
  let user;

  try {
    user = await User.findById(id);
    console.log("User found:", user ? "Yes" : "No");
  } catch (err) {
    console.error("Error finding user:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  return res.status(200).json({ 
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      country: user.country,
      dob: user.dob ? user.dob.toISOString().split('T')[0] : user.dob,
      gender: user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : user.gender,
      phone: user.phone,
      role: user.role,
      profilePicture: user.profilePicture,
      agreeTerms: user.agreeTerms
    }
  });
};

// ✅ Update user
const updateUser = async (req, res, next) => {
  const id = req.params.id;
  console.log("Update user request received for ID:", id);
  console.log("Request body:", req.body);
  console.log("Request file:", req.file);
  
  const {
    firstName,
    lastName,
    country,
    dob,
    gender,
    phone,
    email,
    currentPassword,
    newPassword,
    confirmPassword,
    agreeTerms,
    role,
    adminOverride,
  } = req.body;

  // Check if passwords match only if new password is provided
  if (newPassword && newPassword !== confirmPassword) {
    return res.status(400).json({ message: "New passwords do not match" });
  }

  let user;
  try {
    user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    // Validate current password if new password is provided
    if (newPassword) {
      console.log("Password change requested");
      console.log("Current password provided:", !!currentPassword);
      console.log("User's stored password:", user.password);
      console.log("Provided current password:", currentPassword);
      
      const isAdminOverride = adminOverride === true || adminOverride === 'true';
      if (!isAdminOverride) {
        if (!currentPassword) {
          console.log("No current password provided");
          return res.status(400).json({ message: "Current password is required to change password" });
        }
        if (user.password !== currentPassword) {
          console.log("Current password mismatch");
          return res.status(400).json({ message: "Current password is incorrect" });
        }
        console.log("Password validation passed");
      } else {
        console.log("Admin override: skipping current password validation");
      }
    }

    // Handle profile picture update
    if (req.file) {
      user.profilePicture = `/uploads/${req.file.filename}`;
    }

    // Update user fields - only update if values are provided
    if (firstName !== undefined && firstName !== '') user.firstName = firstName;
    if (lastName !== undefined && lastName !== '') user.lastName = lastName;
    if (country !== undefined && country !== '') user.country = country;
    if (dob !== undefined && dob !== '') user.dob = dob;
    if (gender !== undefined && gender !== '') user.gender = gender.toLowerCase(); // Convert to lowercase for model validation
    if (phone !== undefined && phone !== '') user.phone = phone;
    if (email !== undefined && email !== '') user.email = email;
    if (newPassword) user.password = newPassword; // only update password if new password is provided
    if (agreeTerms !== undefined) user.agreeTerms = agreeTerms;
    if (role) user.role = role;
    
    console.log("Updated user object:", {
      firstName: user.firstName,
      lastName: user.lastName,
      country: user.country,
      dob: user.dob,
      gender: user.gender,
      phone: user.phone,
      email: user.email,
      hasPassword: !!user.password,
      agreeTerms: user.agreeTerms,
      role: user.role
    }); // allow updating role if provided

    console.log("Attempting to save user...");
    let savedUser;
    try {
      savedUser = await user.save();
      console.log("User saved successfully:", savedUser._id);
    } catch (saveError) {
      console.error("Save error:", saveError);
      if (saveError.name === 'ValidationError') {
        console.error("Validation errors:", saveError.errors);
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: saveError.errors,
          details: Object.keys(saveError.errors).map(key => ({
            field: key,
            message: saveError.errors[key].message
          }))
        });
      }
      throw saveError; // Re-throw if it's not a validation error
    }
    
    return res.status(200).json({ 
      message: "User updated successfully", 
      user: {
        id: savedUser._id,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        email: savedUser.email,
        country: savedUser.country,
        dob: savedUser.dob ? savedUser.dob.toISOString().split('T')[0] : savedUser.dob,
        gender: savedUser.gender ? savedUser.gender.charAt(0).toUpperCase() + savedUser.gender.slice(1) : savedUser.gender,
        phone: savedUser.phone,
        role: savedUser.role,
        profilePicture: savedUser.profilePicture,
        agreeTerms: savedUser.agreeTerms
      }
    });
  } catch (err) {
    console.error("Update user error:", err);
    console.error("Error details:", {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    return res.status(500).json({ 
      message: "Update failed", 
      error: err.message,
      details: err.stack 
    });
  }
};

// ✅ Delete user
const deleteUser = async (req, res, next) => {
  const id = req.params.id;
  let user;

  try {
    user = await User.findByIdAndDelete(id);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }

  if (!user) {
    return res.status(404).json({ message: "Unable to delete user" });
  }
  return res.status(200).json({ message: "User deleted successfully", user });
};

// Export all functions
module.exports = {
  getAllUsers,
  addUser,
  loginUser,
  getById,
  updateUser,
  deleteUser,
};
