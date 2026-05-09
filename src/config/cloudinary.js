import cloudinary from "cloudinary";
import dotenv from 'dotenv';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import {CloudinaryStorage} from "multer-storage-cloudinary";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// CLOUDINARY_CLOUD_NAME=dywqpypqt
// CLOUDINARY_API_KEY=684985321986348
// CLOUDINARY_API_SECRET=iXJk7oJc65tCkEYainvTlvpvpII

dotenv.config({ path: join(__dirname, '../../.env') });
cloudinary.v2.config({
    cloud_name:"dywqpypqt",
    api_key:"684985321986348",
    api_secret:"iXJk7oJc65tCkEYainvTlvpvpII"
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