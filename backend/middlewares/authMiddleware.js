import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
    let token;
    let authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
        token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'No token provided --no access granted' });
        }
        try {

            const decoded = jwt.verify(token, "k4ng4n123");
            req.user = decoded;
            next();
            // return res.status(200).json({ message: 'Success --token verified' });
        } catch (error) {
            return res.status(401).json({ message: 'Invalid token' });
        }
    }
};
 export default verifyToken;