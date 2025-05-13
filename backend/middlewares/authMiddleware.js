import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
    console.log('Verifying token...');
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization header missing or malformed' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided -- no access granted' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'k4ng4n123');
        req.user = decoded;
        console.log('Token verified, user:', req.user);
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        return res.status(401).json({ message: 'Invalid token' });
    }
};
export default verifyToken;