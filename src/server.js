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
import cors from 'cors';



dotenv.config();
const app = express();

app.use(cors({
    origin: '*', 
    credentials: true, 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).send({ message : 'Server is working!' });
});

app.use('/api/auth', loginRouter);

app.use( verifyToken );

app.use('/api/admin', adminRouter);
app.use('/api/users', userRouter);
app.use('/api/events', eventRouter);
app.use('/api/rooms', roomRouter);
app.use('/api/posts', postRouter);
app.use('/api/clubs', clubRouter);
app.use('/api/facilities', facilityRouter);

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