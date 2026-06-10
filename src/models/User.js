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

        // role: {
        //     type: String,
        //     enum: ["user", "admin", "super_admin", "director", "partner", "general_manager", "regional_manager", "team_leader", "hr_manager", "hr_officer", "hr_executive", "business_development_manager", "business_development_officer", "business_development_executive", "client_relationship_officer", "corporate_trainer", "admin_executive", "front_office_assistant", "intern"],
        //     default: "user",
        // },

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
            default: true,
            index: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

module.exports = mongoose.model("User", userSchema);