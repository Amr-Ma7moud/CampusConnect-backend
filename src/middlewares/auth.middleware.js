

const verifyToken = (req, res, next) => {


    const authHeader = req.headers['authorization'];

    if(!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access Denied: No Token Provided!' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        req.user = decoded; 
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Access Denied: Invalid Token!' });
    }
};



const verifyRole = (requiredRoles) => {
    return (req, res, next) => {
        const userRole = req.user.role;

        if (!req.user || !requiredRoles.includes(userRole)) {
            return res.status(403).json({ message: 'Forbidden: You do not have the required permissions!' });
        }

        next();
    };
}

export { verifyToken, verifyRole };