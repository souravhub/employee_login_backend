import { asyncHandler } from "../utils/asyncHandler.js";

import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrongs while generating refresh and access token"
        );
    }
};

const registerUser = asyncHandler(async (req, res) => {
    // get the user details from the request body
    //  validaton

    const { userName, name, userType, jobProfile, email, password } = req.body;

    const existedUser = await User.findOne({
        $or: [{ userName }, { email }],
    });

    if (existedUser) {
        throw new ApiError(409, "username or email already exists");
    }

    const user = await User.create({
        userName,
        name,
        userType,
        jobProfile,
        email,
        password,
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        new ApiError(500, "Something went wrong while registering the user");
    }

    return res
        .status(201)
        .json(
            new ApiResponse(200, createdUser, "User registered successfully")
        );
});

const loginUser = asyncHandler(async (req, res) => {
    // req body - data
    // validate if email or username and password are correct
    // find the user
    // if correct - return access and refresh token

    const { email, userName, password } = req.body;
    if (!userName && !email) {
        throw new ApiError(400, "Please enter either email or username");
    }

    const user = await User.findOne({
        $or: [{ email }, { userName }],
    });

    if (!user) {
        throw new ApiError(400, "user does not exist");
    }

    if (!password) {
        throw new ApiError(400, "password is required");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
        user._id
    );

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    // const options = {
    //     httpOnly: true,
    //     secure: true,
    // };

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken },
                "User logged in successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: "", // this removes the field from document
            },
        },
        {
            new: true,
        }
    );

    res.status(200).json(new ApiResponse(200, {}, "user logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is missing");
    }

    try {
        const decoded = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decoded._id);

        if (!user) {
            throw new ApiError(400, "invalid refresh token");
        }

        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(400, "refresh token is expired or used");
        }

        // generate new tokens
        const { accessToken, refreshToken } =
            await generateAccessAndRefreshTokens(user._id);

        res.status(200).json(
            new ApiResponse(
                200,
                { accessToken, refreshToken },
                "access token generated successfully"
            )
        );
    } catch (error) {
        throw new ApiError(400, error.message || "invalid refresh token");
    }
});

const updateUserInfo = asyncHandler(async (req, res) => {
    const {
        firstName,
        lastName,
        jobProfile,
        email,
        userName,
        userType,
        profileImg,
    } = req.body;

    const updateInfo = {
        name: {
            firstName: firstName || req.user.name.firstName,
            lastName: lastName || req.user.name.lastName,
        },
        jobProfile: jobProfile || req.user.jobProfile,
        email: email || req.user.email,
        userName: userName || req.user.userName,
        userType: userType || req.user.userType,
        profileImg: profileImg || req.user.profileImg,
    };

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: updateInfo,
        },
        {
            new: true,
            runValidators: true,
        }
    ).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(500, "Something went wrong while updating the user");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User info updated successfully"));
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    updateUserInfo,
};
