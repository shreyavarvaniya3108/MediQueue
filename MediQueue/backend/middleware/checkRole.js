// // Usage: checkRole("doctor") or checkRole("patient")
// function checkRole(requiredRole) {
//     return (req, res, next) => {
//         if (!req.user || req.user.role !== requiredRole) {
//             return res.status(403).json({
//                 message: `Access denied. This action is only for ${requiredRole}s.`,
//             });
//         }
//         next();
//     };
// }

// module.exports = checkRole;


function checkRole(requiredRole) {
    return (req, res, next) => {
        const userRole = req.user?.role?.toLowerCase();
        const neededRole = requiredRole.toLowerCase();
        
        console.log(`[Role Check] Token Role: ${userRole}, Required: ${neededRole}`);
        
        if (!req.user || userRole !== neededRole) {
            return res.status(403).json({
                message: `Access denied. This action is only for ${requiredRole}s.`,
            });
        }
        next();
    };
}

module.exports = checkRole;