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

    const { friendId } = await req.json();

    if (!friendId) {
      return Response.json({ error: "friendId is required" }, { status: 400 });
    }

    const userObjectId = new Types.ObjectId(UserId);
    const friendObjectId = new Types.ObjectId(friendId);
    const sortedMembers = [userObjectId, friendObjectId].sort((a, b) =>
      a.toString().localeCompare(b.toString())
    );

    const chat = await Chat.findOneAndUpdate(
      {
        isGroup: false,
        members: sortedMembers
      },
      {
        $setOnInsert: {
          members: sortedMembers,
          isGroup: false
        }
      },
      {
        new: true,
        upsert: true
      }
    );

    return Response.json({ chat });

  } catch (err) {
    console.error(err);
    return Response.json({ error: "Server Error" }, { status: 500 });
  }
}