import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    createLoginDoc,
    getTodayLoginDoc,
    updateLogoutInfo,
    findUserAllLoginDocs,
    getAllUserLoginDocsByDate,
    getLoginDocsByUserAndDate,
} from "../controllers/loginInfo.controller.js";

const router = Router();

router.route("/create").post(verifyJWT, createLoginDoc);
router.route("/logout-update").post(verifyJWT, updateLogoutInfo);
router.route("/today-login").get(verifyJWT, getTodayLoginDoc);
router.route("/user-login-docs").get(verifyJWT, findUserAllLoginDocs);
router.route("/all-users-login-docs").get(verifyJWT, getAllUserLoginDocsByDate);
router.route("/login-docs/:userId").get(verifyJWT, getLoginDocsByUserAndDate);

export default router;
