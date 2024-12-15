import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

    res.status(200).json(
        new ApiResponse(
            200,
            {
                url: uploadedFile.url,
                cldPublicId: uploadedFile.public_id,
                filename: uploadedFile.original_filename,
            },
            "File uploaded successfully"
        )
    );
});

const deleteFile = asyncHandler(async (req, res) => {
    const { cldPublicId, fileType } = req.body;

    if (!cldPublicId) {
        throw new ApiError(400, "cldPublicId is required");
    }
    if (!fileType) {
        throw new ApiError(400, "fileType is required");
    }

    const deletedFile = await deleteFromCloudinary(cldPublicId, fileType);

    if (!deletedFile) {
        throw new ApiError(400, "failed to delete file");
    }

    res.status(200).json({
        message: "file deleted successfully",
    });
});

export { uploadFile, deleteFile };
