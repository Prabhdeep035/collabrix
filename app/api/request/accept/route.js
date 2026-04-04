import {connectDB} from "../../../../lib/db"
import {getUserFromToken} from "../../../../lib/auth"
import { cookies } from "next/headers";
import Friend from "../../../../models/Friend";

export async function POST(req){
    try{
        await connectDB();
        const cookieCounter=await cookies();
        const token=cookieCounter.get("token")?.value;
        const UserId=getUserFromToken(token);

        if(!UserId){
            return Response.json({error:"Unauthorized"},{status:401});
        }
        const {id} =await req.json()
        const updated = await Friend.findByIdAndUpdate(
            id,
            { status: "accepted" },
            { new: true }
        );
        if(updated){
            return Response.json({message:"Request Accepted"});
        }

    }catch(err){
        return Response.json({error:"Server Error"},{status:500});
        
    }
}