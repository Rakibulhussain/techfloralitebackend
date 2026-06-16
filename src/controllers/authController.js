const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const imagekit = require("../config/imagekit");


// Register User
const registerUser = async (req, res) => {
  try {
    // 💡 Agar multer parse na kar paye toh safe fail empty object backup lagaya hai
    const bodyData = req.body || {};
    
    const {
      name,
      email,
      password,
      designation,
      department,
      linkedin,
      facebook,
    } = bodyData;

    // Strict frontend validation check
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: Name, Email, or Password is required.",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Image compulsory nahi hai, agar aayi toh safe variable assignment
    let imageUrl = "";
    if (req.file) {
      imageUrl = req.file.path || req.file.filename || ""; 
    }

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
      designation: designation || "",
      department: department || "",
      imageUrl,
      linkedin: linkedin || "",
      facebook: facebook || "",
      approvalStatus: "pending",
      isActive: false,
    });

    res.status(201).json({
      success: true,
      message: "Registration successful. Please wait for admin approval.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        approvalStatus: user.approvalStatus,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Admin Approval Check
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is pending admin approval.",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        designation: user.designation,
        department: user.department,
        imageUrl: user.imageUrl,
        linkedin: user.linkedin,
        facebook: user.facebook,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// update password 
const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    // authMiddleware se user ID nikalna (Zaroori: check karein aapka middleware id kis naam se bhejta hai)
    const userId = req.user?._id || req.user?.id; 

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Incorrect old password" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


//updated user info
const updateProfile = async (req, res) => {
  try {
    // Agar payload mein targetUserId hai toh admin edit kar raha hai, nahi toh logged-in user khud kar raha hai
    const userId = req.body.targetUserId || req.user.id; 

    const {
      name,         // Name handle karne ke liye add kiya
      email,        // Gmail update karne ke liye add kiya
      role,
      designation,
      department,
      imageUrl,
      linkedin,
      isActive,
    } = req.body;

    // Check karein agar email badla ja raha hai, toh naya email unique hona chahiye
    if (email) {
      const emailExists = await User.findOne({ email, _id: { $ne: userId } });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "This email address is already registered with another account.",
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        email,      // Database mein save hoga
        role,
        designation,
        department,
        imageUrl,
        linkedin,
        isActive,
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


//upload profile image to imagekit

const uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded",
      });
    }

    const result = await imagekit.upload({
      file: req.file.buffer,
      fileName: `profile-${Date.now()}.jpg`,
      folder: "/techfloraGlallery/employee",
    });

    const user = await User.findByIdAndUpdate(
      userId,
      {
        imageUrl: result.url,
      },
      {
        new: true,
      }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile image uploaded successfully",
      imageUrl: result.url,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//get my profile
const getMyProfile = async (req, res) => {
  try {
    // 🔥 FIX: 'id' ki jagah '_id' ka use karein
    const userId = req.user._id; 

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get all user info ---
//  public routes --- 
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find(
      { isActive: true },
      "name email designation department imageUrl linkedin"
    );

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const createMultipleUsers = async (req, res) => {
  try {
    const users = req.body;

    if (!Array.isArray(users)) {
      return res.status(400).json({
        success: false,
        message: "Request body must be an array of users",
      });
    }

    const usersToInsert = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(
          user.password || "123456",
          10
        ),
      }))
    );

    const createdUsers = await User.insertMany(usersToInsert);

    res.status(201).json({
      success: true,
      count: createdUsers.length,
      users: createdUsers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



module.exports = {
  registerUser,
  loginUser,
  updateProfile,
  uploadProfileImage,
  getMyProfile,
  getAllUsers,
  createMultipleUsers,
  updatePassword,
};