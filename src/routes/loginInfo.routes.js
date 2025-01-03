import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createLoginDoc } from "../controllers/loginInfo.controller.js";

const router = Router();

router.route("/create").post(verifyJWT, createLoginDoc);

export default router;
