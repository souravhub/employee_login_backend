import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";

import { LoginInfo } from "../models/loginInfo.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import moment from "moment";

const createLoginDoc = asyncHandler(async (req, res, next) => {
    const alreadyLoggedIn = await LoginInfo.findOne({
        createdBy: req.user._id,
        "loginInfo.isDone": true,
        createdAt: {
            $gte: moment().startOf("day").toDate(),
            $lte: moment().endOf("day").toDate(),
        },
    });

    if (alreadyLoggedIn) {
        throw new ApiError(409, "You have already logged in today");
    }

    const loginDoc = await LoginInfo.create({
        createdBy: req.user._id,
        loginInfo: {
            isDone: true,
            time: moment().toDate(),
        },
    });

    if (!loginDoc) {
        return next(
            new ApiError(500, "Something went wrong while creating login doc")
        );
    }

    return res
        .status(201)
        .json(new ApiResponse(201, loginDoc, "Login doc created successfully"));
});

const updateLogoutInfo = asyncHandler(async (req, res, next) => {
    const loginDoc = await LoginInfo.findOne({
        createdBy: req.user._id,
        createdAt: {
            $gte: moment().startOf("day").toDate(),
            $lte: moment().endOf("day").toDate(),
        },
        "loginInfo.isDone": true,
        "logoutInfo.isDone": false,
    });

    if (!loginDoc) {
        throw new ApiError(404, "No login doc found for logout");
    }

    const updatedInfo = await LoginInfo.findOneAndUpdate(
        {
            createdBy: req.user._id,
            createdAt: {
                $gte: moment().startOf("day").toDate(),
                $lte: moment().endOf("day").toDate(),
            },
            "loginInfo.isDone": true,
            "logoutInfo.isDone": false,
        },
        {
            $set: {
                "logoutInfo.time": moment().toDate(),
                "logoutInfo.isDone": true,
            },
        },
        { new: true } // Return the updated document
    );

    if (!updatedInfo) {
        throw new ApiError(
            500,
            "Something went wrong while updating logout info"
        );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedInfo,
                "Logout info updated successfully"
            )
        );
});

const getTodayLoginDoc = asyncHandler(async (req, res, next) => {
    const loginDoc = await LoginInfo.findOne({
        createdBy: req.user._id,
        "loginInfo.isDone": true,
        createdAt: {
            $gte: moment().startOf("day").toDate(),
            $lte: moment().endOf("day").toDate(),
        },
    });

    if (!loginDoc) {
        return res
            .status(200)
            .json(new ApiResponse(200, null, "No login doc found for today"));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, loginDoc, "Login doc found for today"));
});

const findUserAllLoginDocs = asyncHandler(async (req, res, next) => {
    const { startDate, endDate, page = 1, limit = 2 } = req.query;

    if (!startDate || !endDate) {
        throw new ApiError(400, "Please provide both start and end dates");
    }

    const loginDocs = await LoginInfo.aggregate([
        {
            $match: {
                createdBy: req.user._id,
                createdAt: {
                    $gte: moment(startDate, "YYYY-MM-DD")
                        .startOf("day")
                        .toDate(),
                    $lte: moment(endDate, "YYYY-MM-DD").endOf("day").toDate(),
                },
            },
        },
        // {
        //     $lookup: {
        //         from: "users", // Target collection (User)
        //         localField: "createdBy", // Field in LoginInfo
        //         foreignField: "_id", // Field in User
        //         as: "userInfo", // Resulting array with user info
        //     },
        // },
        // {
        //     $unwind: "$userInfo", // Convert userInfo array to object
        // },
        {
            $skip: (+page - 1) * limit,
        },
        {
            $limit: +limit,
        },
        {
            $sort: { createdAt: -1 }, // Sort by date (optional, descending order)
        },

        // need to improve
        // {
        //     $project: {
        //         "userInfo.password": 0, // Exclude password
        //         "userInfo.__v": 0, // Exclude version key
        //         "userInfo.refreshToken": 0, // (Optional) Exclude token if exists
        //         "userInfo.createdAt": 0,
        //         "userInfo.updatedAt": 0,
        //     },
        // },
    ]);

    const totalCount = await LoginInfo.countDocuments({
        createdBy: req.user._id,
        createdAt: {
            $gte: moment(startDate, "YYYY-MM-DD").startOf("day").toDate(),
            $lte: moment(endDate, "YYYY-MM-DD").endOf("day").toDate(),
        },
    });

    if (!loginDocs) {
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { list: [], totalCount: 0 },
                    "No login docs found for this user"
                )
            );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { list: loginDocs, totalCount },
                "Login docs found for this user"
            )
        );
});

