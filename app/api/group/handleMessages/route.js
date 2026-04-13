import { connectDB } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";
import { cookies } from "next/headers";
import Chat from "../../../../models/Chat";
import  Message from "../../../../models/Message"
import { pusherServer } from "@/lib/pusher";

export async function POST(req){
    try{
        await connectDB();
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        const UserId = await getUserFromToken(token);

        if (!UserId) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        const {message,chatId} =await req.json();

        const messageObj=await Message.create({
            chatId:chatId,
            sender:UserId,
            content:message
        })
        const fullMessage = await Message.findById(messageObj._id)
            .populate("sender", "username avatar");

        await pusherServer.trigger(`chatId-${chatId}`, "new-message", fullMessage);

        if(messageObj){
            return Response.json({messageObj}) 
        }

    }catch (err) {
        console.error(err);
        return Response.json({ error: "Server Error" }, { status: 500 });
    }
}

export async function GET(req){
    try{
        await connectDB();
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const UserId = await getUserFromToken(token);

        if (!UserId) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }


        const { searchParams } = new URL(req.url);
        const chatId = searchParams.get("chatId"); 

        const messages=await Message.find({chatId:chatId}).sort({ createdAt: 1 }).populate("sender","username avatar")
        return Response.json({messages})
    }catch (err) {
        console.error(err);
        return Response.json({ error: "Server Error" }, { status: 500 });
    }
}