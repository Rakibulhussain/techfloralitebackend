const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            maxlength: 100,
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },

        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: 6,
            select: false, // hide password by default
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
            index: true,
        },
        approvalStatus: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },

        designation: {
            type: String,
            trim: true,
            default: "",
        },

        department: {
            type: String,
            trim: true,
            default: "",
        },

        imageUrl: {
            type: String,
            trim: true,
            default: "",
        },

        linkedin: {
            type: String,
            trim: true,
            default: "",
        },

        facebook: {
            type: String,
            trim: true,
            default: ""
        },

        isActive: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

module.exports = mongoose.model("User", userSchema);