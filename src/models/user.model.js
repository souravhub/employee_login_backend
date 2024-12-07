import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
    {
        userName: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        name: {
            firstName: {
                type: String,
                required: [true, " First Name is required"],
            },
            lastName: {
                type: String,
                required: [true, "Last Name is required"],
            },
        },
        userType: {
            type: String,
            enum: ["user", "admin"], // Allowed values
            default: "user", // Default value
            required: true,
        },
        jobProfile: {
            type: String,
            enum: [
                "Frontend Developer",
                "Backend Developer",
                "Architect",
                "UX Designer",
                "Project Manager",
            ],
            validate: {
                validator: function (value) {
                    return (
                        this.userType !== "user" ||
                        (value && value.trim().length > 0)
                    );
                },
                message:
                    'Job profile is required for users with userType "user".',
            },
        },
        email: {
            type: String,
            required: [true, "email is required"],
            unique: true,
            trim: true,
        },
        profileImg: {
            type: String,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        refreshToken: {
            type: String,
        },
        address: {
            city: String,
            state: String,
            country: String,
            zip: String,
        },
    },
    { timestamps: true }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.userName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_SECRET,
        }
    );
};

export const User = mongoose.model("User", userSchema);
