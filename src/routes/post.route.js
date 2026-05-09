import express from 'express';
import { fileURLToPath } from 'url';

// These two lines replace the need for an external 'dirname.js'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { verifyRole } from '../middlewares/auth.middleware.js';
import { 
     addCommentToPost,
     createPost, 
     editPost, 
     getNewsFeed, 
     getPostComments, 
     likePost, 
     unlikePost,
     deletePost
     } from '../controllers/post.controller.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname,"../../uploads/"));
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },  
});

const fileFilter=(req,file,cb)=>{
if(file.mimetype.startsWith("image/")){
     
     cb(null,true);
}else {
     cb(new Error("Only image files are allowed!"),false);}
};
const upload = multer({ storage: storage ,
                         fileFilter:fileFilter
});

router.post('/', verifyRole(['club_manager', 'admin']), upload.single('image'), createPost);
router.delete('/:post_id', verifyRole(['club_manager', 'admin']), deletePost);
router.put('/:post_id', verifyRole(['club_manager', 'admin']), editPost);
router.get('/', getNewsFeed);
router.post('/:id/like', likePost);
router.delete('/:id/like', unlikePost);
router.post('/:id/comments', addCommentToPost);
router.get('/:id/comments', getPostComments);

export default router;
