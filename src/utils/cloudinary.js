import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        // file has been uploaded successfully
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
        console.error("Error uploading file to cloudinary", error);
        return null;
    }
};

const deleteFromCloudinary = async (publicId, fileType) => {
    try {
        const deleted = await cloudinary.api.delete_resources([publicId], {
            resource_type: fileType,
            type: "upload",
        });

        return deleted;
    } catch (error) {
        console.error("Failed to delete file cloudinary", error);
        return null;
    }
};

export { uploadOnCloudinary, deleteFromCloudinary };
