import {connectDB} from "../../../lib/db"
import {getUserFromToken} from "../../../lib/auth"
import User from "../../../models/User"
import Friend from "../../../models/Friend"
import { cookies } from "next/headers"

export async function POST(req){
    try{
        await connectDB();
        const cookieCounter=await cookies();
        const token=cookieCounter.get("token")?.value
        const UserId=getUserFromToken(token);

        if(!UserId){
            return Response.json({error:"Unauthorized"},{status:401})
        }

        const {friend}=await req.json();
        let user=""
        if(friend.includes('@')){
            user=await User.findOne({email:friend})
        }else{
            user=await User.findOne({username:friend})
        }


        if (!user) {
            throw new Error("User not found");
        }
        if(UserId===user._id){
            return Response.json({error:"Invalid request"},{status:401})
        }

        const check=await Friend.find({requester:UserId,
            recipient:user._id,
        })

        if(check.length>0){
            return Response.json({error:"Invalid request"},{status:401})
        }

        const newReq=await Friend.create({
            requester:UserId,
            recipient:user._id
        })

        return Response.json({newReq})
    }catch(err){
        return Response.json({error:"Server Error"},{status:500})
    }
}

export async function GET(req){
    try{
        await connectDB();
        const cookieCounter=await cookies();
        const token=cookieCounter.get("token")?.value
        const UserId=getUserFromToken(token);

        if(!UserId){
            return Response.json({error:"Unauthorized"},{status:401})
        }

        const req=await Friend.find({recipient:UserId,
            status:"pending"
        }).populate('requester','username');
        return Response.json({req})

    }catch(err){
        return Response.json({error:"Server Error"},{status:500})
    }
}