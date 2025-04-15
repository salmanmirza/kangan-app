const authorizedRoles = (...allowedRoles) => {
    console.log(allowedRoles)
    return (req, res, next) => {
        console.log(req.body)
        console.log(req.user.role)
        // if (!allowedRoles.includes(req.user.role)) {
        //     return res.status(403).json({ message: `Role ${req.user.role} is not allowed to access this resource/ page` });
        // }
        next();
    }


};
export default authorizedRoles;