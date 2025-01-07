import { Router } from "express";
import {
    loginUser,
    logoutUser,
    registerUser,
    refreshAccessToken,
    updateUserInfo,
    getAllUserList,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

// secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/update-info").put(verifyJWT, updateUserInfo);
router.route("/user-list").get(verifyJWT, getAllUserList);
router.route("/refresh-token").post(refreshAccessToken);

export default router;
