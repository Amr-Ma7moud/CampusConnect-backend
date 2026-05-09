import cloudinary from "cloudinary";
import dotenv from 'dotenv';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import {CloudinaryStorage} from "multer-storage-cloudinary";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });
cloudinary.v2.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
});
const storage = new CloudinaryStorage({
cloudinary: cloudinary.v2,
params:{
    folder:"CampusConnect",
    allowed_formats:["jpg","jpeg","png"],
    public_id:(req,file)=>`${file.fieldname}-${Date.now()}`
}
});
const fileFilter =(req,file,cb)=>{
    if(file.mimetype.startsWith("image/")){
        cb(null,true);
    }else{
        cb(new Error("Only image files are allowed!"),false);   
    }
};
const upload = multer({storage:storage,fileFilter:fileFilter});
export default upload;