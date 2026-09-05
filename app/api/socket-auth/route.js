import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { getUserFromToken } from "../../../lib/auth";

export async function GET(){
    try{
        const cookieStore=await cookies();
        const token=cookieStore.get("token")?.value;
        if(!token){
            return NextResponse.json({success:false},{status:401})
        }
        const userId=getUserFromToken(token);
        if(!userId){
            return NextResponse.json({error:"Unauthorized"},{status:402});
        }

        const socketToken=jwt.sign(
            {userId},
            process.env.JWT_SECRET,
            {
                expiresIn:"5min"
            }
        )
        return NextResponse.json({success:true, socketToken});
    }catch(err){
        return NextResponse.json({error:err},{status:505})
    }
}