import express from 'express';
import dotenv from 'dotenv';
import { verifyToken } from './middlewares/auth.middleware.js';
import loginRouter from './routes/auth.route.js'
import adminRouter from './routes/admin.route.js';
import userRouter from './routes/user.route.js';
import eventRouter from './routes/event.route.js';

dotenv.config();
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).send({ message : 'Server is working!' });
});

app.use('/api/auth', loginRouter);

app.use( verifyToken );

app.use('/api/admin', adminRouter);
app.use('/api/users', userRouter);
app.use('/api/events', eventRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running: http://localhost:${PORT}`);
});