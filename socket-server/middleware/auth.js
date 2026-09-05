import jwt from "jsonwebtoken";

const verifyUserByToken=(token)=>{
    try{
        const decoded=jwt.verify(token,process.env.JSON_SECRET);
        return decoded;
    }catch{
        return null;
    }
}

export default verifyUserByToken;
