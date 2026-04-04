import jwt from "jsonwebtoken";

export const signToken=(user)=>{
    return jwt.sign(
        {userId:user.id},
        process.env.JWT_SECRET,
        {expiresIn:"7d"}
    );
};

export const getUserFromToken=(token)=>{
    try{
        if(!token)return null;

        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        return decoded.userId;
    }catch(err){
        return null
    }
};