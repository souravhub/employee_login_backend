import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    createLoginDoc,
    getTodayLoginDoc,
    updateLogoutInfo,
    findUserAllLoginDocs,
} from "../controllers/loginInfo.controller.js";

const router = Router();

router.route("/create").post(verifyJWT, createLoginDoc);
router.route("/logout-update").post(verifyJWT, updateLogoutInfo);
router.route("/today-login").get(verifyJWT, getTodayLoginDoc);
router.route("/user-login-docs").get(verifyJWT, findUserAllLoginDocs);

export default router;
