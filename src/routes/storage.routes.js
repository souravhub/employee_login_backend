import { Router } from "express";
import { uploadFile, deleteFile } from "../controllers/storage.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/upload").post(verifyJWT, upload.single("file"), uploadFile);
router.route("/delete").delete(verifyJWT, deleteFile);

export default router;
