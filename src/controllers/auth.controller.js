import authService from "../services/auth.service.js";



export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if(!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const result = await authService.login(email, password);
        res.status(200).json(result);
    } catch (err) {
        const statusCode = err.message === 'Invalid email or password' ? 401 : 500;
        res.status(statusCode).json({ success: false, message: err.message });
    }
};