const getAllUserLoginDocsByDate = asyncHandler(async (req, res, next) => {
    const { date, page = 1, limit = 50 } = req.query;

    if (req.user.userType !== "admin") {
        throw new ApiError(403, "Unauthorized access");
    }

    if (!date) {
        throw new ApiError(400, "Please provide both start and end dates");
    }

    const loginDocs = await LoginInfo.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: moment(date, "YYYY-MM-DD").startOf("day").toDate(),
                    $lte: moment(date, "YYYY-MM-DD").endOf("day").toDate(),
                },
            },
        },
        {
            $lookup: {
                from: "users", // Target collection (User)
                localField: "createdBy", // Field in LoginInfo
                foreignField: "_id", // Field in User
                as: "userInfo", // Resulting array with user info
            },
        },
        {
            $unwind: "$userInfo", // Convert userInfo array to object
        },
        {
            $match: {
                "userInfo.userType": { $ne: "admin" }, // Exclude admins
            },
        },
        {
            $skip: (+page - 1) * limit,
        },
        {
            $limit: +limit,
        },
        {
            $sort: { createdAt: -1 }, // Sort by date (optional, descending order)
        },
        {
            $project: {
                "userInfo.password": 0, // Exclude password
                "userInfo.__v": 0, // Exclude version key
                "userInfo.refreshToken": 0, // (Optional) Exclude token if exists
                "userInfo.createdAt": 0,
                "userInfo.updatedAt": 0,
            },
        },
    ]);

    const totalCount = await LoginInfo.countDocuments({
        createdAt: {
            $gte: moment(date, "YYYY-MM-DD").startOf("day").toDate(),
            $lte: moment(date, "YYYY-MM-DD").endOf("day").toDate(),
        },
    });

    if (!loginDocs) {
        throw new ApiError(500, "Something went wrong");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { list: loginDocs, totalCount },
                "Login docs found for this user"
            )
        );
});

const getLoginDocsByUserAndDate = asyncHandler(async (req, res) => {
    if (req.user.userType !== "admin") {
        throw new ApiError(403, "Unauthorized access");
    }

    const { userId } = req.params;
    const {
        startDate = moment().subtract(30, "days").format("YYYY-MM-DD"),
        endDate = moment().format("YYYY-MM-DD"),
        page = 1,
        limit = 30,
    } = req.query;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user Id");
    }

    const loginDocs = await LoginInfo.aggregate([
        {
            $match: {
                createdBy: new mongoose.Types.ObjectId(userId),
                createdAt: {
                    $gte: moment(startDate, "YYYY-MM-DD")
                        .startOf("day")
                        .toDate(),
                    $lte: moment(endDate, "YYYY-MM-DD").endOf("day").toDate(),
                },
            },
        },
        {
            $lookup: {
                from: "users", // Collection to join (user collection)
                localField: "createdBy", // Field in loginInfo
                foreignField: "_id", // Field in users collection
                as: "userInfo", // Resulting array field
            },
        },
        {
            $unwind: "$userInfo", // Unwind to flatten the userInfo array
        },
        {
            $skip: (+page - 1) * limit,
        },
        {
            $limit: +limit,
        },
        {
            $sort: { createdAt: -1 }, // Sort by date (optional, descending order)
        },
        {
            $project: {
                "userInfo.password": 0, // Exclude password
                "userInfo.__v": 0, // Exclude version key
                "userInfo.refreshToken": 0, // (Optional) Exclude token if exists
                "userInfo.createdAt": 0,
                "userInfo.updatedAt": 0,
            },
        },
    ]);

    const totalCount = await LoginInfo.countDocuments({
        createdAt: {
            $gte: moment(startDate, "YYYY-MM-DD").startOf("day").toDate(),
            $lte: moment(endDate, "YYYY-MM-DD").endOf("day").toDate(),
        },
        createdBy: new mongoose.Types.ObjectId(userId),
    });

    if (!loginDocs) {
        throw new ApiError(500, "Something went wrong");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { list: loginDocs, totalCount },
                "Login docs found for this user"
            )
        );
});

export {
    createLoginDoc,
    getTodayLoginDoc,
    updateLogoutInfo,
    findUserAllLoginDocs,
    getAllUserLoginDocsByDate,
    getLoginDocsByUserAndDate,
};
