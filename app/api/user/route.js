import { connectDB } from "../../../lib/db"
import { cookies } from "next/headers";
import { getUserFromToken } from "../../../lib/auth"
import User from "../../../models/User"

export async function GET(req){
    try{
        await connectDB();
        const cookieCounter=await cookies()
        const token=cookieCounter.get("token")?.value;
        const UserId=getUserFromToken(token)

        if(!UserId){
            return Response.json({error:"Unauthorized"},{status:401})
        }

        const user=await User.findById(UserId).select('username avatar');
        if(!user){
            return Response.json({error:"No such user found"},{status:401})
        }
        return Response.json({user})

    }catch(err){
        return Response.json({error:"Server Error"},{status:500})
    }
}

export async function POST(req){
     try{
        await connectDB();
        const cookieCounter=await cookies()
        const token=cookieCounter.get("token")?.value;
        const UserId=getUserFromToken(token)

        if(!UserId){
            return Response.json({error:"Unauthorized"},{status:401})
        }
        const {url}=await req.json()
        const updated = await User.findByIdAndUpdate(
                    UserId,
                    { avatar: url },
                    { new: true }
                );
        if(updated){
            return Response.json({message:"Avatar added"});
        }


    }catch(err){
        console.log(err)
        return Response.json({error:"Server Error"},{status:500})
    }
}