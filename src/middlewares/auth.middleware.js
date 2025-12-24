import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {


    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access Denied: No Token Provided!' });
    }

    const token = authHeader.split(' ')[1];
    console.log("Verifying token:", token.substring(0, 10) + "...");

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        req.user = decoded;
        console.log("Token verified. User:", req.user);
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Access Denied: Invalid Token!' });
    }
};



const verifyRole = (requiredRoles) => {
    return (req, res, next) => {
        console.log("Verifying role. User role:", req.user?.role, "Required:", requiredRoles);
        const userRole = req.user.role;

        if (!req.user || !requiredRoles.includes(userRole)) {
            console.log("Role verification failed.");
            return res.status(403).json({ message: 'Forbidden: You do not have the required permissions!' });
        }

        console.log("Role verified.");
        next();
    };
}

export { verifyToken, verifyRole };