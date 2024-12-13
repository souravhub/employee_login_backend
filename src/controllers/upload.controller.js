import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const uploadFile = asyncHandler(async (req, res) => {
    // multer provides access to req.files
    const fileLocalPath = req.file?.path;

    if (!fileLocalPath) {
        throw new ApiError(400, "No file found");
    }

    const uploadedFile = await uploadOnCloudinary(fileLocalPath);
    if (!uploadedFile) {
        throw new ApiError(400, "failed to upload file");
    }

    res.status(200).json({
        message: "file uploaded successfully",
    });
});

export { uploadFile };
