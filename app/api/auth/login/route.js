import { connectDB } from "../../../../lib/db";
import { cookies } from "next/headers";
import User from "../../../../models/User";
import { signToken } from "../../../../lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req){
    try{
        await connectDB();
        const cookieStore=await cookies();
        const {email,password}=await req.json()
        if(!email||!password){
            return Response.json({error:"Invalid Details"},{status:400})           
        }

        const user=await User.findOne({email})
        if(!user){
            return Response.json({error:"Invalid credentials"},{status:401})
        }
        const isMatch=await bcrypt.compare(password,user.password)
        if(!isMatch){
            return Response.json({error:"Invalid Credentials"},{status:400})
        }

        const token=signToken(user)

        cookieStore.set("token",token,{
            httpOnly:true,
            secure:false,
            sameSite:"lax",
            path:"/",
            maxAge:60*60*24*7,
        });

        return Response.json({message:"Login Successful"})
    }catch(err){
        console.log(err)
        return Response.json({error:"Server Error"},{status:"500"})
    }
}