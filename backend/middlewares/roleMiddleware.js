const authorizedRoles = (...allowedRoles) => {
    return (req, res, next) => {
        console.log(`Checking role for ${req.user?.role}`);
        if (!allowedRoles.includes(req.user?.role)) {
            return res.status(403).json({ message: `Role ${req.user?.role} is not allowed to access this resource` });
        }
        next();
    };
};
export default authorizedRoles;