import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import imagekit from "../config/imagekit.js";

// Register User
export const registerUser = async (req, res) => {
  try {
    const bodyData = req.body || {};
    
    const {
      name,
      email,
      password,
      designation,
      department,
      linkedin,
      branch,
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
      branch: branch || "",
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
        branch: user.branch,
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
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

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

// Update Password 
export const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
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

// Update User Profile
// export const updateProfile = async (req, res) => {
//   try {
//     const userId = req.body.targetUserId || req.user?.id || req.user?._id; 

//     const {
//       name,
//       email,
//       role,
//       designation,
//       department,
//       imageUrl,
//       linkedin,
//       isActive,
//     } = req.body;

//     if (email) {
//       const emailExists = await User.findOne({ email, _id: { $ne: userId } });
//       if (emailExists) {
//         return res.status(400).json({
//           success: false,
//           message: "This email address is already registered with another account.",
//         });
//       }
//     }

//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       {
//         name,
//         email,
//         role,
//         designation,
//         department,
//         imageUrl,
//         linkedin,
//         isActive,
//       },
//       {
//         new: true,
//         runValidators: true,
//       }
//     ).select("-password");

//     if (!updatedUser) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Profile updated successfully",
//       user: updatedUser,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

export const updateProfile = async (req, res) => {
  try {
    const userId = req.body.targetUserId || req.user?.id || req.user?._id; 

    const {
      name,
      email,
      role,
      designation,
      department,
      branch,
      phone,
      imageUrl,
      linkedin,
      facebook,
      isActive,
    } = req.body;

    // Check unique email constraint
    if (email) {
      const emailExists = await User.findOne({ email, _id: { $ne: userId } });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "This email address is already registered with another account.",
        });
      }
    }

    // Dynamic field mapper (prevents overwriting empty values with undefined)
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (email !== undefined) updateFields.email = email;
    if (role !== undefined) updateFields.role = role;
    if (designation !== undefined) updateFields.designation = designation;
    if (department !== undefined) updateFields.department = department;
    if (branch !== undefined) updateFields.branch = branch;
    if (phone !== undefined) updateFields.phone = phone;
    if (imageUrl !== undefined) updateFields.imageUrl = imageUrl;
    if (linkedin !== undefined) updateFields.linkedin = linkedin;
    if (facebook !== undefined) updateFields.facebook = facebook;
    if (isActive !== undefined) updateFields.isActive = isActive;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateFields,
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


// Upload Profile Image to ImageKit
export const uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded",
      });
    }

    const result = await imagekit.upload({
      file: req.file.buffer,
      fileName: `profile-${Date.now()}.jpg`,
      folder: "/techfloraGlallery/employeeImage",
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

// Get My Profile
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id; 

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



// Get All Users (Paginated)
// export const getAllUsers = async (req, res) => {
//   try {
//     const pageParam = parseInt(req.query.page, 10);
//     const limitParam = parseInt(req.query.limit, 10);

//     const page = !isNaN(pageParam) && pageParam > 0 ? pageParam : 1;
//     const limit = !isNaN(limitParam) && limitParam > 0 ? Math.min(limitParam, 100) : 5;

//     const skip = (page - 1) * limit;

//     const query = { isActive: true };

//     const projection = "name email designation department imageUrl linkedin";

//     const [users, totalUsers] = await Promise.all([
//       User.find(query, projection)
//         .sort({ _id: 1 })
//         .skip(skip)
//         .limit(limit)
//         .lean(),
//       User.countDocuments(query),
//     ]);

//     const totalPages = Math.ceil(totalUsers / limit) || 1;

//     return res.status(200).json({
//       success: true,
//       count: users.length,
//       totalUsers,
//       totalPages,
//       currentPage: page,
//       users,
//     });
//   } catch (error) {
//     console.error("Error in getAllUsers controller:", error);
//     return res.status(500).json({
//       success: false,
//       message: "An internal server error occurred while retrieving users.",
//     });
//   }
// };


//try with barpeta term
// Get All Users (Paginated)

// Get All Active Users (Paginated & Branch-wise Filtered)
export const getAllUsers = async (req, res) => {
  try {
    const pageParam = parseInt(req.query.page, 10);
    const limitParam = parseInt(req.query.limit, 10);

    const page = !isNaN(pageParam) && pageParam > 0 ? pageParam : 1;
    const limit = !isNaN(limitParam) && limitParam > 0 ? Math.min(limitParam, 100) : 10;
    const skip = (page - 1) * limit;

    // 1. Base query: Strictly filter active users
    const query = { isActive: true };

    // 2. Direct Branch-Wise Dynamic Filtering
    if (req.query.branch) {
      const branchVal = req.query.branch.trim().toLowerCase();

      if (branchVal === "main") {
        query.$and = [
          { isActive: true },
          {
            $or: [
              { branch: { $regex: /main|guwahati|head/i } },
              { branch: { $exists: false } },
              { branch: null },
              { branch: "" },
            ],
          },
        ];
      } else {
        query.branch = { $regex: branchVal, $options: "i" };
      }
    }

    // 3. Optional Text Search Filtering
    if (req.query.search) {
      query.$text = { $search: req.query.search.trim() };
    }

    const projection = "name email designation department branch imageUrl linkedin facebook isActive";

    // 4. Fetch active users with old entries first (_id: 1)
    const [users, totalUsers] = await Promise.all([
      User.find(query, projection)
        .sort({ _id: 1 }) // Oldest entries load first
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalUsers / limit) || 1;

    return res.status(200).json({
      success: true,
      count: users.length,
      totalUsers,
      totalPages,
      currentPage: page,
      users,
    });
  } catch (error) {
    console.error("Error in getAllUsers controller:", error);
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred while retrieving users.",
    });
  }
};



// Bulk Create Users
export const createMultipleUsers = async (req, res) => {
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

// GET /api/auth/branches
export const getBranches = async (req, res) => {
  try {
    // Fetch unique non-empty branch names
    const rawBranches = await User.distinct("branch", { branch: { $ne: null, $ne: "" } });

    // Prioritize main/head office to load first, then sort remaining alphabetically
    const branches = rawBranches.sort((a, b) => {
      const aClean = a.trim().toLowerCase();
      const bClean = b.trim().toLowerCase();

      const isAHead = aClean.includes("guwahati") || aClean.includes("head") || aClean === "main";
      const isBHead = bClean.includes("guwahati") || bClean.includes("head") || bClean === "main";

      if (isAHead) return -1;
      if (isBHead) return 1;
      return a.localeCompare(b);
    });

    res.status(200).json({ success: true, branches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};