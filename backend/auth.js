import jwt from 'jsonwebtoken';

export default function Register(req,res,next) {
    const auth = req.headers.authorization;
    if (!auth) {
        return res.json("No token provided --access denied");
    } 

    const token = auth.split(' ')[1];  
    try{
        const user = jwt.verify(token, "k4ng4n123");
        req.user = user;
        console.log(user);
        next()  
    }catch(err){
        res.json("invalid token entered");
    }   
}    