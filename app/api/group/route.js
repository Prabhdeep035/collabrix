import { connectDB } from "../../../lib/db";
import { getUserFromToken } from "../../../lib/auth";
import { cookies } from "next/headers";
import Chat from "../../../models/Chat";
import { Types } from "mongoose";

export async function POST(req) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const UserId = await getUserFromToken(token);

    if (!UserId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name , friends } = await req.json();

    const members = [...friends, UserId];

    const existingChat = await Chat.findOne({
      isGroup: true,
      members: { $all: members, $size: members.length }
    });

    let chat;

    if (existingChat) {
      chat = existingChat;
    } else {
      chat = await Chat.create({
        isGroup: true,
        name,
        admin: UserId,
        members: members
      });
    }
    return Response.json({ chat });

  } catch (err) {
    console.error(err);
    return Response.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function GET(){
  try{
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const UserId = await getUserFromToken(token);

    if (!UserId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const Groups=await Chat.find({isGroup:true,members:new Types.ObjectId(UserId)}).populate("members","name avatar")
    return Response.json({Groups})

  }catch(err){
    console.log(err);
    return Response.json({error:"Server Error"},{status:500})
  }
}