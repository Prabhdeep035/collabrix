import Chat from "../../../../models/Chat"
import { connectDB } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";
import { cookies } from "next/headers";

export async function GET(req) {
    try {
        await connectDB();

        const cookieStore =await cookies(); 
        const token = cookieStore.get("token")?.value;
        const UserId = getUserFromToken(token);

        
        if (!UserId) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        const Group = await Chat.findById(id).select("name avatar");

        if (!Group) {
            return Response.json({ error: "No such user found" }, { status: 404 });
        }

        return Response.json({ Group });

    } catch (err) {
        console.log(err)    
        return Response.json({ error: "Server Error" }, { status: 500 });
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
        const {url,id}=await req.json()
        const updated = await Chat.findByIdAndUpdate(
                    id,
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