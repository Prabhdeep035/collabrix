// app/api/code/route.js

import { connectDB } from "../../../lib/db";
import { getUserFromToken } from "../../../lib/auth";
import { cookies } from "next/headers";
import Code from "../../../models/Code";
import Chat from "../../../models/Chat";
import { pusherServer } from "../../../lib/pusher";
import mongoose from "mongoose";

export async function GET(req) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const UserId = await getUserFromToken(token);

    if (!UserId) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get("chatId");
    const language = searchParams.get("language");

    if (
      !chatId ||
      !language ||
      !mongoose.Types.ObjectId.isValid(chatId)
    ) {
      return Response.json(
        { error: "Invalid data" },
        { status: 400 }
      );
    }

    const chat = await Chat.findOne({
      _id: chatId,
      members: UserId
    });

    if (!chat) {
      return Response.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const code = await Code.findOne({
      chatId,
      language
    });

    return Response.json({
      code: code || null
    });

  } catch (err) {
    console.error(err);

    return Response.json(
      { error: "Server Error" },
      { status: 500 }
    );
  }
}


export async function POST(req) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const UserId = await getUserFromToken(token);

    if (!UserId) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { chatId, language, code } = await req.json();

    if (
      !chatId ||
      !language ||
      typeof code !== "string" ||
      !mongoose.Types.ObjectId.isValid(chatId)
    ) {
      return Response.json(
        { error: "Invalid data" },
        { status: 400 }
      );
    }

    const chat = await Chat.findOne({
      _id: chatId,
      members: UserId
    });

    if (!chat) {
      return Response.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const codeObj = await Code.findOneAndUpdate(
      {
        chatId,
        language
      },
      {
        $set: {
          code
        }
      },
      {
        new: true,
        upsert: true
      }
    );

    await pusherServer.trigger(
      `private-chat-${chatId}`,
      "code-update",
      {
        language,
        code
      }
    );

    return Response.json({
      code: codeObj
    });

  } catch (err) {
    console.error(err);

    return Response.json(
      { error: "Server Error" },
      { status: 500 }
    );
  }
}