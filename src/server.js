import express from 'express';
import dotenv from 'dotenv';
import { verifyToken } from './middlewares/auth.middleware.js';
import loginRouter from './routes/auth.route.js'
import adminRouter from './routes/admin.route.js';
import userRouter from './routes/user.route.js';
import eventRouter from './routes/event.route.js';
import roomRouter from './routes/room.route.js';
import clubRouter from './routes/club.route.js';
import postRouter from './routes/post.route.js';
import facilityRouter from './routes/facility.route.js';
import reservationRouter from './routes/reservation.route.js';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// These two lines replace the need for an external 'dirname.js'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

app.use(cors({
    origin: '*', 
    credentials: true, 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.static(path.join(__dirname, '../uploads')));
app.use(express.json());

app.get('/', (req, res) => {
    console.log(__dirname);
  res.status(200).send({ message : 'Server is working!' });
});
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
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

app.post('/upload',upload.single('photo'), (req,res)=>{
    console.log("im here");
    console.log(req.file);
    console.log(req.body);
res.status(200).json({message:'File uploaded successfully', filePath: req.file.path});
});



app.use('/api/auth', loginRouter);

app.use( verifyToken );

app.use('/api/users', userRouter);
app.use('/api/events', eventRouter);
app.use('/api/rooms', roomRouter);
app.use('/api/posts', postRouter);
app.use('/api/clubs', clubRouter);
app.use('/api/facilities', facilityRouter);
app.use('/api/reservations', reservationRouter);

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running: http://localhost:${PORT}`);
});