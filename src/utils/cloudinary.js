import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
}); 

const uploadoncloudinary = async (localfilepath) => {
    try {
        if(!localfilepath) return null
        // upload file after checking file is present or not;
        const responce = await cloudinary.uploader.upload(localfilepath, {
            resource_type: "auto"
        }) 
        // if this done than file has been uploaded successfully
        // console.log("File uploaded successfully on cloudinary", responce.url);
        fs.unlinkSync(localfilepath); // if successfully file uploaded than unlink it 
        return responce
        
    } catch (error) {
        fs.unlinkSync(localfilepath) // remove locally saved temporary files as upload operation got failed
        return null; 
    }
}

export {uploadoncloudinary}