const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const imagekit = require("../config/imagekit");

// Register User
const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      designation,
      department,
  
    } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      designation,
      department,
    
    });

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

    res.status(201).json({
      success: true,
      message: "User created successfully",
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
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//updated user info

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware

    const {
      role,
      designation,
      department,
      imageUrl,
      linkedin,
      isActive,
    } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
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
    const userId = req.user.id;

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
      "name role designation department imageUrl linkedin"
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
};